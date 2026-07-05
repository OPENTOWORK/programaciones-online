import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export function Input({
  label,
  error,
  style,
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isSecure = showPasswordToggle ? !passwordVisible : secureTextEntry;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrap}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            showPasswordToggle && styles.inputWithToggle,
            error && styles.inputError,
            style,
          ]}
          secureTextEntry={isSecure}
          {...props}
        />
        {showPasswordToggle ? (
          <Pressable
            onPress={() => setPasswordVisible((current) => !current)}
            style={styles.toggleButton}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={8}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={passwordVisible ? colors.accent : colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
  },
  inputWithToggle: {
    paddingRight: 52,
  },
  inputError: {
    borderColor: colors.danger,
  },
  toggleButton: {
    position: 'absolute',
    right: spacing.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
