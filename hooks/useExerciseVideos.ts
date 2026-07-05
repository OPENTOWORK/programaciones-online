import { useCallback, useEffect, useState } from 'react';

import {
  fetchExerciseVideoCatalog,
  lookupExerciseVideoId,
  type ExerciseVideoCatalog,
} from '@/lib/exerciseVideoService';

const emptyCatalog: ExerciseVideoCatalog = {
  byEjerId: new Map(),
  byNameKey: new Map(),
};

export function useExerciseVideos() {
  const [catalog, setCatalog] = useState<ExerciseVideoCatalog>(emptyCatalog);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const next = await fetchExerciseVideoCatalog();
    setCatalog(next);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getVideoId = useCallback(
    (name: string, aimharderEjerId?: number) => lookupExerciseVideoId(catalog, name, aimharderEjerId),
    [catalog],
  );

  const hasVideo = useCallback(
    (name: string, aimharderEjerId?: number) => Boolean(getVideoId(name, aimharderEjerId)),
    [getVideoId],
  );

  return { catalog, isLoading, refresh, getVideoId, hasVideo };
}
