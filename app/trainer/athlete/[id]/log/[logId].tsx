import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AthleteFeedbackComposer } from '@/components/trainer/AthleteFeedbackComposer';
import { SessionWorkoutView } from '@/components/workout/SessionWorkoutView';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import { useTrainerAthleteFeedback } from '@/hooks/useTrainerAthleteFeedback';
import {
  buildWorkoutChecklist,
  completedMapFromKeys,
} from '@/lib/sessionChecklist';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import { loadWorkoutForSessionLog } from '@/lib/sessionLogDetail';
import { fetchSessionLogById, type SessionLogRecord } from '@/lib/sessionLogService';

export default function TrainerSessionLogDetailScreen() {
  const { id: athleteId, logId } = useLocalSearchParams<{ id: string; logId: string }>();
  const { getVideoId, hasVideo } = useExerciseVideos();
  const feedback = useTrainerAthleteFeedback(athleteId ?? '');
  const [log, setLog] = useState<SessionLogRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!logId) {
        setError('Registro no encontrado.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const record = await fetchSessionLogById(logId);
        if (cancelled) return;

        if (!record) {
          setError('No se encontró este registro de entreno.');
          setLog(null);
          return;
        }

        if (athleteId && record.userId !== athleteId) {
          setError('Este registro no pertenece a este atleta.');
          setLog(null);
          return;
        }

        setLog(record);
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar el registro de entreno.');
          setLog(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [athleteId, logId]);

  const [workout, setWorkout] = useState<Awaited<ReturnType<typeof loadWorkoutForSessionLog>> | null>(null);
  const [workoutLoading, setWorkoutLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkout() {
      if (!log) {
        setWorkout(null);
        return;
      }

      setWorkoutLoading(true);
      try {
        const content = await loadWorkoutForSessionLog(log);
        if (!cancelled) setWorkout(content);
      } catch {
        if (!cancelled) setWorkout(null);
      } finally {
        if (!cancelled) setWorkoutLoading(false);
      }
    }

    void loadWorkout();

    return () => {
      cancelled = true;
    };
  }, [log]);

  const checklist = useMemo(
    () => (workout ? buildWorkoutChecklist(workout) : []),
    [workout],
  );
  const completed = useMemo(
    () => completedMapFromKeys(log?.completedItems ?? []),
    [log?.completedItems],
  );
  const sessionEntries = useMemo(
    () => feedback.entries.filter((entry) => entry.sessionLogId === logId),
    [feedback.entries, logId],
  );

  if (loading || workoutLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} />
      </ScreenWrapper>
    );
  }

  if (error || !log || !workout) {
    return (
      <ScreenWrapper>
        <Text style={{ color: colors.danger }}>{error ?? 'Registro no disponible.'}</Text>
      </ScreenWrapper>
    );
  }

  const scheduledDateLabel = log.scheduledDate
    ? formatDayLabel(new Date(`${log.scheduledDate}T12:00:00`))
    : undefined;

  return (
    <ScreenWrapper>
      <SessionWorkoutView
        workout={workout}
        meta={log.duration ?? workout.estimatedDuration}
        scheduledDateLabel={scheduledDateLabel}
        checklist={checklist}
        completed={completed}
        feelings={log.feelings ?? ''}
        onFeelingsChange={() => {}}
        onToggleItem={() => {}}
        onSave={() => {}}
        saving={false}
        getVideoId={getVideoId}
        hasVideo={hasVideo}
        readOnly
        readOnlySubtitle="Registro del atleta · qué hizo y qué ejercicios tenía la sesión"
        logId={log.id}
      />

      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackTitle}>Tu feedback</Text>
        <Text style={styles.feedbackSubtitle}>
          El atleta lo verá en esta sesión y en su progreso.
        </Text>
        <AthleteFeedbackComposer
          entries={sessionEntries}
          isLoading={feedback.isLoading}
          sending={feedback.sending}
          persistent={feedback.persistent}
          error={feedback.error}
          onSend={(message, drafts) => feedback.send(message, drafts, log.id)}
          onUpdate={feedback.update}
          onRemove={feedback.remove}
          compact
          placeholder="Comentario sobre este entreno..."
          showHistory={sessionEntries.length > 0}
          historyTitle="Feedback enviado"
          emptyHistoryText=""
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  feedbackSection: {
    gap: 4,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  feedbackSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
});
