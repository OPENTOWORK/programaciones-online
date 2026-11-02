import { normalizeExerciseName } from '@/lib/exerciseName';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type TrainerExerciseExecution = 'correct' | 'partial' | 'incorrect';

export interface TrainerExerciseNote {
  id: string;
  trainerId: string;
  athleteId: string;
  sessionLogId?: string;
  sessionVideoId?: string;
  athletePlanId?: string;
  exerciseKey: string;
  exerciseName: string;
  /** Fecha del entreno, no la de la nota: es el eje del seguimiento. */
  performedOn: string;
  setNumber?: number;
  reps?: string;
  seconds?: string;
  level?: string;
  execution?: TrainerExerciseExecution;
  technique?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Lo que el entrenador rellena en el formulario de la nota. */
export interface TrainerExerciseNoteDraft {
  setNumber?: number;
  reps?: string;
  seconds?: string;
  level?: string;
  execution?: TrainerExerciseExecution;
  technique?: string;
  notes?: string;
}

export const TRAINER_EXERCISE_EXECUTION_LABELS: Record<TrainerExerciseExecution, string> = {
  correct: 'Correcta',
  partial: 'A medias',
  incorrect: 'Incorrecta',
};

const TABLE = 'trainer_exercise_notes';
const SELECT =
  'id, trainer_id, athlete_id, session_log_id, session_video_id, athlete_plan_id, exercise_key, exercise_name, performed_on, set_number, reps, seconds, level, execution, technique, notes, created_at, updated_at';

const MIGRATION_HINT =
  'Falta crear la tabla de apuntes en Supabase. Opción A: Supabase → SQL Editor → abre y ejecuta el archivo supabase/trainer-exercise-notes.sql del proyecto. Opción B: pon DATABASE_URL en tu .env (ver .env.example) y ejecuta npm run supabase:trainer-exercise-notes';

/** Sin Supabase (demo o desarrollo sin migrar) las notas viven en memoria. */
const localNotes = new Map<string, TrainerExerciseNote>();

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes(TABLE) ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function trimmedOrUndefined(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function mapRow(row: Record<string, unknown>): TrainerExerciseNote {
  return {
    id: row.id as string,
    trainerId: row.trainer_id as string,
    athleteId: row.athlete_id as string,
    sessionLogId: (row.session_log_id as string | null) ?? undefined,
    sessionVideoId: (row.session_video_id as string | null) ?? undefined,
    athletePlanId: (row.athlete_plan_id as string | null) ?? undefined,
    exerciseKey: row.exercise_key as string,
    exerciseName: row.exercise_name as string,
    performedOn: row.performed_on as string,
    setNumber: row.set_number == null ? undefined : Number(row.set_number),
    reps: (row.reps as string | null) ?? undefined,
    seconds: (row.seconds as string | null) ?? undefined,
    level: (row.level as string | null) ?? undefined,
    execution: (row.execution as TrainerExerciseExecution | null) ?? undefined,
    technique: (row.technique as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function trainerExerciseNoteHasContent(draft: TrainerExerciseNoteDraft) {
  return Boolean(
    trimmedOrUndefined(draft.reps) ||
      trimmedOrUndefined(draft.seconds) ||
      trimmedOrUndefined(draft.level) ||
      draft.execution ||
      trimmedOrUndefined(draft.technique) ||
      trimmedOrUndefined(draft.notes),
  );
}

/** Resumen de una línea para las listas de historial. */
export function summarizeTrainerExerciseNote(note: TrainerExerciseNote) {
  const parts = [
    note.reps ? `${note.reps} reps` : null,
    note.seconds ? `${note.seconds} s` : null,
    note.level,
    note.execution ? TRAINER_EXERCISE_EXECUTION_LABELS[note.execution] : null,
  ].filter(Boolean);

  return parts.join(' · ');
}

function sortNotes(notes: TrainerExerciseNote[]) {
  return [...notes].sort((left, right) => {
    if (left.performedOn !== right.performedOn) {
      return right.performedOn.localeCompare(left.performedOn);
    }
    return (left.setNumber ?? 0) - (right.setNumber ?? 0);
  });
}

function parsePerformedOn(performedOn: string) {
  const date = new Date(`${performedOn}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(from: Date, to: Date) {
  const atMidnight = (value: Date) =>
    Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  return Math.round((atMidnight(to) - atMidnight(from)) / 86_400_000);
}

/** "hace 1 semana", "hace 2 meses"… es el eje con el que el entrenador compara la evolución. */
export function formatTrainerExerciseNoteAge(performedOn: string, reference = new Date()) {
  const date = parsePerformedOn(performedOn);
  if (!date) return '';

  const days = daysBetween(date, reference);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? 'hace 1 semana' : `hace ${weeks} semanas`;
  }

  if (days < 365) {
    const months = Math.max(1, Math.round(days / 30.44));
    return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? 'hace 1 año' : `hace ${years} años`;
}

export function formatTrainerExerciseNoteDate(performedOn: string) {
  const date = parsePerformedOn(performedOn);
  if (!date) return performedOn;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface TrainerExerciseNoteHistoryGroup {
  performedOn: string;
  dateLabel: string;
  ageLabel: string;
  notes: TrainerExerciseNote[];
}

/** Una entrada por sesión pasada, de la más reciente a la más antigua. */
export function groupTrainerExerciseNoteHistory(
  notes: TrainerExerciseNote[],
  reference = new Date(),
): TrainerExerciseNoteHistoryGroup[] {
  const groups = new Map<string, TrainerExerciseNoteHistoryGroup>();

  for (const note of sortNotes(notes)) {
    const existing = groups.get(note.performedOn);
    if (existing) {
      existing.notes.push(note);
      continue;
    }

    groups.set(note.performedOn, {
      performedOn: note.performedOn,
      dateLabel: formatTrainerExerciseNoteDate(note.performedOn),
      ageLabel: formatTrainerExerciseNoteAge(note.performedOn, reference),
      notes: [note],
    });
  }

  return [...groups.values()];
}

export const SESSION_LOG_VIDEO_NOTE_LABEL = 'Vídeo de la sesión';

/** Nombre visible en el modal (prioriza el ejercicio real frente a «Vídeo de la sesión»). */
export function getTrainerExerciseNoteDisplayName(
  exerciseName: string,
  contextLabel?: string,
): string {
  const fromContext = contextLabel?.match(/^Ejercicio:\s*(.+)$/i)?.[1]?.trim();
  if (fromContext) return fromContext;

  const trimmed = exerciseName.trim();
  if (trimmed && trimmed !== SESSION_LOG_VIDEO_NOTE_LABEL) return trimmed;
  return trimmed || SESSION_LOG_VIDEO_NOTE_LABEL;
}

/** Clave estable para apuntes: ejercicio por nombre, o vídeo suelto de sesión por id. */
export function resolveTrainerExerciseNoteTarget(input: {
  exerciseName?: string | null;
  sessionVideoId?: string;
}): { name: string; exerciseKey: string } | null {
  const trimmed = input.exerciseName?.trim();
  if (trimmed) {
    const exerciseKey = normalizeExerciseName(trimmed);
    if (!exerciseKey) return null;
    return { name: trimmed, exerciseKey };
  }

  if (input.sessionVideoId) {
    return {
      name: SESSION_LOG_VIDEO_NOTE_LABEL,
      exerciseKey: `session-video:${input.sessionVideoId}`,
    };
  }

  return null;
}

export async function fetchSessionExerciseNotes(input: {
  trainerId: string;
  athleteId: string;
  sessionLogId?: string;
  athletePlanId?: string;
  /** En modo plan la "sesión actual" es el día en que el entrenador revisa. */
  performedOn?: string;
}): Promise<{ notes: TrainerExerciseNote[]; persistent: boolean }> {
  const scopeId = input.sessionLogId ?? input.athletePlanId;
  if (!input.trainerId || !input.athleteId || !scopeId) {
    return { notes: [], persistent: true };
  }

  const matchesScope = (note: TrainerExerciseNote) =>
    input.sessionLogId
      ? note.sessionLogId === input.sessionLogId
      : note.athletePlanId === input.athletePlanId && note.performedOn === input.performedOn;

  if (!isSupabaseConfigured) {
    return {
      notes: sortNotes(
        [...localNotes.values()].filter(
          (note) => note.trainerId === input.trainerId && matchesScope(note),
        ),
      ),
      persistent: false,
    };
  }

  const supabase = getSupabase();
  if (!supabase) return { notes: [], persistent: false };

  const scoped = supabase
    .from(TABLE)
    .select(SELECT)
    .eq('trainer_id', input.trainerId)
    .eq('athlete_id', input.athleteId);

  const { data, error } = await (input.sessionLogId
    ? scoped.eq('session_log_id', input.sessionLogId)
    : scoped
        .eq('athlete_plan_id', input.athletePlanId as string)
        .eq('performed_on', input.performedOn as string)
  ).order('set_number', { ascending: true, nullsFirst: true });

  if (isMissingTableError(error)) return { notes: [], persistent: false };
  if (error || !data) return { notes: [], persistent: true };

  return { notes: data.map((row) => mapRow(row as Record<string, unknown>)), persistent: true };
}

/**
 * Historial completo del ejercicio para ese atleta. Se excluye la sesión abierta
 * para que lo que se compara sea siempre "lo que pasó antes".
 */
export async function fetchExerciseNoteHistory(input: {
  trainerId: string;
  athleteId: string;
  exerciseKey: string;
  excludeSessionLogId?: string;
  excludePerformedOn?: string;
  limit?: number;
}): Promise<TrainerExerciseNote[]> {
  if (!input.trainerId || !input.athleteId || !input.exerciseKey) return [];

  const limit = input.limit ?? 50;

  if (!isSupabaseConfigured) {
    return sortNotes(
      [...localNotes.values()].filter(
        (note) =>
          note.trainerId === input.trainerId &&
          note.athleteId === input.athleteId &&
          note.exerciseKey === input.exerciseKey &&
          (!input.excludeSessionLogId || note.sessionLogId !== input.excludeSessionLogId) &&
          (!input.excludePerformedOn || note.performedOn !== input.excludePerformedOn),
      ),
    ).slice(0, limit);
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from(TABLE)
    .select(SELECT)
    .eq('trainer_id', input.trainerId)
    .eq('athlete_id', input.athleteId)
    .eq('exercise_key', input.exerciseKey);

  if (input.excludeSessionLogId) {
    query = query.neq('session_log_id', input.excludeSessionLogId);
  }

  if (input.excludePerformedOn) {
    query = query.neq('performed_on', input.excludePerformedOn);
  }

  const { data, error } = await query
    .order('performed_on', { ascending: false })
    .order('set_number', { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export interface TrainerExerciseNoteSummary {
  /** Apuntes de sesiones anteriores a la que se está mirando. */
  historyCount: number;
  lastPerformedOn: string;
}

/**
 * Cuántos apuntes previos tiene cada ejercicio del atleta, para poder avisarlo en la
 * propia lista del entreno sin abrir todos los apuntes uno a uno.
 */
export async function fetchAthleteExerciseNoteSummary(input: {
  trainerId: string;
  athleteId: string;
  excludeSessionLogId?: string;
  excludePerformedOn?: string;
}): Promise<Record<string, TrainerExerciseNoteSummary>> {
  if (!input.trainerId || !input.athleteId) return {};

  const isHistory = (note: Pick<TrainerExerciseNote, 'sessionLogId' | 'performedOn'>) =>
    (!input.excludeSessionLogId || note.sessionLogId !== input.excludeSessionLogId) &&
    (!input.excludePerformedOn || note.performedOn !== input.excludePerformedOn);

  const collect = (rows: { exerciseKey: string; performedOn: string }[]) => {
    const summary: Record<string, TrainerExerciseNoteSummary> = {};
    for (const row of rows) {
      const current = summary[row.exerciseKey];
      if (!current) {
        summary[row.exerciseKey] = { historyCount: 1, lastPerformedOn: row.performedOn };
        continue;
      }
      current.historyCount += 1;
      if (row.performedOn > current.lastPerformedOn) current.lastPerformedOn = row.performedOn;
    }
    return summary;
  };

  if (!isSupabaseConfigured) {
    return collect(
      [...localNotes.values()]
        .filter(
          (note) =>
            note.trainerId === input.trainerId &&
            note.athleteId === input.athleteId &&
            isHistory(note),
        )
        .map((note) => ({ exerciseKey: note.exerciseKey, performedOn: note.performedOn })),
    );
  }

  const supabase = getSupabase();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from(TABLE)
    .select('exercise_key, performed_on, session_log_id')
    .eq('trainer_id', input.trainerId)
    .eq('athlete_id', input.athleteId)
    .order('performed_on', { ascending: false })
    .limit(1000);

  if (error || !data) return {};

  return collect(
    data
      .map((row) => ({
        exerciseKey: row.exercise_key as string,
        performedOn: row.performed_on as string,
        sessionLogId: (row.session_log_id as string | null) ?? undefined,
      }))
      .filter(isHistory),
  );
}

/** Todos los apuntes privados del entrenador sobre un atleta (ficha, listado por plan). */
export async function fetchAthleteExerciseNotes(input: {
  trainerId: string;
  athleteId: string;
  limit?: number;
}): Promise<TrainerExerciseNote[]> {
  if (!input.trainerId || !input.athleteId) return [];

  const limit = input.limit ?? 500;

  if (!isSupabaseConfigured) {
    return sortNotes(
      [...localNotes.values()].filter(
        (note) => note.trainerId === input.trainerId && note.athleteId === input.athleteId,
      ),
    ).slice(0, limit);
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('trainer_id', input.trainerId)
    .eq('athlete_id', input.athleteId)
    .order('performed_on', { ascending: false })
    .order('set_number', { ascending: true, nullsFirst: true })
    .limit(limit);

  if (isMissingTableError(error)) return [];
  if (error || !data) return [];
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function saveTrainerExerciseNote(input: {
  noteId?: string;
  trainerId: string;
  athleteId: string;
  sessionLogId?: string;
  sessionVideoId?: string;
  athletePlanId?: string;
  exerciseKey: string;
  exerciseName: string;
  performedOn: string;
  draft: TrainerExerciseNoteDraft;
}): Promise<{ note?: TrainerExerciseNote; error?: string }> {
  if (!input.trainerId) return { error: 'Inicia sesión como entrenador para guardar apuntes.' };
  if (!trainerExerciseNoteHasContent(input.draft)) {
    return { error: 'Rellena al menos un dato del ejercicio.' };
  }

  const now = new Date().toISOString();
  const values = {
    set_number: input.draft.setNumber ?? null,
    reps: trimmedOrUndefined(input.draft.reps) ?? null,
    seconds: trimmedOrUndefined(input.draft.seconds) ?? null,
    level: trimmedOrUndefined(input.draft.level) ?? null,
    execution: input.draft.execution ?? null,
    technique: trimmedOrUndefined(input.draft.technique) ?? null,
    notes: trimmedOrUndefined(input.draft.notes) ?? null,
    updated_at: now,
  };

  if (!isSupabaseConfigured) {
    const id = input.noteId ?? `local-exercise-note-${Date.now()}`;
    const note: TrainerExerciseNote = {
      id,
      trainerId: input.trainerId,
      athleteId: input.athleteId,
      sessionLogId: input.sessionLogId,
      sessionVideoId: input.sessionVideoId,
      athletePlanId: input.athletePlanId,
      exerciseKey: input.exerciseKey,
      exerciseName: input.exerciseName,
      performedOn: input.performedOn,
      setNumber: input.draft.setNumber,
      reps: trimmedOrUndefined(input.draft.reps),
      seconds: trimmedOrUndefined(input.draft.seconds),
      level: trimmedOrUndefined(input.draft.level),
      execution: input.draft.execution,
      technique: trimmedOrUndefined(input.draft.technique),
      notes: trimmedOrUndefined(input.draft.notes),
      createdAt: localNotes.get(id)?.createdAt ?? now,
      updatedAt: now,
    };
    localNotes.set(id, note);
    return { note };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = input.noteId
    ? await supabase.from(TABLE).update(values).eq('id', input.noteId).select(SELECT).single()
    : await supabase
        .from(TABLE)
        .insert({
          trainer_id: input.trainerId,
          athlete_id: input.athleteId,
          session_log_id: input.sessionLogId ?? null,
          session_video_id: input.sessionVideoId ?? null,
          athlete_plan_id: input.athletePlanId ?? null,
          exercise_key: input.exerciseKey,
          exercise_name: input.exerciseName,
          performed_on: input.performedOn,
          ...values,
        })
        .select(SELECT)
        .single();

  if (error || !data) {
    return {
      error: isMissingTableError(error) ? MIGRATION_HINT : error?.message ?? 'No se pudo guardar el apunte.',
    };
  }

  return { note: mapRow(data as Record<string, unknown>) };
}

export async function deleteTrainerExerciseNote(noteId: string): Promise<{ error?: string }> {
  if (!noteId) return {};

  if (!isSupabaseConfigured || noteId.startsWith('local-exercise-note-')) {
    localNotes.delete(noteId);
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(TABLE).delete().eq('id', noteId);
  return error ? { error: error.message } : {};
}
