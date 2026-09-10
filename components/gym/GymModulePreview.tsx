import { StyleSheet, Text, View } from 'react-native';

import { GymScreen, GymScreenHeader } from '@/components/gym/GymScreen';
import { AppIcon } from '@/components/ui/AppIcon';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import type { AppIconName } from '@/constants/icons';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

/**
 * Módulos con la estructura de datos ya creada en Supabase pero sin pantalla
 * completa todavía. Se listan las capacidades reales para no prometer de más.
 */
export function GymModulePreview({
  title,
  subtitle,
  icon,
  ready,
  pending,
}: {
  title: string;
  subtitle: string;
  icon: AppIconName;
  ready: string[];
  pending: string[];
}) {
  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader title={title} subtitle={subtitle} />

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <AppIcon name={icon} size={20} color={colors.accent} outlined />
          </View>
          <Text style={styles.cardTitle}>Módulo preparado</Text>
          <Text style={styles.cardText}>
            Las tablas y los permisos ya están en la base de datos. Falta la pantalla de gestión.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Ya disponible en base de datos</Text>
        <View style={styles.list}>
          {ready.map((item) => (
            <View key={item} style={styles.row}>
              <AppIcon name="check" size={14} color="#4ADE80" />
              <Text style={styles.rowText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Pendiente de interfaz</Text>
        <View style={styles.list}>
          {pending.map((item) => (
            <View key={item} style={styles.row}>
              <AppIcon name="time" size={14} color={colors.textMuted} />
              <Text style={styles.rowTextMuted}>{item}</Text>
            </View>
          ))}
        </View>
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  cardText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 400,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  rowTextMuted: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
});
