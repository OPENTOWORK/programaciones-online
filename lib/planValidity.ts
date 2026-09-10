import { parsePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
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
  const dateKey = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  if (validity.validFrom && dateKey < validity.validFrom) return false;
  if (validity.validUntil && dateKey > validity.validUntil) return false;
  return true;
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
