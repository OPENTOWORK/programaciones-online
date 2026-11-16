import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { fontUiRegular, fontUiSemibold } from '@/constants/fonts';
import { borderRadius, brandColor, brandColors, colors, withAlpha } from '@/constants/theme';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { primeTimerCues } from '@/hooks/useTimerCues';
import { workoutBlockTimerRouteParams, type WorkoutBlockTimerPlan } from '@/lib/workoutBlockTimer';
import type { WorkoutContentBlock } from '@/lib/workoutContentParser';

/**
 * Lanza el crono que le corresponde al bloque. Un toque y el atleta ya está en la cuenta
 * atrás de 3, sin pasar por los ajustes: desde la pantalla completa puede retocarlos.
 */
export function BlockTimerButton({
  plan,
  block,
}: {
  plan: WorkoutBlockTimerPlan;
  block: WorkoutContentBlock;
}) {
  const navigation = useAppNavigation();

  return (
    <Pressable
      onPress={() => {
        primeTimerCues();
        navigation.push({
          pathname: '/timer',
          params: workoutBlockTimerRouteParams(plan, block),
        });
      }}
      accessibilityRole="button"
      accessibilityLabel={`Lanzar cronómetro · ${plan.buttonLabel}`}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <AppIcon name="timer" size={20} color={colors.black} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label} numberOfLines={1}>
          {plan.buttonLabel}
        </Text>
        <Text style={styles.hint}>
          {plan.sequence ? 'Trabajo y descanso, serie a serie' : 'Lanzar cronómetro'}
        </Text>
      </View>
      <AppIcon name="chevronRight" size={18} color={brandColor('actionInk', brandColors.orangeHighlight)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: brandColor('action', brandColors.orangeAction),
    backgroundColor: withAlpha(brandColor('action', brandColors.orangeAction), '18'),
  },
  pressed: {
    opacity: 0.86,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColor('action', brandColors.orangeAction),
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
  },
  hint: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: brandColor('actionInk', brandColors.orangeHighlight),
    fontSize: 12,
    lineHeight: 16,
  },
});
