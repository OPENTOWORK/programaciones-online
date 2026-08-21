import { parseWorkoutBlocksFromText } from '@/lib/workoutBlockBuilder';
import { extractExercisesFromSessionDraft } from '@/lib/sessionBlockSections';
import {
  defaultScheduleForSession,
  sessionOccursOnDate,
  type SessionSchedule,
} from '@/lib/sessionSchedule';
import type { Program, Workout } from '@/lib/types';
import { defaultDayOrder, sessionKindFromWorkoutName, type SessionDraft, type SessionKind } from '@/lib/trainerSessionDraft';

export type ScheduleViewMode = 'month' | 'week' | 'day';

export interface SchedulePreviewItem {
  id: string;
  name: string;
  dayLabel: string;
  estimatedDuration: string;
  date: Date;
  blockCount: number;
  exerciseCount: number;
  isCurrent: boolean;
  isDraft: boolean;
  /** Sin valor equivale a una sesión normal. */
  kind?: SessionKind;
  /** Posición elegida dentro del día. Sin valor, la activación encabeza el día. */
  dayOrder?: number;
}

const WEEKDAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const WEEKDAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getMonday(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

function countBlocksFromDraft(draft: Pick<SessionDraft, 'warmup' | 'main' | 'metcon' | 'core' | 'cooldown'>) {
  return (
    parseWorkoutBlocksFromText(draft.warmup).length +
    parseWorkoutBlocksFromText(draft.main).length +
    parseWorkoutBlocksFromText(draft.metcon).length +
    parseWorkoutBlocksFromText(draft.core).length +
    parseWorkoutBlocksFromText(draft.cooldown).length
  );
}

function countBlocksFromWorkout(workout: Workout) {
  return (
    parseWorkoutBlocksFromText(workout.warmup).length +
    parseWorkoutBlocksFromText(workout.main).length +
    parseWorkoutBlocksFromText(workout.core ?? '').length +
    parseWorkoutBlocksFromText(workout.cooldown).length
  );
}

function draftPreviewItem(
  draft: SessionDraft,
  id: string,
  date: Date,
  options: { isCurrent: boolean; isDraft: boolean },
): SchedulePreviewItem {
  return {
    id,
    name: draft.name.trim() || 'Sin nombre',
    dayLabel: draft.dayLabel,
    estimatedDuration: draft.estimatedDuration.trim() || '60 min',
    date,
    blockCount: countBlocksFromDraft(draft),
    exerciseCount: extractExercisesFromSessionDraft(draft).length,
    isCurrent: options.isCurrent,
    isDraft: options.isDraft,
    kind: draft.kind,
    dayOrder: draft.dayOrder,
  };
}

function workoutPreviewItem(
  workout: Workout,
  date: Date,
  options: { isCurrent: boolean; isDraft: boolean },
): SchedulePreviewItem {
  return {
    id: workout.id,
    name: workout.name,
    dayLabel: workout.dayLabel,
    estimatedDuration: workout.estimatedDuration,
    date,
    blockCount: countBlocksFromWorkout(workout),
    exerciseCount: workout.exercises.length,
    isCurrent: options.isCurrent,
    isDraft: options.isDraft,
    kind: workout.schedule?.kind ?? sessionKindFromWorkoutName(workout.name),
    dayOrder: workout.schedule?.dayOrder,
  };
}

interface ScheduleSource {
  id: string;
  schedule: SessionSchedule;
  draft?: SessionDraft;
  workout?: Workout;
  isCurrent: boolean;
  isDraft: boolean;
}

function eachDayInRange(start: Date, end: Date) {
  const days: Date[] = [];
  for (let cursor = startOfDay(start); cursor <= end; cursor = addDays(cursor, 1)) {
    days.push(cursor);
  }
  return days;
}

export function getPreviewDateRange(viewMode: ScheduleViewMode, focusDate: Date) {
  const anchor = startOfDay(focusDate);
  if (viewMode === 'day') {
    return { start: anchor, end: anchor };
  }
  if (viewMode === 'week') {
    const monday = getMonday(anchor);
    return { start: monday, end: addDays(monday, 6) };
  }

  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -startOffset);
  return { start: gridStart, end: addDays(gridStart, 41) };
}

