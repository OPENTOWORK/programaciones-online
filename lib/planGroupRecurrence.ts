import {
  parsePersonalizedPlanContent,
  serializePersonalizedPlanContent,
} from '@/lib/personalizedPlanContent';
import { getSessionNumber } from '@/lib/personalizedPlanGroups';
import { normalizeSessionSchedule } from '@/lib/sessionSchedule';
import type { AthletePlan } from '@/lib/types';

export function planGroupUsesOnceRecurrence(sessions: AthletePlan[]) {
  return sessions.some(
    (session) => parsePersonalizedPlanContent(session.content).schedule.recurrence === 'once',
  );
}

export function convertSessionContentToWeeklyRecurrence(content: string, sessionNumber?: number) {
  const draft = parsePersonalizedPlanContent(content, (sessionNumber ?? 1) - 1);
  if (draft.schedule.recurrence !== 'once') {
    return content;
  }

  const weeklySchedule = normalizeSessionSchedule({
    ...draft.schedule,
    recurrence: 'weekly',
  });

  return serializePersonalizedPlanContent(
    { ...draft, schedule: weeklySchedule },
    sessionNumber ?? draft.name.match(/(\d+)/)?.[1],
  );
}

export function convertPlanGroupSessionsToWeeklyRecurrence(sessions: AthletePlan[]) {
  return sessions.map((session) => ({
    ...session,
    content: convertSessionContentToWeeklyRecurrence(
      session.content,
      getSessionNumber(session),
    ),
  }));
}
