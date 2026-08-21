import { parsePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import {
  formatScheduleSummary,
  formatScheduleWeekdays,
  scheduleDayKey,
  type SessionSchedule,
} from '@/lib/sessionSchedule';
import { ACTIVATION_SESSION_NAME, METCON_SESSION_NAME, REST_DAY_SESSION_NAME, defaultDayOrder } from '@/lib/trainerSessionDraft';
import { isSessionBasedAthletePlanType } from '@/lib/trainerConstants';
import type { AthletePlan } from '@/lib/types';

export interface PersonalizedPlanGroup {
  id: string;
  planGroupId: string;
  title: string;
  athleteId: string;
  trainerId: string;
  sessions: AthletePlan[];
}

export interface PersonalizedPlanDayGroup {
  key: string;
  title: string;
  subtitle: string;
  schedule: SessionSchedule;
  sessions: AthletePlan[];
}

export function getPlanGroupId(plan: AthletePlan) {
  return plan.planGroupId ?? `${plan.athleteId}:${plan.trainerId}:${plan.title.trim().toLowerCase()}`;
}

export function getSessionNumber(plan: AthletePlan, fallbackIndex = 0) {
  if (plan.sessionNumber != null && plan.sessionNumber > 0) {
    return plan.sessionNumber;
  }
  return fallbackIndex + 1;
}

export function getSessionLabel(plan: AthletePlan, fallbackIndex = 0) {
  const draft = parsePersonalizedPlanContent(plan.content, getSessionNumber(plan, fallbackIndex) - 1);
  if (draft.kind === 'activation') return ACTIVATION_SESSION_NAME;
  if (draft.kind === 'metcon') return METCON_SESSION_NAME;
  if (draft.kind === 'rest') return REST_DAY_SESSION_NAME;
  const name = draft.name.trim();
  if (name && name.toLowerCase() !== plan.title.trim().toLowerCase()) {
    return name;
  }
  return `Sesión ${getSessionNumber(plan, fallbackIndex)}`;
}

function formatOnceDayTitle(schedule: SessionSchedule) {
  const weekdayLabel = formatScheduleWeekdays(schedule);
  if (!schedule.startDate) return weekdayLabel;

  const date = new Date(`${schedule.startDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return weekdayLabel;

  const dayMonth = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `${weekdayLabel} · ${dayMonth}`;
}

export function getPlanDayTitle(schedule: SessionSchedule) {
  if (schedule.recurrence === 'once') {
    return formatOnceDayTitle(schedule);
  }
  return formatScheduleWeekdays(schedule);
}

export function getPlanDaySubtitle(schedule: SessionSchedule) {
  if (schedule.recurrence === 'once') return 'Una sola vez';
  const summary = formatScheduleSummary(schedule);
  const parts = summary.split('·').map((part) => part.trim());
  return parts[1] ?? summary;
}

function daySortValue(schedule: SessionSchedule) {
  const firstWeekday = schedule.weekdays[0] ?? 0;
  const start = schedule.startDate ?? '';
  return `${String(firstWeekday).padStart(2, '0')}|${start}|${schedule.recurrence}`;
}

/** Agrupa sesiones del mismo día de entreno (activación + sesión, etc.). */
export function groupPersonalizedSessionsByDay(sessions: AthletePlan[]): PersonalizedPlanDayGroup[] {
  const days = new Map<string, PersonalizedPlanDayGroup>();

  sessions.forEach((session, index) => {
    const draft = parsePersonalizedPlanContent(session.content, getSessionNumber(session, index) - 1);
    const key = scheduleDayKey(draft.schedule);
    const existing = days.get(key);

    if (existing) {
      existing.sessions.push(session);
      return;
    }

    days.set(key, {
      key,
      title: getPlanDayTitle(draft.schedule),
      subtitle: getPlanDaySubtitle(draft.schedule),
      schedule: draft.schedule,
      sessions: [session],
    });
  });

  return [...days.values()]
    .map((day) => ({
      ...day,
      sessions: [...day.sessions].sort((left, right) => {
        const leftDraft = parsePersonalizedPlanContent(left.content, getSessionNumber(left) - 1);
        const rightDraft = parsePersonalizedPlanContent(right.content, getSessionNumber(right) - 1);
        const byOrder = defaultDayOrder(leftDraft) - defaultDayOrder(rightDraft);
        if (byOrder !== 0) return byOrder;
        return getSessionNumber(left) - getSessionNumber(right);
      }),
    }))
    .sort((left, right) => daySortValue(left.schedule).localeCompare(daySortValue(right.schedule)));
}

export function sortPlansBySession(plans: AthletePlan[]) {
  return [...plans].sort((left, right) => {
    const bySession = getSessionNumber(left) - getSessionNumber(right);
    if (bySession !== 0) return bySession;

    const byDayOrder =
      defaultDayOrder(parsePersonalizedPlanContent(left.content)) -
      defaultDayOrder(parsePersonalizedPlanContent(right.content));
    if (byDayOrder !== 0) return byDayOrder;

    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  });
}

export function groupPersonalizedPlans(plans: AthletePlan[]): PersonalizedPlanGroup[] {
  const groups = new Map<string, PersonalizedPlanGroup>();

  for (const plan of plans) {
    if (!isSessionBasedAthletePlanType(plan.planType)) continue;

    const id = getPlanGroupId(plan);
    const existing = groups.get(id);
    if (existing) {
      existing.sessions.push(plan);
      continue;
    }

    groups.set(id, {
      id,
      planGroupId: plan.planGroupId ?? plan.id,
      title: plan.title,
      athleteId: plan.athleteId,
      trainerId: plan.trainerId,
      sessions: [plan],
    });
  }

  return [...groups.values()]
    .map((group) => {
      const sessions = sortPlansBySession(group.sessions).map((session, index) => ({
        ...session,
        sessionNumber: getSessionNumber(session, index),
      }));
      const planGroupId = sessions.find((session) => session.planGroupId)?.planGroupId ?? sessions[0]?.id ?? group.id;

      return {
        id: planGroupId,
        planGroupId,
        title: group.title,
        athleteId: group.athleteId,
        trainerId: group.trainerId,
        sessions,
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title, 'es'));
}

/**
 * El identificador del grupo puede llegar como uuid, como clave derivada del título
 * o como id de una de sus sesiones, así que se aceptan las tres formas.
 */
export function findPlanGroup(
  groups: PersonalizedPlanGroup[],
  groupIdOrPlan: string | AthletePlan,
): PersonalizedPlanGroup | undefined {
  if (typeof groupIdOrPlan !== 'string') {
    const plan = groupIdOrPlan;
    return (
      groups.find((group) => group.sessions.some((session) => session.id === plan.id)) ??
      findPlanGroup(groups, getPlanGroupId(plan))
    );
  }

  const id = groupIdOrPlan;
  return groups.find(
    (group) =>
      group.id === id ||
      group.planGroupId === id ||
      group.sessions.some((session) => session.id === id || getPlanGroupId(session) === id),
  );
}

export function getNextSessionNumber(sessions: AthletePlan[]) {
  if (sessions.length === 0) return 1;
  return Math.max(...sessions.map((session, index) => getSessionNumber(session, index))) + 1;
}

export function splitAssignedPlans(plans: AthletePlan[]) {
  const personalizedGroups = groupPersonalizedPlans(plans);
  const nutritionPlans = plans.filter((plan) => plan.planType === 'nutrition');
  return { personalizedGroups, nutritionPlans };
}
