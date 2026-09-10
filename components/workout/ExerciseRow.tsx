import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { formatExercisePrescription } from '@/lib/exercisePrescription';
import type { Exercise } from '@/lib/types';

interface ExerciseRowProps {
  exercise: Exercise;
  completed: boolean;
  hasVideo?: boolean;
  isVideoActive?: boolean;
  onToggle?: () => void;
  onOpenVideo?: () => void;
  onSendVideo?: () => void;
  isSendingVideo?: boolean;
  hasSentVideo?: boolean;
}

function formatExerciseDetail(exercise: Exercise): string {
  return formatExercisePrescription(exercise);
}

export function ExerciseRow({
  exercise,
  completed,
  hasVideo = false,
  isVideoActive = false,
  onToggle,
  onOpenVideo,
  onSendVideo,
  isSendingVideo = false,
  hasSentVideo = false,
}: ExerciseRowProps) {
  return (
    <View
      style={[
        styles.row,
        completed && styles.rowCompleted,
        isVideoActive && styles.rowVideoActive,
      ]}
    >
      {onToggle ? (
        <Pressable
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completed }}
          style={styles.checkboxPressable}
        >
          <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
            {completed ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
        </Pressable>
      ) : (
        <View style={styles.checkboxPressable}>
          <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
            {completed ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Pressable
            onPress={() => {
              if (hasVideo) {
                onOpenVideo?.();
                return;
              }
              onToggle?.();
            }}
            style={styles.contentPressable}
          >
            <Text style={[styles.name, completed && styles.nameCompleted]}>{exercise.name}</Text>
          </Pressable>
          {hasVideo || onSendVideo ? (
            <View style={styles.iconRow}>
              {hasVideo ? (
                <Pressable
                  onPress={() => onOpenVideo?.()}
                  style={[styles.iconBtn, isVideoActive && styles.iconBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={isVideoActive ? 'Ocultar vídeo' : 'Ver vídeo'}
                >
                  <AppIcon name="play" size={16} color={colors.accent} outlined />
                </Pressable>
              ) : null}
              {onSendVideo ? (
                <Pressable
                  onPress={onSendVideo}
                  disabled={isSendingVideo}
                  style={[styles.iconBtn, isSendingVideo && styles.iconBtnMuted]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isSendingVideo ? 'Subiendo vídeo…' : hasSentVideo ? 'Enviar otro vídeo' : 'Enviar vídeo'
                  }
                >
                  <AppIcon name="camera" size={16} color={colors.accent} outlined />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
        <Text style={styles.details}>{formatExerciseDetail(exercise)}</Text>
        {exercise.notes ? (
          <View style={styles.notesRow}>
            <AppIcon name="info" size={14} color={colors.accentBlue} />
            <Text style={styles.notes}>{exercise.notes}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowCompleted: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '11'),
  },
  rowVideoActive: {
    borderColor: withAlpha(colors.accent, '88'),
    backgroundColor: withAlpha(colors.accent, '16'),
  },
  checkboxPressable: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.black,
    fontWeight: '700',
    fontSize: 14,
  },
  contentPressable: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accent, '16'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '44'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: withAlpha(colors.accent, '28'),
    borderColor: withAlpha(colors.accent, '88'),
  },
  iconBtnMuted: {
    opacity: 0.5,
  },
  name: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  details: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  notes: {
    ...typography.caption,
    color: colors.accentBlue,
    flex: 1,
  },
});
