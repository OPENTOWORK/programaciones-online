import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WorkoutTimerCountdown } from '@/components/timer/WorkoutTimerCountdown';
import { WorkoutTimerFullscreen } from '@/components/timer/WorkoutTimerFullscreen';
import { WorkoutTimerSetupForm } from '@/components/timer/WorkoutTimerSetupForm';
import { AppBackgroundScaffold } from '@/components/ui/AppBackgroundLogo';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import {
  DEFAULT_WORKOUT_TIMER_SETTINGS,
  workoutTimerSettingsFromParams,
} from '@/lib/athleteWorkoutTimer';

type TimerPhase = 'setup' | 'countdown' | 'run';

export default function WorkoutTimerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    direction?: string;
    duration?: string;
    work?: string;
    rest?: string;
    rounds?: string;
    title?: string;
  }>();

  // Abierto desde un bloque del entreno: llega configurado y arranca sin pasar por los ajustes.
  const preset = useMemo(() => workoutTimerSettingsFromParams(params), [params]);
  const blockTitle = typeof params.title === 'string' ? params.title : undefined;

  const [phase, setPhase] = useState<TimerPhase>(preset ? 'countdown' : 'setup');
  const timer = useWorkoutTimer(preset ?? DEFAULT_WORKOUT_TIMER_SETTINGS);
  const { start, reset, patchSettings, settings } = timer;

  const handleCountdownComplete = useCallback(() => {
    start();
    setPhase('run');
  }, [start]);

  const handleBegin = useCallback(() => {
    reset();
    setPhase('countdown');
  }, [reset]);

  const handleExit = useCallback(() => {
    reset();
    router.back();
  }, [reset, router]);

  const handleOpenSettings = useCallback(() => {
    reset();
    setPhase('setup');
  }, [reset]);

  if (phase === 'countdown') {
    return <WorkoutTimerCountdown label={blockTitle} onComplete={handleCountdownComplete} />;
  }

  if (phase === 'run') {
    return (
      <WorkoutTimerFullscreen
        timer={timer}
        title={blockTitle}
        onExit={handleExit}
        onOpenSettings={handleOpenSettings}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AppBackgroundScaffold style={styles.scaffold}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <AppIcon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Cronómetro</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {blockTitle ? <Text style={styles.blockTitle}>{blockTitle}</Text> : null}
          <WorkoutTimerSetupForm settings={settings} onChange={patchSettings} />
          <Button title="Comenzar" onPress={handleBegin} style={styles.startButton} />
        </ScrollView>
      </AppBackgroundScaffold>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scaffold: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    zIndex: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.surface, 'CC'),
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  blockTitle: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  startButton: {
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
