import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface HomeBlockProps {
  kicker: string;
  title?: string;
  children: ReactNode;
}

/** Tarjeta abierta de la home: el contenido se ve sin desplegar. */
export function HomeBlock({ kicker, title, children }: HomeBlockProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>{kicker}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: 4,
  },
  kicker: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
  },
  body: {
    flex: 1,
    minHeight: 0,
    marginTop: spacing.sm,
  },
});
