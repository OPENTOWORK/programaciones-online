import {
  hasAnyMeasuredValue,
  isMeasurementSource,
  type BodyMeasurement,
  type MeasuredBodyMetrics,
  type MeasurementSource,
} from '@/lib/bodyMetrics';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const TABLE = 'body_measurements';

/** Fallback en memoria para modo demo o cuando la tabla todavía no existe. */
const localByUser = new Map<string, BodyMeasurement[]>();

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('body_measurements') ||
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

function mapRow(row: Record<string, unknown>): BodyMeasurement {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    measuredAt: String(row.measured_at ?? new Date().toISOString()),
    weightKg: parseOptionalNumber(row.weight_kg),
    bodyFatPercentage: parseOptionalNumber(row.body_fat_percentage),
    muscleMassKg: parseOptionalNumber(row.muscle_mass_kg),
    bodyWaterPercentage: parseOptionalNumber(row.body_water_percentage),
    visceralFat: parseOptionalNumber(row.visceral_fat),
    boneMassKg: parseOptionalNumber(row.bone_mass_kg),
    waistCm: parseOptionalNumber(row.waist_cm),
    restingHeartRate: parseOptionalNumber(row.resting_heart_rate),
    metabolicAge: parseOptionalNumber(row.metabolic_age),
    source: isMeasurementSource(row.source) ? row.source : 'manual',
  };
}

function sortByDate(entries: BodyMeasurement[]) {
  return [...entries].sort((left, right) => left.measuredAt.localeCompare(right.measuredAt));
}

function localHistory(userId: string) {
  return sortByDate(localByUser.get(userId) ?? []);
}

export async function fetchBodyMeasurements(userId: string): Promise<BodyMeasurement[]> {
  if (!userId) return [];

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return localHistory(userId);

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      'id, user_id, measured_at, weight_kg, body_fat_percentage, muscle_mass_kg, body_water_percentage, visceral_fat, bone_mass_kg, waist_cm, resting_heart_rate, metabolic_age, source',
    )
    .eq('user_id', userId)
    .order('measured_at', { ascending: true });

  if (error) return localHistory(userId);

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export function latestBodyMeasurement(entries: BodyMeasurement[]): BodyMeasurement | undefined {
  return entries[entries.length - 1];
}

/**
 * Guarda una medición puntual. Solo persiste valores medidos: los derivados (IMC, masa grasa,
 * masa libre de grasa, metabolismo basal) se recalculan siempre a partir de estos datos.
 */
export async function recordBodyMeasurement(
  userId: string,
  metrics: MeasuredBodyMetrics,
  source: MeasurementSource = 'manual',
): Promise<{ error?: string; measurement?: BodyMeasurement }> {
  if (!userId || !hasAnyMeasuredValue(metrics)) return {};

  const measurement: BodyMeasurement = {
    id: `local-${Date.now()}`,
    userId,
    measuredAt: new Date().toISOString(),
    source,
    ...metrics,
  };

  const persistLocal = () => {
    localByUser.set(userId, [...(localByUser.get(userId) ?? []), measurement]);
  };

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) {
    persistLocal();
    return { measurement };
  }

  const payload = {
    user_id: userId,
    measured_at: measurement.measuredAt,
    weight_kg: metrics.weightKg ?? null,
    body_fat_percentage: metrics.bodyFatPercentage ?? null,
    muscle_mass_kg: metrics.muscleMassKg ?? null,
    body_water_percentage: metrics.bodyWaterPercentage ?? null,
    visceral_fat: metrics.visceralFat ?? null,
    bone_mass_kg: metrics.boneMassKg ?? null,
    waist_cm: metrics.waistCm ?? null,
    resting_heart_rate: metrics.restingHeartRate ?? null,
    metabolic_age: metrics.metabolicAge ?? null,
    source,
  };

  const { data, error } = await supabase.from(TABLE).insert(payload).select('id').maybeSingle();

  if (error) {
    persistLocal();
    if (isMissingTableError(error)) return { measurement };
    return { error: error.message, measurement };
  }

  return {
    measurement: { ...measurement, id: data?.id ? String(data.id) : measurement.id },
  };
}
