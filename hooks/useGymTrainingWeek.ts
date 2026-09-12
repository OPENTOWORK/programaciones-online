import { useCallback, useEffect, useMemo, useState } from 'react';

import { addDays, startOfWeek } from '@/hooks/useGymData';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useGym } from '@/hooks/useGym';
import { getCachedExerciseVideoCatalog } from '@/lib/exerciseVideoCatalogCache';
import { fetchGymProgramLinks } from '@/lib/gymService';
import { mergeSessionsWithProgramLinks } from '@/lib/gymTrainingManage';
import {
  fetchGymTrainingSessions,
  fetchHypeTrainingPrograms,
  groupSessionsByDay,
  gymDateKey,
  sessionsForWeek,
  weekStartsAround,
  type GymTrainingSession,
} from '@/lib/gymTraining';
import { isHypeGym } from '@/lib/hypeGymSchedule';
import { buildHypeBoardSessions, hypeBoardPrograms } from '@/lib/hypeGymTrainingBoard';
import { formatMonthLabel, getMonthGrid, shiftMonth } from '@/lib/programSchedulePreview';
import type { GymProgramLink } from '@/lib/gymTypes';
import type { Program } from '@/lib/types';

export type GymTrainingView = 'week' | 'month';

export function useGymTrainingWeek() {
  const { gym, loading: gymLoading } = useGym();
  const hypeOnly = isHypeGym(gym);
  const [focusDate, setFocusDate] = useState(() => weekStartsAround().thisWeek);
  const [view, setView] = useState<GymTrainingView>('week');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sessions, setSessions] = useState<GymTrainingSession[]>([]);
  const [programLinks, setProgramLinks] = useState<GymProgramLink[]>([]);
  const [programFilters, setProgramFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekStart = useMemo(() => startOfWeek(focusDate), [focusDate]);
  const monthDays = useMemo(() => getMonthGrid(focusDate), [focusDate]);
  const range = useMemo(() => {
    if (view === 'month') {
      return {
        from: gymDateKey(monthDays[0]),
        to: gymDateKey(monthDays[monthDays.length - 1]),
      };
    }
    return {
      from: gymDateKey(weekStart),
      to: gymDateKey(addDays(weekStart, 6)),
    };
  }, [monthDays, view, weekStart]);

  useEffect(() => {
    if (gymLoading) return;
    if (hypeOnly) {
      setPrograms(hypeBoardPrograms());
      return;
    }

    let cancelled = false;
    void fetchHypeTrainingPrograms()
      .then((loaded) => {
        if (cancelled) return;
        setPrograms(loaded);
        if (loaded.length === 0) setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudieron cargar las programaciones.');
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [gymLoading, hypeOnly]);

  const loadSessions = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (gymLoading) return;

      if (!silent) setIsLoading(true);
      try {
        const linksResult = gym ? await fetchGymProgramLinks(gym.id) : { data: [] as GymProgramLink[] };
        setProgramLinks(linksResult.data ?? []);

        if (hypeOnly) {
          setSessions(buildHypeBoardSessions(range));
          setError(linksResult.error ?? null);
          return;
        }

        if (programs.length === 0) return;

        const loadedSessions = await fetchGymTrainingSessions(programs, range);
        setSessions(loadedSessions);
        setError(linksResult.error ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los entrenos.');
      } finally {
        setIsLoading(false);
      }
    },
    [gym, gymLoading, hypeOnly, programs, range],
  );

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    void getCachedExerciseVideoCatalog().finally(() => {
      void loadSessions({ silent: true });
    });
  }, [loadSessions]);

  useFocusRefresh(() => loadSessions({ silent: true }));

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const mergedSessions = useMemo(
    () => mergeSessionsWithProgramLinks(sessions, programLinks),
    [programLinks, sessions],
  );

  const weekSessions = useMemo(
    () => sessionsForWeek(mergedSessions, weekStart, programFilters),
    [mergedSessions, programFilters, weekStart],
  );

  const sessionsByDay = useMemo(() => {
    if (view === 'month') {
      const selected = new Set(programFilters);
      const filtered =
        selected.size === 0
          ? mergedSessions
          : mergedSessions.filter((session) => selected.has(session.programId));
      return groupSessionsByDay(monthDays, filtered);
    }
    return groupSessionsByDay(days, weekSessions);
  }, [days, mergedSessions, monthDays, programFilters, view, weekSessions]);

  const toggleProgramFilter = useCallback((programId: string) => {
    setProgramFilters((current) =>
      current.includes(programId) ? current.filter((id) => id !== programId) : [...current, programId],
    );
  }, []);

  const goToDate = useCallback((value: string | Date) => {
    const date = typeof value === 'string' ? new Date(`${value}T12:00:00`) : value;
    if (Number.isNaN(date.getTime())) return;
    setFocusDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  }, []);

  return {
    focusDate,
    weekStart,
    days,
    monthDays,
    view,
    setView,
    programs,
    sessionsByDay,
    programFilters,
    isLoading: gymLoading || isLoading,
    error,
    periodLabel: view === 'month' ? formatMonthLabel(focusDate) : undefined,
    goToDate,
    goToPrevious: useCallback(() => {
      setFocusDate((current) =>
        view === 'month' ? shiftMonth(current, -1) : addDays(startOfWeek(current), -7),
      );
    }, [view]),
    goToNext: useCallback(() => {
      setFocusDate((current) =>
        view === 'month' ? shiftMonth(current, 1) : addDays(startOfWeek(current), 7),
      );
    }, [view]),
    goToThisWeek: useCallback(() => {
      setView('week');
      setFocusDate(startOfWeek(new Date()));
    }, []),
    goToNextTrainingWeek: useCallback(() => {
      setView('week');
      setFocusDate(weekStartsAround().nextWeek);
    }, []),
    openWeekForDate: useCallback((date: Date) => {
      setFocusDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
      setView('week');
    }, []),
    toggleProgramFilter,
    clearProgramFilters: useCallback(() => setProgramFilters([]), []),
    refresh: useCallback(() => loadSessions({ silent: true }), [loadSessions]),
  };
}
