import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  emptyNutritionProfile,
  fetchNutritionProfile,
  saveNutritionProfile,
} from '@/lib/nutritionProfileService';
import type { NutritionProfile } from '@/lib/types';

type NutritionProfileSnapshot = {
  userId: string;
  profile: NutritionProfile;
  isLoading: boolean;
  saving: boolean;
  version: number;
};

const EMPTY_SNAPSHOT: NutritionProfileSnapshot = {
  userId: '',
  profile: emptyNutritionProfile,
  isLoading: false,
  saving: false,
  version: 0,
};

let snapshot: NutritionProfileSnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();
let loadSeq = 0;

function emit(next: Partial<NutritionProfileSnapshot>) {
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

export function useNutritionProfile(targetUserId?: string) {
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
        profile: emptyNutritionProfile,
        isLoading: false,
        saving: false,
      });
      return;
    }

    const seq = ++loadSeq;
    emit({ userId: activeUserId, isLoading: true });

    const profile = await fetchNutritionProfile(activeUserId);
    if (seq !== loadSeq) return;

    emit({ userId: activeUserId, profile, isLoading: false });
  }, []);

  useEffect(() => {
    void load();
  }, [load, userId]);

  useFocusRefresh(() => load());

  const isCurrentUser = state.userId === userId;
  const profile = isCurrentUser ? state.profile : emptyNutritionProfile;
  const isLoading = isCurrentUser ? state.isLoading : true;
  const saving = isCurrentUser ? state.saving : false;

  const save = useCallback(
    async (next: NutritionProfile) => {
      const activeUserId = userIdRef.current;
      if (!activeUserId) return { error: 'No hay sesión activa' };

      emit({ userId: activeUserId, saving: true });
      const result = await saveNutritionProfile(activeUserId, next);
      emit({ saving: false });

      if (result.error) return result;

      emit({ userId: activeUserId, profile: next });
      await load();
      return { warning: result.warning };
    },
    [load],
  );

  return { profile, isLoading, saving, save, refresh: load };
}
