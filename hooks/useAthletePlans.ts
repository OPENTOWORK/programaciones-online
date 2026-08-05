import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  createAthletePlan,
  deleteAthletePlan,
  fetchAthletePlanById,
  fetchAthletePlansForUser,
  fetchTrainerAthletePlans,
  updateAthletePlan,
} from '@/lib/athletePlanService';
import { createStaleRefresh } from '@/lib/staleRefresh';
import type { PickedPlanPdf } from '@/lib/planPdfPicker';
import type { AthletePlan, AthletePlanType, NutritionPlanData } from '@/lib/types';

export function useMyAthletePlans(planType?: AthletePlanType) {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const [plans, setPlans] = useState<AthletePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshGate = useRef(createStaleRefresh(45_000));

  const load = useCallback(
    async ({ silent = false, force = false }: { silent?: boolean; force?: boolean } = {}) => {
      if (authLoading || !user?.id) return;
      if (!force && silent && !refreshGate.current.shouldRefresh(false)) return;

      if (user.role === 'entrenador') {
        setPlans((current) => (current.length === 0 ? current : []));
        setError((current) => (current === null ? current : null));
        setIsLoading((current) => (current ? false : current));
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchAthletePlansForUser(user.id, planType);
        setPlans(data);
        refreshGate.current.markFetched();
      } catch (loadError) {
        setPlans([]);
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar tus planes');
      } finally {
        setIsLoading(false);
      }
    },
    [authLoading, planType, user?.id, user?.role],
  );

  useEffect(() => {
    refreshGate.current = createStaleRefresh(45_000);
    void load({ force: true });
  }, [load]);

  const refresh = useCallback(() => load({ silent: true }), [load]);

  return {
    plans,
    isLoading,
    error,
    refresh,
    isDemoMode,
  };
}

export function useTrainerAthletePlans(planType?: AthletePlanType) {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const [plans, setPlans] = useState<AthletePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshGate = useRef(createStaleRefresh(45_000));

  const load = useCallback(
    async ({ silent = false, force = false }: { silent?: boolean; force?: boolean } = {}) => {
      if (authLoading || !user?.id) return;
      if (!force && silent && !refreshGate.current.shouldRefresh(false)) return;

      if (user.role !== 'entrenador') {
        setPlans((current) => (current.length === 0 ? current : []));
        setError((current) => (current === null ? current : null));
        setIsLoading((current) => (current ? false : current));
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }
      setError((current) => (current === null ? current : null));

      try {
        const data = await fetchTrainerAthletePlans(planType);
        setPlans(data);
        refreshGate.current.markFetched();
      } catch (loadError) {
        setPlans([]);
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los planes');
      } finally {
        setIsLoading(false);
      }
    },
    [authLoading, planType, user?.id, user?.role],
  );

  useEffect(() => {
    refreshGate.current = createStaleRefresh(45_000);
    void load({ force: true });
  }, [load]);

  const refresh = useCallback(() => load({ silent: true }), [load]);

  const createPlan = useCallback(
    async (input: {
      athleteId: string;
      planType: AthletePlanType;
      title: string;
      content: string;
      planGroupId?: string;
      sessionNumber?: number;
      nutritionData?: NutritionPlanData;
      athleteName?: string;
      pdf?: PickedPlanPdf;
    }) => {
      if (!user?.id) {
        return { error: 'Sesión no válida' };
      }

      try {
        const plan = await createAthletePlan({
          ...input,
          trainerId: user.id,
        });
        setPlans((current) => [plan, ...current]);
        return { plan };
      } catch (createError) {
        return {
          error: createError instanceof Error ? createError.message : 'No se pudo crear el plan',
        };
      }
    },
    [user?.id],
  );

  const updatePlan = useCallback(
    async (
      planId: string,
      input: {
        athleteId: string;
        planType: AthletePlanType;
        title: string;
        content: string;
        nutritionData?: NutritionPlanData;
        pdf?: PickedPlanPdf;
        removePdf?: boolean;
      },
    ) => {
      try {
        const plan = await updateAthletePlan(planId, input);
        setPlans((current) => current.map((existing) => (existing.id === planId ? plan : existing)));
        return { plan };
      } catch (updateError) {
        return {
          error: updateError instanceof Error ? updateError.message : 'No se pudo actualizar el plan',
        };
      }
    },
    [],
  );

  const removePlan = useCallback(async (planId: string) => {
    try {
      await deleteAthletePlan(planId);
      setPlans((current) => current.filter((plan) => plan.id !== planId));
      return {};
    } catch (deleteError) {
      return {
        error: deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el plan',
      };
    }
  }, []);

  return { plans, isLoading, error, refresh, createPlan, updatePlan, removePlan, isDemoMode };
}

export function useAthletePlan(planId: string) {
  const [plan, setPlan] = useState<AthletePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!planId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAthletePlanById(planId);
      setPlan(data);
      if (!data) {
        setError('No se encontró el plan');
      }
    } catch (loadError) {
      setPlan(null);
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el plan');
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { plan, isLoading, error, refresh: load };
}
