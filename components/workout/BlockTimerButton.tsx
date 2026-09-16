import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { workoutTimerRouteParams } from '@/lib/athleteWorkoutTimer';
import type { WorkoutBlockTimerPlan } from '@/lib/workoutBlockTimer';

/**
 * Lanza el crono que le corresponde al bloque. Un toque y el atleta ya está en la cuenta
 * atrás de 3, sin pasar por los ajustes: desde la pantalla completa puede retocarlos.
 */
export function BlockTimerButton({ plan }: { plan: WorkoutBlockTimerPlan }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/timer',
          params: workoutTimerRouteParams(plan.settings, plan.title),
        })
      }
      accessibilityRole="button"
      accessibilityLabel={`Lanzar cronómetro · ${plan.buttonLabel}`}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <AppIcon name="timer" size={16} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label} numberOfLines={1}>
          {plan.buttonLabel}
        </Text>
        <Text style={styles.hint}>Lanzar cronómetro</Text>
      </View>
      <AppIcon name="chevronRight" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.accent, '22'),
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
