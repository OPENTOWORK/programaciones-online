import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

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

export interface PhysicalDataUpdate {
  basics: PhysicalProfileInput;
  measured: MeasuredBodyMetrics;
  source?: MeasurementSource;
}

type PhysicalProfileSnapshot = {
  userId: string;
  basicsRecord: PhysicalProfileInput;
  history: BodyMeasurement[];
  isLoading: boolean;
  saving: boolean;
  version: number;
};

const EMPTY_SNAPSHOT: PhysicalProfileSnapshot = {
  userId: '',
  basicsRecord: {},
  history: [],
  isLoading: false,
  saving: false,
  version: 0,
};

let snapshot: PhysicalProfileSnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();
const loadSeqByUser = new Map<string, number>();

function emit(next: Partial<PhysicalProfileSnapshot>) {
  snapshot = { ...snapshot, ...next, version: snapshot.version + 1 };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
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
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const load = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    const activeUserId = userIdRef.current;
    if (!activeUserId) {
      emit({
        userId: '',
        basicsRecord: {},
        history: [],
        isLoading: false,
        saving: false,
      });
      return;
    }

    const seq = (loadSeqByUser.get(activeUserId) ?? 0) + 1;
    loadSeqByUser.set(activeUserId, seq);
    if (!silent) emit({ userId: activeUserId, isLoading: true });

    const [profile, measurements] = await Promise.all([
      fetchPhysicalProfile(activeUserId),
      fetchBodyMeasurements(activeUserId),
    ]);

    if (loadSeqByUser.get(activeUserId) !== seq) return;

    emit({
      userId: activeUserId,
      basicsRecord: profile,
      history: measurements,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load, userId]);

  useFocusRefresh(() => {
    void load({ silent: true });
  });

  const isCurrentUser = state.userId === userId;
  const basicsRecord = isCurrentUser ? state.basicsRecord : {};
  const history = isCurrentUser ? state.history : [];
  const isLoading = isCurrentUser ? state.isLoading : true;
  const saving = isCurrentUser ? state.saving : false;

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
      const activeUserId = userIdRef.current;
      if (!activeUserId) return { error: 'No hay sesión activa' };

      emit({ userId: activeUserId, saving: true });
      const [profileResult, measurementResult] = await Promise.all([
        savePhysicalProfile(activeUserId, nextBasics),
        recordBodyMeasurement(activeUserId, nextMeasured, source),
      ]);
      emit({ saving: false });

      const error = profileResult.error ?? measurementResult.error;
      if (error) return { error };

      const warning = profileResult.warning ?? measurementResult.warning;
      await load({ silent: true });
      return { warning };
    },
    [load],
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
