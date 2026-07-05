import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  getActiveProgramSummary,
  getProgramById,
  getProgramsByCategory,
  getWorkoutById,
} from '@/lib/mockData';
import { getDemoCatalog } from '@/lib/programEditService';
import { fetchPlansAndPrograms, fetchProgramById, mergeAppServicePlans, type Plan } from '@/lib/programService';
import { isServicePlanCategory } from '@/lib/trainerConstants';
import type { Program, ProgramCategory, Workout } from '@/lib/types';
import { fetchWorkoutById, fetchWorkoutsByProgram } from '@/lib/workoutService';

const PLAN_CATEGORY_ORDER: ProgramCategory[] = [
  'personalized',
  'standard',
  'hype',
  'nutrition',
  'home_training',
];

const demoPlans: Plan[] = [
  { id: 'personalized', label: 'Personalizado', category: 'personalized' },
  { id: 'standard', label: 'Estándar', category: 'standard' },
  { id: 'hype', label: 'Hype / Intensivas', category: 'hype' },
];

function sortPlans(plans: Plan[]) {
  return [...plans].sort(
    (a, b) => PLAN_CATEGORY_ORDER.indexOf(a.category) - PLAN_CATEGORY_ORDER.indexOf(b.category),
  );
}

function getProgramsForPlan(planId: string, plans: Plan[], programs: Program[]) {
  const plan = plans.find((item) => item.id === planId);
  if (!plan) return [];

  if (isServicePlanCategory(plan.category)) {
    return programs.filter((program) => program.category === plan.category);
  }

  return programs.filter((program) => program.planId === planId);
}

export function usePrograms() {
  const { isDemoMode } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    if (isDemoMode) {
      const demoCatalog = getDemoCatalog();
      setPlans(sortPlans(mergeAppServicePlans(demoPlans)));
      setPrograms(demoCatalog.programs);
      setWorkouts(demoCatalog.workouts);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const catalog = await fetchPlansAndPrograms();
      setPlans(sortPlans(mergeAppServicePlans(catalog.plans)));
      setPrograms(catalog.programs);

      const syncedWorkouts = (
        await Promise.all(catalog.programs.map((program) => fetchWorkoutsByProgram(program.id)))
      ).flat();

      setWorkouts(syncedWorkouts);
    } catch (loadError) {
      setPlans([]);
      setPrograms([]);
      setWorkouts([]);
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las programaciones');
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return useMemo(
    () => ({
      plans,
      programs,
      isLoading,
      error,
      workouts,
      refresh: loadCatalog,
      getByPlanId: (planId: string) => getProgramsForPlan(planId, plans, programs),
      getProgramsForPlan: (planId: string) => getProgramsForPlan(planId, plans, programs),
      getByCategory: (category: ProgramCategory) => getProgramsByCategory(category, programs),
      getById: (id: string) => programs.find((program) => program.id === id) ?? getProgramById(id),
      getWorkout: (id: string) => workouts.find((workout) => workout.id === id) ?? getWorkoutById(id),
      getActiveSummary: () => getActiveProgramSummary(),
    }),
    [plans, programs, workouts, isLoading, error, loadCatalog],
  );
}

export function useProgram(id: string) {
  const { isDemoMode } = useAuth();
  const { programs, getWorkout } = usePrograms();
  const [program, setProgram] = useState<Program | undefined>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loadingProgram, setLoadingProgram] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProgram() {
      const cached = programs.find((item) => item.id === id) ?? getProgramById(id);
      if (cached) {
        setProgram(cached);
        setLoadingProgram(false);
        return;
      }

      if (isDemoMode) {
        setProgram(undefined);
        setLoadingProgram(false);
        return;
      }

      const remoteProgram = await fetchProgramById(id);
      if (cancelled) return;

      setProgram(remoteProgram ?? undefined);
      setLoadingProgram(false);
    }

    loadProgram();

    return () => {
      cancelled = true;
    };
  }, [programs, id, isDemoMode]);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkouts() {
      if (!program) {
        setWorkouts([]);
        return;
      }

      if (isDemoMode) {
        const weekOne = program.weeks[0];
        if (!weekOne) {
          setWorkouts([]);
          return;
        }

        setWorkouts(
          weekOne.sessionIds
            .map((sessionId) => getWorkout(sessionId.replace(/-w\d+$/, '')))
            .filter((workout): workout is Workout => Boolean(workout)),
        );
        return;
      }

      const remoteWorkouts = await fetchWorkoutsByProgram(program.id);
      if (!cancelled) {
        setWorkouts(remoteWorkouts);
      }
    }

    loadWorkouts();

    return () => {
      cancelled = true;
    };
  }, [program, isDemoMode, getWorkout]);

  return { program, workouts, isLoading: loadingProgram };
}
