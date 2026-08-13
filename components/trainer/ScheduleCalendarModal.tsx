import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { CopyDayToDateModal } from '@/components/trainer/CopyDayToDateModal';
import {
  CalendarDayActionsMenu,
  type CalendarDayActionId,
} from '@/components/trainer/CalendarDayActionsMenu';
import { CreateSessionTemplateModal } from '@/components/trainer/CreateSessionTemplateModal';
import { SessionTemplatePickerModal } from '@/components/trainer/SessionTemplatePickerModal';
import { SessionInlineTextEditor } from '@/components/trainer/SessionInlineTextEditor';
import { SessionDraftSummary } from '@/components/trainer/SessionDraftSummary';
import { SessionEditorForm } from '@/components/trainer/SessionEditorForm';
import { type ActionSheetAction } from '@/components/ui/ActionSheetModal';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PopoverMenu, type PopoverAnchor } from '@/components/ui/PopoverMenu';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTemplates } from '@/hooks/useSessionTemplates';
import { isTrainerRole } from '@/lib/athleteService';
import {
  formatDayLabel,
  itemsForDate,
  parseSchedulePreviewItemKey,
  type SchedulePreviewItem,
  type ScheduleViewMode,
} from '@/lib/programSchedulePreview';
import { buildScheduleCalendarItems, type ScheduleCalendarSource } from '@/lib/scheduleCalendarItems';
import {
  canSaveSessionAsTemplate,
  mergeTemplatesIntoDraft,
} from '@/lib/sessionTemplates';
import {
  applyInlineTextToSessionDraft,
  sessionDraftToInlineText,
} from '@/lib/sessionInlineText';
import { createActivationDraftFor, workoutToSessionDraft, type SessionDraft } from '@/lib/trainerSessionDraft';

import { CalendarSessionTypePickerModal, type CalendarSessionType } from '@/components/trainer/CalendarSessionTypePickerModal';

import {
  ScheduleCalendarGrid,
  isSelectableCalendarSession,
  scheduleItemKey,
  shiftSchedulePeriod,
  type CalendarSessionActions,
} from '@/components/trainer/ScheduleCalendarGrid';

export interface CalendarSessionSaveInput {
  draft: SessionDraft;
  date: Date;
  item?: SchedulePreviewItem;
}

interface ScheduleCalendarModalProps {
  visible: boolean;
  onClose?: () => void;
  title: string;
  subtitle?: string;
  source: ScheduleCalendarSource;
  /** Modal sobre otra pantalla, o incrustado como pantalla completa. */
  presentation?: 'modal' | 'inline';
  /** Acción de cabecera alternativa al botón de cerrar (p. ej. enlace a la ficha). */
  headerAction?: ReactNode;
  /** Abre la sesión en solo lectura tal y como la verá el atleta. */
  onSessionPreview?: (item: SchedulePreviewItem) => void;
  /** Alternativa cuando la sesión no se puede editar dentro del calendario. */
  onSessionEdit?: (item: SchedulePreviewItem) => void;
  canEditSession?: (item: SchedulePreviewItem) => boolean;
  /** Alternativa cuando no hay editor dentro del calendario. */
  onCreateSession?: (date: Date) => void;
  /** Borrador inicial para crear un entreno en la fecha elegida. */
  buildSessionDraft?: (date: Date) => SessionDraft;
  /** Borrador de día de descanso para la fecha elegida. */
  buildRestDayDraft?: (date: Date) => SessionDraft;
  /** Acciones del menú del día que se resuelven fuera del calendario (p. ej. nutrición). */
  onDayAction?: (
    action: CalendarDayActionId,
    context: { date: Date; dayItems: SchedulePreviewItem[] },
  ) => void;
  /** Borrador de una sesión existente para editarla sin salir del calendario. */
  loadSessionDraft?: (item: SchedulePreviewItem) => SessionDraft | null;
  /** Guarda el entreno creado o editado. Devuelve un mensaje de error o null. */
  saveSession?: (input: CalendarSessionSaveInput) => Promise<string | null> | string | null;
  /** Duplica la sesión del calendario. Devuelve un mensaje de error o null. */
  onSessionCopy?: (item: SchedulePreviewItem) => Promise<string | null> | string | null;
  /** Copia todas las sesiones de un día a otra fecha. */
  onCopyDayToDate?: (
    sourceDate: Date,
    targetDate: Date,
    items: SchedulePreviewItem[],
  ) => Promise<string | null> | string | null;
  /** Elimina la sesión del calendario. Devuelve un mensaje de error o null. */
  onSessionDelete?: (item: SchedulePreviewItem) => Promise<string | null> | string | null;
  /**
   * Mueve la sesión a otro día. `dayItems` trae el día de destino con la sesión ya colocada en el
   * hueco donde se soltó. Devuelve un mensaje de error o null.
   */
  onSessionMoveToDate?: (
    item: SchedulePreviewItem,
    date: Date,
    dayItems?: SchedulePreviewItem[],
  ) => Promise<string | null> | string | null;
  /** Guarda el orden de las sesiones de un día. Devuelve un mensaje de error o null. */
  onSessionReorderDay?: (
    date: Date,
    orderedItems: SchedulePreviewItem[],
  ) => Promise<string | null> | string | null;
}

