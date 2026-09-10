import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PlanValidityDatePickerModal } from '@/components/program/PlanValidityDatePickerModal';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  formatPlanDateDisplay,
  parsePlanDateInput,
  type PlanValidity,
} from '@/lib/planValidity';

interface PlanGroupValidityFieldsProps {
  value: PlanValidity;
  onChange?: (value: PlanValidity) => void;
  onCommit?: (value: PlanValidity) => void;
  disabled?: boolean;
  variant?: 'default' | 'inline';
}

function DateField({
  value,
  onChangeText,
  onBlur,
  onCommitValue,
  placeholder,
  editable = true,
  compact = false,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onBlur: () => void;
  onCommitValue?: (value: string) => void;
  placeholder: string;
  editable?: boolean;
  compact?: boolean;
}) {
  const handleChange = (text: string) => {
    onChangeText(text);
    const parsed = parsePlanDateInput(text);
    if (onCommitValue && parsed.iso) {
      onCommitValue(parsed.iso);
    }
  };

  const handleBlur = () => {
    const parsed = parsePlanDateInput(value);
    if (parsed.iso) {
      onChangeText(formatPlanDateDisplay(parsed.iso));
    }
    onBlur();
  };

  return (
    <TextInput
      value={value}
      onChangeText={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      editable={editable}
      style={[styles.dateInput, compact && styles.dateInputCompact, !editable && styles.dateInputDisabled]}
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType={Platform.OS === 'web' ? 'default' : 'numbers-and-punctuation'}
    />
  );
}

export function PlanGroupValidityFields({
  value,
  onChange,
  onCommit,
  disabled = false,
  variant = 'default',
}: PlanGroupValidityFieldsProps) {
  const [localFrom, setLocalFrom] = useState(() => formatPlanDateDisplay(value.validFrom));
  const [localUntil, setLocalUntil] = useState(() =>
    typeof value.validUntil === 'string' ? formatPlanDateDisplay(value.validUntil) : '',
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerField, setPickerField] = useState<'from' | 'until'>('from');
  const indefinite = value.validUntil === null;
  const inline = variant === 'inline';

  useEffect(() => {
    setLocalFrom(formatPlanDateDisplay(value.validFrom));
    setLocalUntil(
      typeof value.validUntil === 'string' ? formatPlanDateDisplay(value.validUntil) : '',
    );
  }, [value.validFrom, value.validUntil]);

  const commit = (next: PlanValidity) => {
    onChange?.(next);
    onCommit?.(next);
  };

  const handleFromBlur = () => {
    const trimmed = localFrom.trim();
    if (!trimmed) {
      commit({ ...value, validFrom: undefined });
      return;
    }
    const parsed = parsePlanDateInput(trimmed);
    if (!parsed.iso) return;
    setLocalFrom(formatPlanDateDisplay(parsed.iso));
    commit({ ...value, validFrom: parsed.iso });
  };

  const handleUntilBlur = () => {
    if (indefinite) return;
    const trimmed = localUntil.trim();
    if (!trimmed) {
      commit({ ...value, validUntil: null });
      return;
    }
    const parsed = parsePlanDateInput(trimmed);
    if (!parsed.iso) return;
    setLocalUntil(formatPlanDateDisplay(parsed.iso));
    commit({ ...value, validUntil: parsed.iso });
  };

  const toggleIndefinite = () => {
    if (disabled) return;
    if (indefinite) {
      openPicker('until');
      return;
    }
    setLocalUntil('');
    commit({ ...value, validUntil: null });
  };

  const openPicker = (field?: 'from' | 'until') => {
    if (disabled) return;
    const target = field ?? (value.validUntil === null || value.validUntil === undefined ? 'until' : 'from');
    setPickerField(target);
    setPickerOpen(true);
  };

  const handlePickerConfirm = (next: PlanValidity) => {
    setLocalFrom(formatPlanDateDisplay(next.validFrom));
    setLocalUntil(
      typeof next.validUntil === 'string' ? formatPlanDateDisplay(next.validUntil) : '',
    );
    commit(next);
  };

  return (
    <>
      <View style={[styles.wrap, inline && styles.wrapInline]}>
      {!inline ? <Text style={styles.sectionLabel}>Vigencia del plan</Text> : null}

      <View style={[styles.rangeRow, inline && styles.rangeRowInline]}>
        <View style={[styles.dateBlock, inline && styles.dateBlockInline]}>
          <Text style={styles.dateLabel}>Desde</Text>
          <DateField
            value={localFrom}
            onChangeText={setLocalFrom}
            onBlur={handleFromBlur}
            onCommitValue={(date) => {
              setLocalFrom(formatPlanDateDisplay(date));
              commit({ ...value, validFrom: date });
            }}
            placeholder="dd/mm/aaaa"
            editable={!disabled}
            compact={inline}
          />
        </View>

        <Text style={[styles.separator, inline && styles.separatorInline]} accessibilityElementsHidden>
          →
        </Text>

        <View style={[styles.dateBlock, inline && styles.dateBlockInline]}>
          <Text style={styles.dateLabel}>Hasta</Text>
          {indefinite ? (
            <Pressable
              onPress={toggleIndefinite}
              disabled={disabled}
              accessibilityRole="switch"
              accessibilityState={{ checked: true }}
              accessibilityLabel="Vigencia indefinida, pulsa para elegir fecha"
              style={({ pressed }) => [
                styles.indefiniteField,
                inline && styles.indefiniteFieldInline,
                pressed && !disabled && styles.indefiniteChipPressed,
              ]}
            >
              <Text style={[styles.indefiniteFieldText, styles.indefiniteFieldTextActive]}>Sin fin</Text>
            </Pressable>
          ) : (
            <View style={styles.untilInputRow}>
              <DateField
                value={localUntil}
                onChangeText={setLocalUntil}
                onBlur={handleUntilBlur}
                onCommitValue={(date) => {
                  setLocalUntil(formatPlanDateDisplay(date));
                  commit({ ...value, validUntil: date });
                }}
                placeholder="dd/mm/aaaa"
                editable={!disabled}
                compact={inline}
              />
              <Pressable
                onPress={toggleIndefinite}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel="Marcar como sin fecha de fin"
                style={({ pressed }) => [
                  styles.indefiniteChip,
                  inline && styles.indefiniteChipInline,
                  pressed && !disabled && styles.indefiniteChipPressed,
                ]}
              >
                <Text style={styles.indefiniteChipText}>∞</Text>
              </Pressable>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => openPicker()}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Abrir calendario de vigencia"
          style={({ pressed }) => [
            styles.calendarBtn,
            inline && styles.calendarBtnInline,
            pressed && !disabled && styles.calendarBtnPressed,
          ]}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.accent} />
        </Pressable>
      </View>
    </View>

      <PlanValidityDatePickerModal
        visible={pickerOpen}
        validity={value}
        initialField={pickerField}
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  wrapInline: {
    flex: 1,
    minWidth: 260,
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: `${colors.border}`,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  rangeRowInline: {
    alignItems: 'flex-end',
    flexWrap: 'nowrap',
    gap: spacing.xs,
    flex: 1,
  },
  dateBlock: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 132,
    gap: 4,
  },
  dateBlockInline: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 118,
    gap: 2,
  },
  untilInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  separator: {
    ...typography.body,
    color: colors.textMuted,
    paddingBottom: 10,
    fontWeight: '500',
  },
  separatorInline: {
    paddingBottom: 8,
    fontSize: 14,
    color: colors.textMuted,
  },
  dateInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'web' ? 8 : 10,
    minHeight: 40,
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  dateInputCompact: {
    minHeight: 34,
    paddingVertical: Platform.OS === 'web' ? 5 : 7,
    fontSize: 13,
  },
  dateInputDisabled: {
    opacity: 0.55,
  },
  indefiniteChip: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  indefiniteChipInline: {
    width: 32,
    height: 32,
  },
  indefiniteChipPressed: {
    opacity: 0.85,
  },
  indefiniteChipText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '700',
    lineHeight: 18,
  },
  indefiniteField: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '55'),
    borderRadius: borderRadius.md,
    backgroundColor: withAlpha(colors.accent, '12'),
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  indefiniteFieldInline: {
    minHeight: 34,
    alignItems: 'center',
  },
  indefiniteFieldText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  indefiniteFieldTextActive: {
    color: colors.accent,
    fontStyle: 'normal',
    fontWeight: '700',
  },
  calendarBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '12'),
    marginBottom: 1,
  },
  calendarBtnInline: {
    width: 34,
    height: 34,
    marginBottom: 0,
    marginLeft: spacing.md,
    flexShrink: 0,
  },
  calendarBtnPressed: {
    backgroundColor: withAlpha(colors.accent, '24'),
  },
});
