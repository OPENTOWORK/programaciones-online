import type { Exercise, Workout } from '@/lib/types';
import {
  defaultScheduleForSession,
  parseScheduleFromWorkout,
  type SessionSchedule,
} from '@/lib/sessionSchedule';
import { normalizeExerciseName } from '@/lib/exerciseName';
import { parseExerciseLinesFromText } from '@/lib/exerciseTextParser';
import {
  createEmptyBlock,
  createEmptyBlockItem,
  sanitizeWorkoutBlock,
  serializeWorkoutBlocks,
} from '@/lib/workoutBlockBuilder';

/** Una activación es la sesión corta que acompaña al entreno del mismo día. */
export type SessionKind = 'session' | 'activation' | 'rest';

export const ACTIVATION_SESSION_NAME = 'Activación';
export const REST_DAY_SESSION_NAME = 'Día de descanso';

const ACTIVATION_DEFAULT_DURATION = '15 min';

export type SessionDraft = {
  name: string;
  estimatedDuration: string;
  warmup: string;
  main: string;
  metcon: string;
  core: string;
  cooldown: string;
  exercises: Exercise[];
  dayLabel: string;
  schedule: SessionSchedule;
  /** Sin valor equivale a una sesión normal. */
  kind?: SessionKind;
  /** Posición dentro del día cuando ese día tiene varias sesiones. Sin valor, la activación va arriba. */
  dayOrder?: number;
};

/** Orden por defecto de un día: la activación encabeza el día si nadie ha reordenado. */
export function defaultDayOrder(draft: Pick<SessionDraft, 'kind' | 'dayOrder'>) {
  return draft.dayOrder ?? (draft.kind === 'activation' || draft.kind === 'rest' ? 0 : 1);
}

export function isActivationSessionDraft(draft: Pick<SessionDraft, 'kind'>) {
  return draft.kind === 'activation';
}

export function isRestDaySessionDraft(draft: Pick<SessionDraft, 'kind'>) {
  return draft.kind === 'rest';
}

/** Una copia de sesión pasa a llevar el número siguiente, pero una activación mantiene su nombre. */
export function renameSessionCopy(draft: SessionDraft, sessionNumber: number): SessionDraft {
  if (isActivationSessionDraft(draft)) return draft;
  return { ...draft, name: `Sesión ${sessionNumber}` };
}

/** Marca un día como descanso, sin bloques de entrenamiento. */
export function createRestDayDraft(sessionIndex = 0): SessionDraft {
  return {
    ...createEmptySessionDraft(sessionIndex),
    kind: 'rest',
    name: REST_DAY_SESSION_NAME,
    estimatedDuration: 'Descanso',
    warmup: '',
    main: '',
    metcon: '',
    core: '',
    cooldown: '',
    exercises: [],
  };
}

/** Hereda el calendario de su sesión y nace sin bloques para rellenarla más tarde. */
export function sessionKindFromWorkoutName(name: string): SessionKind | undefined {
  const trimmed = name.trim();
  if (trimmed === ACTIVATION_SESSION_NAME) return 'activation';
  if (trimmed === REST_DAY_SESSION_NAME) return 'rest';
  return undefined;
}

export function createActivationDraftFor(session: SessionDraft): SessionDraft {
  return {
    ...session,
    kind: 'activation',
    name: ACTIVATION_SESSION_NAME,
    estimatedDuration: ACTIVATION_DEFAULT_DURATION,
    warmup: '',
    main: '',
    metcon: '',
    core: '',
    cooldown: '',
    exercises: [],
  };
}

export function createEmptyExercise(): Exercise {
  return {
    id: `draft-ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: '',
    sets: 3,
    reps: '10',
    rest: '60s',
    metricType: 'reps',
    maleTarget: '',
    femaleTarget: '',
  };
}

export function createEmptySessionDraft(sessionIndex: number): SessionDraft {
  const label = `Sesión ${sessionIndex + 1}`;
  return {
    dayLabel: label,
    name: label,
    estimatedDuration: '60 min',
    warmup: '',
    main: '',
    metcon: '',
    core: '',
    cooldown: '',
    exercises: [],
    schedule: defaultScheduleForSession(sessionIndex),
  };
}

function exerciseNamesAlreadyInContent(...texts: string[]) {
  const names = new Set<string>();
  for (const text of texts) {
    for (const line of parseExerciseLinesFromText(text)) {
      names.add(normalizeExerciseName(line.name));
    }
  }
  return names;
}

function serializeExercisesAsStrengthBlock(exercises: Exercise[]) {
  const block = sanitizeWorkoutBlock({
    ...createEmptyBlock('free_training'),
    title: 'Fuerza',
    items: exercises.map((exercise) => ({
      ...createEmptyBlockItem(),
      text: exercise.name,
      sets: String(exercise.sets),
      reps: exercise.reps,
      aimharderEjerId: exercise.aimharderEjerId,
      youtubeVideoId: exercise.youtubeVideoId,
    })),
  });
  return serializeWorkoutBlocks([block]);
}

export function workoutToSessionDraft(workout: Workout, sessionIndex = 0): SessionDraft {
  const exercises = workout.exercises.map((exercise) => ({ ...exercise }));
  let main = workout.main;

  if (exercises.length > 0) {
    const existingNames = exerciseNamesAlreadyInContent(
      workout.warmup,
      workout.main,
      workout.core ?? '',
      workout.cooldown,
    );
    const toMigrate = exercises.filter(
      (exercise) => !existingNames.has(normalizeExerciseName(exercise.name)),
    );
    if (toMigrate.length > 0) {
      const blockText = serializeExercisesAsStrengthBlock(toMigrate);
      main = [main.trim(), blockText].filter(Boolean).join('\n\n');
    }
  }

  return {
    dayLabel: workout.dayLabel,
    name: workout.name,
    estimatedDuration: workout.estimatedDuration,
    warmup: workout.warmup,
    main,
    metcon: '',
    core: workout.core ?? '',
    cooldown: workout.cooldown,
    exercises: [],
    schedule: parseScheduleFromWorkout(workout, sessionIndex),
    dayOrder: workout.schedule?.dayOrder,
    kind: sessionKindFromWorkoutName(workout.name),
  };
}
