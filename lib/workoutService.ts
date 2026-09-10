import { isAnnualTemplateDate, isWeekdayDate, toAnnualTemplateDate } from '@/lib/annualProgramSchedule';
import type { Exercise, Workout } from '@/lib/types';
import { isMissingScheduleConfigError } from '@/lib/scheduleConfigColumn';
import { parseScheduleFromJson } from '@/lib/sessionSchedule';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const ENTRENO_FIELDS =
  'id, program_id, workout_date, name, day_label, estimated_duration, warmup, main_part, core_part, cooldown';
const ENTRENO_EXERCISES =
  'entrenos_ejercicios(id, sort_order, name, sets, reps, rest, notes, metric_type, male_target, female_target, aimharder_ejer_id)';

function entrenoSelect(includeScheduleConfig: boolean) {
  if (includeScheduleConfig) {
    return `${ENTRENO_FIELDS}, schedule_config, ${ENTRENO_EXERCISES}`;
  }
  return `${ENTRENO_FIELDS}, ${ENTRENO_EXERCISES}`;
}

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
  schedule_config?: unknown;
  entrenos_ejercicios: Array<{
    id: string;
    sort_order: number;
    name: string;
    sets: number;
    reps: string;
    rest: string | null;
    notes: string | null;
    metric_type: string | null;
    male_target: string | null;
    female_target: string | null;
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
        metricType: (exercise.metric_type as Exercise['metricType']) ?? 'reps',
        maleTarget: exercise.male_target ?? undefined,
        femaleTarget: exercise.female_target ?? undefined,
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
    schedule: row.schedule_config ? parseScheduleFromJson(row.schedule_config) ?? undefined : undefined,
  };
}

async function queryEntrenos<T extends { data: unknown; error: { message: string } | null }>(
  run: (select: string) => Promise<T>,
) {
  const withSchedule = await run(entrenoSelect(true));
  if (!withSchedule.error) return withSchedule;
  if (!isMissingScheduleConfigError(withSchedule.error.message)) return withSchedule;
  return run(entrenoSelect(false));
}

export async function fetchWorkoutsByProgram(programId: string): Promise<Workout[]> {
  return fetchWorkoutsWithExercisesByProgram(programId);
}

export interface WorkoutStub {
  id: string;
  programId: string;
  name: string;
  dayLabel: string;
  estimatedDuration: string;
  workoutDate?: string;
}

export function stubToWorkout(stub: WorkoutStub): Workout {
  return {
    id: stub.id,
    programId: stub.programId,
    weekNumber: 1,
    dayLabel: stub.dayLabel,
    name: stub.name,
    estimatedDuration: stub.estimatedDuration,
    warmup: '',
    main: '',
    cooldown: '',
    exercises: [],
    workoutDate: stub.workoutDate,
  };
}

/** Consulta ligera sin ejercicios anidados — mucho más rápida para resúmenes. */
export async function fetchWorkoutStubsByPrograms(programIds: string[]): Promise<Map<string, WorkoutStub[]>> {
  const uniqueIds = [...new Set(programIds.filter(Boolean))];
  const result = new Map<string, WorkoutStub[]>();
  if (!isSupabaseConfigured || uniqueIds.length === 0) {
    return result;
  }

  const supabase = getSupabase();
  if (!supabase) return result;

  const { data, error } = await supabase
    .from('entrenos_diarios')
    .select('id, program_id, name, day_label, estimated_duration, workout_date')
    .in('program_id', uniqueIds)
    .order('workout_date', { ascending: true });

  if (error || !data) return result;

  for (const row of data) {
    const list = result.get(row.program_id) ?? [];
    list.push({
      id: row.id,
      programId: row.program_id,
      name: row.name,
      dayLabel: row.day_label ?? row.workout_date,
      estimatedDuration: row.estimated_duration ?? '60 min',
      workoutDate: row.workout_date,
    });
    result.set(row.program_id, list);
  }

  return result;
}

async function fetchWorkoutsWithExercisesByProgram(programId: string): Promise<Workout[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await queryEntrenos((select) =>
      supabase
        .from('entrenos_diarios')
        .select(select)
        .eq('program_id', programId)
        .order('workout_date', { ascending: true }),
    );

    if (error || !Array.isArray(data)) return [];

    return data.map((row) => mapEntreno(row as EntrenoRow));
  } catch {
    return [];
  }
}

export async function fetchWorkoutsByIds(workoutIds: string[]): Promise<Workout[]> {
  const uniqueIds = [...new Set(workoutIds.filter(Boolean))];
  if (!isSupabaseConfigured || uniqueIds.length === 0) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await queryEntrenos((select) =>
      supabase.from('entrenos_diarios').select(select).in('id', uniqueIds),
    );

    if (error || !data) return [];
    return (data as EntrenoRow[]).map((row) => mapEntreno(row));
  } catch {
    return [];
  }
}

export async function fetchWorkoutById(workoutId: string): Promise<Workout | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await queryEntrenos((select) =>
      supabase.from('entrenos_diarios').select(select).eq('id', workoutId).maybeSingle(),
    );

    if (error || !data) return null;

    return mapEntreno(data as EntrenoRow);
  } catch {
    return null;
  }
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

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const annualKey = toAnnualTemplateDate(today);

  const lookupDates = isWeekdayDate(today)
    ? todayKey === annualKey
      ? [todayKey]
      : [todayKey, annualKey]
    : [todayKey];

  for (const workoutDate of lookupDates) {
    const { data, error } = await queryEntrenos((select) =>
      supabase
        .from('entrenos_diarios')
        .select(select)
        .eq('program_id', programId)
        .eq('workout_date', workoutDate)
        .maybeSingle(),
    );

    if (!error && data) {
      return mapEntreno(data as EntrenoRow);
    }
  }

  return null;
}

export function resolveAnnualWorkoutForDate(workouts: Workout[], date: Date): Workout | null {
  if (!isWeekdayDate(date)) return null;

  const annualKey = toAnnualTemplateDate(date);
  const exact = workouts.find((workout) => workout.workoutDate === annualKey);
  if (exact) return exact;

  return (
    workouts.find((workout) => {
      if (!workout.workoutDate || isAnnualTemplateDate(workout.workoutDate)) return false;
      return workout.workoutDate.slice(5) === annualKey.slice(5);
    }) ?? null
  );
}
