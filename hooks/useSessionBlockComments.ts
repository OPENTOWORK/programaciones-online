import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchSessionBlockComments,
  removeSessionBlockCommentAudio,
  saveSessionBlockCommentText,
  uploadSessionBlockCommentAudio,
  type SessionBlockComment,
} from '@/lib/sessionBlockCommentService';
import type { FeedbackAttachmentDraft } from '@/lib/trainerFeedbackMediaService';

type EnsureLogFn = () => Promise<{ logId?: string; error?: string }>;

export function useSessionBlockComments(logId?: string, userId?: string) {
  const [comments, setComments] = useState<SessionBlockComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingBlockKey, setSavingBlockKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const commentsByKey = useMemo(() => {
    const map = new Map<string, SessionBlockComment>();
    for (const comment of comments) {
      map.set(comment.blockKey, comment);
    }
    return map;
  }, [comments]);

  const load = useCallback(async (overrideLogId?: string) => {
    const targetLogId = overrideLogId ?? logId;
    if (!targetLogId) {
      setComments([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSessionBlockComments(targetLogId);
      setComments(data);
    } catch (loadError) {
      setComments([]);
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los comentarios');
    } finally {
      setIsLoading(false);
    }
  }, [logId]);

  useEffect(() => {
    void load();
  }, [load]);

  const ensureActiveLog = useCallback(
    async (ensureLog?: EnsureLogFn) => {
      if (logId) return { logId };
      if (!ensureLog) return { error: 'Guarda la sesión antes de añadir un comentario' };
      return ensureLog();
    },
    [logId],
  );

  const upsertComment = useCallback((comment?: SessionBlockComment, blockKey?: string) => {
    if (!comment) {
      if (!blockKey) return;
      setComments((current) => current.filter((entry) => entry.blockKey !== blockKey));
      return;
    }

    setComments((current) => {
      const next = current.filter((entry) => entry.blockKey !== comment.blockKey);
      return [...next, comment];
    });
  }, []);

  const saveText = useCallback(
    async (blockKey: string, text: string, ensureLog?: EnsureLogFn) => {
      if (!userId) return { error: 'Inicia sesión para guardar comentarios' };

      const ensured = await ensureActiveLog(ensureLog);
      if (ensured.error || !ensured.logId) {
        return { error: ensured.error ?? 'No se pudo crear el registro de la sesión' };
      }

      setSavingBlockKey(blockKey);
      setError(null);

      const result = await saveSessionBlockCommentText({
        userId,
        logId: ensured.logId,
        blockKey,
        text,
      });

      setSavingBlockKey(null);

      if (result.error) {
        setError(result.error);
        return result;
      }

      upsertComment(result.comment, blockKey);

      if (ensured.logId !== logId) {
        await load(ensured.logId);
      }

      return { ...result, logId: ensured.logId };
    },
    [ensureActiveLog, load, logId, upsertComment, userId],
  );

  const uploadAudio = useCallback(
    async (blockKey: string, draft: FeedbackAttachmentDraft, ensureLog?: EnsureLogFn) => {
      if (!userId) return { error: 'Inicia sesión para grabar una nota de voz' };

      const ensured = await ensureActiveLog(ensureLog);
      if (ensured.error || !ensured.logId) {
        return { error: ensured.error ?? 'No se pudo crear el registro de la sesión' };
      }

      setSavingBlockKey(blockKey);
      setError(null);

      const result = await uploadSessionBlockCommentAudio({
        userId,
        logId: ensured.logId,
        blockKey,
        draft,
      });

      setSavingBlockKey(null);

      if (result.error) {
        setError(result.error);
        return result;
      }

      upsertComment(result.comment, blockKey);

      if (ensured.logId !== logId) {
        await load(ensured.logId);
      }

      return { ...result, logId: ensured.logId };
    },
    [ensureActiveLog, load, logId, upsertComment, userId],
  );

  const removeAudio = useCallback(
    async (blockKey: string) => {
      if (!userId || !logId) return { error: 'Sesión no válida' };

      setSavingBlockKey(blockKey);
      setError(null);

      const result = await removeSessionBlockCommentAudio({
        userId,
        logId,
        blockKey,
      });

      setSavingBlockKey(null);

      if (result.error) {
        setError(result.error);
        return result;
      }

      upsertComment(result.comment, blockKey);
      return result;
    },
    [logId, upsertComment, userId],
  );

  return {
    commentsByKey,
    isLoading,
    savingBlockKey,
    error,
    saveText,
    uploadAudio,
    removeAudio,
    refresh: load,
  };
}
