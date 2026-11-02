import { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
    TRAINER_EXERCISE_EXECUTION_LABELS,
    getTrainerExerciseNoteDisplayName,
    groupTrainerExerciseNoteHistory,
    summarizeTrainerExerciseNote,
    trainerExerciseNoteHasContent,
    type TrainerExerciseExecution,
    type TrainerExerciseNote,
    type TrainerExerciseNoteDraft,
} from '@/lib/trainerExerciseNoteService';

const EXECUTIONS: TrainerExerciseExecution[] = ['correct', 'partial', 'incorrect'];

/** Variantes que el entrenador escribe una y otra vez; el campo sigue siendo libre. */
const LEVEL_SUGGESTIONS = ['Tuck', 'Advanced', 'Super Advanced'];

const EMPTY_DRAFT: TrainerExerciseNoteDraft = {};

function executionColor(execution: TrainerExerciseExecution) {
  if (execution === 'correct') return colors.success;
  if (execution === 'partial') return colors.warning;
  return colors.danger;
}

function setLabel(note: TrainerExerciseNote) {
  return note.setNumber ? `Serie ${note.setNumber}` : 'General';
}

function NoteSummaryLine({ note }: { note: TrainerExerciseNote }) {
  const summary = summarizeTrainerExerciseNote(note);

  return (
    <View style={styles.summaryCopy}>
      <Text style={styles.summaryTitle} numberOfLines={1}>
        {setLabel(note)}
        {summary ? ` · ${summary}` : ''}
      </Text>
      {note.technique?.trim() ? (
        <Text style={styles.summaryDetail}>Técnica: {note.technique}</Text>
      ) : null}
      {note.notes?.trim() ? <Text style={styles.summaryDetail}>{note.notes}</Text> : null}
    </View>
  );
}

function ExecutionDot({ execution }: { execution?: TrainerExerciseExecution }) {
  if (!execution) return null;
  return <View style={[styles.dot, { backgroundColor: executionColor(execution) }]} />;
}

