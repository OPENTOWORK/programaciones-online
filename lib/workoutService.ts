import type { Exercise, Workout } from '@/lib/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface EntrenoRow {
  id: string;
  program_id: string;
  workout_date: string;
  name: string;
  day_label: string | null;
  estimated_duration: string | null;
  warmup: string | null;
  main_part: string | null;
  core_part: string | null;
  cooldown: string | null;
  entrenos_ejercicios: Array<{
    id: string;
    sort_order: number;
    name: string;
    sets: number;
    reps: string;
    rest: string | null;
    notes: string | null;
    aimharder_ejer_id: number | null;
  }> | null;
}

function mapEntreno(row: EntrenoRow): Workout {
  const exercises = (row.entrenos_ejercicios ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(
      (exercise): Exercise => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest ?? '—',
        notes: exercise.notes ?? undefined,
        aimharderEjerId: exercise.aimharder_ejer_id ?? undefined,
      }),
    );

  return {
    id: row.id,
    programId: row.program_id,
    weekNumber: 1,
    dayLabel: row.day_label ?? row.workout_date,
    name: row.name,
    estimatedDuration: row.estimated_duration ?? '60 min',
    warmup: row.warmup ?? '',
    main: row.main_part ?? '',
    core: row.core_part ?? undefined,
    cooldown: row.cooldown ?? '',
    exercises,
    workoutDate: row.workout_date,
  };
}

export async function fetchWorkoutsByProgram(programId: string): Promise<Workout[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('entrenos_diarios')
    .select(
      'id, program_id, workout_date, name, day_label, estimated_duration, warmup, main_part, core_part, cooldown, entrenos_ejercicios(id, sort_order, name, sets, reps, rest, notes, aimharder_ejer_id)',
    )
    .eq('program_id', programId)
    .order('workout_date', { ascending: true });

  if (error || !data) return [];

  return data.map((row) => mapEntreno(row as EntrenoRow));
}

export async function fetchWorkoutById(workoutId: string): Promise<Workout | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('entrenos_diarios')
    .select(
      'id, program_id, workout_date, name, day_label, estimated_duration, warmup, main_part, core_part, cooldown, entrenos_ejercicios(id, sort_order, name, sets, reps, rest, notes, aimharder_ejer_id)',
    )
    .eq('id', workoutId)
    .maybeSingle();

  if (error || !data) return null;

  return mapEntreno(data as EntrenoRow);
}

export async function logWorkoutCompletion(
  userId: string,
  workout: Workout,
  completedExercises: number,
  totalExercises: number,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const duration =
    totalExercises > 0
      ? `${completedExercises}/${totalExercises} ejercicios`
      : workout.estimatedDuration;

  const { error } = await supabase.from('workout_logs').insert({
    user_id: userId,
    workout_id: null,
    entreno_id: workout.id,
    workout_name: workout.name,
    duration,
  });

  if (error) {
    const message = error.message.toLowerCase().includes('workout_logs')
      ? 'La tabla workout_logs no está disponible. Ejecuta: npm run supabase:workout-logs'
      : error.message;
    return { error: message };
  }
  return {};
}

export async function fetchTodayWorkoutForProgram(programId: string): Promise<Workout | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('entrenos_diarios')
    .select(
      'id, program_id, workout_date, name, day_label, estimated_duration, warmup, main_part, core_part, cooldown, entrenos_ejercicios(id, sort_order, name, sets, reps, rest, notes, aimharder_ejer_id)',
    )
    .eq('program_id', programId)
    .eq('workout_date', today)
    .maybeSingle();

  if (error || !data) return null;

  return mapEntreno(data as EntrenoRow);
}
