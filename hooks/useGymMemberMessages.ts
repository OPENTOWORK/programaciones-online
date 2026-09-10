import { useCallback, useEffect, useState } from 'react';

import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  fetchGymMemberMessages,
  sendGymMemberMessage,
  sendGymStaffMessage,
} from '@/lib/gymChatService';
import type { TrainerMessage } from '@/lib/types';

interface UseGymMemberMessagesOptions {
  gymId?: string;
  memberId?: string;
  asStaff?: boolean;
}

export function useGymMemberMessages(options: UseGymMemberMessagesOptions = {}) {
  const gymId = options.gymId;
  const memberId = options.memberId;
  const asStaff = options.asStaff ?? false;

  const [messages, setMessages] = useState<TrainerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(gymId && memberId));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!gymId || !memberId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await fetchGymMemberMessages(gymId, memberId);
    setMessages(result.data);
    setError(result.error ?? null);
    setIsLoading(false);
  }, [gymId, memberId]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => {
    void load();
  });

  const sendMessage = useCallback(
    async (text: string) => {
      if (!gymId || !memberId) return false;

      const trimmed = text.trim();
      if (!trimmed) return false;

      const result = asStaff
        ? await sendGymStaffMessage(gymId, memberId, trimmed)
        : await sendGymMemberMessage(gymId, memberId, trimmed);

      if (result.error || !result.data) {
        setError(result.error ?? 'No se pudo enviar el mensaje.');
        return false;
      }

      setMessages((prev) => [...prev, result.data!]);
      setError(null);
      return true;
    },
    [asStaff, gymId, memberId],
  );

  return {
    messages,
    isLoading,
    isEmpty: !isLoading && messages.length === 0,
    error,
    sendMessage,
    refresh: load,
  };
}
