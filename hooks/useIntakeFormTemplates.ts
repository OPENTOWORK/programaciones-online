import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';
import {
  createIntakeFormTemplate,
  deleteIntakeFormTemplate,
  ensureWelcomeIntakeTemplate,
  fetchIntakeFormTemplates,
  updateIntakeFormTemplate,
} from '@/lib/intakeFormTemplateService';
import type { IntakeFormSchema, IntakeFormTemplate } from '@/lib/intakeFormTypes';

type TemplatesSnapshot = {
  trainerId: string | null;
  templates: IntakeFormTemplate[];
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

function sortTemplates(templates: IntakeFormTemplate[]) {
  return [...templates].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return a.name.localeCompare(b.name, 'es');
  });
}

export function useIntakeFormTemplates() {
  const { user, isDemoMode } = useAuth();
  const trainerId = isTrainerRole(user?.role) ? user?.id : undefined;
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
      await ensureWelcomeIntakeTemplate(activeTrainerId);
      const result = await fetchIntakeFormTemplates(activeTrainerId, isDemoMode);
      if (seq !== loadSeq || trainerIdRef.current !== activeTrainerId) return;

      emit({
        trainerId: activeTrainerId,
        templates: sortTemplates(result.templates),
        persistent: result.persistent,
        isLoading: false,
        error: null,
      });
      setHasLoadedOnce(true);
    } catch (error) {
      if (seq !== loadSeq || trainerIdRef.current !== activeTrainerId) return;
      emit({
        isLoading: false,
        error: error instanceof Error ? error.message : 'No se pudieron cargar los formularios.',
        templates: keepCurrent.length > 0 ? keepCurrent : snapshot.templates,
      });
      setHasLoadedOnce(true);
    }
  }, [isDemoMode]);

  useEffect(() => {
    void load();
  }, [load, trainerId]);

  useFocusRefresh(() => load());

  const create = useCallback(
    async (input: {
      name: string;
      description?: string;
      isDefault?: boolean;
      isActive?: boolean;
      schema: IntakeFormSchema;
    }) => {
      if (!trainerId) return { error: 'Solo el entrenador puede crear formularios.' };

      emit({ saving: true, error: null });
      const result = await createIntakeFormTemplate({
        trainerId,
        ...input,
        useLocalStore: isDemoMode,
      });

      if (result.error) {
        emit({ saving: false, error: result.error });
        return { error: result.error };
      }

      if (result.template) {
        emit({
          saving: false,
          templates: sortTemplates([
            ...getSnapshot().templates.filter((entry) => entry.id !== result.template!.id),
            result.template,
          ]),
        });
      } else {
        emit({ saving: false });
      }

      void load();
      return {};
    },
    [trainerId, isDemoMode, load],
  );

  const update = useCallback(
    async (
      template: IntakeFormTemplate,
      changes: {
        name?: string;
        description?: string;
        isDefault?: boolean;
        isActive?: boolean;
        schema?: IntakeFormSchema;
      },
    ) => {
      emit({ saving: true, error: null });
      const result = await updateIntakeFormTemplate({
        template,
        ...changes,
        useLocalStore: isDemoMode || template.id.startsWith('local-intake-'),
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
    async (template: IntakeFormTemplate) => {
      emit({ error: null });
      const result = await deleteIntakeFormTemplate(
        template,
        isDemoMode || template.id.startsWith('local-intake-'),
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
    create,
    update,
    remove,
    refresh: load,
    clearError: () => emit({ error: null }),
  };
}
