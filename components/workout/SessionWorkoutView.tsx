import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ExerciseRow } from '@/components/workout/ExerciseRow';
import { ExerciseVideoPanel } from '@/components/workout/ExerciseVideoPanel';
import { SessionLogVideos } from '@/components/workout/SessionLogVideos';
import { WorkoutSection } from '@/components/workout/WorkoutSection';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { formatSessionSectionTitle } from '@/lib/personalizedPlanContent';
import type { SessionWorkoutContent } from '@/hooks/useSessionRunner';
import type { ChecklistItem } from '@/lib/sessionChecklist';

type ActiveVideo = {
  key: string;
  name: string;
  videoId: string;
};

interface SessionWorkoutViewProps {
  workout: SessionWorkoutContent;
  meta: string;
  scheduledDateLabel?: string;
  checklist: ChecklistItem[];
  completed: Record<string, boolean>;
  feelings: string;
  onFeelingsChange: (value: string) => void;
  onToggleItem: (key: string) => void;
  onSave: () => void;
  saving: boolean;
  loadingLog?: boolean;
  error?: string | null;
  saved?: boolean;
  getVideoId: (name: string, aimharderEjerId?: number) => string | null;
  hasVideo: (name: string, aimharderEjerId?: number) => boolean;
  readOnly?: boolean;
  readOnlySubtitle?: string;
  logId?: string;
  userId?: string;
}

export function SessionWorkoutView({
  workout,
  meta,
  scheduledDateLabel,
  checklist,
  completed,
  feelings,
  onFeelingsChange,
  onToggleItem,
  onSave,
  saving,
  loadingLog = false,
  error,
  saved,
  getVideoId,
  hasVideo,
  readOnly = false,
  readOnlySubtitle,
  logId,
  userId,
}: SessionWorkoutViewProps) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);

  const completedTotal = checklist.filter((item) => completed[item.key]).length;
  const total = checklist.length;

  const openExerciseVideo = (key: string, name: string, aimharderEjerId?: number) => {
    const videoId = getVideoId(name, aimharderEjerId);
    if (!videoId) return;
    setActiveVideo((current) => (current?.key === key ? null : { key, name, videoId }));
  };

  const sectionProps = (sectionKey: string) => ({
    sectionKey,
    completedItems: completed,
    onToggleItem: readOnly ? undefined : onToggleItem,
    onExercisePress: (name: string, aimharderEjerId?: number) =>
      openExerciseVideo(`block:${normalizeExerciseName(name)}`, name, aimharderEjerId),
    hasExerciseVideo: (name: string, aimharderEjerId?: number) => hasVideo(name, aimharderEjerId),
    activeExerciseName: activeVideo?.name,
  });

  if (loadingLog) {
    return <ActivityIndicator color={colors.accent} style={styles.loader} />;
  }

  return (
    <View>
      <Text style={styles.title}>{workout.name}</Text>
      <Text style={styles.meta}>{[scheduledDateLabel, meta].filter(Boolean).join(' · ')}</Text>

      <Card style={styles.progressCard}>
        {readOnly ? (
          total > 0 ? (
            <ProgressBar value={completedTotal} max={total} label="Partes completadas por el atleta" />
          ) : (
            <Text style={styles.textOnlyHint}>
              {readOnlySubtitle ?? 'Registro del atleta'}
            </Text>
          )
        ) : total > 0 ? (
          <ProgressBar value={completedTotal} max={total} label="Partes completadas" />
        ) : (
          <Text style={styles.textOnlyHint}>Marca las partes del entreno conforme las vayas haciendo</Text>
        )}
      </Card>

      {activeVideo ? (
        <ExerciseVideoPanel
          exerciseName={activeVideo.name}
          youtubeVideoId={activeVideo.videoId}
          onClose={() => setActiveVideo(null)}
        />
      ) : null}

      <WorkoutSection title="Calentamiento" content={workout.warmup} icon="warmup" {...sectionProps('warmup')} />
      <WorkoutSection
        title={formatSessionSectionTitle(workout.sessionNumber, workout.name)}
        content={workout.main}
        icon="main"
        variant="featured"
        {...sectionProps('main')}
      />
      {workout.core?.trim() ? (
        <WorkoutSection title="Core / Accesorio" content={workout.core} icon="core" {...sectionProps('core')} />
      ) : null}

      {workout.exercises.length > 0 ? (
        <View>
          <SectionHeader title="Ejercicios" subtitle={`${workout.exercises.length} ejercicios`} />
          {workout.exercises.map((exercise) => {
            const key = `ex:${exercise.id}`;
            const isVideoActive = activeVideo?.key === exercise.id;
            return (
              <View key={exercise.id} style={styles.exerciseBlock}>
                <ExerciseRow
                  exercise={exercise}
                  completed={!!completed[key]}
                  hasVideo={hasVideo(exercise.name, exercise.aimharderEjerId)}
                  isVideoActive={isVideoActive}
                  onToggle={readOnly ? undefined : () => onToggleItem(key)}
                  onOpenVideo={() => openExerciseVideo(exercise.id, exercise.name, exercise.aimharderEjerId)}
                />
              </View>
            );
          })}
        </View>
      ) : null}

      <WorkoutSection title="Vuelta a la calma" content={workout.cooldown} icon="cooldown" {...sectionProps('cooldown')} />

      {readOnly && feelings.trim() ? (
        <Card style={styles.feelingsCard}>
          <Text style={styles.feelingsLabel}>Sensaciones del atleta</Text>
          <Text style={styles.feelingsReadOnly}>{feelings}</Text>
        </Card>
      ) : null}

      {!readOnly ? (
        <>
          <Input
            label="¿Cómo te has sentido?"
            value={feelings}
            onChangeText={onFeelingsChange}
            placeholder="Energía, fatiga, dolor, sensaciones…"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.feelingsInput}
          />

          <SessionLogVideos
            logId={logId}
            userId={userId}
            readOnly={false}
            requiresSavedLog
          />

          {saved ? (
            <Card style={styles.successCard}>
              <Text style={styles.successTitle}>Sesión guardada</Text>
              <Text style={styles.successText}>
                Tu entrenador podrá ver tu progreso, sensaciones y videos del entreno.
              </Text>
            </Card>
          ) : (
            <Button title="Guardar sesión" onPress={onSave} loading={saving} style={styles.saveBtn} />
          )}
        </>
      ) : (
        <SessionLogVideos logId={logId} readOnly compact={false} />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  title: { ...typography.h1, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  progressCard: { marginBottom: spacing.md },
  textOnlyHint: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  exerciseBlock: { marginBottom: spacing.xs },
  feelingsCard: { marginTop: spacing.md },
  feelingsLabel: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  feelingsReadOnly: { ...typography.body, color: colors.text, lineHeight: 22 },
  feelingsInput: { minHeight: 110, paddingTop: 14, marginTop: spacing.md },
  saveBtn: { marginTop: spacing.lg },
  successCard: {
    marginTop: spacing.lg,
    borderColor: `${colors.success}55`,
    backgroundColor: `${colors.success}12`,
  },
  successTitle: { ...typography.body, color: colors.success, fontWeight: '700', marginBottom: spacing.xs },
  successText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  error: { ...typography.bodySmall, color: colors.danger, textAlign: 'center', marginTop: spacing.sm },
});
