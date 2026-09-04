import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  fetchAthleteIntakeFormStatuses,
  isDefaultIntakeFormComplete,
} from '@/lib/athleteIntakeSubmissionService';
import { isIntakeFormComplete, fetchIntakeForm, saveIntakeForm } from '@/lib/athleteIntakeService';
import type { AthleteIntakeForm } from '@/lib/types';

export function useAthleteIntakeForm(targetUserId?: string, trainerId?: string) {
  const { user, isDemoMode } = useAuth();
  const userId = targetUserId ?? user?.id;

  const [form, setForm] = useState<AthleteIntakeForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [persistent, setPersistent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usesCustomForms, setUsesCustomForms] = useState(false);
  const [defaultTemplateId, setDefaultTemplateId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setForm(null);
      setIsLoading(false);
      setIsComplete(false);
      return;
    }

    setIsLoading(true);
    try {
      const customComplete = await isDefaultIntakeFormComplete(userId, isDemoMode, trainerId);
      if (customComplete) {
        setUsesCustomForms(true);
        setDefaultTemplateId(null);
        setIsComplete(true);
        setForm(null);
        setPersistent(true);
        return;
      }

      const statuses = await fetchAthleteIntakeFormStatuses(userId, isDemoMode, { trainerId });
      const defaultStatus = statuses.statuses.find((status) => status.template.isDefault);
      const result = await fetchIntakeForm(userId, isDemoMode);
      const legacyComplete = isIntakeFormComplete(result.form);

      if (statuses.statuses.length > 0) {
        setUsesCustomForms(true);
        setDefaultTemplateId(defaultStatus?.template.id ?? null);
        setIsComplete(Boolean(defaultStatus?.isComplete) || legacyComplete);
        setForm(legacyComplete ? result.form : null);
        setPersistent(statuses.persistent);
        return;
      }

      setUsesCustomForms(false);
      setDefaultTemplateId(null);
      setForm(result.form);
      setPersistent(result.persistent);
      setIsComplete(legacyComplete);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isDemoMode, trainerId]);

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

      if (result.form) {
        setForm(result.form);
        setIsComplete(isIntakeFormComplete(result.form));
      }
      return {};
    },
    [userId, isDemoMode, persistent],
  );

  return {
    form,
    isLoading,
    saving,
    isComplete,
    usesCustomForms,
    defaultTemplateId,
    save,
    refresh: load,
  };
}
