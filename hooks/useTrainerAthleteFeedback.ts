import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';
import {
  createTrainerAthleteFeedback,
  deleteTrainerAthleteFeedback,
  fetchTrainerAthleteFeedback,
} from '@/lib/trainerAthleteFeedbackService';
import {
  uploadFeedbackAttachment,
  type FeedbackAttachmentDraft,
} from '@/lib/trainerFeedbackMediaService';
import type { TrainerAthleteFeedback, TrainerFeedbackAttachment } from '@/lib/types';

export function useTrainerAthleteFeedback(targetAthleteId?: string) {
  const { user, isDemoMode } = useAuth();
  const isTrainer = isTrainerRole(user?.role);
  const athleteId = targetAthleteId ?? (!isTrainer ? user?.id : undefined);
  const trainerId = isTrainer ? user?.id : undefined;

  const [entries, setEntries] = useState<TrainerAthleteFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [persistent, setPersistent] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!athleteId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchTrainerAthleteFeedback(
        athleteId,
        trainerId,
        isDemoMode,
      );
      setEntries(result.entries);
      setPersistent(result.persistent);
    } finally {
      setIsLoading(false);
    }
  }, [athleteId, trainerId, isDemoMode]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  const send = useCallback(
    async (message: string, attachments: FeedbackAttachmentDraft[] = []) => {
      if (!trainerId || !athleteId) {
        return { error: 'Solo el entrenador puede enviar feedback.' };
      }
      if (!message.trim() && attachments.length === 0) {
        return { error: 'Escribe un feedback o adjunta un vídeo o nota de voz.' };
      }

      setSending(true);
      setError(null);

      const useLocalStore = isDemoMode || !persistent;
      const result = await createTrainerAthleteFeedback({
        trainerId,
        athleteId,
        message,
        useLocalStore,
        allowEmptyMessage: attachments.length > 0,
      });

      if (result.error || !result.entry) {
        setSending(false);
        const failure = result.error ?? 'No se pudo enviar el feedback.';
        setError(failure);
        return { error: failure };
      }

      const uploaded: TrainerFeedbackAttachment[] = [];
      let uploadError: string | undefined;

      for (const draft of attachments) {
        const upload = await uploadFeedbackAttachment({
          trainerId,
          athleteId,
          feedbackId: result.entry.id,
          draft,
          useLocalStore,
        });
        if (upload.attachment) uploaded.push(upload.attachment);
        if (upload.error) uploadError = upload.error;
      }

      setSending(false);
      setEntries((current) => [{ ...result.entry!, attachments: uploaded }, ...current]);

      if (uploadError) {
        setError(`Feedback enviado, pero un adjunto falló: ${uploadError}`);
        return { error: uploadError, entry: result.entry };
      }

      return { entry: result.entry };
    },
    [trainerId, athleteId, isDemoMode, persistent],
  );

  const remove = useCallback(
    async (entry: TrainerAthleteFeedback) => {
      const result = await deleteTrainerAthleteFeedback(
        entry,
        isDemoMode || !persistent,
      );
      if (result.error) {
        setError(result.error);
        return result;
      }
      setEntries((current) => current.filter((item) => item.id !== entry.id));
      return {};
    },
    [isDemoMode, persistent],
  );

  return {
    entries,
    latest: entries[0],
    isLoading,
    sending,
    persistent,
    error,
    send,
    remove,
    refresh: load,
  };
}
