import { useCallback, useEffect, useState } from 'react';

import {
  deleteSessionVideo,
  fetchSessionVideos,
  uploadSessionVideo,
  type SessionLogVideo,
} from '@/lib/sessionVideoService';
import { pickSessionVideo } from '@/lib/sessionVideoPicker';

export function useSessionVideos(logId?: string, userId?: string) {
  const [videos, setVideos] = useState<SessionLogVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!logId) {
      setVideos([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSessionVideos(logId);
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

  const uploadVideo = useCallback(async () => {
    if (!logId || !userId) {
      return { error: 'Guarda la sesión antes de subir un video' };
    }

    const picked = await pickSessionVideo();
    if ('cancelled' in picked) return {};
    if ('error' in picked) return { error: picked.error };
    if (!('uri' in picked)) return {};

    setIsUploading(true);
    setError(null);

    const result = await uploadSessionVideo({
      userId,
      logId,
      uri: picked.uri,
      mimeType: picked.mimeType,
      fileName: picked.fileName,
    });

    setIsUploading(false);

    if (result.error) {
      setError(result.error);
      return { error: result.error };
    }

    if (result.video) {
      setVideos((current) => [result.video!, ...current]);
    }

    return {};
  }, [logId, userId]);

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

  return {
    videos,
    isLoading,
    isUploading,
    error,
    uploadVideo,
    removeVideo,
    refresh: load,
  };
}
