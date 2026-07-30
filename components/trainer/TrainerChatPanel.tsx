import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FeedbackAttachmentList } from '@/components/feedback/FeedbackAttachmentList';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { TrainerMessage } from '@/lib/types';

interface TrainerChatPanelProps {
  title?: string;
  subtitle?: string;
  emptyTitle: string;
  emptyText: string;
  messages: TrainerMessage[];
  isEmpty: boolean;
  newMessage: string;
  onChangeMessage: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function TrainerChatPanel({
  title,
  subtitle,
  emptyTitle,
  emptyText,
  messages,
  isEmpty,
  newMessage,
  onChangeMessage,
  onSend,
  disabled = false,
  disabledMessage,
}: TrainerChatPanelProps) {
  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}

      <ScrollView style={styles.chat} contentContainerStyle={styles.chatContent}>
        <View style={styles.chatInner}>
          {isEmpty ? (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
          ) : (
            messages.map((msg) => {
              const isFeedback = msg.origin === 'feedback';

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.bubble,
                    msg.sender === 'user' ? styles.bubbleUser : styles.bubbleTrainer,
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
                    <Text style={[styles.bubbleText, msg.sender === 'user' ? styles.bubbleTextUser : null]}>
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

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder={disabled ? disabledMessage ?? 'Chat bloqueado' : 'Escribe un mensaje...'}
          placeholderTextColor={colors.textMuted}
          value={newMessage}
          onChangeText={onChangeMessage}
          editable={!disabled}
        />
        <Button title="Enviar" onPress={onSend} style={styles.sendBtn} disabled={disabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: spacing.md },
  title: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  chat: { flex: 1, marginBottom: spacing.sm },
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
  bubbleTrainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
  },
  bubbleUser: {
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
  bubbleTextUser: { color: colors.black },
  inputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  inputDisabled: { opacity: 0.5 },
  sendBtn: { minWidth: 90, minHeight: 48 },
});
