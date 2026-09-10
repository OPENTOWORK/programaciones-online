import {
  combineMainPartsForSave,
  extractExercisesFromSessionDraft,
  hasSessionBlockContent,
} from '@/lib/sessionBlockSections';
import { collectExerciseNamesFromSessionDraft } from '@/lib/exerciseTextParser';
import {
  createWorkoutCatalog,
  deleteWorkoutCatalog,
  updateWorkoutCatalog,
} from '@/lib/programEditService';
import { parseSchedulePreviewItemKey, type SchedulePreviewItem } from '@/lib/programSchedulePreview';
import {
  formatScheduleSummary,
  moveScheduleToDate,
  parseScheduleFromWorkout,
  scheduleForCalendarDate,
  type SessionSchedule,
} from '@/lib/sessionSchedule';
import { syncExerciseVideosForNames } from '@/lib/exerciseVideoSyncService';
import {
  createEmptySessionDraft,
  createRestDayDraft,
  defaultDayOrder,
  isActivationSessionDraft,
  isMetconSessionDraft,
  isPdfSessionDraft,
  isRestDaySessionDraft,
  METCON_SESSION_NAME,
  PDF_SESSION_DURATION,
  pdfSessionTitle,
  renameSessionCopy,
  workoutToSessionDraft,
  type SessionDraft,
} from '@/lib/trainerSessionDraft';
import type { Program, Workout } from '@/lib/types';
import type { PickedPlanPdf } from '@/lib/planPdfPicker';
import { uploadCatalogWorkoutPdf } from '@/lib/catalogWorkoutPdfService';

export function workoutIdFromCalendarItem(item: SchedulePreviewItem) {
  const { sourceId } = parseSchedulePreviewItemKey(item.id);
  return sourceId === 'draft-new' ? undefined : sourceId;
}

export function applyDateToSessionDraft(draft: SessionDraft, date: Date): SessionDraft {
  const schedule = {
    ...scheduleForCalendarDate(date),
    ...(draft.kind && draft.kind !== 'session' ? { kind: draft.kind } : {}),
    ...(typeof draft.dayOrder === 'number' ? { dayOrder: draft.dayOrder } : {}),
  };
  return {
    ...draft,
    schedule,
    dayLabel: formatScheduleSummary(schedule),
    dayOrder: draft.dayOrder ?? defaultDayOrder(draft),
  };
}

/** Ancla una sesión a un día concreto del calendario (solo ese día, sin repetirse). */
export function pinCatalogSessionToDate(
  draft: SessionDraft,
  date: Date,
  dayOrder?: number,
): SessionDraft {
  const pinned = applyDateToSessionDraft(draft, date);
  if (typeof dayOrder === 'number') {
    pinned.dayOrder = dayOrder;
    pinned.schedule = { ...pinned.schedule, dayOrder };
  }
  return pinned;
}

/**
 * Al guardar desde el calendario, las sesiones recurrentes se bifurcan en copias puntuales
 * para no arrastrar cambios a otras semanas clonadas.
 */
export function resolveCatalogSessionSaveTarget(
  draft: SessionDraft,
  workouts: Workout[],
  options: { item?: SchedulePreviewItem; date: Date },
): { draft: SessionDraft; targetWorkoutId?: string } {
  const occurrenceDate = options.item?.date ?? options.date;
  const pinned = pinCatalogSessionToDate(draft, occurrenceDate, draft.dayOrder ?? defaultDayOrder(draft));

  if (!options.item) {
    return { draft: pinned };
  }

  const targetWorkoutId = workoutIdFromCalendarItem(options.item);
  if (!targetWorkoutId) {
    return { draft: pinned };
  }

  const index = workouts.findIndex((workout) => workout.id === targetWorkoutId);
  if (index < 0) {
    return { draft: pinned, targetWorkoutId };
  }

  const schedule = parseScheduleFromWorkout(workouts[index], index);
  if (schedule.recurrence !== 'once') {
    return { draft: pinned };
  }

  return { draft: pinned, targetWorkoutId };
}

