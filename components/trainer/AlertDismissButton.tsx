import { Platform, Pressable, StyleSheet } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { colors } from '@/constants/theme';

const DISMISS_GREEN = '#4ADE80';

interface AlertDismissButtonProps {
  onPress: () => void;
  disabled?: boolean;
  completed?: boolean;
  accessibilityLabel?: string;
}

/** Check para marcar una alerta del entrenador como vista. Amarillo si sigue pendiente. */
export function AlertDismissButton({
  onPress,
  disabled = false,
  completed = false,
  accessibilityLabel = 'Marcar alerta como vista',
}: AlertDismissButtonProps) {
  return (
    <Pressable
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        completed ? styles.completed : styles.pending,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <AppIcon
        name="check"
        size={completed ? 16 : 18}
        color={completed ? '#0F1419' : colors.warning}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  pending: {
    borderWidth: 2,
    borderColor: colors.warning,
    borderRadius: 999,
    padding: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  completed: {
    backgroundColor: DISMISS_GREEN,
    borderRadius: 999,
    padding: 5,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },
});
