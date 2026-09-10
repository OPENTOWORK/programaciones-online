/**
 * Dominio de datos físicos. Distingue tres orígenes:
 * - `PhysicalProfileBasics`: datos estables que declara el usuario (fecha de nacimiento, sexo, altura…).
 * - `MeasuredBodyMetrics`: mediciones puntuales (manuales, báscula inteligente, wearable o profesional).
 * - `DerivedBodyMetrics`: valores que calcula la app y por tanto nunca se guardan como histórico.
 *
 * Ninguna función de este módulo estima mediciones que no existan: si faltan datos devuelve `undefined`.
 */

export type BiologicalSex = 'male' | 'female' | 'not_specified';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type PrimaryGoal =
  | 'lose_fat'
  | 'maintain_weight'
  | 'gain_muscle'
  | 'improve_performance'
  | 'improve_health';

export type MeasurementSource = 'manual' | 'smart_scale' | 'wearable' | 'professional';

/** Falta el dato medido. */
export const NOT_INDICATED = 'No indicado';
/** El dato es calculado pero faltan variables para obtenerlo. */
export const NOT_AVAILABLE = 'No disponible';

export interface PhysicalProfileBasics {
  /** ISO `yyyy-mm-dd`. La edad se calcula siempre a partir de aquí. */
  birthDate?: string;
  biologicalSex?: BiologicalSex;
  heightCm?: number;
  activityLevel?: ActivityLevel;
  primaryGoal?: PrimaryGoal;
  targetWeightKg?: number;
}

export interface MeasuredBodyMetrics {
  weightKg?: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  bodyWaterPercentage?: number;
  visceralFat?: number;
  boneMassKg?: number;
  waistCm?: number;
  restingHeartRate?: number;
  /** Solo si lo aporta una báscula o wearable: la app nunca la calcula. */
  metabolicAge?: number;
}

export interface BodyMeasurement extends MeasuredBodyMetrics {
  id: string;
  userId: string;
  measuredAt: string;
  source: MeasurementSource;
}

export interface DerivedBodyMetrics {
  age?: number;
  bmi?: number;
  bmiCategory?: string;
  fatMassKg?: number;
  leanBodyMassKg?: number;
  bmrKcal?: number;
  estimatedDailyExpenditureKcal?: number;
}

export const biologicalSexLabels: Record<BiologicalSex, string> = {
  male: 'Hombre',
  female: 'Mujer',
  not_specified: 'Prefiero no indicarlo',
};

export const BIOLOGICAL_SEX_OPTIONS: BiologicalSex[] = ['male', 'female', 'not_specified'];

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

export const activityLevelLabels: Record<ActivityLevel, string> = {
  sedentary: 'Sedentario',
  lightly_active: 'Actividad ligera',
  moderately_active: 'Actividad moderada',
  very_active: 'Muy activo',
  extremely_active: 'Extremadamente activo',
};

export const activityLevelHints: Record<ActivityLevel, string> = {
  sedentary: 'Sin ejercicio o trabajo de oficina',
  lightly_active: '1-3 entrenos por semana',
  moderately_active: '3-5 entrenos por semana',
  very_active: '6-7 entrenos por semana',
  extremely_active: 'Doble sesión o trabajo físico intenso',
};

export const ACTIVITY_LEVEL_OPTIONS: ActivityLevel[] = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extremely_active',
];

export const primaryGoalLabels: Record<PrimaryGoal, string> = {
  lose_fat: 'Perder grasa',
  maintain_weight: 'Mantener peso',
  gain_muscle: 'Ganar masa muscular',
  improve_performance: 'Mejorar rendimiento',
  improve_health: 'Mejorar salud',
};

export const PRIMARY_GOAL_OPTIONS: PrimaryGoal[] = [
  'lose_fat',
  'maintain_weight',
  'gain_muscle',
  'improve_performance',
  'improve_health',
];

export const measurementSourceLabels: Record<MeasurementSource, string> = {
  manual: 'Introducido manualmente',
  smart_scale: 'Báscula inteligente',
  wearable: 'Wearable',
  professional: 'Medición profesional',
};

export function isBiologicalSex(value: unknown): value is BiologicalSex {
  return value === 'male' || value === 'female' || value === 'not_specified';
}

export function isActivityLevel(value: unknown): value is ActivityLevel {
  return typeof value === 'string' && value in ACTIVITY_FACTORS;
}

export function isPrimaryGoal(value: unknown): value is PrimaryGoal {
  return typeof value === 'string' && value in primaryGoalLabels;
}

export function isMeasurementSource(value: unknown): value is MeasurementSource {
  return typeof value === 'string' && value in measurementSourceLabels;
}

