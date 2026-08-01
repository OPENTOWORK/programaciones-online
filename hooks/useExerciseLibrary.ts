import { useCallback, useEffect, useState } from 'react';

import { buildExerciseLibrary, type ExerciseLibraryItem } from '@/lib/exerciseLibrary';
import { fetchExerciseVideoEntries } from '@/lib/exerciseVideoService';

export function useExerciseLibrary() {
  const [items, setItems] = useState<ExerciseLibraryItem[]>(() => buildExerciseLibrary());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const planEntries = await fetchExerciseVideoEntries();
      setItems(buildExerciseLibrary(planEntries));
    } catch (loadError) {
      setItems(buildExerciseLibrary());
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudieron cargar los ejercicios enlazados en los planes.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, isLoading, error, refresh: load };
}
