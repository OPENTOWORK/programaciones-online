import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';
import { SESSION_BLOCK_SECTIONS } from '@/lib/sessionBlockSections';
import {
  formatBlockItemLine,
  getBlockTypeConfig,
  parseWorkoutBlocksFromText,
  type WorkoutBlockDraft,
} from '@/lib/workoutBlockBuilder';
import type { SessionDraft } from '@/lib/trainerSessionDraft';

function blockHeader(block: WorkoutBlockDraft) {
  const config = getBlockTypeConfig(block.type);
  return [block.title?.trim(), config.label, block.timing.trim(), block.subtitle?.trim()]
    .filter(Boolean)
    .join(' · ');
}

export function SessionDraftSummary({ draft }: { draft: SessionDraft }) {
  const sections = SESSION_BLOCK_SECTIONS.map(({ key, label }) => ({
    label,
    blocks: parseWorkoutBlocksFromText(draft[key]),
  })).filter((section) => section.blocks.length > 0);

  if (sections.length === 0) {
    return <Text style={styles.empty}>Esta sesión todavía no tiene bloques de entrenamiento.</Text>;
  }

  return (
    <View style={styles.wrap}>
      {sections.map((section) => (
        <View key={section.label} style={styles.section}>
          <Text style={styles.sectionLabel}>{section.label}</Text>
          {section.blocks.map((block, blockIndex) => {
            if (block.type === 'free_text') {
              return (
                <View key={`${block.id}-${blockIndex}`} style={styles.block}>
                  {block.title?.trim() ? <Text style={styles.blockHeader}>{block.title.trim()}</Text> : null}
                  <Text style={styles.freeText}>{block.timing.trim()}</Text>
                </View>
              );
            }

            const lines = block.items
              .map((item) => formatBlockItemLine(item, block.type))
              .filter((line) => line.trim());

            return (
              <View key={`${block.id}-${blockIndex}`} style={styles.block}>
                <Text style={styles.blockHeader}>{blockHeader(block)}</Text>
                {lines.map((line, lineIndex) => (
                  <Text key={`${block.id}-${lineIndex}`} style={styles.blockItem}>
                    · {line}
                  </Text>
                ))}
                {block.notes?.trim() ? <Text style={styles.blockNotes}>{block.notes.trim()}</Text> : null}
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
    gap: 2,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  block: {
    gap: 1,
    marginTop: 2,
  },
  blockHeader: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  blockItem: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  blockNotes: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  freeText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  empty: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
