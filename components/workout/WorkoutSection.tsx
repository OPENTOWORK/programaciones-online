import { Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import {
  parseFreeTextBlockContent,
  type FreeTextBlockVideo,
} from '@/lib/freeTextBlockVideos';
import {
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
  renderAfterBlock?: (blockKey: string, blockIndex: number) => ReactNode;
}

function TimingPartPill({ part }: { part: TimingDisplayPart }) {
  const iconName = part.icon === 'time' ? 'time' : part.icon === 'rounds' ? 'frequency' : 'info';

  return (
    <View style={styles.timingPill}>
      <AppIcon name={iconName} size={13} color={colors.textMuted} outlined />
      <Text style={styles.timingValue}>{part.value}</Text>
      {part.unit ? <Text style={styles.timingUnit}>{part.unit}</Text> : null}
    </View>
  );
}

interface BlockItemsProps {
  items: string[];
  blockIndex: number;
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
        const display = parseBlockItemForDisplay(item);
        const exerciseName = display.name || parseExerciseLabelFromBlockItem(item);
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

        const sendLabel = isUploadingThis
          ? 'Subiendo vídeo…'
          : alreadySent
            ? 'Enviar otro vídeo'
            : 'Enviar vídeo';

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
              <View style={styles.itemBullet} />
            )}
            <View style={styles.itemCopy}>
              <View style={styles.itemHeader}>
                <Pressable
                  onPress={() => {
                    if (onToggleItem && itemKey) {
                      onToggleItem(itemKey);
                    }
                  }}
                  disabled={!onToggleItem || !itemKey}
                  style={styles.itemNamePressable}
                >
                  <Text style={styles.itemName}>{display.name}</Text>
                </Pressable>
                {showVideo || canSendVideo ? (
                  <View style={styles.itemIconRow}>
                    {showVideo ? (
                      <Pressable
                        onPress={openVideo}
                        style={[styles.itemIconBtn, isActive && styles.itemIconBtnActive]}
                        accessibilityRole="button"
                        accessibilityLabel={isActive ? 'Ocultar vídeo' : 'Ver vídeo'}
                      >
                        <AppIcon name="play" size={16} color={colors.textSecondary} outlined />
                      </Pressable>
                    ) : null}
                    {canSendVideo ? (
                      <Pressable
                        onPress={() => onSendExerciseVideo?.(itemKey, exerciseName)}
                        disabled={isUploadingThis}
                        style={[styles.itemIconBtn, isUploadingThis && styles.itemIconBtnMuted]}
                        accessibilityRole="button"
                        accessibilityLabel={sendLabel}
                      >
                        <AppIcon name="camera" size={16} color={colors.textSecondary} outlined />
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
              {display.quantity || display.load ? (
                <View style={styles.itemMetrics}>
                  {display.quantity ? (
                    <Text style={styles.itemMetricText}>{display.quantity}</Text>
                  ) : null}
                  {display.load ? (
                    <Text style={styles.itemMetricText}>
                      {display.loadLabel ? `${display.loadLabel}: ` : ''}
                      {display.load}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

interface BlockCardProps extends Omit<BlockItemsProps, 'items'> {
  block: WorkoutContentBlock;
}

/** Vídeos que el entrenador ha colgado de un bloque de texto, que no tiene lista de ejercicios. */
function FreeTextVideoChips({
  videos,
  activeExerciseName,
  onExercisePress,
}: {
  videos: FreeTextBlockVideo[];
  activeExerciseName?: string;
  onExercisePress?: (
    exerciseName: string,
    aimharderEjerId?: number,
    youtubeVideoId?: string,
  ) => void;
}) {
  if (videos.length === 0) return null;

  return (
    <View style={styles.textVideos}>
      {videos.map((video, index) => {
        const label = video.label.trim() || 'Ver vídeo';
        const isActive =
          Boolean(activeExerciseName) &&
          activeExerciseName?.toLowerCase() === label.toLowerCase();

        return (
          <Pressable
            key={`${video.youtubeVideoId}-${index}`}
            onPress={() => onExercisePress?.(label, undefined, video.youtubeVideoId)}
            disabled={!onExercisePress}
            style={({ pressed }) => [
              styles.textVideoChip,
              isActive && styles.textVideoChipActive,
              pressed && styles.itemRowPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Ver vídeo de ${label}`}
          >
            <AppIcon name="play" size={14} color={colors.textSecondary} outlined />
            <Text style={styles.textVideoChipText} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Texto libre: se muestra exactamente como lo escribió el entrenador. */
function WorkoutTextCard({
  block,
  blockIndex,
  sectionKey,
  completedItems,
  onToggleItem,
  onExercisePress,
  activeExerciseName,
}: BlockCardProps) {
  const { body: text, videos } = parseFreeTextBlockContent(block.text ?? '');
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
      <FreeTextVideoChips
        videos={videos}
        activeExerciseName={activeExerciseName}
        onExercisePress={onExercisePress}
      />
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
      <BlockItems items={block.items} {...itemProps} />
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

  const { blockTitle, pillTiming } = splitBlockTimingMetadata(block.timing);
  const timingParts = parseTimingForDisplay(pillTiming, block.label);
  const pillParts = timingParts.filter((part) => part.icon !== 'info' || part.value.length <= 28);
  const instructionNotes = timingParts
    .filter((part) => part.icon === 'info' && part.value.length > 28)
    .map((part) => part.value);
  const timingHint = getBlockTimingHint(block.label);

  return (
    <View style={styles.blockCard}>
      <View style={styles.blockHeader}>
        <View style={styles.blockHeaderTop}>
          <Text style={styles.blockLabel}>{block.label}</Text>
          {blockTitle ? <Text style={styles.blockTitleText}>{blockTitle}</Text> : null}
        </View>
        {pillParts.length > 0 ? (
          <View style={styles.timingRow}>
            {pillParts.map((part, index) => (
              <TimingPartPill key={`${part.icon}-${part.value}-${index}`} part={part} />
            ))}
          </View>
        ) : null}
      </View>

      {instructionNotes.map((note, index) => (
        <Text key={`${note}-${index}`} style={styles.blockInstruction}>
          {note}
        </Text>
      ))}

      {timingHint ? <Text style={styles.timingHint}>{timingHint}</Text> : null}

      <BlockItems items={block.items} {...itemProps} />
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
  renderAfterBlock,
}: WorkoutSectionProps) {
  if (!content?.trim()) return null;

  const structured = isStructuredWorkoutContent(content);
  const blocks = structured ? parseWorkoutContent(content) : [];
  const plain = structured ? null : parseFreeTextBlockContent(content);
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
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppIcon name={icon} size={16} color={colors.textMuted} outlined />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {structured ? (
        <View style={styles.blocks}>
          {blocks.map((block, index) => {
            const blockKey = sectionKey ? `${sectionKey}:b${index}` : `b${index}`;
            return (
              <Fragment key={`${block.label}-${index}`}>
                {index > 0 ? <View style={styles.blockDivider} /> : null}
                <WorkoutBlockCard block={block} blockIndex={index} {...itemProps} />
                {renderAfterBlock ? renderAfterBlock(blockKey, index) : null}
              </Fragment>
            );
          })}
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
          <Text style={styles.paragraph}>{plain?.body ?? content}</Text>
        </Pressable>
      ) : (
        <Text style={styles.paragraph}>{plain?.body ?? content}</Text>
      )}

      {plain ? (
        <FreeTextVideoChips
          videos={plain.videos}
          activeExerciseName={activeExerciseName}
          onExercisePress={onExercisePress}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
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
  blockDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  blockCard: {
    paddingTop: spacing.xs,
  },
  blockHeader: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  blockHeaderTop: {
    gap: 2,
  },
  blockLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blockTitleText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 22,
  },
  blockInstruction: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  timingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  timingValue: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timingUnit: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '500',
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
    backgroundColor: colors.surfaceLight,
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
    minWidth: 0,
    gap: spacing.xs,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  itemNamePressable: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 22,
  },
  itemIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  itemIconBtn: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconBtnActive: {
    backgroundColor: colors.surface,
    borderColor: colors.textMuted,
  },
  itemIconBtnMuted: {
    opacity: 0.5,
  },
  itemMetrics: {
    gap: 2,
  },
  itemMetricText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  itemBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 9,
    backgroundColor: colors.textMuted,
  },
  noteCard: {
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  noteTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 22,
  },
  noteTitleWithBody: {
    marginBottom: spacing.xs,
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
  textVideos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  textVideoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    maxWidth: '100%',
  },
  textVideoChipActive: {
    backgroundColor: colors.surface,
  },
  textVideoChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    flexShrink: 1,
  },
});
