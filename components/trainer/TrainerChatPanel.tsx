import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  ChatComposerToolbar,
  ChatDraftPreview,
  ChatEmojiPicker,
} from '@/components/chat/ChatComposer';
import { FeedbackAttachmentList } from '@/components/feedback/FeedbackAttachmentList';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { useChatComposer } from '@/hooks/useChatComposer';
import type { TrainerMessage } from '@/lib/types';

type ChatComposerState = ReturnType<typeof useChatComposer>;

interface TrainerChatPanelProps {
  title?: string;
  subtitle?: string;
  emptyTitle: string;
  emptyText: string;
  messages: TrainerMessage[];
  isEmpty: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  /** Quién está viendo el chat: sus mensajes van a la derecha y en color de acento. */
  viewerRole?: TrainerMessage['sender'];
  /** Versión compacta para el widget flotante del calendario. */
  compact?: boolean;
  /** Compositor con adjuntos, emojis y arrastrar archivos. */
  composer: ChatComposerState;
}

function formatRecordingTimer(millis: number) {
  const total = Math.floor(millis / 1000);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TrainerChatPanel({
  title,
  subtitle,
  emptyTitle,
  emptyText,
  messages,
  isEmpty,
  disabled = false,
  disabledMessage,
  viewerRole = 'user',
  compact = false,
  composer,
}: TrainerChatPanelProps) {
  const {
    newMessage,
    onChangeMessage,
    drafts,
    removeDraft,
    attachError,
    emojiOpen,
    setEmojiOpen,
    quickEmojis,
    onEmojiSelect,
    dragOver,
    webDropHandlers,
    sending,
    onSend,
    onAttachCamera,
    onAttachGif,
    onAttachFile,
    onToggleRecording,
    onCancelRecording,
    isRecording,
    recordingMillis,
    recordingError,
  } = composer;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}

      <View style={styles.chatArea} {...webDropHandlers}>
        {dragOver ? (
          <View style={styles.dropOverlay} pointerEvents="none">
            <Ionicons name="attach-outline" size={28} color={colors.accent} />
            <Text style={styles.dropText}>Suelta aquí para adjuntar</Text>
          </View>
        ) : null}

        <ScrollView
          style={[styles.chat, compact && styles.chatCompact]}
          contentContainerStyle={styles.chatContent}
        >
          <View style={styles.chatInner}>
            {isEmpty ? (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                <Text style={styles.emptyText}>{emptyText}</Text>
              </View>
            ) : (
              messages.map((msg) => {
                const isFeedback = msg.origin === 'feedback';
                const isOwn = msg.sender === viewerRole;

                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.bubble,
                      isOwn ? styles.bubbleOwn : styles.bubbleOther,
                      isFeedback && styles.bubbleFeedback,
                      isFeedback && styles.bubbleWide,
                    ]}
                  >
                    {isFeedback ? (
                      <View style={styles.feedbackTag}>
                        <AppIcon name="stats" size={13} color={colors.accent} />
                        <Text style={styles.feedbackTagText}>Feedback del entrenador</Text>
                      </View>
                    ) : null}

                    {msg.text ? (
                      <Text style={[styles.bubbleText, isOwn && !isFeedback ? styles.bubbleTextOwn : null]}>
                        {msg.text}
                      </Text>
                    ) : null}

                    {msg.attachments?.length ? (
                      <FeedbackAttachmentList attachments={msg.attachments} />
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {isRecording ? (
        <View style={styles.recordingBar}>
          <Text style={styles.recordingText}>Grabando {formatRecordingTimer(recordingMillis)}</Text>
          <Button title="Cancelar" variant="outline" onPress={() => void onCancelRecording()} style={styles.recordingBtn} />
          <Button title="Listo" onPress={() => void onToggleRecording()} style={styles.recordingBtn} />
        </View>
      ) : (
        <>
          <ChatComposerToolbar
            disabled={disabled}
            compact={compact}
            isRecording={isRecording}
            onToggleRecording={onToggleRecording}
            onAttachCamera={onAttachCamera}
            onAttachGif={onAttachGif}
            onAttachFile={onAttachFile}
            emojiOpen={emojiOpen}
            onToggleEmoji={() => setEmojiOpen((current) => !current)}
            allowVideoAttachments={composer.allowVideoAttachments}
          />

          {emojiOpen ? <ChatEmojiPicker emojis={quickEmojis} onSelect={onEmojiSelect} /> : null}

          <ChatDraftPreview drafts={drafts} onRemove={removeDraft} />

          {attachError ? <Text style={styles.attachError}>{attachError}</Text> : null}
          {recordingError ? <Text style={styles.attachError}>{recordingError}</Text> : null}

          <View style={[styles.inputRow, compact && styles.inputRowCompact]}>
            <TextInput
              style={[styles.input, compact && styles.inputCompact, disabled && styles.inputDisabled]}
              placeholder={disabled ? disabledMessage ?? 'Chat bloqueado' : 'Escribe un mensaje...'}
              placeholderTextColor={colors.textMuted}
              value={newMessage}
              onChangeText={onChangeMessage}
              editable={!disabled && !sending}
              multiline
            />
            <Button
              title="Enviar"
              onPress={() => void onSend()}
              style={compact ? styles.sendBtnCompact : styles.sendBtn}
              disabled={disabled || sending}
              loading={sending}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerCompact: { minHeight: 0 },
  header: { marginBottom: spacing.md },
  title: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  chatArea: {
    flex: 1,
    position: 'relative',
    minHeight: 0,
  },
  dropOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.accent}22`,
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
  },
  dropText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
  chat: { flex: 1, marginBottom: spacing.sm },
  chatCompact: { marginBottom: spacing.xs },
  chatContent: { flexGrow: 1 },
  chatInner: { flexGrow: 1, paddingVertical: spacing.sm },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
  },
  bubbleOwn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
  },
  bubbleFeedback: {
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
    backgroundColor: `${colors.accent}12`,
  },
  bubbleWide: { maxWidth: '92%' },
  feedbackTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  feedbackTagText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bubbleText: { ...typography.body, color: colors.text },
  bubbleTextOwn: { color: colors.black },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.danger}12`,
    borderWidth: 1,
    borderColor: `${colors.danger}44`,
  },
  recordingText: {
    ...typography.bodySmall,
    color: colors.danger,
    fontWeight: '700',
    flex: 1,
  },
  recordingBtn: {
    minWidth: 72,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  attachError: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  inputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl, alignItems: 'flex-end' },
  inputRowCompact: { marginBottom: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
    maxHeight: 120,
  },
  inputCompact: { minHeight: 40, maxHeight: 96 },
  inputDisabled: { opacity: 0.5 },
  sendBtn: { minWidth: 90, minHeight: 48 },
  sendBtnCompact: { minWidth: 76, minHeight: 40 },
});
