import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  getWeekDays,
  itemsForDate,
  type SchedulePreviewItem,
} from '@/lib/programSchedulePreview';

const WEEKDAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatDayMonth(date: Date) {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

interface AthleteWeekListViewProps {
  focusDate: Date;
  items: SchedulePreviewItem[];
  onDayPress?: (date: Date, dayItems: SchedulePreviewItem[]) => void;
  onSessionPress?: (item: SchedulePreviewItem) => void;
}

function sessionCardStyle(item: SchedulePreviewItem) {
  if (item.kind === 'activation') return styles.sessionActivation;
  if (item.kind === 'rest') return styles.sessionRest;
  if (item.isCurrent) return styles.sessionCurrent;
  return styles.sessionDefault;
}

export function AthleteWeekListView({
  focusDate,
  items,
  onDayPress,
  onSessionPress,
}: AthleteWeekListViewProps) {
  const days = getWeekDays(focusDate);
  const today = new Date();

  return (
    <View style={styles.list}>
      {days.map((day) => {
        const dayItems = itemsForDate(items, day);
        const weekdayIndex = day.getDay() === 0 ? 6 : day.getDay() - 1;
        const isToday = isSameDate(day, today);
        const hasSessions = dayItems.length > 0;

        return (
          <Pressable
            key={day.toISOString()}
            onPress={onDayPress ? () => onDayPress(day, dayItems) : undefined}
            disabled={!onDayPress}
            style={({ pressed }) => [
              styles.dayCard,
              isToday && styles.dayCardToday,
              !hasSessions && styles.dayCardEmpty,
              onDayPress && pressed && styles.dayCardPressed,
            ]}
          >
            <View style={styles.dayHeader}>
              <View style={styles.dayHeaderText}>
                <Text style={[styles.weekday, isToday && styles.weekdayToday]}>
                  {WEEKDAY_SHORT[weekdayIndex]}
                </Text>
                <Text style={[styles.dayTitle, isToday && styles.dayTitleToday]} numberOfLines={1}>
                  {WEEKDAY_LABELS[weekdayIndex]} · {formatDayMonth(day)}
                </Text>
              </View>
              {isToday ? (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Hoy</Text>
                </View>
              ) : null}
            </View>

            {!hasSessions ? (
              <Text style={styles.emptyDay}>Sin entreno</Text>
            ) : (
              <View style={styles.sessions}>
                {dayItems.map((item) => (
                  <Pressable
                    key={`${item.id}@${day.toDateString()}`}
                    onPress={
                      onSessionPress
                        ? (event) => {
                            event.stopPropagation?.();
                            onSessionPress(item);
                          }
                        : undefined
                    }
                    style={({ pressed }) => [
                      styles.session,
                      sessionCardStyle(item),
                      onSessionPress && pressed && styles.sessionPressed,
                    ]}
                  >
                    <View style={styles.sessionCopy}>
                      <Text style={styles.sessionName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.sessionMeta}>
                        {item.kind === 'rest' ? 'Día de descanso' : item.estimatedDuration}
                      </Text>
                    </View>
                    {onSessionPress ? <Text style={styles.sessionAction}>Ver</Text> : null}
                  </Pressable>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  dayCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dayCardToday: {
    borderColor: `${colors.accent}99`,
    backgroundColor: `${colors.accent}0F`,
  },
  dayCardEmpty: {
    opacity: 0.72,
  },
  dayCardPressed: {
    opacity: 0.9,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dayHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  weekday: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  weekdayToday: {
    color: colors.accent,
  },
  dayTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  dayTitleToday: {
    color: colors.text,
  },
  todayBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  todayBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  emptyDay: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  sessions: {
    gap: spacing.xs,
  },
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
  },
  sessionDefault: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  sessionCurrent: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`,
  },
  sessionActivation: {
    borderColor: `${colors.activation}99`,
    backgroundColor: `${colors.activation}1A`,
  },
  sessionRest: {
    borderColor: `${colors.restDay}99`,
    backgroundColor: `${colors.restDay}1A`,
  },
  sessionPressed: {
    opacity: 0.88,
  },
  sessionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  sessionName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 20,
  },
  sessionMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sessionAction: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
});
