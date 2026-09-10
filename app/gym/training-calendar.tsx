import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
} from '@/components/gym/GymScreen';
import { GymTrainingMonthGrid } from '@/components/gym/GymTrainingMonthGrid';
import { GymTrainingWeekGrid } from '@/components/gym/GymTrainingWeekGrid';
import { GymWeekDateBox } from '@/components/gym/GymWeekDateBox';
import { AppIcon } from '@/components/ui/AppIcon';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, typography, withAlpha } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { useGymTrainingWeek } from '@/hooks/useGymTrainingWeek';
import {
  formatWeekChip,
  HYPE_PROGRAM_COLORS,
  weekStartsAround,
} from '@/lib/gymTraining';
import { isHypeGym } from '@/lib/hypeGymSchedule';

export default function GymTrainingCalendarScreen() {
  const { gym } = useGym();
  const {
    focusDate,
    weekStart,
    days,
    monthDays,
    view,
    setView,
    programs,
    sessionsByDay,
    programFilters,
    isLoading,
    error,
    periodLabel,
    goToDate,
    goToPrevious,
    goToNext,
    goToThisWeek,
    goToNextTrainingWeek,
    toggleProgramFilter,
    clearProgramFilters,
    refresh,
  } = useGymTrainingWeek();

  const { thisWeek, nextWeek } = weekStartsAround();
  const isThisWeek = weekStart.toDateString() === thisWeek.toDateString();
  const isNextWeek = weekStart.toDateString() === nextWeek.toDateString();
  const showAllPrograms = programFilters.length === 0;
  const hypeOnly = isHypeGym(gym);
  const isMonth = view === 'month';

  return (
    <GymScreen>
      <ScreenWrapper scrollable={false} style={styles.page}>
        <GymScreenHeader
          title="Calendario de entrenos"
          subtitle="Qué se entrena cada día"
          action={
            <View style={styles.weekNav}>
              <Pressable
                onPress={goToPrevious}
                accessibilityLabel={isMonth ? 'Mes anterior' : 'Semana anterior'}
                style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
              >
                <AppIcon name="chevronLeft" size={16} color={colors.textSecondary} />
              </Pressable>
              <Text style={styles.weekLabel}>{isMonth ? periodLabel : formatWeekChip(weekStart)}</Text>
              <Pressable
                onPress={goToNext}
                accessibilityLabel={isMonth ? 'Mes siguiente' : 'Semana siguiente'}
                style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
              >
                <AppIcon name="chevronRight" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
          }
        />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}

        <View style={styles.toolbar}>
          <View style={styles.filters}>
            <Pressable
              onPress={goToThisWeek}
              style={({ pressed }) => [
                styles.filterChip,
                isThisWeek && !isMonth && styles.filterChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterText, isThisWeek && !isMonth && styles.filterTextActive]}>
                Esta semana
              </Text>
            </Pressable>
            <Pressable
              onPress={goToNextTrainingWeek}
              style={({ pressed }) => [
                styles.filterChip,
                isNextWeek && !isMonth && styles.filterChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterText, isNextWeek && !isMonth && styles.filterTextActive]}>
                Semana que viene
              </Text>
            </Pressable>
          </View>

          <View style={styles.toolbarRight}>
            <GymWeekDateBox date={isMonth ? focusDate : weekStart} onChangeDate={goToDate} />
            <View style={styles.viewSwitch} accessibilityRole="tablist">
              <Pressable
                onPress={() => setView('week')}
                accessibilityRole="tab"
                accessibilityState={{ selected: !isMonth }}
                accessibilityLabel="Vista semanal"
                style={({ pressed }) => [
                  styles.viewSwitchBtn,
                  !isMonth && styles.viewSwitchBtnActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.viewSwitchText, !isMonth && styles.viewSwitchTextActive]}>
                  Semana
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setView('month')}
                accessibilityRole="tab"
                accessibilityState={{ selected: isMonth }}
                accessibilityLabel="Vista mensual"
                style={({ pressed }) => [
                  styles.viewSwitchBtn,
                  isMonth && styles.viewSwitchBtnActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.viewSwitchText, isMonth && styles.viewSwitchTextActive]}>
                  Mes
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {programs.length > 0 ? (
          <View style={styles.filters}>
            <Pressable
              onPress={clearProgramFilters}
              style={({ pressed }) => [
                styles.filterChip,
                showAllPrograms && styles.filterChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterText, showAllPrograms && styles.filterTextActive]}>
                Todas las programaciones
              </Text>
            </Pressable>
            {programs.map((program) => {
              const selected = programFilters.includes(program.id);
              return (
                <Pressable
                  key={program.id}
                  onPress={() => toggleProgramFilter(program.id)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    selected && styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.filterDot,
                      { backgroundColor: HYPE_PROGRAM_COLORS[program.name] ?? colors.border },
                    ]}
                  />
                  <Text style={[styles.filterText, selected && styles.filterTextActive]}>
                    {program.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {isLoading ? (
          <SkeletonBlock height={420} />
        ) : !hypeOnly && programs.length === 0 ? (
          <GymEmptyState
            icon="calendar"
            title="Todavía no hay programaciones"
            text="Cuando un administrador enlace las programaciones de tu gimnasio, aparecerán aquí semana a semana."
          />
        ) : isMonth ? (
          <GymTrainingMonthGrid
            days={monthDays}
            focusDate={focusDate}
            sessionsByDay={sessionsByDay}
          />
        ) : (
          <GymTrainingWeekGrid days={days} sessionsByDay={sessionsByDay} />
        )}
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: 0,
    gap: 8,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBtn: {
    width: 28,
    height: 28,
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
    minWidth: 120,
    textAlign: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  toolbarRight: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.accent,
  },
  viewSwitch: {
    flexDirection: 'row',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  viewSwitchBtn: {
    minHeight: 36,
    minWidth: 76,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  viewSwitchBtnActive: {
    backgroundColor: colors.accent,
  },
  viewSwitchText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '800',
  },
  viewSwitchTextActive: {
    color: colors.background,
  },
  pressed: { opacity: 0.8 },
});
