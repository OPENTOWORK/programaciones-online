import * as Application from 'expo-application';
import { Platform } from 'react-native';

export type AppStorePlatform = 'android' | 'ios';

export const ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.trainingprogline.app';
export const IOS_STORE_URL = 'https://apps.apple.com/app/training-progline/id0000000000';

export function currentStorePlatform(): AppStorePlatform | null {
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'ios') return 'ios';
  return null;
}

export function defaultStoreUrl(platform: AppStorePlatform) {
  return platform === 'android' ? ANDROID_STORE_URL : IOS_STORE_URL;
}

/** Versión visible en la tienda (`1.0.12`). */
export function currentAppVersion(): string | null {
  return Application.nativeApplicationVersion ?? null;
}

/** Build interno (`versionCode` en Android, `CFBundleVersion` en iOS). */
export function currentAppBuild(): number | null {
  const raw = Application.nativeBuildVersion;
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseVersionParts(version: string): number[] {
  return version
    .trim()
    .split(/[.\-+]/)
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part));
}

/** Devuelve `-1` si `left` es anterior, `0` si equivalen y `1` si es posterior. */
export function compareVersions(left: string, right: string): number {
  const leftParts = parseVersionParts(left);
  const rightParts = parseVersionParts(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;
    if (leftPart < rightPart) return -1;
    if (leftPart > rightPart) return 1;
  }

  return 0;
}

export function isVersionOutdated(current: string, minimumRequired: string): boolean {
  return compareVersions(current, minimumRequired) < 0;
}
