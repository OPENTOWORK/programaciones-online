import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { formatExercisePrescription } from '@/lib/exercisePrescription';
import type { Exercise } from '@/lib/types';

interface ExerciseRowProps {
  exercise: Exercise;
  completed: boolean;
  hasVideo?: boolean;
  isVideoActive?: boolean;
  onToggle?: () => void;
  onOpenVideo?: () => void;
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
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, completed && styles.nameCompleted]}>{exercise.name}</Text>
            {hasVideo ? <AppIcon name="play" size={18} color={colors.accent} outlined /> : null}
          </View>
          <Text style={styles.details}>{formatExerciseDetail(exercise)}</Text>
          {hasVideo ? (
            <Text style={styles.videoHint}>
              {isVideoActive ? 'Reproduciendo el vídeo abajo' : 'Pulsa para ver el vídeo'}
            </Text>
          ) : null}
          {exercise.notes ? (
            <View style={styles.notesRow}>
              <AppIcon name="info" size={14} color={colors.accentBlue} />
              <Text style={styles.notes}>{exercise.notes}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
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
    backgroundColor: `${colors.accent}11`,
  },
  rowVideoActive: {
    borderColor: `${colors.accent}88`,
    backgroundColor: `${colors.accent}16`,
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
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
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
  videoHint: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.xs,
    fontWeight: '600',
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
