import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import {
  getBlockAccent,
  isStructuredWorkoutContent,
  parseWorkoutContent,
  type WorkoutContentBlock,
} from '@/lib/workoutContentParser';

import { parseExerciseLabelFromBlockItem } from '@/lib/exerciseName';

interface WorkoutSectionProps {
  title: string;
  content: string;
  icon?: AppIconName;
  variant?: 'default' | 'featured';
  onExercisePress?: (exerciseName: string) => void;
  hasExerciseVideo?: (exerciseName: string) => boolean;
  activeExerciseName?: string;
}

function WorkoutBlockCard({
  block,
  onExercisePress,
  hasExerciseVideo,
  activeExerciseName,
}: {
  block: WorkoutContentBlock;
  onExercisePress?: (exerciseName: string) => void;
  hasExerciseVideo?: (exerciseName: string) => boolean;
  activeExerciseName?: string;
}) {
  const accent = getBlockAccent(block.label);

  return (
    <View style={[styles.blockCard, { borderColor: accent.border, backgroundColor: accent.bg }]}>
      <View style={styles.blockHeader}>
        <View style={[styles.blockChip, { backgroundColor: `${accent.text}18` }]}>
          <Text style={[styles.blockChipText, { color: accent.text }]}>{block.label}</Text>
        </View>
        {block.timing ? (
          <View style={styles.timingPill}>
            <AppIcon name="frequency" size={14} color={colors.textMuted} />
            <Text style={styles.timingText}>{block.timing}</Text>
          </View>
        ) : null}
      </View>

      {block.items.length > 0 ? (
        <View style={styles.itemsList}>
          {block.items.map((item, index) => {
            const exerciseName = parseExerciseLabelFromBlockItem(item);
            const showVideo = hasExerciseVideo?.(exerciseName) ?? false;
            const isActive =
              Boolean(activeExerciseName) &&
              activeExerciseName?.toLowerCase() === exerciseName.toLowerCase();

            return (
              <Pressable
                key={`${block.label}-${index}`}
                onPress={showVideo ? () => onExercisePress?.(exerciseName) : undefined}
                disabled={!showVideo}
                style={({ pressed }) => [
                  styles.itemRow,
                  showVideo && pressed && styles.itemRowPressed,
                  isActive && styles.itemRowActive,
                ]}
              >
                <View style={[styles.itemBullet, { backgroundColor: accent.text }]} />
                <View style={styles.itemCopy}>
                  <Text style={styles.itemText}>{item}</Text>
                  {showVideo ? (
                    <Text style={styles.itemVideoHint}>
                      {isActive ? 'Reproduciendo arriba' : 'Ver vídeo'}
                    </Text>
                  ) : null}
                </View>
                {showVideo ? <AppIcon name="play" size={18} color={accent.text} outlined /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : block.timing ? null : (
        <Text style={styles.plainBlockText}>{block.label}</Text>
      )}
    </View>
  );
}

export function WorkoutSection({
  title,
  content,
  icon = 'main',
  variant = 'default',
  onExercisePress,
  hasExerciseVideo,
  activeExerciseName,
}: WorkoutSectionProps) {
  if (!content?.trim()) return null;

  const structured = isStructuredWorkoutContent(content);
  const blocks = structured ? parseWorkoutContent(content) : [];

  return (
    <Card style={[styles.card, variant === 'featured' && styles.cardFeatured]}>
      {variant !== 'featured' ? (
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <AppIcon name={icon} size={18} color={colors.accent} outlined />
          </View>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      ) : null}

      {structured ? (
        <View style={styles.blocks}>
          {blocks.map((block, index) => (
            <WorkoutBlockCard
              key={`${block.label}-${index}`}
              block={block}
              onExercisePress={onExercisePress}
              hasExerciseVideo={hasExerciseVideo}
              activeExerciseName={activeExerciseName}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.paragraph}>{content}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardFeatured: {
    borderColor: `${colors.accent}44`,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.accent}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },
  paragraph: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  blocks: {
    gap: spacing.sm,
  },
  blockCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  blockChip: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  blockChipText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  timingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  timingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  itemRowPressed: {
    opacity: 0.85,
  },
  itemRowActive: {
    backgroundColor: `${colors.accent}12`,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    marginHorizontal: -spacing.xs,
  },
  itemCopy: {
    flex: 1,
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  itemText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  itemVideoHint: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 2,
    fontWeight: '600',
  },
  plainBlockText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
