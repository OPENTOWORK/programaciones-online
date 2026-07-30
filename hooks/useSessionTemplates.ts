import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';
import {
  createSessionTemplate,
  deleteSessionTemplate,
  fetchSessionTemplates,
  updateSessionTemplate,
  type SessionTemplate,
} from '@/lib/sessionTemplateService';

export function useSessionTemplates() {
  const { user, isDemoMode } = useAuth();
  const trainerId = isTrainerRole(user?.role) ? user?.id : undefined;

  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(trainerId));
  const [persistent, setPersistent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!trainerId) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchSessionTemplates(trainerId, isDemoMode);
      setTemplates(result.templates);
      setPersistent(result.persistent);
    } finally {
      setIsLoading(false);
    }
  }, [trainerId, isDemoMode]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  const useLocalStore = isDemoMode || !persistent;

  const create = useCallback(
    async (name: string, content: string) => {
      if (!trainerId) return { error: 'Solo el entrenador puede guardar plantillas.' };

      setSaving(true);
      setError(null);
      const result = await createSessionTemplate({ trainerId, name, content, useLocalStore });
      setSaving(false);

      if (result.error) {
        setError(result.error);
        return { error: result.error };
      }
      if (result.template) {
        setTemplates((current) =>
          [...current, result.template!].sort((a, b) => a.name.localeCompare(b.name, 'es')),
        );
      }
      return {};
    },
    [trainerId, useLocalStore],
  );

  const update = useCallback(
    async (template: SessionTemplate, changes: { name?: string; content?: string }) => {
      setSaving(true);
      setError(null);
      const result = await updateSessionTemplate({ template, ...changes, useLocalStore });
      setSaving(false);

      if (result.error) {
        setError(result.error);
        return { error: result.error };
      }
      if (result.template) {
        setTemplates((current) =>
          current
            .map((entry) => (entry.id === result.template!.id ? result.template! : entry))
            .sort((a, b) => a.name.localeCompare(b.name, 'es')),
        );
      }
      return {};
    },
    [useLocalStore],
  );

  const remove = useCallback(
    async (template: SessionTemplate) => {
      setError(null);
      const result = await deleteSessionTemplate(template, useLocalStore);
      if (result.error) {
        setError(result.error);
        return result;
      }
      setTemplates((current) => current.filter((entry) => entry.id !== template.id));
      return {};
    },
    [useLocalStore],
  );

  return {
    templates,
    isLoading,
    saving,
    persistent,
    error,
    isTrainer: Boolean(trainerId),
    create,
    update,
    remove,
    refresh: load,
    clearError: () => setError(null),
  };
}
