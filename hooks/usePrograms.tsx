import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  getActiveProgramSummary,
  getProgramById,
  getProgramsByCategory,
  getWorkoutById,
} from '@/lib/mockData';
import { getDemoCatalog } from '@/lib/programEditService';
import { sortHypePrograms } from '@/lib/hypeCatalog';
import { fetchPlansAndPrograms, fetchProgramById, mergeAppServicePlans, type Plan } from '@/lib/programService';
import { createStaleRefresh } from '@/lib/staleRefresh';
import { isServicePlanCategory } from '@/lib/trainerConstants';
import type { Program, ProgramCategory, Workout } from '@/lib/types';
import { fetchWorkoutById, fetchWorkoutsByProgram } from '@/lib/workoutService';

const catalogRefresh = createStaleRefresh(60_000);

const PLAN_CATEGORY_ORDER: ProgramCategory[] = [
  'personalized',
  'standard',
  'hype',
  'nutrition',
  'home_training',
  'gym_training',
];

const demoPlans: Plan[] = [
  { id: 'personalized', label: 'Personal · Coaching', category: 'personalized' },
  { id: 'standard', label: 'Base · Training', category: 'standard' },
  { id: 'hype', label: 'HYPE · Performance', category: 'hype' },
];

function sortPlans(plans: Plan[]) {
  return [...plans].sort(
    (a, b) => PLAN_CATEGORY_ORDER.indexOf(a.category) - PLAN_CATEGORY_ORDER.indexOf(b.category),
  );
}

function getProgramsForPlan(planId: string, plans: Plan[], programs: Program[]) {
  const plan = plans.find((item) => item.id === planId);
  if (!plan) return [];

  const list = isServicePlanCategory(plan.category)
    ? programs.filter((program) => program.category === plan.category)
    : programs.filter((program) => program.planId === planId);

  return plan.category === 'hype' ? sortHypePrograms(list) : list;
}

interface ProgramsContextValue {
  plans: Plan[];
  programs: Program[];
  isLoading: boolean;
  error: string | null;
  workouts: Workout[];
  refresh: () => Promise<void>;
  getByPlanId: (planId: string) => Program[];
  getProgramsForPlan: (planId: string) => Program[];
  getByCategory: (category: ProgramCategory) => Program[];
  getById: (id: string) => Program | undefined;
  getWorkout: (id: string) => Workout | undefined;
  getActiveSummary: () => ReturnType<typeof getActiveProgramSummary>;
}

const ProgramsContext = createContext<ProgramsContextValue | null>(null);

export function ProgramsProvider({ children }: { children: ReactNode }) {
  const { isDemoMode } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (isDemoMode) {
      const demoCatalog = getDemoCatalog();
      setPlans(sortPlans(mergeAppServicePlans(demoPlans)));
      setPrograms(demoCatalog.programs);
      setWorkouts(demoCatalog.workouts);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }
    setError((current) => (current === null ? current : null));

    try {
      const catalog = await fetchPlansAndPrograms();
      setPlans(sortPlans(mergeAppServicePlans(catalog.plans)));
      setPrograms(catalog.programs);
    } catch (loadError) {
      if (!silent) {
        setPlans([]);
        setPrograms([]);
        setWorkouts([]);
      }
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las programaciones');
    } finally {
      setIsLoading((current) => (current ? false : current));
    }
  }, [isDemoMode]);

  const refresh = useCallback(
    (force = false) => {
      if (!catalogRefresh.shouldRefresh(force)) {
        return Promise.resolve();
      }

      return catalogRefresh.track(loadCatalog({ silent: true }));
    },
    [loadCatalog],
  );

  useEffect(() => {
    void loadCatalog({ silent: true });
  }, [loadCatalog]);

  const getByPlanId = useCallback(
    (planId: string) => getProgramsForPlan(planId, plans, programs),
    [plans, programs],
  );
  const getProgramsForPlanFn = useCallback(
    (planId: string) => getProgramsForPlan(planId, plans, programs),
    [plans, programs],
  );
  const getByCategory = useCallback(
    (category: ProgramCategory) => getProgramsByCategory(category, programs),
    [programs],
  );
  const getById = useCallback(
    (id: string) => programs.find((program) => program.id === id) ?? getProgramById(id),
    [programs],
  );
  const getWorkout = useCallback(
    (id: string) => workouts.find((workout) => workout.id === id) ?? getWorkoutById(id),
    [workouts],
  );
  const getActiveSummary = useCallback(() => getActiveProgramSummary(), []);

  const value = useMemo<ProgramsContextValue>(
    () => ({
      plans,
      programs,
      isLoading,
      error,
      workouts,
      refresh,
      getByPlanId,
      getProgramsForPlan: getProgramsForPlanFn,
      getByCategory,
      getById,
      getWorkout,
      getActiveSummary,
    }),
    [
      plans,
      programs,
      workouts,
      isLoading,
      error,
      refresh,
      getByPlanId,
      getProgramsForPlanFn,
      getByCategory,
      getById,
      getWorkout,
      getActiveSummary,
    ],
  );

  return <ProgramsContext.Provider value={value}>{children}</ProgramsContext.Provider>;
}

