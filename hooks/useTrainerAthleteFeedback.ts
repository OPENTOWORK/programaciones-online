import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  createTrainerAthleteFeedback,
  deleteTrainerAthleteFeedback,
  fetchTrainerAthleteFeedback,
  updateTrainerAthleteFeedback,
} from '@/lib/trainerAthleteFeedbackService';
import {
  uploadFeedbackAttachment,
  type FeedbackAttachmentDraft,
} from '@/lib/trainerFeedbackMediaService';
import type { TrainerAthleteFeedback, TrainerFeedbackAttachment } from '@/lib/types';

export function useTrainerAthleteFeedback(targetAthleteId?: string) {
  const { user } = useAuth();
  const isTrainer = isTrainerRole(user?.role);
  const athleteId = targetAthleteId ?? (!isTrainer ? user?.id : undefined);
  const trainerId = isTrainer ? user?.id : undefined;
  const useLocalStore = !isSupabaseConfigured;

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
      const result = await fetchTrainerAthleteFeedback(athleteId, useLocalStore);
      setEntries(result.entries);
      setPersistent(result.persistent);
    } finally {
      setIsLoading(false);
    }
  }, [athleteId, useLocalStore]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  const send = useCallback(
    async (
      message: string,
      attachments: FeedbackAttachmentDraft[] = [],
      sessionLogId?: string,
    ) => {
      if (!trainerId || !athleteId) {
        return { error: 'Solo el entrenador puede enviar feedback.' };
      }
      if (!message.trim() && attachments.length === 0) {
        return { error: 'Escribe un feedback o adjunta un vídeo o nota de voz.' };
      }

      setSending(true);
      setError(null);

      const result = await createTrainerAthleteFeedback({
        trainerId,
        athleteId,
        message,
        sessionLogId,
        useLocalStore: useLocalStore || !persistent,
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
          useLocalStore: useLocalStore || !persistent,
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
    [trainerId, athleteId, useLocalStore, persistent],
  );

  const update = useCallback(
    async (
      entry: TrainerAthleteFeedback,
      message: string,
      attachments: FeedbackAttachmentDraft[] = [],
    ) => {
      if (!trainerId || !athleteId) {
        return { error: 'Solo el entrenador puede editar el feedback.' };
      }
      if (!message.trim() && attachments.length === 0 && entry.attachments.length === 0) {
        return { error: 'Escribe un feedback o adjunta un vídeo o nota de voz.' };
      }

      setSending(true);
      setError(null);

      const result = await updateTrainerAthleteFeedback({
        entry,
        message,
        useLocalStore: useLocalStore || !persistent,
        allowEmptyMessage: attachments.length > 0 || entry.attachments.length > 0,
      });

      if (result.error || !result.entry) {
        setSending(false);
        const failure = result.error ?? 'No se pudo guardar el feedback.';
        setError(failure);
        return { error: failure };
      }

      const uploaded: TrainerFeedbackAttachment[] = [...entry.attachments];
      let uploadError: string | undefined;

      for (const draft of attachments) {
        const upload = await uploadFeedbackAttachment({
          trainerId,
          athleteId,
          feedbackId: result.entry.id,
          draft,
          useLocalStore: useLocalStore || !persistent,
        });
        if (upload.attachment) uploaded.push(upload.attachment);
        if (upload.error) uploadError = upload.error;
      }

      const updatedEntry: TrainerAthleteFeedback = {
        ...result.entry,
        trainerName: entry.trainerName ?? result.entry.trainerName,
        attachments: uploaded,
      };

      setSending(false);
      setEntries((current) =>
        current.map((item) => (item.id === entry.id ? updatedEntry : item)),
      );

      if (uploadError) {
        setError(`Feedback actualizado, pero un adjunto falló: ${uploadError}`);
        return { error: uploadError, entry: updatedEntry };
      }

      return { entry: updatedEntry };
    },
    [trainerId, athleteId, useLocalStore, persistent],
  );

  const remove = useCallback(
    async (entry: TrainerAthleteFeedback) => {
      const result = await deleteTrainerAthleteFeedback(
        entry,
        useLocalStore || !persistent,
      );
      if (result.error) {
        setError(result.error);
        return result;
      }
      setEntries((current) => current.filter((item) => item.id !== entry.id));
      return {};
    },
    [useLocalStore, persistent],
  );

  const generalEntries = useMemo(
    () => entries.filter((entry) => !entry.sessionLogId),
    [entries],
  );

  const sessionEntriesByLogId = useMemo(() => {
    const grouped = new Map<string, TrainerAthleteFeedback[]>();
    for (const entry of entries) {
      if (!entry.sessionLogId) continue;
      const current = grouped.get(entry.sessionLogId) ?? [];
      current.push(entry);
      grouped.set(entry.sessionLogId, current);
    }
    return grouped;
  }, [entries]);

  return {
    entries,
    generalEntries,
    sessionEntriesByLogId,
    latest: entries[0],
    latestGeneral: generalEntries[0],
    isLoading,
    sending,
    persistent,
    error,
    send,
    update,
    remove,
    refresh: load,
  };
}
