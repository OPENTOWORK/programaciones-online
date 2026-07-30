import { useRouter } from 'expo-router';
import type { SchedulePreviewItem } from '@/lib/programSchedulePreview';
import { stashTrainerPreview, type TrainerPreviewState } from '@/lib/trainerPreviewContext';

export function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function openCalendarDay(router: ReturnType<typeof useRouter>, date: Date) {
  router.push({
    pathname: '/calendar/[date]',
    params: { date: formatDateParam(date) },
  });
}

export function openScheduledSession(router: ReturnType<typeof useRouter>, item: SchedulePreviewItem) {
  const date = formatDateParam(item.date);

  if (item.id.startsWith('plan:')) {
    const planId = item.id.split(':')[1];
    router.push({
      pathname: '/athlete/plan/[id]/session',
      params: { id: planId, date },
    });
    return;
  }

  router.push({
    pathname: '/workout/[id]',
    params: { id: item.id, date },
  });
}

export function openTrainerPreviewDay(
  router: ReturnType<typeof useRouter>,
  date: Date,
  state: TrainerPreviewState,
) {
  const previewKey = stashTrainerPreview(state);
  router.push({
    pathname: '/trainer/preview/day/[date]',
    params: { date: formatDateParam(date), previewKey },
  });
}

export function openTrainerPreviewSession(
  router: ReturnType<typeof useRouter>,
  item: SchedulePreviewItem,
  state: TrainerPreviewState,
) {
  const previewKey = stashTrainerPreview(state);
  router.push({
    pathname: '/trainer/preview/session',
    params: {
      previewKey,
      itemId: item.id,
      date: formatDateParam(item.date),
    },
  });
}
