import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Platform,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { getBlockAccent } from '@/lib/workoutContentParser';
import {
  blockUsesSeries,
  canConfirmWorkoutBlock,
  createEmptyBlock,
  createEmptyBlockItem,
  formatBlockItemLine,
  getBlockTypeConfig,
  getMovementLoadMetric,
  getMovementLoadMetricLabel,
  getMovementLoadValue,
  MOVEMENT_LOAD_METRICS,
  movementLoadPlaceholder,
  getWorkoutBlockSummary,
  sanitizeWorkoutBlock,
  WORKOUT_BLOCK_TYPES,
  type WorkoutBlockType,
} from '@/lib/workoutBlockBuilder';
import type { MovementLoadMetric, WorkoutBlockItemDraft } from '@/lib/workoutBlockBuilder';
import {
  draftSectionFingerprint,
  draftToTaggedBlocks,
  taggedBlocksToDraft,
  type TaggedWorkoutBlock,
} from '@/lib/sessionBlockSections';
import type { SessionDraft } from '@/lib/trainerSessionDraft';

const CONFIRM_GREEN = '#4ADE80';

interface WorkoutBlocksEditorProps {
  draft: SessionDraft;
  onChange: (draft: SessionDraft) => void;
  hideConfirmedBlocks?: boolean;
  onPendingBlocksChange?: (hasPending: boolean) => void;
}

function TypePickerModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: WorkoutBlockType) => void;
}) {
  const { width } = useWindowDimensions();
  const columns = width >= 640 ? 3 : 2;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.typeModalRoot}>
        <Pressable style={styles.typeModalBackdrop} onPress={onClose} accessibilityLabel="Cerrar" />
        <View style={styles.typeModalCard}>
          <Text style={styles.typeModalTitle}>Selecciona el tipo de entrenamiento</Text>
          <View style={styles.typeGrid}>
            {WORKOUT_BLOCK_TYPES.map((entry) => {
              const accent = getBlockAccent(entry.label);
              return (
                <Pressable
                  key={entry.type}
                  onPress={() => {
                    onSelect(entry.type);
                    onClose();
                  }}
                  style={[
                    styles.typeOption,
                    { width: `${100 / columns - 2}%`, borderColor: accent.border, backgroundColor: accent.bg },
                  ]}
                >
                  <Text style={[styles.typeOptionText, { color: accent.text }]}>{entry.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SavedBlockCard({
  block,
  index,
  onEdit,
  onRemove,
}: {
  block: TaggedWorkoutBlock;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const config = getBlockTypeConfig(block.type);
  const accent = getBlockAccent(config.label);
  const movements = block.items
    .map((item) => formatBlockItemLine(item, block.type))
    .filter(Boolean);
  const freeText = block.type === 'free_text' ? block.timing.trim() : '';

  return (
    <Card style={StyleSheet.flatten([styles.blockCard, styles.savedBlockCard, { borderColor: `${CONFIRM_GREEN}55` }])}>
      <View style={styles.blockHeader}>
        <View style={styles.savedBlockTags}>
          <Text style={styles.blockIndex}>{index + 1}</Text>
          <View style={[styles.typeChip, { backgroundColor: `${accent.text}18` }]}>
            <Text style={[styles.typeChipText, { color: accent.text }]}>{config.label}</Text>
          </View>
          {block.title?.trim() ? <Text style={styles.blockTitleText}>{block.title.trim()}</Text> : null}
        </View>
        <View style={styles.savedHeaderActions}>
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark-circle" size={18} color={CONFIRM_GREEN} />
          </View>
          <Pressable onPress={onEdit} hitSlop={8} accessibilityLabel="Editar bloque">
            <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="Quitar bloque">
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      <Text style={styles.savedSummary}>{getWorkoutBlockSummary(block)}</Text>
      {freeText ? (
        <Text style={styles.savedFreeText} numberOfLines={4}>
          {freeText}
        </Text>
      ) : null}
      {!freeText && movements.length > 0 ? (
        <View style={styles.savedMovements}>
          {movements.slice(0, 5).map((movement) => (
            <Text key={movement} style={styles.savedMovementLine} numberOfLines={1}>
              • {movement}
            </Text>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function MovementRow({
  item,
  blockType,
  accentText,
  onUpdate,
  onRemove,
}: {
  item: WorkoutBlockItemDraft;
  blockType: WorkoutBlockType;
  accentText: string;
  onUpdate: (patch: Partial<WorkoutBlockItemDraft>) => void;
  onRemove: () => void;
}) {
  const usesSeries = blockUsesSeries(blockType);
  const loadMetric = getMovementLoadMetric(item);

  const setLoadMetric = (metric: MovementLoadMetric) => {
    onUpdate({
      loadMetric: metric,
      weightKg: metric === 'kg' ? item.weightKg ?? '' : '',
      calories: metric === 'cal' ? item.calories ?? '' : '',
      distance: metric === 'distance' ? item.distance ?? '' : '',
    });
  };

  const setLoadValue = (value: string) => {
    const metric = getMovementLoadMetric(item);
    onUpdate({
      weightKg: metric === 'kg' ? value : '',
      calories: metric === 'cal' ? value : '',
      distance: metric === 'distance' ? value : '',
    });
  };

  return (
    <View style={styles.movementRow}>
      <View style={styles.movementNameRow}>
        <Text style={[styles.itemBullet, { color: accentText }]}>•</Text>
        <TextInput
          value={item.text}
          onChangeText={(text) => onUpdate({ text, aimharderEjerId: undefined })}
          placeholder="Ej. Deadlift"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.itemNameInput]}
        />
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="Quitar ejercicio">
          <Ionicons name="close-circle-outline" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.movementMetricsRow}>
        {usesSeries ? (
          <>
            <View style={styles.metricField}>
              <Text style={styles.metricLabel}>Series</Text>
              <TextInput
                value={item.sets ?? ''}
                onChangeText={(sets) => onUpdate({ sets })}
                placeholder="3"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[styles.input, styles.metricInput]}
              />
            </View>
            <View style={styles.metricField}>
              <Text style={styles.metricLabel}>Reps</Text>
              <TextInput
                value={item.reps ?? ''}
                onChangeText={(reps) => onUpdate({ reps })}
                placeholder="10"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.metricInput]}
              />
            </View>
          </>
        ) : (
          <View style={styles.quantityField}>
            <Text style={styles.metricLabel}>Cantidad</Text>
            <TextInput
              value={item.reps ?? ''}
              onChangeText={(reps) => onUpdate({ reps })}
              placeholder="10"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.quantityInput]}
            />
          </View>
        )}

        <View style={styles.loadMetricField}>
          <Text style={styles.metricLabel}>Carga</Text>
          <View style={styles.loadMetricPicker}>
            {MOVEMENT_LOAD_METRICS.map((metric) => {
              const active = loadMetric === metric;
              return (
                <Pressable
                  key={metric}
                  onPress={() => setLoadMetric(metric)}
                  style={[styles.loadMetricBtn, active && styles.loadMetricBtnActive]}
                >
                  <Text style={[styles.loadMetricBtnText, active && styles.loadMetricBtnTextActive]}>
                    {metric === 'none' ? '—' : getMovementLoadMetricLabel(metric)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {loadMetric !== 'none' ? (
          <View style={styles.loadValueField}>
            <Text style={styles.metricLabel}>
              {loadMetric === 'kg' ? 'Kg' : loadMetric === 'cal' ? 'Cal' : 'Distancia'}
            </Text>
            <TextInput
              value={getMovementLoadValue(item)}
              onChangeText={setLoadValue}
              placeholder={movementLoadPlaceholder(loadMetric)}
              placeholderTextColor={colors.textMuted}
              keyboardType={loadMetric === 'distance' ? 'default' : 'decimal-pad'}
              style={[styles.input, styles.loadValueInput]}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function EditingBlockCard({
  block,
  index,
  onUpdate,
  onConfirm,
  onRemove,
  canConfirm,
}: {
  block: TaggedWorkoutBlock;
  index: number;
  onUpdate: (patch: Partial<TaggedWorkoutBlock>) => void;
  onConfirm: () => void;
  onRemove: () => void;
  canConfirm: boolean;
}) {
  const config = getBlockTypeConfig(block.type);
  const accent = getBlockAccent(config.label);

  const updateItem = (itemId: string, patch: Partial<WorkoutBlockItemDraft>) => {
    onUpdate({
      items: block.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    });
  };

  const addItem = () => {
    onUpdate({ items: [...block.items, createEmptyBlockItem()] });
  };

  const removeItem = (itemId: string) => {
    onUpdate({ items: block.items.filter((item) => item.id !== itemId) });
  };

  return (
    <Card style={StyleSheet.flatten([styles.blockCard, styles.editingBlockCard, { borderColor: accent.border }])}>
      <View style={styles.blockHeader}>
        <View style={styles.editingBlockTitleRow}>
          <Text style={styles.blockIndex}>{index + 1}</Text>
          <View style={[styles.typeChip, { backgroundColor: `${accent.text}18` }]}>
            <Text style={[styles.typeChipText, { color: accent.text }]}>{config.label}</Text>
          </View>
        </View>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="Quitar bloque">
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>

      {block.type === 'free_text' ? (
        <View style={styles.freeTextField}>
          <Text style={styles.fieldLabel}>Texto libre</Text>
          <TextInput
            value={block.timing}
            onChangeText={(timing) => onUpdate({ timing })}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            placeholder="Escribe aquí el contenido del bloque…"
            placeholderTextColor={colors.textMuted}
            style={styles.freeTextInput}
          />
        </View>
      ) : (
        <>
          <View style={styles.blockMetaRow}>
            <View style={styles.blockMetaField}>
              <Text style={styles.fieldLabel}>Nombre del bloque</Text>
              <TextInput
                value={block.title ?? ''}
                onChangeText={(title) => onUpdate({ title })}
                placeholder="Opcional"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
            <View style={styles.blockMetaField}>
              <Text style={styles.fieldLabel}>{config.timingLabel}</Text>
              <TextInput
                value={block.timing}
                onChangeText={(timing) => onUpdate({ timing })}
                placeholder={config.timingPlaceholder}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
            {config.subtitleLabel ? (
              <View style={styles.blockMetaField}>
                <Text style={styles.fieldLabel}>{config.subtitleLabel}</Text>
                <TextInput
                  value={block.subtitle ?? ''}
                  onChangeText={(subtitle) => onUpdate({ subtitle })}
                  placeholder={config.subtitlePlaceholder}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.notesField}>
            <Text style={styles.fieldLabel}>Notas</Text>
            <TextInput
              value={block.notes ?? ''}
              onChangeText={(notes) => onUpdate({ notes })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholder="Instrucciones, TC, escalado…"
              placeholderTextColor={colors.textMuted}
              style={styles.notesInput}
            />
          </View>

          <Text style={styles.itemsLabel}>Ejercicios</Text>
          {block.items.length === 0 ? (
            <Text style={styles.emptyItems}>Sin ejercicios. Pulsa «Añadir ejercicio».</Text>
          ) : null}
          {block.items.map((item) => (
            <MovementRow
              key={item.id}
              item={item}
              blockType={block.type}
              accentText={accent.text}
              onUpdate={(patch) => updateItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
            />
          ))}

          <Button
            title="Añadir ejercicio"
            variant="ghost"
            onPress={addItem}
            style={styles.addItemBtn}
            textStyle={StyleSheet.flatten([styles.addItemBtnText, { color: accent.text }])}
          />
        </>
      )}

      <View style={styles.confirmFooter}>
        <Pressable
          onPress={onConfirm}
          disabled={!canConfirm}
          accessibilityLabel="Guardar bloque"
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
        >
          <Ionicons name="checkmark" size={22} color={canConfirm ? '#0B1A10' : colors.textMuted} />
        </Pressable>
      </View>
    </Card>
  );
}

function confirmedIdsFromBlocks(blocks: TaggedWorkoutBlock[]) {
  return new Set(blocks.map((block) => block.id));
}

export function WorkoutBlocksEditor({
  draft,
  onChange,
  hideConfirmedBlocks = false,
  onPendingBlocksChange,
}: WorkoutBlocksEditorProps) {
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [blocks, setBlocks] = useState<TaggedWorkoutBlock[]>(() => draftToTaggedBlocks(draft));
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(() => confirmedIdsFromBlocks(draftToTaggedBlocks(draft)));
  const lastSerializedRef = useRef(draftSectionFingerprint(draft));

  useEffect(() => {
    const fingerprint = draftSectionFingerprint(draft);
    if (fingerprint === lastSerializedRef.current) return;
    const parsed = draftToTaggedBlocks(draft);
    setBlocks(parsed);
    setConfirmedIds(confirmedIdsFromBlocks(parsed));
    lastSerializedRef.current = fingerprint;
  }, [draft]);

  useEffect(() => {
    onPendingBlocksChange?.(blocks.some((block) => !confirmedIds.has(block.id)));
  }, [blocks, confirmedIds, onPendingBlocksChange]);

  const pushConfirmed = (nextBlocks: TaggedWorkoutBlock[], nextConfirmed: Set<string>) => {
    const nextDraft = taggedBlocksToDraft(nextBlocks, nextConfirmed, draft);
    lastSerializedRef.current = draftSectionFingerprint(nextDraft);
    onChange(nextDraft);
  };

  const updateEditingBlock = (blockId: string, patch: Partial<TaggedWorkoutBlock>) => {
    setBlocks((current) => current.map((block) => (block.id === blockId ? { ...block, ...patch } : block)));
  };

  const confirmBlock = (blockId: string) => {
    const block = blocks.find((entry) => entry.id === blockId);
    if (!block || !canConfirmWorkoutBlock(block)) return;

    const sanitized: TaggedWorkoutBlock = { ...sanitizeWorkoutBlock(block), section: 'main' };
    const nextBlocks = blocks.map((entry) => (entry.id === blockId ? sanitized : entry));
    const nextConfirmed = new Set(confirmedIds);
    nextConfirmed.add(blockId);

    setBlocks(nextBlocks);
    setConfirmedIds(nextConfirmed);
    pushConfirmed(nextBlocks, nextConfirmed);
  };

  const editBlock = (blockId: string) => {
    const block = blocks.find((entry) => entry.id === blockId);
    if (!block) return;

    const forEdit =
      block.type === 'free_text' || block.items.length > 0
        ? block
        : { ...block, items: [createEmptyBlockItem()] };
    const nextBlocks = blocks.map((entry) => (entry.id === blockId ? forEdit : entry));
    const nextConfirmed = new Set(confirmedIds);
    nextConfirmed.delete(blockId);

    setBlocks(nextBlocks);
    setConfirmedIds(nextConfirmed);
    pushConfirmed(nextBlocks, nextConfirmed);
  };

  const removeBlock = (blockId: string) => {
    const nextBlocks = blocks.filter((block) => block.id !== blockId);
    const nextConfirmed = new Set(confirmedIds);
    nextConfirmed.delete(blockId);

    setBlocks(nextBlocks);
    setConfirmedIds(nextConfirmed);
    pushConfirmed(nextBlocks, nextConfirmed);
  };

  const addBlock = (type: WorkoutBlockType) => {
    setBlocks((current) => [...current, { ...createEmptyBlock(type), section: 'main' }]);
  };

  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionLabel}>Bloques de entrenamiento</Text>
          <Text style={styles.sectionHint}>Añade bloques en orden, como en AimHarder.</Text>
        </View>
      </View>

      <Button
        title="+ Añadir bloque"
        onPress={() => setTypePickerOpen(true)}
        style={styles.addBlockMainBtn}
      />

      <TypePickerModal
        visible={typePickerOpen}
        onClose={() => setTypePickerOpen(false)}
        onSelect={addBlock}
      />

      {blocks.length > 0 ? (
        <View style={styles.blockList}>
          {blocks.map((block, index) => {
            const isConfirmed = confirmedIds.has(block.id);
            return isConfirmed ? (
              <SavedBlockCard
                key={block.id}
                block={block}
                index={index}
                onEdit={() => editBlock(block.id)}
                onRemove={() => removeBlock(block.id)}
              />
            ) : (
              <EditingBlockCard
                key={block.id}
                block={block}
                index={index}
                onUpdate={(patch) => updateEditingBlock(block.id, patch)}
                onConfirm={() => confirmBlock(block.id)}
                onRemove={() => removeBlock(block.id)}
                canConfirm={canConfirmWorkoutBlock(block)}
              />
            );
          })}
        </View>
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="layers-outline" size={22} color={colors.textMuted} />
          <Text style={styles.emptySectionText}>
            Sin bloques todavía. Pulsa «+ Añadir bloque» y elige el tipo de entrenamiento.
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    padding: spacing.lg,
    gap: spacing.md,
    overflow: 'visible',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  sectionAccent: {
    width: 3,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
  sectionHeaderText: {
    flex: 1,
    gap: 2,
  },
  sectionLabel: {
    ...typography.h3,
    color: colors.text,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  addBlockMainBtn: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  typeModalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  typeModalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  typeModalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: '80%',
  },
  typeModalTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  typeOption: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  typeOptionText: {
    ...typography.bodySmall,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: `${colors.surfaceLight}66`,
  },
  emptySectionText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
  },
  blockList: {
    gap: spacing.sm,
  },
  blockCard: {
    padding: spacing.md,
  },
  savedBlockCard: {
    backgroundColor: colors.background,
  },
  editingBlockCard: {
    backgroundColor: colors.background,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  blockIndex: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    width: 18,
    textAlign: 'center',
  },
  editingBlockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    flex: 1,
  },
  savedBlockTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    flex: 1,
  },
  blockTitleText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  savedHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedSummary: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  savedMovements: {
    gap: 2,
  },
  savedMovementLine: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  savedFreeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  typeChip: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  typeChipText: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  blockMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  blockMetaField: {
    flex: 1,
    minWidth: 120,
  },
  notesField: {
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 14,
    minHeight: 72,
    lineHeight: 20,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
    minHeight: 38,
  },
  freeTextField: {
    marginTop: spacing.xs,
  },
  freeTextInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 14,
    minHeight: 160,
    lineHeight: 20,
  },
  itemsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptyItems: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  movementRow: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  movementNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemNameInput: {
    flex: 1,
    minWidth: 120,
  },
  movementMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingLeft: 18,
    alignItems: 'flex-end',
  },
  itemBullet: {
    ...typography.body,
    fontWeight: '700',
    width: 12,
    textAlign: 'center',
  },
  metricField: {
    width: 64,
  },
  quantityField: {
    width: 88,
  },
  loadMetricField: {
    flex: 1,
    minWidth: 140,
  },
  loadValueField: {
    width: 80,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  metricInput: {
    minHeight: 36,
    paddingVertical: 6,
    textAlign: 'center',
  },
  quantityInput: {
    minHeight: 36,
    paddingVertical: 6,
  },
  loadValueInput: {
    minHeight: 36,
    paddingVertical: 6,
  },
  loadMetricPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  loadMetricBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  loadMetricBtnActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}18`,
  },
  loadMetricBtnText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  loadMetricBtnTextActive: {
    color: colors.text,
  },
  addItemBtn: {
    alignSelf: 'flex-start',
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  addItemBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  confirmFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  confirmBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: CONFIRM_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
