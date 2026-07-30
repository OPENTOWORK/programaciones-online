import {
  fetchExerciseVideoCatalog,
  type ExerciseVideoCatalog,
} from '@/lib/exerciseVideoService';

const CACHE_TTL_MS = 15 * 60 * 1000;
const emptyCatalog: ExerciseVideoCatalog = {
  byEjerId: new Map(),
  byNameKey: new Map(),
};

let cachedCatalog: ExerciseVideoCatalog | null = null;
let cachedAt = 0;
let inFlight: Promise<ExerciseVideoCatalog> | null = null;

export function getCachedExerciseVideoCatalog(force = false): Promise<ExerciseVideoCatalog> {
  const now = Date.now();
  if (!force && cachedCatalog && now - cachedAt < CACHE_TTL_MS) {
    return Promise.resolve(cachedCatalog);
  }

  if (!force && inFlight) {
    return inFlight;
  }

  inFlight = fetchExerciseVideoCatalog()
    .then((catalog) => {
      cachedCatalog = catalog;
      cachedAt = Date.now();
      inFlight = null;
      return catalog;
    })
    .catch((error) => {
      inFlight = null;
      if (cachedCatalog) {
        return cachedCatalog;
      }
      throw error;
    });

  return inFlight;
}

export function peekExerciseVideoCatalog(): ExerciseVideoCatalog {
  return cachedCatalog ?? emptyCatalog;
}

export function invalidateExerciseVideoCatalog() {
  cachedCatalog = null;
  cachedAt = 0;
  inFlight = null;
}
