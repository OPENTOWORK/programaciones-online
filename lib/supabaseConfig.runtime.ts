import Constants from 'expo-constants';
import { Platform } from 'react-native';

import {
  PRODUCTION_SUPABASE_ANON_KEY,
  PRODUCTION_SUPABASE_URL,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
  supabaseConfigWarnings,
} from '@/constants/supabaseConfig';
import { sanitizeSupabaseConfig, validateSupabaseConfig } from '@/constants/supabaseConfigValidation';

function readExtraConfig() {
  const extra = Constants.expoConfig?.extra as
    | { supabaseUrl?: string; supabaseAnonKey?: string }
    | undefined;

  return {
    url: extra?.supabaseUrl?.trim() || '',
    anonKey: extra?.supabaseAnonKey?.trim() || '',
  };
}

const extraConfig = readExtraConfig();

const envUrl = resolveSupabaseUrl();
const envAnonKey = resolveSupabaseAnonKey();

const envValidation = validateSupabaseConfig(envUrl, envAnonKey);
const extraValidation = validateSupabaseConfig(extraConfig.url, extraConfig.anonKey);

const resolved = envValidation.ok
  ? { url: envValidation.url, anonKey: envValidation.anonKey, warnings: [...supabaseConfigWarnings, ...envValidation.warnings] }
  : extraValidation.ok
    ? sanitizeSupabaseConfig(extraConfig.url, extraConfig.anonKey, PRODUCTION_SUPABASE_URL, PRODUCTION_SUPABASE_ANON_KEY)
    : sanitizeSupabaseConfig('', '', PRODUCTION_SUPABASE_URL, PRODUCTION_SUPABASE_ANON_KEY);

export const supabaseUrl = resolved.url;
export const supabaseAnonKey = resolved.anonKey;
export const supabaseRuntimeWarnings = resolved.warnings;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Solo web en desarrollo sin .env. Nunca en Android/iOS de Play Store. */
export const isAuthDemoMode =
  Platform.OS === 'web' &&
  __DEV__ &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL &&
  !extraConfig.url;

export function assertSupabaseConfiguredForNative() {
  if (Platform.OS === 'web') return;

  const validation = validateSupabaseConfig(supabaseUrl, supabaseAnonKey);
  if (!validation.ok) {
    throw new Error(validation.error);
  }
}
