import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isAdminRole } from '@/lib/athleteService';
import { fetchAdminSupportUnreadCount } from '@/lib/supportService';

/** Número de solicitudes con mensajes del usuario sin leer. Solo para administradores. */
export function useSupportUnreadBadge() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!isAdmin) {
      setCount(0);
      return;
    }

    setCount(await fetchAdminSupportUnreadCount());
  }, [isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  return { count, refresh: load };
}