export function usePrograms() {
  const context = useContext(ProgramsContext);
  if (!context) {
    throw new Error('usePrograms debe usarse dentro de ProgramsProvider');
  }
  return context;
}

export function useProgram(id: string, options?: { refetchOnFocus?: boolean }) {
  const refetchOnFocus = options?.refetchOnFocus ?? true;
  const { isDemoMode } = useAuth();
  const { programs, getWorkout } = usePrograms();
  const getWorkoutRef = useRef(getWorkout);
  getWorkoutRef.current = getWorkout;
  const focusRefresh = useRef(createStaleRefresh(45_000));
  const [program, setProgram] = useState<Program | undefined>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);

  const loadWorkouts = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!program) {
        setWorkouts([]);
        setLoadingWorkouts(false);
        return;
      }

      if (!silent) {
        setLoadingWorkouts(true);
      }

      try {
        if (isDemoMode) {
          const weekOne = program.weeks[0];
          if (!weekOne) {
            setWorkouts([]);
            return;
          }

          setWorkouts(
            weekOne.sessionIds
              .map((sessionId) => getWorkoutRef.current(sessionId.replace(/-w\d+$/, '')))
              .filter((workout): workout is Workout => Boolean(workout)),
          );
          return;
        }

        const remoteWorkouts = await fetchWorkoutsByProgram(program.id);
        setWorkouts(remoteWorkouts);
      } catch {
        if (!silent) {
          setWorkouts([]);
        }
      } finally {
        setLoadingWorkouts(false);
      }
    },
    [program, isDemoMode],
  );

  useEffect(() => {
    setProgram(undefined);
    setWorkouts([]);
    setLoadingProgram(true);
    setLoadingWorkouts(true);
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadProgram() {
      setLoadingProgram(true);

      const cached = programs.find((item) => item.id === id) ?? getProgramById(id);
      if (cached) {
        if (!cancelled) {
          setProgram(cached);
          setLoadingProgram(false);
        }
        return;
      }

      if (isDemoMode) {
        if (!cancelled) {
          setProgram(undefined);
          setLoadingProgram(false);
        }
        return;
      }

      const remoteProgram = await fetchProgramById(id);
      if (cancelled) return;

      setProgram(remoteProgram ?? undefined);
      setLoadingProgram(false);
    }

    void loadProgram();

    return () => {
      cancelled = true;
    };
  }, [programs, id, isDemoMode]);

  useEffect(() => {
    void loadWorkouts();
  }, [loadWorkouts]);

  useEffect(() => {
    focusRefresh.current = createStaleRefresh(45_000);
  }, [id]);

  useFocusRefresh(() => {
    if (!refetchOnFocus) return;
    if (!focusRefresh.current.shouldRefresh()) return;
    void focusRefresh.current.track(loadWorkouts({ silent: true }));
  });

  return {
    program,
    workouts,
    isLoading: loadingProgram || loadingWorkouts,
    isLoadingWorkouts: loadingWorkouts,
    reloadWorkouts: () => loadWorkouts({ silent: true }),
  };
}

export function useWorkout(id: string, options?: { refetchOnFocus?: boolean }) {
  const refetchOnFocus = options?.refetchOnFocus ?? false;
  const { isDemoMode } = useAuth();
  const { getWorkout } = usePrograms();
  const getWorkoutRef = useRef(getWorkout);
  getWorkoutRef.current = getWorkout;
  const focusRefresh = useRef(createStaleRefresh(45_000));
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkout = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!id) {
        setWorkout(null);
        setIsLoading(false);
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }

      try {
        if (isDemoMode) {
          setWorkout(getWorkoutRef.current(id) ?? null);
          return;
        }

        const remoteWorkout = await fetchWorkoutById(id);
        setWorkout(remoteWorkout);
      } catch {
        if (!silent) {
          setWorkout(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [id, isDemoMode],
  );

  useEffect(() => {
    void loadWorkout();
  }, [loadWorkout]);

  useEffect(() => {
    focusRefresh.current = createStaleRefresh(45_000);
  }, [id]);

  useFocusRefresh(() => {
    if (!refetchOnFocus) return;
    if (!focusRefresh.current.shouldRefresh()) return;
    void focusRefresh.current.track(loadWorkout({ silent: true }));
  });

  const refresh = useCallback(() => loadWorkout({ silent: true }), [loadWorkout]);

  return { workout, isLoading, refresh };
}