function sessionDraftToCatalogPayload(draft: SessionDraft) {
  const schedule: SessionSchedule = {
    ...draft.schedule,
    ...(typeof draft.dayOrder === 'number' ? { dayOrder: draft.dayOrder } : {}),
    ...(draft.kind && draft.kind !== 'session' ? { kind: draft.kind } : {}),
  };

  return {
    name: draft.name.trim(),
    dayLabel: formatScheduleSummary(schedule),
    estimatedDuration: draft.estimatedDuration,
    warmup: draft.warmup,
    main: combineMainPartsForSave(draft.main, draft.metcon),
    core: draft.core || undefined,
    cooldown: draft.cooldown,
    exercises: extractExercisesFromSessionDraft(draft).filter((exercise) => exercise.name.trim()),
    schedule,
  };
}

export async function persistCatalogSessionDraft(
  program: Program,
  workouts: Workout[],
  draftToSave: SessionDraft,
  targetWorkoutId?: string,
): Promise<string | null> {
  const normalizedDraft = isMetconSessionDraft(draftToSave)
    ? { ...draftToSave, name: METCON_SESSION_NAME, kind: 'metcon' as const }
    : isActivationSessionDraft(draftToSave)
      ? { ...draftToSave, name: draftToSave.name.trim() || 'Activación', kind: 'activation' as const }
      : draftToSave;
  const trimmedName = normalizedDraft.name.trim();
  if (!trimmedName) return 'El nombre de la sesión es obligatorio.';

  if (
    !isRestDaySessionDraft(normalizedDraft) &&
    !isPdfSessionDraft(normalizedDraft) &&
    !isActivationSessionDraft(normalizedDraft) &&
    extractExercisesFromSessionDraft(normalizedDraft).every((exercise) => !exercise.name.trim()) &&
    !hasSessionBlockContent(normalizedDraft)
  ) {
    return 'Añade al menos un bloque de entrenamiento.';
  }

  if (normalizedDraft.schedule.weekdays.length === 0) {
    return 'Selecciona al menos un día para la sesión.';
  }

  const payload = sessionDraftToCatalogPayload(normalizedDraft);
  const result = targetWorkoutId
    ? await updateWorkoutCatalog(targetWorkoutId, payload)
    : await createWorkoutCatalog({
        programId: program.id,
        sortIndex: workouts.length,
        ...payload,
      });

  if (result.error) return result.error;

  // El guardado de la sesión no debe fallar si el catálogo de vídeos falla.
  void syncExerciseVideosForNames(collectExerciseNamesFromSessionDraft(normalizedDraft));

  return null;
}

export function loadCatalogSessionDraft(workouts: Workout[], item: SchedulePreviewItem) {
  const workoutId = workoutIdFromCalendarItem(item);
  if (!workoutId) return null;

  const index = workouts.findIndex((workout) => workout.id === workoutId);
  if (index < 0) return null;

  return workoutToSessionDraft(workouts[index], index);
}

export async function copyCatalogSession(
  program: Program,
  workouts: Workout[],
  item: SchedulePreviewItem,
  targetDate: Date = item.date,
) {
  const source = loadCatalogSessionDraft(workouts, item);
  if (!source) return 'No se pudo copiar la sesión.';

  const sourceWorkoutId = workoutIdFromCalendarItem(item);
  const dayOrder = item.dayOrder ?? defaultDayOrder(source);
  const copied = pinCatalogSessionToDate(
    renameSessionCopy(source, workouts.length + 1),
    targetDate,
    dayOrder,
  );

  const error = await persistCatalogSessionDraft(program, workouts, copied);
  if (error) return error;

  if (sourceWorkoutId) {
    const pinnedSource = pinCatalogSessionToDate(
      source,
      item.date,
      source.dayOrder ?? defaultDayOrder(source),
    );
    const pinError = await persistCatalogSessionDraft(
      program,
      workouts,
      pinnedSource,
      sourceWorkoutId,
    );
    if (pinError) return pinError;
  }

  return null;
}

