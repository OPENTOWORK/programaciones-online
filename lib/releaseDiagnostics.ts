import { Platform } from 'react-native';

import {
  maskSupabaseAnonKey,
  maskSupabaseHost,
} from '@/constants/supabaseConfigValidation';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabaseConfig.runtime';

type DiagnosticLevel = 'info' | 'warn' | 'error';

type DiagnosticPayload = Record<string, unknown>;

const APP_TAG = '[TrainingProgLine]';

function sanitizePayload(payload: DiagnosticPayload): DiagnosticPayload {
  const sanitized: DiagnosticPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;

    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('token') ||
      lowerKey.includes('authorization') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('service_role')
    ) {
      sanitized[key] = '[redacted]';
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

export function logReleaseDiagnostic(
  event: string,
  payload: DiagnosticPayload = {},
  level: DiagnosticLevel = 'info',
) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    platform: Platform.OS,
    dev: __DEV__,
    ...sanitizePayload(payload),
  };

  const line = `${APP_TAG} ${JSON.stringify(entry)}`;

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
}

export function logReleaseError(event: string, error: unknown, payload: DiagnosticPayload = {}) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logReleaseDiagnostic(
    event,
    {
      ...payload,
      errorMessage: message,
      stack,
    },
    'error',
  );
}

export function logSupabaseBootstrap() {
  logReleaseDiagnostic('app_bootstrap', {
    supabaseHost: maskSupabaseHost(supabaseUrl),
    supabaseKey: maskSupabaseAnonKey(supabaseAnonKey),
    buildMode: __DEV__ ? 'development' : 'release',
  });
}

export function logAuthEvent(
  event: string,
  payload: DiagnosticPayload = {},
  level: DiagnosticLevel = 'info',
) {
  logReleaseDiagnostic(`auth_${event}`, payload, level);
}

export function logAppRuntimeInfo() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Constants = require('expo-constants').default as {
    expoConfig?: {
      version?: string;
      android?: { versionCode?: number };
      ios?: { buildNumber?: string };
    };
  };
  const expoConfig = Constants.expoConfig;

  logReleaseDiagnostic('app_runtime_info', {
    platform: Platform.OS,
    appVersion: expoConfig?.version ?? 'unknown',
    nativeBuildVersion:
      Platform.OS === 'android'
        ? String(expoConfig?.android?.versionCode ?? 'unknown')
        : Platform.OS === 'ios'
          ? String(expoConfig?.ios?.buildNumber ?? 'unknown')
          : 'n/a',
    isDev: __DEV__,
  });
}
