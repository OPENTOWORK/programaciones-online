import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';
import type { GymTvExerciseLine } from '@/lib/gymTvWorkout';
import { SESSION_BLOCK_SECTIONS } from '@/lib/sessionBlockSections';
import { workoutToSessionDraft } from '@/lib/trainerSessionDraft';
import {
  formatBlockItemLineForDisplay,
  getBlockTypeConfig,
  parseWorkoutBlocksFromText,
  type WorkoutBlockDraft,
} from '@/lib/workoutBlockBuilder';
import type { Workout } from '@/lib/types';

function cardBlockHeader(block: WorkoutBlockDraft) {
  const config = getBlockTypeConfig(block.type);
  return [block.title?.trim(), config.label, block.timing.trim(), block.subtitle?.trim()]
    .filter(Boolean)
    .join(' · ');
}

function tvBlockTitle(block: WorkoutBlockDraft) {
  const config = getBlockTypeConfig(block.type);
  return [block.title?.trim(), config.label, block.subtitle?.trim()].filter(Boolean).join(' · ');
}

function isTimingLine(label: string) {
  return /^\d/.test(label) && /(amrap|for time|emom|tabata|min|round|rounds|'|″|")/i.test(label);
}

export function GymTvBodyLines({
  lines,
  accent,
}: {
  lines: GymTvExerciseLine[];
  accent: string;
}) {
  return (
    <View style={styles.tvLines}>
      {lines.map((line) => (
        <View key={line.key} style={styles.tvLineRow}>
          <View style={[styles.tvLineAccent, { backgroundColor: accent }]} />
          <Text
            style={[
              styles.tvLine,
              isTimingLine(line.label) ? styles.tvLineTiming : null,
            ]}
          >
            {line.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function renderWorkoutBlocks(
  blocks: WorkoutBlockDraft[],
  {
    size = 'card',
    accent = '#FF3B30',
    activeVideoKey,
  }: {
    size?: 'card' | 'tv';
    accent?: string;
    activeVideoKey?: string;
  },
) {
  const tv = size === 'tv';

  if (blocks.length === 0) {
    return (
      <Text style={tv ? styles.tvEmpty : styles.empty}>Esta sesión todavía no tiene bloques.</Text>
    );
  }

  return (
    <View style={tv ? styles.tvWrap : styles.wrap}>
      {blocks.map((block, blockIndex) => {
            if (block.type === 'free_text') {
              return (
                <View key={`${block.id}-${blockIndex}`} style={tv ? styles.tvBlock : styles.block}>
                  {block.title?.trim() ? (
                    <Text style={tv ? styles.tvHeader : styles.blockHeader}>{block.title.trim()}</Text>
                  ) : null}
                  <Text style={tv ? styles.tvFree : styles.freeText}>{block.timing.trim()}</Text>
                </View>
              );
            }

            const lines = block.items
              .map((item, itemIndex) => ({
                item,
                itemIndex,
                line: formatBlockItemLineForDisplay(item, block.type),
              }))
              .filter((entry) => entry.line.trim());

            const blockTitle = tv ? tvBlockTitle(block) : cardBlockHeader(block);

        return (
          <View key={`${block.id}-${blockIndex}`} style={tv ? styles.tvBlock : styles.block}>
            {blockTitle ? (
              <Text style={tv ? styles.tvHeader : styles.blockHeader}>{blockTitle}</Text>
            ) : null}
            {tv && block.timing.trim() ? (
              <Text style={[styles.tvTiming, { color: accent }]}>{block.timing.trim()}</Text>
            ) : null}
            {lines.map(({ item, itemIndex, line }) => {
              const lineKey = `${block.id}-${itemIndex}`;
              const hasVideo = Boolean(item.youtubeVideoId?.trim());
              const isActive = activeVideoKey === lineKey;

              return tv ? (
                <View
                  key={lineKey}
                  style={[styles.tvLineRow, isActive && styles.tvLineRowActive]}
                >
                  <View
                    style={[
                      styles.tvLineAccent,
                      { backgroundColor: hasVideo ? accent : 'rgba(255,255,255,0.12)' },
                    ]}
                  />
                  <Text style={styles.tvItem}>{line}</Text>
                </View>
              ) : (
                <Text key={lineKey} style={styles.blockItem}>· {line}</Text>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

export function GymTvStructuredBlocks({
  content,
  size = 'tv',
  accent = '#FF3B30',
  activeVideoKey,
}: {
  content: string;
  size?: 'card' | 'tv';
  accent?: string;
  activeVideoKey?: string;
}) {
  const blocks = parseWorkoutBlocksFromText(content);
  return renderWorkoutBlocks(blocks, { size, accent, activeVideoKey });
}

export function GymTvWorkoutBlocks({
  workout,
  size = 'card',
  accent = '#FF3B30',
  activeVideoKey,
}: {
  workout: Workout;
  size?: 'card' | 'tv';
  accent?: string;
  activeVideoKey?: string;
}) {
  const draft = workoutToSessionDraft(workout);
  const blocks = SESSION_BLOCK_SECTIONS.flatMap(({ key }) => parseWorkoutBlocksFromText(draft[key]));
  return renderWorkoutBlocks(blocks, { size, accent, activeVideoKey });
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  section: {
    gap: 4,
  },
  sectionLabel: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  block: {
    gap: 2,
  },
  blockHeader: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: colors.text,
  },
  blockItem: {
    ...typography.bodySmall,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  freeText: {
    ...typography.bodySmall,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  tvWrap: {
    alignSelf: 'stretch',
    gap: 28,
  },
  tvSection: {
    gap: 18,
  },
  tvBlock: {
    gap: 12,
  },
  tvHeader: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  tvTiming: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  tvItem: {
    flex: 1,
    fontSize: 28,
    lineHeight: 36,
    color: '#E8EEF4',
    fontWeight: '700',
    textAlign: 'left',
  },
  tvFree: {
    fontSize: 24,
    lineHeight: 32,
    color: '#E8EEF4',
    textAlign: 'left',
  },
  tvLines: {
    gap: 10,
    alignSelf: 'stretch',
  },
  tvLineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 4,
    paddingRight: 8,
    borderRadius: 10,
  },
  tvLineRowActive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tvLineAccent: {
    width: 4,
    borderRadius: 999,
    alignSelf: 'stretch',
    minHeight: 28,
    marginTop: 4,
  },
  tvLine: {
    flex: 1,
    fontSize: 28,
    lineHeight: 36,
    color: '#E8EEF4',
    fontWeight: '700',
    textAlign: 'left',
  },
  tvLineTiming: {
    fontSize: 30,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tvEmpty: {
    fontSize: 24,
    color: '#9AA3AD',
    textAlign: 'left',
  },
});
