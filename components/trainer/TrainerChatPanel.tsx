import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.bubble, msg.sender === 'user' ? styles.bubbleUser : styles.bubbleTrainer]}
              >
                <Text style={[styles.bubbleText, msg.sender === 'user' ? styles.bubbleTextUser : null]}>
                  {msg.text}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={colors.textMuted}
          value={newMessage}
          onChangeText={onChangeMessage}
        />
        <Button title="Enviar" onPress={onSend} style={styles.sendBtn} />
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
  sendBtn: { minWidth: 90, minHeight: 48 },
});
