import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isAdminRole, isTrainerRole } from '@/lib/athleteService';
import {
  createSessionTemplate,
  deleteSessionTemplate,
  fetchSessionTemplates,
  updateSessionTemplate,
  type SessionTemplate,
} from '@/lib/sessionTemplateService';
import type { SessionTemplateTag, SessionTemplateFormatTag, SessionTemplateModalityTag } from '@/lib/sessionTemplateTags';

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
let loadSeq = 0;

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
  const isAdmin = isAdminRole(user?.role);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const trainerIdRef = useRef(trainerId);
  trainerIdRef.current = trainerId;

  const load = useCallback(async () => {
    const activeTrainerId = trainerIdRef.current;
    if (!activeTrainerId) {
      emit({
        trainerId: null,
        templates: [],
        isLoading: false,
        persistent: true,
        error: null,
      });
      setHasLoadedOnce(false);
      return;
    }

    const seq = ++loadSeq;
    const keepCurrent =
      snapshot.trainerId === activeTrainerId && snapshot.templates.length > 0
        ? snapshot.templates
        : [];

    emit({
      trainerId: activeTrainerId,
      isLoading: keepCurrent.length === 0,
      error: null,
      templates: keepCurrent,
    });

    try {
      const result = await fetchSessionTemplates(activeTrainerId, isDemoMode, isAdmin);
      if (seq !== loadSeq || trainerIdRef.current !== activeTrainerId) return;

      emit({
        trainerId: activeTrainerId,
        templates: result.templates,
        persistent: result.persistent,
        isLoading: false,
        error: null,
      });
      setHasLoadedOnce(true);
    } catch (error) {
      if (seq !== loadSeq || trainerIdRef.current !== activeTrainerId) return;
      emit({
        isLoading: false,
        error: error instanceof Error ? error.message : 'No se pudieron cargar las plantillas.',
        // Conserva lo que ya hubiera en pantalla si el fetch falla.
        templates: keepCurrent.length > 0 ? keepCurrent : snapshot.templates,
      });
      setHasLoadedOnce(true);
    }
  }, [isDemoMode, isAdmin]);

  useEffect(() => {
    void load();
  }, [load, trainerId]);

  useFocusRefresh(() => load());

  const create = useCallback(
    async (
      name: string,
      content: string,
      tag: SessionTemplateTag,
      formatTag?: SessionTemplateFormatTag | null,
      modalityTag?: SessionTemplateModalityTag | null,
    ) => {
      if (!trainerId) return { error: 'Solo el entrenador puede guardar plantillas.' };

      emit({ saving: true, error: null });
      const result = await createSessionTemplate({
        trainerId,
        name,
        content,
        tag,
        formatTag,
        modalityTag,
        useLocalStore: isDemoMode,
        isAdmin,
      });

      if (result.error) {
        emit({ saving: false, error: result.error });
        return { error: result.error };
      }

      if (result.template) {
        const withoutDup = getSnapshot().templates.filter(
          (entry) => entry.id !== result.template!.id && entry.name !== result.template!.name,
        );
        emit({
          saving: false,
          persistent: !result.template.id.startsWith('local-template-'),
          templates: sortTemplates([...withoutDup, result.template]),
        });
      } else {
        emit({ saving: false });
      }

      void load();
      return {};
    },
    [trainerId, isDemoMode, isAdmin, load],
  );

  const update = useCallback(
    async (
      template: SessionTemplate,
      changes: {
        name?: string;
        content?: string;
        tag?: SessionTemplateTag | null;
        formatTag?: SessionTemplateFormatTag | null;
        modalityTag?: SessionTemplateModalityTag | null;
      },
    ) => {
      emit({ saving: true, error: null });
      const result = await updateSessionTemplate({
        template,
        ...changes,
        useLocalStore: isDemoMode || template.id.startsWith('local-template-'),
      });

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
    [isDemoMode, load],
  );

  const remove = useCallback(
    async (template: SessionTemplate) => {
      emit({ error: null });
      const result = await deleteSessionTemplate(
        template,
        isDemoMode || template.id.startsWith('local-template-'),
      );
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
    [isDemoMode, load],
  );

  return {
    templates: state.trainerId === trainerId ? state.templates : [],
    isLoading: Boolean(trainerId) && !hasLoadedOnce && state.isLoading,
    saving: state.saving,
    persistent: state.persistent,
    error: state.error,
    isTrainer: Boolean(trainerId),
    isAdmin,
    create,
    update,
    remove,
    refresh: load,
    clearError: () => emit({ error: null }),
  };
}
