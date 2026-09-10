import { useCallback, useEffect, useMemo, useState } from 'react';

import { addDays, startOfWeek } from '@/hooks/useGymData';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useGym } from '@/hooks/useGym';
import {
  fetchGymTrainingSessions,
  fetchHypeTrainingPrograms,
  gymDateKey,
  type GymTrainingSession,
} from '@/lib/gymTraining';
import { isHypeGym } from '@/lib/hypeGymSchedule';
import { buildHypeBoardSessions, hypeBoardPrograms } from '@/lib/hypeGymTrainingBoard';
import type { Program, Workout } from '@/lib/types';
import { fetchWorkoutsByIds } from '@/lib/workoutService';

export function useGymTvDay(initialDate = new Date()) {
  const { gym, loading: gymLoading } = useGym();
  const hypeOnly = isHypeGym(gym);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sessions, setSessions] = useState<GymTrainingSession[]>([]);
  const [workoutsById, setWorkoutsById] = useState<Record<string, Workout>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateKey = gymDateKey(selectedDate);
  const weekStart = useMemo(() => startOfWeek(selectedDate), [dateKey]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const weekFrom = gymDateKey(weekStart);
  const weekTo = gymDateKey(addDays(weekStart, 6));

  const load = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (gymLoading) return;
    if (!silent) setIsLoading(true);
    try {
      if (hypeOnly) {
        setPrograms(hypeBoardPrograms());
        setSessions(buildHypeBoardSessions({ from: weekFrom, to: weekTo }));
        setError(null);
        return;
      }
      const loadedPrograms = await fetchHypeTrainingPrograms();
      const loadedSessions = await fetchGymTrainingSessions(loadedPrograms, {
        from: weekFrom,
        to: weekTo,
      });
      setPrograms(loadedPrograms);
      setSessions(loadedSessions);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los entrenos.');
    } finally {
      setIsLoading(false);
    }
  }, [gymLoading, hypeOnly, weekFrom, weekTo]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  const daySessions = useMemo(
    () => sessions.filter((session) => session.dateKey === dateKey),
    [dateKey, sessions],
  );

  const weekSessionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const session of sessions) {
      counts[session.dateKey] = (counts[session.dateKey] ?? 0) + 1;
    }
    return counts;
  }, [sessions]);

  const goToPreviousDay = useCallback(() => setSelectedDate((current) => addDays(current, -1)), []);
  const goToNextDay = useCallback(() => setSelectedDate((current) => addDays(current, 1)), []);
  const goToPreviousWeek = useCallback(() => setSelectedDate((current) => addDays(current, -7)), []);
  const goToNextWeek = useCallback(() => setSelectedDate((current) => addDays(current, 7)), []);
  const goToToday = useCallback(() => setSelectedDate(new Date()), []);
  const refresh = useCallback(() => load({ silent: true }), [load]);

  useEffect(() => {
    const ids = daySessions.map((session) => session.id).filter((id) => !id.startsWith('hype-board-'));
    if (ids.length === 0) {
      setWorkoutsById({});
      setLoadingWorkouts(false);
      return;
    }

    let cancelled = false;
    setLoadingWorkouts(true);
    void fetchWorkoutsByIds(ids).then((workouts) => {
      if (cancelled) return;
      setWorkoutsById(Object.fromEntries(workouts.map((workout) => [workout.id, workout])));
      setLoadingWorkouts(false);
    });

    return () => {
      cancelled = true;
    };
  }, [daySessions]);

  return {
    selectedDate,
    dateKey,
    weekDays,
    programs,
    daySessions,
    workoutsById,
    isLoading,
    loadingWorkouts,
    error,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    refresh,
    weekSessionCounts,
  };
}
