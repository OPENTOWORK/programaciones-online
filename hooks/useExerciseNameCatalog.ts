import { useCallback, useEffect, useMemo, useState } from 'react';

import { buildExerciseLibrary } from '@/lib/exerciseLibrary';
import { buildExerciseNameCatalog, type ExerciseNameOption } from '@/lib/exerciseNameCatalog';
import { fetchExerciseCatalogEntries, fetchExerciseVideoEntries } from '@/lib/exerciseVideoService';

export function useExerciseNameCatalog() {
  const [items, setItems] = useState<ExerciseNameOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [catalogEntries, planEntries] = await Promise.all([
        fetchExerciseCatalogEntries(),
        fetchExerciseVideoEntries(),
      ]);
      const libraryItems = buildExerciseLibrary(planEntries);
      setItems(buildExerciseNameCatalog(catalogEntries, libraryItems));
    } catch (loadError) {
      setItems(buildExerciseNameCatalog([], buildExerciseLibrary()));
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudieron cargar los nombres de la biblioteca.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const names = useMemo(() => items.map((item) => item.name), [items]);

  return { items, names, isLoading, error, refresh: load };
}
