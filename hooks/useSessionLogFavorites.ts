import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  fetchSessionLogFavoriteIds,
  setSessionLogFavorite,
} from '@/lib/sessionLogFavorites';

export function useSessionLogFavorites(logIds: readonly string[]) {
  const { user } = useAuth();
  const trainerId = user?.id ?? '';
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const favoriteIdsRef = useRef(favoriteIds);
  favoriteIdsRef.current = favoriteIds;
  const pendingRef = useRef(new Set<string>());
  const idsKey = logIds.join('|');

  useEffect(() => {
    let cancelled = false;
    if (!trainerId || !idsKey) {
      setFavoriteIds(new Set());
      return;
    }

    void fetchSessionLogFavoriteIds(trainerId, idsKey.split('|')).then((ids) => {
      if (!cancelled) setFavoriteIds(ids);
    });

    return () => {
      cancelled = true;
    };
  }, [idsKey, trainerId]);

  const toggleFavorite = useCallback(
    async (logId: string) => {
      if (!trainerId || !logId || pendingRef.current.has(logId)) return;
      const nextFavorite = !favoriteIdsRef.current.has(logId);
      pendingRef.current.add(logId);
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (nextFavorite) next.add(logId);
        else next.delete(logId);
        return next;
      });
      const result = await setSessionLogFavorite(trainerId, logId, nextFavorite);
      pendingRef.current.delete(logId);
      if (result.error) {
        setFavoriteIds((current) => {
          const next = new Set(current);
          if (nextFavorite) next.delete(logId);
          else next.add(logId);
          return next;
        });
      }
    },
    [trainerId],
  );

  return {
    favoriteIds,
    isFavorite: (logId: string) => favoriteIds.has(logId),
    toggleFavorite,
  };
}
