import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import type { ChatAttachmentDraft } from '@/lib/chatAttachments';
import { mockTrainerMessages } from '@/lib/mockData';
import { fetchSessionLogsByIds } from '@/lib/sessionLogService';
import { fetchTrainerAthleteFeedback } from '@/lib/trainerAthleteFeedbackService';
import { fetchTrainerMessages, sendAthleteMessage, sendTrainerReply } from '@/lib/trainerService';
import { addCrmActivity, buildMessageSentActivity } from '@/lib/trainerCrmActivity';
import { getDemoTrainerMessages } from '@/lib/trainerWelcomeMessage';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { TrainerAthleteFeedback, TrainerChatAttachment, TrainerMessage } from '@/lib/types';

function feedbackToMessage(
  entry: TrainerAthleteFeedback,
  scheduledDate?: string,
): TrainerMessage {
  const messageId = `feedback-${entry.id}`;
  const attachments: TrainerChatAttachment[] = entry.attachments.map((attachment) => ({
    id: attachment.id,
    messageId,
    kind: attachment.kind,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    url: attachment.url,
    durationSeconds: attachment.durationSeconds,
    createdAt: attachment.createdAt,
  }));

  return {
    id: messageId,
    sender: 'trainer',
    text: entry.message,
    timestamp: entry.createdAt,
    origin: 'feedback',
    feedbackId: entry.id,
    sessionLogId: entry.sessionLogId,
    scheduledDate,
    attachments,
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
      const { entries } = await fetchTrainerAthleteFeedback(
        conversationUserId!,
        !isSupabaseConfigured,
      );
      if (!cancelled) {
        const sessionIds = entries
          .map((entry) => entry.sessionLogId)
          .filter((value): value is string => Boolean(value));
        const logs = await fetchSessionLogsByIds(sessionIds);
        const dateByLogId = Object.fromEntries(logs.map((log) => [log.id, log.scheduledDate]));
        setFeedbackMessages(
          entries.map((entry) =>
            feedbackToMessage(entry, entry.sessionLogId ? dateByLogId[entry.sessionLogId] : undefined),
          ),
        );
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
    async (text: string, attachments: ChatAttachmentDraft[] = []) => {
      const trimmed = text.trim();
      if (!trimmed && attachments.length === 0) return false;

      if (isDemoMode) {
        const messageId = `msg-${Date.now()}`;
        const savedAttachments: TrainerChatAttachment[] = attachments.map((draft, index) => ({
          id: `local-chat-${messageId}-${index}`,
          messageId,
          kind: draft.kind,
          fileName: draft.fileName,
          mimeType: draft.mimeType,
          url: draft.uri,
          durationSeconds: draft.durationSeconds,
          createdAt: new Date().toISOString(),
        }));

        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            sender: asTrainer ? 'trainer' : 'user',
            text: trimmed,
            timestamp: new Date().toISOString(),
            attachments: savedAttachments.length ? savedAttachments : undefined,
          },
        ]);

        if (asTrainer && user?.id && conversationUserId) {
          void addCrmActivity(
            user.id,
            conversationUserId,
            buildMessageSentActivity(trimmed || 'Adjunto'),
            'message_sent',
            true,
          );
        }

        return true;
      }

      if (!conversationUserId) return false;

      const saved = asTrainer
        ? await sendTrainerReply(conversationUserId, trimmed, attachments)
        : await sendAthleteMessage(conversationUserId, trimmed, attachments);

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
