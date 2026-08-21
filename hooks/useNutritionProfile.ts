import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  emptyNutritionProfile,
  fetchNutritionProfile,
  saveNutritionProfile,
} from '@/lib/nutritionProfileService';
import type { NutritionProfile } from '@/lib/types';

export function useNutritionProfile(targetUserId?: string) {
  const { user } = useAuth();
  const userId = targetUserId ?? user?.id ?? '';

  const [profile, setProfile] = useState<NutritionProfile>(emptyNutritionProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setProfile(emptyNutritionProfile);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setProfile(await fetchNutritionProfile(userId));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  const save = useCallback(
    async (next: NutritionProfile) => {
      if (!userId) return { error: 'No hay sesión activa' };

      setSaving(true);
      const result = await saveNutritionProfile(userId, next);
      setSaving(false);

      if (result.error) return result;

      setProfile(next);
      return {};
    },
    [userId],
  );

  return { profile, isLoading, saving, save, refresh: load };
}
