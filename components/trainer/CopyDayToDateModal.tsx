import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { MonthDatePicker } from '@/components/ui/MonthDatePicker';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { isSameCalendarDay } from '@/lib/appointmentSchedule';
import { formatDayLabel, shiftDay } from '@/lib/programSchedulePreview';

interface CopyDayToDateModalProps {
  visible: boolean;
  sourceDate: Date | null;
  sessionCount: number;
  saving?: boolean;
  /** Día completo o una sola sesión. */
  variant?: 'day' | 'session';
  sessionName?: string;
  onCancel: () => void;
  onConfirm: (targetDate: Date) => void;
}

export function CopyDayToDateModal({
  visible,
  sourceDate,
  sessionCount,
  saving = false,
  variant = 'day',
  sessionName,
  onCancel,
  onConfirm,
}: CopyDayToDateModalProps) {
  const [targetDate, setTargetDate] = useState(() => shiftDay(new Date(), 1));

  useEffect(() => {
    if (!visible || !sourceDate) return;
    setTargetDate(shiftDay(sourceDate, 1));
  }, [visible, sourceDate]);

  if (!sourceDate) return null;

  const sameDay = isSameCalendarDay(sourceDate, targetDate);
  const isSession = variant === 'session';
  const blocked = !isSession && sameDay;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{isSession ? 'Copiar sesión' : 'Copiar sesiones del día'}</Text>
          <Text style={styles.subtitle}>
            {isSession ? (
              <>
                Se copiará <Text style={styles.emphasis}>{sessionName ?? 'esta sesión'}</Text> de{' '}
                <Text style={styles.emphasis}>{formatDayLabel(sourceDate)}</Text> al día que elijas.
              </>
            ) : (
              <>
                Se copiarán {sessionCount} sesión{sessionCount === 1 ? '' : 'es'} de{' '}
                <Text style={styles.emphasis}>{formatDayLabel(sourceDate)}</Text> al día que elijas.
              </>
            )}
          </Text>

          <Text style={styles.fieldLabel}>Día destino</Text>
          <Text style={styles.selectedLabel}>{formatDayLabel(targetDate)}</Text>

          <MonthDatePicker
            selectedDate={targetDate}
            onSelectDate={setTargetDate}
            highlightDate={sourceDate}
            disabledDate={!isSession ? (date) => isSameCalendarDay(date, sourceDate) : undefined}
          />

          {blocked ? (
            <Text style={styles.error}>Elige un día distinto al que estás copiando.</Text>
          ) : null}

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.actionButton} />
            <Button
              title="Copiar"
              onPress={() => onConfirm(targetDate)}
              loading={saving}
              disabled={blocked}
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
  selectedLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
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
