import { normalizeExerciseName } from '@/lib/exerciseName';

export type RepMaxUnit = 'kg' | 'sec' | 'percent_rm';

export interface AthleteRepMax {
  id: string;
  userId: string;
  exerciseName: string;
  value: number;
  unit: RepMaxUnit;
  reps: number;
  recordedAt: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepMaxExerciseGroup {
  key: string;
  name: string;
  latest: AthleteRepMax;
  history: AthleteRepMax[];
}

export const SUGGESTED_RM_LIFTS = [
  'Sentadilla',
  'Press banca',
  'Peso muerto',
  'Press militar',
  'Hip thrust',
  'Dominadas',
] as const;

export const REP_MAX_UNITS: Array<{ id: RepMaxUnit; label: string; placeholder: string }> = [
  { id: 'kg', label: 'kg', placeholder: 'kg' },
  { id: 'sec', label: 'seg', placeholder: 'seg' },
  { id: 'percent_rm', label: '%RM', placeholder: '%RM' },
];

export function isRepMaxUnit(value: unknown): value is RepMaxUnit {
  return value === 'kg' || value === 'sec' || value === 'percent_rm';
}

export function getRepMaxUnitMeta(unit: RepMaxUnit) {
  return REP_MAX_UNITS.find((item) => item.id === unit) ?? REP_MAX_UNITS[0];
}

/** Epley: 1RM = peso × (1 + reps / 30). Con 1 rep el máximo es el propio peso. */
export function estimateOneRepMax(weightKg: number, reps: number) {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function formatRmValue(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

export function formatRepMaxLoad(entry: Pick<AthleteRepMax, 'value' | 'unit' | 'reps'>) {
  const amount = formatRmValue(entry.value);
  const unitLabel = getRepMaxUnitMeta(entry.unit).label;
  const load = `${amount} ${unitLabel}`;

  if (entry.unit === 'kg') {
    if (entry.reps <= 1) return `${load} · 1RM`;
    return `${load} × ${entry.reps} · est. ${formatRmValue(estimateOneRepMax(entry.value, entry.reps))} kg`;
  }

  if (entry.reps <= 1) return load;
  return `${load} × ${entry.reps}`;
}

export function formatRepMaxDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function todayDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function groupRepMaxesByExercise(entries: AthleteRepMax[]): RepMaxExerciseGroup[] {
  const groups = new Map<string, AthleteRepMax[]>();

  for (const entry of entries) {
    const nameKey = normalizeExerciseName(entry.exerciseName);
    if (!nameKey) continue;
    const key = `${nameKey}:${entry.unit}`;
    const current = groups.get(key) ?? [];
    current.push(entry);
    groups.set(key, current);
  }

  return [...groups.values()]
    .map((records) => {
      const sorted = [...records].sort((left, right) => {
        const byDate = right.recordedAt.localeCompare(left.recordedAt);
        if (byDate !== 0) return byDate;
        return right.createdAt.localeCompare(left.createdAt);
      });
      return {
        key: `${normalizeExerciseName(sorted[0].exerciseName)}:${sorted[0].unit}`,
        name: sorted[0].exerciseName,
        latest: sorted[0],
        history: sorted.slice(1),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, 'es', { sensitivity: 'base' }));
}
