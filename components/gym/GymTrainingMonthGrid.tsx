import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GymTrainingSessionCard } from '@/components/gym/GymTrainingSessionCard';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { gymDateKey, type GymTrainingSession } from '@/lib/gymTraining';
import { getWeekdayShortLabels, isDateInSameMonth } from '@/lib/programSchedulePreview';

export function GymTrainingMonthGrid({
  days,
  focusDate,
  sessionsByDay,
}: {
  days: Date[];
  focusDate: Date;
  sessionsByDay: Map<string, GymTrainingSession[]>;
}) {
  const todayKey = gymDateKey(new Date());
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7)).filter(
    (week) => week.length === 7,
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        {getWeekdayShortLabels().map((label) => (
          <View key={label} style={styles.dayHead}>
            <Text style={styles.dayName}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {weeks.map((week) => (
          <View key={gymDateKey(week[0])} style={styles.weekRow}>
            {week.map((day) => {
              const key = gymDateKey(day);
              const sessions = sessionsByDay.get(key) ?? [];
              const isToday = key === todayKey;
              const inMonth = isDateInSameMonth(day, focusDate);

              return (
                <View
                  key={key}
                  style={[
                    styles.dayCell,
                    isToday && styles.dayCellToday,
                    !inMonth && styles.dayCellOutside,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isToday && styles.dayNumberToday,
                      !inMonth && styles.dayNumberOutside,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                  {sessions.length === 0 ? (
                    <Text style={styles.empty}>{inMonth ? 'Sin entreno' : ' '}</Text>
                  ) : (
                    <View style={styles.cards}>
                      {sessions.map((session) => (
                        <GymTrainingSessionCard key={session.id} session={session} compact />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  headRow: {
    flexDirection: 'row',
  },
  dayHead: {
    flex: 1,
    minWidth: 0,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  bodyContent: {
    flexGrow: 1,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  dayCell: {
    flex: 1,
    minWidth: 0,
    minHeight: 88,
    padding: 4,
    gap: 4,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  dayCellToday: {
    backgroundColor: withAlpha(colors.accent, '08'),
  },
  dayCellOutside: {
    backgroundColor: colors.surface,
  },
  dayNumber: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '800',
    paddingHorizontal: 2,
  },
  dayNumberToday: {
    color: colors.accent,
  },
  dayNumberOutside: {
    color: colors.textMuted,
  },
  cards: {
    gap: 4,
    paddingBottom: 4,
  },
  empty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 10,
    padding: spacing.xs,
  },
});
