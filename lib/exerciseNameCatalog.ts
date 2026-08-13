import type { ExerciseLibraryItem } from '@/lib/exerciseLibrary';
import { normalizeExerciseName } from '@/lib/exerciseName';
import type { ExerciseCatalogEntry } from '@/lib/exerciseVideoService';

export interface ExerciseNameOption {
  name: string;
  aimharderEjerId?: number;
}

export function buildExerciseNameCatalog(
  catalogEntries: ExerciseCatalogEntry[],
  libraryItems: ExerciseLibraryItem[] = [],
): ExerciseNameOption[] {
  const byKey = new Map<string, ExerciseNameOption>();

  for (const entry of catalogEntries) {
    const trimmed = entry.name.trim();
    const key = normalizeExerciseName(trimmed);
    if (!key) continue;

    byKey.set(key, {
      name: trimmed,
      aimharderEjerId: entry.aimharderEjerId,
    });
  }

  for (const item of libraryItems) {
    for (const name of [item.name, ...item.aliases]) {
      const trimmed = name.trim();
      const key = normalizeExerciseName(trimmed);
      if (!key || byKey.has(key)) continue;

      byKey.set(key, { name: trimmed });
    }
  }

  return Array.from(byKey.values()).sort((left, right) =>
    left.name.localeCompare(right.name, 'es', { sensitivity: 'base' }),
  );
}

export function filterExerciseNameCatalog(items: ExerciseNameOption[], query: string, searchLimit = 50) {
  const normalized = normalizeExerciseName(query);
  if (!normalized) return items;

  const terms = normalized.split(' ').filter(Boolean);

  return items
    .filter((item) => {
      const haystack = normalizeExerciseName(item.name);
      return terms.every((term) => haystack.includes(term));
    })
    .slice(0, searchLimit);
}
