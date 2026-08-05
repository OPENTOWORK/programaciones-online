import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { mockTrainerMessages } from '@/lib/mockData';
import { fetchTrainerAthleteFeedback } from '@/lib/trainerAthleteFeedbackService';
import { fetchTrainerMessages, sendAthleteMessage, sendTrainerReply } from '@/lib/trainerService';
import { addCrmActivity, buildMessageSentActivity } from '@/lib/trainerCrmActivity';
import { getDemoTrainerMessages } from '@/lib/trainerWelcomeMessage';
import type { TrainerAthleteFeedback, TrainerMessage } from '@/lib/types';

function feedbackToMessage(entry: TrainerAthleteFeedback): TrainerMessage {
  return {
    id: `feedback-${entry.id}`,
    sender: 'trainer',
    text: entry.message,
    timestamp: entry.createdAt,
    origin: 'feedback',
    attachments: entry.attachments,
  };
}

interface UseTrainerMessagesOptions {
  athleteId?: string;
  asTrainer?: boolean;
}

export function useTrainerMessages(options: UseTrainerMessagesOptions = {}) {
  const { user, isDemoMode } = useAuth();
  const athleteId = options.athleteId;
  const asTrainer = options.asTrainer ?? false;
  const conversationUserId = asTrainer ? athleteId : user?.id;

  const [messages, setMessages] = useState<TrainerMessage[]>(
    isDemoMode && conversationUserId
      ? getDemoTrainerMessages(conversationUserId, mockTrainerMessages)
      : isDemoMode
        ? mockTrainerMessages
        : [],
  );
  const [isLoading, setIsLoading] = useState(!isDemoMode);
  const [feedbackMessages, setFeedbackMessages] = useState<TrainerMessage[]>([]);

  useEffect(() => {
    if (!conversationUserId) {
      setFeedbackMessages([]);
      return;
    }

    let cancelled = false;

    async function loadFeedback() {
      const { entries } = await fetchTrainerAthleteFeedback(conversationUserId!, isDemoMode);
      if (!cancelled) {
        setFeedbackMessages(entries.map(feedbackToMessage));
      }
    }

    void loadFeedback();

    return () => {
      cancelled = true;
    };
  }, [conversationUserId, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) {
      const seed = conversationUserId
        ? getDemoTrainerMessages(conversationUserId, mockTrainerMessages)
        : mockTrainerMessages;
      setMessages(seed);
      setIsLoading(false);
      return;
    }

    if (!conversationUserId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const data = await fetchTrainerMessages(conversationUserId!);
      if (!cancelled) {
        setMessages(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [conversationUserId, isDemoMode]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      if (isDemoMode) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: asTrainer ? 'trainer' : 'user',
            text: trimmed,
            timestamp: new Date().toISOString(),
          },
        ]);

        if (asTrainer && user?.id && conversationUserId) {
          void addCrmActivity(
            user.id,
            conversationUserId,
            buildMessageSentActivity(trimmed),
            'message_sent',
            true,
          );
        }

        return true;
      }

      if (!conversationUserId) return false;

      const saved = asTrainer
        ? await sendTrainerReply(conversationUserId, trimmed)
        : await sendAthleteMessage(conversationUserId, trimmed);

      if (!saved) return false;

      setMessages((prev) => [...prev, saved]);
      return true;
    },
    [asTrainer, conversationUserId, isDemoMode, user?.id],
  );

  const timeline = useMemo(() => {
    if (feedbackMessages.length === 0) return messages;
    return [...messages, ...feedbackMessages].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }, [messages, feedbackMessages]);

  return {
    messages: timeline,
    isLoading,
    isEmpty: !isDemoMode && timeline.length === 0,
    sendMessage,
  };
}
