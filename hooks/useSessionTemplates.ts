import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

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

type TemplatesSnapshot = {
  trainerId: string | null;
  templates: SessionTemplate[];
  persistent: boolean;
  isLoading: boolean;
  saving: boolean;
  error: string | null;
  version: number;
};

const EMPTY_SNAPSHOT: TemplatesSnapshot = {
  trainerId: null,
  templates: [],
  persistent: true,
  isLoading: false,
  saving: false,
  error: null,
  version: 0,
};

let snapshot: TemplatesSnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();

function emit(next: Partial<TemplatesSnapshot>) {
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

function sortTemplates(templates: SessionTemplate[]) {
  return [...templates].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function useSessionTemplates() {
  const { user, isDemoMode } = useAuth();
  const trainerId = isTrainerRole(user?.role) ? user?.id : undefined;
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [bootstrappedFor, setBootstrappedFor] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!trainerId) {
      emit({
        trainerId: null,
        templates: [],
        isLoading: false,
        persistent: true,
        error: null,
      });
      setBootstrappedFor(null);
      return;
    }

    emit({ trainerId, isLoading: true, error: null });
    try {
      const result = await fetchSessionTemplates(trainerId, isDemoMode);
      emit({
        trainerId,
        templates: result.templates,
        persistent: result.persistent,
        isLoading: false,
      });
      setBootstrappedFor(trainerId);
    } catch (error) {
      emit({
        isLoading: false,
        error: error instanceof Error ? error.message : 'No se pudieron cargar las plantillas.',
      });
      setBootstrappedFor(trainerId);
    }
  }, [trainerId, isDemoMode]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  const useLocalStore = isDemoMode || !state.persistent;
  const ready = Boolean(trainerId) && bootstrappedFor === trainerId && !state.isLoading;

  const create = useCallback(
    async (name: string, content: string) => {
      if (!trainerId) return { error: 'Solo el entrenador puede guardar plantillas.' };
      if (!ready) return { error: 'Espera un momento a que carguen las plantillas.' };

      emit({ saving: true, error: null });
      const result = await createSessionTemplate({ trainerId, name, content, useLocalStore });

      if (result.error) {
        emit({ saving: false, error: result.error });
        return { error: result.error };
      }

      if (result.template) {
        emit({
          saving: false,
          templates: sortTemplates([...getSnapshot().templates, result.template]),
        });
      } else {
        emit({ saving: false });
      }

      // Releer de la fuente de verdad para que todos los listados queden alineados.
      void load();
      return {};
    },
    [trainerId, useLocalStore, ready, load],
  );

  const update = useCallback(
    async (template: SessionTemplate, changes: { name?: string; content?: string }) => {
      emit({ saving: true, error: null });
      const result = await updateSessionTemplate({ template, ...changes, useLocalStore });

      if (result.error) {
        emit({ saving: false, error: result.error });
        return { error: result.error };
      }

      if (result.template) {
        emit({
          saving: false,
          templates: sortTemplates(
            getSnapshot().templates.map((entry) =>
              entry.id === result.template!.id ? result.template! : entry,
            ),
          ),
        });
      } else {
        emit({ saving: false });
      }

      void load();
      return {};
    },
    [useLocalStore, load],
  );

  const remove = useCallback(
    async (template: SessionTemplate) => {
      emit({ error: null });
      const result = await deleteSessionTemplate(template, useLocalStore);
      if (result.error) {
        emit({ error: result.error });
        return result;
      }
      emit({
        templates: getSnapshot().templates.filter((entry) => entry.id !== template.id),
      });
      void load();
      return {};
    },
    [useLocalStore, load],
  );

  return {
    templates: state.trainerId === trainerId ? state.templates : [],
    isLoading: state.isLoading || (Boolean(trainerId) && bootstrappedFor !== trainerId),
    saving: state.saving,
    persistent: state.persistent,
    error: state.error,
    isTrainer: Boolean(trainerId),
    create,
    update,
    remove,
    refresh: load,
    clearError: () => emit({ error: null }),
  };
}
