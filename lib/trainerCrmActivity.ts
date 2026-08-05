import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchTrainerNames } from '@/lib/trainerNames';
import type { AthletePlanType, CrmActivityEntry, CrmActivityKind } from '@/lib/types';

const MESSAGE_PREVIEW_MAX = 100;

export function buildPlanAssignedMessage(
  planType: AthletePlanType,
  title: string,
  sessionNumber = 1,
): string {
  const quoted = `"${title.trim()}"`;

  if (planType === 'nutrition') {
    return `Plan nutricional asignado: ${quoted}`;
  }

  if (sessionNumber > 1) {
    return `Sesión ${sessionNumber} añadida al plan ${quoted}`;
  }

  return `Plan personalizado asignado: ${quoted}`;
}

export function buildMessageSentActivity(text: string): string {
  const trimmed = text.trim();
  const preview =
    trimmed.length > MESSAGE_PREVIEW_MAX
      ? `${trimmed.slice(0, MESSAGE_PREVIEW_MAX - 3)}...`
      : trimmed;

  return `Mensaje enviado: "${preview}"`;
}

const TABLE = 'trainer_crm_activity';

// ---- Almacén local en memoria (modo demo o respaldo si la tabla no existe todavía) ----
const localActivityByKey = new Map<string, CrmActivityEntry[]>();

function keyFor(trainerId: string, athleteId: string) {
  return `${trainerId}:${athleteId}`;
}

function getLocalActivity(trainerId: string, athleteId: string): CrmActivityEntry[] {
  const key = keyFor(trainerId, athleteId);
  let entries = localActivityByKey.get(key);
  if (!entries) {
    entries = [];
    localActivityByKey.set(key, entries);
  }
  return entries;
}

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

export async function fetchCrmActivity(
  trainerId: string,
  athleteId: string,
  useLocalStore: boolean,
): Promise<{ entries: CrmActivityEntry[]; persistent: boolean }> {
  if (useLocalStore || !isSupabaseConfigured) {
    return { entries: getLocalActivity(trainerId, athleteId), persistent: useLocalStore };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { entries: getLocalActivity(trainerId, athleteId), persistent: false };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, trainer_id, kind, message, created_at')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false });

  if (isMissingTableError(error)) {
    return { entries: getLocalActivity(trainerId, athleteId), persistent: false };
  }

  if (error || !data) {
    return { entries: [], persistent: true };
  }

  const names = await fetchTrainerNames(data.map((row) => row.trainer_id as string));

  const entries: CrmActivityEntry[] = data.map((row) => ({
    id: row.id as string,
    kind: (row.kind as CrmActivityKind) ?? 'note',
    message: row.message as string,
    createdAt: row.created_at as string,
    trainerName: names.get(row.trainer_id as string),
  }));

  return { entries, persistent: true };
}

export async function addCrmActivity(
  trainerId: string,
  athleteId: string,
  message: string,
  kind: CrmActivityKind,
  useLocalStore: boolean,
): Promise<CrmActivityEntry> {
  const trimmed = message.trim();

  if (useLocalStore) {
    const entry: CrmActivityEntry = {
      id: `local-activity-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kind,
      message: trimmed,
      createdAt: new Date().toISOString(),
    };
    getLocalActivity(trainerId, athleteId).unshift(entry);
    return entry;
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ trainer_id: trainerId, athlete_id: athleteId, kind, message: trimmed })
      .select('id, kind, message, created_at')
      .single();

    if (!error && data) {
      return {
        id: data.id as string,
        kind: (data.kind as CrmActivityKind) ?? kind,
        message: data.message as string,
        createdAt: data.created_at as string,
      };
    }
  }

  const entry: CrmActivityEntry = {
    id: `local-activity-${Date.now()}`,
    kind,
    message: trimmed,
    createdAt: new Date().toISOString(),
  };
  getLocalActivity(trainerId, athleteId).unshift(entry);
  return entry;
}

export async function deleteCrmActivity(
  trainerId: string,
  athleteId: string,
  entryId: string,
  useLocalStore: boolean,
): Promise<void> {
  if (useLocalStore || entryId.startsWith('local-activity-')) {
    const entries = getLocalActivity(trainerId, athleteId);
    const index = entries.findIndex((entry) => entry.id === entryId);
    if (index >= 0) entries.splice(index, 1);
    return;
  }

  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from(TABLE).delete().eq('id', entryId);
}
