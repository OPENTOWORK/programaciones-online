import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { fetchAthletes, fetchAthleteById } from '@/lib/athleteService';
import { mockAthletes } from '@/lib/mockData';
import type { AthleteSummary } from '@/lib/types';

export function useAthletes() {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const [athletes, setAthletes] = useState<AthleteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (authLoading) return;

    if (isDemoMode) {
      if (user?.role !== 'entrenador') {
        setAthletes([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setAthletes(mockAthletes);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (user?.role !== 'entrenador') {
      setAthletes([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAthletes();
      setAthletes(data);
    } catch (loadError) {
      setAthletes([]);
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los atletas');
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isDemoMode, user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  return { athletes, isLoading, isEmpty: !isLoading && athletes.length === 0, error, refresh: load };
}

export function useAthlete(athleteId: string) {
  const { user, isDemoMode } = useAuth();
  const [athlete, setAthlete] = useState<AthleteSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [athleteId, isDemoMode, user?.role]);

  return { athlete, isLoading };
}
