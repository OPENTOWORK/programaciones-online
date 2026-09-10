import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';
import {
  type AthleteRepMax,
  groupRepMaxesByExercise,
} from '@/lib/repMax';
import {
  createAthleteRepMax,
  deleteAthleteRepMax,
  fetchAthleteRepMaxes,
  updateAthleteRepMax,
  type RepMaxInput,
} from '@/lib/repMaxService';
import { isSupabaseConfigured } from '@/lib/supabase';

export function useRepMaxes(targetUserId?: string) {
  const { user, isDemoMode } = useAuth();
  const userId = targetUserId ?? user?.id;
  const actorId = user?.id;
  const canEdit =
    Boolean(userId) &&
    Boolean(actorId) &&
    (userId === actorId || isTrainerRole(user?.role));
  const useLocalStore = isDemoMode || !isSupabaseConfigured;

  const [entries, setEntries] = useState<AthleteRepMax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!userId) {
        setEntries([]);
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);
      setError(null);
      try {
        const result = await fetchAthleteRepMaxes(userId);
        setEntries(result.entries);
        setPersistent(result.persistent);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => {
    void load({ silent: true });
  });

  const save = useCallback(
    async (input: RepMaxInput, existing?: AthleteRepMax) => {
      if (!userId || !canEdit) {
        return { error: 'No puedes editar estas marcas de RM.' };
      }

      setSaving(true);
      setError(null);

      const result = existing
        ? await updateAthleteRepMax({
            entry: existing,
            next: input,
            useLocalStore: useLocalStore || !persistent,
          })
        : await createAthleteRepMax({
            userId,
            actorId,
            entry: input,
            useLocalStore: useLocalStore || !persistent,
          });

      setSaving(false);

      if (result.error || !result.entry) {
        const failure = result.error ?? 'No se pudo guardar el RM.';
        setError(failure);
        return { error: failure };
      }

      setEntries((current) => {
        if (existing) {
          return current.map((item) => (item.id === existing.id ? result.entry! : item));
        }
        return [result.entry!, ...current.filter((item) => item.id !== result.entry!.id)];
      });
      void load({ silent: true });

      if ('warning' in result && result.warning) {
        setError(result.warning);
      }

      return { entry: result.entry };
    },
    [userId, actorId, canEdit, useLocalStore, persistent, load],
  );

  const remove = useCallback(
    async (entry: AthleteRepMax) => {
      if (!canEdit) {
        return { error: 'No puedes eliminar estas marcas de RM.' };
      }

      const result = await deleteAthleteRepMax(entry, useLocalStore || !persistent);
      if (result.error) {
        setError(result.error);
        return result;
      }
      setEntries((current) => current.filter((item) => item.id !== entry.id));
      return {};
    },
    [canEdit, useLocalStore, persistent],
  );

  const groups = useMemo(() => groupRepMaxesByExercise(entries), [entries]);

  return {
    entries,
    groups,
    isLoading,
    saving,
    persistent,
    error,
    canEdit,
    save,
    remove,
    refresh: load,
  };
}
