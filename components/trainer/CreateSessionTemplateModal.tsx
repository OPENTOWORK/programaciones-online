import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  draftToTaggedBlocks,
  getSessionSectionLabel,
  taggedBlocksToDraft,
  type TaggedWorkoutBlock,
} from '@/lib/sessionBlockSections';
import {
  canSaveSessionAsTemplate,
  describeSessionTemplate,
  sessionDraftToTemplateContent,
} from '@/lib/sessionTemplates';
import {
  buildSessionTemplateName,
  SESSION_TEMPLATE_FORMAT_TAGS,
  SESSION_TEMPLATE_MODALITY_TAGS,
  SESSION_TEMPLATE_ZONE_TAGS,
  type SessionTemplateFormatTag,
  type SessionTemplateModalityTag,
  type SessionTemplateTag,
} from '@/lib/sessionTemplateTags';
import { inferSessionTemplateModality } from '@/lib/sessionTemplateModality';
import type { SessionDraft } from '@/lib/trainerSessionDraft';
import {
  formatBlockItemLineForDisplay,
  getBlockTypeConfig,
  type WorkoutBlockItemDraft,
} from '@/lib/workoutBlockBuilder';

interface CreateSessionTemplateModalProps {
  visible: boolean;
  draft: SessionDraft | null;
  saving?: boolean;
  defaultModality?: SessionTemplateModalityTag | null;
  onClose: () => void;
  onConfirm: (input: {
    name: string;
    content: string;
    tag: SessionTemplateTag;
    formatTag: SessionTemplateFormatTag | null;
    modalityTag: SessionTemplateModalityTag | null;
  }) => void;
}

function blockTitle(block: TaggedWorkoutBlock) {
  const config = getBlockTypeConfig(block.type);
  if (block.type === 'free_text') {
    return block.title?.trim() || 'Texto libre';
  }
  return [block.title?.trim(), config.label, block.timing.trim()].filter(Boolean).join(' · ');
}

function selectableItems(block: TaggedWorkoutBlock) {
  if (block.type === 'free_text') return [] as WorkoutBlockItemDraft[];
  return block.items.filter((item) => item.text.trim());
}

/** Bloques sin ejercicios (p. ej. Tabata solo con timing) se eligen enteros, como el texto libre. */
function isWholeBlockSelection(block: TaggedWorkoutBlock) {
  return block.type === 'free_text' || selectableItems(block).length === 0;
}

function buildTemplateDraft(
  blocks: TaggedWorkoutBlock[],
  selectedBlockIds: Set<string>,
  selectedItemIds: Set<string>,
  base: SessionDraft,
): SessionDraft {
  const selectedBlocks: TaggedWorkoutBlock[] = [];

  for (const block of blocks) {
    if (isWholeBlockSelection(block)) {
      if (selectedBlockIds.has(block.id)) selectedBlocks.push(block);
      continue;
    }

    const items = selectableItems(block).filter((item) => selectedItemIds.has(item.id));
    if (items.length === 0) continue;
    selectedBlocks.push({ ...block, items });
  }

  return taggedBlocksToDraft(
    selectedBlocks,
    new Set(selectedBlocks.map((block) => block.id)),
    { ...base, name: base.name, estimatedDuration: '' },
    { preserveSections: true },
  );
}

