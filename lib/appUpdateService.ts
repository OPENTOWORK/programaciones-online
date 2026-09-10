import {
  currentAppBuild,
  currentAppVersion,
  currentStorePlatform,
  defaultStoreUrl,
  isVersionOutdated,
  type AppStorePlatform,
} from '@/lib/appVersion';
import { logReleaseDiagnostic } from '@/lib/releaseDiagnostics';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const TABLE = 'app_release_requirements';

export interface AppReleaseRequirement {
  platform: AppStorePlatform;
  minSupportedVersion: string;
  minSupportedBuild?: number;
  latestVersion?: string;
  storeUrl: string;
  updateMessage?: string;
}

export interface AppUpdateStatus {
  /** `true` solo cuando hay certeza de que la versión instalada ya no está soportada. */
  updateRequired: boolean;
  currentVersion?: string;
  latestVersion?: string;
  storeUrl?: string;
  updateMessage?: string;
}

export const NO_UPDATE_REQUIRED: AppUpdateStatus = { updateRequired: false };

function parseOptionalInteger(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function mapRow(row: Record<string, unknown>, platform: AppStorePlatform): AppReleaseRequirement {
  const storeUrl = (row.store_url as string | null)?.trim();

  return {
    platform,
    minSupportedVersion: String(row.min_supported_version ?? '0.0.0'),
    minSupportedBuild: parseOptionalInteger(row.min_supported_build),
    latestVersion: (row.latest_version as string | null) ?? undefined,
    storeUrl: storeUrl || defaultStoreUrl(platform),
    updateMessage: (row.update_message as string | null) ?? undefined,
  };
}

/**
 * Comprueba si la app instalada sigue soportada.
 *
 * Falla siempre "en abierto": si no hay red, la tabla no existe o los datos son raros,
 * la app arranca con normalidad. Solo bloquea cuando el servidor dice explícitamente
 * que la versión instalada es demasiado antigua.
 */
export async function fetchAppUpdateStatus(): Promise<AppUpdateStatus> {
  const platform = currentStorePlatform();
  if (!platform) return NO_UPDATE_REQUIRED;

  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return NO_UPDATE_REQUIRED;

  const version = currentAppVersion();
  const build = currentAppBuild();
  if (!version && build === null) return NO_UPDATE_REQUIRED;

  const { data, error } = await supabase
    .from(TABLE)
    .select('platform, min_supported_version, min_supported_build, latest_version, store_url, update_message')
    .eq('platform', platform)
    .maybeSingle();

  if (error || !data) return NO_UPDATE_REQUIRED;

  const requirement = mapRow(data as Record<string, unknown>, platform);

  const versionOutdated = Boolean(
    version && isVersionOutdated(version, requirement.minSupportedVersion),
  );
  const buildOutdated =
    build !== null &&
    requirement.minSupportedBuild !== undefined &&
    build < requirement.minSupportedBuild;

  if (!versionOutdated && !buildOutdated) return NO_UPDATE_REQUIRED;

  logReleaseDiagnostic('app_update_required', {
    platform,
    currentVersion: version ?? 'unknown',
    currentBuild: build ?? 'unknown',
    minSupportedVersion: requirement.minSupportedVersion,
    minSupportedBuild: requirement.minSupportedBuild ?? 'none',
  });

  return {
    updateRequired: true,
    currentVersion: version ?? undefined,
    latestVersion: requirement.latestVersion,
    storeUrl: requirement.storeUrl,
    updateMessage: requirement.updateMessage,
  };
}
