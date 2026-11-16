const CONNECTION_MESSAGE =
  'Se ha cortado la conexión. Comprueba internet y pulsa Guardar cambios otra vez.';

export function isTransientNetworkMessage(message: string | undefined | null): boolean {
  if (!message) return false;
  const text = message.toLowerCase();
  return (
    text.includes('network connection was lost') ||
    text.includes('network request failed') ||
    text.includes('fetch failed') ||
    text.includes('failed to fetch') ||
    text.includes('internet connection appears to be offline') ||
    text.includes('network error') ||
    text.includes('timed out') ||
    text.includes('timeout')
  );
}

export function userFacingRequestError(message: string | undefined | null, fallback: string): string {
  if (!message) return fallback;
  if (isTransientNetworkMessage(message)) return CONNECTION_MESSAGE;
  return message;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * iOS cierra a veces la conexión (NSURLError -1005) en el primer intento.
 * Un segundo intento corto suele completarse.
 */
export async function retryOnTransient<T>(
  run: () => PromiseLike<T>,
  readError: (value: T) => string | undefined | null,
): Promise<T> {
  let result: T;
  try {
    result = await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!isTransientNetworkMessage(message)) throw error;
    await delay(700);
    return run();
  }

  if (!isTransientNetworkMessage(readError(result))) return result;
  await delay(700);
  return run();
}
