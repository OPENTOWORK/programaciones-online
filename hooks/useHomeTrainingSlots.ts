import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';
import { splitSlotsByTime } from '@/lib/homeTrainingSchedule';
import {
  bookHomeTrainingSlot,
  cancelHomeTrainingSlot,
  createHomeTrainingSlot,
  fetchHomeTrainingSlots,
  type HomeTrainingSlotDraft,
} from '@/lib/homeTrainingSlotService';
import { createStaleRefresh } from '@/lib/staleRefresh';
import type { HomeTrainingSlot } from '@/lib/types';

function slotsVisibleToViewer(slots: HomeTrainingSlot[], userId: string, isTrainer: boolean) {
  if (isTrainer) return slots;
  return slots.filter((slot) => slot.status === 'open' || slot.athleteId === userId);
}

export function useHomeTrainingSlots(options?: { asAthlete?: boolean }) {
  const { user, isDemoMode } = useAuth();
  const userId = user?.id;
  const isTrainer = isTrainerRole(user?.role) && !options?.asAthlete;

  const [slots, setSlots] = useState<HomeTrainingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persistent, setPersistent] = useState(true);
  const refreshGate = useRef(createStaleRefresh(45_000));

  const useLocalStore = isDemoMode || !persistent;

  const load = useCallback(
    async ({ silent = false, force = false }: { silent?: boolean; force?: boolean } = {}) => {
      if (!userId) return;
      if (!force && silent && !refreshGate.current.shouldRefresh(false)) return;

      if (!silent) setIsLoading(true);

      try {
        const board = await fetchHomeTrainingSlots({ userId, isTrainer, isDemoMode });
        setSlots(slotsVisibleToViewer(board.slots, userId, isTrainer));
        setPersistent(board.persistent);
        setError(null);
        refreshGate.current.markFetched();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los huecos');
      } finally {
        setIsLoading(false);
      }
    },
    [userId, isTrainer, isDemoMode],
  );

  useEffect(() => {
    refreshGate.current = createStaleRefresh(45_000);
    void load({ force: true });
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  const upsert = useCallback((slot: HomeTrainingSlot) => {
    setSlots((current) => {
      const exists = current.some((item) => item.id === slot.id);
      const next = exists
        ? current.map((item) => (item.id === slot.id ? slot : item))
        : [...current, slot];
      return next.sort((left, right) => right.startsAt.localeCompare(left.startsAt));
    });
  }, []);

  const create = useCallback(
    async (draft: HomeTrainingSlotDraft) => {
      if (!userId) return { error: 'Sesión no disponible.' };

      const { slot, error: createError } = await createHomeTrainingSlot(draft, {
        userId,
        isTrainer,
        useLocalStore,
      });

      if (!slot) return { error: createError };
      upsert(slot);
      return { slot, error: createError };
    },
    [userId, isTrainer, useLocalStore, upsert],
  );

  const book = useCallback(
    async (slot: HomeTrainingSlot) => {
      if (!userId) return { error: 'Sesión no disponible.' };

      const { slot: updated, error: bookError } = await bookHomeTrainingSlot(slot, {
        userId,
        isTrainer,
        useLocalStore,
      });

      if (!updated) return { error: bookError };
      upsert(updated);
      return { slot: updated };
    },
    [userId, isTrainer, useLocalStore, upsert],
  );

  const cancel = useCallback(
    async (slot: HomeTrainingSlot) => {
      if (!userId) return { error: 'Sesión no disponible.' };

      const { slot: updated, error: cancelError } = await cancelHomeTrainingSlot(slot, {
        userId,
        isTrainer,
        useLocalStore,
      });

      if (!updated) return { error: cancelError };
      upsert(updated);
      return { slot: updated };
    },
    [userId, isTrainer, useLocalStore, upsert],
  );

  const { upcoming, past } = useMemo(() => splitSlotsByTime(slots), [slots]);

  return {
    slots,
    upcoming,
    past,
    isLoading,
    error,
    persistent,
    isTrainer,
    viewerId: userId,
    refresh: useCallback(() => load({ silent: true, force: true }), [load]),
    create,
    book,
    cancel,
  };
}
