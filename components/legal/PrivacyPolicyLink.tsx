import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRIVACY_POLICY_ROUTE } from '@/constants/legal';
import { colors, spacing, typography } from '@/constants/theme';

interface PrivacyPolicyLinkProps {
  variant?: 'default' | 'small';
}

export function PrivacyPolicyLink({ variant = 'default' }: PrivacyPolicyLinkProps) {
  if (variant === 'small') {
    return (
      <Link href={PRIVACY_POLICY_ROUTE} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Política de privacidad"
          style={styles.smallWrap}
        >
          <Text style={styles.smallText}>Política de privacidad</Text>
        </Pressable>
      </Link>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        Al continuar, aceptas la{' '}
        <Link href={PRIVACY_POLICY_ROUTE}>
          <Text style={styles.link}>política de privacidad</Text>
        </Link>
        .
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  smallWrap: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  smallText: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
