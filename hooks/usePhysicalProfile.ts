import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  deriveBodyMetrics,
  type BodyMeasurement,
  type DerivedBodyMetrics,
  type MeasuredBodyMetrics,
  type MeasurementSource,
  type PhysicalProfileBasics,
} from '@/lib/bodyMetrics';
import { fetchBodyMeasurements, latestBodyMeasurement, recordBodyMeasurement } from '@/lib/bodyMeasurementsService';
import {
  fetchPhysicalProfile,
  savePhysicalProfile,
  type PhysicalProfileInput,
} from '@/lib/physicalProfileService';
import { createStaleRefresh } from '@/lib/staleRefresh';

const refreshGate = createStaleRefresh(30_000);

export interface PhysicalDataUpdate {
  basics: PhysicalProfileInput;
  measured: MeasuredBodyMetrics;
  source?: MeasurementSource;
}

/**
 * Une las tres fuentes de datos físicos: lo que declara el usuario, la última medición
 * registrada y los valores que la app calcula a partir de ambos.
 *
 * `fallback` sirve para consultar la ficha de otra persona (por ejemplo un entrenador
 * mirando a su atleta), donde la altura y el peso llegan de `"Perfil"`.
 */
export function usePhysicalProfile(
  targetUserId?: string,
  fallback?: { heightCm?: number; weightKg?: number },
) {
  const { user } = useAuth();
  const userId = targetUserId ?? user?.id ?? '';
  const isOwnProfile = !targetUserId || targetUserId === user?.id;
  const heightCm = fallback?.heightCm ?? (isOwnProfile ? user?.height : undefined);
  const profileWeightKg = fallback?.weightKg ?? (isOwnProfile ? user?.weight : undefined);

  const [basicsRecord, setBasicsRecord] = useState<PhysicalProfileInput>({});
  const [history, setHistory] = useState<BodyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!userId) {
        setBasicsRecord({});
        setHistory([]);
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);
      const [profile, measurements] = await Promise.all([
        fetchPhysicalProfile(userId),
        fetchBodyMeasurements(userId),
      ]);
      setBasicsRecord(profile);
      setHistory(measurements);
      refreshGate.markFetched();
      setIsLoading(false);
    },
    [userId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => {
    if (!refreshGate.shouldRefresh()) return;
    void load({ silent: true });
  });

  const latest = useMemo(() => latestBodyMeasurement(history), [history]);

  const basics: PhysicalProfileBasics = useMemo(
    () => ({ ...basicsRecord, heightCm }),
    [basicsRecord, heightCm],
  );

  const measured: MeasuredBodyMetrics = useMemo(
    () => ({
      weightKg: latest?.weightKg ?? profileWeightKg,
      bodyFatPercentage: latest?.bodyFatPercentage,
      muscleMassKg: latest?.muscleMassKg,
      bodyWaterPercentage: latest?.bodyWaterPercentage,
      visceralFat: latest?.visceralFat,
      boneMassKg: latest?.boneMassKg,
      waistCm: latest?.waistCm,
      restingHeartRate: latest?.restingHeartRate,
      metabolicAge: latest?.metabolicAge,
    }),
    [latest, profileWeightKg],
  );

  const derived: DerivedBodyMetrics = useMemo(() => deriveBodyMetrics(basics, measured), [basics, measured]);

  const save = useCallback(
    async ({ basics: nextBasics, measured: nextMeasured, source = 'manual' }: PhysicalDataUpdate) => {
      if (!userId) return { error: 'No hay sesión activa' };

      setSaving(true);
      const [profileResult, measurementResult] = await Promise.all([
        savePhysicalProfile(userId, nextBasics),
        recordBodyMeasurement(userId, nextMeasured, source),
      ]);
      setSaving(false);

      const error = profileResult.error ?? measurementResult.error;
      if (error) return { error };

      await load({ silent: true });
      return {};
    },
    [userId, load],
  );

  return {
    basics,
    measured,
    derived,
    history,
    latestMeasurement: latest,
    isLoading,
    saving,
    save,
    refresh: () => load({ silent: true }),
  };
}
