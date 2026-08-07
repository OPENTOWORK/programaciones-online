import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { formatDayLabel, shiftDay } from '@/lib/programSchedulePreview';

interface CopyDayToDateModalProps {
  visible: boolean;
  sourceDate: Date | null;
  sessionCount: number;
  saving?: boolean;
  onCancel: () => void;
  onConfirm: (targetDate: Date) => void;
}

export function CopyDayToDateModal({
  visible,
  sourceDate,
  sessionCount,
  saving = false,
  onCancel,
  onConfirm,
}: CopyDayToDateModalProps) {
  const [targetDate, setTargetDate] = useState(() => shiftDay(new Date(), 1));

  useEffect(() => {
    if (!visible || !sourceDate) return;
    setTargetDate(shiftDay(sourceDate, 1));
  }, [visible, sourceDate]);

  if (!sourceDate) return null;

  const sameDay =
    sourceDate.getFullYear() === targetDate.getFullYear() &&
    sourceDate.getMonth() === targetDate.getMonth() &&
    sourceDate.getDate() === targetDate.getDate();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Copiar sesiones del día</Text>
          <Text style={styles.subtitle}>
            Se copiarán {sessionCount} sesión{sessionCount === 1 ? '' : 'es'} de{' '}
            <Text style={styles.emphasis}>{formatDayLabel(sourceDate)}</Text> al día que elijas.
          </Text>

          <Text style={styles.fieldLabel}>Día destino</Text>
          <View style={styles.dateRow}>
            <Pressable
              onPress={() => setTargetDate((current) => shiftDay(current, -1))}
              accessibilityLabel="Día anterior"
              style={({ pressed }) => [styles.dateNav, pressed && styles.dateNavPressed]}
            >
              <AppIcon name="chevronLeft" size={18} color={colors.textSecondary} />
            </Pressable>
            <Text style={styles.dateLabel}>{formatDayLabel(targetDate)}</Text>
            <Pressable
              onPress={() => setTargetDate((current) => shiftDay(current, 1))}
              accessibilityLabel="Día siguiente"
              style={({ pressed }) => [styles.dateNav, pressed && styles.dateNavPressed]}
            >
              <AppIcon name="chevronRight" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {sameDay ? (
            <Text style={styles.error}>Elige un día distinto al que estás copiando.</Text>
          ) : null}

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.actionButton} />
            <Button
              title="Copiar"
              onPress={() => onConfirm(targetDate)}
              loading={saving}
              disabled={sameDay}
              style={styles.actionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emphasis: {
    color: colors.text,
    fontWeight: '700',
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dateNav: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dateNavPressed: {
    opacity: 0.85,
  },
  dateLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
