import { parsePersonalizedPlanContent, serializePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import { buildDayOrderUpdates } from '@/lib/scheduleDayOrder';
import { formatScheduleSummary, moveScheduleToDate } from '@/lib/sessionSchedule';
import type { AthletePlan } from '@/lib/types';

interface PlanContentUpdate {
  athleteId: string;
  planType: 'personalized';
  title: string;
  content: string;
}

export interface MoveCalendarSessionInput {
  /** Todas las sesiones personalizadas del atleta, para renumerar el orden del día de destino. */
  sessions: readonly AthletePlan[];
  plan: AthletePlan;
  targetDate: Date;
  /** Sesiones del día destino en el orden final, incluida la que se mueve. */
  orderedIds?: readonly string[];
  updatePlan: (id: string, input: PlanContentUpdate) => Promise<{ error?: string | null }>;
}

/**
 * Mueve al día indicado la tarjeta que se ha arrastrado, y solo esa: activaciones y sesiones son
 * independientes, así que arrastrar una nunca arrastra ni borra a la otra.
 */
export async function moveCalendarSessionToDate({
  sessions,
  plan,
  targetDate,
  orderedIds,
  updatePlan,
}: MoveCalendarSessionInput): Promise<string | null> {
  const draft = parsePersonalizedPlanContent(plan.content, (plan.sessionNumber ?? 1) - 1);
  const schedule = moveScheduleToDate(draft.schedule, targetDate);
  const dayOrder = orderedIds?.includes(plan.id) ? orderedIds.indexOf(plan.id) : draft.dayOrder;

  const movedContent = serializePersonalizedPlanContent(
    { ...draft, schedule, dayLabel: formatScheduleSummary(schedule), dayOrder },
    plan.sessionNumber ?? 1,
  );

  const movedResult = await updatePlan(plan.id, {
    athleteId: plan.athleteId,
    planType: 'personalized',
    title: plan.title,
    content: movedContent,
  });
  if (movedResult.error) return movedResult.error;

  if (!orderedIds || orderedIds.length < 2) return null;

  // La tarjeta movida ya lleva su nueva posición, así que renumerar el día no la vuelve a tocar.
  const sessionsAfterMove = sessions.map((entry) =>
    entry.id === plan.id ? { ...entry, content: movedContent } : entry,
  );

  for (const update of buildDayOrderUpdates(orderedIds, sessionsAfterMove)) {
    const result = await updatePlan(update.id, {
      athleteId: update.athleteId,
      planType: 'personalized',
      title: update.title,
      content: update.content,
    });
    if (result.error) return result.error;
  }

  return null;
}
