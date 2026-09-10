import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useGym } from '@/hooks/useGym';
import { fetchAthletes, fetchAthleteById, isGymRole, isTrainerRole } from '@/lib/athleteService';
import { fetchGymMemberAthleteByUserId, fetchGymMemberAthletes } from '@/lib/gymService';
import { mockAthletes } from '@/lib/mockData';
import { createStaleRefresh } from '@/lib/staleRefresh';
import type { AthleteSummary } from '@/lib/types';

export function useAthletes() {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const { gym } = useGym();
  const [athletes, setAthletes] = useState<AthleteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshGate = useRef(createStaleRefresh(45_000));

  const load = useCallback(
    async ({ silent = false, force = false }: { silent?: boolean; force?: boolean } = {}) => {
      if (authLoading) return;
      if (!force && silent && !refreshGate.current.shouldRefresh(false)) return;

      if (isDemoMode) {
        if (!isTrainerRole(user?.role)) {
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

      if (!isTrainerRole(user?.role) && !isGymRole(user?.role)) {
        setAthletes((current) => (current.length === 0 ? current : []));
        setError((current) => (current === null ? current : null));
        setIsLoading((current) => (current ? false : current));
        return;
      }

      if (isGymRole(user?.role)) {
        if (!gym?.id) {
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
          const data = await fetchGymMemberAthletes(gym.id);
          setAthletes(data);
          refreshGate.current.markFetched();
        } catch (loadError) {
          setAthletes([]);
          setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los atletas');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }
      setError((current) => (current === null ? current : null));

      try {
        const data = await fetchAthletes({ role: user?.role, trainerId: user?.id });
        setAthletes(data);
        refreshGate.current.markFetched();
      } catch (loadError) {
        setAthletes([]);
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los atletas');
      } finally {
        setIsLoading(false);
      }
    },
    [authLoading, gym?.id, isDemoMode, user?.id, user?.role],
  );

  useEffect(() => {
    refreshGate.current = createStaleRefresh(45_000);
    void load({ force: true });
  }, [load]);

  const refresh = useCallback((force = false) => load({ silent: true, force }), [load]);

  const patchAthlete = useCallback((athleteId: string, patch: Partial<AthleteSummary>) => {
    setAthletes((current) =>
      current.map((athlete) => (athlete.id === athleteId ? { ...athlete, ...patch } : athlete)),
    );
  }, []);

  return { athletes, isLoading, isEmpty: !isLoading && athletes.length === 0, error, refresh, patchAthlete };
}

export function useAthlete(athleteId: string) {
  const { user, isDemoMode } = useAuth();
  const { gym } = useGym();
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
        if (!isTrainerRole(user?.role)) {
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

      if (!isTrainerRole(user?.role) && !isGymRole(user?.role)) {
        setAthlete(null);
        setIsLoading(false);
        return;
      }

      if (isGymRole(user?.role)) {
        if (!gym?.id) {
          setAthlete(null);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const data = await fetchGymMemberAthleteByUserId(gym.id, athleteId);
        if (!cancelled) {
          setAthlete(data);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      const data = await fetchAthleteById(athleteId, { role: user?.role, trainerId: user?.id });
      if (!cancelled) {
        setAthlete(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [athleteId, gym?.id, isDemoMode, user?.id, user?.role, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  return { athlete, isLoading, refresh };
}
