import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';
import {
  fetchExerciseLibraryAccess,
  saveTrainerLibraryPageVisibility,
  type ExerciseLibraryAccess,
} from '@/lib/trainerLibrarySettings';

const DEFAULT_ACCESS: ExerciseLibraryAccess = {
  trainerId: null,
  athletesCanSeePageLibrary: true,
};

export function useExerciseLibraryAccess() {
  const { user } = useAuth();
  const [access, setAccess] = useState<ExerciseLibraryAccess>(DEFAULT_ACCESS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const next = await fetchExerciseLibraryAccess();
    setAccess(next);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, user?.id, user?.role]);

  const setAthletesCanSeePageLibrary = useCallback(
    async (athletesCanSeePageLibrary: boolean) => {
      if (!user?.id || !isTrainerRole(user.role)) return;

      setIsSaving(true);
      setError(null);
      const result = await saveTrainerLibraryPageVisibility(user.id, athletesCanSeePageLibrary);
      setIsSaving(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      setAccess((current) => ({
        ...current,
        trainerId: user.id,
        athletesCanSeePageLibrary,
      }));
    },
    [user?.id, user?.role],
  );

  const canManageSettings = isTrainerRole(user?.role);

  return {
    access,
    canManageSettings,
    isLoading,
    isSaving,
    error,
    refresh,
    setAthletesCanSeePageLibrary,
  };
}
