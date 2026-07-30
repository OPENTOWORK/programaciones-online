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
};

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
  };
}
