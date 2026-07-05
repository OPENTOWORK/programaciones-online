import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: getAuthStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
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
