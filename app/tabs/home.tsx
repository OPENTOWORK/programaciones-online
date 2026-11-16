import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AthleteCurrentSchedule } from '@/components/home/AthleteCurrentSchedule';
import { AthleteGymAccess } from '@/components/home/AthleteGymAccess';
import { AthleteWorkoutTimer } from '@/components/home/AthleteWorkoutTimer';
import { HomeBrandShowcase } from '@/components/home/HomeBrandShowcase';
import { HorizontalPager } from '@/components/program/HorizontalPager';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthletePreviewEffectiveUser, useAthletePreviewMode } from '@/hooks/useAthletePreviewMode';
import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';

function formatToday() {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const { focus } = useLocalSearchParams<{ focus?: string | string[] }>();
  const focusValue = Array.isArray(focus) ? focus[0] : focus;
  const focusCalendar = focusValue === 'calendar';

  const { user: authUser } = useAuth();
  const user = useAthletePreviewEffectiveUser() ?? authUser;
  const preview = useAthletePreviewMode();
  const firstName = user?.name?.split(' ')[0] ?? 'atleta';
  const isTrainer = !preview.enabled && isTrainerRole(user?.role);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!focusCalendar || isTrainer) return;
    const timer = setTimeout(() => router.setParams({ focus: '' }), 400);
    return () => clearTimeout(timer);
  }, [focusCalendar, isTrainer, router]);

  return (
    <ScreenWrapper
      scrollable={isTrainer}
      scrollRef={scrollRef}
      resetScrollOnFocus={!focusCalendar && !isTrainer}
      style={isTrainer ? undefined : styles.screen}
    >
      <View style={[styles.page, !isTrainer && styles.pageFill]}>
        {isTrainer ? (
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>Hola, {firstName}</Text>
              <Text style={styles.date}>{formatToday()}</Text>
            </View>
            <Pressable
              onPress={() => router.push('/tabs/profile')}
              accessibilityRole="button"
              accessibilityLabel="Ir al perfil"
              style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
            >
              <Text style={styles.avatarText}>{user?.avatarInitials ?? 'TP'}</Text>
            </Pressable>
          </View>
        ) : null}

        {!isTrainer ? (
          <View style={[styles.athleteBody, styles.athleteBodyFill]}>
            <HomeBrandShowcase />
            <AthleteCurrentSchedule preferPersonalized={focusCalendar} forceExpanded={focusCalendar}>
              {({ schedule }) => {
                const blocks = [
                  { id: 'calendar', label: 'Tu calendario', node: schedule },
                  { id: 'gym', label: 'Acceso a tus gimnasios', node: <AthleteGymAccess /> },
                  { id: 'timer', label: 'Cronómetro', node: <AthleteWorkoutTimer /> },
                ];
                const calendarPage = blocks.findIndex((block) => block.id === 'calendar');
                return (
                  <View style={styles.blockPager}>
                    <HorizontalPager
                      items={blocks}
                      label={(block) => block.label}
                      activeIndex={focusCalendar ? calendarPage : undefined}
                      renderPage={(block) => <View style={styles.blockPage}>{block.node}</View>}
                    />
                  </View>
                );
              }}
            </AthleteCurrentSchedule>
          </View>
        ) : (
          <HomeBrandShowcase />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
  },
  page: {
    gap: spacing.lg,
  },
  pageFill: {
    flex: 1,
    minHeight: 0,
  },
  athleteBody: {
    gap: spacing.lg,
  },
  athleteBodyFill: {
    flex: 1,
    minHeight: 0,
  },
  blockPager: {
    flex: 1,
    minHeight: 280,
  },
  blockPage: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  greeting: { ...typography.h2, color: colors.text },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPressed: {
    opacity: 0.88,
  },
  avatarText: { ...typography.body, color: colors.black, fontWeight: '700' },
});
