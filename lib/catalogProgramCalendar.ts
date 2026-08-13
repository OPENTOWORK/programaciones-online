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
  scheduleForCalendarDate,
  type SessionSchedule,
} from '@/lib/sessionSchedule';
import { syncExerciseVideosForNames } from '@/lib/exerciseVideoSyncService';
import {
  createEmptySessionDraft,
  createRestDayDraft,
  defaultDayOrder,
  isActivationSessionDraft,
  isRestDaySessionDraft,
  renameSessionCopy,
  workoutToSessionDraft,
  type SessionDraft,
} from '@/lib/trainerSessionDraft';
import type { Program, Workout } from '@/lib/types';

export function workoutIdFromCalendarItem(item: SchedulePreviewItem) {
  const { sourceId } = parseSchedulePreviewItemKey(item.id);
  return sourceId === 'draft-new' ? undefined : sourceId;
}

export function applyDateToSessionDraft(draft: SessionDraft, date: Date): SessionDraft {
  const schedule = scheduleForCalendarDate(date);
  return {
    ...draft,
    schedule,
    dayLabel: formatScheduleSummary(schedule),
    dayOrder: draft.dayOrder ?? defaultDayOrder(draft),
  };
}

function sessionDraftToCatalogPayload(draft: SessionDraft) {
  const schedule: SessionSchedule = {
    ...draft.schedule,
    ...(typeof draft.dayOrder === 'number' ? { dayOrder: draft.dayOrder } : {}),
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
  const trimmedName = draftToSave.name.trim();
  if (!trimmedName) return 'El nombre de la sesión es obligatorio.';

  if (
    !isRestDaySessionDraft(draftToSave) &&
    !isActivationSessionDraft(draftToSave) &&
    extractExercisesFromSessionDraft(draftToSave).every((exercise) => !exercise.name.trim()) &&
    !hasSessionBlockContent(draftToSave)
  ) {
    return 'Añade al menos un bloque de entrenamiento.';
  }

  if (draftToSave.schedule.weekdays.length === 0) {
    return 'Selecciona al menos un día para la sesión.';
  }

  const payload = sessionDraftToCatalogPayload(draftToSave);
  const result = targetWorkoutId
    ? await updateWorkoutCatalog(targetWorkoutId, payload)
    : await createWorkoutCatalog({
        programId: program.id,
        sortIndex: workouts.length,
        ...payload,
      });

  if (result.error) return result.error;

  const videoSync = await syncExerciseVideosForNames(collectExerciseNamesFromSessionDraft(draftToSave));
  if (videoSync.error) return videoSync.error;

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
) {
  const source = loadCatalogSessionDraft(workouts, item);
  if (!source) return 'No se pudo copiar la sesión.';

  const copied = applyDateToSessionDraft(
    renameSessionCopy(source, workouts.length + 1),
    item.date,
  );

  return persistCatalogSessionDraft(program, workouts, copied);
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

    const copied = applyDateToSessionDraft(
      renameSessionCopy(source, workouts.length + 1),
      targetDate,
    );
    copied.dayOrder = item.dayOrder ?? defaultDayOrder(source);

    const error = await persistCatalogSessionDraft(program, workouts, copied);
    if (error) return error;
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
