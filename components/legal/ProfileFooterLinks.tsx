import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRIVACY_POLICY_ROUTE } from '@/constants/legal';
import { SUPPORT_ROUTE } from '@/constants/support';
import { colors, spacing, typography } from '@/constants/theme';

/** Enlaces discretos del final del perfil, iguales para atleta y entrenador. */
export function ProfileFooterLinks() {
  return (
    <View style={styles.wrap}>
      <Link href={PRIVACY_POLICY_ROUTE} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Política de privacidad"
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        >
          <Text style={styles.text}>Política de privacidad</Text>
        </Pressable>
      </Link>

      <Text style={styles.separator}>·</Text>

      <Link href={SUPPORT_ROUTE} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Contacto y soporte"
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        >
          <Text style={styles.text}>Contacto</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  link: {
    paddingVertical: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  separator: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
