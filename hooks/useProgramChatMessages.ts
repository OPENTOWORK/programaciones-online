import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';
import {
  fetchProgramChatMessages,
  isUserEnrolledInProgram,
  sendProgramChatMessage,
} from '@/lib/programChatService';
import type { TrainerMessage } from '@/lib/types';

export function useProgramChatMessages(programId: string) {
  const { user, isDemoMode } = useAuth();
  const [messages, setMessages] = useState<TrainerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [persistent, setPersistent] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  const loadAccess = useCallback(async () => {
    if (!user?.id || !programId) {
      setCanAccess(false);
      setAccessChecked(true);
      return;
    }

    if (isTrainerRole(user.role)) {
      setCanAccess(true);
      setAccessChecked(true);
      return;
    }

    const enrolled = await isUserEnrolledInProgram(programId, user.id);
    setCanAccess(enrolled);
    setAccessChecked(true);
  }, [programId, user?.id, user?.role]);

  const loadMessages = useCallback(async () => {
    if (!programId || !user?.id) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    if (isDemoMode) {
      setMessages([]);
      setPersistent(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await fetchProgramChatMessages(programId, user.id);
    setMessages(result.messages);
    setPersistent(result.persistent);
    setIsLoading(false);
  }, [isDemoMode, programId, user?.id]);

  useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  useEffect(() => {
    if (!accessChecked) return;
    if (!canAccess) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    void loadMessages();
  }, [accessChecked, canAccess, loadMessages]);

  useFocusRefresh(() => {
    if (canAccess) {
      void loadMessages();
    }
  });

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !programId || !user?.id || !canAccess) return false;

      if (isDemoMode) {
        setMessages((current) => [
          ...current,
          {
            id: `local-program-chat-${Date.now()}`,
            sender: isTrainerRole(user.role) ? 'trainer' : 'user',
            text: trimmed,
            timestamp: new Date().toISOString(),
            authorId: user.id,
          },
        ]);
        return true;
      }

      const result = await sendProgramChatMessage({
        programId,
        text: trimmed,
        role: user.role,
      });

      if (result.error || !result.message) {
        return false;
      }

      setMessages((current) => [...current, result.message!]);
      setPersistent(result.persistent ?? true);
      return true;
    },
    [canAccess, isDemoMode, programId, user?.id, user?.role],
  );

  return {
    messages,
    isLoading: isLoading || !accessChecked,
    isEmpty: messages.length === 0,
    canAccess,
    persistent,
    sendMessage,
    refresh: loadMessages,
  };
}
