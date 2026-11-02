import { useCallback, useEffect, useState } from 'react';

import { useAthletePreviewMode } from '@/hooks/useAthletePreviewMode';
import { useAuth } from '@/hooks/useAuth';
import { fetchAthleteIsCededToOtherTrainer } from '@/lib/athleteService';

export function useAthleteCededAccess() {
  const { user } = useAuth();
  const preview = useAthletePreviewMode();
  const [isCeded, setIsCeded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (preview.enabled) {
      setIsCeded(preview.simulateCededAthlete);
      setIsLoading(false);
      return;
    }

    if (!user?.id || user.role !== 'atleta') {
      setIsCeded(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const ceded = await fetchAthleteIsCededToOtherTrainer(user.id);
      setIsCeded(ceded);
    } catch {
      setIsCeded(false);
    } finally {
      setIsLoading(false);
    }
  }, [preview.enabled, preview.simulateCededAthlete, user?.id, user?.role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { isCeded, isLoading, refresh };
}
