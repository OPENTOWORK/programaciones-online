import type { Exercise, ExerciseMetricType } from '@/lib/types';

export const EXERCISE_METRIC_LABELS: Record<ExerciseMetricType, string> = {
  reps: 'Solo reps',
  rir: 'RIR',
  cal: 'cal',
  lbs: 'lbs',
};

export function formatExercisePrescription(exercise: Exercise): string {
  const hasStrengthSets = exercise.sets > 0 && exercise.reps && exercise.reps !== '—';
  const base =
    exercise.metricType === 'cal'
      ? `${exercise.sets} series`
      : hasStrengthSets
        ? `${exercise.sets} × ${exercise.reps}`
        : exercise.reps;

  const metricType = exercise.metricType ?? 'reps';
  if (metricType === 'reps') {
    return exercise.notes ? `${base} · ${exercise.notes}` : base;
  }

  const unit = EXERCISE_METRIC_LABELS[metricType];
  const male = exercise.maleTarget?.trim();
  const female = exercise.femaleTarget?.trim();
  const targets = [
    male ? `♂ ${male} ${unit}` : null,
    female ? `♀ ${female} ${unit}` : null,
  ].filter(Boolean);

  const prescription = targets.length > 0 ? `${base} · ${targets.join(' · ')}` : base;
  return exercise.notes ? `${prescription} · ${exercise.notes}` : prescription;
}

export function guessMetricTypeFromName(name: string): ExerciseMetricType {
  const normalized = name.toLowerCase();
  if (/\(cal\)|calorie|row|bike|ski|assault/i.test(normalized)) return 'cal';
  if (/snatch|clean|jerk|squat|deadlift|press|bench|thruster/i.test(normalized)) return 'lbs';
  if (/rir|reserva/i.test(normalized)) return 'rir';
  return 'reps';
}
