import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { isSameCalendarDay } from '@/lib/appointmentSchedule';
import {
  formatMonthLabel,
  getMonthGrid,
  getWeekdayShortLabels,
  isDateInSameMonth,
  shiftMonth,
} from '@/lib/programSchedulePreview';

interface MonthDatePickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  /** Día que no se puede elegir (p. ej. el origen al copiar un día entero). */
  disabledDate?: (date: Date) => boolean;
  /** Resalta el día de origen u otro día de referencia. */
  highlightDate?: Date;
}

export function MonthDatePicker({
  selectedDate,
  onSelectDate,
  disabledDate,
  highlightDate,
}: MonthDatePickerProps) {
  const [focusDate, setFocusDate] = useState(selectedDate);
  const today = new Date();

  useEffect(() => {
    setFocusDate(selectedDate);
  }, [selectedDate]);

  const days = getMonthGrid(focusDate);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setFocusDate((current) => shiftMonth(current, -1))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
        >
          <AppIcon name="chevronLeft" size={18} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.monthLabel}>{formatMonthLabel(focusDate)}</Text>
        <Pressable
          onPress={() => setFocusDate((current) => shiftMonth(current, 1))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
        >
          <AppIcon name="chevronRight" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {getWeekdayShortLabels().map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day) => {
            const selected = isSameCalendarDay(day, selectedDate);
            const highlighted = highlightDate ? isSameCalendarDay(day, highlightDate) : false;
            const disabled = disabledDate?.(day) ?? false;
            const outside = !isDateInSameMonth(day, focusDate);
            const isToday = isSameCalendarDay(day, today);

            return (
              <Pressable
                key={day.toISOString()}
                disabled={disabled}
                onPress={() => {
                  onSelectDate(day);
                  setFocusDate(day);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled }}
                style={({ pressed }) => [
                  styles.day,
                  selected && styles.daySelected,
                  highlighted && !selected && styles.dayHighlighted,
                  disabled && styles.dayDisabled,
                  pressed && !selected && !disabled && styles.dayPressed,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    outside && styles.dayNumberOutside,
                    isToday && !selected && styles.dayNumberToday,
                    selected && styles.dayNumberSelected,
                    disabled && styles.dayNumberDisabled,
                  ]}
                >
                  {day.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonPressed: {
    borderColor: colors.accent,
  },
  monthLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    gap: 2,
  },
  day: {
    flex: 1,
    minHeight: 40,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  dayHighlighted: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  dayDisabled: {
    opacity: 0.35,
  },
  dayPressed: {
    backgroundColor: colors.surfaceLight,
  },
  dayNumber: {
    ...typography.bodySmall,
    color: colors.text,
  },
  dayNumberOutside: {
    color: colors.textMuted,
  },
  dayNumberToday: {
    color: colors.accent,
    fontWeight: '700',
  },
  dayNumberSelected: {
    fontWeight: '700',
    color: colors.text,
  },
  dayNumberDisabled: {
    color: colors.textMuted,
  },
});
