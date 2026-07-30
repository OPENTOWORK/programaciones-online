import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { getActiveProgramSummary } from '@/lib/mockData';
import { createStaleRefresh } from '@/lib/staleRefresh';
import type { ActiveProgramSummary } from '@/lib/types';
import { fetchActiveProgramSummaries } from '@/lib/userProgramService';

const activeProgramRefresh = createStaleRefresh(60_000);

export function useActiveProgram() {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const userId = user?.id;
  const [actives, setActives] = useState<ActiveProgramSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef(false);

  const load = useCallback(
    async ({ silent = false, force = false }: { silent?: boolean; force?: boolean } = {}) => {
      if (authLoading) return;
      if (!force && silent && !activeProgramRefresh.shouldRefresh(false)) return;
      if (loadingRef.current) return;

      if (isDemoMode) {
        const summary = getActiveProgramSummary();
        setActives((current) => {
          const next = summary ? [summary] : [];
          if (
            current.length === next.length &&
            (next.length === 0 || current[0]?.program.id === next[0]?.program.id)
          ) {
            return current;
          }
          return next;
        });
        setIsLoading((current) => (current ? false : current));
        return;
      }

      if (!userId) {
        setActives((current) => (current.length === 0 ? current : []));
        setIsLoading((current) => (current ? false : current));
        return;
      }

      loadingRef.current = true;
      if (!silent) {
        setIsLoading(true);
      }

      try {
        const summaries = await fetchActiveProgramSummaries(userId);
        setActives(summaries);
        activeProgramRefresh.markFetched();
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    },
    [authLoading, isDemoMode, userId],
  );

  useEffect(() => {
    void load({ force: true });
  }, [load]);

  const refresh = useCallback(() => load({ silent: true }), [load]);
  const reload = useCallback(() => load({ silent: true, force: true }), [load]);

  return {
    actives,
    active: actives[0] ?? null,
    isLoading,
    refresh,
    reload,
  };
}
