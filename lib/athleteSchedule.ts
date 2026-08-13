import { fetchAthletePlansForAthlete, fetchAthletePlansForUser } from '@/lib/athletePlanService';
import { parsePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import { buildSchedulePreviewItems, itemsForDate, type SchedulePreviewItem } from '@/lib/programSchedulePreview';
import { createPersonalizedPlanPreviewProgram } from '@/lib/personalizedPlanContent';
import { fetchProgramsByIds } from '@/lib/programService';
import { fetchActiveProgramsForUser } from '@/lib/userProgramService';
import { fetchWorkoutsByProgram } from '@/lib/workoutService';
import { ACTIVATION_SESSION_NAME, REST_DAY_SESSION_NAME, defaultDayOrder } from '@/lib/trainerSessionDraft';
import type { AthletePlan, Program, Workout } from '@/lib/types';
import type { SessionDraft } from '@/lib/trainerSessionDraft';

export interface AthleteCalendarSession {
  id: string;
  source: 'program' | 'plan';
  name: string;
  dayLabel: string;
  estimatedDuration: string;
  date: Date;
  entrenoId?: string;
  athletePlanId?: string;
  programId?: string;
  blockCount: number;
  exerciseCount: number;
  hasLog?: boolean;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function planToDraft(plan: AthletePlan): SessionDraft {
  return parsePersonalizedPlanContent(plan.content);
}

export interface CatalogProgramSchedule {
  program: Program;
  workouts: Workout[];
}

export async function loadAthleteScheduleSources(
  userId: string,
  programId?: string,
  options?: { skipPlans?: boolean },
) {
  const plans = options?.skipPlans ? [] : await fetchAthletePlansForUser(userId, 'personalized');
  let workouts: Workout[] = [];

  if (programId) {
    workouts = await fetchWorkoutsByProgram(programId);
  }

  return { plans, workouts };
}

/** Planes personalizados y catálogo activo del atleta, para la vista del entrenador. */
export async function loadTrainerAthleteScheduleSources(athleteId: string) {
  const [allPlans, activePrograms] = await Promise.all([
    fetchAthletePlansForAthlete(athleteId),
    fetchActiveProgramsForUser(athleteId),
  ]);

  const personalizedPlans = allPlans.filter((plan) => plan.planType === 'personalized');
  const programIds = activePrograms.map((program) => program.id);
  const programsById = await fetchProgramsByIds(programIds);

  const catalogPrograms: CatalogProgramSchedule[] = [];
  await Promise.all(
    programIds.map(async (programId) => {
      const program = programsById.get(programId);
      if (!program) return;

      const workouts = await fetchWorkoutsByProgram(programId);
      if (workouts.length > 0) {
        catalogPrograms.push({ program, workouts });
      }
    }),
  );

  return { personalizedPlans, catalogPrograms };
}

function buildCatalogWorkoutItems(
  program: Program,
  workouts: Workout[],
  focusDate: Date,
  viewMode: 'month' | 'week' | 'day',
) {
  const items: SchedulePreviewItem[] = [];

  for (const workout of workouts) {
    const draft = {
      name: workout.name,
      dayLabel: workout.dayLabel,
      estimatedDuration: workout.estimatedDuration,
      warmup: workout.warmup,
      main: workout.main,
      metcon: '',
      core: workout.core ?? '',
      cooldown: workout.cooldown,
      exercises: workout.exercises,
      schedule: workout.schedule ?? { weekdays: [], recurrence: 'weekly' as const },
    };

    items.push(
      ...buildSchedulePreviewItems({
        program,
        workouts: [workout],
        draft,
        editingWorkoutId: workout.id,
        isNewSession: false,
        focusDate,
        viewMode,
      }),
    );
  }

  return items;
}

export function buildAthleteCalendarItems({
  plans,
  workouts,
  program,
  catalogPrograms,
  focusDate = new Date(),
  viewMode = 'week' as const,
}: {
  plans: AthletePlan[];
  workouts: Workout[];
  program?: Program;
  catalogPrograms?: CatalogProgramSchedule[];
  focusDate?: Date;
  viewMode?: 'month' | 'week' | 'day';
}): SchedulePreviewItem[] {
  const items: SchedulePreviewItem[] = [];

  if (program && workouts.length > 0) {
    items.push(...buildCatalogWorkoutItems(program, workouts, focusDate, viewMode));
  }

  for (const entry of catalogPrograms ?? []) {
    items.push(...buildCatalogWorkoutItems(entry.program, entry.workouts, focusDate, viewMode));
  }

  for (const plan of plans) {
    const draft = planToDraft(plan);
    const sessionLabel =
      draft.kind === 'activation'
        ? ACTIVATION_SESSION_NAME
        : draft.kind === 'rest'
          ? REST_DAY_SESSION_NAME
          : draft.name.trim() || `Sesión ${plan.sessionNumber ?? 1}`;
    const previewProgram = createPersonalizedPlanPreviewProgram(plan.title);
    items.push(
      ...buildSchedulePreviewItems({
        program: previewProgram,
        workouts: [],
        draft: { ...draft, name: sessionLabel },
        editingWorkoutId: null,
        isNewSession: true,
        focusDate,
        viewMode,
      }).map((item) => ({
        ...item,
        id: `plan:${plan.id}:${dateKey(item.date)}`,
        name: sessionLabel,
        isDraft: false,
      })),
    );
  }

  /* Cada plan aporta sus fechas por separado, así que el día queda mezclado hasta ordenarlo aquí.
   * El orden es estable, de modo que dos sesiones sin posición elegida mantienen la del plan. */
  return items.sort((left, right) => {
    const byDate = left.date.getTime() - right.date.getTime();
    if (byDate !== 0) return byDate;
    return defaultDayOrder(left) - defaultDayOrder(right);
  });
}

export function calendarItemToAthleteSession(item: SchedulePreviewItem): AthleteCalendarSession {
  const isPlan = item.id.startsWith('plan:');
  const athletePlanId = isPlan ? item.id.split(':')[1] : undefined;

  return {
    id: item.id,
    source: isPlan ? 'plan' : 'program',
    name: item.name,
    dayLabel: item.dayLabel,
    estimatedDuration: item.estimatedDuration,
    date: item.date,
    entrenoId: isPlan ? undefined : item.id,
    athletePlanId,
    blockCount: item.blockCount,
    exerciseCount: item.exerciseCount,
  };
}

export function sessionsForDate(items: SchedulePreviewItem[], date: Date) {
  return itemsForDate(items, date).map(calendarItemToAthleteSession);
}
