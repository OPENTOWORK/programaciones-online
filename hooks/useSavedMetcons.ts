import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  fetchSavedMetcons,
  removeSavedMetcon,
  saveMetconToProfile,
} from '@/lib/savedMetconService';
import type { SavedMetcon } from '@/lib/types';

export function useSavedMetcons(targetUserId?: string) {
  const { user } = useAuth();
  const userId = targetUserId ?? user?.id ?? '';

  const [entries, setEntries] = useState<SavedMetcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(() => new Set());

  const load = useCallback(async () => {
    if (!userId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setEntries(await fetchSavedMetcons(userId));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  const savedWorkoutIds = useMemo(() => new Set(entries.map((entry) => entry.workoutId)), [entries]);

  const isSaved = useCallback((workoutId: string) => savedWorkoutIds.has(workoutId), [savedWorkoutIds]);

  const toggleSaved = useCallback(
    async (input: {
      workoutId: string;
      programId: string;
      workoutName: string;
      programName?: string;
    }) => {
      if (!userId) return { error: 'No hay sesión activa' };

      setSavingIds((current) => new Set(current).add(input.workoutId));

      const wasSaved = savedWorkoutIds.has(input.workoutId);
      const result = wasSaved
        ? await removeSavedMetcon(userId, input.workoutId)
        : await saveMetconToProfile({ userId, ...input });

      await load();

      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(input.workoutId);
        return next;
      });

      if (!wasSaved && !result.entry) {
        return { error: 'No se pudo guardar el metcon' };
      }

      return { warning: result.warning };
    },
    [userId, savedWorkoutIds, load],
  );

  return {
    entries,
    isLoading,
    isSaved,
    toggleSaved,
    isSaving: (workoutId: string) => savingIds.has(workoutId),
    refresh: load,
  };
}
