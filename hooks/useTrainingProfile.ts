import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  emptyTrainingProfile,
  fetchTrainingProfile,
  saveTrainingProfile,
  type TrainingProfileInput,
} from '@/lib/trainingProfileService';
import type { TrainingProfile } from '@/lib/types';

/**
 * La experiencia y las limitaciones se leen y escriben en `"Perfil"` (nivel y lesiones),
 * el resto de preferencias viven en `user_training_profile`.
 */
export function useTrainingProfile(targetUserId?: string) {
  const { user, updateProfile } = useAuth();
  const userId = targetUserId ?? user?.id ?? '';
  const isOwnProfile = !targetUserId || targetUserId === user?.id;

  const [preferences, setPreferences] = useState<TrainingProfileInput>(emptyTrainingProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setPreferences(emptyTrainingProfile);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setPreferences(await fetchTrainingProfile(userId));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

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
      if (!userId || !user) return { error: 'No hay sesión activa' };

      const { trainingExperience, injuriesOrLimitations, ...rest } = next;

      setSaving(true);
      const [preferencesResult, profileResult] = await Promise.all([
        saveTrainingProfile(userId, rest),
        updateProfile({
          name: user.name,
          fitnessLevel: trainingExperience,
          injuries: injuriesOrLimitations,
        }),
      ]);
      setSaving(false);

      const error = preferencesResult.error ?? profileResult.error;
      if (error) return { error };

      setPreferences(rest);
      return {};
    },
    [userId, user, updateProfile],
  );

  return { profile, isLoading, saving, save, refresh: load };
}
