import { useCallback, useEffect, useState } from 'react';

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
  const [photos, setPhotos] = useState<ProgressPhotosState>(emptyProgressPhotos);
  const [isLoading, setIsLoading] = useState(!isDemoMode);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (isDemoMode || !user) {
      setPhotos(emptyProgressPhotos);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const state = await fetchProgressPhotos(user.id);
    setPhotos(state);
    setIsLoading(false);
  }, [isDemoMode, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const uploadPhoto = useCallback(
    async (tipo: PhotoTipo, imageUri: string, mimeType?: string) => {
      if (isDemoMode) {
        setError('Sube fotos con tu cuenta real, no en modo demo');
        return { error: 'Modo demo' };
      }

      if (!user) {
        setError('Inicia sesión para subir fotos');
        return { error: 'Sin sesión' };
      }

      setIsUploading(true);
      setError(null);

      const result = await uploadProgressPhoto(user.id, tipo, imageUri, mimeType);
      if (result.error) {
        setError(result.error);
      } else if (result.state) {
        setPhotos(result.state);
      }

      setIsUploading(false);
      return result;
    },
    [isDemoMode, user],
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
