import {
  hasAnyMeasuredValue,
  isMeasurementSource,
  type BodyMeasurement,
  type MeasuredBodyMetrics,
  type MeasurementSource,
} from '@/lib/bodyMetrics';
import { readPersistedRecord, writePersistedRecord } from '@/lib/localUserDataStorage';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const TABLE = 'body_measurements';
const LOCAL_STORAGE_KEY = 'body-measurements-v1';

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

async function localHistory(userId: string) {
  if (!localByUser.has(userId)) {
    const persisted = await readPersistedRecord<BodyMeasurement[]>(LOCAL_STORAGE_KEY);
    localByUser.set(userId, sortByDate(persisted[userId] ?? []));
  }
  return localByUser.get(userId) ?? [];
}

async function persistLocalHistory(userId: string, entries: BodyMeasurement[]) {
  const sorted = sortByDate(entries);
  localByUser.set(userId, sorted);
  const all = await readPersistedRecord<BodyMeasurement[]>(LOCAL_STORAGE_KEY);
  all[userId] = sorted;
  await writePersistedRecord(LOCAL_STORAGE_KEY, all);
}

function mergeMeasurements(remote: BodyMeasurement[], local: BodyMeasurement[]) {
  const merged = new Map<string, BodyMeasurement>();
  for (const entry of remote) merged.set(entry.id, entry);
  for (const entry of local) {
    if (!merged.has(entry.id)) merged.set(entry.id, entry);
  }
  return sortByDate([...merged.values()]);
}

export async function fetchBodyMeasurements(userId: string): Promise<BodyMeasurement[]> {
  if (!userId) return [];

  const local = await localHistory(userId);
  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return local;

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      'id, user_id, measured_at, weight_kg, body_fat_percentage, muscle_mass_kg, body_water_percentage, visceral_fat, bone_mass_kg, waist_cm, resting_heart_rate, metabolic_age, source',
    )
    .eq('user_id', userId)
    .order('measured_at', { ascending: true });

  if (error) return local;

  const remote = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  const merged = mergeMeasurements(remote, local);
  await persistLocalHistory(userId, merged);
  return merged;
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
): Promise<{ error?: string; warning?: string; measurement?: BodyMeasurement }> {
  if (!userId || !hasAnyMeasuredValue(metrics)) return {};

  const measurement: BodyMeasurement = {
    id: `local-${Date.now()}`,
    userId,
    measuredAt: new Date().toISOString(),
    source,
    ...metrics,
  };

  const persistLocal = async (saved: BodyMeasurement) => {
    const current = await localHistory(userId);
    await persistLocalHistory(userId, [...current, saved]);
  };

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) {
    await persistLocal(measurement);
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
    await persistLocal(measurement);
    if (isMissingTableError(error)) {
      return {
        measurement,
        warning:
          'Mediciones guardadas en este dispositivo. Ejecuta npm run supabase:physical-profile para sincronizar.',
      };
    }
    return { error: error.message, measurement };
  }

  const saved = { ...measurement, id: data?.id ? String(data.id) : measurement.id };
  await persistLocal(saved);
  return { measurement: saved };
}
