import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const KEEP_AWAKE_TAG = 'workout-timer';

/** Mantiene la pantalla encendida mientras el crono corre: el móvil suele estar en el suelo. */
export function useTimerKeepAwake(active: boolean) {
  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    let activated = false;

    void activateKeepAwakeAsync(KEEP_AWAKE_TAG)
      .then(() => {
        activated = true;
        if (cancelled) return deactivateKeepAwake(KEEP_AWAKE_TAG);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (!activated) return;
      void deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
    };
  }, [active]);
}
