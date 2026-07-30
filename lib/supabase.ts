import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import {
  assertSupabaseConfiguredForNative,
  isAuthDemoMode,
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseRuntimeWarnings,
  supabaseUrl,
} from '@/lib/supabaseConfig.runtime';
import { logAuthEvent, logReleaseDiagnostic, logSupabaseBootstrap } from '@/lib/releaseDiagnostics';

export {
  assertSupabaseConfiguredForNative,
  isAuthDemoMode,
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseRuntimeWarnings,
  supabaseUrl,
};

let supabaseClient: SupabaseClient | null = null;

const noopStorage = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

function getAuthStorage() {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return noopStorage;
    }

    return {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        window.localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }

  return AsyncStorage;
}

function canUseSupabaseClient() {
  return isSupabaseConfigured && (Platform.OS !== 'web' || typeof window !== 'undefined');
}

export function getSupabase(): SupabaseClient | null {
  if (!canUseSupabaseClient()) return null;

  if (!supabaseClient) {
    assertSupabaseConfiguredForNative();
    logSupabaseBootstrap();
    for (const warning of supabaseRuntimeWarnings) {
      logReleaseDiagnostic('supabase_config_warning', { warning }, 'warn');
    }

    logAuthEvent('client_init_start');
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: getAuthStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
    logAuthEvent('client_init_done');
  }

  return supabaseClient;
}

export function requireSupabase(): SupabaseClient {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase no está disponible en este entorno');
  }
  return client;
}

export async function verifySupabaseConnection(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase no configurado' };
  }

  try {
    const client = getSupabase();
    if (!client) {
      return { ok: false, error: 'Cliente Supabase no disponible' };
    }

    const { error } = await client.auth.getSession();
    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo conectar con Supabase',
    };
  }
}
