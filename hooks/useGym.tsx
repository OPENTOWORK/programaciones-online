import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/athleteService';
import { fetchMyGyms, type GymMembershipContext } from '@/lib/gymService';
import { canManageGym, canOperateGym, type Gym, type GymUserRole } from '@/lib/gymTypes';

interface GymContextValue {
  /** Gimnasio activo. `null` mientras carga o si el usuario no tiene ninguno. */
  gym: Gym | null;
  /** Rol interno dentro del gimnasio activo. */
  gymRole?: GymUserRole;
  /** Todos los gimnasios del usuario, para poder cambiar entre ellos. */
  memberships: GymMembershipContext[];
  isGlobalAdmin: boolean;
  permissions: {
    canOperate: boolean;
    canManage: boolean;
  };
  loading: boolean;
  error: string | null;
  selectGym: (gymId: string) => void;
  refresh: () => void;
  /** Aplica cambios del gimnasio ya guardados, sin recargar todo. */
  patchGym: (changes: Partial<Gym>) => void;
}

const EMPTY_GYM_CONTEXT: GymContextValue = {
  gym: null,
  memberships: [],
  isGlobalAdmin: false,
  permissions: { canOperate: false, canManage: false },
  loading: true,
  error: null,
  selectGym: () => undefined,
  refresh: () => undefined,
  patchGym: () => undefined,
};

const GymContext = createContext<GymContextValue>(EMPTY_GYM_CONTEXT);

export function GymProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isGlobalAdmin = isAdminRole(user?.role);

  const [memberships, setMemberships] = useState<GymMembershipContext[]>([]);
  const [activeGymId, setActiveGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setMemberships([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await fetchMyGyms();
    const loaded = result.data ?? [];

    setMemberships(loaded);
    setError(result.error ?? null);
    setActiveGymId((current) => {
      if (current && loaded.some((entry) => entry.gym.id === current)) return current;
      return loaded[0]?.gym.id ?? null;
    });
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = useMemo(
    () => memberships.find((entry) => entry.gym.id === activeGymId),
    [activeGymId, memberships],
  );

  const patchGym = useCallback((changes: Partial<Gym>) => {
    setMemberships((current) =>
      current.map((entry) =>
        entry.gym.id === changes.id || (!changes.id && entry.gym.id === activeGymId)
          ? { ...entry, gym: { ...entry.gym, ...changes } }
          : entry,
      ),
    );
  }, [activeGymId]);

  const value = useMemo<GymContextValue>(
    () => ({
      gym: active?.gym ?? null,
      gymRole: active?.role,
      memberships,
      isGlobalAdmin,
      permissions: {
        canOperate: canOperateGym(active?.role, isGlobalAdmin),
        canManage: canManageGym(active?.role, isGlobalAdmin),
      },
      loading,
      error,
      selectGym: setActiveGymId,
      refresh: () => void load(),
      patchGym,
    }),
    [active, error, isGlobalAdmin, load, loading, memberships, patchGym],
  );

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}

export function useGym() {
  return useContext(GymContext);
}
