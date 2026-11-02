import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';
import {
  deleteTrainerExerciseNote,
  fetchAthleteExerciseNoteSummary,
  fetchExerciseNoteHistory,
  fetchSessionExerciseNotes,
  saveTrainerExerciseNote,
  type TrainerExerciseNote,
  type TrainerExerciseNoteDraft,
  type TrainerExerciseNoteSummary,
} from '@/lib/trainerExerciseNoteService';

interface UseTrainerExerciseNotesOptions {
  athleteId?: string;
  sessionLogId?: string;
  /** Sesión del plan, para apuntar sobre el plan aunque el atleta no haya registrado nada. */
  athletePlanId?: string;
  /** Fecha del entreno revisado; si falta, se usa hoy. */
  performedOn?: string;
}

function todayKey() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Apuntes privados del entrenador sobre los ejercicios de una sesión, con el
 * historial de semanas anteriores del mismo ejercicio para comparar la evolución.
 */
export function useTrainerExerciseNotes({
  athleteId,
  sessionLogId,
  athletePlanId,
  performedOn,
}: UseTrainerExerciseNotesOptions) {
  const { user } = useAuth();
  const trainerId = isTrainerRole(user?.role) ? user?.id : undefined;
  const enabled = Boolean(trainerId && athleteId && (sessionLogId || athletePlanId));

  /**
   * Un plan recurrente se repite semana a semana, así que su "sesión actual" es el
   * día en que el entrenador escribe; todo lo demás pasa a ser historial.
   */
  const noteDate = sessionLogId ? performedOn || todayKey() : todayKey();

  const [notes, setNotes] = useState<TrainerExerciseNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyByKey, setHistoryByKey] = useState<Record<string, TrainerExerciseNote[]>>({});
  const [loadingHistoryKey, setLoadingHistoryKey] = useState<string | null>(null);
  const [summaryByKey, setSummaryByKey] = useState<Record<string, TrainerExerciseNoteSummary>>({});

  const load = useCallback(async () => {
    if (!trainerId || !athleteId || !(sessionLogId || athletePlanId)) {
      setNotes([]);
      setSummaryByKey({});
      return;
    }

    setIsLoading(true);
    setError(null);

    const [result, summary] = await Promise.all([
      fetchSessionExerciseNotes({
        trainerId,
        athleteId,
        sessionLogId,
        athletePlanId,
        performedOn: noteDate,
      }),
      fetchAthleteExerciseNoteSummary({
        trainerId,
        athleteId,
        excludeSessionLogId: sessionLogId,
        excludePerformedOn: sessionLogId ? undefined : noteDate,
      }),
    ]);

    setNotes(result.notes);
    setSummaryByKey(summary);
    setPersistent(result.persistent);
    setIsLoading(false);
  }, [athleteId, athletePlanId, noteDate, sessionLogId, trainerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const notesByExercise = useMemo(() => {
    const map = new Map<string, TrainerExerciseNote[]>();
    for (const note of notes) {
      const current = map.get(note.exerciseKey);
      if (current) current.push(note);
      else map.set(note.exerciseKey, [note]);
    }
    for (const list of map.values()) {
      list.sort((left, right) => (left.setNumber ?? 0) - (right.setNumber ?? 0));
    }
    return map;
  }, [notes]);

  const loadHistory = useCallback(
    async (exerciseKey: string, force = false) => {
      if (!trainerId || !athleteId || !exerciseKey) return;
      if (!force && historyByKey[exerciseKey]) return;

      setLoadingHistoryKey(exerciseKey);
      const history = await fetchExerciseNoteHistory({
        trainerId,
        athleteId,
        exerciseKey,
        excludeSessionLogId: sessionLogId,
        excludePerformedOn: sessionLogId ? undefined : noteDate,
      });
      setHistoryByKey((current) => ({ ...current, [exerciseKey]: history }));
      setLoadingHistoryKey(null);
    },
    [athleteId, historyByKey, noteDate, sessionLogId, trainerId],
  );

  const saveNote = useCallback(
    async (input: {
      exerciseKey: string;
      exerciseName: string;
      draft: TrainerExerciseNoteDraft;
      noteId?: string;
      sessionVideoId?: string;
    }) => {
      if (!trainerId || !athleteId) {
        return { error: 'Solo el entrenador puede guardar apuntes.' };
      }

      setSavingKey(input.exerciseKey);
      setError(null);

      const result = await saveTrainerExerciseNote({
        noteId: input.noteId,
        trainerId,
        athleteId,
        sessionLogId,
        sessionVideoId: input.sessionVideoId,
        athletePlanId,
        exerciseKey: input.exerciseKey,
        exerciseName: input.exerciseName,
        performedOn: noteDate,
        draft: input.draft,
      });

      setSavingKey(null);

      if (result.error || !result.note) {
        setError(result.error ?? 'No se pudo guardar el apunte.');
        return { error: result.error };
      }

      const saved = result.note;
      setNotes((current) => {
        const without = current.filter((note) => note.id !== saved.id);
        return [...without, saved];
      });

      // El historial de este ejercicio cambia en cuanto se apunta algo nuevo.
      void loadHistory(input.exerciseKey, true);

      return { note: saved };
    },
    [athleteId, athletePlanId, loadHistory, noteDate, sessionLogId, trainerId],
  );

  const removeNote = useCallback(
    async (note: TrainerExerciseNote) => {
      setSavingKey(note.exerciseKey);
      setError(null);

      const result = await deleteTrainerExerciseNote(note.id);
      setSavingKey(null);

      if (result.error) {
        setError(result.error);
        return result;
      }

      setNotes((current) => current.filter((entry) => entry.id !== note.id));
      void loadHistory(note.exerciseKey, true);
      return {};
    },
    [loadHistory],
  );

  /** Siguiente número de serie libre para ese ejercicio en esta sesión. */
  const nextSetNumber = useCallback(
    (exerciseKey: string) => {
      const used = notesByExercise.get(exerciseKey) ?? [];
      return Math.min(99, used.length + 1);
    },
    [notesByExercise],
  );

  return {
    enabled,
    isLoading,
    persistent,
    savingKey,
    error,
    notesByExercise,
    historyByKey,
    summaryByKey,
    loadingHistoryKey,
    loadHistory,
    saveNote,
    removeNote,
    nextSetNumber,
    refresh: load,
  };
}
