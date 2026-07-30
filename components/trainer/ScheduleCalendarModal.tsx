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
} from '@/components/trainer/ScheduleCalendarGrid';
import { SessionDraftSummary } from '@/components/trainer/SessionDraftSummary';
import { SessionEditorForm } from '@/components/trainer/SessionEditorForm';
import { Button } from '@/components/ui/Button';
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
}

export function ScheduleCalendarModal({
  visible,
  onClose,
  title,
  subtitle,
  source,
  onSessionPreview,
  onSessionEdit,
  canEditSession,
  onCreateSession,
  buildSessionDraft,
  loadSessionDraft,
  saveSession,
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
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [pendingBlocks, setPendingBlocks] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canCreateInline = Boolean(buildSessionDraft && saveSession);

  useEffect(() => {
    if (visible) return;
    setEditor(null);
    setFormError(null);
    setPendingBlocks(false);
    setExpandedItemId(null);
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

  const daySessions = useMemo(
    () => itemsForDate(buildScheduleCalendarItems(source, selectedDate, 'day'), selectedDate),
    [source, selectedDate],
  );

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
      setFormError('Confirma cada bloque con el botón verde antes de guardar el entreno.');
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

  const toggleExpandedItem = (item: SchedulePreviewItem) => {
    const key = scheduleItemKey(item);
    setExpandedItemId((current) => (current === key ? null : key));
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
        onDayPress={(date) => selectDate(date)}
        onSessionPress={(item) => selectDate(item.date)}
        visiblePeriods={visiblePeriods}
        onVisiblePeriodsChange={(value) => setVisiblePeriods(Math.max(1, value))}
        fill={isSplitLayout}
        expandedItemId={expandedItemId}
        onToggleItemExpanded={toggleExpandedItem}
        renderItemDetail={renderSessionDetail}
      />
    </View>
  );

  const sidePanel = (
    <View style={styles.sideCard}>
      {editor ? (
        <>
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
        </>
      ) : (
        <>
          <Text style={styles.dayTitle}>{formatDayLabel(selectedDate)}</Text>
          <Text style={styles.dayHint}>
            {daySessions.length === 0
              ? 'Sin entrenamientos programados este día.'
              : `${daySessions.length} entrenamiento${daySessions.length === 1 ? '' : 's'} programado${
                  daySessions.length === 1 ? '' : 's'
                }.`}
          </Text>

          <View style={styles.sessionList}>
            {daySessions.map((item) => {
              const inlineEditable = Boolean(loadSessionDraft && saveSession && loadSessionDraft(item));
              const editable = inlineEditable || (onSessionEdit ? (canEditSession ? canEditSession(item) : true) : false);
              const expanded = expandedItemId === scheduleItemKey(item);
              return (
                <View key={item.id} style={styles.sessionCard}>
                  <View style={styles.sessionCardHeader}>
                    <Text style={styles.sessionName}>{item.name}</Text>
                    {item.isDraft ? <Text style={styles.sessionDraft}>Borrador</Text> : null}
                    <Pressable
                      onPress={() => toggleExpandedItem(item)}
                      accessibilityLabel={expanded ? 'Ocultar el entrenamiento' : 'Ver todo el entrenamiento'}
                      hitSlop={6}
                      style={({ pressed }) => [styles.cardToggle, pressed && styles.cardTogglePressed]}
                    >
                      <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={expanded ? colors.accent : colors.textSecondary}
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.sessionMeta}>
                    {item.dayLabel} · {item.estimatedDuration}
                  </Text>
                  <Text style={styles.sessionSummary}>
                    {item.blockCount > 0
                      ? `${item.blockCount} bloque${item.blockCount === 1 ? '' : 's'} de metcon`
                      : 'Sin bloques de metcon'}
                    {item.exerciseCount > 0
                      ? ` · ${item.exerciseCount} ejercicio${item.exerciseCount === 1 ? '' : 's'} de fuerza`
                      : ''}
                  </Text>

                  {expanded ? <View style={styles.cardDetail}>{renderSessionDetail(item)}</View> : null}

                  <View style={styles.sessionActions}>
                    {editable ? (
                      <Button
                        title={inlineEditable ? 'Modificar aquí' : item.isCurrent ? 'Ir al editor' : 'Modificar'}
                        variant="primary"
                        style={styles.sessionActionBtn}
                        onPress={() => openEditEditor(item)}
                      />
                    ) : null}
                    {onSessionPreview ? (
                      <Button
                        title="Ver sesión"
                        variant="outline"
                        style={styles.sessionActionBtn}
                        onPress={() => onSessionPreview(item)}
                      />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          {canCreateInline || onCreateSession ? (
            <Button
              title="Crear entrenamiento este día"
              variant={daySessions.length === 0 ? 'primary' : 'outline'}
              onPress={() => openCreateEditor(selectedDate)}
            />
          ) : null}
        </>
      )}
    </View>
  );

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
              style={[styles.calendarColumnWide, editor && styles.calendarColumnNarrow]}
              contentContainerStyle={styles.calendarColumnContent}
              showsVerticalScrollIndicator={false}
            >
              {calendarPanel}
            </ScrollView>
            <ScrollView
              style={[styles.sideColumnWide, editor && styles.sideColumnEditing]}
              contentContainerStyle={styles.sideColumnContent}
              showsVerticalScrollIndicator={false}
            >
              {sidePanel}
            </ScrollView>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {calendarPanel}
            {sidePanel}
          </ScrollView>
        )}
      </View>
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
    gap: spacing.lg,
    padding: spacing.lg,
  },
  calendarColumnWide: {
    flex: 2,
    minWidth: 0,
  },
  calendarColumnNarrow: {
    flex: 1,
  },
  calendarColumnContent: {
    flexGrow: 1,
  },
  sideColumnWide: {
    flex: 1,
    maxWidth: 520,
  },
  sideColumnEditing: {
    flex: 1.6,
    maxWidth: 820,
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
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
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
  sessionList: {
    gap: spacing.sm,
  },
  sessionCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sessionName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  sessionDraft: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  sessionMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  sessionSummary: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cardToggle: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTogglePressed: {
    opacity: 0.7,
  },
  cardDetail: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  sessionActionBtn: {
    flex: 1,
    minHeight: 44,
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
