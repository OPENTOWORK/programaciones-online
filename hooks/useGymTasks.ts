import { useCallback, useEffect, useState } from 'react';

import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useGym } from '@/hooks/useGym';
import { fetchGymStaff } from '@/lib/gymService';
import { fetchGymTasks } from '@/lib/gymTaskService';
import type { GymTask, GymUser } from '@/lib/gymTypes';

export function useGymTasks() {
  const { gym } = useGym();
  const [tasks, setTasks] = useState<GymTask[]>([]);
  const [staff, setStaff] = useState<GymUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!gym) {
        setIsLoading(false);
        return;
      }
      if (!silent) setIsLoading(true);
      const [tasksResult, staffResult] = await Promise.all([
        fetchGymTasks(gym.id),
        fetchGymStaff(gym.id),
      ]);
      setTasks(tasksResult.data ?? []);
      setStaff(staffResult.data ?? []);
      setError(tasksResult.error ?? staffResult.error ?? null);
      setIsLoading(false);
    },
    [gym],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  return {
    tasks,
    staff,
    isLoading,
    error,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}
