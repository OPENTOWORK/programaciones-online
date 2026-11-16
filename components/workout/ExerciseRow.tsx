import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { fontUiRegular } from '@/constants/fonts';
import { borderRadius, brandColor, colors, spacing, typography, withAlpha } from '@/constants/theme';
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
  renderExtra?: ReactNode;
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
  renderExtra,
}: ExerciseRowProps) {
  const detail = formatExerciseDetail(exercise);

  return (
    <View
      style={[
        styles.rowShell,
        completed && styles.rowCompleted,
        isVideoActive && styles.rowVideoActive,
      ]}
    >
      <View style={styles.rowLine}>
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

      <View style={styles.mainLine}>
        <Pressable
          onPress={() => {
            if (hasVideo) {
              onOpenVideo?.();
              return;
            }
            onToggle?.();
          }}
          style={styles.namePressable}
        >
          <Text style={[styles.name, completed && styles.nameCompleted]} numberOfLines={2}>
            {exercise.name}
          </Text>
        </Pressable>

        {detail ? (
          <Text style={styles.details} numberOfLines={1}>
            {detail}
          </Text>
        ) : null}

        {renderExtra}

        {hasVideo || onSendVideo ? (
          <View style={styles.iconRow}>
            {hasVideo ? (
              <Pressable
                onPress={() => onOpenVideo?.()}
                style={[styles.iconBtn, isVideoActive && styles.iconBtnActive]}
                accessibilityRole="button"
                accessibilityLabel={isVideoActive ? 'Ocultar vídeo' : 'Ver vídeo'}
              >
                <AppIcon name="play" size={16} color={colors.textSecondary} outlined />
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
                <AppIcon name="camera" size={16} color={colors.textSecondary} outlined />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
      </View>

      {exercise.notes ? (
        <View style={styles.notesRow}>
          <AppIcon name="info" size={14} color={colors.accentBlue} />
          <Text style={styles.notes} numberOfLines={2}>{exercise.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rowShell: {
    paddingVertical: 12,
    paddingHorizontal: 2,
    marginBottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brandColor('cardBorder', '#2C313A'),
    backgroundColor: 'transparent',
    gap: spacing.xs,
  },
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowCompleted: {
    backgroundColor: 'transparent',
  },
  rowVideoActive: {
    borderColor: withAlpha(colors.accent, '88'),
    backgroundColor: withAlpha(colors.accent, '16'),
  },
  checkboxPressable: {
    flexShrink: 0,
  },
  checkbox: {
    width: 22,
    height: 22,
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
  mainLine: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  namePressable: {
    flex: 1,
    minWidth: 0,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  nameCompleted: {
    color: colors.textMuted,
  },
  details: {
    flexShrink: 0,
    maxWidth: '46%',
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: brandColor('body', '#C5CAD3'),
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingLeft: 30,
    paddingBottom: 2,
  },
  notes: {
    ...typography.caption,
    color: colors.accentBlue,
    flex: 1,
  },
});
