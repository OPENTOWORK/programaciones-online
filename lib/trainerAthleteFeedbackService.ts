import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  deleteFeedbackAttachments,
  fetchFeedbackAttachments,
  localFeedbackAttachments,
} from '@/lib/trainerFeedbackMediaService';
import { fetchTrainerNames } from '@/lib/trainerNames';
import type { TrainerAthleteFeedback } from '@/lib/types';

const TABLE = 'trainer_athlete_feedback';
const localFeedbackByAthlete = new Map<string, TrainerAthleteFeedback[]>();

function localEntries(athleteId: string) {
  const existing = localFeedbackByAthlete.get(athleteId);
  if (existing) return existing;
  const created: TrainerAthleteFeedback[] = [];
  localFeedbackByAthlete.set(athleteId, created);
  return created;
}

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes(TABLE) ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function mapRow(row: Record<string, unknown>): TrainerAthleteFeedback {
  return {
    id: row.id as string,
    trainerId: row.trainer_id as string,
    athleteId: row.athlete_id as string,
    sessionLogId: (row.session_log_id as string | null) ?? undefined,
    message: (row.message as string) ?? '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    attachments: [],
  };
}

function withLocalAttachments(entries: TrainerAthleteFeedback[]) {
  return entries.map((entry) => ({ ...entry, attachments: localFeedbackAttachments(entry.id) }));
}

/** El atleta ve su propio feedback y los entrenadores el de todo el equipo. */
export async function fetchTrainerAthleteFeedback(
  athleteId: string,
  useLocalStore = false,
): Promise<{ entries: TrainerAthleteFeedback[]; persistent: boolean }> {
  if (useLocalStore || !isSupabaseConfigured) {
    return { entries: withLocalAttachments(localEntries(athleteId)), persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) return { entries: [], persistent: false };

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, trainer_id, athlete_id, session_log_id, message, created_at, updated_at')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false });

  if (isMissingTableError(error)) {
    return { entries: withLocalAttachments(localEntries(athleteId)), persistent: false };
  }
  if (error || !data) return { entries: [], persistent: true };

  const entries = data.map((row) => mapRow(row as Record<string, unknown>));
  const attachmentsByFeedback = await fetchFeedbackAttachments(entries.map((entry) => entry.id));
  const names = await fetchTrainerNames(entries.map((entry) => entry.trainerId));

  return {
    entries: entries.map((entry) => ({
      ...entry,
      trainerName: names.get(entry.trainerId),
      attachments: attachmentsByFeedback[entry.id] ?? [],
    })),
    persistent: true,
  };
}

export async function createTrainerAthleteFeedback(input: {
  trainerId: string;
  athleteId: string;
  message: string;
  sessionLogId?: string;
  useLocalStore: boolean;
  allowEmptyMessage?: boolean;
}): Promise<{ entry?: TrainerAthleteFeedback; error?: string }> {
  const message = input.message.trim();
  if (!message && !input.allowEmptyMessage) {
    return { error: 'Escribe un feedback antes de enviarlo.' };
  }
  if (message.length > 2000) return { error: 'El feedback no puede superar los 2000 caracteres.' };

  if (input.useLocalStore) {
    const now = new Date().toISOString();
    const entry: TrainerAthleteFeedback = {
      id: `local-feedback-${Date.now()}`,
      trainerId: input.trainerId,
      athleteId: input.athleteId,
      sessionLogId: input.sessionLogId,
      message,
      createdAt: now,
      updatedAt: now,
      attachments: [],
    };
    localEntries(input.athleteId).unshift(entry);
    return { entry };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      trainer_id: input.trainerId,
      athlete_id: input.athleteId,
      session_log_id: input.sessionLogId ?? null,
      message,
    })
    .select('id, trainer_id, athlete_id, session_log_id, message, created_at, updated_at')
    .single();

  if (error || !data) {
    return {
      error: isMissingTableError(error)
        ? 'Falta aplicar la tabla de feedback en Supabase.'
        : error?.message ?? 'No se pudo enviar el feedback.',
    };
  }

  return { entry: mapRow(data as Record<string, unknown>) };
}

export async function updateTrainerAthleteFeedback(input: {
  entry: TrainerAthleteFeedback;
  message: string;
  useLocalStore: boolean;
  allowEmptyMessage?: boolean;
}): Promise<{ entry?: TrainerAthleteFeedback; error?: string }> {
  const message = input.message.trim();
  if (!message && !input.allowEmptyMessage) {
    return { error: 'Escribe un feedback antes de guardarlo.' };
  }
  if (message.length > 2000) return { error: 'El feedback no puede superar los 2000 caracteres.' };

  const now = new Date().toISOString();

  if (input.useLocalStore || input.entry.id.startsWith('local-feedback-')) {
    const entries = localEntries(input.entry.athleteId);
    const index = entries.findIndex((item) => item.id === input.entry.id);
    if (index < 0) return { error: 'No se encontró el feedback.' };
    const updated: TrainerAthleteFeedback = {
      ...entries[index],
      message,
      updatedAt: now,
    };
    entries[index] = updated;
    return { entry: { ...updated, attachments: input.entry.attachments } };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(TABLE)
    .update({ message, updated_at: now })
    .eq('id', input.entry.id)
    .select('id, trainer_id, athlete_id, session_log_id, message, created_at, updated_at')
    .single();

  if (error || !data) {
    return {
      error: isMissingTableError(error)
        ? 'Falta aplicar la tabla de feedback en Supabase.'
        : error?.message ?? 'No se pudo guardar el feedback.',
    };
  }

  return {
    entry: {
      ...mapRow(data as Record<string, unknown>),
      trainerName: input.entry.trainerName,
      attachments: input.entry.attachments,
    },
  };
}

export async function deleteTrainerAthleteFeedback(
  entry: TrainerAthleteFeedback,
  useLocalStore: boolean,
): Promise<{ error?: string }> {
  if (useLocalStore || entry.id.startsWith('local-feedback-')) {
    const entries = localEntries(entry.athleteId);
    const index = entries.findIndex((item) => item.id === entry.id);
    if (index >= 0) entries.splice(index, 1);
    await deleteFeedbackAttachments(entry.id, true);
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  await deleteFeedbackAttachments(entry.id, false);

  const { error } = await supabase.from(TABLE).delete().eq('id', entry.id);

  return error ? { error: error.message } : {};
}
