import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { GymTvDisplay } from '@/components/gym/GymTvDisplay';
import { Button } from '@/components/ui/Button';
import { useGym } from '@/hooks/useGym';
import { findHypeBoardSessionById } from '@/lib/hypeGymTrainingBoard';
import { gymSessionBoardText } from '@/lib/gymTraining';
import { normalizeRouteParam } from '@/lib/routeParams';
import { fetchWorkoutById } from '@/lib/workoutService';
import type { Workout } from '@/lib/types';

function formatTvDate(dateKey?: string) {
  if (!dateKey) return '';
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date
    .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
    .replace('.', '')
    .toUpperCase();
}

export default function GymTvDisplayScreen() {
  const router = useRouter();
  const { gym } = useGym();
  const params = useLocalSearchParams<{
    workoutId?: string | string[];
    programName?: string | string[];
    dateKey?: string | string[];
  }>();
  const workoutId = normalizeRouteParam(params.workoutId);
  const programName = normalizeRouteParam(params.programName);
  const dateKey = normalizeRouteParam(params.dateKey);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/gym/tv');
  }, [router]);

  const boardSession = workoutId ? findHypeBoardSessionById(workoutId) : undefined;

  useEffect(() => {
    if (!workoutId) {
      setError('No se ha indicado la sesión.');
      setIsLoading(false);
      return;
    }

    if (boardSession) {
      setWorkout(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void fetchWorkoutById(workoutId).then((loaded) => {
      if (cancelled) return;
      setWorkout(loaded);
      setError(loaded ? null : 'No se pudo cargar esta sesión.');
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [boardSession, workoutId]);

  if (isLoading) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator color="#FFFFFF" />
        <Text style={styles.fallbackText}>Cargando sesión para TV...</Text>
      </View>
    );
  }

  if (!workout && !boardSession) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>{error ?? 'Sesión no disponible'}</Text>
        <Button title="Volver" variant="outline" onPress={close} />
      </View>
    );
  }

  return (
    <GymTvDisplay
      gymName={gym?.name ?? 'Gimnasio'}
      programName={programName || boardSession?.programName || 'Entrenamiento'}
      dateLabel={formatTvDate(dateKey || workout?.workoutDate || boardSession?.dateKey)}
      workout={workout ?? undefined}
      title={boardSession ? undefined : workout?.name}
      body={boardSession ? gymSessionBoardText(boardSession) : undefined}
      onClose={close}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: '#0A0B0D',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  fallbackText: {
    color: '#9AA3AD',
    marginTop: 8,
  },
  fallbackTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
