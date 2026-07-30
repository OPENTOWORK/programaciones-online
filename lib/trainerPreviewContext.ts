import { combineMainPartsForSave, extractExercisesFromSessionDraft } from '@/lib/sessionBlockSections';
import {
  buildSchedulePreviewItems,
  itemsForDate,
  parseSchedulePreviewItemKey,
  schedulePreviewItemKey,
  type SchedulePreviewItem,
} from '@/lib/programSchedulePreview';
import type { SessionWorkoutContent } from '@/hooks/useSessionRunner';
import type { Program, Workout } from '@/lib/types';
import type { SessionDraft } from '@/lib/trainerSessionDraft';

export type TrainerPreviewState = {
  program: Program;
  workouts: Workout[];
  draft: SessionDraft;
  editingWorkoutId?: string | null;
  isNewSession: boolean;
  planTitle?: string;
  additionalDrafts?: Array<{ id: string; draft: SessionDraft }>;
};

const store = new Map<string, TrainerPreviewState>();
const MAX_ENTRIES = 12;
const STORAGE_PREFIX = 'trainer-preview:';

function writePreviewState(key: string, state: TrainerPreviewState) {
  store.set(key, state);

  if (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) {
      store.delete(oldest);
      removePreviewStateFromStorage(oldest);
    }
  }

  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(state));
    } catch {
      // Ignore quota or serialization errors; in-memory store still works.
    }
  }
}

function removePreviewStateFromStorage(key: string) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  }
}

function readPreviewState(key: string) {
  const cached = store.get(key);
  if (cached) return cached;

  if (typeof sessionStorage === 'undefined') return undefined;

  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as TrainerPreviewState;
    store.set(key, parsed);
    return parsed;
  } catch {
    return undefined;
  }
}

export function stashTrainerPreview(state: TrainerPreviewState) {
  const key = `preview-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  writePreviewState(key, state);
  return key;
}

export function peekTrainerPreview(key: string) {
  return readPreviewState(key);
}

export function draftToPreviewWorkout(draft: SessionDraft, title?: string): SessionWorkoutContent {
  return {
    name: title?.trim() || draft.name,
    estimatedDuration: draft.estimatedDuration,
    warmup: draft.warmup,
    main: combineMainPartsForSave(draft.main, draft.metcon),
    core: draft.core,
    cooldown: draft.cooldown,
    exercises: extractExercisesFromSessionDraft(draft),
  };
}

function resolvePreviewDraft(state: TrainerPreviewState, item: SchedulePreviewItem) {
  const { sourceId } = parseSchedulePreviewItemKey(item.id);
  const queuedDraft = state.additionalDrafts?.find((entry) => entry.id === sourceId);
  if (queuedDraft) {
    return queuedDraft.draft;
  }

  if (sourceId === 'draft-new' || (state.isNewSession && item.isCurrent)) {
    return state.draft;
  }

  return undefined;
}

export function buildTrainerPreviewItems(state: TrainerPreviewState, focusDate: Date) {
  const base = buildSchedulePreviewItems({
    program: state.program,
    workouts: state.workouts,
    draft: state.draft,
    editingWorkoutId: state.editingWorkoutId,
    isNewSession: state.isNewSession,
    focusDate,
    viewMode: 'day',
  });

  const extra = (state.additionalDrafts ?? []).flatMap((entry) =>
    buildSchedulePreviewItems({
      program: state.program,
      workouts: [],
      draft: entry.draft,
      editingWorkoutId: null,
      isNewSession: true,
      focusDate,
      viewMode: 'day',
    }).map((item) => ({
      ...item,
      id: schedulePreviewItemKey(entry.id, item.date),
      name: entry.draft.name.trim() || item.name,
      isCurrent: false,
      isDraft: true,
    })),
  );

  return base.concat(extra);
}

export function resolveTrainerPreviewSession(
  state: TrainerPreviewState,
  item: SchedulePreviewItem,
): SessionWorkoutContent {
  const previewDraft = resolvePreviewDraft(state, item);
  if (previewDraft) {
    return draftToPreviewWorkout(previewDraft, state.planTitle);
  }

  const { sourceId } = parseSchedulePreviewItemKey(item.id);
  const workout = state.workouts.find((entry) => entry.id === sourceId || entry.id === item.id);
  if (workout) {
    const usesDraft = !state.isNewSession && state.editingWorkoutId === workout.id;
    if (usesDraft) {
      return draftToPreviewWorkout(state.draft);
    }

    return {
      name: workout.name,
      estimatedDuration: workout.estimatedDuration,
      warmup: workout.warmup,
      main: workout.main,
      core: workout.core,
      cooldown: workout.cooldown,
      exercises: workout.exercises,
      programId: workout.programId,
    };
  }

  return draftToPreviewWorkout(state.draft, state.planTitle);
}

export function sessionsForTrainerPreviewDay(state: TrainerPreviewState, date: Date) {
  const items = buildTrainerPreviewItems(state, date);
  return { items, sessions: itemsForDate(items, date) };
}
