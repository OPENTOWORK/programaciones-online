import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { SavedMetcon } from '@/lib/types';

const TABLE = 'athlete_saved_metcons';

const localByUser = new Map<string, SavedMetcon[]>();

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

export async function fetchSavedMetcons(userId: string): Promise<SavedMetcon[]> {
  if (!userId) return [];

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return sortByDate(localByUser.get(userId) ?? []);

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, user_id, workout_id, program_id, workout_name, program_name, saved_at')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) return sortByDate(localByUser.get(userId) ?? []);

  const remote = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  const local = localByUser.get(userId) ?? [];
  if (local.length === 0) return remote;

  const merged = new Map<string, SavedMetcon>();
  for (const entry of remote) merged.set(entry.workoutId, entry);
  for (const entry of local) {
    if (!merged.has(entry.workoutId)) merged.set(entry.workoutId, entry);
  }
  return sortByDate([...merged.values()]);
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

  const persistLocal = () => {
    const current = localByUser.get(input.userId) ?? [];
    const withoutDuplicate = current.filter((item) => item.workoutId !== input.workoutId);
    localByUser.set(input.userId, sortByDate([entry, ...withoutDuplicate]));
  };

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) {
    persistLocal();
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
    persistLocal();
    return {
      entry,
      warning: isMissingTableError(error)
        ? 'Guardado en este dispositivo. Ejecuta npm run supabase:saved-metcons para sincronizar con tu perfil.'
        : error.message,
    };
  }

  return { entry: mapRow(data as Record<string, unknown>) };
}

export async function removeSavedMetcon(
  userId: string,
  workoutId: string,
): Promise<{ error?: string; warning?: string }> {
  if (!userId || !workoutId) return {};

  const persistLocal = () => {
    const current = localByUser.get(userId) ?? [];
    localByUser.set(
      userId,
      current.filter((item) => item.workoutId !== workoutId),
    );
  };

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) {
    persistLocal();
    return {};
  }

  const { error } = await supabase.from(TABLE).delete().eq('user_id', userId).eq('workout_id', workoutId);

  if (error) {
    persistLocal();
    return {
      warning: isMissingTableError(error)
        ? 'Quitado en este dispositivo. Ejecuta npm run supabase:saved-metcons para sincronizar.'
        : error.message,
    };
  }

  return {};
}
