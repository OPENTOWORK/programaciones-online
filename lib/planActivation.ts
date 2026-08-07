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