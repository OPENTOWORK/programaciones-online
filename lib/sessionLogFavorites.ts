import { readPersistedRecord, writePersistedRecord } from '@/lib/localUserDataStorage';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'session-log-favorites';
const TABLE = 'workout_log_favorites';

function isMissingTableError(error: { message?: string } | null) {
  const message = (error?.message ?? '').toLowerCase();
  return message.includes(TABLE) || message.includes('schema cache') || message.includes('does not exist');
}

async function readLocalIds(trainerId: string) {
  const all = await readPersistedRecord<string[]>(STORAGE_KEY);
  return new Set(all[trainerId] ?? []);
}

async function writeLocalIds(trainerId: string, ids: Set<string>) {
  const all = await readPersistedRecord<string[]>(STORAGE_KEY);
  all[trainerId] = [...ids];
  await writePersistedRecord(STORAGE_KEY, all);
}

export async function fetchSessionLogFavoriteIds(
  trainerId: string,
  logIds: string[],
): Promise<Set<string>> {
  const uniqueIds = [...new Set(logIds.filter(Boolean))];
  if (!trainerId || uniqueIds.length === 0) return new Set();

  if (!isSupabaseConfigured) {
    const local = await readLocalIds(trainerId);
    return new Set(uniqueIds.filter((id) => local.has(id)));
  }

  const supabase = getSupabase();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from(TABLE)
    .select('workout_log_id')
    .eq('trainer_id', trainerId)
    .in('workout_log_id', uniqueIds);

  if (error) {
    if (isMissingTableError(error)) {
      const local = await readLocalIds(trainerId);
      return new Set(uniqueIds.filter((id) => local.has(id)));
    }
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.workout_log_id as string));
}

export async function setSessionLogFavorite(
  trainerId: string,
  logId: string,
  favorite: boolean,
): Promise<{ error?: string }> {
  if (!trainerId || !logId) return { error: 'No se pudo guardar el favorito.' };

  if (!isSupabaseConfigured) {
    const ids = await readLocalIds(trainerId);
    if (favorite) ids.add(logId);
    else ids.delete(logId);
    await writeLocalIds(trainerId, ids);
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  if (favorite) {
    const { error } = await supabase.from(TABLE).upsert(
      { workout_log_id: logId, trainer_id: trainerId },
      { onConflict: 'workout_log_id,trainer_id' },
    );
    if (!error) return {};
    if (isMissingTableError(error)) {
      const ids = await readLocalIds(trainerId);
      ids.add(logId);
      await writeLocalIds(trainerId, ids);
      return {};
    }
    return { error: error.message };
  }

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('workout_log_id', logId)
    .eq('trainer_id', trainerId);

  if (!error) return {};
  if (isMissingTableError(error)) {
    const ids = await readLocalIds(trainerId);
    ids.delete(logId);
    await writeLocalIds(trainerId, ids);
    return {};
  }
  return { error: error.message };
}
