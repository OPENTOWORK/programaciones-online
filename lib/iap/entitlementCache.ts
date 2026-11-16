import type { EntitlementSnapshot } from '@/lib/iap/types';
import { readPersistedRecord, writePersistedRecord } from '@/lib/localUserDataStorage';

/** Última respuesta del servidor por usuario, para no perder el acceso sin conexión. */
const CACHE_KEY = 'store-entitlements-v1';

export async function readCachedSnapshot(userId: string): Promise<EntitlementSnapshot | null> {
  const all = await readPersistedRecord<EntitlementSnapshot>(CACHE_KEY);
  return all[userId] ?? null;
}

export async function writeCachedSnapshot(userId: string, snapshot: EntitlementSnapshot): Promise<void> {
  const all = await readPersistedRecord<EntitlementSnapshot>(CACHE_KEY);
  await writePersistedRecord(CACHE_KEY, { ...all, [userId]: snapshot });
}
