import type { PanResponderInstance } from 'react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AlertDismissButton } from '@/components/trainer/AlertDismissButton';
import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, goalLabels, levelColors, spacing, typography } from '@/constants/theme';
import type { AthleteSummary } from '@/lib/types';

interface CrmLeadCardProps {
  athlete: AthleteSummary;
  canMovePrev: boolean;
  canMoveNext: boolean;
  isDragging?: boolean;
  dragHandleProps?: PanResponderInstance['panHandlers'];
  onPress: () => void;
  onMovePrev: () => void;
  onMoveNext: () => void;
  onOpenActions: () => void;
  onDismissAlerts?: () => void;
  readOnly?: boolean;
}

export function CrmLeadCard({
  athlete,
  canMovePrev,
  canMoveNext,
  isDragging = false,
  dragHandleProps,
  onPress,
  onMovePrev,
  onMoveNext,
  onOpenActions,
  onDismissAlerts,
  readOnly = false,
}: CrmLeadCardProps) {
  const pendingCount = athlete.alerts?.total ?? athlete.unansweredCount ?? 0;
  const hasPendingAlerts = pendingCount > 0;

  return (
    <View style={[styles.card, isDragging && styles.cardDragging, hasPendingAlerts && styles.cardPending]}>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.headerMain, pressed && styles.bodyPressed]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{athlete.avatarInitials}</Text>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.name} numberOfLines={1}>
                {athlete.name}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {athlete.email}
              </Text>
              {athlete.role === 'administrador' ? (
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>Rol administrador</Text>
                </View>
              ) : athlete.role === 'entrenador' ? (
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>Rol entrenador</Text>
                </View>
              ) : athlete.assignedTrainerName ? (
                <Text style={styles.assignedTrainer} numberOfLines={1}>
                  Cedido a {athlete.assignedTrainerName}
                </Text>
              ) : readOnly ? (
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>Cliente cedido</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
          {hasPendingAlerts ? (
            <View style={styles.pendingActions}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount > 99 ? '99+' : pendingCount}</Text>
              </View>
              {onDismissAlerts ? (
                <AlertDismissButton onPress={onDismissAlerts} />
              ) : null}
            </View>
          ) : null}
          {dragHandleProps ? (
            <View style={styles.dragHandle} {...dragHandleProps}>
              <AppIcon name="dragHandle" size={16} color={colors.textMuted} />
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={onPress}
          style={({ pressed }) => pressed && styles.bodyPressed}
        >
          {(athlete.fitnessLevel || athlete.mainGoal) ? (
            <View style={styles.metaRow}>
              {athlete.fitnessLevel ? (
                <Text style={[styles.meta, { color: levelColors[athlete.fitnessLevel] }]}>{athlete.fitnessLevel}</Text>
              ) : null}
              {athlete.mainGoal ? <Text style={styles.meta}>{goalLabels[athlete.mainGoal]}</Text> : null}
            </View>
          ) : null}

          {athlete.currentProgramName ? (
            <Text style={styles.program} numberOfLines={1}>
              {athlete.currentProgramName}
            </Text>
          ) : null}

          {hasPendingAlerts && athlete.alerts ? (
            <View style={styles.alertSources}>
              <Text style={styles.pendingLabel}>Pendiente</Text>
              {athlete.alerts.chatCount > 0 ? (
                <Text style={styles.alertSource}>Chat · {athlete.alerts.chatCount}</Text>
              ) : null}
              {athlete.alerts.sessionCount > 0 ? (
                <Text style={styles.alertSource}>Entrenos · {athlete.alerts.sessionCount}</Text>
              ) : null}
              {athlete.alerts.intakeChanged ? (
                <Text style={styles.alertSource}>Cuestionario</Text>
              ) : null}
            </View>
          ) : null}
        </Pressable>
      </View>

      {readOnly ? null : (
      <View style={styles.actionsRow}>
        <Pressable
          onPress={onMovePrev}
          disabled={!canMovePrev}
          hitSlop={6}
          style={({ pressed }) => [styles.moveButton, pressed && canMovePrev && styles.moveButtonPressed]}
        >
          <AppIcon name="chevronLeft" size={16} color={canMovePrev ? colors.textSecondary : colors.textMuted} />
        </Pressable>

        <Pressable
          onPress={onOpenActions}
          hitSlop={6}
          style={({ pressed }) => [styles.menuButton, pressed && styles.moveButtonPressed]}
        >
          <AppIcon name="menuDots" size={16} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={onMoveNext}
          disabled={!canMoveNext}
          hitSlop={6}
          style={({ pressed }) => [styles.moveButton, pressed && canMoveNext && styles.moveButtonPressed]}
        >
          <AppIcon name="chevronRight" size={16} color={canMoveNext ? colors.textSecondary : colors.textMuted} />
        </Pressable>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  cardDragging: {
    borderColor: colors.accent,
    opacity: 0.92,
  },
  cardPending: {
    borderColor: colors.warning,
    backgroundColor: `${colors.warning}0D`,
  },
  body: {
    padding: spacing.sm + 2,
    gap: spacing.xs,
  },
  bodyPressed: {
    backgroundColor: colors.surfaceLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.accentBlue}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  headerCopy: {
    flex: 1,
  },
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  email: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  roleTag: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.accentBlue}22`,
  },
  roleTagText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 14,
  },
  assignedTrainer: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 3,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 13,
  },
  dragHandle: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
    ...(Platform.OS === 'web' ? ({ cursor: 'grab' } as object) : null),
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  program: {
    ...typography.caption,
    color: colors.accent,
  },
  alertSources: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  pendingLabel: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  alertSource: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xs,
  },
  moveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  moveButtonPressed: {
    backgroundColor: colors.surfaceLight,
  },
  menuButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
});
