import { parsePersonalizedPlanContent, serializePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import type { AthletePlan } from '@/lib/types';

export interface DayOrderUpdate {
  id: string;
  athleteId: string;
  title: string;
  content: string;
}

/** Numera de arriba abajo las sesiones del día y deja fuera las que ya tenían su posición. */
export function buildDayOrderUpdates(
  orderedIds: readonly string[],
  sessions: readonly AthletePlan[],
): DayOrderUpdate[] {
  const updates: DayOrderUpdate[] = [];

  orderedIds.forEach((id, index) => {
    const session = sessions.find((entry) => entry.id === id);
    if (!session) return;

    const sessionNumber = session.sessionNumber ?? 1;
    const draft = parsePersonalizedPlanContent(session.content, sessionNumber - 1);
    if (draft.dayOrder === index) return;

    updates.push({
      id: session.id,
      athleteId: session.athleteId,
      title: session.title,
      content: serializePersonalizedPlanContent({ ...draft, dayOrder: index }, sessionNumber),
    });
  });

  return updates;
}