export function ScheduleCalendarModal({
  visible,
  onClose,
  title,
  subtitle,
  source,
  presentation = 'modal',
  headerAction,
  onSessionEdit,
  onCreateSession,
  buildSessionDraft,
  buildRestDayDraft,
  onDayAction,
  loadSessionDraft,
  saveSession,
  onSessionCopy,
  onCopyDayToDate,
  onSessionDelete,
  onSessionMoveToDate,
  onSessionReorderDay,
}: ScheduleCalendarModalProps) {
  const { user } = useAuth();
  const isTrainer = isTrainerRole(user?.role);
  const { width, height } = useWindowDimensions();
  const isWideCalendar = width >= 960;
  const editorMaxWidth = Math.min(720, width - spacing.lg * 2);
  const editorMaxHeight = Math.min(height * 0.88, 860);
  const editorScrollMaxHeight = editorMaxHeight - 88;

  const [viewMode, setViewMode] = useState<ScheduleViewMode>('week');
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [visiblePeriods, setVisiblePeriods] = useState(1);
  const [editor, setEditor] = useState<{
    item?: SchedulePreviewItem;
    draft: SessionDraft;
    date: Date;
  } | null>(null);
  const [inlineEditor, setInlineEditor] = useState<{
    item: SchedulePreviewItem;
    draft: SessionDraft;
    text: string;
  } | null>(null);
  const [expandedItemIds, setExpandedItemIds] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ item: SchedulePreviewItem; anchor: PopoverAnchor } | null>(null);
  const [dayMenu, setDayMenu] = useState<{
    date: Date;
    dayItems: SchedulePreviewItem[];
    anchor: PopoverAnchor;
  } | null>(null);
  const [copyDayPicker, setCopyDayPicker] = useState<{
    date: Date;
    dayItems: SchedulePreviewItem[];
  } | null>(null);
  const [copyDaySaving, setCopyDaySaving] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [templatePickerDate, setTemplatePickerDate] = useState<Date | null>(null);
  const [templatePickerItem, setTemplatePickerItem] = useState<SchedulePreviewItem | null>(null);
  const [templateApplying, setTemplateApplying] = useState(false);
  const [createTemplateItem, setCreateTemplateItem] = useState<SchedulePreviewItem | null>(null);
  const [createTemplateSaving, setCreateTemplateSaving] = useState(false);
  const { create: createTemplate } = useSessionTemplates();
  const [sessionTypePickerDate, setSessionTypePickerDate] = useState<Date | null>(null);
  const [deleteItem, setDeleteItem] = useState<SchedulePreviewItem | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedSessionKeys, setSelectedSessionKeys] = useState<Set<string>>(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pendingBlocks, setPendingBlocks] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [inlineSaving, setInlineSaving] = useState(false);

  const canCreateInline = Boolean(buildSessionDraft && saveSession);
  const showDayActions = Boolean(
    buildSessionDraft || buildRestDayDraft || onDayAction || onSessionCopy || onCopyDayToDate,
  );

  const planItemsFromDay = (dayItems: SchedulePreviewItem[]) =>
    dayItems.filter((item) => item.id.startsWith('plan:'));

  const openEditorWithDraft = (date: Date, draft: SessionDraft) => {
    setInlineEditor(null);
    setSelectedDate(date);
    setFormError(null);
    setPendingBlocks(false);
    setEditor({ draft, date });
  };

  const openCreateEditor = (date: Date) => {
    if (!buildSessionDraft || !saveSession) {
      onCreateSession?.(date);
      return;
    }
    openEditorWithDraft(date, buildSessionDraft(date));
  };

  const openActivationEditor = (date: Date) => {
    if (!buildSessionDraft || !saveSession) return;
    const base = buildSessionDraft(date);
    openEditorWithDraft(date, createActivationDraftFor(base));
  };

  const requestCreateSession = (date: Date) => {
    if (!buildSessionDraft || !saveSession) {
      onCreateSession?.(date);
      return;
    }
    setSessionTypePickerDate(date);
  };

  const handleSessionTypeSelect = (type: CalendarSessionType) => {
    const date = sessionTypePickerDate;
    setSessionTypePickerDate(null);
    if (!date) return;

    if (type === 'activation') {
      openActivationEditor(date);
      return;
    }

    openCreateEditor(date);
  };

  const saveRestDay = async (date: Date) => {
    if (!buildRestDayDraft || !saveSession) {
      onDayAction?.('rest', { date, dayItems: [] });
      return;
    }

    setFormError(null);
    const result = await saveSession({ draft: buildRestDayDraft(date), date });
    if (result) setFormError(result);
  };

  useEffect(() => {
    if (visible) return;
    setEditor(null);
    setInlineEditor(null);
    setFormError(null);
    setPendingBlocks(false);
    setInlineSaving(false);
    setExpandedItemIds([]);
    setMenu(null);
    setDayMenu(null);
    setCopyDayPicker(null);
    setCopyDaySaving(false);
    setTemplatePickerOpen(false);
    setTemplatePickerDate(null);
    setSessionTypePickerDate(null);
    setDeleteItem(null);
    setBulkDeleteOpen(false);
    setSelectedSessionKeys(new Set());
    setBulkDeleting(false);
  }, [visible]);

  const items = useMemo(() => {
    const seen = new Set<string>();
    const merged: SchedulePreviewItem[] = [];
    for (let index = 0; index < visiblePeriods; index += 1) {
      const periodDate = shiftSchedulePeriod(focusDate, viewMode, index);
      for (const item of buildScheduleCalendarItems(source, periodDate, viewMode)) {
        // Una misma sesión se repite en varias fechas, así que la clave incluye el día.
        const key = `${item.id}@${item.date.toDateString()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(item);
      }
    }
    return merged;
  }, [source, focusDate, viewMode, visiblePeriods]);

  const selectableItems = useMemo(
    () => items.filter(isSelectableCalendarSession),
    [items],
  );

  const selectedItems = useMemo(
    () => selectableItems.filter((item) => selectedSessionKeys.has(scheduleItemKey(item))),
    [selectableItems, selectedSessionKeys],
  );

  const toggleSessionSelection = useCallback((item: SchedulePreviewItem) => {
    const key = scheduleItemKey(item);
    setSelectedSessionKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const clearSessionSelection = useCallback(() => {
    setSelectedSessionKeys(new Set());
  }, []);

  const sessionSelection = onSessionDelete
    ? { selectedKeys: selectedSessionKeys, onToggle: toggleSessionSelection }
    : undefined;

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    if (visiblePeriods === 1) setFocusDate(date);
  };

  const handleViewModeChange = (mode: ScheduleViewMode) => {
    setViewMode(mode);
    setVisiblePeriods(1);
  };

  /** Sin panel lateral de día: en un día vacío se puede crear el entreno al tocarlo. */
  const handleDayPress = (date: Date) => {
    selectDate(date);
    if (showDayActions) return;
    const dayItems = itemsForDate(items, date);
    if (dayItems.length === 0 && (canCreateInline || onCreateSession)) {
      requestCreateSession(date);
    }
  };

  const handleDayActionsPress = (
    date: Date,
    dayItems: SchedulePreviewItem[],
    anchor: PopoverAnchor,
  ) => {
    selectDate(date);
    setDayMenu({ date, dayItems, anchor });
  };

  const handleDayAction = (action: CalendarDayActionId) => {
    if (!dayMenu) return;
    const { date, dayItems } = dayMenu;
    setDayMenu(null);

    if (action === 'session') {
      requestCreateSession(date);
      return;
    }

    if (action === 'rest') {
      void saveRestDay(date);
      return;
    }

    if (action === 'template') {
      if (!isTrainer || !buildSessionDraft || !saveSession) {
        onDayAction?.(action, { date, dayItems });
        return;
      }
      setTemplatePickerItem(null);
      setTemplatePickerDate(date);
      setTemplatePickerOpen(true);
      return;
    }

    if (action === 'copy') {
      const planItems = planItemsFromDay(dayItems);
      if (!onCopyDayToDate || planItems.length === 0) return;
      setCopyDayPicker({ date, dayItems: planItems });
      return;
    }

    onDayAction?.(action, { date, dayItems });
  };

  const closeTemplatePicker = () => {
    if (templateApplying) return;
    setTemplatePickerOpen(false);
    setTemplatePickerDate(null);
    setTemplatePickerItem(null);
  };

  const handleTemplateSelect = async (
    templates: Array<{ name?: string; content: string }>,
  ) => {
    if (!saveSession || templates.length === 0) {
      closeTemplatePicker();
      return;
    }

    setTemplateApplying(true);
    setFormError(null);
    const names = templates.map((template) => template.name).filter(Boolean) as string[];
    const label =
      names.length === 0
        ? `${templates.length} plantilla${templates.length === 1 ? '' : 's'}`
        : names.length <= 2
          ? names.join(' + ')
          : `${names[0]} + ${names.length - 1} más`;

    try {
      if (templatePickerItem && loadSessionDraft) {
        const item = templatePickerItem;
        const source = loadSessionDraft(item);
        if (!source) {
          Alert.alert('No se pudo aplicar', 'No se encontró la sesión de destino.');
          return;
        }
        const draft = mergeTemplatesIntoDraft(
          source,
          templates.map((template) => template.content),
        );
        const result = await saveSession({ draft, date: item.date, item });
        if (result) {
          setFormError(result);
          Alert.alert('No se pudo aplicar', result);
          return;
        }
        closeTemplatePicker();
        Alert.alert(
          'Plantillas aplicadas',
          `Se añadieron los bloques de ${label} a esta sesión.`,
        );
        return;
      }

      if (templatePickerDate && buildSessionDraft) {
        const date = templatePickerDate;
        const draft = mergeTemplatesIntoDraft(
          buildSessionDraft(date),
          templates.map((template) => template.content),
        );
        const result = await saveSession({ draft, date });
        if (result) {
          setFormError(result);
          Alert.alert('No se pudo aplicar', result);
          return;
        }
        closeTemplatePicker();
        Alert.alert('Sesión creada', `Se creó una sesión combinando ${label}.`);
      }
    } finally {
      setTemplateApplying(false);
    }
  };

  const openEditEditor = (item: SchedulePreviewItem) => {
    const draft = loadSessionDraft && saveSession ? loadSessionDraft(item) : null;
    if (!draft) {
      onSessionEdit?.(item);
      return;
    }
    setInlineEditor(null);
    setSelectedDate(item.date);
    setFormError(null);
    setPendingBlocks(false);
    setEditor({ item, draft, date: item.date });
  };

  const openInlineEditor = (item: SchedulePreviewItem) => {
    const draft = loadSessionDraft && saveSession ? loadSessionDraft(item) : null;
    if (!draft) return;

    const key = scheduleItemKey(item);
    setEditor(null);
    setFormError(null);
    setInlineEditor({ item, draft, text: sessionDraftToInlineText(draft) });
    setExpandedItemIds((current) => (current.includes(key) ? current : [...current, key]));
    setSelectedDate(item.date);
  };

  const closeInlineEditor = () => {
    setInlineEditor(null);
    setFormError(null);
  };

  const handleInlineSave = async () => {
    if (!inlineEditor || !saveSession) return;

    setInlineSaving(true);
    setFormError(null);
    try {
      const draft = applyInlineTextToSessionDraft(inlineEditor.text, inlineEditor.draft);
      const result = await saveSession({
        draft,
        date: inlineEditor.item.date,
        item: inlineEditor.item,
      });
      if (result) {
        setFormError(result);
        return;
      }
      closeInlineEditor();
    } finally {
      setInlineSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editor || !saveSession) return;
    if (pendingBlocks) {
      setFormError('Completa o elimina el bloque que estás editando antes de guardar el entreno.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const result = await saveSession({ draft: editor.draft, date: editor.date, item: editor.item });
      if (result) {
        setFormError(result);
        return;
      }
      setEditor(null);
      setPendingBlocks(false);
    } finally {
      setSaving(false);
    }
  };

  // Cada sesión se despliega por su cuenta: abrir una no cierra las demás.
  const toggleExpandedItem = (item: SchedulePreviewItem) => {
    const key = scheduleItemKey(item);
    const isExpanded = expandedItemIds.includes(key);
    if (isExpanded && inlineEditor && scheduleItemKey(inlineEditor.item) === key) {
      closeInlineEditor();
    }
    setExpandedItemIds((current) =>
      current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key],
    );
    setSelectedDate(item.date);
  };

  /** El calendario ya tiene los borradores y las sesiones guardadas, así que puede mostrar el contenido
   * aunque la pantalla no aporte un borrador editable. */
  const resolveDetailDraft = (item: SchedulePreviewItem): SessionDraft | null => {
    const editableDraft = loadSessionDraft?.(item);
    if (editableDraft) return editableDraft;

    const { sourceId } = parseSchedulePreviewItemKey(item.id);

    const workoutIndex = source.workouts.findIndex((entry) => entry.id === sourceId);
    if (workoutIndex >= 0) {
      return workoutToSessionDraft(source.workouts[workoutIndex], workoutIndex);
    }

    const queued = source.additionalDrafts?.find((entry) => entry.id === sourceId);
    if (queued) return queued.draft;

    if (item.isCurrent || sourceId === 'draft-new') return source.draft;

    return null;
  };

  const hasSessionMenu = Boolean(onSessionCopy || onSessionDelete || loadSessionDraft || onSessionEdit || saveSession);

  const handleSessionMoveToDate = async (
    item: SchedulePreviewItem,
    date: Date,
    dayItems?: SchedulePreviewItem[],
  ) => {
    if (!onSessionMoveToDate) return;
    const result = await onSessionMoveToDate(item, date, dayItems);
    if (result) setFormError(result);
  };

  const handleSessionReorderDay = async (date: Date, orderedItems: SchedulePreviewItem[]) => {
    if (!onSessionReorderDay) return;
    const result = await onSessionReorderDay(date, orderedItems);
    if (result) setFormError(result);
  };

  const handleSessionCopy = async (item: SchedulePreviewItem) => {
    if (!onSessionCopy) return;
    const result = await onSessionCopy(item);
    if (result) setFormError(result);
  };

  const handleSessionDelete = async (item: SchedulePreviewItem) => {
    if (!onSessionDelete) return;
    const result = await onSessionDelete(item);
    if (result) {
      setFormError(result);
      return;
    }
    setSelectedSessionKeys((current) => {
      const next = new Set(current);
      next.delete(scheduleItemKey(item));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!onSessionDelete || selectedItems.length === 0) return;

    setBulkDeleting(true);
    setFormError(null);
    try {
      for (const item of selectedItems) {
        const result = await onSessionDelete(item);
        if (result) {
          setFormError(result);
          return;
        }
      }
      clearSessionSelection();
      setBulkDeleteOpen(false);
    } finally {
      setBulkDeleting(false);
    }
  };

  const sessionActions = useMemo<CalendarSessionActions>(
    () => ({
      onMoveToDate: onSessionMoveToDate ? handleSessionMoveToDate : undefined,
      onReorderDay: onSessionReorderDay ? handleSessionReorderDay : undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSessionMoveToDate, onSessionReorderDay],
  );

  const menuActions: ActionSheetAction[] = [];
  if (menu) {
    const menuItem = menu.item;
    const canEditInline = Boolean(saveSession && loadSessionDraft?.(menuItem));
    const canEditExternal = Boolean(onSessionEdit);

    if (canEditInline || canEditExternal) {
      menuActions.push({
        key: 'edit',
        label: 'Editar',
        onPress: () => {
          setMenu(null);
          openEditEditor(menuItem);
        },
      });
    }

    if (canEditInline) {
      menuActions.push({
        key: 'write-inline',
        label: 'Escribir aquí',
        onPress: () => {
          setMenu(null);
          openInlineEditor(menuItem);
        },
      });
    }

    if (isTrainer && canEditInline) {
      menuActions.push({
        key: 'use-template',
        label: 'Usar plantilla',
        onPress: () => {
          setMenu(null);
          setTemplatePickerItem(menuItem);
          setTemplatePickerDate(null);
          setTemplatePickerOpen(true);
        },
      });

      const sourceDraft = loadSessionDraft?.(menuItem);
      if (sourceDraft && canSaveSessionAsTemplate(sourceDraft)) {
        menuActions.push({
          key: 'create-template',
          label: 'Crear plantilla',
          onPress: () => {
            setMenu(null);
            setCreateTemplateItem(menuItem);
          },
        });
      }
    }

    if (onSessionCopy) {
      menuActions.push({
        key: 'copy',
        label: 'Copiar',
        onPress: () => {
          setMenu(null);
          void handleSessionCopy(menuItem);
        },
      });
    }

    if (onSessionDelete) {
      menuActions.push({
        key: 'delete',
        label: 'Eliminar',
        destructive: true,
        onPress: () => {
          setDeleteItem(menuItem);
          setMenu(null);
        },
      });
    }
  }

  const renderSessionDetail = (item: SchedulePreviewItem) => {
    const draft = resolveDetailDraft(item);
    if (!draft) {
      return <Text style={styles.detailEmpty}>El contenido de esta sesión no se puede abrir aquí.</Text>;
    }

    const editable = Boolean(saveSession && loadSessionDraft?.(item));
    const isInlineEditing =
      inlineEditor && scheduleItemKey(inlineEditor.item) === scheduleItemKey(item);

    if (isInlineEditing && inlineEditor) {
      return (
        <View style={styles.detailInline}>
          <SessionInlineTextEditor
            value={inlineEditor.text}
            onChange={(text) =>
              setInlineEditor((current) => (current ? { ...current, text } : current))
            }
          />
          <View style={styles.inlineEditorActions}>
            <Button
              title="Guardar cambios"
              onPress={() => void handleInlineSave()}
              loading={inlineSaving}
              style={styles.inlineEditorActionBtn}
            />
            <Button
              title="Cancelar"
              variant="outline"
              onPress={closeInlineEditor}
              disabled={inlineSaving}
              style={styles.inlineEditorActionBtn}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.detail}>
        <SessionDraftSummary draft={draft} />
        {!editable && onSessionEdit ? (
          <Pressable
            onPress={() => onSessionEdit(item)}
            style={({ pressed }) => [styles.detailEditBtn, pressed && styles.detailEditBtnPressed]}
          >
            <Ionicons name="play-outline" size={14} color={colors.accent} />
            <Text style={styles.detailEditText}>Abrir sesión</Text>
          </Pressable>
        ) : null}
        {editable ? (
          <Pressable
            onPress={() => openInlineEditor(item)}
            style={({ pressed }) => [styles.detailEditBtn, pressed && styles.detailEditBtnPressed]}
          >
            <Ionicons name="create-outline" size={14} color={colors.accent} />
            <Text style={styles.detailEditText}>Escribir sobre este entreno</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const closeEditor = () => {
    setEditor(null);
    setFormError(null);
    setPendingBlocks(false);
  };

  const editorOverlay = editor ? (
    <View style={styles.editorOverlayLayer} pointerEvents="box-none">
      <Pressable style={styles.editorBackdrop} onPress={closeEditor} accessibilityLabel="Cerrar editor" />
      <View style={[styles.editorDialog, { maxWidth: editorMaxWidth, maxHeight: editorMaxHeight }]}>
        <View style={styles.editorDialogHeader}>
          <View style={styles.editorDialogHeaderText}>
            <Text style={styles.dayTitle}>
              {editor.item ? 'Editar entrenamiento' : 'Nuevo entrenamiento'}
            </Text>
            <Text style={styles.dayHint}>
              {formatDayLabel(editor.date)} · {editor.draft.dayLabel}
            </Text>
          </View>
          <Pressable
            onPress={closeEditor}
            accessibilityLabel="Cerrar"
            style={({ pressed }) => [styles.editorCloseBtn, pressed && styles.closeBtnPressed]}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          style={[styles.editorDialogScroll, { maxHeight: editorScrollMaxHeight }]}
          contentContainerStyle={styles.editorDialogContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SessionEditorForm
            draft={editor.draft}
            onChange={(draft) => setEditor((current) => (current ? { ...current, draft } : current))}
            showSessionName
            showTemplates={false}
            onPendingBlocksChange={setPendingBlocks}
          />

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <View style={styles.editorActions}>
            <Button
              title={editor.item ? 'Guardar cambios' : 'Guardar entrenamiento'}
              onPress={() => void handleSave()}
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
      </View>
    </View>
  ) : null;

  const hasExpandedSessions = expandedItemIds.length > 0 || Boolean(inlineEditor);
  /** Con sesiones desplegadas el cuadrante crece con el contenido en lugar de recortarse al alto de pantalla. */
  const stretchCalendar = isWideCalendar && !hasExpandedSessions && !editor;

  const calendarPanel = (
    <View
      style={[
        styles.calendarCard,
        stretchCalendar && styles.calendarCardFill,
        hasExpandedSessions && styles.calendarCardExpanded,
      ]}
    >
      <ScheduleCalendarGrid
        items={items}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        focusDate={focusDate}
        onFocusDateChange={setFocusDate}
        size="large"
        selectedDate={selectedDate}
        onDayPress={handleDayPress}
        onDayActionsPress={showDayActions ? handleDayActionsPress : undefined}
        onSessionPress={(item) => selectDate(item.date)}
        visiblePeriods={visiblePeriods}
        onVisiblePeriodsChange={(value) => setVisiblePeriods(Math.max(1, value))}
        fill={stretchCalendar}
        expandedItemIds={expandedItemIds}
        onToggleItemExpanded={toggleExpandedItem}
        renderItemDetail={renderSessionDetail}
        sessionActions={sessionActions}
        onSessionMenuPress={hasSessionMenu ? (item, anchor) => setMenu({ item, anchor }) : undefined}
        sessionSelection={sessionSelection}
        inlineEditingKey={inlineEditor ? scheduleItemKey(inlineEditor.item) : undefined}
      />
    </View>
  );

  const screenContent = (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {headerAction ? (
          headerAction
        ) : onClose ? (
          <Pressable
            onPress={onClose}
            accessibilityLabel="Cerrar calendario"
            style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {formError && !editor ? <Text style={styles.headerError}>{formError}</Text> : null}

      {selectedItems.length > 0 ? (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionBarText}>
            {selectedItems.length} sesión{selectedItems.length === 1 ? '' : 'es'} seleccionada
            {selectedItems.length === 1 ? '' : 's'}
          </Text>
          <View style={styles.selectionBarActions}>
            <Button
              title="Eliminar"
              onPress={() => setBulkDeleteOpen(true)}
              loading={bulkDeleting}
              style={styles.selectionBarBtn}
            />
            <Button
              title="Cancelar"
              variant="outline"
              onPress={clearSessionSelection}
              disabled={bulkDeleting}
              style={styles.selectionBarBtn}
            />
          </View>
        </View>
      ) : null}

      <ScrollView
        style={styles.calendarScroll}
        contentContainerStyle={[
          styles.body,
          stretchCalendar && styles.bodyFill,
          hasExpandedSessions && styles.bodyExpanded,
        ]}
        showsVerticalScrollIndicator={hasExpandedSessions}
      >
        {calendarPanel}
      </ScrollView>
      {editorOverlay}
    </View>
  );

  const handleCopyDayConfirm = async (targetDate: Date) => {
    if (!copyDayPicker || !onCopyDayToDate) return;

    setCopyDaySaving(true);
    setFormError(null);
    try {
      const result = await onCopyDayToDate(copyDayPicker.date, targetDate, copyDayPicker.dayItems);
      if (result) {
        setFormError(result);
        return;
      }
      setCopyDayPicker(null);
    } finally {
      setCopyDaySaving(false);
    }
  };

  const overlayModals = (
    <>
      <PopoverMenu
        visible={menu !== null}
        anchor={menu?.anchor ?? null}
        title={menu?.item.name}
        actions={menuActions}
        onClose={() => setMenu(null)}
      />
      <CalendarDayActionsMenu
        visible={dayMenu !== null}
        anchor={dayMenu?.anchor ?? null}
        onClose={() => setDayMenu(null)}
        onAction={handleDayAction}
        canCopy={Boolean(
          dayMenu && planItemsFromDay(dayMenu.dayItems).length > 0 && onCopyDayToDate,
        )}
        hasRestDay={Boolean(dayMenu?.dayItems.some((item) => item.kind === 'rest'))}
      />
      <CopyDayToDateModal
        visible={copyDayPicker !== null}
        sourceDate={copyDayPicker?.date ?? null}
        sessionCount={copyDayPicker?.dayItems.length ?? 0}
        saving={copyDaySaving}
        onCancel={() => setCopyDayPicker(null)}
        onConfirm={(targetDate) => void handleCopyDayConfirm(targetDate)}
      />
      <SessionTemplatePickerModal
        visible={isTrainer && templatePickerOpen}
        onClose={closeTemplatePicker}
        onConfirm={(templates) => void handleTemplateSelect(templates)}
        saving={templateApplying}
        confirmLabel={templatePickerItem ? 'Añadir a la sesión' : 'Crear sesión'}
        subtitle={
          templatePickerItem
            ? 'Marca una o varias plantillas; sus bloques se añadirán a esta sesión.'
            : 'Marca una o varias plantillas para crear una sesión nueva con todas ellas.'
        }
      />
      <CreateSessionTemplateModal
        visible={isTrainer && createTemplateItem !== null}
        draft={
          createTemplateItem && loadSessionDraft ? loadSessionDraft(createTemplateItem) : null
        }
        saving={createTemplateSaving}
        onClose={() => {
          if (createTemplateSaving) return;
          setCreateTemplateItem(null);
        }}
        onConfirm={(input) => {
          void (async () => {
            setCreateTemplateSaving(true);
            const result = await createTemplate(
              input.name,
              input.content,
              input.tag,
              input.formatTag,
            );
            setCreateTemplateSaving(false);
            if (result.error) {
              Alert.alert('No se pudo guardar', result.error);
              return;
            }
            setCreateTemplateItem(null);
            Alert.alert('Plantilla guardada', 'Ya está disponible en Usar plantilla.');
          })();
        }}
      />
      <CalendarSessionTypePickerModal
        visible={sessionTypePickerDate !== null}
        onClose={() => setSessionTypePickerDate(null)}
        onSelect={handleSessionTypeSelect}
      />
      <ConfirmModal
        visible={deleteItem !== null}
        title="Eliminar sesión"
        message={`¿Eliminar ${deleteItem?.name ?? 'esta sesión'}? Se borrará del plan del atleta.`}
        checkboxLabel="Entiendo que esta sesión se eliminará permanentemente"
        confirmLabel="Eliminar sesión"
        destructive
        onCancel={() => setDeleteItem(null)}
        onConfirm={() => {
          if (deleteItem) void handleSessionDelete(deleteItem);
          setDeleteItem(null);
        }}
      />
      <ConfirmModal
        visible={bulkDeleteOpen}
        title="Eliminar sesiones seleccionadas"
        message={`¿Eliminar ${selectedItems.length} sesión${selectedItems.length === 1 ? '' : 'es'} del plan del atleta?`}
        checkboxLabel="Entiendo que estas sesiones se eliminarán permanentemente"
        confirmLabel={`Eliminar ${selectedItems.length} sesión${selectedItems.length === 1 ? '' : 'es'}`}
        destructive
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={() => void handleBulkDelete()}
      />
    </>
  );

  if (presentation === 'inline') {
    if (!visible) return null;

    return (
      <>
        {screenContent}
        {overlayModals}
      </>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      {screenContent}
      {overlayModals}
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  headerError: {
    ...typography.bodySmall,
    color: colors.danger,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
    backgroundColor: `${colors.accent}10`,
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
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeBtnPressed: {
    opacity: 0.8,
  },
  body: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  bodyFill: {
    flex: 1,
    minHeight: '100%',
  },
  bodyExpanded: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  calendarScroll: {
    flex: 1,
  },
  editorOverlayLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
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
  editorCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  editorDialogScroll: {
    flexShrink: 1,
  },
  editorDialogContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  calendarCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    overflow: 'visible',
  },
  calendarCardFill: {
    flex: 1,
    minHeight: 0,
  },
  calendarCardExpanded: {
    flexGrow: 1,
  },
  dayTitle: {
    ...typography.h3,
    color: colors.text,
  },
  dayHint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
  },
  detail: {
    gap: spacing.sm,
  },
  detailInline: {
    flexGrow: 1,
    gap: spacing.sm,
    width: '100%',
  },
  detailEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
  detailEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`,
  },
  detailEditBtnPressed: {
    opacity: 0.8,
  },
  detailEditText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  inlineEditorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  inlineEditorActionBtn: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  editorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  editorActionBtn: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
  },
});
