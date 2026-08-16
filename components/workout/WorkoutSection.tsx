import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import {
  getBlockAccent,
  isFreeTextBlockLabel,
  isKnownBlockLabel,
  isStructuredWorkoutContent,
  parseWorkoutContent,
  type WorkoutContentBlock,
} from '@/lib/workoutContentParser';
import {
  getBlockTimingHint,
  parseBlockItemForDisplay,
  parseTimingForDisplay,
  splitBlockTimingMetadata,
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
  onExercisePress?: (
    exerciseName: string,
    aimharderEjerId?: number,
    youtubeVideoId?: string,
  ) => void;
  hasExerciseVideo?: (
    exerciseName: string,
    aimharderEjerId?: number,
    youtubeVideoId?: string,
  ) => boolean;
  activeExerciseName?: string;
  onSendExerciseVideo?: (exerciseKey: string, exerciseName: string) => void;
  uploadingExerciseKey?: string | null;
  sentExerciseKeys?: Set<string> | string[];
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

interface BlockItemsProps {
  items: string[];
  blockIndex: number;
  accentText: string;
  sectionKey?: string;
  completedItems?: Record<string, boolean>;
  onToggleItem?: (key: string) => void;
  onExercisePress?: (
    exerciseName: string,
    aimharderEjerId?: number,
    youtubeVideoId?: string,
  ) => void;
  hasExerciseVideo?: (
    exerciseName: string,
    aimharderEjerId?: number,
    youtubeVideoId?: string,
  ) => boolean;
  activeExerciseName?: string;
  onSendExerciseVideo?: (exerciseKey: string, exerciseName: string) => void;
  uploadingExerciseKey?: string | null;
  sentExerciseKeys?: Set<string> | string[];
}

function hasSentVideo(sentExerciseKeys: Set<string> | string[] | undefined, key: string) {
  if (!sentExerciseKeys) return false;
  if (sentExerciseKeys instanceof Set) return sentExerciseKeys.has(key);
  return sentExerciseKeys.includes(key);
}

function BlockItems({
  items,
  blockIndex,
  accentText,
  sectionKey,
  completedItems,
  onToggleItem,
  onExercisePress,
  hasExerciseVideo,
  activeExerciseName,
  onSendExerciseVideo,
  uploadingExerciseKey,
  sentExerciseKeys,
}: BlockItemsProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.itemsList}>
      {items.map((item, index) => {
        const exerciseName = parseExerciseLabelFromBlockItem(item);
        const display = parseBlockItemForDisplay(item);
        const showVideo =
          hasExerciseVideo?.(exerciseName, undefined, display.youtubeVideoId) ?? false;
        const itemKey = sectionKey ? `${sectionKey}:b${blockIndex}:i${index}` : '';
        const isChecked = itemKey ? !!completedItems?.[itemKey] : false;
        const showCheckbox = Boolean(itemKey && (onToggleItem || completedItems));
        const isActive =
          Boolean(activeExerciseName) &&
          activeExerciseName?.toLowerCase() === exerciseName.toLowerCase();
        const canSendVideo = Boolean(onSendExerciseVideo && itemKey && exerciseName.trim());
        const isUploadingThis = Boolean(uploadingExerciseKey && uploadingExerciseKey === itemKey);
        const alreadySent = hasSentVideo(sentExerciseKeys, itemKey);

        const openVideo = () => {
          if (showVideo) onExercisePress?.(exerciseName, undefined, display.youtubeVideoId);
        };

        return (
          <View
            key={`${item}-${index}`}
            style={[styles.itemRow, isActive && styles.itemRowActive, isChecked && styles.itemRowChecked]}
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
              <View style={[styles.itemBullet, { backgroundColor: accentText }]} />
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
                        <Text style={styles.itemMetricLabel}>{display.loadLabel ?? 'Carga'}</Text>
                        <Text style={styles.itemMetricValue}>{display.load}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
              <View style={styles.itemActions}>
                {showVideo ? (
                  <Pressable onPress={openVideo} style={styles.itemVideoPressable}>
                    <Text style={styles.itemVideoHint}>
                      {isActive ? 'Reproduciendo arriba' : 'Ver vídeo'}
                    </Text>
                  </Pressable>
                ) : null}
                {canSendVideo ? (
                  <Pressable
                    onPress={() => onSendExerciseVideo?.(itemKey, exerciseName)}
                    disabled={isUploadingThis}
                    style={styles.itemVideoPressable}
                    accessibilityLabel="Enviar vídeo del ejercicio"
                  >
                    <Text style={[styles.itemSendHint, isUploadingThis && styles.itemSendHintMuted]}>
                      {isUploadingThis
                        ? 'Subiendo…'
                        : alreadySent
                          ? 'Enviar otro vídeo'
                          : 'Enviar vídeo'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <View style={styles.itemSideActions}>
              {showVideo ? (
                <Pressable onPress={openVideo} style={styles.itemPlayBtn} accessibilityLabel="Ver vídeo">
                  <AppIcon name="play" size={18} color={accentText} outlined />
                </Pressable>
              ) : null}
              {canSendVideo ? (
                <Pressable
                  onPress={() => onSendExerciseVideo?.(itemKey, exerciseName)}
                  disabled={isUploadingThis}
                  style={styles.itemPlayBtn}
                  accessibilityLabel="Grabar y enviar vídeo"
                >
                  <AppIcon name="camera" size={18} color={accentText} outlined />
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

interface BlockCardProps extends Omit<BlockItemsProps, 'items' | 'accentText'> {
  block: WorkoutContentBlock;
}

/** Texto libre: se muestra exactamente como lo escribió el entrenador. */
function WorkoutTextCard({
  block,
  blockIndex,
  sectionKey,
  completedItems,
  onToggleItem,
}: BlockCardProps) {
  const text = block.text ?? '';
  const title = block.label.trim();
  const itemKey = sectionKey ? `${sectionKey}:b${blockIndex}:text` : '';
  const isChecked = itemKey ? !!completedItems?.[itemKey] : false;
  const showCheckbox = Boolean(itemKey && (onToggleItem || completedItems));

  const body = text ? <Text style={styles.noteText}>{text}</Text> : null;

  return (
    <View style={styles.noteCard}>
      {title ? (
        <Text style={[styles.noteTitle, text ? styles.noteTitleWithBody : undefined]}>{title}</Text>
      ) : null}
      {showCheckbox ? (
        <Pressable
          onPress={() => onToggleItem?.(itemKey)}
          disabled={!onToggleItem}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isChecked }}
          style={[styles.plainCheckRow, isChecked && styles.itemRowChecked]}
        >
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <View style={styles.itemCopy}>{body}</View>
        </Pressable>
      ) : (
        body
      )}
    </View>
  );
}

/**
 * Bloque escrito a mano por el entrenador: su primera línea es un título, no un
 * tipo de entrenamiento, así que se lee como una nota y no como una etiqueta.
 */
function WorkoutNoteCard({ block, ...itemProps }: BlockCardProps) {
  const timingParts = (block.timing ?? '')
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean);

  // En texto libre el nombre del bloque viaja en la cabecera, delante del cuerpo.
  const isFreeText = isFreeTextBlockLabel(block.label);
  const title = isFreeText ? timingParts[0] ?? '' : block.label.trim();
  const details = isFreeText ? timingParts.slice(1) : timingParts;
  const hasBody = details.length > 0 || block.items.length > 0;

  return (
    <View style={styles.noteCard}>
      {title ? (
        <Text style={[styles.noteTitle, hasBody ? styles.noteTitleWithBody : undefined]}>{title}</Text>
      ) : null}
      {details.map((detail, index) => (
        <Text key={`${detail}-${index}`} style={styles.noteDetail}>
          {detail}
        </Text>
      ))}
      <BlockItems items={block.items} accentText={colors.accent} {...itemProps} />
    </View>
  );
}

function WorkoutBlockCard({ block, ...itemProps }: BlockCardProps) {
  if (block.text !== undefined) {
    return <WorkoutTextCard block={block} {...itemProps} />;
  }

  if (!isKnownBlockLabel(block.label) || isFreeTextBlockLabel(block.label)) {
    return <WorkoutNoteCard block={block} {...itemProps} />;
  }

  const accent = getBlockAccent(block.label);
  const { blockTitle, pillTiming } = splitBlockTimingMetadata(block.timing);
  const timingParts = parseTimingForDisplay(pillTiming, block.label);
  const timingHint = getBlockTimingHint(block.label);

  return (
    <View style={[styles.blockCard, { borderColor: accent.border, backgroundColor: accent.bg }]}>
      <View style={styles.blockHeader}>
        <View style={[styles.blockChip, { backgroundColor: `${accent.text}18` }]}>
          <Text style={[styles.blockChipText, { color: accent.text }]}>{block.label}</Text>
        </View>
        {blockTitle ? <Text style={styles.blockTitleText}>{blockTitle}</Text> : null}
        {timingParts.length > 0 ? (
          <View style={styles.timingRow}>
            {timingParts.map((part, index) => (
              <TimingPartPill key={`${part.icon}-${part.value}-${index}`} part={part} accentText={accent.text} />
            ))}
          </View>
        ) : null}
      </View>

      {timingHint ? <Text style={styles.timingHint}>{timingHint}</Text> : null}

      <BlockItems items={block.items} accentText={accent.text} {...itemProps} />
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
  onSendExerciseVideo,
  uploadingExerciseKey,
  sentExerciseKeys,
}: WorkoutSectionProps) {
  if (!content?.trim()) return null;

  const structured = isStructuredWorkoutContent(content);
  const blocks = structured ? parseWorkoutContent(content) : [];
  const itemProps = {
    sectionKey,
    completedItems,
    onToggleItem,
    onExercisePress,
    hasExerciseVideo,
    activeExerciseName,
    onSendExerciseVideo,
    uploadingExerciseKey,
    sentExerciseKeys,
  };

  return (
    <Card style={[styles.card, variant === 'featured' ? styles.cardFeatured : undefined]}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <AppIcon name={icon} size={18} color={colors.accent} outlined />
        </View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {structured ? (
        <View style={styles.blocks}>
          {blocks.map((block, index) => (
            <WorkoutBlockCard
              key={`${block.label}-${index}`}
              block={block}
              blockIndex={index}
              {...itemProps}
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
  blockTitleText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
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
    marginTop: spacing.xs,
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
  itemSendHint: {
    ...typography.caption,
    color: colors.accentBlue,
    marginTop: 2,
    fontWeight: '600',
  },
  itemSendHintMuted: {
    color: colors.textMuted,
  },
  itemActions: {
    gap: 2,
    marginTop: 2,
  },
  itemSideActions: {
    alignItems: 'center',
    gap: 2,
  },
  itemVideoPressable: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  itemPlayBtn: {
    marginTop: 2,
    padding: spacing.xs,
  },
  noteCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: `${colors.accent}66`,
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    gap: spacing.xs,
  },
  noteTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 22,
  },
  noteTitleWithBody: {
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  noteDetail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  noteText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
});
