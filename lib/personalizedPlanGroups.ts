import { parsePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import { ACTIVATION_SESSION_NAME } from '@/lib/trainerSessionDraft';
import type { AthletePlan } from '@/lib/types';

export interface PersonalizedPlanGroup {
  id: string;
  planGroupId: string;
  title: string;
  athleteId: string;
  trainerId: string;
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
  const name = draft.name.trim();
  if (name && name.toLowerCase() !== plan.title.trim().toLowerCase()) {
    return name;
  }
  return `Sesión ${getSessionNumber(plan, fallbackIndex)}`;
}

export function sortPlansBySession(plans: AthletePlan[]) {
  return [...plans].sort((left, right) => {
    const bySession = getSessionNumber(left) - getSessionNumber(right);
    if (bySession !== 0) return bySession;

    const leftKind = parsePersonalizedPlanContent(left.content).kind === 'activation' ? 0 : 1;
    const rightKind = parsePersonalizedPlanContent(right.content).kind === 'activation' ? 0 : 1;
    if (leftKind !== rightKind) return leftKind - rightKind;

    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  });
}

export function groupPersonalizedPlans(plans: AthletePlan[]): PersonalizedPlanGroup[] {
  const groups = new Map<string, PersonalizedPlanGroup>();

  for (const plan of plans) {
    if (plan.planType !== 'personalized') continue;

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
