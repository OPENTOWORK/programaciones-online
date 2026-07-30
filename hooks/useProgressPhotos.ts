import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  emptyProgressPhotos,
  fetchProgressPhotos,
  uploadProgressPhoto,
  type PhotoTipo,
  type ProgressPhotosState,
} from '@/lib/photoService';

export function useProgressPhotos() {
  const { user, isDemoMode } = useAuth();
  const userId = user?.id;
  const [photos, setPhotos] = useState<ProgressPhotosState>(emptyProgressPhotos);
  const [isLoading, setIsLoading] = useState(!isDemoMode);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (isDemoMode || !userId) {
      setPhotos((current) => (current === emptyProgressPhotos ? current : emptyProgressPhotos));
      setIsLoading((current) => (current ? false : current));
      return;
    }

    setIsLoading(true);
    setError(null);
    const state = await fetchProgressPhotos(userId);
    setPhotos(state);
    setIsLoading(false);
  }, [isDemoMode, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const uploadPhoto = useCallback(
    async (tipo: PhotoTipo, imageUri: string, mimeType?: string) => {
      if (isDemoMode) {
        setError('Sube fotos con tu cuenta real, no en modo demo');
        return { error: 'Modo demo' };
      }

      if (!userId) {
        setError('Inicia sesión para subir fotos');
        return { error: 'Sin sesión' };
      }

      setIsUploading(true);
      setError(null);

      const result = await uploadProgressPhoto(userId, tipo, imageUri, mimeType);
      if (result.error) {
        setError(result.error);
      } else if (result.state) {
        setPhotos(result.state);
      }

      setIsUploading(false);
      return result;
    },
    [isDemoMode, userId],
  );

  return {
    photos,
    isLoading,
    isUploading,
    error,
    uploadPhoto,
    refresh,
    isDemoMode,
  };
}
