import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { fetchIntakeForm, isIntakeFormComplete, saveIntakeForm } from '@/lib/athleteIntakeService';
import type { AthleteIntakeForm } from '@/lib/types';

export function useAthleteIntakeForm(targetUserId?: string) {
  const { user, isDemoMode } = useAuth();
  const userId = targetUserId ?? user?.id;

  const [form, setForm] = useState<AthleteIntakeForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [persistent, setPersistent] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setForm(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchIntakeForm(userId, isDemoMode);
      setForm(result.form);
      setPersistent(result.persistent);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isDemoMode]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  const save = useCallback(
    async (updates: AthleteIntakeForm) => {
      if (!userId) return { error: 'No hay sesión activa' };

      setSaving(true);
      const useLocalStore = isDemoMode || !persistent;
      const result = await saveIntakeForm(userId, updates, useLocalStore);
      setSaving(false);

      if (result.error) return { error: result.error };

      if (result.form) setForm(result.form);
      return {};
    },
    [userId, isDemoMode, persistent],
  );

  return {
    form,
    isLoading,
    saving,
    isComplete: isIntakeFormComplete(form),
    save,
    refresh: load,
  };
}
