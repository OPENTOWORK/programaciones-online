import { readPersistedRecord, writePersistedRecord } from '@/lib/localUserDataStorage';
import {
  isRepMaxUnit,
  todayDateKey,
  type AthleteRepMax,
  type RepMaxUnit,
} from '@/lib/repMax';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const TABLE = 'athlete_rep_maxes';
const LOCAL_STORAGE_KEY = 'athlete-rep-maxes-v1';

const localByUser = new Map<string, AthleteRepMax[]>();

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

function parseNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateKey(value: unknown): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return todayDateKey(value);
  }
  return todayDateKey();
}

function mapRow(row: Record<string, unknown>): AthleteRepMax {
  const rawValue = row.value ?? row.weight_kg ?? row.weightKg;
  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId ?? ''),
    exerciseName: String(row.exercise_name ?? row.exerciseName ?? ''),
    value: parseNumber(rawValue),
    unit: isRepMaxUnit(row.unit) ? row.unit : 'kg',
    reps: Math.max(1, Math.round(parseNumber(row.reps) || 1)),
    recordedAt: toDateKey(row.recorded_at ?? row.recordedAt),
    createdBy: row.created_by || row.createdBy ? String(row.created_by ?? row.createdBy) : undefined,
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? row.created_at ?? new Date().toISOString()),
  };
}

function sortEntries(entries: AthleteRepMax[]) {
  return [...entries].sort((left, right) => {
    const byDate = right.recordedAt.localeCompare(left.recordedAt);
    if (byDate !== 0) return byDate;
    return right.createdAt.localeCompare(left.createdAt);
  });
}

async function localEntries(userId: string) {
  if (!localByUser.has(userId)) {
    const persisted = await readPersistedRecord<Record<string, unknown>[]>(LOCAL_STORAGE_KEY);
    localByUser.set(userId, sortEntries((persisted[userId] ?? []).map((row) => mapRow(row))));
  }
  return localByUser.get(userId) ?? [];
}

async function persistLocal(userId: string, entries: AthleteRepMax[]) {
  const sorted = sortEntries(entries);
  localByUser.set(userId, sorted);
  const all = await readPersistedRecord<AthleteRepMax[]>(LOCAL_STORAGE_KEY);
  all[userId] = sorted;
  await writePersistedRecord(LOCAL_STORAGE_KEY, all);
}

function mergeEntries(remote: AthleteRepMax[], local: AthleteRepMax[]) {
  const merged = new Map<string, AthleteRepMax>();
  for (const entry of remote) merged.set(entry.id, entry);
  for (const entry of local) {
    if (!merged.has(entry.id)) merged.set(entry.id, entry);
  }
  return sortEntries([...merged.values()]);
}

export interface RepMaxInput {
  exerciseName: string;
  value: number;
  unit: RepMaxUnit;
  reps: number;
  recordedAt?: string;
}

function validateInput(input: RepMaxInput): { value?: RepMaxInput; error?: string } {
  const exerciseName = input.exerciseName.trim();
  if (!exerciseName) return { error: 'Indica el ejercicio.' };
  if (exerciseName.length > 80) return { error: 'El nombre del ejercicio es demasiado largo.' };

  const unit = isRepMaxUnit(input.unit) ? input.unit : 'kg';
  const amount = input.value;
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Indica un valor válido.' };
  }
  if (unit === 'kg' && amount > 500) return { error: 'Indica un peso válido, hasta 500 kg.' };
  if (unit === 'sec' && amount > 3600) return { error: 'Indica un tiempo válido, hasta 3600 segundos.' };
  if (unit === 'percent_rm' && amount > 150) return { error: 'Indica un %RM válido, hasta 150.' };

  const reps = Math.round(input.reps);
  if (!Number.isFinite(reps) || reps < 1 || reps > 30) {
    return { error: 'Indica entre 1 y 30 repeticiones.' };
  }

  return {
    value: {
      exerciseName,
      value: Math.round(amount * 10) / 10,
      unit,
      reps,
      recordedAt: input.recordedAt || todayDateKey(),
    },
  };
}

const SELECT_COLUMNS =
  'id, user_id, exercise_name, weight_kg, unit, reps, recorded_at, created_by, created_at, updated_at';

export async function fetchAthleteRepMaxes(
  userId: string,
): Promise<{ entries: AthleteRepMax[]; persistent: boolean }> {
  if (!userId) return { entries: [], persistent: true };

  const local = await localEntries(userId);
  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return { entries: local, persistent: false };

  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLUMNS)
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false });

  if (isMissingTableError(error)) {
    return { entries: local, persistent: false };
  }
  if (error || !data) return { entries: local, persistent: true };

  const remote = data.map((row) => mapRow(row as Record<string, unknown>));
  const merged = mergeEntries(remote, local);
  await persistLocal(userId, merged);
  return { entries: merged, persistent: true };
}

