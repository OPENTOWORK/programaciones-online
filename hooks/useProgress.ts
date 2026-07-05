import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { mockProgress } from '@/lib/mockData';
import { emptyProgress, fetchProgressData } from '@/lib/progressService';
import type { ProgressData } from '@/lib/types';

export function useProgress() {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState<ProgressData>(isDemoMode ? mockProgress : emptyProgress);
  const [isLoading, setIsLoading] = useState(!isDemoMode);

  const load = useCallback(async () => {
    if (authLoading) return;

    if (isDemoMode) {
      setProgress(mockProgress);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setProgress(emptyProgress);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const data = await fetchProgressData(user.id);
    setProgress(data);
    setIsLoading(false);
  }, [authLoading, isDemoMode, user]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    progress,
    isLoading,
    isEmpty: !isDemoMode && progress.history.length === 0,
    refresh: load,
  };
}
