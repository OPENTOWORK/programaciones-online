import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { GymPickerBox } from '@/components/gym/GymPickerBox';
import { SessionEditorForm } from '@/components/trainer/SessionEditorForm';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { pinCatalogSessionToDate } from '@/lib/catalogProgramCalendar';
import type { GymProgramLinkInput } from '@/lib/gymService';
import type { GymClassType, GymProgramLink } from '@/lib/gymTypes';
import { gymDateKey, programForGymClassType } from '@/lib/gymTraining';
import { extractExercisesFromSessionDraft, hasSessionBlockContent } from '@/lib/sessionBlockSections';
import { createEmptySessionDraft, type SessionDraft } from '@/lib/trainerSessionDraft';
import type { Program } from '@/lib/types';

type Step = 'editor' | 'schedule';

interface FormState {
  programId: string;
  classTypeId: string;
  publishedDate: string;
  publishedTime: string;
  scheduledDate: string;
}

function nextDateForWeekday(weekday: number) {
  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const delta = (weekday - todayIndex + 7) % 7;
  const date = new Date(today);
  date.setDate(today.getDate() + delta);
  return date;
}

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function trainingDateFromLink(link?: GymProgramLink | null): string {
  if (link?.scheduledDate) return link.scheduledDate;
  if (link?.weekday != null && link.weekday >= 0 && link.weekday <= 6) {
    return gymDateKey(nextDateForWeekday(link.weekday));
  }
  return gymDateKey(new Date());
}

function toForm(link?: GymProgramLink | null): FormState {
  const scheduledDate = trainingDateFromLink(link);
  return {
    programId: link?.programId ?? '',
    classTypeId: link?.classTypeId ?? '',
    publishedDate: link?.publishedDate ?? scheduledDate,
    publishedTime: link?.publishedTime ?? currentTime(),
    scheduledDate,
  };
}

function sessionDraftError(draft: SessionDraft) {
  if (!draft.name.trim()) return 'El nombre de la sesión es obligatorio.';
  const hasExercises = extractExercisesFromSessionDraft(draft).some((exercise) => exercise.name.trim());
  if (!hasExercises && !hasSessionBlockContent(draft)) {
    return 'Añade al menos un bloque de entrenamiento.';
  }
  return null;
}

