import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { SessionLogRecord } from '@/lib/sessionLogService';
import {
  formatMonthLabel,
  getMonthGrid,
  getWeekdayShortLabels,
  isDateInSameMonth,
  shiftMonth,
  shiftYear,
} from '@/lib/programSchedulePreview';
import { toLocalDateString } from '@/lib/sessionSchedule';

type CalendarRange = 'month' | 'year';

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function sessionLogsForDate(logs: readonly SessionLogRecord[], date: Date) {
  const key = toLocalDateString(date);
  return logs.filter((log) => log.scheduledDate === key);
}

function logsForMonth(logs: readonly SessionLogRecord[], year: number, monthIndex: number) {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  return logs.filter((log) => log.scheduledDate.startsWith(prefix));
}

function monthShortLabel(monthIndex: number) {
  return new Date(2026, monthIndex, 1).toLocaleDateString('es-ES', { month: 'short' });
}

function RangeToggle({
  value,
  onChange,
}: {
  value: CalendarRange;
  onChange: (range: CalendarRange) => void;
}) {
  return (
    <View style={styles.rangeToggle}>
      <Pressable
        onPress={() => onChange('month')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'month' }}
        accessibilityLabel="Vista mensual"
        style={({ pressed }) => [
          styles.rangeBtn,
          value === 'month' && styles.rangeBtnActive,
          pressed && styles.rangeBtnPressed,
        ]}
      >
        <Text style={[styles.rangeBtnText, value === 'month' && styles.rangeBtnTextActive]}>Mes</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('year')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'year' }}
        accessibilityLabel="Vista anual"
        style={({ pressed }) => [
          styles.rangeBtn,
          value === 'year' && styles.rangeBtnActive,
          pressed && styles.rangeBtnPressed,
        ]}
      >
        <Text style={[styles.rangeBtnText, value === 'year' && styles.rangeBtnTextActive]}>Año</Text>
      </Pressable>
    </View>
  );
}

