import type { Workout } from '@/lib/types';

function hasWorkoutContent(workout: Workout) {
  if (workout.schedule?.kind === 'pdf' || workout.schedule?.pdfStoragePath) return true;

  return Boolean(
    workout.warmup?.trim() ||
      workout.main?.trim() ||
      workout.core?.trim() ||
      workout.cooldown?.trim() ||
      workout.exercises.length > 0,
  );
}

function isRestDayWorkout(workout: Workout) {
  if (workout.schedule?.kind === 'rest') return true;
  const name = workout.name.trim().toLowerCase();
  return /descanso|rest day/.test(name);
}

/** Elige una sesión representativa para mostrar como ejemplo de catálogo. */
export function pickCatalogExampleWorkout(workouts: Workout[]): Workout | null {
  const candidates = workouts
    .filter((workout) => !isRestDayWorkout(workout) && hasWorkoutContent(workout))
    .sort((left, right) => {
      const leftDate = left.workoutDate ?? '';
      const rightDate = right.workoutDate ?? '';
      if (leftDate && rightDate && leftDate !== rightDate) {
        return leftDate.localeCompare(rightDate);
      }
      return left.name.localeCompare(right.name, 'es');
    });

  return candidates[0] ?? null;
}
