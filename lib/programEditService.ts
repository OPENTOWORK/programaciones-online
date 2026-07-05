import { mockPrograms, mockWorkouts } from '@/lib/mockData';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Exercise, Program, Workout } from '@/lib/types';

export interface ProgramCatalogUpdate {
  name: string;
  description?: string;
}

export interface WorkoutCatalogUpdate {
  name: string;
  estimatedDuration: string;
  warmup: string;
  main: string;
  core?: string;
  cooldown: string;
  exercises: Exercise[];
}

function clonePrograms(programs: Program[]) {
  return programs.map((program) => ({ ...program, weeks: program.weeks.map((week) => ({ ...week })) }));
}

function cloneWorkouts(workouts: Workout[]) {
  return workouts.map((workout) => ({
    ...workout,
    exercises: workout.exercises.map((exercise) => ({ ...exercise })),
  }));
}

let demoPrograms = clonePrograms(mockPrograms);
let demoWorkouts = cloneWorkouts(mockWorkouts);

export function getDemoCatalog() {
  return { programs: demoPrograms, workouts: demoWorkouts };
}

export async function updateProgramCatalog(
  programId: string,
  update: ProgramCatalogUpdate,
): Promise<{ error?: string }> {
  const trimmedName = update.name.trim();
  if (!trimmedName) {
    return { error: 'El nombre de la programación es obligatorio' };
  }

  if (!isSupabaseConfigured) {
    const index = demoPrograms.findIndex((program) => program.id === programId);
    if (index === -1) return { error: 'Programación no encontrada' };

    demoPrograms[index] = {
      ...demoPrograms[index],
      name: trimmedName,
      description: update.description?.trim() || demoPrograms[index].description,
    };
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const { error } = await supabase.from('programas').update({ name: trimmedName }).eq('id', programId);
  if (error) return { error: error.message };

  return {};
}

export async function updateWorkoutCatalog(
  workoutId: string,
  update: WorkoutCatalogUpdate,
): Promise<{ error?: string }> {
  const trimmedName = update.name.trim();
  if (!trimmedName) {
    return { error: 'El nombre de la sesión es obligatorio' };
  }

  if (!isSupabaseConfigured) {
    const index = demoWorkouts.findIndex((workout) => workout.id === workoutId);
    if (index === -1) return { error: 'Sesión no encontrada' };

    demoWorkouts[index] = {
      ...demoWorkouts[index],
      name: trimmedName,
      estimatedDuration: update.estimatedDuration.trim() || demoWorkouts[index].estimatedDuration,
      warmup: update.warmup,
      main: update.main,
      core: update.core,
      cooldown: update.cooldown,
      exercises: update.exercises.map((exercise) => ({ ...exercise })),
    };
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const { error: workoutError } = await supabase
    .from('entrenos_diarios')
    .update({
      name: trimmedName,
      estimated_duration: update.estimatedDuration.trim() || null,
      warmup: update.warmup,
      main_part: update.main,
      core_part: update.core ?? '',
      cooldown: update.cooldown,
    })
    .eq('id', workoutId);

  if (workoutError) return { error: workoutError.message };

  for (const [sortOrder, exercise] of update.exercises.entries()) {
    const { error: exerciseError } = await supabase
      .from('entrenos_ejercicios')
      .update({
        sort_order: sortOrder,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        notes: exercise.notes ?? null,
      })
      .eq('id', exercise.id);

    if (exerciseError) return { error: exerciseError.message };
  }

  return {};
}
