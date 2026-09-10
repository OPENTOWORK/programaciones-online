import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { SUPPORT_MESSAGE_MAX_LENGTH } from '@/constants/support';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';

/** Compositor de respuesta, compartido por la vista del usuario y la del administrador. */
export function SupportReplyBox({
  placeholder = 'Escribe una respuesta...',
  sending,
  disabled = false,
  disabledReason,
  submitLabel = 'Enviar respuesta',
  tone = 'default',
  onSend,
}: {
  placeholder?: string;
  sending: boolean;
  disabled?: boolean;
  disabledReason?: string;
  submitLabel?: string;
  tone?: 'default' | 'internal';
  onSend: (message: string) => Promise<{ error?: string }>;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const message = value.trim();
    if (!message || sending) return;

    setError(null);
    const result = await onSend(message);

    if (result.error) {
      setError(result.error);
      return;
    }

    setValue('');
  };

  if (disabled) {
    return <Text style={styles.disabledText}>{disabledReason}</Text>;
  }

  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={SUPPORT_MESSAGE_MAX_LENGTH}
        style={[styles.input, tone === 'internal' && styles.inputInternal]}
        accessibilityLabel={placeholder}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Text style={styles.counter}>
          {value.length}/{SUPPORT_MESSAGE_MAX_LENGTH}
        </Text>
        <Button
          title={sending ? 'Enviando...' : submitLabel}
          variant={tone === 'internal' ? 'outline' : 'primary'}
          size="compact"
          loading={sending}
          disabled={value.trim().length === 0}
          onPress={() => void handleSend()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 96,
    padding: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.bodySmall,
    textAlignVertical: 'top',
  },
  inputInternal: {
    borderColor: withAlpha(colors.warning, '55'),
    backgroundColor: withAlpha(colors.warning, '0D'),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  counter: {
    ...typography.caption,
    color: colors.textMuted,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  disabledText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
