import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  emptyTrainingProfile,
  fetchTrainingProfile,
  saveTrainingProfile,
  type TrainingProfileInput,
} from '@/lib/trainingProfileService';
import type { TrainingProfile } from '@/lib/types';

type TrainingProfileSnapshot = {
  userId: string;
  preferences: TrainingProfileInput;
  isLoading: boolean;
  saving: boolean;
  version: number;
};

const EMPTY_SNAPSHOT: TrainingProfileSnapshot = {
  userId: '',
  preferences: emptyTrainingProfile,
  isLoading: false,
  saving: false,
  version: 0,
};

let snapshot: TrainingProfileSnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();
let loadSeq = 0;

function emit(next: Partial<TrainingProfileSnapshot>) {
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

/**
 * La experiencia y las limitaciones se leen y escriben en `"Perfil"` (nivel y lesiones),
 * el resto de preferencias viven en `user_training_profile`.
 */
export function useTrainingProfile(targetUserId?: string) {
  const { user, updateProfile } = useAuth();
  const userId = targetUserId ?? user?.id ?? '';
  const isOwnProfile = !targetUserId || targetUserId === user?.id;
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const load = useCallback(async () => {
    const activeUserId = userIdRef.current;
    if (!activeUserId) {
      emit({
        userId: '',
        preferences: emptyTrainingProfile,
        isLoading: false,
        saving: false,
      });
      return;
    }

    const seq = ++loadSeq;
    emit({ userId: activeUserId, isLoading: true });

    const preferences = await fetchTrainingProfile(activeUserId);
    if (seq !== loadSeq) return;

    emit({ userId: activeUserId, preferences, isLoading: false });
  }, []);

  useEffect(() => {
    void load();
  }, [load, userId]);

  useFocusRefresh(() => load());

  const isCurrentUser = state.userId === userId;
  const preferences = isCurrentUser ? state.preferences : emptyTrainingProfile;
  const isLoading = isCurrentUser ? state.isLoading : true;
  const saving = isCurrentUser ? state.saving : false;

  const profile: TrainingProfile = useMemo(
    () => ({
      ...preferences,
      trainingExperience: isOwnProfile ? user?.fitnessLevel : undefined,
      injuriesOrLimitations: isOwnProfile ? user?.injuries : undefined,
    }),
    [preferences, isOwnProfile, user?.fitnessLevel, user?.injuries],
  );

  const save = useCallback(
    async (next: TrainingProfile) => {
      const activeUserId = userIdRef.current;
      if (!activeUserId || !user) return { error: 'No hay sesión activa' };

      const { trainingExperience, injuriesOrLimitations, ...rest } = next;

      emit({ userId: activeUserId, saving: true });
      const [preferencesResult, profileResult] = await Promise.all([
        saveTrainingProfile(activeUserId, rest),
        updateProfile({
          name: user.name,
          fitnessLevel: trainingExperience,
          injuries: injuriesOrLimitations,
        }),
      ]);
      emit({ saving: false });

      const error = preferencesResult.error ?? profileResult.error;
      if (error) return { error };

      emit({ userId: activeUserId, preferences: rest });
      await load();
      const warning = preferencesResult.warning;
      return { warning };
    },
    [user, updateProfile, load],
  );

  return { profile, isLoading, saving, save, refresh: load };
}