export async function copyCatalogDaySessions(
  program: Program,
  workouts: Workout[],
  targetDate: Date,
  items: SchedulePreviewItem[],
) {
  const sorted = [...items].sort((left, right) => (left.dayOrder ?? 1) - (right.dayOrder ?? 1));

  for (const item of sorted) {
    const source = loadCatalogSessionDraft(workouts, item);
    if (!source) return 'No se pudo copiar una de las sesiones.';

    const sourceWorkoutId = workoutIdFromCalendarItem(item);
    const dayOrder = item.dayOrder ?? defaultDayOrder(source);

    const copied = pinCatalogSessionToDate(
      renameSessionCopy(source, workouts.length + 1),
      targetDate,
      dayOrder,
    );

    const error = await persistCatalogSessionDraft(program, workouts, copied);
    if (error) return error;

    if (sourceWorkoutId) {
      const pinnedSource = pinCatalogSessionToDate(source, item.date, dayOrder);
      const pinError = await persistCatalogSessionDraft(
        program,
        workouts,
        pinnedSource,
        sourceWorkoutId,
      );
      if (pinError) return pinError;
    }
  }

  return null;
}

export async function moveCatalogSessionToDate(
  program: Program,
  workouts: Workout[],
  item: SchedulePreviewItem,
  targetDate: Date,
  orderedIds?: readonly string[],
) {
  const workoutId = workoutIdFromCalendarItem(item);
  if (!workoutId) return 'No se pudo mover la sesión.';

  const index = workouts.findIndex((workout) => workout.id === workoutId);
  if (index < 0) return 'No se pudo mover la sesión.';

  const draft = workoutToSessionDraft(workouts[index], index);
  const schedule = moveScheduleToDate(draft.schedule, targetDate);
  const dayOrder = orderedIds?.includes(workoutId) ? orderedIds.indexOf(workoutId) : draft.dayOrder;

  const moved: SessionDraft = {
    ...draft,
    schedule,
    dayLabel: formatScheduleSummary(schedule),
    dayOrder,
  };

  const error = await persistCatalogSessionDraft(program, workouts, moved, workoutId);
  if (error) return error;

  if (!orderedIds || orderedIds.length < 2) return null;

  return reorderCatalogWorkoutsDay(program, workouts, orderedIds);
}

export async function reorderCatalogWorkoutsDay(
  program: Program,
  workouts: Workout[],
  orderedIds: readonly string[],
) {
  for (const [index, workoutId] of orderedIds.entries()) {
    const workoutIndex = workouts.findIndex((workout) => workout.id === workoutId);
    if (workoutIndex < 0) continue;

    const draft = workoutToSessionDraft(workouts[workoutIndex], workoutIndex);
    if (draft.dayOrder === index) continue;

    const error = await persistCatalogSessionDraft(
      program,
      workouts,
      { ...draft, dayOrder: index },
      workoutId,
    );
    if (error) return error;
  }

  return null;
}

export async function deleteCatalogSession(workoutId: string) {
  const result = await deleteWorkoutCatalog(workoutId);
  return result.error ?? null;
}

export function buildCatalogSessionDraftForDate(workouts: Workout[], date: Date) {
  return applyDateToSessionDraft(createEmptySessionDraft(workouts.length), date);
}

export function buildCatalogRestDayDraftForDate(workouts: Workout[], date: Date) {
  return applyDateToSessionDraft(createRestDayDraft(workouts.length), date);
}

function nextDayOrder(dayItems: SchedulePreviewItem[]) {
  if (dayItems.length === 0) return 0;
  return Math.max(...dayItems.map((item) => item.dayOrder ?? defaultDayOrder(item))) + 1;
}

export async function attachCatalogPdfToDate(
  program: Program,
  workouts: Workout[],
  date: Date,
  pdf: PickedPlanPdf,
  dayItems: SchedulePreviewItem[] = [],
) {
  const uploaded = await uploadCatalogWorkoutPdf(program.id, pdf);
  if ('error' in uploaded) return uploaded.error;

  const schedule = {
    ...scheduleForCalendarDate(date),
    kind: 'pdf' as const,
    pdfStoragePath: uploaded.storagePath,
    pdfFileName: uploaded.fileName,
  };

  const draft = pinCatalogSessionToDate(
    {
      ...createEmptySessionDraft(workouts.length),
      name: pdfSessionTitle(uploaded.fileName),
      kind: 'pdf',
      estimatedDuration: PDF_SESSION_DURATION,
      main: '',
      schedule,
    },
    date,
    nextDayOrder(dayItems),
  );

  return persistCatalogSessionDraft(program, workouts, draft);
}
