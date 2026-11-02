import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { getPostLoginRoute, safeGoBack } from '@/lib/navigation';

interface HeaderBackButtonProps {
  /** Texto junto al icono; pásalo vacío para dejar solo la flecha. */
  label?: string;
  tint?: string;
}

/** Botón de volver siempre visible: usa el historial y, si no lo hay, la pantalla inicial del rol. */
export function HeaderBackButton({ label = 'Volver', tint = colors.text }: HeaderBackButtonProps) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Pressable
      onPress={() => safeGoBack(router, getPostLoginRoute(user?.role))}
      accessibilityRole="button"
      accessibilityLabel="Volver atrás"
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <AppIcon name="chevronLeft" size={20} color={tint} />
      {label ? <Text style={[styles.label, { color: tint }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingRight: spacing.sm,
    paddingLeft: 2,
    marginRight: spacing.xs,
    borderRadius: borderRadius.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  pressed: {
    backgroundColor: withAlpha(colors.text, '14'),
    opacity: 0.9,
  },
});