export function schedulePreviewItemKey(sourceId: string, date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${sourceId}:${year}-${month}-${day}`;
}

export function parseSchedulePreviewItemKey(itemId: string) {
  const separator = itemId.lastIndexOf(':');
  if (separator === -1) {
    return { sourceId: itemId, dateKey: undefined as string | undefined };
  }
  return {
    sourceId: itemId.slice(0, separator),
    dateKey: itemId.slice(separator + 1),
  };
}

export function buildSchedulePreviewItems({
  workouts,
  draft,
  editingWorkoutId,
  isNewSession,
  focusDate = new Date(),
  viewMode = 'week',
}: {
  program: Program;
  workouts: Workout[];
  draft: SessionDraft;
  editingWorkoutId?: string | null;
  isNewSession: boolean;
  focusDate?: Date;
  viewMode?: ScheduleViewMode;
}): SchedulePreviewItem[] {
  const range = getPreviewDateRange(viewMode, focusDate);
  const sources: ScheduleSource[] = [];

  workouts.forEach((workout, index) => {
    const isEditing = !isNewSession && editingWorkoutId === workout.id;
    sources.push({
      id: workout.id,
      schedule: isEditing ? draft.schedule : workout.schedule ?? defaultScheduleForSession(index),
      draft: isEditing ? draft : undefined,
      workout: isEditing ? undefined : workout,
      isCurrent: isEditing,
      isDraft: false,
    });
  });

  if (isNewSession) {
    sources.push({
      id: 'draft-new',
      schedule: draft.schedule,
      draft,
      isCurrent: true,
      isDraft: true,
    });
  }

  const items: SchedulePreviewItem[] = [];

  for (const day of eachDayInRange(range.start, range.end)) {
    for (const source of sources) {
      if (!sessionOccursOnDate(source.schedule, day, focusDate)) continue;

      if (source.draft) {
        items.push(
          draftPreviewItem(source.draft, source.id, day, {
            isCurrent: source.isCurrent,
            isDraft: source.isDraft,
          }),
        );
        continue;
      }

      if (source.workout) {
        items.push(
          workoutPreviewItem(source.workout, day, {
            isCurrent: source.isCurrent,
            isDraft: source.isDraft,
          }),
        );
      }
    }
  }

  return items.sort((left, right) => {
    const byDate = left.date.getTime() - right.date.getTime();
    if (byDate !== 0) return byDate;
    const byOrder = defaultDayOrder(left) - defaultDayOrder(right);
    if (byOrder !== 0) return byOrder;
    return left.name.localeCompare(right.name, 'es');
  });
}

export function formatMonthLabel(date: Date) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDayLabel(date: Date) {
  const weekday = WEEKDAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1];
  return `${weekday} ${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`;
}

export function getWeekdayShortLabels() {
  return WEEKDAY_SHORT;
}

export function getMonthGrid(referenceDate: Date) {
  const firstOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -startOffset);
  const days: Date[] = [];

  for (let index = 0; index < 42; index += 1) {
    days.push(addDays(gridStart, index));
  }

  return days;
}

export function getWeekDays(referenceDate: Date) {
  const monday = getMonday(referenceDate);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function itemsForDate(items: SchedulePreviewItem[], date: Date) {
  return items.filter((item) => isSameDay(item.date, date));
}

export function shiftMonth(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function shiftWeek(date: Date, delta: number) {
  return addDays(date, delta * 7);
}

export function shiftDay(date: Date, delta: number) {
  return addDays(date, delta);
}

export function isDateInSameMonth(date: Date, reference: Date) {
  return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();
}
