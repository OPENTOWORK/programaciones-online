import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
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
  /** Cabe en el alto del calendario de la home y se desplaza si la semana no entra. */
  fit?: boolean;
  onDayPress?: (date: Date, dayItems: SchedulePreviewItem[]) => void;
  onSessionPress?: (item: SchedulePreviewItem) => void;
}

function sessionCardStyle(item: SchedulePreviewItem) {
  if (item.kind === 'activation') return styles.sessionActivation;
  if (item.kind === 'metcon') return styles.sessionMetcon;
  if (item.kind === 'rest') return styles.sessionRest;
  if (item.kind === 'pdf') return styles.sessionPdf;
  if (item.isCurrent) return styles.sessionCurrent;
  return styles.sessionDefault;
}

function sessionMetaLabel(item: SchedulePreviewItem) {
  if (item.kind === 'rest') return 'Día de descanso';
  if (item.kind === 'pdf') return 'PDF adjunto';
  return item.estimatedDuration;
}

export function AthleteWeekListView({
  focusDate,
  items,
  fit = false,
  onDayPress,
  onSessionPress,
}: AthleteWeekListViewProps) {
  const days = getWeekDays(focusDate);
  const today = new Date();

  const list = days.map((day) => {
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
              fit && styles.dayCardFit,
              isToday && styles.dayCardToday,
              !hasSessions && styles.dayCardEmpty,
              onDayPress && pressed && styles.dayCardPressed,
            ]}
          >
            <View style={styles.dayHeader}>
              <View style={styles.dayHeaderText}>
                {fit ? null : (
                  <Text style={[styles.weekday, isToday && styles.weekdayToday]}>
                    {WEEKDAY_SHORT[weekdayIndex]}
                  </Text>
                )}
                <Text
                  style={[
                    styles.dayTitle,
                    fit && styles.dayTitleFit,
                    isToday && styles.dayTitleToday,
                  ]}
                  numberOfLines={1}
                >
                  {fit
                    ? `${WEEKDAY_SHORT[weekdayIndex]} · ${formatDayMonth(day)}`
                    : `${WEEKDAY_LABELS[weekdayIndex]} · ${formatDayMonth(day)}`}
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
                      fit && styles.sessionFit,
                      sessionCardStyle(item),
                      onSessionPress && pressed && styles.sessionPressed,
                    ]}
                  >
                    <View style={styles.sessionCopy}>
                      <Text style={styles.sessionName} numberOfLines={fit ? 1 : 2}>
                        {fit ? `${item.name} · ${sessionMetaLabel(item)}` : item.name}
                      </Text>
                      {fit ? null : <Text style={styles.sessionMeta}>{sessionMetaLabel(item)}</Text>}
                    </View>
                    {onSessionPress ? <Text style={styles.sessionAction}>Ver</Text> : null}
                  </Pressable>
                ))}
              </View>
            )}
          </Pressable>
        );
      });

  if (!fit) {
    return <View style={styles.list}>{list}</View>;
  }

  return (
    <ScrollView
      style={styles.listFill}
      contentContainerStyle={styles.list}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    >
      {list}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  listFill: {
    flex: 1,
    minHeight: 0,
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
    borderColor: withAlpha(colors.accent, '99'),
    backgroundColor: withAlpha(colors.accent, '0F'),
  },
  dayCardFit: {
    padding: spacing.sm,
    gap: 6,
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
  dayTitleFit: {
    fontSize: 14,
    lineHeight: 18,
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
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  sessionActivation: {
    borderColor: `${colors.activation}99`,
    backgroundColor: `${colors.activation}1A`,
  },
  sessionMetcon: {
    borderColor: `${colors.metcon}99`,
    backgroundColor: `${colors.metcon}1A`,
  },
  sessionRest: {
    borderColor: `${colors.restDay}99`,
    backgroundColor: `${colors.restDay}1A`,
  },
  sessionPdf: {
    borderColor: withAlpha(colors.textSecondary, '55'),
    backgroundColor: withAlpha(colors.textSecondary, '12'),
  },
  sessionFit: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
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
