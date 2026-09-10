import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { SUPPORT_MESSAGE_MAX_LENGTH, SUPPORT_SUBJECT_MAX_LENGTH } from '@/constants/support';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_CATEGORY_ORDER,
  formatTicketNumber,
  type SupportCategory,
  type SupportTicket,
} from '@/lib/supportService';

const SUPPORT_GREEN = '#4ADE80';

export function SupportForm({
  sending,
  onSubmit,
  onSeeTickets,
  initialCategory = 'technical',
  initialSubject = '',
  initialMessage = '',
}: {
  sending: boolean;
  onSubmit: (input: {
    category: SupportCategory;
    subject: string;
    message: string;
  }) => Promise<{ data?: SupportTicket; error?: string }>;
  onSeeTickets: () => void;
  initialCategory?: SupportCategory;
  initialSubject?: string;
  initialMessage?: string;
}) {
  const [category, setCategory] = useState<SupportCategory>(initialCategory);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<SupportTicket | null>(null);

  const handleSubmit = async () => {
    if (sending) return;

    if (!subject.trim()) {
      setError('El asunto es obligatorio.');
      return;
    }
    if (!message.trim()) {
      setError('Cuéntanos qué ocurre antes de enviar la solicitud.');
      return;
    }

    setError(null);
    const result = await onSubmit({ category, subject, message });

    if (result.error) {
      setError(result.error);
      return;
    }

    setCreated(result.data ?? null);
    setSubject('');
    setMessage('');
    setCategory('technical');
  };

  if (created) {
    return (
      <View style={styles.successCard}>
        <View style={styles.successIcon}>
          <AppIcon name="check" size={20} color={SUPPORT_GREEN} />
        </View>
        <Text style={styles.successTitle}>Solicitud enviada</Text>
        <Text style={styles.successText}>
          Hemos recibido tu consulta. Puedes seguir su estado desde esta misma pantalla.
        </Text>
        <View style={styles.ticketChip}>
          <Text style={styles.ticketChipText}>{formatTicketNumber(created.ticketNumber)}</Text>
        </View>
        <View style={styles.successActions}>
          <Button title="Ver mis solicitudes" onPress={onSeeTickets} style={styles.successButton} />
          <Button
            title="Enviar otra"
            variant="outline"
            onPress={() => setCreated(null)}
            style={styles.successButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chips}>
        {SUPPORT_CATEGORY_ORDER.map((option) => {
          const selected = category === option;
          return (
            <Pressable
              key={option}
              onPress={() => setCategory(option)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {SUPPORT_CATEGORY_LABELS[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Asunto</Text>
      <TextInput
        value={subject}
        onChangeText={setSubject}
        placeholder="Resume el problema en una línea"
        placeholderTextColor={colors.textMuted}
        maxLength={SUPPORT_SUBJECT_MAX_LENGTH}
        style={styles.input}
        accessibilityLabel="Asunto de la solicitud"
      />
      <Text style={styles.counter}>
        {subject.length}/{SUPPORT_SUBJECT_MAX_LENGTH}
      </Text>

      <Text style={styles.label}>Mensaje</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Cuéntanos qué ocurre con el mayor detalle posible: qué hacías, qué esperabas y qué ha pasado."
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={SUPPORT_MESSAGE_MAX_LENGTH}
        style={[styles.input, styles.textarea]}
        accessibilityLabel="Mensaje de la solicitud"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={sending ? 'Enviando...' : 'Enviar solicitud'}
        onPress={() => void handleSubmit()}
        loading={sending}
        disabled={sending}
        style={styles.submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.black,
  },
  input: {
    padding: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.bodySmall,
    minHeight: 46,
  },
  textarea: {
    minHeight: 132,
    textAlignVertical: 'top',
  },
  counter: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  submit: {
    marginTop: spacing.md,
  },
  successCard: {
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: withAlpha(SUPPORT_GREEN, '4D'),
    borderRadius: borderRadius.lg,
    backgroundColor: withAlpha(SUPPORT_GREEN, '0F'),
    padding: spacing.lg,
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(SUPPORT_GREEN, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    ...typography.h3,
    color: colors.text,
  },
  successText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  ticketChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ticketChipText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  successActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    alignSelf: 'stretch',
  },
  successButton: {
    flex: 1,
  },
});
