import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isAdminRole } from '@/lib/athleteService';
import { fetchAdminGymsOverview, type AdminGymRow, type AdminGymsOverview } from '@/lib/gymAdminService';
import type { GymStatus } from '@/lib/gymTypes';

export type AdminGymStatusFilter = GymStatus | 'all';

const EMPTY_OVERVIEW: AdminGymsOverview = {
  rows: [],
  plans: [],
  totals: {
    total: 0,
    active: 0,
    trial: 0,
    suspended: 0,
    cancelled: 0,
    managedMembers: 0,
    bookingsLast30Days: 0,
    mrr: 0,
    mrrIncomplete: false,
  },
};

export function useAdminGyms() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  const [overview, setOverview] = useState<AdminGymsOverview>(EMPTY_OVERVIEW);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AdminGymStatusFilter>('all');
  const [planId, setPlanId] = useState<string | 'all'>('all');
  const [query, setQuery] = useState('');

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!isAdmin) {
        setOverview(EMPTY_OVERVIEW);
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const result = await fetchAdminGymsOverview();
      setOverview(result.data ?? EMPTY_OVERVIEW);
      setError(result.error ?? null);
      setIsLoading(false);
    },
    [isAdmin],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  const visibleRows = useMemo<AdminGymRow[]>(() => {
    const normalized = query.trim().toLowerCase();

    return overview.rows.filter((row) => {
      if (status !== 'all' && row.gym.status !== status) return false;
      if (planId !== 'all' && row.subscription?.planId !== planId) return false;
      if (!normalized) return true;

      return (
        row.gym.name.toLowerCase().includes(normalized) ||
        (row.gym.city ?? '').toLowerCase().includes(normalized) ||
        (row.gym.email ?? '').toLowerCase().includes(normalized)
      );
    });
  }, [overview.rows, planId, query, status]);

  return {
    isAdmin,
    overview,
    visibleRows,
    isLoading,
    error,
    filters: { status, planId, query },
    setStatus,
    setPlanId,
    setQuery,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}
