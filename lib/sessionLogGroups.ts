import type { SessionLogRecord } from '@/lib/sessionLogService';
import { toLocalDateString } from '@/lib/sessionSchedule';

export interface SessionLogWeekGroup {
  key: string;
  label: string;
  subtitle: string;
  current: boolean;
  complete: boolean;
  logs: SessionLogRecord[];
}

export interface SessionLogMonthGroup {
  key: string;
  label: string;
  subtitle: string;
  current: boolean;
  complete: boolean;
  weeks: SessionLogWeekGroup[];
}

export interface SessionLogYearGroup {
  key: string;
  label: string;
  subtitle: string;
  current: boolean;
  complete: boolean;
  months: SessionLogMonthGroup[];
}

function parseLogDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function mondayOf(date: Date) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function formatDayMonth(date: Date) {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString('es-ES', { month: 'long' });
}

function sessionCountLabel(count: number) {
  return `${count} entreno${count === 1 ? '' : 's'}`;
}

function sortLogs(logs: SessionLogRecord[]) {
  return [...logs].sort((left, right) => left.scheduledDate.localeCompare(right.scheduledDate));
}

export function groupSessionLogs(
  logs: readonly SessionLogRecord[],
  now = new Date(),
): SessionLogYearGroup[] {
  const today = startOfDay(now);
  const currentYear = today.getFullYear();
  const currentMonthKey = `${currentYear}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const currentWeekKey = toLocalDateString(mondayOf(today));

  const years = new Map<number, Map<string, Map<string, SessionLogRecord[]>>>();

  for (const log of logs) {
    if (!log.scheduledDate) continue;
    const date = parseLogDate(log.scheduledDate);
    if (!Number.isFinite(date.getTime())) continue;

    const year = date.getFullYear();
    const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const weekKey = toLocalDateString(mondayOf(date));

    if (!years.has(year)) years.set(year, new Map());
    const months = years.get(year)!;
    if (!months.has(monthKey)) months.set(monthKey, new Map());
    const weeks = months.get(monthKey)!;
    if (!weeks.has(weekKey)) weeks.set(weekKey, []);
    weeks.get(weekKey)!.push(log);
  }

  return [...years.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([year, months]) => {
      const monthGroups: SessionLogMonthGroup[] = [...months.entries()]
        .sort((left, right) => left[0].localeCompare(right[0]))
        .map(([monthKey, weeks]) => {
          const monthDate = parseLogDate(`${monthKey}-01`);
          const weekGroups: SessionLogWeekGroup[] = [...weeks.entries()]
            .sort((left, right) => left[0].localeCompare(right[0]))
            .map(([weekKey, weekLogs]) => {
              const monday = parseLogDate(weekKey);
              const sunday = addDays(monday, 6);
              const sorted = sortLogs(weekLogs);
              const current = weekKey === currentWeekKey;
              const complete = startOfDay(sunday) < today;
              return {
                key: weekKey,
                label: `Semana ${formatDayMonth(monday)} – ${formatDayMonth(sunday)}`,
                subtitle: sessionCountLabel(sorted.length),
                current,
                complete,
                logs: sorted,
              };
            });

          const logCount = weekGroups.reduce((sum, week) => sum + week.logs.length, 0);
          const current = monthKey === currentMonthKey;
          return {
            key: monthKey,
            label: formatMonthLabel(monthDate),
            subtitle: sessionCountLabel(logCount),
            current,
            complete: monthKey < currentMonthKey,
            weeks: weekGroups,
          };
        });

      const logCount = monthGroups.reduce(
        (sum, month) => sum + month.weeks.reduce((weekSum, week) => sum + week.logs.length, 0),
        0,
      );

      return {
        key: String(year),
        label: String(year),
        subtitle: sessionCountLabel(logCount),
        current: year === currentYear,
        complete: year < currentYear,
        months: monthGroups,
      };
    });
}
