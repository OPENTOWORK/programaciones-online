import {
  isActivityLevel,
  isBiologicalSex,
  isPrimaryGoal,
  type PhysicalProfileBasics,
} from '@/lib/bodyMetrics';
import { readPersistedRecord, writePersistedRecord } from '@/lib/localUserDataStorage';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const TABLE = 'user_physical_profile';
const LOCAL_STORAGE_KEY = 'user-physical-profile-v1';

/**
 * La altura sigue viviendo en `"Perfil".altura` para no duplicar columnas: se guarda
 * con el resto del perfil y se une a estos datos en el hook.
 */
export type PhysicalProfileInput = Omit<PhysicalProfileBasics, 'heightCm'>;

const localByUser = new Map<string, PhysicalProfileInput>();

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('user_physical_profile') ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapRow(row: Record<string, unknown>): PhysicalProfileInput {
  return {
    birthDate: (row.birth_date as string | null) ?? undefined,
    biologicalSex: isBiologicalSex(row.biological_sex) ? row.biological_sex : undefined,
    activityLevel: isActivityLevel(row.activity_level) ? row.activity_level : undefined,
    primaryGoal: isPrimaryGoal(row.primary_goal) ? row.primary_goal : undefined,
    targetWeightKg: parseOptionalNumber(row.target_weight_kg),
  };
}

async function localProfile(userId: string) {
  if (!localByUser.has(userId)) {
    const persisted = await readPersistedRecord<PhysicalProfileInput>(LOCAL_STORAGE_KEY);
    localByUser.set(userId, persisted[userId] ?? {});
  }
  return localByUser.get(userId) ?? {};
}

async function persistLocalProfile(userId: string, input: PhysicalProfileInput) {
  localByUser.set(userId, input);
  const all = await readPersistedRecord<PhysicalProfileInput>(LOCAL_STORAGE_KEY);
  all[userId] = input;
  await writePersistedRecord(LOCAL_STORAGE_KEY, all);
}

export async function fetchPhysicalProfile(userId: string): Promise<PhysicalProfileInput> {
  if (!userId) return {};

  const local = await localProfile(userId);
  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return local;

  const { data, error } = await supabase
    .from(TABLE)
    .select('birth_date, biological_sex, activity_level, primary_goal, target_weight_kg')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return local;

  const remote = mapRow(data as Record<string, unknown>);
  await persistLocalProfile(userId, remote);
  return remote;
}

export async function savePhysicalProfile(
  userId: string,
  input: PhysicalProfileInput,
): Promise<{ error?: string; warning?: string }> {
  if (!userId) return { error: 'No hay sesión activa' };

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) {
    await persistLocalProfile(userId, input);
    return {};
  }

  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      birth_date: input.birthDate ?? null,
      biological_sex: input.biologicalSex ?? null,
      activity_level: input.activityLevel ?? null,
      primary_goal: input.primaryGoal ?? null,
      target_weight_kg: input.targetWeightKg ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    await persistLocalProfile(userId, input);
    if (isMissingTableError(error)) {
      return {
        warning:
          'Guardado en este dispositivo. Ejecuta npm run supabase:physical-profile para sincronizar con tu perfil.',
      };
    }
    return { error: error.message };
  }

  await persistLocalProfile(userId, input);
  return {};
}
