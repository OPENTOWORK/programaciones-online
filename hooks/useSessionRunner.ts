import { useEffect, useMemo, useState } from 'react';

import {
  buildWorkoutChecklist,
  completedCount,
  completedKeys,
  completedMapFromKeys,
} from '@/lib/sessionChecklist';
import { fetchSessionLog, saveSessionLog, type SessionLogLookup } from '@/lib/sessionLogService';
import type { SessionKind } from '@/lib/trainerSessionDraft';
import type { Exercise } from '@/lib/types';

export interface SessionWorkoutContent {
  name: string;
  estimatedDuration: string;
  warmup: string;
  main: string;
  core?: string;
  cooldown: string;
  exercises: Exercise[];
  programId?: string;
  sessionNumber?: number;
  kind?: SessionKind;
}

interface UseSessionRunnerOptions {
  userId?: string;
  workout: SessionWorkoutContent;
  logLookup: SessionLogLookup;
  isDemoMode?: boolean;
}

export function useSessionRunner({ userId, workout, logLookup, isDemoMode }: UseSessionRunnerOptions) {
  const checklist = useMemo(() => buildWorkoutChecklist(workout), [workout]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [feelings, setFeelings] = useState('');
  const [loadingLog, setLoadingLog] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [logId, setLogId] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId || isDemoMode) {
        setLoadingLog(false);
        return;
      }

      setLoadingLog(true);
      try {
        const log = await fetchSessionLog(userId, logLookup);
        if (cancelled) return;

        if (log) {
          setLogId(log.id);
          setCompleted(completedMapFromKeys(log.completedItems));
          setFeelings(log.feelings ?? '');
        } else {
          setLogId(undefined);
        }
      } catch {
        // Si falla la carga del registro, mostramos la sesión igualmente.
      } finally {
        if (!cancelled) {
          setLoadingLog(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId, isDemoMode, logLookup.entrenoId, logLookup.athletePlanId, logLookup.scheduledDate]);

  const toggleItem = (key: string) => {
    setCompleted((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const save = async (markCompleted = true) => {
    if (!userId && !isDemoMode) {
      setError('Debes iniciar sesión para guardar el entreno.');
      return false;
    }

    setSaving(true);
    setError(null);

    const result = await saveSessionLog({
      userId: userId ?? 'demo-user',
      entrenoId: logLookup.entrenoId,
      athletePlanId: logLookup.athletePlanId,
      programId: workout.programId,
      scheduledDate: logLookup.scheduledDate,
      workoutName: workout.name,
      feelings,
      completedItems: completedKeys(completed),
      workout,
      markCompleted,
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return false;
    }

    if (result.log) {
      setLogId(result.log.id);
    }

    setSaved(true);
    return true;
  };

  return {
    checklist,
    completed,
    completedTotal: completedCount(completed, checklist),
    feelings,
    setFeelings,
    toggleItem,
    save,
    loadingLog,
    saving,
    error,
    saved,
    logId,
  };
}