export function GymTrainingLinkFormModal({
  visible,
  link,
  programs,
  classTypes,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  link?: GymProgramLink | null;
  programs: readonly Program[];
  classTypes: readonly GymClassType[];
  onCancel: () => void;
  onSubmit: (input: GymProgramLinkInput) => Promise<{ error?: string }>;
}) {
  const { width, height } = useWindowDimensions();
  const [step, setStep] = useState<Step>('editor');
  const [draft, setDraft] = useState<SessionDraft>(() => createEmptySessionDraft(0));
  const [form, setForm] = useState<FormState>(() => toForm(link));
  const [saving, setSaving] = useState(false);
  const [pendingBlocks, setPendingBlocks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setForm(toForm(link));
    setDraft(link?.sessionDraft ?? createEmptySessionDraft(0));
    setStep('editor');
    setPendingBlocks(false);
    setError(null);
  }, [link, visible]);

  const patch = (changes: Partial<FormState>) => setForm((current) => ({ ...current, ...changes }));

  const handleContinueToSchedule = () => {
    const draftError = sessionDraftError(draft);
    if (draftError) {
      setError(draftError);
      return;
    }
    setError(null);
    setStep('schedule');
  };

  const handleSubmit = async () => {
    if (!form.classTypeId) {
      setError('Elige una modalidad del gimnasio.');
      return;
    }

    const selectedType = classTypes.find((type) => type.id === form.classTypeId);
    const programId =
      form.programId ||
      (selectedType ? programForGymClassType(selectedType.name, programs)?.id : '') ||
      '';

    if (!programId) {
      setError('No hay una programación de catálogo para esa modalidad.');
      return;
    }

    const trainingDate = new Date(`${form.scheduledDate}T12:00:00`);
    const sessionDraft = Number.isNaN(trainingDate.getTime())
      ? draft
      : pinCatalogSessionToDate(draft, trainingDate);

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      programId,
      classTypeId: form.classTypeId,
      publishedDate: form.publishedDate,
      publishedTime: form.publishedTime,
      scheduledDate: form.scheduledDate,
      sessionDraft,
      label: draft.name.trim(),
    });
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onCancel();
  };

  const editorMaxWidth = Math.min(720, width - spacing.lg * 2);
  const editorMaxHeight = Math.min(height * 0.92, height - spacing.lg * 2);
  const isEditor = step === 'editor';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.card, isEditor && { maxWidth: editorMaxWidth, maxHeight: editorMaxHeight }]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{link ? 'Editar entrenamiento' : 'Nuevo entrenamiento'}</Text>
              <Text style={styles.subtitle}>
                {isEditor
                  ? 'Escribe el entrenamiento como lo hacen los entrenadores. Al aceptar, eliges modalidad y fechas.'
                  : 'En qué modalidad, cuándo se publica y cuándo se entrena.'}
              </Text>
            </View>
            {isEditor ? null : (
              <Pressable
                onPress={() => {
                  setError(null);
                  setStep('editor');
                }}
                accessibilityLabel="Volver al entrenamiento"
                style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              >
                <AppIcon name="chevronLeft" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {isEditor ? (
            <>
              <ScrollView
                style={styles.editorScroll}
                contentContainerStyle={styles.editorContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <SessionEditorForm
                  draft={draft}
                  onChange={setDraft}
                  showSessionName
                  showTemplates={false}
                  showSchedule={false}
                  onPendingBlocksChange={setPendingBlocks}
                />
              </ScrollView>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={styles.actions}>
                <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.actionButton} />
                <Button
                  title="Programar publicación"
                  onPress={handleContinueToSchedule}
                  disabled={pendingBlocks}
                  style={styles.actionButton}
                />
              </View>
            </>
          ) : (
            <>
              <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Modalidad del gimnasio</Text>
                <View style={styles.chips}>
                  {classTypes.map((type) => {
                    const selected = form.classTypeId === type.id;
                    return (
                      <Pressable
                        key={type.id}
                        onPress={() =>
                          patch({
                            classTypeId: type.id,
                            programId: programForGymClassType(type.name, programs)?.id ?? '',
                          })
                        }
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        style={({ pressed }) => [
                          styles.chip,
                          selected && styles.chipActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        {type.color ? <View style={[styles.dot, { backgroundColor: type.color }]} /> : null}
                        <Text style={[styles.chipText, selected && styles.chipTextActive]}>{type.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.dateIntro}>
                  <AppIcon name="info" size={16} color={colors.accentBlue} />
                  <Text style={styles.dateIntroText}>
                    Selecciona el día y hora en que quieres que se publique este entrenamiento.
                  </Text>
                </View>

                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Fecha de publicación</Text>
                  <GymPickerBox
                    type="date"
                    value={form.publishedDate}
                    onChange={(publishedDate) => patch({ publishedDate })}
                    accessibilityLabel="Fecha de publicación"
                  />
                  <Text style={styles.fieldLabelNarrow}>Hora</Text>
                  <GymPickerBox
                    type="time"
                    value={form.publishedTime}
                    onChange={(publishedTime) => patch({ publishedTime })}
                    accessibilityLabel="Hora de publicación"
                  />
                </View>

                <View style={styles.fieldRowLast}>
                  <Text style={styles.fieldLabel}>Fecha del entrenamiento</Text>
                  <GymPickerBox
                    type="date"
                    value={form.scheduledDate}
                    onChange={(scheduledDate) => patch({ scheduledDate })}
                    accessibilityLabel="Fecha del entrenamiento"
                  />
                </View>
              </ScrollView>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.actions}>
                <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.actionButton} />
                <Button title="Guardar" onPress={() => void handleSubmit()} loading={saving} style={styles.actionButton} />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  editorScroll: {
    flexShrink: 1,
  },
  editorContent: {
    paddingBottom: spacing.sm,
  },
  form: {
    flexGrow: 0,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dateIntro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dateIntroText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  fieldRowLast: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    width: 168,
  },
  fieldLabelNarrow: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.black,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
