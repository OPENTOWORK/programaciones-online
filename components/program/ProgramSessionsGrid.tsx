import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  CalendarDayActionsMenu,
  DayActionsButton,
  type CalendarDayActionId,
} from '@/components/trainer/CalendarDayActionsMenu';
import { AthleteMetconSessionsList } from '@/components/program/AthleteMetconSessionsList';
import { CreateSessionTemplateModal } from '@/components/trainer/CreateSessionTemplateModal';
import { SessionDraftSummary } from '@/components/trainer/SessionDraftSummary';
import { SessionEditorForm } from '@/components/trainer/SessionEditorForm';
import { SessionTemplatePickerModal } from '@/components/trainer/SessionTemplatePickerModal';
import { Button } from '@/components/ui/Button';
import { PopoverMenu, type PopoverAnchor } from '@/components/ui/PopoverMenu';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTemplates } from '@/hooks/useSessionTemplates';
import {
  deleteCatalogSession,
  persistCatalogSessionDraft,
} from '@/lib/catalogProgramCalendar';
import { resolveSessionTemplateModalityForProgram } from '@/lib/sessionTemplateModality';
import { hasSessionBlockContent } from '@/lib/sessionBlockSections';
import {
  canSaveSessionAsTemplate,
  mergeTemplatesIntoDraft,
} from '@/lib/sessionTemplates';
import {
  createEmptySessionDraft,
  createMetconDraftFor,
  createRestDayDraft,
  METCON_SESSION_NAME,
  workoutToSessionDraft,
  type SessionDraft,
} from '@/lib/trainerSessionDraft';
import { isProgramActiveForUser, startUserProgram } from '@/lib/userProgramService';
import { parseWorkoutBlocksFromText } from '@/lib/workoutBlockBuilder';
import type { Program, Workout } from '@/lib/types';

const GRID_COLS = 6;
const GRID_ROWS = 5;
const GRID_SIZE = GRID_COLS * GRID_ROWS;

interface ProgramSessionsGridProps {
  program: Program;
  workouts: Workout[];
  isLoading?: boolean;
  canManage?: boolean;
  onWorkoutsChange?: () => Promise<void> | void;
}

function assignWorkoutsToSlots(workouts: Workout[]): Array<Workout | null> {
  const slots: Array<Workout | null> = Array.from({ length: GRID_SIZE }, () => null);
  const unplaced: Workout[] = [];

  for (const workout of workouts) {
    const order = workout.schedule?.dayOrder;
    if (typeof order === 'number' && order >= 0 && order < GRID_SIZE && !slots[order]) {
      slots[order] = workout;
    } else {
      unplaced.push(workout);
    }
  }

  for (const workout of unplaced) {
    const free = slots.findIndex((entry) => entry == null);
    if (free < 0) break;
    slots[free] = workout;
  }

  return slots;
}

function withSlotOrder(draft: SessionDraft, slotIndex: number): SessionDraft {
  return {
    ...draft,
    dayOrder: slotIndex,
    schedule: {
      ...draft.schedule,
      dayOrder: slotIndex,
      ...(draft.kind && draft.kind !== 'session' ? { kind: draft.kind } : {}),
    },
  };
}

function buildMetconDraftForSlot(workouts: Workout[], slotIndex: number): SessionDraft {
  const metcon = createMetconDraftFor(createEmptySessionDraft(workouts.length));
  return withSlotOrder(
    {
      ...metcon,
      name: `Metcon ${slotIndex + 1}`,
      dayLabel: 'Sesión libre',
    },
    slotIndex,
  );
}

function countBlocks(workout: Workout) {
  return (
    parseWorkoutBlocksFromText(workout.warmup).length +
    parseWorkoutBlocksFromText(workout.main).length +
    parseWorkoutBlocksFromText(workout.core ?? '').length +
    parseWorkoutBlocksFromText(workout.cooldown).length
  );
}

