import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { clientStatusColor } from '@/components/trainer/ClientStatusBadge';
import { AppIcon } from '@/components/ui/AppIcon';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { describeClientIssue, type TrainerClientRow } from '@/lib/trainerOverview';

const OK_GREEN = '#4ADE80';

export function TrainerAttentionList({
  clients,
  loading = false,
  onOpenClient,
}: {
  clients: readonly TrainerClientRow[];
  loading?: boolean;
  onOpenClient: (athleteId: string) => void;
}) {
  if (loading) {
    return (
      <View style={styles.list}>
        {[0, 1].map((index) => (
          <View key={index} style={styles.row}>
            <SkeletonBlock height={10} width={10} radius={borderRadius.full} />
            <View style={styles.rowCopy}>
              <SkeletonBlock height={14} width="38%" />
              <SkeletonBlock height={12} width="60%" style={styles.skeletonSpacer} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (clients.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={[styles.emptyIcon, { backgroundColor: withAlpha(OK_GREEN, '1F') }]}>
          <AppIcon name="check" size={17} color={OK_GREEN} />
        </View>
        <View style={styles.rowCopy}>
          <Text style={styles.emptyTitle}>Todo al día</Text>
          <Text style={styles.emptyText}>
            Todos los clientes tienen su programación al día.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {clients.map((client, index) => {
        const color = clientStatusColor(client.status);

        return (
          <Pressable
            key={client.athlete.id}
            onPress={() => onOpenClient(client.athlete.id)}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ficha de ${client.athlete.name}`}
            style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
              styles.row,
              index === clients.length - 1 && styles.rowLast,
              hovered && styles.rowHovered,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={[styles.dot, { backgroundColor: color }]} />
            <View style={styles.rowCopy}>
              <Text style={styles.name} numberOfLines={1}>
                {client.athlete.name}
              </Text>
              <Text style={[styles.issue, { color }]} numberOfLines={1}>
                {describeClientIssue(client)}
              </Text>
            </View>
            {client.planTitle ? (
              <Text style={styles.planTitle} numberOfLines={1}>
                {client.planTitle}
              </Text>
            ) : null}
            <AppIcon name="chevronRight" size={16} color={colors.textMuted} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowHovered: {
    backgroundColor: colors.surfaceLight,
  },
  rowPressed: {
    opacity: 0.8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  issue: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  planTitle: {
    ...typography.caption,
    color: colors.textMuted,
    maxWidth: 180,
    textAlign: 'right',
  },
  skeletonSpacer: {
    marginTop: 6,
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  emptyIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
});
