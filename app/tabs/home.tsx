import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AthleteCurrentSchedule } from '@/components/home/AthleteCurrentSchedule';
import { AthleteGymAccess } from '@/components/home/AthleteGymAccess';
import { HomeBrandShowcase } from '@/components/home/HomeBrandShowcase';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
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

  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'atleta';
  const isTrainer = isTrainerRole(user?.role);

  const scrollRef = useRef<ScrollView>(null);
  const calendarOffsetY = useRef(0);

  useEffect(() => {
    if (!focusCalendar || isTrainer) return;

    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(calendarOffsetY.current - 12, 0),
        animated: true,
      });
      router.setParams({ focus: '' });
    }, 220);

    return () => clearTimeout(timer);
  }, [focusCalendar, isTrainer, router]);

  return (
    <ScreenWrapper scrollRef={scrollRef} resetScrollOnFocus={!focusCalendar}>
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

      <HomeBrandShowcase />

      {!isTrainer ? (
        <View
          style={styles.calendarWrap}
          onLayout={(event) => {
            calendarOffsetY.current = event.nativeEvent.layout.y;
          }}
        >
          <AthleteGymAccess />
          <AthleteCurrentSchedule preferPersonalized={focusCalendar} forceExpanded={focusCalendar} />
        </View>
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
  calendarWrap: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});
