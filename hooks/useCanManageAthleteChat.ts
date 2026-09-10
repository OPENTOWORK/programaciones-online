import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  canManageAthleteChat,
  isAdminRole,
  isTrainerRole,
} from '@/lib/athleteService';

/** `null` mientras se comprueba. El admin no gestiona el chat de clientes cedidos. */
export function useCanManageAthleteChat(athleteId: string) {
  const { user, isDemoMode } = useAuth();
  const needsCheck = isAdminRole(user?.role) && !isDemoMode;
  const [allowed, setAllowed] = useState<boolean | null>(() =>
    needsCheck ? null : isTrainerRole(user?.role),
  );

  useEffect(() => {
    if (!athleteId || !user?.id || !isTrainerRole(user.role)) {
      setAllowed(false);
      return;
    }

    if (isDemoMode || !isAdminRole(user.role)) {
      setAllowed(true);
      return;
    }

    let cancelled = false;
    setAllowed(null);
    void canManageAthleteChat(athleteId, { role: user.role, trainerId: user.id }).then((ok) => {
      if (!cancelled) setAllowed(ok);
    });

    return () => {
      cancelled = true;
    };
  }, [athleteId, isDemoMode, user?.id, user?.role]);

  return allowed;
}
