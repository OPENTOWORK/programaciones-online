import {
  isActivityLevel,
  isBiologicalSex,
  isPrimaryGoal,
  type PhysicalProfileBasics,
} from '@/lib/bodyMetrics';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const TABLE = 'user_physical_profile';

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

export async function fetchPhysicalProfile(userId: string): Promise<PhysicalProfileInput> {
  if (!userId) return {};

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return localByUser.get(userId) ?? {};

  const { data, error } = await supabase
    .from(TABLE)
    .select('birth_date, biological_sex, activity_level, primary_goal, target_weight_kg')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return localByUser.get(userId) ?? {};

  return mapRow(data as Record<string, unknown>);
}

export async function savePhysicalProfile(
  userId: string,
  input: PhysicalProfileInput,
): Promise<{ error?: string }> {
  if (!userId) return { error: 'No hay sesión activa' };

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) {
    localByUser.set(userId, input);
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
    localByUser.set(userId, input);
    if (isMissingTableError(error)) {
      return {
        error: 'La tabla de datos físicos no está disponible. Ejecuta: npm run supabase:physical-profile',
      };
    }
    return { error: error.message };
  }

  return {};
}