interface AthleteSessionLogCalendarProps {
  logs: readonly SessionLogRecord[];
  favoriteIds?: ReadonlySet<string>;
  pendingReviewLogIds?: ReadonlySet<string>;
  focusDate: Date;
  onFocusDateChange: (date: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function AthleteSessionLogCalendar({
  logs,
  favoriteIds,
  pendingReviewLogIds,
  focusDate,
  onFocusDateChange,
  selectedDate,
  onSelectDate,
}: AthleteSessionLogCalendarProps) {
  const [range, setRange] = useState<CalendarRange>('month');
  const days = getMonthGrid(focusDate);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const today = new Date();
  const year = focusDate.getFullYear();

  const monthSummaries = useMemo(
    () =>
      Array.from({ length: 12 }, (_, monthIndex) => {
        const monthLogs = logsForMonth(logs, year, monthIndex);
        const firstLogDate = monthLogs.reduce<string | undefined>((earliest, log) => {
          if (!earliest || log.scheduledDate < earliest) return log.scheduledDate;
          return earliest;
        }, undefined);
        return {
          monthIndex,
          count: monthLogs.length,
          hasFavorite: monthLogs.some((log) => favoriteIds?.has(log.id)),
          pendingCount: monthLogs.filter((log) => pendingReviewLogIds?.has(log.id)).length,
          firstLogDate,
        };
      }),
    [favoriteIds, logs, pendingReviewLogIds, year],
  );

  const openMonth = (monthIndex: number, firstLogDate?: string) => {
    const nextFocus = new Date(year, monthIndex, 1);
    onFocusDateChange(nextFocus);
    if (firstLogDate) {
      onSelectDate(new Date(`${firstLogDate}T12:00:00`));
    } else if (selectedDate.getFullYear() !== year || selectedDate.getMonth() !== monthIndex) {
      onSelectDate(nextFocus);
    }
    setRange('month');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            onFocusDateChange(range === 'year' ? shiftYear(focusDate, -1) : shiftMonth(focusDate, -1))
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={range === 'year' ? 'Año anterior' : 'Mes anterior'}
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
        >
          <AppIcon name="chevronLeft" size={18} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {range === 'year' ? String(year) : formatMonthLabel(focusDate)}
        </Text>
        <Pressable
          onPress={() =>
            onFocusDateChange(range === 'year' ? shiftYear(focusDate, 1) : shiftMonth(focusDate, 1))
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={range === 'year' ? 'Año siguiente' : 'Mes siguiente'}
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
        >
          <AppIcon name="chevronRight" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <RangeToggle value={range} onChange={setRange} />

      {range === 'year' ? (
        <View style={styles.yearGrid}>
          {monthSummaries.map((month) => {
            const selected = selectedDate.getFullYear() === year && selectedDate.getMonth() === month.monthIndex;
            const currentMonth = today.getFullYear() === year && today.getMonth() === month.monthIndex;
            return (
              <Pressable
                key={month.monthIndex}
                onPress={() => openMonth(month.monthIndex, month.firstLogDate)}
                accessibilityRole="button"
                accessibilityLabel={`${monthShortLabel(month.monthIndex)} ${year}${month.count ? `, ${month.count} entrenos` : ''}${month.pendingCount ? `, ${month.pendingCount} por revisar` : ''}`}
                style={({ pressed }) => [
                  styles.yearCell,
                  month.count > 0 && !selected && styles.yearCellWithLogs,
                  month.pendingCount > 0 && !selected && styles.yearCellPending,
                  month.hasFavorite && !selected && month.pendingCount === 0 && styles.yearCellFavorite,
                  selected && styles.yearCellSelected,
                  pressed && styles.yearCellPressed,
                ]}
              >
                <Text
                  style={[
                    styles.yearCellMonth,
                    currentMonth && !selected && styles.yearCellMonthCurrent,
                    selected && styles.yearCellMonthSelected,
                  ]}
                >
                  {monthShortLabel(month.monthIndex)}
                </Text>
                {month.count > 0 ? (
                  <Text style={[styles.yearCellCount, selected && styles.yearCellCountSelected]}>
                    {month.pendingCount > 0 ? '! ' : month.hasFavorite ? '★ ' : ''}
                    {month.count}
                  </Text>
                ) : (
                  <Text style={styles.yearCellEmpty}>—</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <>
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
                const dayLogs = sessionLogsForDate(logs, day);
                const selected = isSameCalendarDay(day, selectedDate);
                const outside = !isDateInSameMonth(day, focusDate);
                const hasLogs = dayLogs.length > 0;
                const hasFavorite = dayLogs.some((log) => favoriteIds?.has(log.id));
                const pendingCount = dayLogs.filter((log) => pendingReviewLogIds?.has(log.id)).length;
                const hasPendingReview = pendingCount > 0;

                return (
                  <Pressable
                    key={day.toISOString()}
                    onPress={() => onSelectDate(day)}
                    style={({ pressed }) => [
                      styles.day,
                      selected && styles.daySelected,
                      hasPendingReview && !selected && styles.dayPendingReview,
                      hasLogs && !selected && !hasPendingReview && styles.dayWithLogs,
                      hasFavorite && !selected && !hasPendingReview && styles.dayFavorite,
                      pressed && !selected && styles.dayPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={
                      hasLogs
                        ? `${day.getDate()}, ${dayLogs.length} sesión${dayLogs.length === 1 ? '' : 'es'} registrada${dayLogs.length === 1 ? '' : 's'}${hasPendingReview ? `, ${pendingCount} por revisar` : ''}${hasFavorite ? ', con favorito' : ''}`
                        : `${day.getDate()}, sin registro`
                    }
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        outside && styles.dayNumberOutside,
                        isSameCalendarDay(day, today) && styles.dayNumberToday,
                        selected && styles.dayNumberSelected,
                        hasPendingReview && !selected && styles.dayNumberPendingReview,
                        hasLogs && !selected && !hasPendingReview && styles.dayNumberWithLogs,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                    {hasLogs ? (
                      <View
                        style={[
                          styles.logBadge,
                          selected && styles.logBadgeSelected,
                          hasPendingReview && styles.logBadgePending,
                          hasFavorite && !hasPendingReview && styles.logBadgeFavorite,
                        ]}
                      >
                        <Text style={[styles.logBadgeText, selected && styles.logBadgeTextSelected]}>
                          {hasPendingReview ? '!' : hasFavorite ? '★' : dayLogs.length}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.dotSpacer} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </>
      )}
    </View>
  );
}

export { sessionLogsForDate, isSameCalendarDay };

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
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  navButtonPressed: {
    opacity: 0.85,
  },
  monthLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  rangeToggle: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    padding: 2,
    gap: 2,
    marginBottom: spacing.xs,
  },
  rangeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  rangeBtnActive: {
    backgroundColor: colors.accent,
  },
  rangeBtnPressed: {
    opacity: 0.88,
  },
  rangeBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  rangeBtnTextActive: {
    color: colors.black,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  yearCell: {
    width: '31%',
    flexGrow: 1,
    minHeight: 64,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: 2,
  },
  yearCellWithLogs: {
    backgroundColor: withAlpha(colors.accent, '14'),
    borderColor: withAlpha(colors.accent, '33'),
  },
  yearCellFavorite: {
    backgroundColor: 'rgba(245, 185, 66, 0.14)',
    borderColor: 'rgba(245, 185, 66, 0.35)',
  },
  yearCellPending: {
    backgroundColor: withAlpha(colors.warning, '14'),
    borderColor: withAlpha(colors.warning, '35'),
  },
  yearCellSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  yearCellPressed: {
    opacity: 0.88,
  },
  yearCellMonth: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  yearCellMonthCurrent: {
    color: colors.accent,
  },
  yearCellMonthSelected: {
    color: colors.black,
  },
  yearCellCount: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  yearCellCountSelected: {
    color: colors.black,
  },
  yearCellEmpty: {
    ...typography.caption,
    color: colors.textMuted,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  day: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
    gap: 2,
  },
  daySelected: {
    backgroundColor: colors.accent,
  },
  dayWithLogs: {
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  dayPendingReview: {
    backgroundColor: withAlpha(colors.warning, '16'),
  },
  dayFavorite: {
    backgroundColor: 'rgba(245, 185, 66, 0.16)',
  },
  dayPressed: {
    opacity: 0.88,
  },
  dayNumber: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  dayNumberOutside: {
    color: colors.textMuted,
    opacity: 0.55,
  },
  dayNumberToday: {
    color: colors.accent,
    fontWeight: '800',
  },
  dayNumberSelected: {
    color: colors.black,
    fontWeight: '800',
  },
  dayNumberWithLogs: {
    color: colors.accent,
    fontWeight: '700',
  },
  dayNumberPendingReview: {
    color: colors.warning,
    fontWeight: '800',
  },
  logBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: borderRadius.full,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  logBadgeSelected: {
    backgroundColor: colors.black,
  },
  logBadgeFavorite: {
    backgroundColor: '#F5B942',
  },
  logBadgePending: {
    backgroundColor: colors.warning,
  },
  logBadgeText: {
    ...typography.caption,
    color: colors.black,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  logBadgeTextSelected: {
    color: colors.accent,
  },
  dotSpacer: {
    height: 16,
  },
});
