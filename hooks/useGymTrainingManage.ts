import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useGym } from '@/hooks/useGym';
import { useGymTrainingLinks } from '@/hooks/useGymData';
import { getCachedExerciseVideoCatalog } from '@/lib/exerciseVideoCatalogCache';
import {
  mergeGymTrainingItems,
  trainingManageRange,
  type GymTrainingManageItem,
} from '@/lib/gymTrainingManage';
import {
  fetchGymTrainingSessions,
  fetchHypeTrainingPrograms,
  type GymTrainingSession,
} from '@/lib/gymTraining';
import { isHypeGym } from '@/lib/hypeGymSchedule';
import { buildHypeBoardSessions, hypeBoardPrograms } from '@/lib/hypeGymTrainingBoard';
import type { Program } from '@/lib/types';

export function useGymTrainingManage() {
  const { gym, loading: gymLoading } = useGym();
  const hypeOnly = isHypeGym(gym);
  const { links, classTypes, isLoading: linksLoading, error: linksError, refresh: refreshLinks } =
    useGymTrainingLinks();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sessions, setSessions] = useState<GymTrainingSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const range = useMemo(() => trainingManageRange(hypeOnly), [hypeOnly]);

  const loadPrograms = useCallback(async () => {
    if (gymLoading) return;
    if (hypeOnly) {
      setPrograms(hypeBoardPrograms());
      return;
    }
    setPrograms(await fetchHypeTrainingPrograms());
  }, [gymLoading, hypeOnly]);

  const loadSessions = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (gymLoading) return;
      if (!silent) setSessionsLoading(true);

      try {
        if (hypeOnly) {
          setSessions(buildHypeBoardSessions(range));
          setSessionsError(null);
          return;
        }

        if (programs.length === 0) {
          setSessions([]);
          setSessionsError(null);
          return;
        }

        const loadedSessions = await fetchGymTrainingSessions(programs, range);
        setSessions(loadedSessions);
        setSessionsError(null);
      } catch (loadError) {
        setSessionsError(
          loadError instanceof Error ? loadError.message : 'No se pudieron cargar los entrenos.',
        );
      } finally {
        setSessionsLoading(false);
      }
    },
    [gymLoading, hypeOnly, programs, range],
  );

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    void getCachedExerciseVideoCatalog().finally(() => {
      void loadSessions({ silent: true });
    });
  }, [loadSessions]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const refresh = useCallback(() => {
    refreshLinks();
    void loadSessions({ silent: true });
  }, [loadSessions, refreshLinks]);

  useFocusRefresh(refresh);

  const items = useMemo<GymTrainingManageItem[]>(
    () => mergeGymTrainingItems(sessions, links, classTypes, programs),
    [classTypes, links, programs, sessions],
  );

  return {
    items,
    links,
    classTypes,
    programs,
    range,
    isLoading: gymLoading || linksLoading || sessionsLoading,
    error: linksError ?? sessionsError,
    refresh,
  };
}
