import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { useTrainerAthleteFeedback } from '@/hooks/useTrainerAthleteFeedback';
import type { SessionLogRecord } from '@/lib/sessionLogService';
import { isSessionLogPendingReview } from '@/lib/sessionLogReview';

type TrainerAthleteFeedbackState = ReturnType<typeof useTrainerAthleteFeedback>;

const STAR_GOLD = '#F5B942';

function formatLogDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

function formatCompletionMeta(log: SessionLogRecord) {
  const count = log.completedItems.length;
  const parts =
    count > 0
      ? `${count} parte${count === 1 ? '' : 's'} completada${count === 1 ? '' : 's'}`
      : 'Sin marcar';
  return log.duration ? `${parts} · ${log.duration}` : parts;
}

export function AthleteSessionLogCard({
  log,
  onPress,
  feedback,
  favorite = false,
  onToggleFavorite,
  last = false,
}: {
  log: SessionLogRecord;
  onPress?: () => void;
  feedback?: TrainerAthleteFeedbackState;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  last?: boolean;
}) {
  const pendingReview = isSessionLogPendingReview(log.id, feedback);

  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={styles.header}>
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          accessibilityRole="button"
          accessibilityLabel={`Abrir registro de ${log.workoutName}`}
          style={({ pressed }) => [styles.headerMainPressable, pressed && onPress && styles.pressed]}
        >
          <View style={styles.headerMain}>
            <Text style={styles.title} numberOfLines={1}>
              {log.workoutName}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.subtitle} numberOfLines={1}>
                {formatCompletionMeta(log)}
              </Text>
              {pendingReview ? (
                <View style={styles.pendingPill}>
                  <Text style={styles.pendingPillText}>Por revisar</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.headerTrailing}>
            <Text style={styles.date}>{formatLogDate(log.scheduledDate)}</Text>
            {onPress ? (
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            ) : null}
          </View>
        </Pressable>

        {onToggleFavorite ? (
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Marcar entreno como favorito'}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <Ionicons
              name={favorite ? 'star' : 'star-outline'}
              size={16}
              color={favorite ? STAR_GOLD : colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: 12,
  },
  headerMainPressable: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  headerMain: {
    flex: 1,
    minWidth: 0,
  },
  headerTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
    flexWrap: 'wrap',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  pendingPill: {
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: withAlpha(colors.warning, '18'),
  },
  pendingPillText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.2,
  },
  iconBtn: {
    padding: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  pressed: {
    opacity: 0.72,
  },
});