function chipMeta(workout: Workout) {
  if (workout.schedule?.kind === 'rest') return 'Descanso';
  const blocks = countBlocks(workout);
  const exercises = workout.exercises.length;
  const parts = [workout.estimatedDuration || '60 min'];
  if (blocks > 0) parts.push(`${blocks} bloque${blocks === 1 ? '' : 's'}`);
  if (exercises > 0) parts.push(`${exercises} ejercicio${exercises === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

/** En la cuadrícula Metcon siempre mostramos Metcon (nunca Activación). */
function metconDisplayName(workout: Workout) {
  const raw = workout.name.trim().replace(/^=\s*/, '');
  if (!raw || /^activaci[oó]n$/i.test(raw)) return METCON_SESSION_NAME;
  return raw;
}

function asMetconDraft(draft: SessionDraft, slotIndex: number): SessionDraft {
  return withSlotOrder(
    {
      ...draft,
      kind: 'metcon',
      name: METCON_SESSION_NAME,
      dayLabel: 'Sesión libre',
      schedule: {
        ...draft.schedule,
        kind: 'metcon',
      },
    },
    slotIndex,
  );
}

export function ProgramSessionsGrid({
  program,
  workouts,
  isLoading = false,
  canManage = false,
  onWorkoutsChange,
}: ProgramSessionsGridProps) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { user, refreshUser } = useAuth();
  const { create: createTemplate } = useSessionTemplates();
  const preferredModality = useMemo(
    () => resolveSessionTemplateModalityForProgram(program),
    [program],
  );
  const [starting, setStarting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [slotMenu, setSlotMenu] = useState<{
    slotIndex: number;
    workout: Workout | null;
    anchor: PopoverAnchor;
  } | null>(null);
  const [chipMenu, setChipMenu] = useState<{
    workout: Workout;
    slotIndex: number;
    anchor: PopoverAnchor;
  } | null>(null);
  const [editor, setEditor] = useState<{
    draft: SessionDraft;
    slotIndex: number;
    workoutId?: string;
  } | null>(null);
  const [pendingBlocks, setPendingBlocks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [templatePickerSlot, setTemplatePickerSlot] = useState<number | null>(null);
  const [templatePickerWorkout, setTemplatePickerWorkout] = useState<Workout | null>(null);
  const [templateApplying, setTemplateApplying] = useState(false);
  const [createTemplateWorkout, setCreateTemplateWorkout] = useState<Workout | null>(null);
  const [createTemplateSaving, setCreateTemplateSaving] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const isLocked = program.status === 'bloqueada';
  const isUserActive = isProgramActiveForUser(
    program.id,
    user?.currentPrograms,
    user?.currentProgramId,
  );
  const canJoin = !canManage && !isLocked && !isUserActive && workouts.length > 0;
  const slots = useMemo(() => assignWorkoutsToSlots(workouts), [workouts]);
  const filledSlots = useMemo(
    () =>
      slots
        .map((workout, slotIndex) => (workout ? { workout, slotIndex } : null))
        .filter((entry): entry is { workout: Workout; slotIndex: number } => entry !== null),
    [slots],
  );
  const editorMaxWidth = Math.min(720, width - spacing.lg * 2);
  const editorMaxHeight = Math.min(height * 0.9, 860);

  const refreshWorkouts = useCallback(async () => {
    await onWorkoutsChange?.();
  }, [onWorkoutsChange]);

  const openCreateEditor = useCallback(
    (slotIndex: number) => {
      setSelectedSlot(slotIndex);
      setFormError(null);
      setPendingBlocks(false);
      setEditor({
        draft: buildMetconDraftForSlot(workouts, slotIndex),
        slotIndex,
      });
    },
    [workouts],
  );

  const openEditEditor = useCallback((workout: Workout, slotIndex: number) => {
    setSelectedSlot(slotIndex);
    setFormError(null);
    setPendingBlocks(false);
    setEditor({
      draft: asMetconDraft(workoutToSessionDraft(workout, 0), slotIndex),
      slotIndex,
      workoutId: workout.id,
    });
  }, []);

  const closeEditor = useCallback(() => {
    if (saving) return;
    setEditor(null);
    setFormError(null);
    setPendingBlocks(false);
  }, [saving]);

  const handleSaveEditor = useCallback(async () => {
    if (!editor) return;
    if (pendingBlocks) {
      setFormError('Completa o elimina el bloque que estás editando antes de guardar el entreno.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const draft = asMetconDraft(editor.draft, editor.slotIndex);
      const error = await persistCatalogSessionDraft(program, workouts, draft, editor.workoutId);
      if (error) {
        setFormError(error);
        return;
      }
      setEditor(null);
      setPendingBlocks(false);
      await refreshWorkouts();
      if (editor.workoutId) {
        setCollapsedIds((current) => {
          const next = new Set(current);
          next.delete(editor.workoutId!);
          return next;
        });
      } else {
        setSelectedSlot(editor.slotIndex);
      }    } finally {
      setSaving(false);
    }
  }, [editor, pendingBlocks, program, refreshWorkouts, workouts]);

  const handleJoin = useCallback(async () => {
    if (!canJoin) return;
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para apuntarte a una programación.');
      return;
    }

    setStarting(true);
    const { error } = await startUserProgram(user.id, program.id);
    setStarting(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    await refreshUser(true);
    Alert.alert('Listo', `Te has apuntado a "${program.name}".`);
  }, [canJoin, program.id, program.name, refreshUser, user]);

  const handleDelete = useCallback(
    (workout: Workout) => {
      Alert.alert('Eliminar sesión', `¿Eliminar "${workout.name}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              const error = await deleteCatalogSession(workout.id);
              if (error) {
                Alert.alert('Error', error);
                return;
              }
              setCollapsedIds((current) => {
                const next = new Set(current);
                next.delete(workout.id);
                return next;
              });
              setSelectedIds((current) => {
                const next = new Set(current);
                next.delete(workout.id);
                return next;
              });
              await refreshWorkouts();
            })();
          },
        },
      ]);
    },
    [refreshWorkouts],
  );

  const handleSlotActionsPress = useCallback(
    (slotIndex: number, workout: Workout | null, anchor: PopoverAnchor) => {
      setSelectedSlot(slotIndex);
      setSlotMenu({ slotIndex, workout, anchor });
    },
    [],
  );

  const handleSlotAction = useCallback(
    (action: CalendarDayActionId) => {
      if (!slotMenu) return;
      const { slotIndex, workout } = slotMenu;
      setSlotMenu(null);

      if (action === 'session') {
        if (workout) openEditEditor(workout, slotIndex);
        else openCreateEditor(slotIndex);
        return;
      }

      if (action === 'rest') {
        void (async () => {
          const draft = withSlotOrder(createRestDayDraft(workouts.length), slotIndex);
          const error = await persistCatalogSessionDraft(program, workouts, draft);
          if (error) {
            Alert.alert('Error', error);
            return;
          }
          await refreshWorkouts();
        })();
        return;
      }

      if (action === 'template') {
        setTemplatePickerWorkout(workout);
        setTemplatePickerSlot(slotIndex);
        return;
      }

      if (action === 'copy') {
        if (!workout) return;
        const freeSlot = slots.findIndex((entry) => entry == null);
        if (freeSlot < 0) {
          Alert.alert('Cuadrícula llena', 'No hay huecos libres para copiar la sesión.');
          return;
        }
        void (async () => {
          const draft = withSlotOrder(workoutToSessionDraft(workout, workouts.length), freeSlot);
          const error = await persistCatalogSessionDraft(program, workouts, draft);
          if (error) {
            Alert.alert('Error', error);
            return;
          }
          await refreshWorkouts();
        })();
        return;
      }

      if (action === 'nutrition') {
        Alert.alert('Nutrición', 'La nutrición aún no está disponible en Metcon.');
      }
    },
    [openCreateEditor, openEditEditor, program, refreshWorkouts, slotMenu, slots, workouts],
  );

  const closeTemplatePicker = useCallback(() => {
    if (templateApplying) return;
    setTemplatePickerSlot(null);
    setTemplatePickerWorkout(null);
  }, [templateApplying]);

  const handleTemplateSelect = useCallback(
    async (templates: Array<{ name?: string; content: string; formatTag?: string | null }>) => {
      if (templates.length === 0 || templatePickerSlot == null) {
        closeTemplatePicker();
        return;
      }

      setTemplateApplying(true);
      try {
        const names = templates.map((template) => template.name).filter(Boolean) as string[];
        const label =
          names.length === 0
            ? `${templates.length} plantilla${templates.length === 1 ? '' : 's'}`
            : names.length <= 2
              ? names.join(' + ')
              : `${names[0]} + ${names.length - 1} más`;

        if (templatePickerWorkout) {
          const draft = asMetconDraft(
            mergeTemplatesIntoDraft(
              workoutToSessionDraft(templatePickerWorkout, 0),
              templates.map((template) => template.content),
            ),
            templatePickerSlot,
          );
          const error = await persistCatalogSessionDraft(
            program,
            workouts,
            draft,
            templatePickerWorkout.id,
          );
          if (error) {
            Alert.alert('No se pudo aplicar', error);
            return;
          }
          closeTemplatePicker();
          Alert.alert('Plantillas aplicadas', `Se añadieron los bloques de ${label} a esta sesión.`);
          await refreshWorkouts();
          return;
        }

        const draft = asMetconDraft(
          mergeTemplatesIntoDraft(
            buildMetconDraftForSlot(workouts, templatePickerSlot),
            templates.map((template) => template.content),
          ),
          templatePickerSlot,
        );
        const error = await persistCatalogSessionDraft(program, workouts, draft);
        if (error) {
          Alert.alert('No se pudo aplicar', error);
          return;
        }
        closeTemplatePicker();
        Alert.alert('Sesión creada', `Se creó un metcon combinando ${label}.`);
        await refreshWorkouts();
      } finally {
        setTemplateApplying(false);
      }
    },
    [
      closeTemplatePicker,
      program,
      refreshWorkouts,
      templatePickerSlot,
      templatePickerWorkout,
      workouts,
    ],
  );

  const toggleExpanded = useCallback((workoutId: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(workoutId)) next.delete(workoutId);
      else next.add(workoutId);
      return next;
    });
  }, []);

  const toggleSelected = useCallback((workoutId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(workoutId)) next.delete(workoutId);
      else next.add(workoutId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedWorkouts = useMemo(
    () => workouts.filter((workout) => selectedIds.has(workout.id)),
    [selectedIds, workouts],
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedWorkouts.length === 0) return;

    Alert.alert(
      'Eliminar sesiones',
      `¿Eliminar ${selectedWorkouts.length} sesión${selectedWorkouts.length === 1 ? '' : 'es'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBulkDeleting(true);
              try {
                for (const workout of selectedWorkouts) {
                  const error = await deleteCatalogSession(workout.id);
                  if (error) {
                    Alert.alert('Error', error);
                    return;
                  }
                }
                setSelectedIds(new Set());
                setCollapsedIds((current) => {
                  const next = new Set(current);
                  for (const workout of selectedWorkouts) next.delete(workout.id);
                  return next;
                });
                await refreshWorkouts();
              } finally {
                setBulkDeleting(false);
              }
            })();
          },
        },
      ],
    );
  }, [refreshWorkouts, selectedWorkouts]);

  const chipMenuActions = useMemo(() => {
    if (!chipMenu || !canManage) return [];
    const { workout, slotIndex } = chipMenu;
    const draft = workoutToSessionDraft(workout, 0);
    const actions: Array<{
      key: string;
      label: string;
      destructive?: boolean;
      onPress: () => void;
    }> = [
      {
        key: 'edit',
        label: 'Editar',
        onPress: () => {
          setChipMenu(null);
          openEditEditor(workout, slotIndex);
        },
      },
      {
        key: 'use-template',
        label: 'Usar plantilla',
        onPress: () => {
          setChipMenu(null);
          setTemplatePickerWorkout(workout);
          setTemplatePickerSlot(slotIndex);
        },
      },
    ];

    if (canSaveSessionAsTemplate(draft) || hasSessionBlockContent(draft)) {
      actions.push({
        key: 'create-template',
        label: 'Crear plantilla',
        onPress: () => {
          setChipMenu(null);
          setCreateTemplateWorkout(workout);
        },
      });
    }

    actions.push(
      {
        key: 'copy',
        label: 'Copiar',
        onPress: () => {
          setChipMenu(null);
          const freeSlot = slots.findIndex((entry) => entry == null);
          if (freeSlot < 0) {
            Alert.alert('Cuadrícula llena', 'No hay huecos libres para copiar la sesión.');
            return;
          }
          void (async () => {
            const copied = withSlotOrder(workoutToSessionDraft(workout, workouts.length), freeSlot);
            const error = await persistCatalogSessionDraft(program, workouts, copied);
            if (error) {
              Alert.alert('Error', error);
              return;
            }
            await refreshWorkouts();
          })();
        },
      },
      {
        key: 'delete',
        label: 'Eliminar',
        destructive: true,
        onPress: () => {
          setChipMenu(null);
          handleDelete(workout);
        },
      },
    );

    return actions;
  }, [
    canManage,
    chipMenu,
    handleDelete,
    openEditEditor,
    program,
    refreshWorkouts,
    slots,
    workouts,
  ]);

  if (isLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.metcon} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{program.name}</Text>
        </View>
        {canManage ? (
          <View style={styles.headerActions}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/program/[id]/chat',
                  params: { id: program.id },
                })
              }
              style={({ pressed }) => [styles.headerLink, pressed && styles.headerLinkPressed]}
              accessibilityRole="link"
            >
              <Text style={styles.headerLinkText}>Chat grupal</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/trainer/template')}
              style={({ pressed }) => [styles.headerLink, pressed && styles.headerLinkPressed]}
              accessibilityRole="link"
            >
              <Text style={styles.headerLinkText}>Plantillas</Text>
            </Pressable>
          </View>
        ) : isUserActive ? (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/program/[id]/chat',
                params: { id: program.id },
              })
            }
            style={({ pressed }) => [styles.headerLink, pressed && styles.headerLinkPressed]}
            accessibilityRole="link"
          >
            <Text style={styles.headerLinkText}>Chat grupal</Text>
          </Pressable>
        ) : null}
      </View>

      {canJoin ? (
        <Button
          title="Apuntarme a esta programación"
          onPress={() => void handleJoin()}
          loading={starting}
          style={styles.joinBtn}
        />
      ) : null}

      {isUserActive ? (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Programación activa</Text>
        </View>
      ) : null}

      {canManage && selectedWorkouts.length > 0 ? (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionBarText}>
            {selectedWorkouts.length} sesión{selectedWorkouts.length === 1 ? '' : 'es'} seleccionada
            {selectedWorkouts.length === 1 ? '' : 's'}
          </Text>
          <View style={styles.selectionBarActions}>
            <Button
              title="Eliminar"
              onPress={handleBulkDelete}
              loading={bulkDeleting}
              style={styles.selectionBarBtn}
            />
            <Button
              title="Cancelar"
              variant="outline"
              onPress={clearSelection}
              disabled={bulkDeleting}
              style={styles.selectionBarBtn}
            />
          </View>
        </View>
      ) : null}

      {!canManage ? (
        <AthleteMetconSessionsList program={program} entries={filledSlots} />
      ) : (
      <View style={styles.grid}>
        {Array.from({ length: GRID_ROWS }, (_, row) => (
          <View key={`row-${row}`} style={styles.row}>
            {Array.from({ length: GRID_COLS }, (_, col) => {
              const slotIndex = row * GRID_COLS + col;
              const workout = slots[slotIndex];
              const selected = selectedSlot === slotIndex;
              const expanded = workout ? !collapsedIds.has(workout.id) : false;
              const checked = workout ? selectedIds.has(workout.id) : false;

              return (
                <View
                  key={`slot-${slotIndex}`}
                  style={[styles.cell, selected && styles.cellSelected, expanded && styles.cellExpanded]}
                >
                  <Pressable
                    onPress={() => setSelectedSlot(slotIndex)}
                    style={styles.cellHeader}
                  >
                    <View style={styles.cellHeaderMain}>
                      <Text style={styles.cellKicker}>Metcon</Text>
                      <Text style={styles.cellIndex}>{slotIndex + 1}</Text>
                    </View>
                    {canManage ? (
                      <DayActionsButton
                        color={colors.metcon}
                        onPress={(anchor) => handleSlotActionsPress(slotIndex, workout, anchor)}
                      />
                    ) : null}
                  </Pressable>

                  {workout ? (
                    <MetconSessionChip
                      workout={workout}
                      expanded={expanded}
                      checked={checked}
                      canManage={canManage}
                      onToggleExpanded={() => toggleExpanded(workout.id)}
                      onToggleChecked={
                        canManage
                          ? () => {
                              setSelectedSlot(slotIndex);
                              toggleSelected(workout.id);
                            }
                          : undefined
                      }
                      onMenuPress={
                        canManage
                          ? (anchor) => setChipMenu({ workout, slotIndex, anchor })
                          : undefined
                      }
                      onOpen={() => {
                        setSelectedSlot(slotIndex);
                        if (canManage) toggleExpanded(workout.id);
                        else {
                          router.push({
                            pathname: '/workout/[id]',
                            params: { id: workout.id },
                          });
                        }
                      }}
                    />
                  ) : (
                    <Pressable onPress={() => setSelectedSlot(slotIndex)}>
                      <Text style={styles.cellEmpty}>Sin sesión</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      )}

      <CalendarDayActionsMenu
        visible={slotMenu !== null}
        anchor={slotMenu?.anchor ?? null}
        onClose={() => setSlotMenu(null)}
        onAction={handleSlotAction}
        canCopy={Boolean(slotMenu?.workout)}
        hasRestDay={slotMenu?.workout?.schedule?.kind === 'rest'}
        accentColor={colors.metcon}
      />

      <PopoverMenu
        visible={chipMenu !== null}
        anchor={chipMenu?.anchor ?? null}
        title={chipMenu ? metconDisplayName(chipMenu.workout) : undefined}
        actions={chipMenuActions}
        onClose={() => setChipMenu(null)}
      />

      <SessionTemplatePickerModal
        visible={canManage && templatePickerSlot !== null}
        onClose={closeTemplatePicker}
        onConfirm={(templates) => void handleTemplateSelect(templates)}
        saving={templateApplying}
        zoneTag="Metcon"
        defaultModality={preferredModality}
        confirmLabel={templatePickerWorkout ? 'Añadir a la sesión' : 'Crear sesión'}
        subtitle={
          templatePickerWorkout
            ? 'Marca una o varias plantillas; sus bloques se añadirán a esta sesión.'
            : 'Marca una o varias plantillas para crear un metcon nuevo con todas ellas.'
        }
      />

      <CreateSessionTemplateModal
        visible={canManage && createTemplateWorkout !== null}
        draft={createTemplateWorkout ? workoutToSessionDraft(createTemplateWorkout, 0) : null}
        defaultModality={preferredModality}
        saving={createTemplateSaving}
        onClose={() => {
          if (createTemplateSaving) return;
          setCreateTemplateWorkout(null);
        }}
        onConfirm={(input) => {
          void (async () => {
            setCreateTemplateSaving(true);
            const result = await createTemplate(
              input.name,
              input.content,
              input.tag,
              input.formatTag,
              input.modalityTag,
            );
            setCreateTemplateSaving(false);
            if (result.error) {
              Alert.alert('No se pudo guardar', result.error);
              return;
            }
            setCreateTemplateWorkout(null);
            Alert.alert('Plantilla guardada', `Se guardó «${input.name}».`);
          })();
        }}
      />

      <Modal visible={editor !== null} transparent animationType="fade" onRequestClose={closeEditor}>
        <View style={styles.editorOverlay} pointerEvents="box-none">
          <Pressable style={styles.editorBackdrop} onPress={closeEditor} accessibilityLabel="Cerrar editor" />
          <View style={[styles.editorDialog, { maxWidth: editorMaxWidth, maxHeight: editorMaxHeight }]}>
            <View style={styles.editorDialogHeader}>
              <View style={styles.editorDialogHeaderText}>
                <Text style={styles.editorTitle}>
                  {editor?.workoutId ? 'Editar metcon' : 'Nuevo metcon'}
                </Text>
                <Text style={styles.editorHint}>
                  Casilla {editor ? editor.slotIndex + 1 : ''} · Sesión libre
                </Text>
              </View>
              <Pressable
                onPress={closeEditor}
                accessibilityLabel="Cerrar"
                style={({ pressed }) => [styles.editorCloseBtn, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {editor ? (
              <ScrollView
                style={styles.editorScroll}
                contentContainerStyle={styles.editorContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <SessionEditorForm
                  draft={editor.draft}
                  onChange={(draft) =>
                    setEditor((current) => (current ? { ...current, draft } : current))
                  }
                  showSessionName
                  showSchedule={false}
                  showTemplates={false}
                  onPendingBlocksChange={setPendingBlocks}
                />

                {formError ? <Text style={styles.error}>{formError}</Text> : null}

                <View style={styles.editorActions}>
                  <Button
                    title={editor.workoutId ? 'Guardar cambios' : 'Guardar entrenamiento'}
                    onPress={() => void handleSaveEditor()}
                    loading={saving}
                    style={styles.editorActionBtn}
                  />
                  <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={closeEditor}
                    style={styles.editorActionBtn}
                  />
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

function MetconSessionChip({
  workout,
  expanded,
  checked,
  canManage,
  onToggleExpanded,
  onToggleChecked,
  onMenuPress,
  onOpen,
}: {
  workout: Workout;
  expanded: boolean;
  checked: boolean;
  canManage: boolean;
  onToggleExpanded: () => void;
  onToggleChecked?: () => void;
  onMenuPress?: (anchor: PopoverAnchor) => void;
  onOpen: () => void;
}) {
  const menuRef = useRef<View>(null);
  const draft = useMemo(() => workoutToSessionDraft(workout, 0), [workout]);

  return (
    <View style={[styles.sessionChip, expanded && styles.sessionChipExpanded]}>
      <View style={styles.sessionChipHeader}>
        {canManage ? (
          <View style={styles.dragHandle} accessibilityLabel="Reordenar">
            <Ionicons name="menu-outline" size={14} color={colors.textMuted} />
          </View>
        ) : null}
        <Pressable
          onPress={onOpen}
          style={({ pressed }) => [styles.sessionChipTitleBtn, pressed && styles.pressed]}
        >
          <Text style={styles.sessionChipName} numberOfLines={expanded ? 2 : 1}>
            {metconDisplayName(workout)}
          </Text>
        </Pressable>
        <View style={styles.sessionChipActions}>
          {onToggleChecked ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation?.();
                onToggleChecked();
              }}
              hitSlop={6}
              accessibilityLabel={checked ? 'Quitar selección' : 'Seleccionar sesión'}
              style={({ pressed }) => [styles.chipIconBtn, pressed && styles.pressed]}
            >
              <Ionicons
                name={checked ? 'checkbox' : 'square-outline'}
                size={16}
                color={checked ? colors.metcon : colors.textMuted}
              />
            </Pressable>
          ) : null}
          {onMenuPress ? (
            <Pressable
              ref={menuRef}
              onPress={(event) => {
                event.stopPropagation?.();
                menuRef.current?.measureInWindow((x, y, width, height) =>
                  onMenuPress({ x, y, width, height }),
                );
              }}
              hitSlop={6}
              accessibilityLabel="Más opciones"
              style={({ pressed }) => [styles.chipIconBtn, pressed && styles.pressed]}
            >
              <Ionicons name="ellipsis-horizontal" size={14} color={colors.textSecondary} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={(event) => {
              event.stopPropagation?.();
              onToggleExpanded();
            }}
            hitSlop={6}
            accessibilityLabel={expanded ? 'Ocultar el entrenamiento' : 'Ver todo el entrenamiento'}
            style={({ pressed }) => [styles.chipIconBtn, pressed && styles.pressed]}
          >
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={expanded ? colors.metcon : colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      <Text style={styles.sessionChipMeta} numberOfLines={expanded ? 3 : 1}>
        {chipMeta(workout)}
      </Text>

      {expanded ? (
        <View style={styles.sessionChipDetail}>
          <SessionDraftSummary draft={draft} hideSectionLabels />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  headerLink: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.metcon,
    backgroundColor: `${colors.metcon}14`,
  },
  headerLinkPressed: {
    opacity: 0.85,
  },
  headerLinkText: {
    ...typography.caption,
    color: colors.metcon,
    fontWeight: '700',
  },
  joinBtn: {
    marginBottom: spacing.md,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.metcon}18`,
    borderWidth: 1,
    borderColor: `${colors.metcon}55`,
    marginBottom: spacing.md,
  },
  activeBadgeText: {
    ...typography.caption,
    color: colors.metcon,
    fontWeight: '700',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.metcon}55`,
    backgroundColor: `${colors.metcon}10`,
  },
  selectionBarText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  selectionBarActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectionBarBtn: {
    paddingHorizontal: spacing.sm,
    minWidth: 96,
  },
  grid: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    minWidth: 0,
    minHeight: 140,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  cellSelected: {
    borderColor: colors.metcon,
    backgroundColor: `${colors.metcon}10`,
  },
  cellExpanded: {
    minHeight: 220,
  },
  cellHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  cellHeaderMain: {
    alignItems: 'center',
    flex: 1,
  },
  cellKicker: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  cellIndex: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  cellEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  sessionChip: {
    backgroundColor: `${colors.metcon}1A`,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: `${colors.metcon}66`,
    gap: 4,
  },
  sessionChipExpanded: {
    gap: spacing.sm,
  },
  sessionChipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 4,
  },
  dragHandle: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  sessionChipTitleBtn: {
    flex: 1,
    minWidth: 0,
  },
  sessionChipName: {
    ...typography.caption,
    color: colors.metcon,
    fontWeight: '700',
  },
  sessionChipActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  chipIconBtn: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  sessionChipMeta: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  sessionChipDetail: {
    borderTopWidth: 1,
    borderTopColor: `${colors.metcon}33`,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  editorOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  editorBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  editorDialog: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    zIndex: 1,
  },
  editorDialogHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editorDialogHeaderText: {
    flex: 1,
    gap: 2,
  },
  editorTitle: {
    ...typography.h3,
    color: colors.text,
  },
  editorHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  editorCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editorScroll: {
    maxHeight: 640,
  },
  editorContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  editorActions: {
    gap: spacing.sm,
  },
  editorActionBtn: {
    width: '100%',
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  pressed: {
    opacity: 0.85,
  },
});
