import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TimerSoundToggle } from '@/components/timer/TimerSoundToggle';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppBackgroundScaffold } from '@/components/ui/AppBackgroundLogo';
import { Button } from '@/components/ui/Button';
import { borderRadius, brandColor, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useTimerKeepAwake } from '@/hooks/useTimerKeepAwake';
import { useWorkoutSequence } from '@/hooks/useWorkoutSequence';
import { WORKOUT_TIMER_MODE_LABELS, formatWorkoutTimer } from '@/lib/athleteWorkoutTimer';
import type { TimerCueHandler } from '@/lib/timerCues';
import type { WorkoutSequence } from '@/lib/workoutSequence';

const PHASE_LABELS = {
  work: 'Trabajo',
  rest: 'Descanso',
  done: 'Bloque completado',
} as const;

/**
 * Crono que lleva al atleta serie a serie: los ejercicios por tiempo van a la contra, los de
 * repeticiones esperan a «Continuar» y entre rondas cuenta el descanso que toca.
 */
export function WorkoutSequenceFullscreen({
  sequence,
  title,
  onExit,
  onCue,
}: {
  sequence: WorkoutSequence;
  title?: string;
  onExit: () => void;
  onCue?: TimerCueHandler;
}) {
  const { status, view, next, pause, resume, restart } = useWorkoutSequence(sequence, onCue);
  const blockTitle = title?.trim();
  const paused = status === 'paused';
  const timed = view.remainingSeconds != null;

  useTimerKeepAwake(status === 'running');

  const phaseColor =
    view.phase === 'rest'
      ? brandColor('rest', colors.accentBlue)
      : view.phase === 'done'
        ? colors.success
        : brandColor('actionInk', colors.accent);

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
              <Text style={styles.modeLabel}>{WORKOUT_TIMER_MODE_LABELS.crono}</Text>
              {blockTitle ? (
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {blockTitle}
                </Text>
              ) : null}
            </View>
            <TimerSoundToggle style={styles.closeBtn} />
          </View>

          <View style={styles.body}>
            <View style={styles.phase} accessibilityLiveRegion="polite">
              <Text style={[styles.phaseLabel, { color: phaseColor }]}>
                {paused ? `${PHASE_LABELS[view.phase]} · En pausa` : PHASE_LABELS[view.phase]}
              </Text>
              {view.progress ? <Text style={styles.progress}>{view.progress}</Text> : null}
              {view.phase === 'work' ? (
                <Text style={styles.exercise} numberOfLines={3}>
                  {view.title}
                </Text>
              ) : null}
            </View>

            {view.phase === 'done' ? (
              <>
                <Text style={[styles.timerValue, { color: phaseColor }]}>
                  {formatWorkoutTimer(view.totalSeconds)}
                </Text>
                <Text style={styles.detail}>Tiempo total</Text>
              </>
            ) : timed ? (
              <Text style={[styles.timerValue, { color: phaseColor }]}>
                {formatWorkoutTimer(Math.ceil(view.remainingSeconds ?? 0))}
              </Text>
            ) : (
              <Text style={[styles.targetValue, { color: phaseColor }]} numberOfLines={2}>
                {view.target ?? 'A tu ritmo'}
              </Text>
            )}

            {view.load ? <Text style={styles.detail}>Carga · {view.load}</Text> : null}
            {view.note ? <Text style={styles.detail}>{view.note}</Text> : null}
            {view.phase === 'work' && !timed ? (
              <Text style={styles.hint}>Pulsa «Continuar» al terminar la serie</Text>
            ) : null}
          </View>

          {view.phase !== 'done' ? (
            <View style={styles.nextCard}>
              <Text style={styles.nextLabel}>{view.next ? 'Siguiente' : 'Último paso'}</Text>
              <Text style={styles.nextValue} numberOfLines={2}>
                {view.next ?? 'Al terminar se cierra el bloque'}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {view.phase === 'done' ? (
              <>
                <Button title="Repetir" variant="secondary" onPress={restart} style={styles.actionButton} />
                <Button title="Cerrar" onPress={onExit} style={styles.actionButton} />
              </>
            ) : timed ? (
              <>
                <Button
                  title={paused ? 'Reanudar' : 'Pausar'}
                  variant="secondary"
                  onPress={paused ? resume : pause}
                  style={styles.actionButton}
                />
                <Button
                  title={view.phase === 'rest' ? 'Saltar descanso' : 'Siguiente'}
                  variant="outline"
                  onPress={next}
                  style={styles.actionButton}
                />
              </>
            ) : (
              <Button title="Continuar" onPress={next} style={styles.actionButton} />
            )}
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
  phase: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  phaseLabel: {
    ...typography.bodySmall,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  progress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  exercise: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  timerValue: {
    fontSize: 88,
    lineHeight: 96,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  targetValue: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '800',
    textAlign: 'center',
  },
  detail: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  nextCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: brandColor('cardBorder', colors.border),
    backgroundColor: brandColor('card', colors.surface),
  },
  nextLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  nextValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
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
