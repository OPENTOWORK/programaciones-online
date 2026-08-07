import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';

import { FeedbackAttachmentList } from '@/components/feedback/FeedbackAttachmentList';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useTrainerAthleteFeedback } from '@/hooks/useTrainerAthleteFeedback';
import { useVoiceNoteRecorder } from '@/hooks/useVoiceNoteRecorder';
import {
  MAX_FEEDBACK_ATTACHMENTS,
  formatAttachmentDuration,
  pickFeedbackVideo,
} from '@/lib/feedbackAttachments';
import type { FeedbackAttachmentDraft } from '@/lib/trainerFeedbackMediaService';
import type { TrainerAthleteFeedback } from '@/lib/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTimer(millis: number) {
  const total = Math.floor(millis / 1000);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AthleteFeedbackPanel({
  athleteId,
  style,
}: {
  athleteId: string;
  style?: ViewStyle;
}) {
  const { entries, isLoading, sending, persistent, error, send, remove } =
    useTrainerAthleteFeedback(athleteId);
  const recorder = useVoiceNoteRecorder();
  const [message, setMessage] = useState('');
  const [drafts, setDrafts] = useState<FeedbackAttachmentDraft[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);

  const attachmentsFull = drafts.length >= MAX_FEEDBACK_ATTACHMENTS;

  const handleAttachVideo = async () => {
    setAttachError(null);
    if (attachmentsFull) {
      setAttachError(`Máximo ${MAX_FEEDBACK_ATTACHMENTS} adjuntos por feedback.`);
      return;
    }

    const result = await pickFeedbackVideo();
    if (result.error) {
      setAttachError(result.error);
      return;
    }
    if (result.draft) setDrafts((current) => [...current, result.draft!]);
  };

  const handleToggleRecording = async () => {
    setAttachError(null);

    if (recorder.isRecording) {
      const draft = await recorder.stop();
      if (draft) setDrafts((current) => [...current, draft]);
      return;
    }

    if (attachmentsFull) {
      setAttachError(`Máximo ${MAX_FEEDBACK_ATTACHMENTS} adjuntos por feedback.`);
      return;
    }
    await recorder.start();
  };

  const handleCancelRecording = async () => {
    await recorder.cancel();
  };

  const removeDraft = (index: number) => {
    setDrafts((current) => current.filter((_, position) => position !== index));
  };

  const handleSend = async () => {
    const result = await send(message, drafts);
    if (!result.error) {
      setMessage('');
      setDrafts([]);
    }
  };

  const confirmDelete = (entry: TrainerAthleteFeedback) => {
    const execute = () => void remove(entry);
    if (Platform.OS === 'web') {
      if (window.confirm('¿Eliminar este feedback? El atleta dejará de verlo.')) execute();
      return;
    }
    Alert.alert('Eliminar feedback', 'El atleta dejará de verlo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: execute },
    ]);
  };

  return (
    <CollapsibleSection
      style={style}
      title="Feedback para el atleta"
      subtitle="Aparecerá en su apartado Mi Progreso y en el chat, con los vídeos y notas de voz que adjuntes"
    >
      {!persistent ? (
        <Text style={styles.warning}>
          El feedback se guarda temporalmente porque Supabase no está disponible.
        </Text>
      ) : null}

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Escribe una valoración, corrección o recomendación..."
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={2000}
        style={styles.input}
      />
      <View style={styles.attachRow}>
        <Pressable
          onPress={handleAttachVideo}
          disabled={recorder.isRecording}
          style={({ pressed }) => [
            styles.attachButton,
            pressed && styles.attachPressed,
            recorder.isRecording && styles.attachDisabled,
          ]}
        >
          <AppIcon name="video" size={17} color={colors.accent} />
          <Text style={styles.attachText}>Adjuntar vídeo</Text>
        </Pressable>

        <Pressable
          onPress={handleToggleRecording}
          disabled={recorder.isPreparing}
          style={({ pressed }) => [
            styles.attachButton,
            recorder.isRecording && styles.attachRecording,
            pressed && styles.attachPressed,
          ]}
        >
          <AppIcon
            name={recorder.isRecording ? 'stop' : 'mic'}
            size={17}
            color={recorder.isRecording ? colors.danger : colors.accent}
          />
          <Text style={[styles.attachText, recorder.isRecording && styles.attachTextRecording]}>
            {recorder.isRecording
              ? `Detener (${formatTimer(recorder.durationMillis)})`
              : recorder.isPreparing
                ? 'Preparando micro…'
                : 'Grabar nota de voz'}
          </Text>
        </Pressable>

        {recorder.isRecording ? (
          <Pressable
            onPress={handleCancelRecording}
            style={({ pressed }) => [styles.cancelRecording, pressed && styles.attachPressed]}
          >
            <Text style={styles.cancelRecordingText}>Descartar</Text>
          </Pressable>
        ) : null}
      </View>

      {drafts.length > 0 ? (
        <View style={styles.draftList}>
          {drafts.map((draft, index) => {
            const duration = formatAttachmentDuration(draft.durationSeconds);
            return (
              <View key={`${draft.uri}-${index}`} style={styles.draftChip}>
                <AppIcon
                  name={draft.kind === 'audio' ? 'mic' : 'video'}
                  size={14}
                  color={colors.accent}
                />
                <Text style={styles.draftText} numberOfLines={1}>
                  {draft.kind === 'audio' ? 'Nota de voz' : draft.fileName}
                  {duration ? ` · ${duration}` : ''}
                </Text>
                <Pressable onPress={() => removeDraft(index)} hitSlop={8}>
                  <AppIcon name="close" size={15} color={colors.textMuted} />
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={styles.sendRow}>
        <Text style={styles.counter}>{message.length}/2000</Text>
        <Button
          title="Enviar feedback"
          onPress={handleSend}
          loading={sending}
          disabled={(!message.trim() && drafts.length === 0) || recorder.isRecording}
          style={styles.sendButton}
        />
      </View>

      {attachError ? <Text style={styles.error}>{attachError}</Text> : null}
      {recorder.error ? <Text style={styles.error}>{recorder.error}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.historyTitle}>Feedback enviado</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.accent} />
      ) : entries.length === 0 ? (
        <Text style={styles.empty}>Todavía no se ha enviado feedback a este atleta.</Text>
      ) : (
        entries.map((entry) => (
          <View key={entry.id} style={styles.entry}>
            <View style={styles.entryCopy}>
              <Text style={styles.entryDate}>
                {formatDate(entry.createdAt)}
                {entry.trainerName ? ` · ${entry.trainerName}` : ''}
              </Text>
              {entry.message ? <Text style={styles.entryMessage}>{entry.message}</Text> : null}
              <FeedbackAttachmentList attachments={entry.attachments} />
            </View>
            <Pressable
              onPress={() => confirmDelete(entry)}
              accessibilityLabel="Eliminar feedback"
              hitSlop={8}
              style={({ pressed }) => [styles.deleteButton, pressed && styles.deletePressed]}
            >
              <AppIcon name="trash" size={17} color={colors.danger} />
            </Pressable>
          </View>
        ))
      )}
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
    ...typography.bodySmall,
  },
  attachRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
    backgroundColor: `${colors.accent}14`,
  },
  attachRecording: {
    borderColor: `${colors.danger}66`,
    backgroundColor: `${colors.danger}18`,
  },
  attachDisabled: {
    opacity: 0.5,
  },
  attachPressed: {
    opacity: 0.75,
  },
  attachText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  attachTextRecording: {
    color: colors.danger,
  },
  cancelRecording: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  cancelRecordingText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  draftList: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  draftChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  draftText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  sendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  counter: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sendButton: {
    minHeight: 44,
    minWidth: 160,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  historyTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  entryCopy: {
    flex: 1,
  },
  entryDate: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    marginBottom: 2,
  },
  entryMessage: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 19,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  deletePressed: {
    opacity: 0.6,
  },
});
