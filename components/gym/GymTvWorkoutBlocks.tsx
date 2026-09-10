import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';
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

export function GymTvWorkoutBlocks({
  workout,
  size = 'card',
}: {
  workout: Workout;
  size?: 'card' | 'tv';
}) {
  const draft = workoutToSessionDraft(workout);
  const sections = SESSION_BLOCK_SECTIONS.map(({ key, label }) => ({
    label,
    blocks: parseWorkoutBlocksFromText(draft[key]),
  })).filter((section) => section.blocks.length > 0);
  const tv = size === 'tv';

  if (sections.length === 0) {
    return (
      <Text style={tv ? styles.tvEmpty : styles.empty}>Esta sesión todavía no tiene bloques.</Text>
    );
  }

  return (
    <View style={tv ? styles.tvWrap : styles.wrap}>
      {sections.map((section) => (
        <View key={section.label} style={tv ? styles.tvSection : styles.section}>
          {tv ? null : <Text style={styles.sectionLabel}>{section.label}</Text>}
          {section.blocks.map((block, blockIndex) => {
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
              .map((item) => formatBlockItemLineForDisplay(item, block.type))
              .filter((line) => line.trim());

            return (
              <View key={`${block.id}-${blockIndex}`} style={tv ? styles.tvBlock : styles.block}>
                <Text style={tv ? styles.tvHeader : styles.blockHeader}>
                  {tv ? tvBlockTitle(block) : cardBlockHeader(block)}
                </Text>
                {tv && block.timing.trim() ? (
                  <Text style={styles.tvTiming}>{block.timing.trim()}</Text>
                ) : null}
                {lines.map((line, lineIndex) => (
                  <Text key={`${block.id}-${lineIndex}`} style={tv ? styles.tvItem : styles.blockItem}>
                    {tv ? line : `· ${line}`}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 28,
    justifyContent: 'center',
  },
  tvSection: {
    gap: 18,
    minWidth: 280,
    maxWidth: 520,
    flexGrow: 1,
  },
  tvBlock: {
    gap: 10,
  },
  tvHeader: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tvTiming: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tvItem: {
    fontSize: 26,
    lineHeight: 34,
    color: '#E8EEF4',
    fontWeight: '600',
  },
  tvFree: {
    fontSize: 24,
    lineHeight: 32,
    color: '#E8EEF4',
  },
  tvEmpty: {
    fontSize: 24,
    color: '#9AA3AD',
  },
});
