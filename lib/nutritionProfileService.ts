import { readPersistedRecord, writePersistedRecord } from '@/lib/localUserDataStorage';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { DietaryPreference, NutritionProfile } from '@/lib/types';

const TABLE = 'user_nutrition_profile';
const LOCAL_STORAGE_KEY = 'user-nutrition-profile-v1';

const localByUser = new Map<string, NutritionProfile>();

export const emptyNutritionProfile: NutritionProfile = {
  foodAllergies: [],
  foodIntolerances: [],
  excludedFoods: [],
};

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('user_nutrition_profile') ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function mapStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function mapDietaryPreference(value: unknown): DietaryPreference | undefined {
  const options: DietaryPreference[] = ['omnivora', 'vegetariana', 'vegana', 'pescetariana', 'otra'];
  return options.find((option) => option === value);
}

function mapRow(row: Record<string, unknown>): NutritionProfile {
  return {
    dietaryPreference: mapDietaryPreference(row.dietary_preference),
    foodAllergies: mapStringArray(row.food_allergies),
    foodIntolerances: mapStringArray(row.food_intolerances),
    excludedFoods: mapStringArray(row.excluded_foods),
    mealsPerDay: typeof row.meals_per_day === 'number' ? row.meals_per_day : undefined,
    nutritionNotes: (row.nutrition_notes as string | null) ?? undefined,
  };
}

async function localProfile(userId: string) {
  if (!localByUser.has(userId)) {
    const persisted = await readPersistedRecord<NutritionProfile>(LOCAL_STORAGE_KEY);
    localByUser.set(userId, persisted[userId] ?? emptyNutritionProfile);
  }
  return localByUser.get(userId) ?? emptyNutritionProfile;
}

async function persistLocalProfile(userId: string, profile: NutritionProfile) {
  localByUser.set(userId, profile);
  const all = await readPersistedRecord<NutritionProfile>(LOCAL_STORAGE_KEY);
  all[userId] = profile;
  await writePersistedRecord(LOCAL_STORAGE_KEY, all);
}

export async function fetchNutritionProfile(userId: string): Promise<NutritionProfile> {
  if (!userId) return emptyNutritionProfile;

  const local = await localProfile(userId);
  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return local;

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      'dietary_preference, food_allergies, food_intolerances, excluded_foods, meals_per_day, nutrition_notes',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return local;

  const remote = mapRow(data as Record<string, unknown>);
  await persistLocalProfile(userId, remote);
  return remote;
}

export async function saveNutritionProfile(
  userId: string,
  profile: NutritionProfile,
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
      dietary_preference: profile.dietaryPreference ?? null,
      food_allergies: profile.foodAllergies,
      food_intolerances: profile.foodIntolerances,
      excluded_foods: profile.excludedFoods,
      meals_per_day: profile.mealsPerDay ?? null,
      nutrition_notes: profile.nutritionNotes?.trim() || null,
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
