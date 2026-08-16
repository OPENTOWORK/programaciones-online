import { createActivationAfterSession } from '@/lib/planActivation';
import { serializePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import {
  getNextSessionNumber,
  type PersonalizedPlanGroup,
} from '@/lib/personalizedPlanGroups';
import type { SchedulePreviewItem } from '@/lib/programSchedulePreview';
import {
  defaultDayOrder,
  isActivationSessionDraft,
  isRestDaySessionDraft,
  renameSessionCopy,
  type SessionDraft,
} from '@/lib/trainerSessionDraft';
import type { AthletePlan, AthletePlanType } from '@/lib/types';

type CreatePlanInput = {
  athleteId: string;
  planType: AthletePlanType;
  title: string;
  content: string;
  planGroupId: string;
  sessionNumber: number;
  athleteName?: string;
};

function sortPlanItems(items: SchedulePreviewItem[]) {
  return [...items].sort((left, right) => {
    const leftOrder = left.dayOrder ?? 1;
    const rightOrder = right.dayOrder ?? 1;
    return leftOrder - rightOrder;
  });
}

export async function copyCalendarDaySessions({
  items,
  targetDate,
  planIdFromItem,
  findPlan,
  findPlanGroup,
  loadDraft,
  applyDateToDraft,
  createPlan,
  athleteName,
}: {
  items: SchedulePreviewItem[];
  targetDate: Date;
  planIdFromItem: (item: SchedulePreviewItem) => string | undefined;
  findPlan: (planId?: string) => AthletePlan | undefined;
  findPlanGroup: (planId?: string) => PersonalizedPlanGroup | undefined;
  loadDraft: (item: SchedulePreviewItem) => SessionDraft | null;
  applyDateToDraft: (draft: SessionDraft, date: Date) => SessionDraft;
  createPlan: (input: CreatePlanInput) => Promise<{ error?: string | null }>;
  athleteName?: string;
}): Promise<string | null> {
  const planItems = sortPlanItems(items.filter((item) => item.id.startsWith('plan:')));

  if (planItems.length === 0) {
    return 'No hay sesiones que copiar en este día.';
  }

  const sourceDrafts = planItems
    .map((item) => loadDraft(item))
    .filter((draft): draft is SessionDraft => Boolean(draft));
  const copyingActivations = sourceDrafts.some((draft) => isActivationSessionDraft(draft));

  const nextNumberByGroup = new Map<string, number>();
  const sessionsByGroup = new Map<string, AthletePlan[]>();

  for (const item of planItems) {
    const planId = planIdFromItem(item);
    const source = findPlan(planId);
    const group = findPlanGroup(planId);
    const draft = loadDraft(item);

    if (!source || !group || !draft) {
      return 'No se pudo copiar una de las sesiones.';
    }

    const groupKey = group.id;
    const existingSessions = sessionsByGroup.get(groupKey) ?? [...group.sessions];
    let nextNumber = nextNumberByGroup.get(groupKey);
    if (nextNumber == null) {
      nextNumber = getNextSessionNumber(existingSessions);
    }

    const copiedDraft = applyDateToDraft(renameSessionCopy(draft, nextNumber), targetDate);
    copiedDraft.dayOrder = draft.dayOrder ?? defaultDayOrder(draft);

    const result = await createPlan({
      athleteId: source.athleteId,
      planType: source.planType,
      title: group.title,
      content: serializePersonalizedPlanContent(copiedDraft, nextNumber),
      planGroupId: group.planGroupId,
      sessionNumber: nextNumber,
      athleteName,
    });

    if (result.error) return result.error;

    existingSessions.push({
      ...source,
      id: `copy-${groupKey}-${nextNumber}`,
      sessionNumber: nextNumber,
      content: serializePersonalizedPlanContent(copiedDraft, nextNumber),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    sessionsByGroup.set(groupKey, existingSessions);
    nextNumberByGroup.set(groupKey, nextNumber + 1);

    if (
      !copyingActivations &&
      !isActivationSessionDraft(copiedDraft) &&
      !isRestDaySessionDraft(copiedDraft)
    ) {
      const activationError = await createActivationAfterSession(
        copiedDraft,
        nextNumber,
        {
          athleteId: source.athleteId,
          title: group.title,
          planGroupId: group.planGroupId,
          existingSessions,
        },
        async (input) => {
          const activationResult = await createPlan({
            athleteId: input.athleteId,
            planType: source.planType,
            title: input.title,
            content: input.content,
            planGroupId: input.planGroupId,
            sessionNumber: input.sessionNumber,
            athleteName,
          });
          return { error: activationResult.error };
        },
      );

      if (activationError) return activationError;
    }
  }

  return null;
}
