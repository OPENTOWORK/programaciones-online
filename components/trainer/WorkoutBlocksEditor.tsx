import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Platform,
  type GestureResponderHandlers,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ExerciseNamePickerModal } from '@/components/trainer/ExerciseNamePickerModal';
import { ExerciseVideoPickerModal } from '@/components/trainer/ExerciseVideoPickerModal';
import { borderRadius, colors, shadows, spacing, typography, withAlpha } from '@/constants/theme';
import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import {
  parseFreeTextBlockContent,
  serializeFreeTextBlockContent,
  type FreeTextBlockVideo,
} from '@/lib/freeTextBlockVideos';
import { getBlockAccent } from '@/lib/workoutContentParser';
import {
  blockUsesSeries,
  canConfirmWorkoutBlock,
  createEmptyBlock,
  createEmptyBlockItem,
  formatBlockItemLine,
  formatTimingDuration,
  getBlockTypeConfig,
  getMovementLoadMetric,
  getMovementLoadMetricLabel,
  getMovementLoadValue,
  MOVEMENT_PRIMARY_LOAD_METRICS,
  movementLoadPlaceholder,
  getWorkoutBlockSummary,
  parseTimingDuration,
  sanitizeWorkoutBlock,
  usesTimingDurationPicker,
  WORKOUT_BLOCK_TYPES,
  type WorkoutBlockType,
} from '@/lib/workoutBlockBuilder';
import type { MovementLoadMetric, TimingUnit, WorkoutBlockItemDraft } from '@/lib/workoutBlockBuilder';
import {
  draftSectionFingerprint,
  draftToTaggedBlocks,
  taggedBlocksToDraft,
  type TaggedWorkoutBlock,
} from '@/lib/sessionBlockSections';
import type { SessionDraft } from '@/lib/trainerSessionDraft';

const CONFIRM_GREEN = '#4ADE80';

const TIMING_UNITS: TimingUnit[] = ['min', 'sec'];

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

function DragHandle({ handlers }: { handlers?: GestureResponderHandlers }) {
  if (!handlers) return null;

  return (
    <View
      {...handlers}
      style={styles.dragHandle}
      accessibilityLabel="Arrastra para cambiar el orden del bloque"
    >
      <Ionicons name="reorder-three-outline" size={20} color={colors.textMuted} />
    </View>
  );
}

