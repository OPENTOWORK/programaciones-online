import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';
import { SESSION_BLOCK_SECTIONS } from '@/lib/sessionBlockSections';
import {
  formatBlockItemLineForDisplay,
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

export function SessionDraftSummary({
  draft,
  hideSectionLabels = false,
}: {
  draft: SessionDraft;
  /** Oculta etiquetas tipo «Parte principal» (p. ej. cuadrícula Metcon). */
  hideSectionLabels?: boolean;
}) {
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
          {hideSectionLabels ? null : <Text style={styles.sectionLabel}>{section.label}</Text>}
          {section.blocks.map((block, blockIndex) => {
            const blockStyle = blockIndex > 0 ? [styles.block, styles.blockAfterTitle] : styles.block;
            if (block.type === 'free_text') {
              return (
                <View key={`${block.id}-${blockIndex}`} style={blockStyle}>
                  {block.title?.trim() ? <Text style={styles.blockHeader}>{block.title.trim()}</Text> : null}
                  <Text style={styles.freeText}>{block.timing.trim()}</Text>
                </View>
              );
            }

            const lines = block.items
              .map((item) => formatBlockItemLineForDisplay(item, block.type))
              .filter((line) => line.trim());

            return (
              <View key={`${block.id}-${blockIndex}`} style={blockStyle}>
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
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.accentVivid,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  block: {
    gap: spacing.xs,
  },
  blockAfterTitle: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  blockHeader: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  blockItem: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
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
