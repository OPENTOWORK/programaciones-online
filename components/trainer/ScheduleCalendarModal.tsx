import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  ScheduleCalendarGrid,
  scheduleItemKey,
  shiftSchedulePeriod,
  type CalendarSessionActions,
} from '@/components/trainer/ScheduleCalendarGrid';
import { SessionDraftSummary } from '@/components/trainer/SessionDraftSummary';
import { SessionEditorForm } from '@/components/trainer/SessionEditorForm';
import { type ActionSheetAction } from '@/components/ui/ActionSheetModal';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PopoverMenu, type PopoverAnchor } from '@/components/ui/PopoverMenu';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  formatDayLabel,
  itemsForDate,
  parseSchedulePreviewItemKey,
  type SchedulePreviewItem,
  type ScheduleViewMode,
} from '@/lib/programSchedulePreview';
import { buildScheduleCalendarItems, type ScheduleCalendarSource } from '@/lib/scheduleCalendarItems';
import { workoutToSessionDraft, type SessionDraft } from '@/lib/trainerSessionDraft';

export interface CalendarSessionSaveInput {
  draft: SessionDraft;
  date: Date;
  item?: SchedulePreviewItem;
}

interface ScheduleCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  source: ScheduleCalendarSource;
  /** Abre la sesión en solo lectura tal y como la verá el atleta. */
  onSessionPreview?: (item: SchedulePreviewItem) => void;
  /** Alternativa cuando la sesión no se puede editar dentro del calendario. */
  onSessionEdit?: (item: SchedulePreviewItem) => void;
  canEditSession?: (item: SchedulePreviewItem) => boolean;
  /** Alternativa cuando no hay editor dentro del calendario. */
  onCreateSession?: (date: Date) => void;
  /** Borrador inicial para crear un entreno en la fecha elegida. */
  buildSessionDraft?: (date: Date) => SessionDraft;
  /** Borrador de una sesión existente para editarla sin salir del calendario. */
  loadSessionDraft?: (item: SchedulePreviewItem) => SessionDraft | null;
  /** Guarda el entreno creado o editado. Devuelve un mensaje de error o null. */
  saveSession?: (input: CalendarSessionSaveInput) => Promise<string | null> | string | null;
  /** Duplica la sesión del calendario. Devuelve un mensaje de error o null. */
  onSessionCopy?: (item: SchedulePreviewItem) => Promise<string | null> | string | null;
  /** Elimina la sesión del calendario. Devuelve un mensaje de error o null. */
  onSessionDelete?: (item: SchedulePreviewItem) => Promise<string | null> | string | null;
  /** Mueve la sesión a otro día de la semana. Devuelve un mensaje de error o null. */
  onSessionMoveToDate?: (item: SchedulePreviewItem, date: Date) => Promise<string | null> | string | null;
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
  onSessionEdit,
  onCreateSession,
  buildSessionDraft,
  loadSessionDraft,
  saveSession,
  onSessionCopy,
  onSessionDelete,
  onSessionMoveToDate,
  onSessionReorderDay,
}: ScheduleCalendarModalProps) {
  const { width } = useWindowDimensions();
  const isSplitLayout = width >= 960;

  const [viewMode, setViewMode] = useState<ScheduleViewMode>('week');
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [visiblePeriods, setVisiblePeriods] = useState(1);
  const [editor, setEditor] = useState<{
    item?: SchedulePreviewItem;
    draft: SessionDraft;
    date: Date;
  } | null>(null);
  const [expandedItemIds, setExpandedItemIds] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ item: SchedulePreviewItem; anchor: PopoverAnchor } | null>(null);
  const [deleteItem, setDeleteItem] = useState<SchedulePreviewItem | null>(null);
  const [pendingBlocks, setPendingBlocks] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canCreateInline = Boolean(buildSessionDraft && saveSession);

  useEffect(() => {
    if (visible) return;
    setEditor(null);
    setFormError(null);
    setPendingBlocks(false);
    setExpandedItemIds([]);
    setMenu(null);
    setDeleteItem(null);
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

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    if (visiblePeriods === 1) setFocusDate(date);
  };

  const handleViewModeChange = (mode: ScheduleViewMode) => {
    setViewMode(mode);
    setVisiblePeriods(1);
  };

  const openCreateEditor = (date: Date) => {
    if (!buildSessionDraft || !saveSession) {
      onCreateSession?.(date);
      return;
    }
    setSelectedDate(date);
    setFormError(null);
    setPendingBlocks(false);
    setEditor({ draft: buildSessionDraft(date), date });
  };

  /** Sin panel lateral de día: en un día vacío se puede crear el entreno al tocarlo. */
  const handleDayPress = (date: Date) => {
    selectDate(date);
    const dayItems = itemsForDate(items, date);
    if (dayItems.length === 0 && (canCreateInline || onCreateSession)) {
      openCreateEditor(date);
    }
  };

  const openEditEditor = (item: SchedulePreviewItem) => {
    const draft = loadSessionDraft && saveSession ? loadSessionDraft(item) : null;
    if (!draft) {
      onSessionEdit?.(item);
      return;
    }
    setSelectedDate(item.date);
    setFormError(null);
    setPendingBlocks(false);
    setEditor({ item, draft, date: item.date });
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

  const handleSessionMoveToDate = async (item: SchedulePreviewItem, date: Date) => {
    if (!onSessionMoveToDate) return;
    const result = await onSessionMoveToDate(item, date);
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
    if (result) setFormError(result);
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

    return (
      <View style={styles.detail}>
        <SessionDraftSummary draft={draft} />
        {editable ? (
          <Pressable
            onPress={() => openEditEditor(item)}
            style={({ pressed }) => [styles.detailEditBtn, pressed && styles.detailEditBtnPressed]}
          >
            <Ionicons name="create-outline" size={14} color={colors.accent} />
            <Text style={styles.detailEditText}>Modificar este entreno</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const calendarPanel = (
    <View style={[styles.calendarCard, isSplitLayout && styles.calendarCardFill]}>
      <ScheduleCalendarGrid
        items={items}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        focusDate={focusDate}
        onFocusDateChange={setFocusDate}
        size="large"
        selectedDate={selectedDate}
        onDayPress={handleDayPress}
        onSessionPress={(item) => selectDate(item.date)}
        visiblePeriods={visiblePeriods}
        onVisiblePeriodsChange={(value) => setVisiblePeriods(Math.max(1, value))}
        fill={isSplitLayout}
        expandedItemIds={expandedItemIds}
        onToggleItemExpanded={toggleExpandedItem}
        renderItemDetail={renderSessionDetail}
        sessionActions={sessionActions}
        onSessionMenuPress={hasSessionMenu ? (item, anchor) => setMenu({ item, anchor }) : undefined}
      />
    </View>
  );

  const editorPanel = editor ? (
    <View style={styles.sideCard}>
      <Text style={styles.dayTitle}>
        {editor.item ? 'Editar entrenamiento' : 'Nuevo entrenamiento'}
      </Text>
      <Text style={styles.dayHint}>
        {formatDayLabel(editor.date)} · {editor.draft.dayLabel}
      </Text>

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
          onPress={() => {
            setEditor(null);
            setFormError(null);
            setPendingBlocks(false);
          }}
          style={styles.editorActionBtn}
        />
      </View>
    </View>
  ) : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Cerrar calendario"
            style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {isSplitLayout ? (
          <View style={styles.contentWide}>
            <ScrollView
              style={editor ? styles.calendarColumnWithEditor : styles.calendarColumnFull}
              contentContainerStyle={styles.calendarColumnContent}
              showsVerticalScrollIndicator={false}
            >
              {calendarPanel}
            </ScrollView>
            {editor ? (
              <ScrollView
                style={styles.sideColumnEditing}
                contentContainerStyle={styles.sideColumnContent}
                showsVerticalScrollIndicator={false}
              >
                {editorPanel}
              </ScrollView>
            ) : null}
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {calendarPanel}
            {editorPanel}
          </ScrollView>
        )}
      </View>

      <PopoverMenu
        visible={menu !== null}
        anchor={menu?.anchor ?? null}
        title={menu?.item.name}
        actions={menuActions}
        onClose={() => setMenu(null)}
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  contentWide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
    padding: spacing.lg,
  },
  calendarColumnFull: {
    flex: 1,
    minWidth: 0,
  },
  calendarColumnWithEditor: {
    flex: 3,
    minWidth: 0,
  },
  calendarColumnContent: {
    flexGrow: 1,
  },
  sideColumnEditing: {
    flex: 1,
    maxWidth: 380,
    minWidth: 280,
  },
  sideColumnContent: {
    paddingBottom: spacing.lg,
  },
  calendarCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  calendarCardFill: {
    flex: 1,
  },
  sideCard: {
    width: '100%',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 2,
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
