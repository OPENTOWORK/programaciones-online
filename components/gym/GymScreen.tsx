import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import type { AppIconName } from '@/constants/icons';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';

const SUCCESS_GREEN = '#4ADE80';

/** Cabecera común de las pantallas del CRM, con acción opcional a la derecha. */
export function GymScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function GymSectionTitle({
  title,
  count,
  subtitle,
}: {
  title: string;
  count?: number;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionTitleWrap}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count !== undefined ? (
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{count}</Text>
          </View>
        ) : null}
      </View>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function GymEmptyState({
  icon = 'info',
  title,
  text,
  action,
}: {
  icon?: AppIconName;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <AppIcon name={icon} size={18} color={colors.textMuted} outlined />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
      {action}
    </View>
  );
}

export function GymErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? (
        <Button title="Reintentar" variant="outline" size="compact" onPress={onRetry} />
      ) : null}
    </View>
  );
}

export function GymSuccessBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <View style={styles.successBanner}>
      <View style={styles.successIcon}>
        <AppIcon name="check" size={16} color={SUCCESS_GREEN} />
      </View>
      <Text style={styles.successText}>{message}</Text>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
          hitSlop={8}
          style={({ pressed }) => [styles.successDismiss, pressed && styles.successDismissPressed]}
        >
          <AppIcon name="close" size={14} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Envoltorio de las pantallas del CRM: resuelve la carga del gimnasio activo
 * y el caso de un usuario con rol gimnasio que todavía no tiene ninguno asignado.
 */
export function GymScreen({ children }: { children: ReactNode }) {
  const { gym, loading, error, refresh } = useGym();

  if (loading) {
    return (
      <ScreenWrapper>
        <SkeletonBlock height={24} width="42%" />
        <SkeletonBlock height={14} width="64%" style={styles.loadingSpacer} />
        <View style={styles.loadingBlocks}>
          <SkeletonBlock height={92} />
          <SkeletonBlock height={92} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!gym) {
    return (
      <ScreenWrapper>
        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}
        <GymEmptyState
          icon="gym"
          title="Todavía no tienes un gimnasio asignado"
          text="Un administrador de Training ProgLine debe crear tu gimnasio y asignarte como propietario."
          action={<Button title="Volver a comprobar" variant="outline" size="compact" onPress={refresh} />}
        />
      </ScreenWrapper>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  headerCopy: {
    flex: 1,
    minWidth: 220,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitleWrap: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  countChip: {
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
  },
  countChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  emptyIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 420,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withAlpha(SUCCESS_GREEN, '35'),
    backgroundColor: withAlpha(SUCCESS_GREEN, '12'),
  },
  successIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(SUCCESS_GREEN, '18'),
    flexShrink: 0,
  },
  successText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  successDismiss: {
    padding: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  successDismissPressed: {
    opacity: 0.75,
  },
  loadingSpacer: {
    marginTop: spacing.sm,
  },
  loadingBlocks: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
