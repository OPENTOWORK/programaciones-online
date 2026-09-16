import { useCallback, useEffect, useState } from 'react';

import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import { allowsSessionExerciseVideos, resolveAthleteTrainerAccess } from '@/lib/exerciseVideoAccess';

/**
 * Vídeos de ejemplo en sesiones del atleta. Oculta el catálogo cuando su entrenador es Charly.
 */
export function useAthleteSessionExerciseVideos(options?: {
  athleteId?: string | null;
  trainerId?: string | null;
}) {
  const base = useExerciseVideos();
  const athleteId = options?.athleteId ?? null;
  const trainerId = options?.trainerId ?? null;
  const shouldResolve = Boolean(athleteId || trainerId);

  const [allowsVideos, setAllowsVideos] = useState(() => !shouldResolve);

  useEffect(() => {
    if (!shouldResolve) {
      setAllowsVideos(true);
      return undefined;
    }

    let cancelled = false;

    void resolveAthleteTrainerAccess(athleteId, trainerId).then(({ trainerId: resolvedId, trainerEmail }) => {
      if (cancelled) return;
      setAllowsVideos(
        allowsSessionExerciseVideos({
          trainerId: resolvedId,
          trainerEmail,
        }),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [athleteId, shouldResolve, trainerId]);

  const getVideoId = useCallback(
    (name: string, aimharderEjerId?: number, youtubeVideoId?: string) =>
      allowsVideos ? base.getVideoId(name, aimharderEjerId, youtubeVideoId) : null,
    [allowsVideos, base.getVideoId],
  );

  const hasVideo = useCallback(
    (name: string, aimharderEjerId?: number, youtubeVideoId?: string) =>
      allowsVideos && base.hasVideo(name, aimharderEjerId, youtubeVideoId),
    [allowsVideos, base.hasVideo],
  );

  return {
    ...base,
    allowsVideos,
    getVideoId,
    hasVideo,
  };
}
