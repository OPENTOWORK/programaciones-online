import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FeedbackAttachmentList } from '@/components/feedback/FeedbackAttachmentList';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
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

function wasEdited(entry: TrainerAthleteFeedback) {
  const created = new Date(entry.createdAt).getTime();
  const updated = new Date(entry.updatedAt).getTime();
  return Number.isFinite(created) && Number.isFinite(updated) && updated - created > 1000;
}

export function AthleteFeedbackComposer({
  entries,
  isLoading,
  sending,
  persistent,
  error,
  onSend,
  onUpdate,
  onRemove,
  compact = false,
  showHistory = true,
  placeholder = 'Valoración, corrección o recomendación...',
  historyTitle = 'Feedback enviado',
  emptyHistoryText = 'Todavía no hay feedback para esta sesión.',
  queuedDrafts,
  queuedMessage,
  onQueuedDraftsConsumed,
}: {
  entries: TrainerAthleteFeedback[];
  isLoading?: boolean;
  sending: boolean;
  persistent: boolean;
  error: string | null;
  onSend: (
    message: string,
    attachments: FeedbackAttachmentDraft[],
  ) => Promise<{ error?: string }>;
  onUpdate: (
    entry: TrainerAthleteFeedback,
    message: string,
    attachments: FeedbackAttachmentDraft[],
  ) => Promise<{ error?: string }>;
  onRemove: (entry: TrainerAthleteFeedback) => void;
  compact?: boolean;
  showHistory?: boolean;
  placeholder?: string;
  historyTitle?: string;
  emptyHistoryText?: string;
  queuedDrafts?: FeedbackAttachmentDraft[];
  queuedMessage?: string;
  onQueuedDraftsConsumed?: () => void;
}) {
  const recorder = useVoiceNoteRecorder();
  const [message, setMessage] = useState('');
  const [drafts, setDrafts] = useState<FeedbackAttachmentDraft[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TrainerAthleteFeedback | null>(null);
  const [editingEntry, setEditingEntry] = useState<TrainerAthleteFeedback | null>(null);

  useEffect(() => {
    if (!queuedDrafts?.length) return;
    setDrafts((current) => {
      const existing = new Set(current.map((item) => item.uri));
      const incoming = queuedDrafts.filter((item) => !existing.has(item.uri));
      return incoming.length > 0 ? [...current, ...incoming] : current;
    });
    if (queuedMessage) {
      setMessage((current) => (current.trim() ? current : queuedMessage));
    }
    onQueuedDraftsConsumed?.();
  }, [onQueuedDraftsConsumed, queuedDrafts, queuedMessage]);

  const existingAttachmentCount = editingEntry?.attachments.length ?? 0;
  const attachmentsFull = existingAttachmentCount + drafts.length >= MAX_FEEDBACK_ATTACHMENTS;
  const canSubmit =
    Boolean(message.trim()) || drafts.length > 0 || existingAttachmentCount > 0;

  const handleAttachVideo = async (source: 'library' | 'camera' = 'library') => {
    setAttachError(null);
    if (attachmentsFull) {
      setAttachError(`Máximo ${MAX_FEEDBACK_ATTACHMENTS} adjuntos por feedback.`);
      return;
    }

    const result = await pickFeedbackVideo(source);
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

  const resetComposer = () => {
    setEditingEntry(null);
    setMessage('');
    setDrafts([]);
    setAttachError(null);
  };

  const startEdit = (entry: TrainerAthleteFeedback) => {
    if (recorder.isRecording) {
      void recorder.cancel();
    }
    setAttachError(null);
    setEditingEntry(entry);
    setMessage(entry.message);
    setDrafts([]);
  };

  const handleSend = async () => {
    const result = editingEntry
      ? await onUpdate(editingEntry, message, drafts)
      : await onSend(message, drafts);
    if (!result.error) {
      resetComposer();
    }
  };

  return (
    <View style={compact ? styles.compactRoot : styles.root}>
      {!persistent ? (
        <Text style={styles.warning}>
          El feedback se guarda temporalmente porque Supabase no está disponible.
        </Text>
      ) : null}

      {editingEntry ? (
        <Text style={styles.editingBanner}>
          Editando el feedback del {formatDate(editingEntry.createdAt)}. Los adjuntos actuales se
          mantienen; puedes añadir más.
        </Text>
      ) : null}

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={2000}
        style={[styles.input, compact && styles.inputCompact]}
      />

      <View style={styles.attachRow}>
        <Pressable
          onPress={() => void handleAttachVideo('library')}
          disabled={recorder.isRecording}
          style={({ pressed }) => [
            styles.attachButton,
            compact && styles.attachButtonCompact,
            pressed && styles.attachPressed,
            recorder.isRecording && styles.attachDisabled,
          ]}
        >
          <AppIcon name="video" size={compact ? 15 : 17} color={colors.accent} />
          <Text style={[styles.attachText, compact && styles.attachTextCompact]}>Elegir vídeo</Text>
        </Pressable>

        <Pressable
          onPress={() => void handleAttachVideo('camera')}
          disabled={recorder.isRecording}
          style={({ pressed }) => [
            styles.attachButton,
            compact && styles.attachButtonCompact,
            pressed && styles.attachPressed,
            recorder.isRecording && styles.attachDisabled,
          ]}
        >
          <AppIcon name="camera" size={compact ? 15 : 17} color={colors.accent} outlined />
          <Text style={[styles.attachText, compact && styles.attachTextCompact]}>Grabar vídeo</Text>
        </Pressable>

        <Pressable
          onPress={handleToggleRecording}
          disabled={recorder.isPreparing}
          style={({ pressed }) => [
            styles.attachButton,
            compact && styles.attachButtonCompact,
            recorder.isRecording && styles.attachRecording,
            pressed && styles.attachPressed,
          ]}
        >
          <AppIcon
            name={recorder.isRecording ? 'stop' : 'mic'}
            size={compact ? 15 : 17}
            color={recorder.isRecording ? colors.danger : colors.accent}
          />
          <Text
            style={[
              styles.attachText,
              compact && styles.attachTextCompact,
              recorder.isRecording && styles.attachTextRecording,
            ]}
          >
            {recorder.isRecording
              ? formatTimer(recorder.durationMillis)
              : recorder.isPreparing
                ? 'Preparando…'
                : 'Nota de voz'}
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
                  {draft.kind === 'audio'
                    ? 'Nota de voz'
                    : draft.fileName.toLowerCase().startsWith('correccion-')
                      ? 'Corrección en vídeo'
                      : draft.fileName}
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
        <View style={styles.sendActions}>
          {editingEntry ? (
            <Button
              title="Cancelar"
              variant="ghost"
              size={compact ? 'compact' : 'default'}
              onPress={resetComposer}
              disabled={sending}
            />
          ) : null}
          <Button
            title={editingEntry ? 'Guardar cambios' : 'Enviar'}
            onPress={handleSend}
            loading={sending}
            disabled={!canSubmit || recorder.isRecording}
            size={compact ? 'compact' : 'default'}
            style={compact ? styles.sendButtonCompact : styles.sendButton}
          />
        </View>
      </View>

      {attachError ? <Text style={styles.error}>{attachError}</Text> : null}
      {recorder.error ? <Text style={styles.error}>{recorder.error}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {showHistory ? (
        <>
          <Text style={[styles.historyTitle, compact && styles.historyTitleCompact]}>
            {historyTitle}
          </Text>
          {isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : entries.length === 0 ? (
            <Text style={styles.empty}>{emptyHistoryText}</Text>
          ) : (
            entries.map((entry) => (
              <View
                key={entry.id}
                style={[styles.entry, editingEntry?.id === entry.id && styles.entryEditing]}
              >
                <View style={styles.entryCopy}>
                  <Text style={styles.entryDate}>
                    {formatDate(entry.createdAt)}
                    {entry.trainerName ? ` · ${entry.trainerName}` : ''}
                    {wasEdited(entry) ? ' · editado' : ''}
                  </Text>
                  {entry.message ? <Text style={styles.entryMessage}>{entry.message}</Text> : null}
                  <FeedbackAttachmentList attachments={entry.attachments} />
                </View>
                <View style={styles.entryActions}>
                  <Pressable
                    onPress={() => startEdit(entry)}
                    accessibilityLabel="Editar feedback"
                    hitSlop={8}
                    style={({ pressed }) => [styles.entryAction, pressed && styles.entryActionPressed]}
                  >
                    <AppIcon name="edit" size={17} color={colors.accent} />
                  </Pressable>
                  <Pressable
                    onPress={() => setPendingDelete(entry)}
                    accessibilityLabel="Eliminar feedback"
                    hitSlop={8}
                    style={({ pressed }) => [styles.entryAction, pressed && styles.entryActionPressed]}
                  >
                    <AppIcon name="trash" size={17} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </>
      ) : null}

      <ConfirmModal
        visible={pendingDelete !== null}
        title="Eliminar feedback"
        message="Se quitará este feedback y el atleta dejará de verlo. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const entry = pendingDelete;
          setPendingDelete(null);
          if (!entry) return;
          if (editingEntry?.id === entry.id) {
            resetComposer();
          }
          void onRemove(entry);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {},
  compactRoot: {
    flex: 1,
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  editingBanner: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
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
  inputCompact: {
    minHeight: 72,
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
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  attachButtonCompact: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
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
  attachTextCompact: {
    fontSize: 11,
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
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  sendActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  counter: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sendButton: {
    minHeight: 44,
    minWidth: 160,
  },
  sendButtonCompact: {
    minHeight: 40,
    minWidth: 128,
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
  historyTitleCompact: {
    ...typography.bodySmall,
    marginTop: spacing.md,
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
  entryEditing: {
    backgroundColor: withAlpha(colors.accent, '12'),
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
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
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  entryAction: {
    padding: spacing.xs,
  },
  entryActionPressed: {
    opacity: 0.6,
  },
});
