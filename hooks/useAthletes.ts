import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { fetchAthletes, fetchAthleteById } from '@/lib/athleteService';
import { mockAthletes } from '@/lib/mockData';
import { createStaleRefresh } from '@/lib/staleRefresh';
import type { AthleteSummary } from '@/lib/types';

export function useAthletes() {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const [athletes, setAthletes] = useState<AthleteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshGate = useRef(createStaleRefresh(45_000));

  const load = useCallback(
    async ({ silent = false, force = false }: { silent?: boolean; force?: boolean } = {}) => {
      if (authLoading) return;
      if (!force && silent && !refreshGate.current.shouldRefresh(false)) return;

      if (isDemoMode) {
        if (user?.role !== 'entrenador') {
          setAthletes((current) => (current.length === 0 ? current : []));
          setError((current) => (current === null ? current : null));
          setIsLoading((current) => (current ? false : current));
          return;
        }

        setAthletes(mockAthletes);
        setError((current) => (current === null ? current : null));
        setIsLoading(false);
        refreshGate.current.markFetched();
        return;
      }

      if (user?.role !== 'entrenador') {
        setAthletes((current) => (current.length === 0 ? current : []));
        setError((current) => (current === null ? current : null));
        setIsLoading((current) => (current ? false : current));
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }
      setError((current) => (current === null ? current : null));

      try {
        const data = await fetchAthletes();
        setAthletes(data);
        refreshGate.current.markFetched();
      } catch (loadError) {
        setAthletes([]);
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los atletas');
      } finally {
        setIsLoading(false);
      }
    },
    [authLoading, isDemoMode, user?.role],
  );

  useEffect(() => {
    refreshGate.current = createStaleRefresh(45_000);
    void load({ force: true });
  }, [load]);

  const refresh = useCallback((force = false) => load({ silent: true, force }), [load]);

  return { athletes, isLoading, isEmpty: !isLoading && athletes.length === 0, error, refresh };
}

export function useAthlete(athleteId: string) {
  const { user, isDemoMode } = useAuth();
  const [athlete, setAthlete] = useState<AthleteSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!athleteId) {
        setAthlete(null);
        setIsLoading(false);
        return;
      }

      if (isDemoMode) {
        if (user?.role !== 'entrenador') {
          setAthlete(null);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const data = mockAthletes.find((item) => item.id === athleteId) ?? null;
        if (!cancelled) {
          setAthlete(data);
          setIsLoading(false);
        }
        return;
      }

      if (user?.role !== 'entrenador') {
        setAthlete(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const data = await fetchAthleteById(athleteId);
      if (!cancelled) {
        setAthlete(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [athleteId, isDemoMode, user?.role, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  return { athlete, isLoading, refresh };
}
