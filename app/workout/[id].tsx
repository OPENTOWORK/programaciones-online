import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExerciseRow } from '@/components/workout/ExerciseRow';
import { ExerciseVideoPanel } from '@/components/workout/ExerciseVideoPanel';
import { WorkoutSection } from '@/components/workout/WorkoutSection';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import { usePrograms } from '@/hooks/usePrograms';
import { logWorkoutCompletion } from '@/lib/workoutService';
import { safeGoBack } from '@/lib/navigation';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isDemoMode } = useAuth();
  const { getWorkout } = usePrograms();
  const { getVideoId, hasVideo } = useExerciseVideos();
  const workout = getWorkout(id ?? '');

  const scrollRef = useRef<ScrollView>(null);
  const videoPanelOffsetRef = useRef(0);

  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{ name: string; videoId: string } | null>(null);

  if (!workout) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>Sesión no encontrada</Text>
      </ScreenWrapper>
    );
  }

  const completedCount = Object.values(completed).filter(Boolean).length;
  const total = workout.exercises.length;
  const metaParts = [
    workout.workoutDate ?? workout.dayLabel,
    workout.workoutDate ? null : `Semana ${workout.weekNumber}`,
    workout.estimatedDuration,
  ].filter(Boolean);

  const toggleExercise = (exerciseId: string) => {
    setCompleted((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }));
  };

  const scrollToVideoPanel = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(videoPanelOffsetRef.current - spacing.md, 0),
      animated: true,
    });
  };

  const openExerciseVideo = (name: string, aimharderEjerId?: number) => {
    const videoId = getVideoId(name, aimharderEjerId);
    if (!videoId) return;

    setActiveVideo({ name, videoId });
    setTimeout(() => {
      scrollToVideoPanel();
    }, 100);
  };

  const sectionVideoProps = {
    onExercisePress: (name: string) => openExerciseVideo(name),
    hasExerciseVideo: (name: string) => hasVideo(name),
    activeExerciseName: activeVideo?.name,
  };

  const finishWorkout = async () => {
    setFinishError(null);
    setIsFinishing(true);

    if (!isDemoMode && user) {
      const result = await logWorkoutCompletion(user.id, workout, completedCount, total);
      if (result.error) {
        setFinishError(result.error);
        setIsFinishing(false);
        return;
      }
    }

    setFinished(true);
    setIsFinishing(false);

    if (Platform.OS === 'web') {
      window.setTimeout(() => safeGoBack(router, '/tabs/programs'), 600);
      return;
    }

    safeGoBack(router, '/tabs/programs');
  };

  return (
    <ScreenWrapper scrollRef={scrollRef}>
      <View>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.meta}>{metaParts.join(' · ')}</Text>

        <Card style={styles.progressCard}>
          {total > 0 ? (
            <ProgressBar value={completedCount} max={total} label="Ejercicios completados" />
          ) : (
            <Text style={styles.textOnlyHint}>Entreno guiado por bloques de texto</Text>
          )}
        </Card>

        <View
          onLayout={(event) => {
            videoPanelOffsetRef.current = event.nativeEvent.layout.y;
          }}
        >
          {activeVideo ? (
            <ExerciseVideoPanel
              exerciseName={activeVideo.name}
              youtubeVideoId={activeVideo.videoId}
              onClose={() => setActiveVideo(null)}
            />
          ) : null}
        </View>

        {!activeVideo ? (
          <>
            <WorkoutSection title="Calentamiento" content={workout.warmup} icon="warmup" {...sectionVideoProps} />
            <WorkoutSection
              title="Parte principal"
              content={workout.main}
              icon="main"
              variant="featured"
              {...sectionVideoProps}
            />
            {workout.core?.trim() ? (
              <WorkoutSection title="Core / Accesorio" content={workout.core} icon="core" {...sectionVideoProps} />
            ) : null}
          </>
        ) : null}

        {total > 0 ? (
          <View>
            <SectionHeader title="Ejercicios" subtitle={`${total} ejercicios en esta sesión`} />
            {workout.exercises.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                completed={!!completed[exercise.id]}
                hasVideo={hasVideo(exercise.name, exercise.aimharderEjerId)}
                isVideoActive={activeVideo?.name === exercise.name}
                onToggle={() => toggleExercise(exercise.id)}
                onOpenVideo={() => openExerciseVideo(exercise.name, exercise.aimharderEjerId)}
              />
            ))}
          </View>
        ) : null}

        <WorkoutSection title="Vuelta a la calma" content={workout.cooldown} icon="cooldown" />

        {finished ? (
          <Card style={styles.successCard}>
            <Text style={styles.successTitle}>Entrenamiento finalizado</Text>
            <Text style={styles.successText}>
              {total > 0 && completedCount < total
                ? `Has completado ${completedCount} de ${total} ejercicios. Tu sesión ha quedado registrada.`
                : 'Buen trabajo. Tu progreso ha sido registrado.'}
            </Text>
          </Card>
        ) : (
          <>
            <Button
              title="Finalizar entrenamiento"
              onPress={finishWorkout}
              loading={isFinishing}
              style={styles.finishBtn}
            />
            {total > 0 && completedCount < total ? (
              <Text style={styles.hint}>
                {completedCount} de {total} ejercicios completados — puedes finalizar cuando quieras
              </Text>
            ) : null}
          </>
        )}

        {finishError ? <Text style={styles.error}>{finishError}</Text> : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  progressCard: { marginBottom: spacing.md },
  textOnlyHint: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  finishBtn: { marginTop: spacing.lg },
  hint: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  successCard: {
    marginTop: spacing.lg,
    borderColor: `${colors.success}55`,
    backgroundColor: `${colors.success}12`,
  },
  successTitle: { ...typography.body, color: colors.success, fontWeight: '700', marginBottom: spacing.xs },
  successText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  error: { ...typography.bodySmall, color: colors.danger, textAlign: 'center', marginTop: spacing.sm },
});
