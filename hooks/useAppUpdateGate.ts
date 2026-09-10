import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppActive } from '@/hooks/useAppActive';
import {
  fetchAppUpdateStatus,
  NO_UPDATE_REQUIRED,
  type AppUpdateStatus,
} from '@/lib/appUpdateService';
import { withTimeout } from '@/lib/withTimeout';

/** Si la comprobación tarda más que esto, se arranca sin bloquear y se reintenta después. */
const CHECK_TIMEOUT_MS = 4000;

/**
 * Comprueba al arrancar (y cada vez que la app vuelve al primer plano) si la versión
 * instalada sigue soportada. Nunca bloquea el arranque: si la consulta falla, se sigue.
 */
export function useAppUpdateGate() {
  const [status, setStatus] = useState<AppUpdateStatus>(NO_UPDATE_REQUIRED);
  const [isChecking, setIsChecking] = useState(true);
  const isActive = useAppActive();
  const wasActiveRef = useRef(isActive);

  const check = useCallback(async () => {
    try {
      setStatus(await withTimeout(fetchAppUpdateStatus(), CHECK_TIMEOUT_MS));
    } catch {
      setStatus(NO_UPDATE_REQUIRED);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  // Solo al volver del segundo plano: el arranque ya lo comprueba el efecto anterior.
  useEffect(() => {
    const returnedToForeground = isActive && !wasActiveRef.current;
    wasActiveRef.current = isActive;
    if (returnedToForeground) void check();
  }, [isActive, check]);

  return { status, isChecking, recheck: check };
}
