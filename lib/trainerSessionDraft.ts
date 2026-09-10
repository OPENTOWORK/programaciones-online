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

/** Tipos de sesión del calendario: normal, activación, metcon, descanso o PDF. */
export type SessionKind = 'session' | 'activation' | 'metcon' | 'rest' | 'pdf';

export const ACTIVATION_SESSION_NAME = 'Activación';
export const METCON_SESSION_NAME = 'Metcon';
export const REST_DAY_SESSION_NAME = 'Día de descanso';

const ACTIVATION_DEFAULT_DURATION = '15 min';
const METCON_DEFAULT_DURATION = '20 min';

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

/** Orden por defecto: activación → sesión → metcon. */
export function defaultDayOrder(draft: Pick<SessionDraft, 'kind' | 'dayOrder'>) {
  if (draft.dayOrder != null) return draft.dayOrder;
  if (draft.kind === 'activation' || draft.kind === 'rest') return 0;
  if (draft.kind === 'metcon') return 2;
  return 1;
}

export function isActivationSessionDraft(draft: Pick<SessionDraft, 'kind'>) {
  return draft.kind === 'activation';
}

export function isMetconSessionDraft(draft: Pick<SessionDraft, 'kind'>) {
  return draft.kind === 'metcon';
}

export function isRestDaySessionDraft(draft: Pick<SessionDraft, 'kind'>) {
  return draft.kind === 'rest';
}

export function isPdfSessionDraft(draft: Pick<SessionDraft, 'kind' | 'schedule'>) {
  return draft.kind === 'pdf' || draft.schedule.kind === 'pdf';
}

/** Etiqueta de duración de una sesión que solo lleva PDF. */
export const PDF_SESSION_DURATION = 'PDF';

/** Nombre de sesión a partir del nombre del archivo, sin la extensión. */
export function pdfSessionTitle(fileName: string) {
  return fileName.replace(/\.pdf$/i, '').trim() || 'PDF';
}

/** Una copia de sesión pasa a llevar el número siguiente; activación y metcon mantienen nombre. */
export function renameSessionCopy(draft: SessionDraft, sessionNumber: number): SessionDraft {
  if (isActivationSessionDraft(draft) || isMetconSessionDraft(draft)) return draft;
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

/** Crea un borrador vacío de activación con el calendario de referencia. */
export function sessionKindFromWorkoutName(name: string): SessionKind | undefined {
  const trimmed = name.trim();
  if (trimmed === ACTIVATION_SESSION_NAME) return 'activation';
  if (trimmed.toLowerCase() === METCON_SESSION_NAME.toLowerCase()) return 'metcon';
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
    schedule: {
      ...session.schedule,
      kind: 'activation',
    },
  };
}

export function createMetconDraftFor(session: SessionDraft): SessionDraft {
  return {
    ...session,
    kind: 'metcon',
    name: METCON_SESSION_NAME,
    estimatedDuration: METCON_DEFAULT_DURATION,
    warmup: '',
    main: '',
    metcon: '',
    core: '',
    cooldown: '',
    exercises: [],
    schedule: {
      ...session.schedule,
      kind: 'metcon',
    },
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
    kind: workout.schedule?.kind ?? sessionKindFromWorkoutName(workout.name),
  };
}
