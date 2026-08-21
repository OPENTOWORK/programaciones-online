import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableStateCallbackType,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { borderRadius, colors, typography } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success';
  size?: 'default' | 'compact';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={(state: PressableStateCallbackType & { hovered?: boolean }) => [
        styles.base,
        size === 'compact' ? styles.compact : styles.regular,
        styles[variant],
        (state.hovered || state.pressed) && !isDisabled && styles.raised,
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'success' ? colors.white : colors.accent}
        />
      ) : (
        <Text
          style={[
            styles.text,
            size === 'compact' ? styles.compactText : styles.regularText,
            styles[`${variant}Text` as keyof typeof styles] as object,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    cursor: 'pointer',
  },
  regular: {
    minHeight: 48,
    paddingHorizontal: 20,
  },
  compact: {
    minHeight: 36,
    paddingHorizontal: 14,
  },
  primary: {
    backgroundColor: colors.accentDark,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: colors.accentDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
  secondary: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: `${colors.accent}66`,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  success: {
    backgroundColor: '#15803D',
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
  raised: {
    opacity: 0.94,
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    ...typography.button,
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  regularText: {
    fontSize: 15,
  },
  compactText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.text,
  },
  outlineText: {
    color: colors.accent,
  },
  ghostText: {
    color: colors.textSecondary,
  },
  successText: {
    color: colors.white,
  },
});
