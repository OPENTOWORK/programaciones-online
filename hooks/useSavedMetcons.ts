import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  fetchSavedMetcons,
  removeSavedMetcon,
  saveMetconToProfile,
} from '@/lib/savedMetconService';
import type { SavedMetcon } from '@/lib/types';

type SavedMetconsSnapshot = {
  userId: string;
  entries: SavedMetcon[];
  isLoading: boolean;
  savingIds: Set<string>;
  version: number;
};

const EMPTY_SNAPSHOT: SavedMetconsSnapshot = {
  userId: '',
  entries: [],
  isLoading: false,
  savingIds: new Set(),
  version: 0,
};

let snapshot: SavedMetconsSnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();
let loadSeq = 0;

function emit(next: Partial<SavedMetconsSnapshot>) {
  snapshot = { ...snapshot, ...next, version: snapshot.version + 1 };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function useSavedMetcons(targetUserId?: string) {
  const { user } = useAuth();
  const userId = targetUserId ?? user?.id ?? '';
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const load = useCallback(async () => {
    const activeUserId = userIdRef.current;
    if (!activeUserId) {
      emit({
        userId: '',
        entries: [],
        isLoading: false,
        savingIds: new Set(),
      });
      return;
    }

    const seq = ++loadSeq;
    emit({ userId: activeUserId, isLoading: true });

    const entries = await fetchSavedMetcons(activeUserId);
    if (seq !== loadSeq) return;

    emit({
      userId: activeUserId,
      entries,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load, userId]);

  useFocusRefresh(() => load());

  const entries = state.userId === userId ? state.entries : [];
  const isLoading = state.userId === userId ? state.isLoading : true;
  const savingIds = state.userId === userId ? state.savingIds : new Set<string>();

  const savedWorkoutIds = useMemo(() => new Set(entries.map((entry) => entry.workoutId)), [entries]);

  const isSaved = useCallback((workoutId: string) => savedWorkoutIds.has(workoutId), [savedWorkoutIds]);

  const toggleSaved = useCallback(
    async (input: {
      workoutId: string;
      programId: string;
      workoutName: string;
      programName?: string;
    }) => {
      const activeUserId = userIdRef.current;
      if (!activeUserId) return { error: 'No hay sesión activa' };

      const nextSavingIds = new Set(savingIds).add(input.workoutId);
      emit({ savingIds: nextSavingIds });

      const wasSaved = savedWorkoutIds.has(input.workoutId);
      const result = wasSaved
        ? await removeSavedMetcon(activeUserId, input.workoutId)
        : await saveMetconToProfile({ userId: activeUserId, ...input });

      await load();

      const clearedSavingIds = new Set(snapshot.savingIds);
      clearedSavingIds.delete(input.workoutId);
      emit({ savingIds: clearedSavingIds });

      if (!wasSaved && !('entry' in result && result.entry)) {
        return { error: 'No se pudo guardar el metcon' };
      }

      return { warning: result.warning };
    },
    [savedWorkoutIds, savingIds, load],
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
