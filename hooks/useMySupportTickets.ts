import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { fetchMySupportTickets, type SupportTicket } from '@/lib/supportService';

/** Solicitudes de soporte del usuario autenticado. */
export function useMySupportTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!user?.id) {
        setTickets([]);
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const result = await fetchMySupportTickets();
      setTickets(result.data ?? []);
      setError(result.error ?? null);
      setIsLoading(false);
    },
    [user?.id],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  return {
    tickets,
    isLoading,
    error,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}
