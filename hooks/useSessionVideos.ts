import { useCallback, useEffect, useState } from 'react';

import {
  deleteSessionVideo,
  fetchSessionVideos,
  uploadSessionVideo,
  type SessionLogVideo,
} from '@/lib/sessionVideoService';
import { pickSessionVideo, type SessionVideoSource } from '@/lib/sessionVideoPicker';

export type UploadSessionVideoOptions = {
  source?: SessionVideoSource;
  exerciseKey?: string;
  exerciseName?: string;
  /** Si aún no hay log, se llama para crearlo y devolver el id. */
  ensureLogId?: () => Promise<{ logId?: string; error?: string }>;
};

export function useSessionVideos(logId?: string, userId?: string) {
  const [videos, setVideos] = useState<SessionLogVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingExerciseKey, setUploadingExerciseKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (overrideLogId?: string) => {
    const targetLogId = overrideLogId ?? logId;
    if (!targetLogId) {
      setVideos([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSessionVideos(targetLogId);
      setVideos(data);
    } catch (loadError) {
      setVideos([]);
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los videos');
    } finally {
      setIsLoading(false);
    }
  }, [logId]);

  useEffect(() => {
    void load();
  }, [load]);

  const uploadVideo = useCallback(
    async (options: UploadSessionVideoOptions = {}) => {
      if (!userId) {
        return { error: 'Inicia sesión para subir un video' };
      }

      let activeLogId = logId;
      if (!activeLogId) {
        if (!options.ensureLogId) {
          return { error: 'Guarda la sesión antes de subir un video' };
        }
        const ensured = await options.ensureLogId();
        if (ensured.error || !ensured.logId) {
          return { error: ensured.error ?? 'No se pudo crear el registro de la sesión' };
        }
        activeLogId = ensured.logId;
      }

      const source = options.source ?? 'library';
      const picked = await pickSessionVideo(source);
      if ('cancelled' in picked) return {};
      if ('error' in picked) return { error: picked.error };
      if (!('uri' in picked)) return {};

      setIsUploading(true);
      setUploadingExerciseKey(options.exerciseKey ?? null);
      setError(null);

      const result = await uploadSessionVideo({
        userId,
        logId: activeLogId,
        uri: picked.uri,
        mimeType: picked.mimeType,
        fileName: picked.fileName,
        exerciseKey: options.exerciseKey,
        exerciseName: options.exerciseName,
      });

      setIsUploading(false);
      setUploadingExerciseKey(null);

      if (result.error) {
        setError(result.error);
        return { error: result.error };
      }

      if (result.video) {
        setVideos((current) => [result.video!, ...current.filter((video) => video.id !== result.video!.id)]);
        if (activeLogId !== logId) {
          await load(activeLogId);
        }
      }

      return { video: result.video, logId: activeLogId };
    },
    [load, logId, userId],
  );

  const removeVideo = useCallback(
    async (videoId: string) => {
      if (!userId) return { error: 'Sesión no válida' };

      setVideos((current) => current.filter((video) => video.id !== videoId));
      const result = await deleteSessionVideo(videoId, userId);
      if (result.error) {
        await load();
        setError(result.error);
      }
      return result;
    },
    [load, userId],
  );

  const videosForExercise = useCallback(
    (exerciseKey: string) => videos.filter((video) => video.exerciseKey === exerciseKey),
    [videos],
  );

  return {
    videos,
    isLoading,
    isUploading,
    uploadingExerciseKey,
    error,
    uploadVideo,
    removeVideo,
    videosForExercise,
    refresh: load,
  };
}
