import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { mockTrainerMessages } from '@/lib/mockData';
import { fetchTrainerMessages, sendAthleteMessage, sendTrainerReply } from '@/lib/trainerService';
import type { TrainerMessage } from '@/lib/types';

interface UseTrainerMessagesOptions {
  athleteId?: string;
  asTrainer?: boolean;
}

export function useTrainerMessages(options: UseTrainerMessagesOptions = {}) {
  const { user, isDemoMode } = useAuth();
  const athleteId = options.athleteId;
  const asTrainer = options.asTrainer ?? false;
  const conversationUserId = asTrainer ? athleteId : user?.id;

  const [messages, setMessages] = useState<TrainerMessage[]>(isDemoMode ? mockTrainerMessages : []);
  const [isLoading, setIsLoading] = useState(!isDemoMode);

  useEffect(() => {
    if (isDemoMode) {
      setMessages(mockTrainerMessages);
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
    [asTrainer, conversationUserId, isDemoMode],
  );

  return {
    messages,
    isLoading,
    isEmpty: !isDemoMode && messages.length === 0,
    sendMessage,
  };
}
