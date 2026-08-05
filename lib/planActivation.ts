import { parsePersonalizedPlanContent, serializePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import { scheduleDayKey } from '@/lib/sessionSchedule';
import {
  createActivationDraftFor,
  isActivationSessionDraft,
  type SessionDraft,
} from '@/lib/trainerSessionDraft';
import type { AthletePlan } from '@/lib/types';

export type ActivationCreateInput = {
  athleteId: string;
  title: string;
  content: string;
  planGroupId: string;
  sessionNumber: number;
};

function planToDraft(plan: AthletePlan, fallbackIndex = 0) {
  const sessionNumber = plan.sessionNumber ?? fallbackIndex + 1;
  return {
    sessionNumber,
    draft: parsePersonalizedPlanContent(plan.content, sessionNumber - 1),
  };
}

/** Comprueba si un día concreto ya tiene su activación en la lista de borradores. */
export function needsActivationForDraft(draft: SessionDraft, existing: SessionDraft[]) {
  if (isActivationSessionDraft(draft)) return false;
  const dayKey = scheduleDayKey(draft.schedule);
  return !existing.some(
    (entry) => isActivationSessionDraft(entry) && scheduleDayKey(entry.schedule) === dayKey,
  );
}

/** Devuelve las activaciones que faltan para las sesiones guardadas de un plan. */
export function getMissingActivations(sessions: AthletePlan[]) {
  const entries = sessions.map((plan, index) => ({
    plan,
    ...planToDraft(plan, index),
  }));

  const allDrafts = entries.map((entry) => entry.draft);
  const pendingDrafts = [...allDrafts];
  const missing: Array<{
    sessionNumber: number;
    draft: SessionDraft;
    athleteId: string;
    title: string;
    planGroupId: string;
  }> = [];

  for (const entry of entries) {
    if (!needsActivationForDraft(entry.draft, pendingDrafts)) continue;

    const activationDraft = createActivationDraftFor(entry.draft);
    missing.push({
      sessionNumber: entry.sessionNumber,
      draft: activationDraft,
      athleteId: entry.plan.athleteId,
      title: entry.plan.title,
      planGroupId: entry.plan.planGroupId ?? entry.plan.id,
    });
    pendingDrafts.push(activationDraft);
  }

  return missing;
}

/** Crea la activación de una sesión recién guardada o copiada, si ese día aún no tiene una. */
export async function createActivationAfterSession(
  sessionDraft: SessionDraft,
  sessionNumber: number,
  context: {
    athleteId: string;
    title: string;
    planGroupId: string;
    existingSessions: AthletePlan[];
  },
  create: (input: ActivationCreateInput) => Promise<{ error?: string | null }>,
): Promise<string | null> {
  const existingDrafts = context.existingSessions.map(
    (plan, index) => planToDraft(plan, index).draft,
  );
  if (!needsActivationForDraft(sessionDraft, existingDrafts)) return null;

  const activationDraft = createActivationDraftFor(sessionDraft);
  const result = await create({
    athleteId: context.athleteId,
    title: context.title,
    content: serializePersonalizedPlanContent(activationDraft, sessionNumber),
    planGroupId: context.planGroupId,
    sessionNumber,
  });
  return result.error ?? null;
}

/** Crea en base de datos las activaciones que falten para un grupo de sesiones. */
export async function ensureActivationsForSessions(
  sessions: AthletePlan[],
  create: (input: ActivationCreateInput) => Promise<{ error?: string | null }>,
): Promise<string | null> {
  const missing = getMissingActivations(sessions);
  for (const item of missing) {
    const result = await create({
      athleteId: item.athleteId,
      title: item.title,
      content: serializePersonalizedPlanContent(item.draft, item.sessionNumber),
      planGroupId: item.planGroupId,
      sessionNumber: item.sessionNumber,
    });
    if (result.error) return result.error;
  }
  return null;
}
