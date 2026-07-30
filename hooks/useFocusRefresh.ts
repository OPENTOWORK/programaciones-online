import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

/** Ejecuta callbacks al enfocar la pantalla sin depender de su identidad en cada render. */
export function useFocusRefresh(...callbacks: Array<() => unknown>) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useFocusEffect(
    useCallback(() => {
      for (const callback of callbacksRef.current) {
        void callback();
      }
    }, []),
  );
}
