import { useCallback, useEffect, useState } from 'react';

import {
  getCachedExerciseVideoCatalog,
  peekExerciseVideoCatalog,
} from '@/lib/exerciseVideoCatalogCache';
import { lookupExerciseVideoId, type ExerciseVideoCatalog } from '@/lib/exerciseVideoService';

export function useExerciseVideos() {
  const [catalog, setCatalog] = useState<ExerciseVideoCatalog>(() => peekExerciseVideoCatalog());
  const [isLoading, setIsLoading] = useState(() => peekExerciseVideoCatalog().byNameKey.size === 0);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      if (peekExerciseVideoCatalog().byNameKey.size > 0) {
        setCatalog(peekExerciseVideoCatalog());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const next = await getCachedExerciseVideoCatalog();
        if (!cancelled) {
          setCatalog(next);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async (force = false) => {
    setIsLoading(true);
    try {
      const next = await getCachedExerciseVideoCatalog(force);
      setCatalog(next);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVideoId = useCallback(
    (name: string, aimharderEjerId?: number, youtubeVideoId?: string) =>
      lookupExerciseVideoId(catalog, name, aimharderEjerId, youtubeVideoId),
    [catalog],
  );

  const hasVideo = useCallback(
    (name: string, aimharderEjerId?: number, youtubeVideoId?: string) =>
      Boolean(getVideoId(name, aimharderEjerId, youtubeVideoId)),
    [getVideoId],
  );

  return { catalog, isLoading, refresh, getVideoId, hasVideo };
}
