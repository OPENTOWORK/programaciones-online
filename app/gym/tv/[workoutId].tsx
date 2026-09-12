import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { GymTvDisplay } from '@/components/gym/GymTvDisplay';
import { Button } from '@/components/ui/Button';
import { useGym } from '@/hooks/useGym';
import { fetchGymProgramLinkById } from '@/lib/gymService';
import { linkToTrainingSession } from '@/lib/gymTrainingManage';
import { findHypeBoardSessionById } from '@/lib/hypeGymTrainingBoard';
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
  const [linkBody, setLinkBody] = useState<string | undefined>();
  const [linkTitle, setLinkTitle] = useState<string | undefined>();
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
      setLinkBody(undefined);
      setLinkTitle(undefined);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLinkBody(undefined);
    setLinkTitle(undefined);

    void fetchWorkoutById(workoutId).then(async (loaded) => {
      if (cancelled) return;
      if (loaded) {
        setWorkout(loaded);
        setError(null);
        setIsLoading(false);
        return;
      }

      const linkResult = await fetchGymProgramLinkById(workoutId);
      if (cancelled) return;

      if (linkResult.data) {
        const session = linkToTrainingSession(linkResult.data);
        setWorkout(null);
        setLinkBody(session.body);
        setLinkTitle(session.name);
        setError(null);
        setIsLoading(false);
        return;
      }

      setWorkout(null);
      setError(linkResult.error ?? 'No se pudo cargar esta sesión.');
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

  if (!workout && !boardSession && !linkBody) {
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
      title={boardSession ? undefined : linkTitle ?? workout?.name}
      body={boardSession?.body ?? linkBody}
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