export async function createAthleteRepMax(input: {
  userId: string;
  actorId?: string;
  entry: RepMaxInput;
  useLocalStore: boolean;
}): Promise<{ entry?: AthleteRepMax; error?: string; warning?: string }> {
  const parsed = validateInput(input.entry);
  if (parsed.error || !parsed.value) return { error: parsed.error };

  const now = new Date().toISOString();
  const localEntry: AthleteRepMax = {
    id: `local-rm-${Date.now()}`,
    userId: input.userId,
    exerciseName: parsed.value.exerciseName,
    value: parsed.value.value,
    unit: parsed.value.unit,
    reps: parsed.value.reps,
    recordedAt: parsed.value.recordedAt ?? todayDateKey(),
    createdBy: input.actorId,
    createdAt: now,
    updatedAt: now,
  };

  if (input.useLocalStore) {
    const current = await localEntries(input.userId);
    await persistLocal(input.userId, [localEntry, ...current]);
    return { entry: localEntry, warning: 'RM guardado en este dispositivo.' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    const current = await localEntries(input.userId);
    await persistLocal(input.userId, [localEntry, ...current]);
    return { entry: localEntry, warning: 'RM guardado en este dispositivo.' };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: input.userId,
      exercise_name: parsed.value.exerciseName,
      weight_kg: parsed.value.value,
      unit: parsed.value.unit,
      reps: parsed.value.reps,
      recorded_at: parsed.value.recordedAt,
      created_by: input.actorId ?? input.userId,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    if (isMissingTableError(error)) {
      const current = await localEntries(input.userId);
      await persistLocal(input.userId, [localEntry, ...current]);
      return {
        entry: localEntry,
        warning: 'RM guardado en este dispositivo. Falta aplicar la tabla en Supabase.',
      };
    }
    return { error: error?.message ?? 'No se pudo guardar el RM.' };
  }

  const saved = mapRow(data as Record<string, unknown>);
  const current = await localEntries(input.userId);
  await persistLocal(input.userId, mergeEntries([saved], current));
  return { entry: saved };
}

export async function updateAthleteRepMax(input: {
  entry: AthleteRepMax;
  next: RepMaxInput;
  useLocalStore: boolean;
}): Promise<{ entry?: AthleteRepMax; error?: string }> {
  const parsed = validateInput(input.next);
  if (parsed.error || !parsed.value) return { error: parsed.error };

  const now = new Date().toISOString();
  const updated: AthleteRepMax = {
    ...input.entry,
    exerciseName: parsed.value.exerciseName,
    value: parsed.value.value,
    unit: parsed.value.unit,
    reps: parsed.value.reps,
    recordedAt: parsed.value.recordedAt ?? input.entry.recordedAt,
    updatedAt: now,
  };

  if (input.useLocalStore || input.entry.id.startsWith('local-rm-')) {
    const current = await localEntries(input.entry.userId);
    const index = current.findIndex((item) => item.id === input.entry.id);
    if (index < 0) return { error: 'No se encontró el RM.' };
    const next = [...current];
    next[index] = updated;
    await persistLocal(input.entry.userId, next);
    return { entry: updated };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      exercise_name: parsed.value.exerciseName,
      weight_kg: parsed.value.value,
      unit: parsed.value.unit,
      reps: parsed.value.reps,
      recorded_at: parsed.value.recordedAt,
      updated_at: now,
    })
    .eq('id', input.entry.id)
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    return {
      error: isMissingTableError(error)
        ? 'Falta aplicar la tabla de RM en Supabase.'
        : error?.message ?? 'No se pudo guardar el RM.',
    };
  }

  const saved = mapRow(data as Record<string, unknown>);
  const current = await localEntries(input.entry.userId);
  await persistLocal(
    input.entry.userId,
    current.map((item) => (item.id === saved.id ? saved : item)),
  );
  return { entry: saved };
}

export async function deleteAthleteRepMax(
  entry: AthleteRepMax,
  useLocalStore: boolean,
): Promise<{ error?: string }> {
  if (useLocalStore || entry.id.startsWith('local-rm-')) {
    const current = await localEntries(entry.userId);
    await persistLocal(
      entry.userId,
      current.filter((item) => item.id !== entry.id),
    );
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(TABLE).delete().eq('id', entry.id);
  if (error) {
    return {
      error: isMissingTableError(error)
        ? 'Falta aplicar la tabla de RM en Supabase.'
        : error.message,
    };
  }

  const current = await localEntries(entry.userId);
  await persistLocal(
    entry.userId,
    current.filter((item) => item.id !== entry.id),
  );
  return {};
}