/** Edad en años cumplidos a día de hoy. */
export function calculateAge(birthDate?: string, today: Date = new Date()): number | undefined {
  if (!birthDate) return undefined;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return undefined;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const hasHadBirthdayThisYear = monthDiff > 0 || (monthDiff === 0 && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;

  return age >= 0 && age < 130 ? age : undefined;
}

/** Muestra la fecha de nacimiento como `dd/mm/aaaa` a partir del ISO guardado. */
export function formatBirthDateInput(isoDate?: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return '';
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

/** Acepta `dd/mm/aaaa` o `aaaa-mm-dd` y devuelve el ISO `yyyy-mm-dd`. */
export function parseBirthDateInput(value: string): { iso?: string; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return {};

  const slashed = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  const isoLike = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  let year: number;
  let month: number;
  let day: number;

  if (slashed) {
    day = Number(slashed[1]);
    month = Number(slashed[2]);
    year = Number(slashed[3]);
  } else if (isoLike) {
    year = Number(isoLike[1]);
    month = Number(isoLike[2]);
    day = Number(isoLike[3]);
  } else {
    return { error: 'Introduce la fecha de nacimiento como dd/mm/aaaa' };
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!isRealDate) return { error: 'Esa fecha de nacimiento no existe' };

  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const age = calculateAge(iso);
  if (age === undefined || age < 5 || age > 120) {
    return { error: 'Introduce una fecha de nacimiento válida' };
  }

  return { iso };
}

export function calculateBmi(heightCm?: number, weightKg?: number): number | undefined {
  if (!heightCm || !weightKg || heightCm < 80 || weightKg < 20) return undefined;
  const meters = heightCm / 100;
  return Math.round((weightKg / (meters * meters)) * 10) / 10;
}

/** Clasificación OMS, únicamente informativa. */
export function bmiCategory(bmi?: number): string | undefined {
  if (!bmi) return undefined;
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}

export function calculateFatMass(weightKg?: number, bodyFatPercentage?: number): number | undefined {
  if (!weightKg || !bodyFatPercentage) return undefined;
  return Math.round(weightKg * (bodyFatPercentage / 100) * 10) / 10;
}

/**
 * Masa libre de grasa: músculo, hueso, órganos y agua.
 * No es equivalente a la masa muscular medida por una báscula.
 */
export function calculateLeanBodyMass(weightKg?: number, bodyFatPercentage?: number): number | undefined {
  if (!weightKg || !bodyFatPercentage) return undefined;
  return Math.round(weightKg * (1 - bodyFatPercentage / 100) * 10) / 10;
}

/** Mifflin-St Jeor. Requiere sexo biológico concreto, así que `not_specified` no obtiene resultado. */
export function calculateBmr(input: {
  weightKg?: number;
  heightCm?: number;
  age?: number;
  biologicalSex?: BiologicalSex;
}): number | undefined {
  const { weightKg, heightCm, age, biologicalSex } = input;
  if (!weightKg || !heightCm || age === undefined) return undefined;
  if (biologicalSex !== 'male' && biologicalSex !== 'female') return undefined;

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(biologicalSex === 'male' ? base + 5 : base - 161);
}

export function calculateTdee(bmrKcal?: number, activityLevel?: ActivityLevel): number | undefined {
  if (!bmrKcal || !activityLevel) return undefined;
  return Math.round(bmrKcal * ACTIVITY_FACTORS[activityLevel]);
}

export function deriveBodyMetrics(
  basics: PhysicalProfileBasics,
  measured: MeasuredBodyMetrics,
  today?: Date,
): DerivedBodyMetrics {
  const age = calculateAge(basics.birthDate, today);
  const bmi = calculateBmi(basics.heightCm, measured.weightKg);
  const bmrKcal = calculateBmr({
    weightKg: measured.weightKg,
    heightCm: basics.heightCm,
    age,
    biologicalSex: basics.biologicalSex,
  });

  return {
    age,
    bmi,
    bmiCategory: bmiCategory(bmi),
    fatMassKg: calculateFatMass(measured.weightKg, measured.bodyFatPercentage),
    leanBodyMassKg: calculateLeanBodyMass(measured.weightKg, measured.bodyFatPercentage),
    bmrKcal,
    estimatedDailyExpenditureKcal: calculateTdee(bmrKcal, basics.activityLevel),
  };
}

/** Muestra un dato medido: si no existe, deja claro que nadie lo ha indicado. */
export function formatMeasured(value: number | undefined, suffix = '') {
  if (value === undefined || value === null || Number.isNaN(value)) return NOT_INDICATED;
  return `${value}${suffix}`;
}

/** Muestra un dato calculado: si faltan variables no se inventa un valor. */
export function formatDerived(value: number | undefined, suffix = '', decimals = 1) {
  if (value === undefined || value === null || Number.isNaN(value)) return NOT_AVAILABLE;
  return `${value.toFixed(decimals)}${suffix}`;
}

export function formatKcal(value: number | undefined) {
  if (value === undefined || value === null || Number.isNaN(value)) return NOT_AVAILABLE;
  return `${Math.round(value).toLocaleString('es-ES')} kcal`;
}

export function formatBmi(bmi: number | undefined) {
  if (!bmi) return NOT_AVAILABLE;
  const category = bmiCategory(bmi);
  return `${bmi.toFixed(1)}${category ? ` · ${category}` : ''}`;
}

export function parseMetricInput(value: string): number | undefined {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseIntegerInput(value: string): number | undefined {
  const parsed = parseMetricInput(value);
  return parsed === undefined ? undefined : Math.round(parsed);
}

export function hasAnyMeasuredValue(metrics: MeasuredBodyMetrics) {
  return Object.values(metrics).some((value) => typeof value === 'number' && Number.isFinite(value));
}

/** Métricas del histórico que tienen sentido en un gráfico de evolución. */
export type BodyMetricChartKey =
  | 'weightKg'
  | 'bodyFatPercentage'
  | 'muscleMassKg'
  | 'bodyWaterPercentage';

export const BODY_METRIC_CHART_OPTIONS: Array<{
  id: BodyMetricChartKey;
  label: string;
  unit: string;
}> = [
  { id: 'weightKg', label: 'Peso', unit: 'kg' },
  { id: 'bodyFatPercentage', label: 'Grasa', unit: '%' },
  { id: 'muscleMassKg', label: 'Músculo', unit: 'kg' },
  { id: 'bodyWaterPercentage', label: 'Agua', unit: '%' },
];
