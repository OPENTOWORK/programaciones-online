import { mockPrograms, mockWorkouts } from '@/lib/mockData';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Exercise, Program, Workout } from '@/lib/types';
import {
  formatScheduleSummary,
  serializeScheduleForDb,
  type SessionSchedule,
} from '@/lib/sessionSchedule';
import { isMissingScheduleConfigError } from '@/lib/scheduleConfigColumn';

export interface ProgramCatalogUpdate {
  name: string;
  description?: string;
}

export interface ProgramCatalogCreate {
  planId: string;
  name: string;
  description?: string;
  category: Program['category'];
}

export interface WorkoutCatalogUpdate {
  name: string;
  dayLabel: string;
  estimatedDuration: string;
  warmup: string;
  main: string;
  core?: string;
  cooldown: string;
  exercises: Exercise[];
  schedule: SessionSchedule;
}

export interface WorkoutCatalogCreate {
  programId: string;
  name: string;
  dayLabel: string;
  sortIndex: number;
  estimatedDuration: string;
  warmup: string;
  main: string;
  core?: string;
  cooldown: string;
  exercises: Exercise[];
  schedule: SessionSchedule;
}

function createDemoId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function templateWorkoutDate(sortIndex: number) {
  const date = new Date(Date.UTC(2000, 0, 3 + sortIndex));
  return date.toISOString().slice(0, 10);
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

function exerciseToRow(exercise: Exercise) {
  return {
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    rest: exercise.rest,
    notes: exercise.notes ?? null,
    metric_type: exercise.metricType ?? 'reps',
    male_target: exercise.maleTarget?.trim() || null,
    female_target: exercise.femaleTarget?.trim() || null,
  };
}

function mapSavedExercise(savedExercise: Record<string, unknown>): Exercise {
  return {
    id: savedExercise.id as string,
    name: savedExercise.name as string,
    sets: savedExercise.sets as number,
    reps: savedExercise.reps as string,
    rest: (savedExercise.rest as string | null) ?? '—',
    notes: (savedExercise.notes as string | null) ?? undefined,
    metricType: (savedExercise.metric_type as Exercise['metricType']) ?? 'reps',
    maleTarget: (savedExercise.male_target as string | null) ?? undefined,
    femaleTarget: (savedExercise.female_target as string | null) ?? undefined,
  };
}

const EXERCISE_SELECT = 'id, name, sets, reps, rest, notes, metric_type, male_target, female_target';

async function insertEntrenoRow(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  row: Record<string, unknown>,
  schedulePayload: ReturnType<typeof serializeScheduleForDb>,
) {
  const withSchedule = await supabase
    .from('entrenos_diarios')
    .insert({ ...row, schedule_config: schedulePayload })
    .select('id')
    .single();

  if (!withSchedule.error) return withSchedule;
  if (!isMissingScheduleConfigError(withSchedule.error.message)) return withSchedule;

  return supabase.from('entrenos_diarios').insert(row).select('id').single();
}

async function updateEntrenoRow(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  workoutId: string,
  row: Record<string, unknown>,
  schedulePayload: ReturnType<typeof serializeScheduleForDb>,
) {
  const withSchedule = await supabase
    .from('entrenos_diarios')
    .update({ ...row, schedule_config: schedulePayload })
    .eq('id', workoutId)
    .select('id')
    .maybeSingle();

  if (!withSchedule.error) return withSchedule;
  if (!isMissingScheduleConfigError(withSchedule.error.message)) return withSchedule;

  return supabase.from('entrenos_diarios').update(row).eq('id', workoutId).select('id').maybeSingle();
}

export function getDemoCatalog() {
  return { programs: demoPrograms, workouts: demoWorkouts };
}

export async function createProgramCatalog(
  input: ProgramCatalogCreate,
): Promise<{ program?: Program; error?: string }> {
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    return { error: 'El nombre de la programación es obligatorio' };
  }

  if (!input.planId) {
    return { error: 'Falta el plan asociado' };
  }

  if (!isSupabaseConfigured) {
    const program: Program = {
      id: createDemoId('prog'),
      name: trimmedName,
      planId: input.planId,
      category: input.category,
      level: input.category === 'standard' ? 'principiante' : 'intermedio',
      duration: '8 semanas',
      goal: 'fuerza',
      sessionsPerWeek: 3,
      status: 'disponible',
      icon: 'programs',
      description: input.description?.trim() || 'Programación creada por el entrenador.',
      equipment: [],
      trainingDays: [],
      weeks: [],
    };

    demoPrograms = [program, ...demoPrograms];
    return { program };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const { data, error } = await supabase
    .from('programas')
    .insert({
      name: trimmedName,
      id_planes: input.planId,
      descripcion: input.description?.trim() || '',
    })
    .select('id, name, id_planes, descripcion')
    .single();

  if (error || !data) return { error: error?.message ?? 'No se pudo crear la programación' };

  return {
    program: {
      id: data.id,
      name: data.name,
      planId: data.id_planes,
      category: input.category,
      level: input.category === 'standard' ? 'principiante' : 'intermedio',
      duration: 'Por definir',
      goal: 'fuerza',
      sessionsPerWeek: 3,
      status: 'disponible',
      icon: 'programs',
      description: data.descripcion?.trim() || input.description?.trim() || 'Programación creada por el entrenador.',
      equipment: [],
      trainingDays: [],
      weeks: [],
    },
  };
}

export async function createWorkoutCatalog(
  input: WorkoutCatalogCreate,
): Promise<{ workout?: Workout; error?: string }> {
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    return { error: 'El nombre de la sesión es obligatorio' };
  }

  const workoutDate = templateWorkoutDate(input.sortIndex);
  const dayLabel = formatScheduleSummary(input.schedule);
  const schedulePayload = serializeScheduleForDb(input.schedule);

  if (!isSupabaseConfigured) {
    const workout: Workout = {
      id: createDemoId('workout'),
      programId: input.programId,
      weekNumber: 1,
      dayLabel,
      name: trimmedName,
      estimatedDuration: input.estimatedDuration.trim() || '60 min',
      warmup: input.warmup,
      main: input.main,
      core: input.core,
      cooldown: input.cooldown,
      exercises: input.exercises.map((exercise) => ({ ...exercise })),
      workoutDate,
      schedule: input.schedule,
    };

    demoWorkouts = [...demoWorkouts, workout];
    return { workout };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const syntheticRateId = -Math.abs(Date.now() + input.sortIndex);

  const entrenoRow = {
    program_id: input.programId,
    workout_date: workoutDate,
    aimharder_rate_id: syntheticRateId,
    name: trimmedName,
    day_label: dayLabel,
    estimated_duration: input.estimatedDuration.trim() || null,
    warmup: input.warmup,
    main_part: input.main,
    core_part: input.core ?? '',
    cooldown: input.cooldown,
  };

  const { data: entreno, error: entrenoError } = await insertEntrenoRow(supabase, entrenoRow, schedulePayload);

  if (entrenoError || !entreno) {
    return { error: entrenoError?.message ?? 'No se pudo crear la sesión' };
  }

  const savedExercises: Exercise[] = [];

  for (const [sortOrder, exercise] of input.exercises.entries()) {
    const { data: savedExercise, error: exerciseError } = await supabase
      .from('entrenos_ejercicios')
      .insert({
        entreno_id: entreno.id,
        sort_order: sortOrder,
        ...exerciseToRow(exercise),
      })
      .select(EXERCISE_SELECT)
      .single();

    if (exerciseError || !savedExercise) {
      return { error: exerciseError?.message ?? 'No se pudieron guardar los ejercicios' };
    }

    savedExercises.push(mapSavedExercise(savedExercise as Record<string, unknown>));
  }

  return {
    workout: {
      id: entreno.id,
      programId: input.programId,
      weekNumber: 1,
      dayLabel,
      name: trimmedName,
      estimatedDuration: input.estimatedDuration.trim() || '60 min',
      warmup: input.warmup,
      main: input.main,
      core: input.core,
      cooldown: input.cooldown,
      exercises: savedExercises,
      workoutDate,
      schedule: input.schedule,
    },
  };
}

function isDraftExerciseId(exerciseId: string) {
  return exerciseId.startsWith('draft-ex-');
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

  const { data, error } = await supabase
    .from('programas')
    .update({
      name: trimmedName,
      descripcion: update.description?.trim() || '',
    })
    .eq('id', programId)
    .select('id')
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) {
    return {
      error:
        'No se pudo guardar la programación. Comprueba que tu usuario tenga rol de entrenador en Supabase.',
    };
  }

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

  const dayLabel = formatScheduleSummary(update.schedule);
  const schedulePayload = serializeScheduleForDb(update.schedule);

  if (!isSupabaseConfigured) {
    const index = demoWorkouts.findIndex((workout) => workout.id === workoutId);
    if (index === -1) return { error: 'Sesión no encontrada' };

    demoWorkouts[index] = {
      ...demoWorkouts[index],
      name: trimmedName,
      dayLabel,
      estimatedDuration: update.estimatedDuration.trim() || demoWorkouts[index].estimatedDuration,
      warmup: update.warmup,
      main: update.main,
      core: update.core,
      cooldown: update.cooldown,
      exercises: update.exercises.map((exercise) => ({ ...exercise })),
      schedule: update.schedule,
    };
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const entrenoRow = {
    name: trimmedName,
    day_label: dayLabel,
    estimated_duration: update.estimatedDuration.trim() || null,
    warmup: update.warmup,
    main_part: update.main,
    core_part: update.core ?? '',
    cooldown: update.cooldown,
  };

  const { data: entrenoData, error: workoutError } = await updateEntrenoRow(
    supabase,
    workoutId,
    entrenoRow,
    schedulePayload,
  );

  if (workoutError) return { error: workoutError.message };
  if (!entrenoData) {
    return { error: 'No se pudo guardar la sesión. Revisa tus permisos de entrenador.' };
  }

  for (const [sortOrder, exercise] of update.exercises.entries()) {
    if (isDraftExerciseId(exercise.id)) {
      const { error: insertError } = await supabase.from('entrenos_ejercicios').insert({
        entreno_id: workoutId,
        sort_order: sortOrder,
        ...exerciseToRow(exercise),
      });

      if (insertError) return { error: insertError.message };
      continue;
    }

    const { data: exerciseData, error: exerciseError } = await supabase
      .from('entrenos_ejercicios')
      .update({
        sort_order: sortOrder,
        ...exerciseToRow(exercise),
      })
      .eq('id', exercise.id)
      .select('id')
      .maybeSingle();

    if (exerciseError) return { error: exerciseError.message };
    if (!exerciseData) {
      const { error: insertError } = await supabase.from('entrenos_ejercicios').insert({
        entreno_id: workoutId,
        sort_order: sortOrder,
        ...exerciseToRow(exercise),
      });

      if (insertError) return { error: insertError.message };
    }
  }

  return {};
}

export async function deleteWorkoutCatalog(workoutId: string): Promise<{ error?: string }> {
  if (!workoutId) {
    return { error: 'Sesión no encontrada' };
  }

  if (!isSupabaseConfigured) {
    const index = demoWorkouts.findIndex((workout) => workout.id === workoutId);
    if (index === -1) return { error: 'Sesión no encontrada' };

    demoWorkouts = demoWorkouts.filter((workout) => workout.id !== workoutId);
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const { data, error } = await supabase
    .from('entrenos_diarios')
    .delete()
    .eq('id', workoutId)
    .select('id')
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) {
    return { error: 'No se pudo eliminar la sesión. Revisa tus permisos de entrenador.' };
  }

  return {};
}
