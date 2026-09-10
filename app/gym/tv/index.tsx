import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { GymTvWorkoutBlocks } from '@/components/gym/GymTvWorkoutBlocks';
import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
} from '@/components/gym/GymScreen';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useGymTvDay } from '@/hooks/useGymTvDay';
import { gymDateKey, gymSessionBoardText, type GymTrainingSession } from '@/lib/gymTraining';
import type { Workout } from '@/lib/types';

function formatBoardDate(date: Date) {
  const label = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatWeekRange(weekStart: Date, weekEnd: Date) {
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const start = weekStart.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  });
  const end = weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `${start} – ${end}`.replace(/\./g, '');
}

function formatWeekday(date: Date) {
  return date
    .toLocaleDateString('es-ES', { weekday: 'short' })
    .replace('.', '')
    .toUpperCase();
}

function formatTvDate(date: Date) {
  return date
    .toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    .replace('.', '')
    .toUpperCase();
}

function SessionCard({
  session,
  workout,
  onLaunch,
}: {
  session: GymTrainingSession;
  workout?: Workout;
  onLaunch: () => void;
}) {
  const boardText = session.body ? gymSessionBoardText(session) : '';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.programChip, { backgroundColor: session.color }]}>
          <Text style={styles.programChipText}>{session.programName}</Text>
        </View>
        <Text style={styles.cardDate}>{formatTvDate(new Date(`${session.dateKey}T12:00:00`))}</Text>
      </View>
      {boardText ? (
        <Text style={styles.cardBody}>{boardText}</Text>
      ) : workout ? (
        <GymTvWorkoutBlocks workout={workout} />
      ) : (
        <SkeletonBlock height={72} />
      )}
      <Button title="Lanzar a TV" size="compact" onPress={onLaunch} />
    </View>
  );
}

export default function GymTvBoardScreen() {
  const router = useRouter();
  const {
    selectedDate,
    dateKey,
    weekDays,
    weekSessionCounts,
    daySessions,
    workoutsById,
    isLoading,
    loadingWorkouts,
    error,
    setSelectedDate,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    refresh,
  } = useGymTvDay();

  const todayKey = gymDateKey(new Date());

  const launch = (session: GymTrainingSession) => {
    router.push({
      pathname: '/gym/tv/[workoutId]',
      params: {
        workoutId: session.id,
        programName: session.programName,
        dateKey: session.dateKey,
      },
    });
  };

  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader
          title="Entrenos para TV"
          subtitle="Elige una sesión y lánzala a las pantallas del gimnasio"
        />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}

        <View style={styles.weekToolbar}>
          <View style={styles.weekNav}>
            <Pressable
              onPress={goToPreviousWeek}
              accessibilityLabel="Semana anterior"
              style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
            >
              <AppIcon name="chevronLeft" size={16} color={colors.textSecondary} />
            </Pressable>
            <Text style={styles.weekLabel}>
              {formatWeekRange(weekDays[0] ?? selectedDate, weekDays[6] ?? selectedDate)}
            </Text>
            <Pressable
              onPress={goToNextWeek}
              accessibilityLabel="Semana siguiente"
              style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
            >
              <AppIcon name="chevronRight" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
          {dateKey === todayKey ? null : (
            <Button title="Hoy" variant="ghost" size="compact" onPress={goToToday} />
          )}
        </View>

        <View style={styles.weekStrip}>
          {weekDays.map((day, index) => {
            const key = gymDateKey(day);
            const selected = key === dateKey;
            const isToday = key === todayKey;
            const count = weekSessionCounts[key] ?? 0;
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedDate(day)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${formatBoardDate(day)}${count ? `, ${count} entrenos` : ''}`}
                style={({ pressed }) => [
                  styles.weekCell,
                  index === weekDays.length - 1 && styles.weekCellLast,
                  selected && styles.weekCellSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.weekCellDow, selected && styles.weekCellDowSelected]}>
                  {formatWeekday(day)}
                </Text>
                <Text style={[styles.weekCellDay, selected && styles.weekCellDaySelected]}>
                  {day.getDate()}
                </Text>
                <Text style={[styles.weekCellMeta, selected && styles.weekCellMetaSelected]}>
                  {isToday && !selected ? 'Hoy' : count > 0 ? String(count) : ' '}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <View style={styles.grid}>
            {[0, 1, 2].map((index) => (
              <SkeletonBlock key={index} height={220} />
            ))}
          </View>
        ) : daySessions.length === 0 ? (
          <GymEmptyState
            icon="tv"
            title={`Sin entrenos · ${formatBoardDate(selectedDate)}`}
            text="Cambia de día o revisa el calendario de entrenos para ver qué hay programado."
          />
        ) : (
          <View style={styles.grid}>
            {daySessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                workout={loadingWorkouts ? undefined : workoutsById[session.id]}
                onLaunch={() => launch(session)}
              />
            ))}
          </View>
        )}
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  weekToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  weekLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    minWidth: 112,
    textAlign: 'center',
  },
  weekStrip: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  weekCell: {
    flex: 1,
    minWidth: 44,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 2,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  weekCellLast: {
    borderRightWidth: 0,
  },
  weekCellSelected: {
    backgroundColor: colors.surfaceLight,
  },
  weekCellDow: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.4,
    fontSize: 10,
  },
  weekCellDowSelected: {
    color: colors.textSecondary,
  },
  weekCellDay: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
  },
  weekCellDaySelected: {
    color: colors.accent,
  },
  weekCellMeta: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 10,
    minHeight: 14,
  },
  weekCellMetaSelected: {
    color: colors.textSecondary,
  },
  pressed: { opacity: 0.8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    flexGrow: 1,
    flexBasis: 340,
    maxWidth: 460,
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  programChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  programChipText: {
    ...typography.caption,
    fontWeight: '800',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  cardDate: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardBody: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 18,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
});
