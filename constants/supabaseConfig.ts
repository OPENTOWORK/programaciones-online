import {
  sanitizeSupabaseConfig,
  validateSupabaseConfig,
} from '@/constants/supabaseConfigValidation';

/**
 * Configuración pública de Supabase para builds de producción.
 * La anon key es pública por diseño; va embebida en la app móvil.
 */
export const PRODUCTION_SUPABASE_URL = 'https://nsdurlikkuoxqobabixr.supabase.co';
export const PRODUCTION_SUPABASE_ANON_KEY =
  'sb_publishable_GZfJfr6RdAgbu9W9fy1O1Q_8DAgtf0k';

export { maskSupabaseAnonKey, maskSupabaseHost, validateSupabaseConfig } from '@/constants/supabaseConfigValidation';

function resolveFromEnv() {
  return sanitizeSupabaseConfig(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    PRODUCTION_SUPABASE_URL,
    PRODUCTION_SUPABASE_ANON_KEY,
  );
}

const resolved = resolveFromEnv();

export function resolveSupabaseUrl() {
  return resolved.url;
}

export function resolveSupabaseAnonKey() {
  return resolved.anonKey;
}

export const supabaseConfigWarnings = resolved.warnings;
export const supabaseUsedProductionFallback = resolved.usedProductionFallback;
