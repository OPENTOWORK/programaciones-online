import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { AppBackgroundScaffold } from '@/components/ui/AppBackgroundLogo';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { WORKOUT_TIMER_MODE_LABELS, formatWorkoutTimer } from '@/lib/athleteWorkoutTimer';

type TimerController = ReturnType<typeof useWorkoutTimer>;

export function WorkoutTimerFullscreen({
  timer,
  title,
  onExit,
  onOpenSettings,
}: {
  timer: TimerController;
  /** Bloque del entreno que se está cronometrando, si el crono viene de una sesión. */
  title?: string;
  onExit: () => void;
  onOpenSettings?: () => void;
}) {
  const { settings, status, display, start, pause, reset } = timer;
  const blockTitle = title?.trim();
  // Retocar los ajustes reinicia el crono, así que solo se ofrece con el reloj parado.
  const canOpenSettings = Boolean(onOpenSettings) && status !== 'running';

  useEffect(() => {
    if (status !== 'running') return undefined;

    void activateKeepAwakeAsync('workout-timer');
    return () => {
      try {
        deactivateKeepAwake('workout-timer');
      } catch {
        // Ignorar si el wake lock no llegó a activarse (p. ej. web o transición rápida).
      }
    };
  }, [status]);

  const phaseColor =
    display.tabataPhase === 'work'
      ? colors.accent
      : display.tabataPhase === 'rest'
        ? colors.accentBlue
        : display.finished
          ? colors.success
          : colors.text;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AppBackgroundScaffold style={styles.scaffold}>
        <View style={styles.foreground}>
          <View style={styles.header}>
            <Pressable
              onPress={onExit}
              accessibilityRole="button"
              accessibilityLabel="Cerrar cronómetro"
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            >
              <AppIcon name="close" size={22} color={colors.textSecondary} />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.modeLabel}>{WORKOUT_TIMER_MODE_LABELS[settings.mode]}</Text>
              {blockTitle ? (
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {blockTitle}
                </Text>
              ) : null}
            </View>
            {canOpenSettings ? (
              <Pressable
                onPress={onOpenSettings}
                disabled={!onOpenSettings}
                accessibilityRole="button"
                accessibilityLabel="Ajustar el cronómetro"
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              >
                <AppIcon name="settings" size={20} color={colors.textSecondary} outlined />
              </Pressable>
            ) : (
              <View style={styles.headerSpacer} />
            )}
          </View>

          <View style={styles.body}>
            <Text style={styles.statusLabel}>{display.statusLabel}</Text>
            <Text style={[styles.timerValue, { color: phaseColor }]} accessibilityLiveRegion="polite">
              {formatWorkoutTimer(display.primarySeconds)}
            </Text>
            {display.detailLabel ? <Text style={styles.detailLabel}>{display.detailLabel}</Text> : null}
          </View>

          <View style={styles.actions}>
            {status === 'running' ? (
              <Button title="Pausar" variant="secondary" onPress={pause} style={styles.actionButton} />
            ) : (
              <Button
                title={status === 'finished' ? 'Repetir' : 'Continuar'}
                onPress={start}
                style={styles.actionButton}
              />
            )}
            <Button
              title="Reiniciar"
              variant="outline"
              onPress={reset}
              disabled={status === 'idle'}
              style={styles.actionButton}
            />
          </View>
        </View>
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
  foreground: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.surfaceLight, 'CC'),
  },
  headerSpacer: {
    width: 40,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  modeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  statusLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  timerValue: {
    fontSize: 88,
    lineHeight: 96,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
