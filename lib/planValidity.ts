import type { PersonalizedPlanGroup } from '@/lib/personalizedPlanGroups';
import { parsePersonalizedPlanContent, serializePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import { getWeekDays, type ScheduleViewMode } from '@/lib/programSchedulePreview';
import { formatScheduleSummary, shiftSessionScheduleByDays, toLocalDateString } from '@/lib/sessionSchedule';
import type { AthletePlan } from '@/lib/types';

const META_START = '@@plan-meta:v1';
const META_END = '@@/plan-meta';
const VALID_FROM_PREFIX = 'planValidFrom=';
const VALID_UNTIL_PREFIX = 'planValidUntil=';

export interface PlanValidity {
  validFrom?: string;
  /** `null` = vigencia indefinida. */
  validUntil?: string | null;
}

export function isValidPlanDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

/** Muestra una fecha ISO del plan como `dd/mm/aaaa`. */
export function formatPlanDateDisplay(isoDate?: string) {
  if (!isoDate || !isValidPlanDate(isoDate)) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/** Acepta `dd/mm/aaaa` o `aaaa-mm-dd` y devuelve ISO `aaaa-mm-dd`. */
export function parsePlanDateInput(value: string): { iso?: string; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return {};

  if (isValidPlanDate(trimmed)) return { iso: trimmed };

  const slashed = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (!slashed) {
    return { error: 'Introduce la fecha como dd/mm/aaaa' };
  }

  const day = Number(slashed[1]);
  const month = Number(slashed[2]);
  const year = Number(slashed[3]);
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  if (!isValidPlanDate(iso)) {
    return { error: 'Esa fecha no es válida' };
  }

  const date = new Date(`${iso}T12:00:00`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return { error: 'Esa fecha no existe' };
  }

  return { iso };
}

export function getPlanValidityFromContent(content: string): PlanValidity {
  const metaStart = content.indexOf(META_START);
  if (metaStart === -1) return {};

  const metaEnd = content.indexOf(META_END, metaStart);
  if (metaEnd === -1) return {};

  const metaBlock = content.slice(metaStart, metaEnd);
  const validity: PlanValidity = {};

  for (const line of metaBlock.split('\n')) {
    if (line.startsWith(VALID_FROM_PREFIX)) {
      const value = line.slice(VALID_FROM_PREFIX.length).trim();
      if (isValidPlanDate(value)) validity.validFrom = value;
    }
    if (line.startsWith(VALID_UNTIL_PREFIX)) {
      const value = line.slice(VALID_UNTIL_PREFIX.length).trim();
      if (!value || value === 'indefinite') {
        validity.validUntil = null;
      } else if (isValidPlanDate(value)) {
        validity.validUntil = value;
      }
    }
  }

  return validity;
}

export function applyPlanValidityToContent(content: string, validity: PlanValidity) {
  if (!content.includes(META_START) || !content.includes(META_END)) {
    return content;
  }

  const withoutValidity = content
    .split('\n')
    .filter(
      (line) =>
        !line.startsWith(VALID_FROM_PREFIX) && !line.startsWith(VALID_UNTIL_PREFIX),
    )
    .join('\n');

  const lines: string[] = [];
  if (validity.validFrom && isValidPlanDate(validity.validFrom)) {
    lines.push(`${VALID_FROM_PREFIX}${validity.validFrom}`);
  }
  if (validity.validUntil !== undefined) {
    lines.push(
      `${VALID_UNTIL_PREFIX}${
        validity.validUntil && isValidPlanDate(validity.validUntil)
          ? validity.validUntil
          : 'indefinite'
      }`,
    );
  }

  if (lines.length === 0) return withoutValidity;
  return withoutValidity.replace(META_END, `${lines.join('\n')}\n${META_END}`);
}

export function inferPlanValidityFromSessions(sessions: AthletePlan[]): PlanValidity {
  for (const session of sessions) {
    const stored = getPlanValidityFromContent(session.content);
    if (stored.validFrom || stored.validUntil !== undefined) {
      return stored;
    }
  }

  const startDates = sessions
    .map((session) => parsePersonalizedPlanContent(session.content).schedule.startDate)
    .filter((value): value is string => Boolean(value))
    .sort();

  if (startDates.length === 0) return { validUntil: null };
  return { validFrom: startDates[0], validUntil: null };
}

export function formatPlanValidityLabel(validity: PlanValidity) {
  if (!validity.validFrom && validity.validUntil === undefined) return '';

  const formatDate = (value: string) => formatPlanDateDisplay(value) || value;

  const fromLabel = validity.validFrom ? formatDate(validity.validFrom) : '—';
  const untilLabel =
    validity.validUntil === null || validity.validUntil === undefined
      ? 'Indefinido'
      : formatDate(validity.validUntil);

  return `${fromLabel} – ${untilLabel}`;
}

export function isDateWithinPlanValidity(date: Date, validity: PlanValidity) {
  const dateKey = toLocalDateString(date);

  if (validity.validFrom && dateKey < validity.validFrom) return false;
  if (validity.validUntil && dateKey > validity.validUntil) return false;
  return true;
}

/** `true` cuando la fecha «Hasta» ya pasó (el último día de vigencia sigue contando como activo). */
export function isPlanValidityEnded(
  validity: PlanValidity,
  referenceDate: Date = new Date(),
): boolean {
  if (!validity.validUntil) return false;
  return validity.validUntil < toLocalDateString(referenceDate);
}

export function schedulePeriodBounds(focusDate: Date, viewMode: ScheduleViewMode) {
  if (viewMode === 'day') {
    const key = toLocalDateString(focusDate);
    return { start: key, end: key };
  }

  if (viewMode === 'week') {
    const days = getWeekDays(focusDate);
    return { start: toLocalDateString(days[0]), end: toLocalDateString(days[6]) };
  }

  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  return { start: toLocalDateString(monthStart), end: toLocalDateString(monthEnd) };
}

export function planValidityOverlapsRange(validity: PlanValidity, rangeStart: string, rangeEnd: string) {
  if (validity.validFrom && rangeEnd < validity.validFrom) return false;
  if (validity.validUntil && rangeStart > validity.validUntil) return false;
  return true;
}

/** Un solo plan por periodo visible (semana / mes / día), según fechas de vigencia. */
export function selectPlanGroupForSchedulePeriod(
  groups: PersonalizedPlanGroup[],
  focusDate: Date,
  viewMode: ScheduleViewMode,
): PersonalizedPlanGroup | null {
  if (groups.length === 0) return null;

  const { start, end } = schedulePeriodBounds(focusDate, viewMode);
  const overlapping = groups.filter((group) => planValidityOverlapsRange(group.validity, start, end));
  if (overlapping.length === 0) return null;
  if (overlapping.length === 1) return overlapping[0];

  const periodStart = new Date(`${start}T12:00:00`);
  const coveringStart = overlapping.filter((group) =>
    isDateWithinPlanValidity(periodStart, group.validity),
  );
  const pool = coveringStart.length > 0 ? coveringStart : overlapping;

  return [...pool].sort((left, right) => {
    const leftFrom = left.validity.validFrom ?? '';
    const rightFrom = right.validity.validFrom ?? '';
    return rightFrom.localeCompare(leftFrom);
  })[0];
}

/** Activo / caducado respecto al final del periodo que se está mirando en el calendario. */
export function isPlanGroupActiveForSchedulePeriod(
  group: PersonalizedPlanGroup,
  focusDate: Date,
  viewMode: ScheduleViewMode,
) {
  const { end } = schedulePeriodBounds(focusDate, viewMode);
  const periodEnd = new Date(`${end}T12:00:00`);
  return isDateWithinPlanValidity(periodEnd, group.validity);
}

export function earliestScheduledDateForPlans(sessions: AthletePlan[]) {
  const dates = sessions
    .map((session) => parsePersonalizedPlanContent(session.content).schedule.startDate)
    .filter((value): value is string => isValidPlanDate(value))
    .sort();

  return dates[0];
}

export function countSessionsOutsidePlanValidity(
  sessions: AthletePlan[],
  validity: PlanValidity,
) {
  if (!validity.validFrom && validity.validUntil === undefined) return 0;

  return sessions.filter((session) => {
    const startDate = parsePersonalizedPlanContent(session.content).schedule.startDate;
    if (!startDate || !isValidPlanDate(startDate)) return false;
    return !isDateWithinPlanValidity(new Date(`${startDate}T12:00:00`), validity);
  }).length;
}

function daysBetweenIsoDates(fromIso: string, toIso: string) {
  const from = new Date(`${fromIso}T12:00:00`);
  const to = new Date(`${toIso}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/**
 * Al cambiar «Desde» (o la vigencia), mueve las fechas programadas de cada sesión el mismo
 * número de días para que el plan quede alineado con la nueva fecha de inicio.
 */
export function buildPlanGroupSessionContentsForValidityChange(
  sessions: AthletePlan[],
  previousValidity: PlanValidity,
  nextValidity: PlanValidity,
): string[] {
  const earliest = earliestScheduledDateForPlans(sessions);
  const oldFrom =
    previousValidity.validFrom && isValidPlanDate(previousValidity.validFrom)
      ? previousValidity.validFrom
      : earliest;
  const newFrom =
    nextValidity.validFrom && isValidPlanDate(nextValidity.validFrom)
      ? nextValidity.validFrom
      : undefined;

  let dayDelta = 0;
  if (oldFrom && newFrom) {
    dayDelta = daysBetweenIsoDates(oldFrom, newFrom);
  }

  return sessions.map((session, index) => {
    const sessionNumber = session.sessionNumber ?? index + 1;
    const draft = parsePersonalizedPlanContent(session.content, sessionNumber - 1);
    const schedule =
      dayDelta !== 0 ? shiftSessionScheduleByDays(draft.schedule, dayDelta) : draft.schedule;
    const serialized = serializePersonalizedPlanContent(
      {
        ...draft,
        schedule,
        dayLabel: formatScheduleSummary(schedule),
      },
      sessionNumber,
    );
    return applyPlanValidityToContent(serialized, nextValidity);
  });
}

export function buildPlanGroupValidityMap(plans: AthletePlan[]) {
  const groups = new Map<string, PlanValidity>();

  for (const plan of plans) {
    const groupId = plan.planGroupId ?? plan.id;
    if (groups.has(groupId)) continue;
    const siblings = plans.filter((entry) => (entry.planGroupId ?? entry.id) === groupId);
    groups.set(groupId, inferPlanValidityFromSessions(siblings));
  }

  return groups;
}
