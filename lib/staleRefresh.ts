/** Evita ráfagas de peticiones al cambiar de pestaña o volver del background. */
export function createStaleRefresh(staleMs: number) {
  let lastFetchedAt = 0;
  let inFlight: Promise<unknown> | null = null;

  return {
    shouldRefresh(force = false) {
      if (force) return true;
      if (inFlight) return false;
      return Date.now() - lastFetchedAt >= staleMs;
    },
    markFetched() {
      lastFetchedAt = Date.now();
      inFlight = null;
    },
    track<T extends Promise<unknown>>(promise: T) {
      inFlight = promise.then(() => undefined);
      return promise.finally(() => {
        inFlight = null;
        lastFetchedAt = Date.now();
      }) as T;
    },
  };
}
