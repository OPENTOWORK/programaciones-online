import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { TrainingProfile } from '@/lib/types';

const TABLE = 'user_training_profile';

/**
 * La experiencia y las lesiones no se guardan aquí: reutilizan `"Perfil".nivel` y
 * `"Perfil".lesiones`, que ya alimentan la ficha que ve el entrenador.
 */
export type TrainingProfileInput = Omit<TrainingProfile, 'trainingExperience' | 'injuriesOrLimitations'>;

const localByUser = new Map<string, TrainingProfileInput>();

export const emptyTrainingProfile: TrainingProfileInput = {
  preferredTrainingDays: [],
};

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('user_training_profile') ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function mapRow(row: Record<string, unknown>): TrainingProfileInput {
  return {
    trainingDaysPerWeek:
      typeof row.training_days_per_week === 'number' ? row.training_days_per_week : undefined,
    preferredTrainingDays: Array.isArray(row.preferred_training_days)
      ? row.preferred_training_days.filter((item): item is string => typeof item === 'string')
      : [],
    sessionDurationMinutes:
      typeof row.session_duration_minutes === 'number' ? row.session_duration_minutes : undefined,
    trainingNotes: (row.training_notes as string | null) ?? undefined,
  };
}

export async function fetchTrainingProfile(userId: string): Promise<TrainingProfileInput> {
  if (!userId) return emptyTrainingProfile;

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return localByUser.get(userId) ?? emptyTrainingProfile;

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      'training_days_per_week, preferred_training_days, session_duration_minutes, training_notes',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return localByUser.get(userId) ?? emptyTrainingProfile;

  return mapRow(data as Record<string, unknown>);
}

export async function saveTrainingProfile(
  userId: string,
  profile: TrainingProfileInput,
): Promise<{ error?: string }> {
  if (!userId) return { error: 'No hay sesión activa' };

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) {
    localByUser.set(userId, profile);
    return {};
  }

  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      training_days_per_week: profile.trainingDaysPerWeek ?? null,
      preferred_training_days: profile.preferredTrainingDays,
      session_duration_minutes: profile.sessionDurationMinutes ?? null,
      training_notes: profile.trainingNotes?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    localByUser.set(userId, profile);
    if (isMissingTableError(error)) {
      return {
        error:
          'La tabla de datos de entrenamiento no está disponible. Ejecuta: npm run supabase:nutrition-training-profile',
      };
    }
    return { error: error.message };
  }

  return {};
}