function ExerciseNotesHistoryList({
  groups,
  loading,
}: {
  groups: ReturnType<typeof groupTrainerExerciseNoteHistory>;
  loading: boolean;
}) {
  if (loading && groups.length === 0) {
    return <Text style={styles.historyEmpty}>Cargando historial…</Text>;
  }

  if (groups.length === 0) {
    return (
      <Text style={styles.historyEmpty}>
        Todavía no hay apuntes anteriores de este ejercicio.
      </Text>
    );
  }

  return (
    <View style={styles.history}>
      {groups.map((group) => (
        <View key={group.performedOn} style={styles.historyDay}>
          <View style={styles.historyDayHeader}>
            <View style={styles.historyAgeBadge}>
              <Text style={styles.historyAgeText}>{group.ageLabel}</Text>
            </View>
            <Text style={styles.historyDate}>{group.dateLabel}</Text>
          </View>
          {group.notes.map((note) => (
            <View key={note.id} style={styles.historyRow}>
              <ExecutionDot execution={note.execution} />
              <NoteSummaryLine note={note} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

interface TrainerExerciseNoteTriggerProps {
  exerciseName: string;
  noteCount: number;
  historyCount: number;
  /** Antigüedad del último apunte anterior, p. ej. "hace 1 semana". */
  lastHistoryAge?: string;
  /** `inline` en filas de ejercicio; `card` bajo el bloque si hace falta más espacio. */
  variant?: 'inline' | 'card';
  onPress: () => void;
}

function noteTriggerMeta(
  noteCount: number,
  historyCount: number,
  lastHistoryAge?: string,
): string {
  if (noteCount > 0 && lastHistoryAge) {
    return `${noteCount} en esta sesión · historial ${lastHistoryAge}`;
  }
  if (noteCount > 0) {
    return `${noteCount} apunte${noteCount === 1 ? '' : 's'} en esta sesión`;
  }
  if (lastHistoryAge) {
    return `Historial · última sesión ${lastHistoryAge}`;
  }
  if (historyCount > 0) {
    return `${historyCount} sesión${historyCount === 1 ? '' : 'es'} en el historial`;
  }
  return 'Solo lo ves tú';
}

export function TrainerExerciseNoteTrigger({
  exerciseName,
  noteCount,
  historyCount,
  lastHistoryAge,
  variant = 'inline',
  onPress,
}: TrainerExerciseNoteTriggerProps) {
  const hasSessionNotes = noteCount > 0;
  const hasHistory = historyCount > 0 || Boolean(lastHistoryAge);
  const meta = noteTriggerMeta(noteCount, historyCount, lastHistoryAge);
  const historyHint = lastHistoryAge ?? (historyCount > 0 ? `${historyCount}` : undefined);

  if (variant === 'inline') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Apuntes privados de ${exerciseName}. ${meta}`}
        style={({ pressed }) => [
          styles.noteInlineBtn,
          hasSessionNotes && styles.noteInlineBtnActive,
          pressed && styles.noteInlineBtnPressed,
        ]}
      >
        <AppIcon
          name="edit"
          size={13}
          color={hasSessionNotes ? colors.accentBlue : colors.textSecondary}
        />
        <Text
          style={[styles.noteInlineText, hasSessionNotes && styles.noteInlineTextActive]}
          numberOfLines={1}
        >
          Apuntes
        </Text>
        {hasSessionNotes ? (
          <View style={styles.noteInlineCount}>
            <Text style={styles.noteInlineCountText}>{noteCount}</Text>
          </View>
        ) : historyHint ? (
          <Text style={styles.noteInlineHistory} numberOfLines={1}>{historyHint}</Text>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Apuntes privados de ${exerciseName}. ${meta}`}
      style={({ pressed }) => [
        styles.noteActionCard,
        hasSessionNotes && styles.noteActionCardActive,
        pressed && styles.noteActionCardPressed,
      ]}
    >
      <View style={[styles.noteActionIcon, hasSessionNotes && styles.noteActionIconActive]}>
        <AppIcon
          name="edit"
          size={18}
          color={hasSessionNotes ? colors.accentBlue : colors.textSecondary}
        />
      </View>
      <View style={styles.noteActionCopy}>
        <Text style={styles.noteActionTitle}>Apuntes privados</Text>
        <Text style={styles.noteActionMeta} numberOfLines={1}>{meta}</Text>
      </View>
      {hasHistory ? <AppIcon name="chevronRight" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

interface TrainerExerciseNoteModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  notes: TrainerExerciseNote[];
  history: TrainerExerciseNote[];
  historyLoading?: boolean;
  isSaving?: boolean;
  nextSetNumber: number;
  contextLabel?: string;
  error?: string | null;
  onSave: (draft: TrainerExerciseNoteDraft, noteId?: string) => void;
  onRemove: (note: TrainerExerciseNote) => void;
  onRequestHistory: () => void;
  /** Abre el formulario directamente en edición de este apunte. */
  initialNote?: TrainerExerciseNote;
}

export function TrainerExerciseNoteModal({
  visible,
  onClose,
  exerciseName,
  notes,
  history,
  historyLoading = false,
  isSaving = false,
  nextSetNumber,
  contextLabel,
  error,
  onSave,
  onRemove,
  onRequestHistory,
  initialNote,
}: TrainerExerciseNoteModalProps) {
  const [panel, setPanel] = useState<'compose' | 'history'>('compose');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TrainerExerciseNoteDraft>(EMPTY_DRAFT);

  useEffect(() => {
    if (visible) onRequestHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setPanel('compose');
      setEditingId(null);
      setDraft(EMPTY_DRAFT);
      return;
    }

    if (initialNote) {
      setPanel('compose');
      setEditingId(initialNote.id);
      setDraft({
        setNumber: initialNote.setNumber,
        reps: initialNote.reps ?? '',
        seconds: initialNote.seconds ?? '',
        level: initialNote.level ?? '',
        execution: initialNote.execution,
        technique: initialNote.technique ?? '',
        notes: initialNote.notes ?? '',
      });
    }
  }, [initialNote, visible]);

  const historyByDate = useMemo(() => groupTrainerExerciseNoteHistory(history), [history]);
  const latestHistory = historyByDate[0] ?? null;
  const historySessionCount = historyByDate.length;

  const patch = (next: Partial<TrainerExerciseNoteDraft>) =>
    setDraft((current) => ({ ...current, ...next }));

  const startEdit = (note: TrainerExerciseNote) => {
    setEditingId(note.id);
    setDraft({
      setNumber: note.setNumber,
      reps: note.reps ?? '',
      seconds: note.seconds ?? '',
      level: note.level ?? '',
      execution: note.execution,
      technique: note.technique ?? '',
      notes: note.notes ?? '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  };

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  const canSave = trainerExerciseNoteHasContent(draft) && !isSaving;
  const targetSet = editingId ? draft.setNumber : nextSetNumber;
  const displayExerciseName = getTrainerExerciseNoteDisplayName(exerciseName, contextLabel);
  const historyMeta =
    historyLoading && historySessionCount === 0
      ? 'Cargando sesiones anteriores…'
      : historySessionCount === 0
        ? 'Sin apuntes en sesiones pasadas'
        : `${historySessionCount} sesión${historySessionCount === 1 ? '' : 'es'}${
            latestHistory ? ` · última ${latestHistory.ageLabel}` : ''
          }`;

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar apunte privado"
        />
        <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                {panel === 'history' ? (
                  <Pressable
                    onPress={() => setPanel('compose')}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Volver al apunte"
                    style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
                  >
                    <AppIcon name="chevronLeft" size={22} color={colors.text} />
                  </Pressable>
                ) : (
                  <View style={styles.modalBadge}>
                    <AppIcon name="edit" size={18} color={colors.accentBlue} />
                  </View>
                )}
                <View style={styles.modalTitleBlock}>
                  {panel === 'history' ? (
                    <>
                      <Text style={styles.modalTitle} numberOfLines={2}>
                        Historial de apuntes
                      </Text>
                      <Text style={styles.modalExerciseName} numberOfLines={1}>
                        {displayExerciseName}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.modalTitle} numberOfLines={2}>
                        Apunte privado
                        <Text style={styles.modalExerciseSeparator}> · </Text>
                        <Text style={styles.modalExerciseName}>{displayExerciseName}</Text>
                      </Text>
                      <Text style={styles.privacyHint}>Solo lo ves tú</Text>
                    </>
                  )}
                </View>
              </View>
              <Pressable
                onPress={handleClose}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Cerrar apunte privado"
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              >
                <AppIcon name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {panel === 'compose' && contextLabel ? (
              <Text style={styles.contextLabel}>{contextLabel}</Text>
            ) : null}

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled
              showsVerticalScrollIndicator={Platform.OS === 'web'}
            >
              {panel === 'history' ? (
                <ExerciseNotesHistoryList groups={historyByDate} loading={historyLoading} />
              ) : (
                <>
                  <Pressable
                    onPress={() => setPanel('history')}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver historial de apuntes de ${displayExerciseName}`}
                    style={({ pressed }) => [styles.historyLinkCard, pressed && styles.historyLinkPressed]}
                  >
                    <View style={styles.historyLinkIcon}>
                      <AppIcon name="time" size={20} color={colors.accentBlue} />
                    </View>
                    <View style={styles.historyLinkCopy}>
                      <Text style={styles.historyLinkTitle}>Historial de apuntes</Text>
                      <Text style={styles.historyLinkMeta}>{historyMeta}</Text>
                    </View>
                    <AppIcon name="chevronRight" size={18} color={colors.textMuted} />
                  </Pressable>

                  {notes.length > 0 ? (
                    <View style={styles.sessionNotes}>
                      <Text style={styles.sectionLabel}>Esta sesión</Text>
                      {notes.map((note) => (
                        <View key={note.id} style={styles.sessionNoteRow}>
                          <ExecutionDot execution={note.execution} />
                          <NoteSummaryLine note={note} />
                          <Pressable
                            onPress={() => startEdit(note)}
                            hitSlop={6}
                            accessibilityLabel="Editar apunte"
                            style={styles.rowAction}
                          >
                            <AppIcon name="edit" size={15} color={colors.textSecondary} />
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              if (editingId === note.id) resetForm();
                              onRemove(note);
                            }}
                            hitSlop={6}
                            accessibilityLabel="Eliminar apunte"
                            style={styles.rowAction}
                          >
                            <AppIcon name="trash" size={15} color={colors.textMuted} />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.formHeader}>
                    <Text style={styles.formTitle}>
                      {editingId
                        ? `Editando ${targetSet ? `serie ${targetSet}` : 'el apunte'}`
                        : `Serie ${targetSet}`}
                    </Text>
                    {editingId ? (
                      <Pressable onPress={resetForm} hitSlop={8}>
                        <Text style={styles.closeHint}>Cancelar edición</Text>
                      </Pressable>
                    ) : null}
                  </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>Reps</Text>
                  <TextInput
                    value={draft.reps ?? ''}
                    onChangeText={(value) => patch({ reps: value })}
                    placeholder="4"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    style={styles.input}
                    editable={!isSaving}
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>Seg</Text>
                  <TextInput
                    value={draft.seconds ?? ''}
                    onChangeText={(value) => patch({ seconds: value })}
                    placeholder="12"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    style={styles.input}
                    editable={!isSaving}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Nivel o variante</Text>
              <TextInput
                value={draft.level ?? ''}
                onChangeText={(value) => patch({ level: value })}
                placeholder="Tuck"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                editable={!isSaving}
              />

              <View style={styles.chipRow}>
                {LEVEL_SUGGESTIONS.map((level) => {
                  const active = draft.level?.trim() === level;
                  return (
                    <Pressable
                      key={level}
                      onPress={() => patch({ level: active ? '' : level })}
                      style={({ pressed }) => [
                        styles.suggestionChip,
                        active && styles.suggestionChipActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.suggestionChipText, active && styles.suggestionChipTextActive]}>
                        {level}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Ejecución</Text>
              <View style={styles.chipRow}>
                {EXECUTIONS.map((execution) => {
                  const active = draft.execution === execution;
                  const tint = executionColor(execution);
                  return (
                    <Pressable
                      key={execution}
                      onPress={() => patch({ execution: active ? undefined : execution })}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.executionChip,
                        active && { borderColor: tint, backgroundColor: withAlpha(tint, '1F') },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={[styles.dot, { backgroundColor: tint }]} />
                      <Text style={[styles.executionChipText, active && { color: colors.text }]}>
                        {TRAINER_EXERCISE_EXECUTION_LABELS[execution]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Técnica</Text>
              <TextInput
                value={draft.technique ?? ''}
                onChangeText={(value) => patch({ technique: value })}
                placeholder="Qué corregir o qué ha mejorado…"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                style={[styles.input, styles.inputMultiline]}
                editable={!isSaving}
              />

              <Text style={styles.fieldLabel}>Otras observaciones</Text>
              <TextInput
                value={draft.notes ?? ''}
                onChangeText={(value) => patch({ notes: value })}
                placeholder="Material, sensaciones, lo que quieras recordar…"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                style={[styles.input, styles.inputMultiline]}
                editable={!isSaving}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              {panel === 'history' ? (
                <Button
                  title="Volver al apunte"
                  variant="secondary"
                  onPress={() => setPanel('compose')}
                  style={styles.footerBtnFull}
                />
              ) : (
                <>
                  <Button title="Cancelar" variant="secondary" onPress={handleClose} style={styles.footerBtn} />
                  <Button
                    title={isSaving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Guardar apunte'}
                    onPress={() => {
                      if (!canSave) return;
                      onSave({ ...draft, setNumber: targetSet }, editingId ?? undefined);
                      resetForm();
                    }}
                    disabled={!canSave}
                    loading={isSaving}
                    style={styles.footerBtn}
                  />
                </>
              )}
            </View>
        </View>
      </View>
    </Modal>
  );
}

/** Compatibilidad con imports antiguos (`TrainerExerciseNotes`). Preferir Trigger + Modal en la sesión. */
export function TrainerExerciseNotes(
  props: Omit<TrainerExerciseNoteModalProps, 'visible' | 'onClose'>,
) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TrainerExerciseNoteTrigger
        exerciseName={props.exerciseName}
        noteCount={props.notes.length}
        historyCount={props.history.length}
        variant="card"
        onPress={() => {
          props.onRequestHistory();
          setOpen(true);
        }}
      />
      <TrainerExerciseNoteModal {...props} visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  noteInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    maxWidth: 148,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  noteInlineBtnActive: {
    borderColor: withAlpha(colors.accentBlue, '55'),
    backgroundColor: withAlpha(colors.accentBlue, '10'),
  },
  noteInlineBtnPressed: {
    opacity: 0.88,
  },
  noteInlineText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
  noteInlineTextActive: {
    color: colors.accentBlue,
  },
  noteInlineCount: {
    minWidth: 16,
    height: 16,
    borderRadius: borderRadius.full,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentBlue,
  },
  noteInlineCountText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    fontSize: 9,
    lineHeight: 12,
  },
  noteInlineHistory: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 9,
    maxWidth: 72,
  },
  noteActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  noteActionCardActive: {
    borderColor: withAlpha(colors.accentBlue, '55'),
    backgroundColor: withAlpha(colors.accentBlue, '0C'),
  },
  noteActionCardPressed: {
    opacity: 0.92,
  },
  noteActionIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  noteActionIconActive: {
    backgroundColor: withAlpha(colors.accentBlue, '18'),
    borderColor: withAlpha(colors.accentBlue, '44'),
  },
  noteActionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  noteActionTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  noteActionMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    ...(Platform.OS === 'web' ? ({ cursor: 'default' } as object) : null),
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    flexDirection: 'column',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    zIndex: 1,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 24px 48px rgba(0,0,0,0.28)' } as object)
      : null),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalHeaderCopy: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minWidth: 0,
  },
  modalBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.accentBlue, '18'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accentBlue, '33'),
  },
  modalTitleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalExerciseSeparator: {
    ...typography.h3,
    color: colors.textMuted,
    fontWeight: '500',
  },
  modalExerciseName: {
    ...typography.h3,
    color: colors.accent,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  modalScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  modalScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  footerBtn: {
    flex: 1,
  },
  footerBtnFull: {
    flex: 1,
    width: '100%',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  historyLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  historyLinkPressed: {
    opacity: 0.88,
  },
  historyLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.accentBlue, '1A'),
  },
  historyLinkCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  historyLinkTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  historyLinkMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  privacyHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  closeHint: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  contextLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  sessionNotes: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sessionNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  rowAction: {
    paddingHorizontal: 2,
    paddingTop: 1,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  summaryTitle: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  summaryDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 5,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  formTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fieldHalf: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: spacing.xs,
    marginBottom: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    ...typography.bodySmall,
    color: colors.text,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  inputMultiline: {
    minHeight: 52,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  suggestionChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  suggestionChipActive: {
    borderColor: colors.accentBlue,
    backgroundColor: withAlpha(colors.accentBlue, '1F'),
  },
  suggestionChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 10,
  },
  suggestionChipTextActive: {
    color: colors.text,
  },
  executionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  executionChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  historyEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  history: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  historyDay: {
    gap: 3,
  },
  historyDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  historyAgeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accent, '1F'),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(colors.accent, '44'),
  },
  historyAgeText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '800',
    fontSize: 10,
    lineHeight: 13,
  },
  historyDate: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 10,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingLeft: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
