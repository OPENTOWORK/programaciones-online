import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { getActiveProgramSummary } from '@/lib/mockData';
import type { ActiveProgramSummary } from '@/lib/types';
import { fetchActiveProgramSummaries } from '@/lib/userProgramService';

export function useActiveProgram() {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const [actives, setActives] = useState<ActiveProgramSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (authLoading) return;

    if (isDemoMode) {
      const summary = getActiveProgramSummary();
      setActives(summary ? [summary] : []);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setActives([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const summaries = await fetchActiveProgramSummaries(user.id);
    setActives(summaries);
    setIsLoading(false);
  }, [authLoading, isDemoMode, user]);

  useEffect(() => {
    void load();
  }, [load]);

  return { actives, active: actives[0] ?? null, isLoading, refresh: load };
}
