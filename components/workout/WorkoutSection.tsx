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
import {
  getBlockTimingHint,
  parseBlockItemForDisplay,
  parseTimingForDisplay,
  type TimingDisplayPart,
} from '@/lib/workoutDisplayFormat';

import { parseExerciseLabelFromBlockItem } from '@/lib/exerciseName';

interface WorkoutSectionProps {
  title: string;
  content: string;
  icon?: AppIconName;
  variant?: 'default' | 'featured';
  sectionKey?: string;
  completedItems?: Record<string, boolean>;
  onToggleItem?: (key: string) => void;
  onExercisePress?: (exerciseName: string, aimharderEjerId?: number) => void;
  hasExerciseVideo?: (exerciseName: string, aimharderEjerId?: number) => boolean;
  activeExerciseName?: string;
}

function TimingPartPill({ part, accentText }: { part: TimingDisplayPart; accentText: string }) {
  const iconName = part.icon === 'time' ? 'time' : part.icon === 'rounds' ? 'frequency' : 'info';

  return (
    <View style={styles.timingPill}>
      <AppIcon name={iconName} size={14} color={accentText} outlined />
      <Text style={styles.timingValue}>{part.value}</Text>
      {part.unit ? <Text style={styles.timingUnit}>{part.unit}</Text> : null}
    </View>
  );
}

function WorkoutBlockCard({
  block,
  blockIndex,
  sectionKey,
  completedItems,
  onToggleItem,
  onExercisePress,
  hasExerciseVideo,
  activeExerciseName,
}: {
  block: WorkoutContentBlock;
  blockIndex: number;
  sectionKey?: string;
  completedItems?: Record<string, boolean>;
  onToggleItem?: (key: string) => void;
  onExercisePress?: (exerciseName: string, aimharderEjerId?: number) => void;
  hasExerciseVideo?: (exerciseName: string, aimharderEjerId?: number) => boolean;
  activeExerciseName?: string;
}) {
  const accent = getBlockAccent(block.label);
  const timingParts = parseTimingForDisplay(block.timing, block.label);
  const timingHint = getBlockTimingHint(block.label);

  return (
    <View style={[styles.blockCard, { borderColor: accent.border, backgroundColor: accent.bg }]}>
      <View style={styles.blockHeader}>
        <View style={[styles.blockChip, { backgroundColor: `${accent.text}18` }]}>
          <Text style={[styles.blockChipText, { color: accent.text }]}>{block.label}</Text>
        </View>
        {timingParts.length > 0 ? (
          <View style={styles.timingRow}>
            {timingParts.map((part, index) => (
              <TimingPartPill key={`${part.icon}-${part.value}-${index}`} part={part} accentText={accent.text} />
            ))}
          </View>
        ) : null}
      </View>

      {timingHint ? <Text style={styles.timingHint}>{timingHint}</Text> : null}

      {block.items.length > 0 ? (
        <View style={styles.itemsList}>
          {block.items.map((item, index) => {
            const exerciseName = parseExerciseLabelFromBlockItem(item);
            const display = parseBlockItemForDisplay(item);
            const showVideo = hasExerciseVideo?.(exerciseName) ?? false;
            const itemKey = sectionKey ? `${sectionKey}:b${blockIndex}:i${index}` : '';
            const isChecked = itemKey ? !!completedItems?.[itemKey] : false;
            const showCheckbox = Boolean(itemKey && (onToggleItem || completedItems));
            const isActive =
              Boolean(activeExerciseName) &&
              activeExerciseName?.toLowerCase() === exerciseName.toLowerCase();

            const openVideo = () => {
              if (showVideo) onExercisePress?.(exerciseName);
            };

            return (
              <View
                key={`${block.label}-${index}`}
                style={[
                  styles.itemRow,
                  isActive && styles.itemRowActive,
                  isChecked && styles.itemRowChecked,
                ]}
              >
                {showCheckbox ? (
                  onToggleItem ? (
                    <Pressable
                      onPress={() => onToggleItem(itemKey)}
                      style={styles.itemCheckbox}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isChecked }}
                    >
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
                      </View>
                    </Pressable>
                  ) : (
                    <View style={styles.itemCheckbox}>
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
                      </View>
                    </View>
                  )
                ) : (
                  <View style={[styles.itemBullet, { backgroundColor: accent.text }]} />
                )}
                <View style={styles.itemCopy}>
                  <Pressable
                    onPress={() => {
                      if (onToggleItem && itemKey) {
                        onToggleItem(itemKey);
                      }
                    }}
                    disabled={!onToggleItem || !itemKey}
                  >
                    <Text style={styles.itemName}>{display.name}</Text>
                    {display.quantity || display.load ? (
                      <View style={styles.itemMetrics}>
                        {display.quantity ? (
                          <View style={styles.itemMetricPill}>
                            <Text style={styles.itemMetricLabel}>Cantidad</Text>
                            <Text style={styles.itemMetricValue}>{display.quantity}</Text>
                          </View>
                        ) : null}
                        {display.load ? (
                          <View style={styles.itemMetricPill}>
                            <Text style={styles.itemMetricLabel}>Carga</Text>
                            <Text style={styles.itemMetricValue}>{display.load}</Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </Pressable>
                  {showVideo ? (
                    <Pressable onPress={openVideo} style={styles.itemVideoPressable}>
                      <Text style={styles.itemVideoHint}>
                        {isActive ? 'Reproduciendo arriba' : 'Ver vídeo'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
                {showVideo ? (
                  <Pressable onPress={openVideo} style={styles.itemPlayBtn} accessibilityLabel="Ver vídeo">
                    <AppIcon name="play" size={18} color={accent.text} outlined />
                  </Pressable>
                ) : null}
              </View>
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
  sectionKey,
  completedItems,
  onToggleItem,
  onExercisePress,
  hasExerciseVideo,
  activeExerciseName,
}: WorkoutSectionProps) {
  if (!content?.trim()) return null;

  const structured = isStructuredWorkoutContent(content);
  const blocks = structured ? parseWorkoutContent(content) : [];

  return (
    <Card style={[styles.card, variant === 'featured' ? styles.cardFeatured : undefined]}>
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
              blockIndex={index}
              sectionKey={sectionKey}
              completedItems={completedItems}
              onToggleItem={onToggleItem}
              onExercisePress={onExercisePress}
              hasExerciseVideo={hasExerciseVideo}
              activeExerciseName={activeExerciseName}
            />
          ))}
        </View>
      ) : sectionKey && (onToggleItem || completedItems?.[`${sectionKey}:text`]) ? (
        <Pressable
          onPress={() => onToggleItem?.(`${sectionKey}:text`)}
          disabled={!onToggleItem}
          style={[styles.plainCheckRow, completedItems?.[`${sectionKey}:text`] && styles.itemRowChecked]}
        >
          <View style={[styles.checkbox, completedItems?.[`${sectionKey}:text`] && styles.checkboxChecked]}>
            {completedItems?.[`${sectionKey}:text`] ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.paragraph}>{content}</Text>
        </Pressable>
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
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  timingValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  timingUnit: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timingHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
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
  itemRowChecked: {
    opacity: 0.92,
  },
  itemCheckbox: {
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
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
    fontSize: 12,
  },
  plainCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  itemCopy: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 22,
  },
  itemMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  itemMetricPill: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  itemMetricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  itemMetricValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  itemVideoHint: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 2,
    fontWeight: '600',
  },
  itemVideoPressable: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  itemPlayBtn: {
    marginTop: 2,
    padding: spacing.xs,
  },
  plainBlockText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
