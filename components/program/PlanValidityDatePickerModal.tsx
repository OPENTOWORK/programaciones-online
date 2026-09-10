import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { MonthDatePicker } from '@/components/ui/MonthDatePicker';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import { toLocalDateString } from '@/lib/sessionSchedule';
import type { PlanValidity } from '@/lib/planValidity';

type ValidityField = 'from' | 'until';

interface PlanValidityDatePickerModalProps {
  visible: boolean;
  validity: PlanValidity;
  initialField?: ValidityField;
  onClose: () => void;
  onConfirm: (validity: PlanValidity) => void;
}

function dateFromIso(value?: string) {
  if (!value) return new Date();
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function PlanValidityDatePickerModal({
  visible,
  validity,
  initialField = 'from',
  onClose,
  onConfirm,
}: PlanValidityDatePickerModalProps) {
  const [activeField, setActiveField] = useState<ValidityField>(initialField);
  const [selectedDate, setSelectedDate] = useState(() => dateFromIso(validity.validFrom));
  const [indefiniteUntil, setIndefiniteUntil] = useState(validity.validUntil === null);

  useEffect(() => {
    if (!visible) return;
    setActiveField(initialField);
    setIndefiniteUntil(validity.validUntil === null);
    setSelectedDate(
      dateFromIso(
        initialField === 'from' ? validity.validFrom : validity.validUntil ?? validity.validFrom,
      ),
    );
  }, [visible, initialField, validity.validFrom, validity.validUntil]);

  useEffect(() => {
    if (activeField === 'from') {
      setSelectedDate(dateFromIso(validity.validFrom));
      return;
    }
    if (validity.validUntil === null) {
      setSelectedDate(dateFromIso(validity.validFrom));
      return;
    }
    setSelectedDate(dateFromIso(validity.validUntil ?? validity.validFrom));
  }, [activeField, validity.validFrom, validity.validUntil]);

  const handleConfirm = () => {
    if (activeField === 'from') {
      onConfirm({
        ...validity,
        validFrom: toLocalDateString(selectedDate),
      });
      onClose();
      return;
    }

    if (indefiniteUntil) {
      onConfirm({ ...validity, validUntil: null });
    } else {
      onConfirm({ ...validity, validUntil: toLocalDateString(selectedDate) });
    }
    onClose();
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (activeField === 'until') {
      setIndefiniteUntil(false);
    }
  };

  const handleSelectUntilTab = () => {
    setActiveField('until');
    if (validity.validUntil && validity.validUntil !== null) {
      setIndefiniteUntil(false);
      setSelectedDate(dateFromIso(validity.validUntil));
      return;
    }
    setIndefiniteUntil(false);
    setSelectedDate(dateFromIso(validity.validFrom));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Vigencia del plan</Text>
          <Text style={styles.subtitle}>Elige la fecha de inicio o de fin del plan.</Text>

          <View style={styles.fieldSwitch}>
            <Pressable
              onPress={() => setActiveField('from')}
              style={[styles.fieldChip, activeField === 'from' && styles.fieldChipActive]}
            >
              <Text style={[styles.fieldChipText, activeField === 'from' && styles.fieldChipTextActive]}>
                Desde
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSelectUntilTab}
              style={[styles.fieldChip, activeField === 'until' && styles.fieldChipActive]}
            >
              <Text style={[styles.fieldChipText, activeField === 'until' && styles.fieldChipTextActive]}>
                Hasta
              </Text>
            </Pressable>
          </View>

          {activeField === 'until' ? (
            <Pressable
              onPress={() => setIndefiniteUntil((current) => !current)}
              style={[styles.indefiniteRow, indefiniteUntil && styles.indefiniteRowActive]}
            >
              <Text style={[styles.indefiniteRowText, indefiniteUntil && styles.indefiniteRowTextActive]}>
                Sin fecha de fin
              </Text>
            </Pressable>
          ) : null}

          <Text style={styles.selectedLabel}>{formatDayLabel(selectedDate)}</Text>
          <MonthDatePicker selectedDate={selectedDate} onSelectDate={handleSelectDate} />

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onClose} style={styles.actionButton} />
            <Button title="Aplicar" onPress={handleConfirm} style={styles.actionButton} />
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
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
  },
  fieldSwitch: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  fieldChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  fieldChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  fieldChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  fieldChipTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  indefiniteRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  indefiniteRowActive: {
    borderColor: withAlpha(colors.accent, '88'),
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  indefiniteRowText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  indefiniteRowTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  indefiniteHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  selectedLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
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
