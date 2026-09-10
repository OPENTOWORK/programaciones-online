import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GymTrainingSessionCard } from '@/components/gym/GymTrainingSessionCard';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { gymDateKey, type GymTrainingSession } from '@/lib/gymTraining';

export function GymTrainingWeekGrid({
  days,
  sessionsByDay,
}: {
  days: Date[];
  sessionsByDay: Map<string, GymTrainingSession[]>;
}) {
  const todayKey = gymDateKey(new Date());

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        {days.map((day) => {
          const key = gymDateKey(day);
          const isToday = key === todayKey;
          const weekday = day.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
          return (
            <View key={key} style={[styles.dayHead, isToday && styles.dayHeadToday]}>
              <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                {weekday} {day.getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.dayRow}>
          {days.map((day) => {
            const key = gymDateKey(day);
            const sessions = sessionsByDay.get(key) ?? [];
            const isToday = key === todayKey;

            return (
              <View key={key} style={[styles.dayCol, isToday && styles.dayColToday]}>
                {sessions.length === 0 ? (
                  <Text style={styles.empty}>Sin entreno</Text>
                ) : (
                  sessions.map((session) => (
                    <GymTrainingSessionCard key={session.id} session={session} />
                  ))
                )}
              </View>
            );
          })}
        </View>
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
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayHeadToday: {
    backgroundColor: withAlpha(colors.accent, '12'),
  },
  dayName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 11,
  },
  dayNameToday: {
    color: colors.accent,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  bodyContent: {
    flexGrow: 1,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: '100%',
  },
  dayCol: {
    flex: 1,
    minWidth: 0,
    gap: 6,
    padding: 6,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    backgroundColor: colors.background,
  },
  dayColToday: {
    backgroundColor: withAlpha(colors.accent, '08'),
  },
  empty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    padding: spacing.xs,
  },
});
