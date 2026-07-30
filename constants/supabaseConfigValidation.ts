const LOCAL_HOST_PATTERNS = [
  /^https?:\/\/localhost\b/i,
  /^https?:\/\/127\.0\.0\.1\b/i,
  /^https?:\/\/10\.0\.2\.2\b/i,
  /^https?:\/\/192\.168\.\d+\.\d+/i,
];

const SERVICE_ROLE_MARKERS = ['service_role', 'sb_secret_'];

export type SupabaseConfigValidationResult =
  | { ok: true; url: string; anonKey: string; warnings: string[] }
  | { ok: false; error: string; warnings: string[] };

export function maskSupabaseHost(url: string): string {
  try {
    const parsed = new URL(url);
    const projectRef = parsed.hostname.split('.')[0] ?? 'unknown';
    return `${parsed.protocol}//${projectRef.slice(0, 4)}…${projectRef.slice(-4)}.supabase.co`;
  } catch {
    return '(url-invalida)';
  }
}

export function maskSupabaseAnonKey(key: string): string {
  if (!key) return '(vacía)';
  if (key.length <= 12) return '…';
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

function isLocalOrPrivateUrl(url: string): boolean {
  return LOCAL_HOST_PATTERNS.some((pattern) => pattern.test(url.trim()));
}

function looksLikeServiceRoleKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return SERVICE_ROLE_MARKERS.some((marker) => normalized.includes(marker));
}

export function validateSupabaseConfig(
  rawUrl: string | undefined | null,
  rawAnonKey: string | undefined | null,
): SupabaseConfigValidationResult {
  const warnings: string[] = [];
  const url = rawUrl?.trim() ?? '';
  const anonKey = rawAnonKey?.trim() ?? '';

  if (!url) {
    return { ok: false, error: 'Falta EXPO_PUBLIC_SUPABASE_URL (URL de Supabase vacía).', warnings };
  }

  if (!anonKey) {
    return { ok: false, error: 'Falta EXPO_PUBLIC_SUPABASE_ANON_KEY (clave pública vacía).', warnings };
  }

  if (!url.startsWith('https://')) {
    return {
      ok: false,
      error: 'La URL de Supabase debe empezar por https:// en builds de producción.',
      warnings,
    };
  }

  if (isLocalOrPrivateUrl(url)) {
    return {
      ok: false,
      error: 'La URL de Supabase apunta a localhost o red local; no funciona en Google Play.',
      warnings,
    };
  }

  if (looksLikeServiceRoleKey(anonKey)) {
    return {
      ok: false,
      error: 'Se detectó una clave service_role o secreta. Usa solo la clave pública (anon/publishable).',
      warnings,
    };
  }

  try {
    new URL(url);
  } catch {
    return { ok: false, error: 'La URL de Supabase no es válida.', warnings };
  }

  if (!url.includes('.supabase.co')) {
    warnings.push('La URL no parece un proyecto hosted de Supabase (.supabase.co).');
  }

  return { ok: true, url, anonKey, warnings };
}

export function sanitizeSupabaseConfig(
  rawUrl: string | undefined | null,
  rawAnonKey: string | undefined | null,
  productionUrl: string,
  productionAnonKey: string,
): { url: string; anonKey: string; warnings: string[]; usedProductionFallback: boolean } {
  const validation = validateSupabaseConfig(rawUrl, rawAnonKey);
  if (validation.ok) {
    return {
      url: validation.url,
      anonKey: validation.anonKey,
      warnings: validation.warnings,
      usedProductionFallback: false,
    };
  }

  const fallback = validateSupabaseConfig(productionUrl, productionAnonKey);
  if (!fallback.ok) {
    throw new Error(`Configuración Supabase inválida: ${validation.error}`);
  }

  return {
    url: fallback.url,
    anonKey: fallback.anonKey,
    warnings: [...validation.warnings, validation.error, 'Usando valores de producción embebidos.'],
    usedProductionFallback: true,
  };
}
