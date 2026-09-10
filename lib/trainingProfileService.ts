import { readPersistedRecord, writePersistedRecord } from '@/lib/localUserDataStorage';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { TrainingProfile } from '@/lib/types';

const TABLE = 'user_training_profile';
const LOCAL_STORAGE_KEY = 'user-training-profile-v1';

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

async function localProfile(userId: string) {
  if (!localByUser.has(userId)) {
    const persisted = await readPersistedRecord<TrainingProfileInput>(LOCAL_STORAGE_KEY);
    localByUser.set(userId, persisted[userId] ?? emptyTrainingProfile);
  }
  return localByUser.get(userId) ?? emptyTrainingProfile;
}

async function persistLocalProfile(userId: string, profile: TrainingProfileInput) {
  localByUser.set(userId, profile);
  const all = await readPersistedRecord<TrainingProfileInput>(LOCAL_STORAGE_KEY);
  all[userId] = profile;
  await writePersistedRecord(LOCAL_STORAGE_KEY, all);
}

export async function fetchTrainingProfile(userId: string): Promise<TrainingProfileInput> {
  if (!userId) return emptyTrainingProfile;

  const local = await localProfile(userId);
  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return local;

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      'training_days_per_week, preferred_training_days, session_duration_minutes, training_notes',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return local;

  const remote = mapRow(data as Record<string, unknown>);
  await persistLocalProfile(userId, remote);
  return remote;
}

export async function saveTrainingProfile(
  userId: string,
  profile: TrainingProfileInput,
): Promise<{ error?: string; warning?: string }> {
  if (!userId) return { error: 'No hay sesión activa' };

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) {
    await persistLocalProfile(userId, profile);
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
    await persistLocalProfile(userId, profile);
    if (isMissingTableError(error)) {
      return {
        warning:
          'Guardado en este dispositivo. Ejecuta npm run supabase:nutrition-training-profile para sincronizar con tu perfil.',
      };
    }
    return { error: error.message };
  }

  await persistLocalProfile(userId, profile);
  return {};
}
