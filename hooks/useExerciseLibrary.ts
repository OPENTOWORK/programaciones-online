import { useCallback, useEffect, useState } from 'react';

import { buildExerciseLibrary, type ExerciseLibraryItem } from '@/lib/exerciseLibrary';

export function useExerciseLibrary() {
  const [items, setItems] = useState<ExerciseLibraryItem[]>(() => buildExerciseLibrary());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setItems(buildExerciseLibrary());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudo cargar la biblioteca del canal.',
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