function SavedBlockCard({
  block,
  index,
  dragHandlers,
  onEdit,
  onRemove,
}: {
  block: TaggedWorkoutBlock;
  index: number;
  dragHandlers?: GestureResponderHandlers;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const config = getBlockTypeConfig(block.type);
  const accent = getBlockAccent(config.label);
  const movements = block.items
    .map((item) => formatBlockItemLine(item, block.type))
    .filter(Boolean);
  const freeTextContent =
    block.type === 'free_text' ? parseFreeTextBlockContent(block.timing) : null;
  const freeText = freeTextContent?.body.trim() ?? '';
  const freeTextVideos = freeTextContent?.videos ?? [];

  return (
    <Card style={StyleSheet.flatten([styles.blockCard, styles.savedBlockCard, { borderColor: `${CONFIRM_GREEN}55` }])}>
      <View style={styles.blockHeader}>
        <View style={styles.savedBlockTags}>
          <DragHandle handlers={dragHandlers} />
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
      {freeTextVideos.length > 0 ? (
        <Text style={styles.savedVideosLine}>
          {freeTextVideos.length} vídeo{freeTextVideos.length === 1 ? '' : 's'}:{' '}
          {freeTextVideos.map((video) => video.label.trim() || 'Vídeo').join(', ')}
        </Text>
      ) : null}
      {!freeText && movements.length > 0 ? (
        <View style={styles.savedMovements}>
          {movements.slice(0, 5).map((movement, index) => (
            <Text key={`${index}-${movement}`} style={styles.savedMovementLine} numberOfLines={1}>
              • {movement}
            </Text>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function FreeTextVideoRow({
  video,
  onUpdate,
  onRemove,
}: {
  video: FreeTextBlockVideo;
  onUpdate: (patch: Partial<FreeTextBlockVideo>) => void;
  onRemove: () => void;
}) {
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [namePickerOpen, setNamePickerOpen] = useState(false);
  const { getVideoId } = useExerciseVideos();
  const hasVideo = Boolean(video.youtubeVideoId);

  return (
    <View style={styles.freeTextVideoRow}>
      <TextInput
        value={video.label}
        onChangeText={(label) => onUpdate({ label })}
        placeholder="Ej. Back Squat"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, styles.freeTextVideoInput]}
      />
      <Pressable
        onPress={() => setNamePickerOpen(true)}
        hitSlop={8}
        style={({ pressed }) => [styles.libraryNameBtn, pressed && styles.libraryNameBtnPressed]}
        accessibilityLabel="Buscar ejercicio en la biblioteca"
      >
        <Ionicons name="search-outline" size={16} color={colors.accent} />
      </Pressable>
      <Pressable
        onPress={() => setVideoPickerOpen(true)}
        style={({ pressed }) => [
          styles.videoBtn,
          hasVideo && styles.videoBtnActive,
          pressed && styles.videoBtnPressed,
        ]}
        accessibilityLabel={hasVideo ? 'Cambiar vídeo' : 'Elegir vídeo'}
      >
        <Ionicons
          name={hasVideo ? 'videocam' : 'videocam-outline'}
          size={16}
          color={hasVideo ? colors.accent : colors.textMuted}
        />
        <Text style={[styles.videoBtnText, hasVideo && styles.videoBtnTextActive]}>
          {hasVideo ? 'Cambiar' : 'Elegir'}
        </Text>
      </Pressable>
      <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="Quitar vídeo">
        <Ionicons name="close-circle-outline" size={18} color={colors.textMuted} />
      </Pressable>

      <ExerciseNamePickerModal
        visible={namePickerOpen}
        currentName={video.label}
        onCancel={() => setNamePickerOpen(false)}
        onConfirm={(option) => {
          setNamePickerOpen(false);
          const resolved = getVideoId(option.name, option.aimharderEjerId);
          onUpdate({
            label: option.name,
            youtubeVideoId: resolved ?? video.youtubeVideoId,
          });
        }}
      />

      <ExerciseVideoPickerModal
        visible={videoPickerOpen}
        exerciseName={video.label}
        currentVideoId={video.youtubeVideoId}
        onCancel={() => setVideoPickerOpen(false)}
        onConfirm={(selection) => {
          setVideoPickerOpen(false);
          if (!selection) return;
          onUpdate({
            youtubeVideoId: selection.youtubeVideoId,
            label: video.label.trim() || selection.label || '',
          });
        }}
      />
    </View>
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
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [namePickerOpen, setNamePickerOpen] = useState(false);
  const { getVideoId } = useExerciseVideos();
  const resolvedVideoId = getVideoId(item.text, item.aimharderEjerId, item.youtubeVideoId);
  const hasVideo = Boolean(resolvedVideoId);

  const setLoadMetric = (metric: MovementLoadMetric) => {
    const percentRmValue = item.percent?.trim() || item.rm?.trim() || '';
    onUpdate({
      loadMetric: metric === 'rm' ? 'percent' : metric,
      weightKg: metric === 'kg' ? item.weightKg ?? '' : '',
      calories: metric === 'cal' ? item.calories ?? '' : '',
      distance: metric === 'distance' ? item.distance ?? '' : '',
      minutes: metric === 'min' ? item.minutes ?? '' : '',
      seconds: metric === 'sec' ? item.seconds ?? '' : '',
      rir: metric === 'rir' ? item.rir ?? '' : '',
      percent: metric === 'percent' || metric === 'rm' ? percentRmValue : '',
      rm: '',
    });
  };

  const setLoadValue = (value: string) => {
    const metric = getMovementLoadMetric(item);
    onUpdate({
      weightKg: metric === 'kg' ? value : '',
      calories: metric === 'cal' ? value : '',
      distance: metric === 'distance' ? value : '',
      minutes: metric === 'min' ? value : '',
      seconds: metric === 'sec' ? value : '',
      rir: metric === 'rir' ? value : '',
      percent: metric === 'percent' ? value : '',
      rm: '',
    });
  };

  return (
    <View style={styles.movementRow}>
      <View style={styles.movementNameRow}>
        <Text style={[styles.itemBullet, { color: accentText }]}>•</Text>
        <TextInput
          value={item.text}
          onChangeText={(text) =>
            onUpdate({
              text,
              aimharderEjerId: undefined,
              youtubeVideoId: getVideoId(text) ?? undefined,
            })
          }
          placeholder="Ej. Deadlift"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.itemNameInput]}
        />
        <Pressable
          onPress={() => setNamePickerOpen(true)}
          hitSlop={8}
          style={({ pressed }) => [styles.libraryNameBtn, pressed && styles.libraryNameBtnPressed]}
          accessibilityLabel="Buscar ejercicio en la biblioteca"
        >
          <Ionicons name="search-outline" size={16} color={colors.accent} />
        </Pressable>
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
            {MOVEMENT_PRIMARY_LOAD_METRICS.map((metric) => {
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
            <Text style={styles.metricLabel}>{getMovementLoadMetricLabel(loadMetric)}</Text>
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

        <View style={styles.videoField}>
          <Text style={styles.metricLabel}>Vídeo</Text>
          <Pressable
            onPress={() => setVideoPickerOpen(true)}
            style={({ pressed }) => [
              styles.videoBtn,
              hasVideo && styles.videoBtnActive,
              pressed && styles.videoBtnPressed,
            ]}
            accessibilityLabel={hasVideo ? 'Editar vídeo del ejercicio' : 'Añadir vídeo del ejercicio'}
          >
            <Ionicons
              name={hasVideo ? 'videocam' : 'videocam-outline'}
              size={16}
              color={hasVideo ? colors.accent : colors.textMuted}
            />
            <Text style={[styles.videoBtnText, hasVideo && styles.videoBtnTextActive]}>
              {hasVideo ? 'Editar' : 'Añadir'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ExerciseNamePickerModal
        visible={namePickerOpen}
        currentName={item.text}
        onCancel={() => setNamePickerOpen(false)}
          onConfirm={(option) => {
          setNamePickerOpen(false);
          onUpdate({
            text: option.name,
            aimharderEjerId: option.aimharderEjerId,
            youtubeVideoId: getVideoId(option.name, option.aimharderEjerId) ?? undefined,
          });
        }}
      />

      <ExerciseVideoPickerModal
        visible={videoPickerOpen}
        exerciseName={item.text}
        currentVideoId={resolvedVideoId ?? item.youtubeVideoId}
        onCancel={() => setVideoPickerOpen(false)}
        onConfirm={(selection) => {
          setVideoPickerOpen(false);
          onUpdate({
            youtubeVideoId: selection?.youtubeVideoId,
          });
        }}
      />
    </View>
  );
}

function EditingBlockCard({
  block,
  index,
  dragHandlers,
  onUpdate,
  onConfirm,
  onDone,
  onRemove,
  canConfirm,
  compactEdit = false,
}: {
  block: TaggedWorkoutBlock;
  index: number;
  dragHandlers?: GestureResponderHandlers;
  onUpdate: (patch: Partial<TaggedWorkoutBlock>) => void;
  onConfirm: () => void;
  onDone?: () => void;
  onRemove: () => void;
  canConfirm: boolean;
  compactEdit?: boolean;
}) {
  const config = getBlockTypeConfig(block.type);
  const accent = getBlockAccent(config.label);
  const [addVideoOpen, setAddVideoOpen] = useState(false);

  const timingDuration = parseTimingDuration(block.timing);
  const showTimingPicker = Boolean(config.timingIsDuration) && usesTimingDurationPicker(block.timing);
  // Con el campo vacío no hay texto del que deducir la unidad, así que la recuerda el propio editor.
  const [pendingTimingUnit, setPendingTimingUnit] = useState<TimingUnit>(timingDuration?.unit ?? 'min');
  const timingUnit = timingDuration?.unit ?? pendingTimingUnit;

  const selectTimingUnit = (unit: TimingUnit) => {
    setPendingTimingUnit(unit);
    onUpdate({ timing: formatTimingDuration(timingDuration?.value ?? '', unit) });
  };

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

  const freeTextContent = parseFreeTextBlockContent(block.type === 'free_text' ? block.timing : '');

  const updateFreeText = (body: string, videos: FreeTextBlockVideo[]) => {
    onUpdate({ timing: serializeFreeTextBlockContent(body, videos) });
  };

  return (
    <Card style={StyleSheet.flatten([styles.blockCard, styles.editingBlockCard, { borderColor: accent.border }])}>
      <View style={styles.blockHeader}>
        <View style={styles.editingBlockTitleRow}>
          <DragHandle handlers={dragHandlers} />
          <Text style={styles.blockIndex}>{index + 1}</Text>
          <View style={[styles.typeChip, { backgroundColor: `${accent.text}18` }]}>
            <Text style={[styles.typeChipText, { color: accent.text }]}>{config.label}</Text>
          </View>
        </View>
        <View style={styles.editingHeaderActions}>
          {compactEdit ? (
            <Pressable
              onPress={onDone}
              hitSlop={8}
              accessibilityLabel="Cerrar edición del bloque"
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>Listo</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="Quitar bloque">
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      {block.type === 'free_text' ? (
        <View style={styles.freeTextField}>
          <View style={styles.freeTextNameField}>
            <Text style={styles.fieldLabel}>Nombre del bloque</Text>
            <TextInput
              value={block.title ?? ''}
              onChangeText={(title) => onUpdate({ title })}
              placeholder="Opcional. Ej. Fuerza"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <Text style={styles.fieldLabel}>Texto libre</Text>
          <TextInput
            value={freeTextContent.body}
            onChangeText={(body) => updateFreeText(body, freeTextContent.videos)}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            placeholder="Escribe aquí el contenido del bloque…"
            placeholderTextColor={colors.textMuted}
            style={styles.freeTextInput}
          />

          <View style={styles.freeTextVideosSection}>
            <Text style={styles.fieldLabel}>Vídeos del bloque</Text>
            <Text style={styles.freeTextVideosHint}>
              El atleta verá un botón por vídeo debajo del texto.
            </Text>
            {freeTextContent.videos.map((video, index) => (
              <FreeTextVideoRow
                key={`${video.youtubeVideoId}-${index}`}
                video={video}
                onUpdate={(patch) =>
                  updateFreeText(
                    freeTextContent.body,
                    freeTextContent.videos.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, ...patch } : entry,
                    ),
                  )
                }
                onRemove={() =>
                  updateFreeText(
                    freeTextContent.body,
                    freeTextContent.videos.filter((_, entryIndex) => entryIndex !== index),
                  )
                }
              />
            ))}
            <Button
              title="+ Añadir vídeo"
              variant="ghost"
              onPress={() => setAddVideoOpen(true)}
              style={styles.addItemBtn}
              textStyle={StyleSheet.flatten([styles.addItemBtnText, { color: accent.text }])}
            />
          </View>

          <ExerciseVideoPickerModal
            visible={addVideoOpen}
            onCancel={() => setAddVideoOpen(false)}
            onConfirm={(selection) => {
              setAddVideoOpen(false);
              if (!selection) return;
              updateFreeText(freeTextContent.body, [
                ...freeTextContent.videos,
                { label: selection.label ?? '', youtubeVideoId: selection.youtubeVideoId },
              ]);
            }}
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
            <View style={[styles.blockMetaField, showTimingPicker && styles.timingField]}>
              <Text style={styles.fieldLabel}>{config.timingLabel}</Text>
              {showTimingPicker ? (
                <View style={styles.timingRow}>
                  <TextInput
                    value={timingDuration?.value ?? ''}
                    onChangeText={(next) =>
                      onUpdate({ timing: formatTimingDuration(next.replace(/[^\d.,]/g, ''), timingUnit) })
                    }
                    placeholder={config.timingPlaceholder}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    style={[styles.input, styles.timingValueInput]}
                  />
                  <View style={styles.loadMetricPicker}>
                    {TIMING_UNITS.map((unit) => {
                      const active = timingUnit === unit;
                      return (
                        <Pressable
                          key={unit}
                          onPress={() => selectTimingUnit(unit)}
                          style={[styles.loadMetricBtn, active && styles.loadMetricBtnActive]}
                        >
                          <Text style={[styles.loadMetricBtnText, active && styles.loadMetricBtnTextActive]}>
                            {unit === 'min' ? 'Min' : 'Seg'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <TextInput
                  value={block.timing}
                  onChangeText={(timing) => onUpdate({ timing })}
                  placeholder={config.timingPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
              )}
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

      {!compactEdit ? (
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
      ) : (
        <View style={styles.confirmFooter}>
          <Pressable
            onPress={onDone}
            disabled={!canConfirm}
            accessibilityLabel="Cerrar edición del bloque"
            style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          >
            <Ionicons name="checkmark" size={22} color={canConfirm ? '#0B1A10' : colors.textMuted} />
          </Pressable>
        </View>
      )}
    </Card>
  );
}

function confirmedIdsFromValidBlocks(blocks: TaggedWorkoutBlock[]) {
  return new Set(blocks.filter((block) => canConfirmWorkoutBlock(block)).map((block) => block.id));
}

function confirmedIdsFromBlocks(blocks: TaggedWorkoutBlock[]) {
  return new Set(blocks.map((block) => block.id));
}

function SortableBlock({
  index,
  isDragging,
  onMeasure,
  onDragStart,
  onDragMove,
  onDragEnd,
  render,
}: {
  index: number;
  isDragging: boolean;
  onMeasure: (y: number, height: number) => void;
  onDragStart: (index: number) => void;
  onDragMove: (dy: number) => void;
  onDragEnd: () => void;
  render: (handlers: GestureResponderHandlers) => ReactNode;
}) {
  const translateY = useRef(new Animated.Value(0)).current;

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // El scroll de la página no debe robar el gesto al arrastrar el asa.
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          translateY.setValue(0);
          onDragStart(index);
        },
        onPanResponderMove: (_event, gesture) => {
          translateY.setValue(gesture.dy);
          onDragMove(gesture.dy);
        },
        onPanResponderRelease: () => {
          translateY.setValue(0);
          onDragEnd();
        },
        onPanResponderTerminate: () => {
          translateY.setValue(0);
          onDragEnd();
        },
      }),
    [index, onDragEnd, onDragMove, onDragStart, translateY],
  );

  return (
    <Animated.View
      onLayout={(event) => onMeasure(event.nativeEvent.layout.y, event.nativeEvent.layout.height)}
      style={[isDragging && styles.blockDragging, { transform: [{ translateY }] }]}
    >
      {render(responder.panHandlers)}
    </Animated.View>
  );
}

export function WorkoutBlocksEditor({
  draft,
  onChange,
  hideConfirmedBlocks = false,
  onPendingBlocksChange,
}: WorkoutBlocksEditorProps) {
  const compactEdit = hideConfirmedBlocks;
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [blocks, setBlocks] = useState<TaggedWorkoutBlock[]>(() => draftToTaggedBlocks(draft));
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(() => {
    const parsed = draftToTaggedBlocks(draft);
    return compactEdit ? confirmedIdsFromValidBlocks(parsed) : confirmedIdsFromBlocks(parsed);
  });
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const lastSerializedRef = useRef(draftSectionFingerprint(draft));

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const layoutsRef = useRef(new Map<string, { y: number; height: number }>());
  const dragRef = useRef<{ index: number; center: number; target: number } | null>(null);
  const dropLineTop = useRef(new Animated.Value(0)).current;
  const blocksRef = useRef(blocks);
  const confirmedRef = useRef(confirmedIds);
  const draftRef = useRef(draft);
  const onChangeRef = useRef(onChange);

  blocksRef.current = blocks;
  confirmedRef.current = confirmedIds;
  draftRef.current = draft;
  onChangeRef.current = onChange;

  useEffect(() => {
    const fingerprint = draftSectionFingerprint(draft);
    if (fingerprint === lastSerializedRef.current) return;
    const parsed = draftToTaggedBlocks(draft);
    setBlocks(parsed);
    setConfirmedIds(compactEdit ? confirmedIdsFromValidBlocks(parsed) : confirmedIdsFromBlocks(parsed));
    setEditingBlockId(null);
    lastSerializedRef.current = fingerprint;
  }, [compactEdit, draft]);

  useEffect(() => {
    if (compactEdit) {
      const editing = editingBlockId ? blocks.find((block) => block.id === editingBlockId) : null;
      // En modo edición los cambios ya van al borrador; solo bloqueamos si el bloque abierto está vacío.
      onPendingBlocksChange?.(editing ? !canConfirmWorkoutBlock(editing) : false);
      return;
    }

    onPendingBlocksChange?.(blocks.some((block) => !confirmedIds.has(block.id)));
  }, [blocks, compactEdit, confirmedIds, editingBlockId, onPendingBlocksChange]);

  const pushConfirmed = (nextBlocks: TaggedWorkoutBlock[], nextConfirmed: Set<string>) => {
    const nextDraft = taggedBlocksToDraft(nextBlocks, nextConfirmed, draft);
    lastSerializedRef.current = draftSectionFingerprint(nextDraft);
    onChange(nextDraft);
  };

  const pushCompactDraft = useCallback((nextBlocks: TaggedWorkoutBlock[]) => {
    const nextConfirmed = confirmedIdsFromValidBlocks(nextBlocks);
    confirmedRef.current = nextConfirmed;
    setConfirmedIds(nextConfirmed);
    const nextDraft = taggedBlocksToDraft(nextBlocks, nextConfirmed, draftRef.current);
    lastSerializedRef.current = draftSectionFingerprint(nextDraft);
    onChangeRef.current(nextDraft);
  }, []);

  const updateEditingBlock = (blockId: string, patch: Partial<TaggedWorkoutBlock>) => {
    const nextBlocks = blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block));
    setBlocks(nextBlocks);
    if (compactEdit) {
      pushCompactDraft(nextBlocks);
    }
  };

  const applyFinishEditing = (blockId: string, sourceBlocks: TaggedWorkoutBlock[]) => {
    const block = sourceBlocks.find((entry) => entry.id === blockId);
    if (!block) return sourceBlocks;

    if (!canConfirmWorkoutBlock(block)) {
      return sourceBlocks.filter((entry) => entry.id !== blockId);
    }

    const sanitized: TaggedWorkoutBlock = { ...sanitizeWorkoutBlock(block), section: 'main' };
    return sourceBlocks.map((entry) => (entry.id === blockId ? sanitized : entry));
  };

  const finishEditing = (blockId: string) => {
    const nextBlocks = applyFinishEditing(blockId, blocks);
    setBlocks(nextBlocks);
    setEditingBlockId(null);
    if (compactEdit) {
      pushCompactDraft(nextBlocks);
    }
  };

  const confirmBlock = (blockId: string) => {
    if (compactEdit) {
      finishEditing(blockId);
      return;
    }

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
    let workingBlocks = blocks;

    if (compactEdit && editingBlockId && editingBlockId !== blockId) {
      workingBlocks = applyFinishEditing(editingBlockId, workingBlocks);
    }

    const block = workingBlocks.find((entry) => entry.id === blockId);
    if (!block) return;

    const forEdit =
      block.type === 'free_text' || block.items.length > 0
        ? block
        : { ...block, items: [createEmptyBlockItem()] };
    const nextBlocks = workingBlocks.map((entry) => (entry.id === blockId ? forEdit : entry));

    if (compactEdit) {
      setBlocks(nextBlocks);
      setEditingBlockId(blockId);
      pushCompactDraft(nextBlocks);
      return;
    }

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

    if (compactEdit && editingBlockId === blockId) {
      setEditingBlockId(null);
    }

    setBlocks(nextBlocks);
    if (compactEdit) {
      pushCompactDraft(nextBlocks);
      return;
    }

    setConfirmedIds(nextConfirmed);
    pushConfirmed(nextBlocks, nextConfirmed);
  };

  const addBlock = (type: WorkoutBlockType) => {
    const newBlock: TaggedWorkoutBlock = { ...createEmptyBlock(type), section: 'main' };
    setBlocks((current) => {
      const nextBlocks = [...current, newBlock];
      if (compactEdit) {
        setEditingBlockId(newBlock.id);
      }
      return nextBlocks;
    });
  };

  const moveBlock = useCallback(
    (from: number, to: number) => {
      const current = blocksRef.current;
      if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return;

      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);

      blocksRef.current = next;
      setBlocks(next);

      if (compactEdit) {
        pushCompactDraft(next);
        return;
      }

      const nextDraft = taggedBlocksToDraft(next, confirmedRef.current, draftRef.current);
      lastSerializedRef.current = draftSectionFingerprint(nextDraft);
      onChangeRef.current(nextDraft);
    },
    [compactEdit, pushCompactDraft],
  );

  const positionDropLine = useCallback(
    (others: TaggedWorkoutBlock[], insertAt: number) => {
      const target = others[insertAt];
      if (target) {
        const layout = layoutsRef.current.get(target.id);
        if (layout) dropLineTop.setValue(layout.y - spacing.sm / 2);
        return;
      }

      const last = others[others.length - 1];
      const layout = last ? layoutsRef.current.get(last.id) : undefined;
      if (layout) dropLineTop.setValue(layout.y + layout.height + spacing.sm / 2);
    },
    [dropLineTop],
  );

  const handleDragStart = useCallback(
    (index: number) => {
      const block = blocksRef.current[index];
      const layout = block ? layoutsRef.current.get(block.id) : undefined;

      dragRef.current = {
        index,
        center: layout ? layout.y + layout.height / 2 : 0,
        target: index,
      };
      setDraggingIndex(index);
      positionDropLine(
        blocksRef.current.filter((_, i) => i !== index),
        index,
      );
    },
    [positionDropLine],
  );

  const handleDragMove = useCallback(
    (dy: number) => {
      const drag = dragRef.current;
      if (!drag) return;

      const pointer = drag.center + dy;
      const others = blocksRef.current.filter((_, i) => i !== drag.index);

      let insertAt = 0;
      for (const other of others) {
        const layout = layoutsRef.current.get(other.id);
        if (!layout || layout.y + layout.height / 2 >= pointer) break;
        insertAt += 1;
      }

      drag.target = insertAt;
      positionDropLine(others, insertAt);
    },
    [positionDropLine],
  );

  const handleDragEnd = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDraggingIndex(null);
    if (drag) moveBlock(drag.index, drag.target);
  }, [moveBlock]);

  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionLabel}>Bloques de entrenamiento</Text>
          <Text style={styles.sectionHint}>
            {compactEdit
              ? 'Pulsa el lápiz para editar un bloque. Arrastra el asa para cambiar el orden.'
              : 'Añade bloques en orden, como en AimHarder. Arrastra el asa de cada bloque para cambiarlos de sitio.'}
          </Text>
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
            const isEditing = compactEdit ? block.id === editingBlockId : !confirmedIds.has(block.id);
            const canReorder = blocks.length > 1;

            return (
              <SortableBlock
                key={`${block.id}-${index}`}
                index={index}
                isDragging={draggingIndex === index}
                onMeasure={(y, height) => layoutsRef.current.set(block.id, { y, height })}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                render={(handlers) =>
                  isEditing ? (
                    <EditingBlockCard
                      block={block}
                      index={index}
                      dragHandlers={canReorder ? handlers : undefined}
                      compactEdit={compactEdit}
                      onUpdate={(patch) => updateEditingBlock(block.id, patch)}
                      onConfirm={() => confirmBlock(block.id)}
                      onDone={() => finishEditing(block.id)}
                      onRemove={() => removeBlock(block.id)}
                      canConfirm={canConfirmWorkoutBlock(block)}
                    />
                  ) : (
                    <SavedBlockCard
                      block={block}
                      index={index}
                      dragHandlers={canReorder ? handlers : undefined}
                      onEdit={() => editBlock(block.id)}
                      onRemove={() => removeBlock(block.id)}
                    />
                  )
                }
              />
            );
          })}

          {draggingIndex !== null ? (
            <Animated.View pointerEvents="none" style={[styles.dropLine, { top: dropLineTop }]} />
          ) : null}
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
    backgroundColor: withAlpha(colors.surfaceLight, '66'),
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
  dragHandle: {
    paddingVertical: 4,
    paddingRight: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'grab' } as object) : null),
  },
  blockDragging: {
    zIndex: 20,
    opacity: 0.97,
    ...shadows.card,
  },
  dropLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    zIndex: 10,
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
  editingHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  doneBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  doneBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
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
  savedVideosLine: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  freeTextVideosSection: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  freeTextVideosHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  freeTextVideoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  freeTextVideoInput: {
    flex: 1,
    minWidth: 100,
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
  timingField: {
    minWidth: 180,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timingValueInput: {
    flex: 1,
    minWidth: 56,
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
  freeTextNameField: {
    marginBottom: spacing.sm,
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
  libraryNameBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '12'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryNameBtnPressed: {
    opacity: 0.85,
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
  videoField: {
    minWidth: 88,
  },
  videoBtn: {
    minHeight: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  videoBtnActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  videoBtnPressed: {
    opacity: 0.92,
  },
  videoBtnText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  videoBtnTextActive: {
    color: colors.text,
  },
  loadMetricPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
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
    backgroundColor: withAlpha(colors.accent, '18'),
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
