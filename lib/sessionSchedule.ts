import type { Workout } from '@/lib/types';

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type SessionRecurrence = 'once' | 'weekly' | 'biweekly' | 'every3weeks' | 'every4weeks';

export interface SessionSchedule {
  weekdays: WeekdayIndex[];
  recurrence: SessionRecurrence;
  startDate?: string;
}

export const WEEKDAY_OPTIONS: Array<{ index: WeekdayIndex; label: string; short: string }> = [
  { index: 0, label: 'Lunes', short: 'L' },
  { index: 1, label: 'Martes', short: 'M' },
  { index: 2, label: 'Miércoles', short: 'X' },
  { index: 3, label: 'Jueves', short: 'J' },
  { index: 4, label: 'Viernes', short: 'V' },
  { index: 5, label: 'Sábado', short: 'S' },
  { index: 6, label: 'Domingo', short: 'D' },
];

export const RECURRENCE_OPTIONS: Array<{ value: SessionRecurrence; label: string; hint: string }> = [
  { value: 'once', label: 'Una sola vez', hint: 'Solo en la fecha de inicio' },
  { value: 'weekly', label: 'Cada semana', hint: 'Todos los días elegidos, cada semana' },
  { value: 'biweekly', label: 'Cada 2 semanas', hint: 'Una semana sí y otra no' },
  { value: 'every3weeks', label: 'Cada 3 semanas', hint: 'Se repite cada 3 semanas' },
  { value: 'every4weeks', label: 'Cada 4 semanas', hint: 'Se repite cada 4 semanas' },
];

const VALID_RECURRENCES = new Set<SessionRecurrence>(RECURRENCE_OPTIONS.map((entry) => entry.value));

function getRecurrenceIntervalWeeks(recurrence: SessionRecurrence) {
  switch (recurrence) {
    case 'biweekly':
      return 2;
    case 'every3weeks':
      return 3;
    case 'every4weeks':
      return 4;
    default:
      return 1;
  }
}

function parseRecurrenceFromLabel(recurrenceLabel: string): SessionRecurrence {
  const normalized = recurrenceLabel.toLowerCase();
  const match = [...RECURRENCE_OPTIONS]
    .sort((left, right) => right.label.length - left.label.length)
    .find((entry) => normalized.includes(entry.label.toLowerCase()));

  return match?.value ?? 'weekly';
}
const LABEL_TO_WEEKDAY = new Map(WEEKDAY_OPTIONS.map((entry) => [entry.label.toLowerCase(), entry.index]));

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMondayOfWeek(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(monday.getDate() + diff);
  return startOfDay(monday);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function toWeekdayIndex(date: Date): WeekdayIndex {
  return (date.getDay() === 0 ? 6 : date.getDay() - 1) as WeekdayIndex;
}

export function defaultScheduleForSession(sessionIndex: number): SessionSchedule {
  const weekday = (sessionIndex % 5) as WeekdayIndex;
  return {
    weekdays: [weekday],
    recurrence: 'weekly',
    startDate: toLocalDateString(startOfDay(new Date())),
  };
}

export function normalizeSessionSchedule(
  schedule?: Partial<SessionSchedule> | null,
  fallback?: SessionSchedule,
): SessionSchedule {
  const base = fallback ?? defaultScheduleForSession(0);
  const weekdays = (schedule?.weekdays ?? base.weekdays).filter(
    (day): day is WeekdayIndex => day >= 0 && day <= 6,
  );
  const recurrence = schedule?.recurrence ?? base.recurrence;
  return {
    weekdays: weekdays.length > 0 ? [...new Set(weekdays)].sort() : base.weekdays,
    recurrence: VALID_RECURRENCES.has(recurrence as SessionRecurrence)
      ? (recurrence as SessionRecurrence)
      : 'weekly',
    startDate: schedule?.startDate ?? base.startDate,
  };
}

export function parseScheduleFromJson(value: unknown): SessionSchedule | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<SessionSchedule>;
  if (!Array.isArray(raw.weekdays)) return null;
  return normalizeSessionSchedule(raw);
}

export function parseScheduleFromSummaryLabel(dayLabel: string): SessionSchedule | null {
  const parts = dayLabel.split('·').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const dayNames = parts[0].split(',').map((part) => part.trim().toLowerCase()).filter(Boolean);
  const weekdays = dayNames
    .map((name) => LABEL_TO_WEEKDAY.get(name))
    .filter((day): day is WeekdayIndex => day != null);

  const recurrence = parseRecurrenceFromLabel(parts[1]);

  if (weekdays.length === 0) return null;

  return normalizeSessionSchedule({ weekdays, recurrence });
}

export function parseScheduleFromWorkout(workout: Workout, sessionIndex = 0): SessionSchedule {
  if (workout.schedule) {
    return normalizeSessionSchedule(workout.schedule);
  }

  const fromSummary = parseScheduleFromSummaryLabel(workout.dayLabel);
  if (fromSummary) return fromSummary;

  const label = workout.dayLabel.trim().toLowerCase();
  const weekday = LABEL_TO_WEEKDAY.get(label);
  if (weekday != null) {
    return {
      weekdays: [weekday],
      recurrence: 'weekly',
      startDate: workout.workoutDate?.startsWith('2000-') ? undefined : workout.workoutDate,
    };
  }

  return defaultScheduleForSession(sessionIndex);
}

export function formatScheduleWeekdays(schedule: SessionSchedule) {
  if (schedule.weekdays.length === 0) return 'Sin día';
  return schedule.weekdays
    .map((index) => WEEKDAY_OPTIONS.find((entry) => entry.index === index)?.label ?? '')
    .filter(Boolean)
    .join(', ');
}

/** Identifica los días exactos de un calendario. A diferencia del resumen legible, distingue
 * dos sesiones puntuales que caen en el mismo día de la semana pero en fechas distintas. */
export function scheduleDayKey(schedule: SessionSchedule) {
  return [schedule.weekdays.join(','), schedule.recurrence, schedule.startDate ?? ''].join('|');
}

export function formatScheduleSummary(schedule: SessionSchedule) {
  const days = formatScheduleWeekdays(schedule);
  const recurrence = RECURRENCE_OPTIONS.find((entry) => entry.value === schedule.recurrence)?.label ?? '';
  return `${days} · ${recurrence}`;
}

export function getScheduleAnchorDate(schedule: SessionSchedule, reference = new Date()) {
  const anchor = schedule.startDate
    ? startOfDay(new Date(`${schedule.startDate}T12:00:00`))
    : startOfDay(reference);

  if (schedule.recurrence !== 'once') {
    return getMondayOfWeek(anchor);
  }

  return anchor;
}

export function sessionOccursOnDate(schedule: SessionSchedule, date: Date, reference = new Date()) {
  if (schedule.weekdays.length === 0) return false;

  const weekday = toWeekdayIndex(date);
  if (!schedule.weekdays.includes(weekday)) return false;

  const anchor = getScheduleAnchorDate(schedule, reference);

  if (schedule.recurrence === 'once') {
    return isSameDay(date, anchor);
  }

  if (date < anchor) return false;

  if (schedule.recurrence === 'weekly') {
    return true;
  }

  const intervalWeeks = getRecurrenceIntervalWeeks(schedule.recurrence);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSince = Math.floor((date.getTime() - anchor.getTime()) / msPerWeek);
  return weeksSince % intervalWeeks === 0;
}

export function serializeScheduleForDb(schedule: SessionSchedule) {
  return {
    weekdays: schedule.weekdays,
    recurrence: schedule.recurrence,
    startDate: schedule.startDate ?? toLocalDateString(startOfDay(new Date())),
  };
}
