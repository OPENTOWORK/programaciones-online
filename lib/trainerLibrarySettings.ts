import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const PROFILE_TABLE = 'trainer_professional_profile';

export interface ExerciseLibraryAccess {
  trainerId: string | null;
  athletesCanSeePageLibrary: boolean;
}

const DEFAULT_ACCESS: ExerciseLibraryAccess = {
  trainerId: null,
  athletesCanSeePageLibrary: true,
};

function isMissingRpcError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('could not find the function') ||
    message.includes('schema cache') ||
    error.code === 'PGRST202'
  );
}

function isMissingColumnError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return message.includes('athletes_can_see_page_library') || error.code === '42703';
}

function mapAccessRow(
  trainerId: string | null | undefined,
  athletesCanSeePageLibrary: unknown,
): ExerciseLibraryAccess {
  return {
    trainerId: trainerId?.trim() || null,
    athletesCanSeePageLibrary:
      typeof athletesCanSeePageLibrary === 'boolean' ? athletesCanSeePageLibrary : true,
  };
}

export async function fetchExerciseLibraryAccess(): Promise<ExerciseLibraryAccess> {
  if (!isSupabaseConfigured) return DEFAULT_ACCESS;

  const supabase = getSupabase();
  if (!supabase) return DEFAULT_ACCESS;

  const { data, error } = await supabase.rpc('get_my_exercise_library_access');
  if (!error && data && typeof data === 'object') {
    const payload = data as Record<string, unknown>;
    return mapAccessRow(
      payload.trainer_id as string | null | undefined,
      payload.athletes_can_see_page_library,
    );
  }

  if (!isMissingRpcError(error)) {
    return DEFAULT_ACCESS;
  }

  return DEFAULT_ACCESS;
}

export async function saveTrainerLibraryPageVisibility(
  trainerId: string,
  athletesCanSeePageLibrary: boolean,
): Promise<{ error?: string }> {
  if (!trainerId) return { error: 'Entrenador no válido.' };

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(PROFILE_TABLE).upsert(
    {
      user_id: trainerId,
      athletes_can_see_page_library: athletesCanSeePageLibrary,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (isMissingColumnError(error)) {
    return {
      error: 'Falta la migración: ejecuta npm run supabase:trainer-library-settings',
    };
  }

  if (error) return { error: error.message };
  return {};
}
