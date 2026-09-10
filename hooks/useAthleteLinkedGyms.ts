import { useCallback, useEffect, useState } from 'react';

import { fetchMyLinkedGyms, type AthleteLinkedGym } from '@/lib/athleteGymService';

export function useAthleteLinkedGyms() {
  const [gyms, setGyms] = useState<AthleteLinkedGym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchMyLinkedGyms();
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      setGyms([]);
      return;
    }

    setError(null);
    setGyms(result.data ?? []);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { gyms, isLoading, error, refresh };
}
