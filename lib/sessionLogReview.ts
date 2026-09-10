import type { TrainerAthleteFeedback } from '@/lib/types';

type FeedbackState = {
  isLoading: boolean;
  entries: readonly Pick<TrainerAthleteFeedback, 'sessionLogId'>[];
};

export function isSessionLogPendingReview(
  logId: string,
  feedback?: FeedbackState,
): boolean {
  if (!feedback || feedback.isLoading) return false;
  return !feedback.entries.some((entry) => entry.sessionLogId === logId);
}

export function pendingSessionLogIds(
  logIds: readonly string[],
  feedback?: FeedbackState,
): Set<string> {
  if (!feedback || feedback.isLoading) return new Set();
  return new Set(logIds.filter((logId) => isSessionLogPendingReview(logId, feedback)));
}