export function CreateSessionTemplateModal({
  visible,
  draft,
  saving = false,
  defaultModality = null,
  onClose,
  onConfirm,
}: CreateSessionTemplateModalProps) {
  const blocks = useMemo(() => (draft ? draftToTaggedBlocks(draft) : []), [draft]);
  const [tag, setTag] = useState<SessionTemplateTag | null>(null);
  const [formatTag, setFormatTag] = useState<SessionTemplateFormatTag | null>(null);
  const [modalityTag, setModalityTag] = useState<SessionTemplateModalityTag | null>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(() => new Set());
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!visible || !draft) return;
    setTag(draft.kind === 'metcon' ? 'Metcon' : draft.kind === 'activation' ? 'All' : null);
    setFormatTag(null);
    setModalityTag(defaultModality);
    setSelectedBlockIds(new Set());
    setSelectedItemIds(new Set());
  }, [draft, visible, defaultModality]);

  const grouped = useMemo(() => {
    const map = new Map<string, TaggedWorkoutBlock[]>();
    for (const block of blocks) {
      const label = getSessionSectionLabel(block.section);
      const list = map.get(label) ?? [];
      list.push(block);
      map.set(label, list);
    }
    return [...map.entries()];
  }, [blocks]);

  const selectedExerciseCount = selectedItemIds.size;
  const selectedFreeTextCount = selectedBlockIds.size;
  const selectedCount = selectedExerciseCount + selectedFreeTextCount;
  const canSave = Boolean(draft && tag && selectedCount > 0 && !saving);

  const isBlockChecked = (block: TaggedWorkoutBlock) => {
    if (isWholeBlockSelection(block)) return selectedBlockIds.has(block.id);
    const items = selectableItems(block);
    return items.length > 0 && items.every((item) => selectedItemIds.has(item.id));
  };

  const isBlockPartial = (block: TaggedWorkoutBlock) => {
    if (isWholeBlockSelection(block)) return false;
    const items = selectableItems(block);
    const selected = items.filter((item) => selectedItemIds.has(item.id)).length;
    return selected > 0 && selected < items.length;
  };

  const toggleBlock = (block: TaggedWorkoutBlock) => {
    if (isWholeBlockSelection(block)) {
      setSelectedBlockIds((current) => {
        const next = new Set(current);
        if (next.has(block.id)) next.delete(block.id);
        else next.add(block.id);
        return next;
      });
      return;
    }

    const items = selectableItems(block);
    const allSelected = items.every((item) => selectedItemIds.has(item.id));
    setSelectedItemIds((current) => {
      const next = new Set(current);
      for (const item of items) {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  };

  const toggleItem = (itemId: string) => {
    setSelectedItemIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const selectAll = () => {
    const nextBlocks = new Set<string>();
    const nextItems = new Set<string>();
    for (const block of blocks) {
      if (isWholeBlockSelection(block)) {
        nextBlocks.add(block.id);
        continue;
      }
      for (const item of selectableItems(block)) nextItems.add(item.id);
    }
    setSelectedBlockIds(nextBlocks);
    setSelectedItemIds(nextItems);
  };

  const selectNone = () => {
    setSelectedBlockIds(new Set());
    setSelectedItemIds(new Set());
  };

  const handleConfirm = () => {
    if (!draft || !tag || !canSave) return;
    const content = sessionDraftToTemplateContent(
      buildTemplateDraft(blocks, selectedBlockIds, selectedItemIds, {
        ...draft,
        name: formatTag === 'Activación' ? 'Activación' : tag,
        ...(formatTag === 'Activación' ? { kind: 'activation' as const } : {}),
      }),
    );
    const exerciseHint = describeSessionTemplate(content).exerciseLines[0] ?? null;
    const resolvedModality =
      modalityTag ??
      (tag === 'Metcon' ? inferSessionTemplateModality({ name: tag, content, tag }) : null);
    const name = buildSessionTemplateName({ tag, formatTag, modalityTag: resolvedModality, exerciseHint });
    onConfirm({ name, content, tag, formatTag, modalityTag: resolvedModality });
  };

  const selectionLabel = [
    selectedExerciseCount > 0
      ? `${selectedExerciseCount} ejercicio${selectedExerciseCount === 1 ? '' : 's'}`
      : null,
    selectedFreeTextCount > 0
      ? `${selectedFreeTextCount} bloque${selectedFreeTextCount === 1 ? '' : 's'} de texto`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={saving ? undefined : onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Crear plantilla</Text>
          <Text style={styles.subtitle}>
            Elige zona, formato, modalidad (opcional) y los ejercicios o bloques a guardar.
          </Text>

          <Text style={styles.tagLabel}>Zona</Text>
          <View style={styles.tagRow}>
            {SESSION_TEMPLATE_ZONE_TAGS.map((option) => {
              const selected = tag === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setTag(option)}
                  style={({ pressed }) => [
                    styles.tagChip,
                    selected && styles.tagChipSelected,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.tagLabel}>Formato</Text>
          <View style={styles.tagRow}>
            {SESSION_TEMPLATE_FORMAT_TAGS.map((option) => {
              const selected = formatTag === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setFormatTag(selected ? null : option)}
                  style={({ pressed }) => [
                    styles.tagChip,
                    selected && styles.tagChipSelected,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.tagLabel}>Modalidad</Text>
          <View style={styles.tagRow}>
            {SESSION_TEMPLATE_MODALITY_TAGS.map((option) => {
              const selected = modalityTag === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setModalityTag(selected ? null : option)}
                  style={({ pressed }) => [
                    styles.tagChip,
                    selected && styles.tagChipSelected,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {!draft || !canSaveSessionAsTemplate(draft) || blocks.length === 0 ? (
            <Text style={styles.hint}>Esta sesión no tiene bloques ni ejercicios para guardar.</Text>
          ) : (
            <>
              <View style={styles.selectionBar}>
                <Text style={styles.selectionCount}>
                  {selectedCount === 0 ? 'Nada seleccionado' : selectionLabel}
                </Text>
                <View style={styles.selectionActions}>
                  <Pressable onPress={selectAll} hitSlop={8}>
                    <Text style={styles.selectionLink}>Todos</Text>
                  </Pressable>
                  <Pressable onPress={selectNone} hitSlop={8}>
                    <Text style={styles.selectionLink}>Ninguno</Text>
                  </Pressable>
                </View>
              </View>

              <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {grouped.map(([sectionLabel, sectionBlocks]) => (
                  <View key={sectionLabel} style={styles.section}>
                    <Text style={styles.sectionLabel}>{sectionLabel}</Text>
                    {sectionBlocks.map((block) => {
                      const checked = isBlockChecked(block);
                      const partial = isBlockPartial(block);
                      const items = selectableItems(block);
                      const iconName = checked
                        ? 'checkbox'
                        : partial
                          ? 'checkbox-outline'
                          : 'square-outline';

                      return (
                        <View
                          key={block.id}
                          style={[
                            styles.blockCard,
                            (checked || partial) && styles.blockCardChecked,
                          ]}
                        >
                          <Pressable
                            onPress={() => toggleBlock(block)}
                            style={({ pressed }) => [
                              styles.blockRow,
                              pressed && styles.rowPressed,
                            ]}
                          >
                            <Ionicons
                              name={iconName}
                              size={22}
                              color={checked || partial ? colors.accent : colors.textMuted}
                            />
                            <View style={styles.blockCopy}>
                              <Text style={styles.blockTitle} numberOfLines={2}>
                                {blockTitle(block)}
                              </Text>
                              {block.type === 'free_text' && block.timing.trim() ? (
                                <Text style={styles.blockPreview} numberOfLines={2}>
                                  {block.timing.trim()}
                                </Text>
                              ) : null}
                            </View>
                          </Pressable>

                          {items.map((item) => {
                            const itemChecked = selectedItemIds.has(item.id);
                            const line = formatBlockItemLineForDisplay(item, block.type);
                            return (
                              <Pressable
                                key={item.id}
                                onPress={() => toggleItem(item.id)}
                                style={({ pressed }) => [
                                  styles.itemRow,
                                  itemChecked && styles.itemRowChecked,
                                  pressed && styles.rowPressed,
                                ]}
                              >
                                <Ionicons
                                  name={itemChecked ? 'checkbox' : 'square-outline'}
                                  size={18}
                                  color={itemChecked ? colors.accent : colors.textMuted}
                                />
                                <Text style={styles.itemText} numberOfLines={2}>
                                  {line || item.text.trim()}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.actions}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={onClose}
              disabled={saving}
              style={styles.actionBtn}
            />
            <Button
              title="Guardar plantilla"
              onPress={handleConfirm}
              loading={saving}
              disabled={!canSave}
              style={styles.actionBtn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tagLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  tagChipSelected: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  tagChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tagChipTextSelected: {
    color: colors.accent,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  selectionCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    flex: 1,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectionLink: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  list: {
    maxHeight: 360,
  },
  section: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  blockCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  blockCardChecked: {
    borderColor: withAlpha(colors.accent, '88'),
    backgroundColor: withAlpha(colors.accent, '08'),
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  blockCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  blockTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 18,
  },
  blockPreview: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
    paddingLeft: spacing.lg + spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  itemRowChecked: {
    backgroundColor: withAlpha(colors.accent, '12'),
  },
  itemText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 16,
  },
  rowPressed: {
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});
