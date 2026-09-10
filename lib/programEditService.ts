import {
  HYPE_WEEKLY_CHALLENGE,
  isHypeWeeklyChallengePlaceholder,
  isHypeWeeklyChallengeProgram,
} from '@/lib/hypeCatalog';
import { mockPrograms, mockWorkouts } from '@/lib/mockData';
import {
  formatStandardVenueDescription,
  getVenuePlaceholderSlot,
  isVenuePlaceholderProgram,
  namesMatchCatalog,
  parseStandardVenueFromDescription,
  STANDARD_VENUE_PRICES,
  type StandardVenueProgramSlot,
} from '@/lib/standardVenueCatalog';
import type { StandardVenueId } from '@/lib/standardVenues';
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

export async function ensureVenueCatalogProgram(
  placeholder: Program,
): Promise<{ program?: Program; error?: string }> {
  if (!isVenuePlaceholderProgram(placeholder)) {
    return { program: placeholder };
  }

  if (!placeholder.planId) {
    return { error: 'Falta el plan asociado' };
  }

  const slotInfo = getVenuePlaceholderSlot(placeholder.id);
  if (!slotInfo) {
    return { error: 'No se pudo identificar la programación de este espacio' };
  }

  const { venue, slot } = slotInfo;

  // Reutiliza la programación real si ya existe (evita duplicados vacíos).
  const existing = await findExistingVenueCatalogProgram(placeholder.planId, slot, venue);
  if (existing.program) return { program: existing.program };
  if (existing.error) return { error: existing.error };

  return createProgramCatalog({
    planId: placeholder.planId,
    name: slot.name,
    description: formatStandardVenueDescription(slot.description, venue),
    category: 'standard',
  });
}

export async function ensureHypeWeeklyChallengeProgram(
  placeholder: Program,
): Promise<{ program?: Program; error?: string }> {
  if (!isHypeWeeklyChallengePlaceholder(placeholder)) {
    return { program: placeholder };
  }

  if (!placeholder.planId) {
    return { error: 'Falta el plan asociado' };
  }

  const existing = await findExistingHypeWeeklyChallengeProgram(placeholder.planId);
  if (existing.program) return { program: existing.program };
  if (existing.error) return { error: existing.error };

  return createProgramCatalog({
    planId: placeholder.planId,
    name: HYPE_WEEKLY_CHALLENGE.name,
    description: HYPE_WEEKLY_CHALLENGE.description,
    category: 'hype',
  });
}

async function findExistingHypeWeeklyChallengeProgram(
  planId: string,
): Promise<{ program?: Program; error?: string }> {
  if (!isSupabaseConfigured) {
    const match = demoPrograms.find(
      (program) => program.planId === planId && isHypeWeeklyChallengeProgram(program),
    );
    return match ? { program: match } : {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const { data, error } = await supabase
    .from('programas')
    .select('id, name, id_planes, descripcion')
    .eq('id_planes', planId);

  if (error) return { error: error.message };
  if (!data?.length) return {};

  const match = data.find((row) => isHypeWeeklyChallengeProgram({ category: 'hype', name: row.name }));
  if (!match) return {};

  return {
    program: {
      id: match.id,
      name: HYPE_WEEKLY_CHALLENGE.name,
      planId: match.id_planes,
      category: 'hype',
      level: 'intermedio',
      duration: 'Por definir',
      goal: 'rendimiento',
      sessionsPerWeek: 1,
      status: 'disponible',
      icon: HYPE_WEEKLY_CHALLENGE.icon,
      description: HYPE_WEEKLY_CHALLENGE.description,
      equipment: HYPE_WEEKLY_CHALLENGE.equipment,
      trainingDays: [],
      weeks: [],
    },
  };
}

async function findExistingVenueCatalogProgram(
  planId: string,
  slot: StandardVenueProgramSlot,
  venue: StandardVenueId,
): Promise<{ program?: Program; error?: string }> {
  if (!isSupabaseConfigured) {
    const match = demoPrograms.find(
      (program) =>
        program.planId === planId &&
        program.standardVenue === venue &&
        namesMatchCatalog(program.name, slot.matchNames),
    );
    return match ? { program: match } : {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const { data, error } = await supabase
    .from('programas')
    .select('id, name, id_planes, descripcion')
    .eq('id_planes', planId);

  if (error) return { error: error.message };
  if (!data?.length) return {};

  const candidates = data.filter((row) => {
    const parsed = parseStandardVenueFromDescription(row.descripcion);
    const sameVenue = parsed.venue === venue || (!parsed.venue && venue === 'gym');
    return sameVenue && namesMatchCatalog(row.name, slot.matchNames);
  });
  if (!candidates.length) return {};

  // Preferir la que ya tenga sesiones si hay varias con el mismo nombre.
  let best = candidates[0];
  let bestCount = -1;
  for (const row of candidates) {
    const { count } = await supabase
      .from('entrenos_diarios')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', row.id);
    const n = count ?? 0;
    if (n > bestCount) {
      best = row;
      bestCount = n;
    }
  }

  const rawDescription = best.descripcion?.trim() || '';
  const { venue: parsedVenue, description: cleanedDescription } =
    parseStandardVenueFromDescription(rawDescription);

  return {
    program: {
      id: best.id,
      name: slot.name,
      planId: best.id_planes,
      category: 'standard',
      level: 'principiante',
      duration: 'Por definir',
      goal: undefined,
      sessionsPerWeek: 3,
      status: 'disponible',
      icon: slot.icon,
      description: slot.description,
      equipment: slot.equipment,
      catalogPrice: STANDARD_VENUE_PRICES[slot.priceTier],
      catalogNameTag: slot.nameTag,
      trainingDays: [],
      weeks: [],
      standardVenue: parsedVenue ?? venue,
    },
  };
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
    const description = input.description?.trim() || 'Programación creada por el entrenador.';
    const { venue, description: cleanedDescription } = parseStandardVenueFromDescription(description);
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
      description: cleanedDescription,
      equipment: [],
      trainingDays: [],
      weeks: [],
      standardVenue: venue ?? (input.category === 'standard' ? 'gym' : undefined),
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

  const rawDescription = data.descripcion?.trim() || input.description?.trim() || 'Programación creada por el entrenador.';
  const { venue, description: cleanedDescription } = parseStandardVenueFromDescription(rawDescription);

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
      description: cleanedDescription,
      equipment: [],
      trainingDays: [],
      weeks: [],
      standardVenue: venue ?? (input.category === 'standard' ? 'gym' : undefined),
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

  const { data: existingExercises, error: existingExercisesError } = await supabase
    .from('entrenos_ejercicios')
    .select('id')
    .eq('entreno_id', workoutId)
    .order('sort_order');

  if (existingExercisesError) return { error: existingExercisesError.message };

  for (const [sortOrder, exercise] of update.exercises.entries()) {
    const row = {
      sort_order: sortOrder,
      ...exerciseToRow(exercise),
    };
    const existingId = existingExercises?.[sortOrder]?.id;

    if (existingId) {
      const { error: exerciseError } = await supabase
        .from('entrenos_ejercicios')
        .update(row)
        .eq('id', existingId);

      if (exerciseError) return { error: exerciseError.message };
      continue;
    }

    const { error: insertError } = await supabase.from('entrenos_ejercicios').insert({
      entreno_id: workoutId,
      ...row,
    });

    if (insertError) return { error: insertError.message };
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
