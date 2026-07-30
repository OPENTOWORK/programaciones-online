import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { addCrmActivity, deleteCrmActivity, fetchCrmActivity } from '@/lib/trainerCrmActivity';
import type { CrmActivityEntry } from '@/lib/types';

export function useTrainerCrmActivity(athleteId: string) {
  const { user, isDemoMode } = useAuth();
  const trainerId = user?.id;

  const [entries, setEntries] = useState<CrmActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [persistent, setPersistent] = useState(true);

  const useLocalStore = isDemoMode || !persistent;

  const load = useCallback(async () => {
    if (!trainerId || !athleteId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchCrmActivity(trainerId, athleteId, isDemoMode);
      setEntries(result.entries);
      setPersistent(result.persistent);
    } finally {
      setIsLoading(false);
    }
  }, [trainerId, athleteId, isDemoMode]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  const addNote = useCallback(
    async (message: string) => {
      if (!trainerId || !athleteId) return;
      const trimmed = message.trim();
      if (!trimmed) return;

      const entry = await addCrmActivity(trainerId, athleteId, trimmed, 'note', useLocalStore);
      setEntries((prev) => [entry, ...prev]);
    },
    [trainerId, athleteId, useLocalStore],
  );

  const removeEntry = useCallback(
    async (entryId: string) => {
      if (!trainerId || !athleteId) return;
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      await deleteCrmActivity(trainerId, athleteId, entryId, useLocalStore);
    },
    [trainerId, athleteId, useLocalStore],
  );

  return { entries, isLoading, persistent, addNote, removeEntry, refresh: load };
}
