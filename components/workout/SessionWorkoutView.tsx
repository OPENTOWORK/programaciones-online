import { useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

import {
    TrainerExerciseNoteModal,
    TrainerExerciseNoteTrigger,
} from '@/components/trainer/TrainerExerciseNotes';
import { ActionSheetModal } from '@/components/ui/ActionSheetModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BlockCommentField } from '@/components/workout/BlockCommentField';
import { ExerciseRow } from '@/components/workout/ExerciseRow';
import { ExerciseVideoPanel } from '@/components/workout/ExerciseVideoPanel';
import { SessionLogVideos } from '@/components/workout/SessionLogVideos';
import { SessionVideoSendModal } from '@/components/workout/SessionVideoSendModal';
import { WorkoutSection } from '@/components/workout/WorkoutSection';
import { colors, spacing, typography } from '@/constants/theme';
import { useSessionBlockComments } from '@/hooks/useSessionBlockComments';
import type { SessionWorkoutContent } from '@/hooks/useSessionRunner';
import { useSessionVideos } from '@/hooks/useSessionVideos';
import { useTrainerExerciseNotes } from '@/hooks/useTrainerExerciseNotes';
import { normalizeExerciseName } from '@/lib/exerciseName';
import { formatSessionSectionTitle } from '@/lib/personalizedPlanContent';
import type { ChecklistItem } from '@/lib/sessionChecklist';
import type { SessionVideoSource } from '@/lib/sessionVideoPicker';
import type { SessionLogVideo } from '@/lib/sessionVideoService';
import {
    formatTrainerExerciseNoteAge,
    resolveTrainerExerciseNoteTarget,
} from '@/lib/trainerExerciseNoteService';
import type { FeedbackAttachmentDraft } from '@/lib/trainerFeedbackMediaService';

type ActiveVideo = {
  key: string;
  name: string;
  videoId: string;
};

type SendTarget = {
  key: string;
  name: string;
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
  getVideoId: (name: string, aimharderEjerId?: number, youtubeVideoId?: string) => string | null;
  hasVideo: (name: string, aimharderEjerId?: number, youtubeVideoId?: string) => boolean;
  readOnly?: boolean;
  readOnlySubtitle?: string;
  logId?: string;
  userId?: string;
  ensureLog?: () => Promise<{ logId?: string; error?: string }>;
  onLogEnsured?: (logId: string) => void;
  /** Vídeos para el entrenador: solo Personal · Coaching. */
  allowFeedbackVideos?: boolean;
  /** Contenido extra sobre los bloques, p. ej. el PDF adjunto a la sesión. */
  attachment?: ReactNode;
  /** Misma pantalla que el atleta, sin guardar marcas ni comentarios. */
  preview?: boolean;
  /** Corrección en vídeo del atleta (telestrator, solo web). */
  onAnnotatedVideo?: (draft: FeedbackAttachmentDraft, video: SessionLogVideo) => void;
  /**
   * Activa los apuntes privados del entrenador sobre cada ejercicio y cada vídeo.
   * Solo tiene efecto cuando quien mira el registro es entrenador o administrador.
   */
  trainerNotes?: { athleteId?: string; athletePlanId?: string; performedOn?: string };
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
  ensureLog,
  onLogEnsured,
  allowFeedbackVideos = false,
  attachment,
  preview = false,
  onAnnotatedVideo,
  trainerNotes,
}: SessionWorkoutViewProps) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const [sendTarget, setSendTarget] = useState<SendTarget | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const locked = readOnly || preview;

  const {
    videos,
    isLoading: videosLoading,
    isUploading,
    uploadingExerciseKey,
    error: videosError,
    pendingUpload,
    uploadVideo,
    confirmPendingUpload,
    cancelPendingUpload,
    editPendingUpload,
    removeVideo,
  } = useSessionVideos(logId, userId);

  const {
    commentsByKey,
    savingBlockKey,
    error: blockCommentsError,
    saveText,
    uploadAudio,
    removeAudio,
  } = useSessionBlockComments(logId, userId);

  const exerciseNotes = useTrainerExerciseNotes({
    athleteId: trainerNotes?.athleteId,
    sessionLogId: logId,
    athletePlanId: trainerNotes?.athletePlanId,
    performedOn: trainerNotes?.performedOn,
  });

  const [activeTrainerNote, setActiveTrainerNote] = useState<{
    exerciseKey: string;
    name: string;
    sessionVideoId?: string;
    contextLabel?: string;
  } | null>(null);

  const sentExerciseKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const video of videos) {
      if (video.exerciseKey) keys.add(video.exerciseKey);
    }
    return keys;
  }, [videos]);

  const completedTotal = checklist.filter((item) => completed[item.key]).length;
  const total = checklist.length;

  const openExerciseVideo = (
    key: string,
    name: string,
    aimharderEjerId?: number,
    youtubeVideoId?: string,
  ) => {
    const videoId = getVideoId(name, aimharderEjerId, youtubeVideoId);
    if (!videoId) return;
    setActiveVideo((current) => (current?.key === key ? null : { key, name, videoId }));
  };

  const handleUpload = async (source: SessionVideoSource, target?: SendTarget | null) => {
    setLocalError(null);
    const result = await uploadVideo({
      source,
      exerciseKey: target?.key,
      exerciseName: target?.name,
      ensureLogId: ensureLog,
    });

    if (result.logId && result.logId !== logId) {
      onLogEnsured?.(result.logId);
    }

    if (result.error) {
      setLocalError(result.error);
    }
  };

  const handleBlockCommentLog = (result: { logId?: string; error?: string }) => {
    if (result.logId && result.logId !== logId) {
      onLogEnsured?.(result.logId);
    }
    if (result.error) {
      setLocalError(result.error);
    }
  };

  const renderBlockComment = (blockKey: string) => (
    <BlockCommentField
      key={blockKey}
      blockKey={blockKey}
      comment={commentsByKey.get(blockKey)}
      readOnly={readOnly && !preview}
      disabled={locked}
      isSaving={savingBlockKey === blockKey}
      onSaveText={(text) => {
        if (locked) return;
        void saveText(blockKey, text, ensureLog).then(handleBlockCommentLog);
      }}
      onAudioReady={(draft) => {
        if (locked) return;
        void uploadAudio(blockKey, draft, ensureLog).then(handleBlockCommentLog);
      }}
      onRemoveAudio={() => {
        if (locked) return;
        void removeAudio(blockKey).then(handleBlockCommentLog);
      }}
    />
  );

  const renderTrainerExerciseNotes = (
    target: { name: string; exerciseKey: string },
    context?: { sessionVideoId?: string; contextLabel?: string },
  ) => {
    if (!exerciseNotes.enabled) return null;

    const { name, exerciseKey } = target;
    const notes = exerciseNotes.notesByExercise.get(exerciseKey) ?? [];
    const history = exerciseNotes.historyByKey[exerciseKey] ?? [];
    const summary = exerciseNotes.summaryByKey[exerciseKey];

    return (
      <TrainerExerciseNoteTrigger
        exerciseName={name}
        noteCount={notes.length}
        historyCount={summary?.historyCount ?? history.length}
        lastHistoryAge={
          summary ? formatTrainerExerciseNoteAge(summary.lastPerformedOn) : undefined
        }
        onPress={() =>
          setActiveTrainerNote({
            exerciseKey,
            name,
            sessionVideoId: context?.sessionVideoId,
            contextLabel: context?.contextLabel,
          })
        }
      />
    );
  };

  const renderExerciseNotes = (
    exerciseName: string,
    context?: { sessionVideoId?: string; contextLabel?: string },
  ) => {
    const target = resolveTrainerExerciseNoteTarget({ exerciseName });
    if (!target) return null;
    return renderTrainerExerciseNotes(target, context);
  };

  const renderVideoNotes = (video: SessionLogVideo) => {
    const target = resolveTrainerExerciseNoteTarget({
      exerciseName: video.exerciseName,
      sessionVideoId: video.id,
    });
    if (!target) return null;

    const displayName =
      video.exerciseName?.trim() || video.fileName?.trim() || target.name;

    return renderTrainerExerciseNotes(
      { exerciseKey: target.exerciseKey, name: displayName },
      { sessionVideoId: video.id },
    );
  };

  const sectionProps = (sectionKey: string) => ({
    sectionKey,
    completedItems: completed,
    onToggleItem: locked ? undefined : onToggleItem,
    onExercisePress: (name: string, aimharderEjerId?: number, youtubeVideoId?: string) =>
      openExerciseVideo(`block:${normalizeExerciseName(name)}`, name, aimharderEjerId, youtubeVideoId),
    hasExerciseVideo: (name: string, aimharderEjerId?: number, youtubeVideoId?: string) =>
      hasVideo(name, aimharderEjerId, youtubeVideoId),
    activeExerciseName: activeVideo?.name,
    onSendExerciseVideo:
      locked || !allowFeedbackVideos
        ? undefined
        : (exerciseKey: string, exerciseName: string) => {
            setSendTarget({ key: exerciseKey, name: exerciseName });
          },
    uploadingExerciseKey: locked ? null : uploadingExerciseKey,
    sentExerciseKeys: locked ? undefined : sentExerciseKeys,
    renderAfterBlock: renderBlockComment,
    // El crono acompaña al entreno en marcha, no al registro que ya cerró el atleta.
    showBlockTimers: !readOnly || preview,
    renderExerciseExtra: exerciseNotes.enabled
      ? (exerciseName: string) => renderExerciseNotes(exerciseName)
      : undefined,
  });

  if (loadingLog) {
    return <ActivityIndicator color={colors.accent} style={styles.loader} />;
  }

  const displayError = localError || videosError || blockCommentsError || error;

  return (
    <View>
      <Text style={styles.title}>{workout.name}</Text>
      <Text style={styles.meta}>{[scheduledDateLabel, meta].filter(Boolean).join(' · ')}</Text>

      <Card style={styles.progressCard}>
        {preview ? (
          <Text style={styles.textOnlyHint}>Marca las partes del entreno conforme las vayas haciendo</Text>
        ) : readOnly ? (
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

      {attachment}

      {activeVideo ? (
        <ExerciseVideoPanel
          exerciseName={activeVideo.name}
          youtubeVideoId={activeVideo.videoId}
          onClose={() => setActiveVideo(null)}
        />
      ) : null}

      <WorkoutSection title="Calentamiento" content={workout.warmup} icon="warmup" {...sectionProps('warmup')} />
      <WorkoutSection
        title={formatSessionSectionTitle(workout.sessionNumber, workout.name, workout.kind)}
        content={workout.main}
        icon="main"
        variant="featured"
        {...sectionProps('main')}
      />
      {workout.core?.trim() ? (
        <WorkoutSection title="Core / Accesorio" content={workout.core} icon="core" {...sectionProps('core')} />
      ) : null}

      {workout.exercises.length > 0 &&
      !workout.warmup?.trim() &&
      !workout.main?.trim() &&
      !workout.core?.trim() ? (
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
                  hasVideo={hasVideo(exercise.name, exercise.aimharderEjerId, exercise.youtubeVideoId)}
                  isVideoActive={isVideoActive}
                  onToggle={locked ? undefined : () => onToggleItem(key)}
                  onOpenVideo={() =>
                    openExerciseVideo(
                      exercise.id,
                      exercise.name,
                      exercise.aimharderEjerId,
                      exercise.youtubeVideoId,
                    )
                  }
                  onSendVideo={
                    locked || !allowFeedbackVideos
                      ? undefined
                      : () => setSendTarget({ key, name: exercise.name })
                  }
                  isSendingVideo={!locked && uploadingExerciseKey === key}
                  hasSentVideo={!locked && sentExerciseKeys.has(key)}
                  renderExtra={renderExerciseNotes(exercise.name)}
                />
              </View>
            );
          })}
        </View>
      ) : null}

      <WorkoutSection title="Vuelta a la calma" content={workout.cooldown} icon="cooldown" {...sectionProps('cooldown')} />

      {readOnly && !preview && feelings.trim() ? (
        <Card style={styles.feelingsCard}>
          <Text style={styles.feelingsLabel}>Sensaciones del atleta</Text>
          <Text style={styles.feelingsReadOnly}>{feelings}</Text>
        </Card>
      ) : null}

      {!locked || preview ? (
        <>
          <Input
            label="¿Cómo te has sentido?"
            value={preview ? '' : feelings}
            onChangeText={preview ? () => {} : onFeelingsChange}
            placeholder="Energía, fatiga, dolor, sensaciones…"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!preview}
            style={styles.feelingsInput}
          />

          {allowFeedbackVideos && !preview ? (
            <SessionLogVideos
              videos={videos}
              isLoading={videosLoading}
              isUploading={isUploading && !uploadingExerciseKey}
              error={videosError}
              onUpload={(source) => void handleUpload(source)}
              onRemove={(videoId) => void removeVideo(videoId)}
              readOnly={false}
              canUpload
            />
          ) : null}

          {preview ? null : saved ? (
            <Card style={styles.successCard}>
              <Text style={styles.successTitle}>Sesión guardada</Text>
              <Text style={styles.successText}>
                {allowFeedbackVideos
                  ? 'Tu entrenador podrá ver tu progreso, sensaciones y videos del entreno.'
                  : 'Tu entrenador podrá ver tu progreso y sensaciones del entreno.'}
              </Text>
            </Card>
          ) : (
            <Button title="Guardar sesión" onPress={onSave} loading={saving} style={styles.saveBtn} />
          )}
        </>
      ) : (
        <SessionLogVideos
          videos={videos}
          isLoading={videosLoading}
          readOnly
          compact={false}
          onAnnotatedVideo={onAnnotatedVideo}
          renderVideoExtra={exerciseNotes.enabled ? renderVideoNotes : undefined}
        />
      )}

      {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

      <ActionSheetModal
        visible={allowFeedbackVideos && Boolean(sendTarget)}
        title={sendTarget ? `Vídeo · ${sendTarget.name}` : 'Enviar vídeo'}
        subtitle="Graba cómo haces el ejercicio o elige un vídeo de la galería."
        onClose={() => setSendTarget(null)}
        actions={[
          {
            key: 'camera',
            label: isUploading ? 'Abriendo cámara…' : 'Grabar con la cámara',
            disabled: isUploading,
            onPress: () => {
              const target = sendTarget;
              setSendTarget(null);
              void handleUpload('camera', target);
            },
          },
          {
            key: 'library',
            label: isUploading ? 'Subiendo…' : Platform.OS === 'web' ? 'Elegir vídeo' : 'Elegir de la galería',
            disabled: isUploading,
            onPress: () => {
              const target = sendTarget;
              setSendTarget(null);
              void handleUpload('library', target);
            },
          },
        ]}
      />

      <SessionVideoSendModal
        visible={Boolean(pendingUpload)}
        exerciseName={pendingUpload?.exerciseName}
        sending={isUploading}
        onSend={() => {
          void confirmPendingUpload().then((result) => {
            if (result.logId && result.logId !== logId) {
              onLogEnsured?.(result.logId);
            }
            if (result.error) {
              setLocalError(result.error);
            }
          });
        }}
        onEdit={() => {
          void editPendingUpload().then((result) => {
            if (result?.error) {
              setLocalError(result.error);
            }
          });
        }}
        onCancel={cancelPendingUpload}
      />

      {activeTrainerNote && exerciseNotes.enabled ? (
        <TrainerExerciseNoteModal
          visible
          onClose={() => setActiveTrainerNote(null)}
          exerciseName={activeTrainerNote.name}
          notes={exerciseNotes.notesByExercise.get(activeTrainerNote.exerciseKey) ?? []}
          history={exerciseNotes.historyByKey[activeTrainerNote.exerciseKey] ?? []}
          historyLoading={exerciseNotes.loadingHistoryKey === activeTrainerNote.exerciseKey}
          isSaving={exerciseNotes.savingKey === activeTrainerNote.exerciseKey}
          nextSetNumber={exerciseNotes.nextSetNumber(activeTrainerNote.exerciseKey)}
          contextLabel={activeTrainerNote.contextLabel}
          error={exerciseNotes.error}
          onSave={(draft, noteId) => {
            void exerciseNotes.saveNote({
              exerciseKey: activeTrainerNote.exerciseKey,
              exerciseName: activeTrainerNote.name,
              draft,
              noteId,
              sessionVideoId: activeTrainerNote.sessionVideoId,
            });
          }}
          onRemove={(note) => {
            void exerciseNotes.removeNote(note);
          }}
          onRequestHistory={() => {
            void exerciseNotes.loadHistory(activeTrainerNote.exerciseKey);
          }}
        />
      ) : null}
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
