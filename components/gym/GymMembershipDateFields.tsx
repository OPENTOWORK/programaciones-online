import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { MonthDatePicker } from '@/components/ui/MonthDatePicker';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import { toLocalDateString } from '@/lib/sessionSchedule';

type MembershipDateField = 'starts' | 'ends';

function dateFromIso(value: string) {
  if (!value) return new Date();
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatIsoDisplay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Elegir fecha';
  return formatDayLabel(dateFromIso(value));
}

export function GymMembershipDateFields({
  startsAt,
  endsAt,
  onStartsAtChange,
  onEndsAtChange,
}: {
  startsAt: string;
  endsAt: string;
  onStartsAtChange: (value: string) => void;
  onEndsAtChange: (value: string) => void;
}) {
  const [activeField, setActiveField] = useState<MembershipDateField>('starts');
  const selectedDate = dateFromIso(activeField === 'starts' ? startsAt : endsAt);

  useEffect(() => {
    if (activeField === 'ends' && endsAt < startsAt) {
      onEndsAtChange(startsAt);
    }
  }, [activeField, endsAt, onEndsAtChange, startsAt]);

  const handleSelectDate = (date: Date) => {
    const iso = toLocalDateString(date);
    if (activeField === 'starts') {
      onStartsAtChange(iso);
      return;
    }
    onEndsAtChange(iso);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.fieldSwitch}>
        <Pressable
          onPress={() => setActiveField('starts')}
          accessibilityRole="button"
          accessibilityState={{ selected: activeField === 'starts' }}
          style={({ pressed }) => [
            styles.fieldChip,
            activeField === 'starts' && styles.fieldChipActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.fieldChipLabel}>Desde</Text>
          <Text
            style={[
              styles.fieldChipValue,
              activeField === 'starts' && styles.fieldChipValueActive,
            ]}
          >
            {formatIsoDisplay(startsAt)}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveField('ends')}
          accessibilityRole="button"
          accessibilityState={{ selected: activeField === 'ends' }}
          style={({ pressed }) => [
            styles.fieldChip,
            activeField === 'ends' && styles.fieldChipActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.fieldChipLabel}>Hasta</Text>
          <Text
            style={[
              styles.fieldChipValue,
              activeField === 'ends' && styles.fieldChipValueActive,
            ]}
          >
            {formatIsoDisplay(endsAt)}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.selectedLabel}>{formatDayLabel(selectedDate)}</Text>
      <MonthDatePicker
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        disabledDate={
          activeField === 'ends'
            ? (date) => toLocalDateString(date) < startsAt
            : undefined
        }
        highlightDate={activeField === 'ends' ? dateFromIso(startsAt) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  fieldSwitch: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fieldChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  fieldChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '12'),
  },
  fieldChipLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  fieldChipValue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  fieldChipValueActive: {
    color: colors.text,
    fontWeight: '700',
  },
  selectedLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
});
