import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { appointmentsForDate, isSameCalendarDay } from '@/lib/appointmentSchedule';
import {
  formatMonthLabel,
  getMonthGrid,
  getWeekdayShortLabels,
  isDateInSameMonth,
  shiftMonth,
} from '@/lib/programSchedulePreview';
import type { Appointment, AppointmentStatus } from '@/lib/types';

const DOT_COLORS: Record<AppointmentStatus, string> = {
  pending: colors.warning,
  confirmed: colors.accentBlue,
  cancelled: colors.textMuted,
};

const MAX_DOTS = 3;

interface AppointmentMonthCalendarProps {
  appointments: readonly Appointment[];
  focusDate: Date;
  onFocusDateChange: (date: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function AppointmentMonthCalendar({
  appointments,
  focusDate,
  onFocusDateChange,
  selectedDate,
  onSelectDate,
}: AppointmentMonthCalendarProps) {
  const days = getMonthGrid(focusDate);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const today = new Date();

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Pressable
          onPress={() => onFocusDateChange(shiftMonth(focusDate, -1))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
        >
          <AppIcon name="chevronLeft" size={18} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.monthLabel}>{formatMonthLabel(focusDate)}</Text>
        <Pressable
          onPress={() => onFocusDateChange(shiftMonth(focusDate, 1))}
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
            const dayAppointments = appointmentsForDate(appointments, day);
            const selected = isSameCalendarDay(day, selectedDate);
            const outside = !isDateInSameMonth(day, focusDate);

            return (
              <Pressable
                key={day.toISOString()}
                onPress={() => onSelectDate(day)}
                style={({ pressed }) => [
                  styles.day,
                  selected && styles.daySelected,
                  pressed && !selected && styles.dayPressed,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    outside && styles.dayNumberOutside,
                    isSameCalendarDay(day, today) && styles.dayNumberToday,
                    selected && styles.dayNumberSelected,
                  ]}
                >
                  {day.getDate()}
                </Text>
                <View style={styles.dots}>
                  {dayAppointments.slice(0, MAX_DOTS).map((appointment) => (
                    <View
                      key={appointment.id}
                      style={[styles.dot, { backgroundColor: DOT_COLORS[appointment.status] }]}
                    />
                  ))}
                </View>
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
    minHeight: 44,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    paddingTop: spacing.xs,
    gap: 3,
  },
  daySelected: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '14'),
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
  },
  dots: {
    flexDirection: 'row',
    gap: 2,
    minHeight: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: borderRadius.full,
  },
});
