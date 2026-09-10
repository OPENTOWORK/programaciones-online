import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isAdminRole, fetchProfileNamesByIds } from '@/lib/athleteService';
import { fetchAllSupportTickets, type SupportTicket } from '@/lib/supportService';
import {
  computeSupportKpis,
  filterSupportTickets,
  sortAdminSupportTickets,
  EMPTY_SUPPORT_FILTERS,
  type SupportTicketFilters,
} from '@/lib/supportTickets';

/** Bandeja de soporte del administrador: carga, filtros y KPIs. */
export function useAdminSupportTickets() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [adminNames, setAdminNames] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupportTicketFilters>(EMPTY_SUPPORT_FILTERS);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!isAdmin) {
        setTickets([]);
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const result = await fetchAllSupportTickets();
      const loaded = result.data ?? [];
      setTickets(loaded);
      setError(result.error ?? null);

      const assignedIds = [
        ...new Set(
          loaded
            .map((ticket) => ticket.assignedAdminId)
            .filter((value): value is string => Boolean(value)),
        ),
      ];
      setAdminNames(assignedIds.length > 0 ? await fetchProfileNamesByIds(assignedIds) : new Map());

      setIsLoading(false);
    },
    [isAdmin],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  const withNames = useMemo(
    () =>
      tickets.map((ticket) => ({
        ...ticket,
        assignedAdminName: ticket.assignedAdminId
          ? adminNames.get(ticket.assignedAdminId)
          : undefined,
      })),
    [adminNames, tickets],
  );

  const visibleTickets = useMemo(
    () => sortAdminSupportTickets(filterSupportTickets(withNames, filters)),
    [filters, withNames],
  );

  const kpis = useMemo(() => computeSupportKpis(withNames), [withNames]);

  const patchFilters = useCallback(
    (changes: Partial<SupportTicketFilters>) =>
      setFilters((current) => ({ ...current, ...changes })),
    [],
  );

  return {
    isAdmin,
    tickets: withNames,
    visibleTickets,
    kpis,
    filters,
    patchFilters,
    resetFilters: useCallback(() => setFilters(EMPTY_SUPPORT_FILTERS), []),
    isLoading,
    error,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}
