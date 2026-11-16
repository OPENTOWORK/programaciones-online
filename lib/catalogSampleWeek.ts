import { isAnnualTemplateDate } from '@/lib/annualProgramSchedule';
import {
  parseScheduleFromWorkout,
  toLocalDateString,
  toWeekdayIndex,
  WEEKDAY_OPTIONS,
  type WeekdayIndex,
} from '@/lib/sessionSchedule';
import type { Workout } from '@/lib/types';

export type CatalogSampleSession = {
  id: string;
  name: string;
  duration: string;
  rest: boolean;
};

export type CatalogSampleDay = {
  weekday: WeekdayIndex;
  label: string;
  sessions: CatalogSampleSession[];
};

function hasWorkoutContent(workout: Workout) {
  if (workout.schedule?.kind === 'pdf' || workout.schedule?.pdfStoragePath) return true;
  return Boolean(
    workout.warmup?.trim() ||
      workout.main?.trim() ||
      workout.core?.trim() ||
      workout.cooldown?.trim() ||
      workout.exercises.length > 0,
  );
}

function isRestWorkout(workout: Workout) {
  if (workout.schedule?.kind === 'rest') return true;
  const name = workout.name.trim().toLowerCase();
  return /descanso|rest day/.test(name);
}

function sessionName(workout: Workout) {
  const raw = workout.name.trim().replace(/^=\s*/, '');
  if (!raw || isRestWorkout(workout)) return 'Descanso';
  return raw;
}

function mondayKey(dateStr: string) {
  const date = new Date(`${dateStr.slice(0, 10)}T12:00:00`);
  const monday = new Date(date);
  monday.setDate(date.getDate() - toWeekdayIndex(date));
  return toLocalDateString(monday);
}

function weekIdentity(workout: Workout) {
  if (workout.workoutDate && isAnnualTemplateDate(workout.workoutDate)) {
    return `annual:${mondayKey(workout.workoutDate)}`;
  }
  if (workout.workoutDate && workout.schedule?.recurrence === 'once') {
    return `once:${mondayKey(workout.workoutDate)}`;
  }
  return `block:${workout.weekNumber > 0 ? workout.weekNumber : 1}`;
}

function weekdaysOf(workout: Workout): WeekdayIndex[] {
  if (workout.workoutDate && (isAnnualTemplateDate(workout.workoutDate) || workout.schedule?.recurrence === 'once')) {
    const date = new Date(`${workout.workoutDate.slice(0, 10)}T12:00:00`);
    if (!Number.isNaN(date.getTime())) return [toWeekdayIndex(date)];
  }

  const schedule = parseScheduleFromWorkout(workout);
  return schedule.weekdays;
}

function toSession(workout: Workout): CatalogSampleSession {
  return {
    id: workout.id,
    name: sessionName(workout),
    duration: workout.estimatedDuration?.trim() || '',
    rest: isRestWorkout(workout) && !hasWorkoutContent(workout),
  };
}

/**
 * Una sola semana, siempre la misma, sacada de las sesiones publicadas.
 * No escribe ni reordena la programación.
 */
export function buildCatalogSampleWeek(workouts: Workout[]): CatalogSampleDay[] {
  const usable = workouts.filter((workout) => hasWorkoutContent(workout) || isRestWorkout(workout));
  if (usable.length === 0) return [];

  const groups = new Map<string, Workout[]>();
  for (const workout of usable) {
    const key = weekIdentity(workout);
    const list = groups.get(key) ?? [];
    list.push(workout);
    groups.set(key, list);
  }

  const ranked = [...groups.entries()].sort(([leftKey, leftWorkouts], [rightKey, rightWorkouts]) => {
    const leftAnnual = leftKey.startsWith('annual:') ? 0 : 1;
    const rightAnnual = rightKey.startsWith('annual:') ? 0 : 1;
    if (leftAnnual !== rightAnnual) return leftAnnual - rightAnnual;
    const leftContent = leftWorkouts.some((workout) => hasWorkoutContent(workout) && !isRestWorkout(workout));
    const rightContent = rightWorkouts.some((workout) => hasWorkoutContent(workout) && !isRestWorkout(workout));
    if (leftContent !== rightContent) return leftContent ? -1 : 1;
    return leftKey.localeCompare(rightKey);
  });

  const chosen = ranked[0]?.[1] ?? [];
  const byDay = new Map<WeekdayIndex, CatalogSampleSession[]>();

  for (const workout of chosen) {
    const session = toSession(workout);
    for (const weekday of weekdaysOf(workout)) {
      const list = byDay.get(weekday) ?? [];
      if (!list.some((item) => item.id === session.id)) list.push(session);
      byDay.set(weekday, list);
    }
  }

  const occupied = [...byDay.keys()].sort((left, right) => left - right);
  if (occupied.length === 0) return [];

  const first = occupied[0];
  const last = occupied[occupied.length - 1];

  return WEEKDAY_OPTIONS.filter((option) => option.index >= first && option.index <= last).map((option) => ({
    weekday: option.index,
    label: option.label,
    sessions: (byDay.get(option.index) ?? []).sort((left, right) =>
      left.name.localeCompare(right.name, 'es'),
    ),
  }));
}
