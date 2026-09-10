import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAthletes } from '@/hooks/useAthletes';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { mockAthletes, mockTrainerMessages } from '@/lib/mockData';
import {
  fetchTrainerChatPreviews,
  type TrainerChatPreview,
} from '@/lib/trainerService';
import { getDemoTrainerMessages } from '@/lib/trainerWelcomeMessage';
import type { AthleteSummary } from '@/lib/types';

export type TrainerChatConversation = {
  athlete: AthleteSummary;
  preview?: TrainerChatPreview;
};

function previewFromMessages(athleteId: string, messages: { sender: string; text: string; timestamp: string }[]) {
  const last = messages[messages.length - 1];
  if (!last) return undefined;

  let unread = 0;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].sender === 'user') unread += 1;
    else break;
  }

  return {
    athleteId,
    lastText: last.text.trim(),
    lastAt: last.timestamp,
    lastSender: last.sender === 'trainer' ? ('trainer' as const) : ('user' as const),
    unread,
  };
}

export function useTrainerChatInbox() {
  const { isDemoMode } = useAuth();
  const { athletes, isLoading, error, refresh: refreshAthletes } = useAthletes();
  const [previews, setPreviews] = useState<Record<string, TrainerChatPreview>>({});
  const [previewsLoading, setPreviewsLoading] = useState(true);

  const loadPreviews = useCallback(async () => {
    if (isDemoMode) {
      const demoPreviews: Record<string, TrainerChatPreview> = {};
      for (const athlete of mockAthletes) {
        const messages = getDemoTrainerMessages(athlete.id, mockTrainerMessages);
        const preview = previewFromMessages(athlete.id, messages);
        if (preview) demoPreviews[athlete.id] = preview;
      }
      setPreviews(demoPreviews);
      setPreviewsLoading(false);
      return;
    }

    if (isLoading) return;

    if (athletes.length === 0) {
      setPreviews({});
      setPreviewsLoading(false);
      return;
    }

    setPreviewsLoading(true);
    const data = await fetchTrainerChatPreviews(athletes.map((athlete) => athlete.id));
    setPreviews(data);
    setPreviewsLoading(false);
  }, [athletes, isDemoMode, isLoading]);

  useEffect(() => {
    void loadPreviews();
  }, [loadPreviews]);

  const refreshInbox = useCallback(async () => {
    await refreshAthletes(true);
    await loadPreviews();
  }, [loadPreviews, refreshAthletes]);

  useFocusRefresh(() => {
    void refreshInbox();
  });

  const conversations = useMemo<TrainerChatConversation[]>(() => {
    return [...athletes]
      .map((athlete) => ({ athlete, preview: previews[athlete.id] }))
      .sort((left, right) => {
        const unreadDelta = (right.preview?.unread ?? 0) - (left.preview?.unread ?? 0);
        if (unreadDelta !== 0) return unreadDelta;

        const leftAt = left.preview?.lastAt ?? '';
        const rightAt = right.preview?.lastAt ?? '';
        if (leftAt !== rightAt) return rightAt.localeCompare(leftAt);

        return left.athlete.name.localeCompare(right.athlete.name, 'es');
      });
  }, [athletes, previews]);

  return {
    conversations,
    isLoading: isLoading || previewsLoading,
    error,
    refresh: refreshInbox,
  };
}
