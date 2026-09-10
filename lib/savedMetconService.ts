import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { SavedMetcon } from '@/lib/types';

const TABLE = 'athlete_saved_metcons';
const LOCAL_STORAGE_KEY = 'athlete-saved-metcons-v1';

const localByUser = new Map<string, SavedMetcon[]>();

const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
};

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('athlete_saved_metcons') ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function mapRow(row: Record<string, unknown>): SavedMetcon {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    workoutId: String(row.workout_id),
    programId: String(row.program_id),
    workoutName: String(row.workout_name ?? 'Metcon'),
    programName: (row.program_name as string | null) ?? undefined,
    savedAt: String(row.saved_at ?? new Date().toISOString()),
  };
}

function sortByDate(entries: SavedMetcon[]) {
  return [...entries].sort((left, right) => right.savedAt.localeCompare(left.savedAt));
}

async function readPersistedLocal(): Promise<Record<string, SavedMetcon[]>> {
  try {
    const raw = await storage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SavedMetcon[]>;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writePersistedLocal(all: Record<string, SavedMetcon[]>) {
  try {
    await storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore quota / private mode failures
  }
}

async function localList(userId: string) {
  if (!localByUser.has(userId)) {
    const persisted = await readPersistedLocal();
    localByUser.set(userId, sortByDate(persisted[userId] ?? []));
  }
  return localByUser.get(userId) ?? [];
}

async function persistLocalList(userId: string) {
  const all = await readPersistedLocal();
  all[userId] = localByUser.get(userId) ?? [];
  await writePersistedLocal(all);
}

async function setLocalEntries(userId: string, entries: SavedMetcon[]) {
  localByUser.set(userId, sortByDate(entries));
  await persistLocalList(userId);
}

function mergeRemoteAndLocal(remote: SavedMetcon[], local: SavedMetcon[]) {
  const merged = new Map<string, SavedMetcon>();
  for (const entry of remote) merged.set(entry.workoutId, entry);
  for (const entry of local) {
    if (!merged.has(entry.workoutId)) merged.set(entry.workoutId, entry);
  }
  return sortByDate([...merged.values()]);
}

export async function fetchSavedMetcons(userId: string): Promise<SavedMetcon[]> {
  if (!userId) return [];

  const local = await localList(userId);
  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return sortByDate(local);

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, user_id, workout_id, program_id, workout_name, program_name, saved_at')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) return sortByDate(local);

  const remote = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  const merged = mergeRemoteAndLocal(remote, local);
  await setLocalEntries(userId, merged);
  return merged;
}

export async function saveMetconToProfile(input: {
  userId: string;
  workoutId: string;
  programId: string;
  workoutName: string;
  programName?: string;
}): Promise<{ error?: string; warning?: string; entry?: SavedMetcon }> {
  const entry: SavedMetcon = {
    id: `local-${Date.now()}`,
    userId: input.userId,
    workoutId: input.workoutId,
    programId: input.programId,
    workoutName: input.workoutName,
    programName: input.programName,
    savedAt: new Date().toISOString(),
  };

  const persistLocal = async (saved: SavedMetcon) => {
    const current = await localList(input.userId);
    const withoutDuplicate = current.filter((item) => item.workoutId !== input.workoutId);
    await setLocalEntries(input.userId, [saved, ...withoutDuplicate]);
  };

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase || !isValidUuid(input.workoutId) || !isValidUuid(input.programId)) {
    await persistLocal(entry);
    if (supabase && (!isValidUuid(input.workoutId) || !isValidUuid(input.programId))) {
      return {
        entry,
        warning:
          'Guardado en este dispositivo. Los identificadores de esta sesión no son compatibles con la nube.',
      };
    }
    return { entry };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: input.userId,
        workout_id: input.workoutId,
        program_id: input.programId,
        workout_name: input.workoutName,
        program_name: input.programName ?? null,
        saved_at: entry.savedAt,
      },
      { onConflict: 'user_id,workout_id' },
    )
    .select('id, user_id, workout_id, program_id, workout_name, program_name, saved_at')
    .single();

  if (error) {
    await persistLocal(entry);
    return {
      entry,
      warning: isMissingTableError(error)
        ? 'Guardado en este dispositivo. Ejecuta npm run supabase:saved-metcons para sincronizar con tu perfil.'
        : error.message,
    };
  }

  const saved = mapRow(data as Record<string, unknown>);
  await persistLocal(saved);
  return { entry: saved };
}

export async function removeSavedMetcon(
  userId: string,
  workoutId: string,
): Promise<{ error?: string; warning?: string }> {
  if (!userId || !workoutId) return {};

  const persistLocal = async () => {
    const current = await localList(userId);
    await setLocalEntries(
      userId,
      current.filter((item) => item.workoutId !== workoutId),
    );
  };

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase || !isValidUuid(workoutId)) {
    await persistLocal();
    return {};
  }

  const { error } = await supabase.from(TABLE).delete().eq('user_id', userId).eq('workout_id', workoutId);

  if (error) {
    await persistLocal();
    return {
      warning: isMissingTableError(error)
        ? 'Quitado en este dispositivo. Ejecuta npm run supabase:saved-metcons para sincronizar.'
        : error.message,
    };
  }

  await persistLocal();
  return {};
}
