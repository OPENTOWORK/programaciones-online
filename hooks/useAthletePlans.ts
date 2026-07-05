import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  createAthletePlan,
  fetchAthletePlansForUser,
  fetchTrainerAthletePlans,
} from '@/lib/athletePlanService';
import type { PickedPlanPdf } from '@/lib/planPdfPicker';
import type { AthletePlan, AthletePlanType } from '@/lib/types';

export function useMyAthletePlans(planType?: AthletePlanType) {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const [plans, setPlans] = useState<AthletePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (authLoading || !user?.id) return;

    if (user.role === 'entrenador') {
      setPlans([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAthletePlansForUser(user.id, planType);
      setPlans(data);
    } catch (loadError) {
      setPlans([]);
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar tus planes');
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, planType, user?.id, user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  return { plans, isLoading, error, refresh: load, isDemoMode };
}

export function useTrainerAthletePlans(planType?: AthletePlanType) {
  const { user, isDemoMode, isLoading: authLoading } = useAuth();
  const [plans, setPlans] = useState<AthletePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (authLoading || !user?.id) return;

    if (user.role !== 'entrenador') {
      setPlans([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTrainerAthletePlans(user.id, planType);
      setPlans(data);
    } catch (loadError) {
      setPlans([]);
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los planes');
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, planType, user?.id, user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  const createPlan = useCallback(
    async (input: {
      athleteId: string;
      planType: AthletePlanType;
      title: string;
      content: string;
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

  return { plans, isLoading, error, refresh: load, createPlan, isDemoMode };
}
