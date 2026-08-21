import { WEEKDAY_OPTIONS } from '@/lib/sessionSchedule';
import type { DietaryPreference, FitnessLevel } from '@/lib/types';

export const dietaryPreferenceLabels: Record<DietaryPreference, string> = {
  omnivora: 'Omnívora',
  vegetariana: 'Vegetariana',
  vegana: 'Vegana',
  pescetariana: 'Pescetariana',
  otra: 'Otra',
};

export const DIETARY_PREFERENCE_OPTIONS: DietaryPreference[] = [
  'omnivora',
  'vegetariana',
  'vegana',
  'pescetariana',
  'otra',
];

export const trainingExperienceLabels: Record<FitnessLevel, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export const TRAINING_EXPERIENCE_OPTIONS: FitnessLevel[] = ['principiante', 'intermedio', 'avanzado'];

/** Días de la semana con el mismo etiquetado que los calendarios de programación. */
export const TRAINING_DAY_OPTIONS = WEEKDAY_OPTIONS.map((option) => option.label);

/** Convierte una lista de texto separada por comas en etiquetas limpias y sin duplicados. */
export function parseCommaList(value: string): string[] {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(items));
}
