import type { SessionWorkoutContent } from '@/hooks/useSessionRunner';
import { fetchAthletePlanById } from '@/lib/athletePlanService';
import { parsePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import type { SessionLogRecord } from '@/lib/sessionLogService';
import { combineMainPartsForSave, extractExercisesFromSessionDraft } from '@/lib/sessionBlockSections';
import { fetchWorkoutById } from '@/lib/workoutService';

function emptyWorkout(log: SessionLogRecord): SessionWorkoutContent {
  return {
    name: log.workoutName,
    estimatedDuration: log.duration ?? '—',
    warmup: '',
    main: '',
    cooldown: '',
    exercises: [],
    programId: log.programId,
  };
}

export async function loadWorkoutForSessionLog(log: SessionLogRecord): Promise<SessionWorkoutContent> {
  if (log.athletePlanId) {
    const plan = await fetchAthletePlanById(log.athletePlanId);
    if (!plan) return emptyWorkout(log);

    const draft = parsePersonalizedPlanContent(plan.content, (plan.sessionNumber ?? 1) - 1);
    const sessionName = draft.name.trim() || `Sesión ${plan.sessionNumber ?? 1}`;

    return {
      name: log.workoutName || sessionName,
      estimatedDuration: draft.estimatedDuration,
      warmup: draft.warmup,
      main: combineMainPartsForSave(draft.main, draft.metcon),
      core: draft.core,
      cooldown: draft.cooldown,
      exercises: extractExercisesFromSessionDraft(draft),
      programId: log.programId,
    };
  }

  if (log.entrenoId) {
    const workout = await fetchWorkoutById(log.entrenoId);
    if (!workout) return emptyWorkout(log);

    return {
      name: log.workoutName || workout.name,
      estimatedDuration: workout.estimatedDuration,
      warmup: workout.warmup,
      main: workout.main,
      core: workout.core,
      cooldown: workout.cooldown,
      exercises: workout.exercises,
      programId: log.programId ?? workout.programId,
    };
  }

  return emptyWorkout(log);
}
