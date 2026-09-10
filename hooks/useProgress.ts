import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { mockProgress } from '@/lib/mockData';
import { emptyProgress, fetchProgressData } from '@/lib/progressService';
import { createStaleRefresh } from '@/lib/staleRefresh';
import type { ProgressData } from '@/lib/types';

const progressRefresh = createStaleRefresh(60_000);

export function useProgress(targetUserId?: string) {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const userId = targetUserId ?? user?.id;
  const [progress, setProgress] = useState<ProgressData>(isDemoMode ? mockProgress : emptyProgress);
  const [isLoading, setIsLoading] = useState(!isDemoMode);
  const loadingRef = useRef(false);

  const load = useCallback(
    async ({ silent = false, force = false }: { silent?: boolean; force?: boolean } = {}) => {
      if (authLoading) return;
      if (!targetUserId && !force && silent && !progressRefresh.shouldRefresh(false)) return;
      if (loadingRef.current) return;

      if (isDemoMode) {
        setProgress((current) => (current === mockProgress ? current : mockProgress));
        setIsLoading((current) => (current ? false : current));
        return;
      }

      if (!userId) {
        setProgress((current) => (current === emptyProgress ? current : emptyProgress));
        setIsLoading((current) => (current ? false : current));
        return;
      }

      loadingRef.current = true;
      if (!silent) {
        setIsLoading(true);
      }

      try {
        const data = await fetchProgressData(userId);
        setProgress(data);
        if (!targetUserId) progressRefresh.markFetched();
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    },
    [authLoading, isDemoMode, targetUserId, userId],
  );

  useEffect(() => {
    void load({ force: true });
  }, [load]);

  const refresh = useCallback(() => load({ silent: true }), [load]);
  const reload = useCallback(() => load({ silent: true, force: true }), [load]);

  return {
    progress,
    isLoading,
    isEmpty: !isDemoMode && progress.history.length === 0,
    refresh,
    reload,
  };
}
