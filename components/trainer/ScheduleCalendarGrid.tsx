import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, MutableRefObject, ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderHandlers,
} from 'react-native';

import type { PopoverAnchor } from '@/components/ui/PopoverMenu';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  formatDayLabel,
  formatMonthLabel,
  getMonthGrid,
  getWeekDays,
  getWeekdayShortLabels,
  isDateInSameMonth,
  itemsForDate,
  shiftDay,
  shiftMonth,
  shiftWeek,
  type SchedulePreviewItem,
  type ScheduleViewMode,
} from '@/lib/programSchedulePreview';

export type ScheduleCalendarSize = 'compact' | 'large';

export interface CalendarSessionActions {
  onEdit?: (item: SchedulePreviewItem) => void;
  onCopy?: (item: SchedulePreviewItem) => void;
  onDelete?: (item: SchedulePreviewItem) => void;
  onMoveToDate?: (item: SchedulePreviewItem, date: Date) => void;
}

interface ScheduleCalendarGridProps {
  items: SchedulePreviewItem[];
  viewMode: ScheduleViewMode;
  onViewModeChange: (mode: ScheduleViewMode) => void;
  focusDate: Date;
  onFocusDateChange: (date: Date) => void;
  size?: ScheduleCalendarSize;
  selectedDate?: Date;
  onDayPress?: (date: Date, dayItems: SchedulePreviewItem[]) => void;
  onSessionPress?: (item: SchedulePreviewItem) => void;
  /** Número de meses, semanas o días consecutivos que se muestran a la vez. */
  visiblePeriods?: number;
  onVisiblePeriodsChange?: (value: number) => void;
  /** Estira el calendario para ocupar todo el alto disponible. */
  fill?: boolean;
  /** Sesiones desplegadas dentro del calendario para ver su entrenamiento completo. */
  expandedItemIds?: readonly string[];
  onToggleItemExpanded?: (item: SchedulePreviewItem) => void;
  renderItemDetail?: (item: SchedulePreviewItem) => ReactNode;
  sessionActions?: CalendarSessionActions;
  /** Abre el menú de acciones de una sesión (editar, copiar, eliminar) junto a su botón. */
  onSessionMenuPress?: (item: SchedulePreviewItem, anchor: PopoverAnchor) => void;
}

const VIEW_MODES: Array<{ id: ScheduleViewMode; label: string }> = [
  { id: 'month', label: 'Mes' },
  { id: 'week', label: 'Semana' },
  { id: 'day', label: 'Día' },
];

const WEEKDAY_SHORT_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const PERIOD_LABELS: Record<ScheduleViewMode, { one: string; more: string }> = {
  month: { one: 'mes', more: 'meses' },
  week: { one: 'semana', more: 'semanas' },
  day: { one: 'día', more: 'días' },
};

/** Una sesión recurrente comparte id en todas sus fechas, así que se identifica junto al día. */
export function scheduleItemKey(item: SchedulePreviewItem) {
  return `${item.id}@${item.date.toDateString()}`;
}

export function shiftSchedulePeriod(date: Date, viewMode: ScheduleViewMode, delta: number) {
  if (delta === 0) return date;
  if (viewMode === 'month') return shiftMonth(date, delta);
  if (viewMode === 'week') return shiftWeek(date, delta);
  return shiftDay(date, delta);
}

function periodLabelFor(date: Date, viewMode: ScheduleViewMode) {
  if (viewMode === 'month') return formatMonthLabel(date);
  if (viewMode === 'week') return `Semana del ${formatDayLabel(getWeekDays(date)[0])}`;
  return formatDayLabel(date);
}

function isSameDate(a: Date, b?: Date) {
  if (!b) return false;
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

function ExpandToggle({ expanded, onPress }: { expanded: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={expanded ? 'Ocultar el entrenamiento' : 'Ver todo el entrenamiento'}
      hitSlop={6}
      style={({ pressed }) => [styles.expandToggle, pressed && styles.expandTogglePressed]}
    >
      <Ionicons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={14}
        color={expanded ? colors.accent : colors.textSecondary}
      />
    </Pressable>
  );
}

/** El asa no puede ser un Pressable: se quedaría con el gesto y el arrastre nunca empezaría. */
function ChipDragHandle({ dragHandlers }: { dragHandlers: GestureResponderHandlers }) {
  return (
    <View
      {...dragHandlers}
      accessibilityLabel="Arrastrar sesión a otro día"
      style={[styles.chipIconBtn, styles.chipDragHandle]}
    >
      <Ionicons name="reorder-three" size={14} color={colors.textSecondary} />
    </View>
  );
}

/** Mide su posición para que el menú se abra pegado al botón. */
function ChipMenuButton({ onPress }: { onPress: (anchor: PopoverAnchor) => void }) {
  const nodeRef = useRef<View | null>(null);

  const handlePress = () => {
    nodeRef.current?.measureInWindow((x, y, width, height) => onPress({ x, y, width, height }));
  };

  return (
    <View ref={nodeRef} collapsable={false}>
      <Pressable
        onPress={handlePress}
        accessibilityLabel="Opciones de la sesión"
        hitSlop={4}
        style={({ pressed }) => [styles.chipIconBtn, pressed && styles.chipIconBtnPressed]}
      >
        <Ionicons name="ellipsis-vertical" size={14} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

function SessionChip({
  item,
  onPress,
  expanded = false,
  onToggleExpanded,
  onMenuPress,
  dragHandlers,
  detail,
  isDragging = false,
}: {
  item: SchedulePreviewItem;
  onPress?: (item: SchedulePreviewItem) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  onMenuPress?: (anchor: PopoverAnchor) => void;
  dragHandlers?: GestureResponderHandlers;
  detail?: ReactNode;
  isDragging?: boolean;
}) {
  const isActivation = item.kind === 'activation';

  const title = (
    <Text
      style={[styles.sessionChipName, isActivation && styles.sessionChipNameActivation]}
      numberOfLines={expanded ? 2 : 1}
    >
      {item.name}
    </Text>
  );

  const chipStyle = [
    styles.sessionChip,
    item.isCurrent && styles.sessionChipCurrent,
    item.isDraft && styles.sessionChipDraft,
    isActivation && styles.sessionChipActivation,
    expanded && styles.sessionChipExpanded,
    isDragging && styles.sessionChipDragging,
  ];

  return (
    <View style={chipStyle}>
      <View style={styles.sessionChipHeader}>
        {dragHandlers ? <ChipDragHandle dragHandlers={dragHandlers} /> : null}
        {onPress ? (
          <Pressable
            onPress={() => onPress(item)}
            style={({ pressed }) => [styles.sessionChipTitleBtn, pressed && styles.sessionChipPressed]}
          >
            {title}
          </Pressable>
        ) : (
          title
        )}
        <View style={styles.sessionChipActions}>
          {onMenuPress ? <ChipMenuButton onPress={onMenuPress} /> : null}
          {onToggleExpanded ? <ExpandToggle expanded={expanded} onPress={onToggleExpanded} /> : null}
        </View>
      </View>

      <Text style={styles.sessionChipMeta} numberOfLines={expanded ? 3 : 1}>
        {item.estimatedDuration}
        {item.blockCount > 0 ? ` · ${item.blockCount} bloque${item.blockCount === 1 ? '' : 's'}` : ''}
        {item.exerciseCount > 0
          ? ` · ${item.exerciseCount} ejercicio${item.exerciseCount === 1 ? '' : 's'}`
          : ''}
      </Text>
      {item.isDraft ? <Text style={styles.sessionChipDraftLabel}>Borrador</Text> : null}

      {expanded && detail ? <View style={styles.sessionChipDetail}>{detail}</View> : null}
    </View>
  );
}

function DraggableSessionChip({
  item,
  columnBoundsRef,
  onMoveEnd,
  onDragStart,
  ...chipProps
}: Omit<ComponentProps<typeof SessionChip>, 'dragHandlers' | 'isDragging'> & {
  columnBoundsRef: MutableRefObject<Array<{ date: Date; x: number; width: number }>>;
  onMoveEnd: (item: SchedulePreviewItem, date: Date) => void;
  onDragStart?: () => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [dragging, setDragging] = useState(false);

  // El PanResponder se crea una sola vez: si cambiara a mitad del gesto se perdería el arrastre.
  const handlers = useRef({ item, onMoveEnd, onDragStart, columnBoundsRef });
  handlers.current = { item, onMoveEnd, onDragStart, columnBoundsRef };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          setDragging(true);
          handlers.current.onDragStart?.();
        },
        onPanResponderMove: (_event, gesture) => {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (event, gesture) => {
          const { item: current, onMoveEnd: move, columnBoundsRef: boundsRef } = handlers.current;
          const dropX = gesture.moveX || event.nativeEvent.pageX;
          const target = boundsRef.current.find(
            (bounds) => dropX >= bounds.x && dropX <= bounds.x + bounds.width,
          );

          setDragging(false);
          pan.setValue({ x: 0, y: 0 });

          if (target && target.date.toDateString() !== current.date.toDateString()) {
            move(current, target.date);
          }
        },
        onPanResponderTerminate: () => {
          setDragging(false);
          pan.setValue({ x: 0, y: 0 });
        },
      }),
    [pan],
  );

  return (
    <Animated.View
      style={[
        { transform: pan.getTranslateTransform() },
        dragging && styles.sessionChipDragLayer,
      ]}
    >
      <SessionChip {...chipProps} item={item} isDragging={dragging} dragHandlers={panResponder.panHandlers} />
    </Animated.View>
  );
}

export function ScheduleCalendarGrid({
  items,
  viewMode,
  onViewModeChange,
  focusDate,
  onFocusDateChange,
  size = 'compact',
  selectedDate,
  onDayPress,
  onSessionPress,
  visiblePeriods = 1,
  onVisiblePeriodsChange,
  fill = false,
  expandedItemIds,
  onToggleItemExpanded,
  renderItemDetail,
  sessionActions,
  onSessionMenuPress,
}: ScheduleCalendarGridProps) {
  const navigate = (direction: -1 | 1) => {
    onFocusDateChange(shiftSchedulePeriod(focusDate, viewMode, direction));
  };

  const periods = Array.from({ length: Math.max(1, visiblePeriods) }, (_, index) =>
    shiftSchedulePeriod(focusDate, viewMode, index),
  );
  const stretchPeriod = fill && periods.length === 1;
  const periodNames = PERIOD_LABELS[viewMode];

  return (
    <View style={fill ? styles.containerFill : undefined}>
      <View style={styles.modeRow}>
        {VIEW_MODES.map((mode) => {
          const active = viewMode === mode.id;
          return (
            <Pressable
              key={mode.id}
              onPress={() => onViewModeChange(mode.id)}
              style={[styles.modeBtn, active && styles.modeBtnActive]}
            >
              <Text style={[styles.modeBtnText, active && styles.modeBtnTextActive]}>{mode.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.navRow}>
        <Pressable onPress={() => navigate(-1)} style={styles.navBtn} accessibilityLabel="Anterior">
          <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.periodLabel, size === 'large' && styles.periodLabelLarge]}>
          {periodLabelFor(focusDate, viewMode)}
        </Text>
        <Pressable onPress={() => navigate(1)} style={styles.navBtn} accessibilityLabel="Siguiente">
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {periods.map((periodDate, index) => (
        <View
          key={periodDate.toISOString()}
          style={[styles.period, stretchPeriod && styles.periodFill, index > 0 && styles.periodStacked]}
        >
          {index > 0 ? (
            <Text style={styles.periodSectionLabel}>{periodLabelFor(periodDate, viewMode)}</Text>
          ) : null}

          {viewMode === 'month' ? (
            <MonthView
              focusDate={periodDate}
              items={items}
              size={size}
              selectedDate={selectedDate}
              onDayPress={onDayPress}
              onSessionPress={onSessionPress}
            />
          ) : null}
          {viewMode === 'week' ? (
            <WeekView
              focusDate={periodDate}
              items={items}
              size={size}
              fill={stretchPeriod}
              selectedDate={selectedDate}
              onDayPress={onDayPress}
              onSessionPress={onSessionPress}
              expandedItemIds={expandedItemIds}
              onToggleItemExpanded={onToggleItemExpanded}
              renderItemDetail={renderItemDetail}
              sessionActions={sessionActions}
              onSessionMenuPress={onSessionMenuPress}
            />
          ) : null}
          {viewMode === 'day' ? (
            <DayView
              focusDate={periodDate}
              items={items}
              onSessionPress={onSessionPress}
              expandedItemIds={expandedItemIds}
              onToggleItemExpanded={onToggleItemExpanded}
              renderItemDetail={renderItemDetail}
              onSessionMenuPress={onSessionMenuPress}
            />
          ) : null}
        </View>
      ))}

      {onVisiblePeriodsChange ? (
        <View style={styles.extendRow}>
          <Pressable
            onPress={() => onVisiblePeriodsChange(visiblePeriods + 1)}
            style={({ pressed }) => [styles.extendBtn, pressed && styles.extendBtnPressed]}
          >
            <Ionicons name="add" size={16} color={colors.accent} />
            <Text style={styles.extendBtnText}>Añadir {periodNames.one}</Text>
          </Pressable>
          {visiblePeriods > 1 ? (
            <Pressable
              onPress={() => onVisiblePeriodsChange(visiblePeriods - 1)}
              style={({ pressed }) => [styles.extendBtn, styles.extendBtnGhost, pressed && styles.extendBtnPressed]}
            >
              <Ionicons name="remove" size={16} color={colors.textSecondary} />
              <Text style={styles.extendBtnGhostText}>
                Quitar {periodNames.one} ({visiblePeriods} {visiblePeriods === 1 ? periodNames.one : periodNames.more})
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function MonthView({
  focusDate,
  items,
  size,
  selectedDate,
  onDayPress,
  onSessionPress,
}: {
  focusDate: Date;
  items: SchedulePreviewItem[];
  size: ScheduleCalendarSize;
  selectedDate?: Date;
  onDayPress?: (date: Date, dayItems: SchedulePreviewItem[]) => void;
  onSessionPress?: (item: SchedulePreviewItem) => void;
}) {
  const days = getMonthGrid(focusDate);
  const weekdayLabels = getWeekdayShortLabels();
  const visibleSessions = size === 'large' ? 4 : 2;

  return (
    <View>
      <View style={styles.monthWeekdays}>
        {weekdayLabels.map((label) => (
          <Text key={label} style={styles.monthWeekday}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.monthGrid}>
        {days.map((day) => {
          const dayItems = itemsForDate(items, day);
          const inMonth = isDateInSameMonth(day, focusDate);
          const selected = isSameDate(day, selectedDate);
          const Wrapper = onDayPress ? Pressable : View;
          return (
            <Wrapper
              key={day.toISOString()}
              onPress={onDayPress ? () => onDayPress(day, dayItems) : undefined}
              style={[
                styles.monthCell,
                size === 'large' && styles.monthCellLarge,
                !inMonth && styles.monthCellMuted,
                onDayPress && styles.monthCellPressable,
                selected && styles.monthCellSelected,
              ]}
            >
              <Text style={[styles.monthDayNumber, !inMonth && styles.monthDayNumberMuted]}>{day.getDate()}</Text>
              {dayItems.slice(0, visibleSessions).map((item) =>
                onSessionPress ? (
                  <Pressable key={item.id} onPress={() => onSessionPress(item)}>
                    <Text
                      style={[
                        styles.monthSessionDot,
                        size === 'large' && styles.monthSessionDotLarge,
                        item.isCurrent && styles.monthSessionDotCurrent,
                        item.kind === 'activation' && styles.monthSessionDotActivation,
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                ) : (
                  <Text
                    key={item.id}
                    style={[
                      styles.monthSessionDot,
                      size === 'large' && styles.monthSessionDotLarge,
                      item.isCurrent && styles.monthSessionDotCurrent,
                      item.kind === 'activation' && styles.monthSessionDotActivation,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                ),
              )}
              {dayItems.length > visibleSessions ? (
                <Text style={styles.monthMore}>+{dayItems.length - visibleSessions}</Text>
              ) : null}
            </Wrapper>
          );
        })}
      </View>
    </View>
  );
}

function WeekView({
  focusDate,
  items,
  size,
  fill = false,
  selectedDate,
  onDayPress,
  onSessionPress,
  expandedItemIds,
  onToggleItemExpanded,
  renderItemDetail,
  sessionActions,
  onSessionMenuPress,
}: {
  focusDate: Date;
  items: SchedulePreviewItem[];
  size: ScheduleCalendarSize;
  fill?: boolean;
  selectedDate?: Date;
  onDayPress?: (date: Date, dayItems: SchedulePreviewItem[]) => void;
  onSessionPress?: (item: SchedulePreviewItem) => void;
  expandedItemIds?: readonly string[];
  onToggleItemExpanded?: (item: SchedulePreviewItem) => void;
  renderItemDetail?: (item: SchedulePreviewItem) => ReactNode;
  sessionActions?: CalendarSessionActions;
  onSessionMenuPress?: (item: SchedulePreviewItem, anchor: PopoverAnchor) => void;
}) {
  const days = getWeekDays(focusDate);
  const columnNodesRef = useRef(new Map<string, View | null>());
  const columnRefCallbacksRef = useRef(new Map<string, (node: View | null) => void>());
  const columnBoundsRef = useRef<Array<{ date: Date; x: number; width: number }>>([]);
  const canDrag = Boolean(sessionActions?.onMoveToDate);

  const measureColumns = useCallback(() => {
    const entries = Array.from(columnNodesRef.current.entries()).filter(([, node]) => Boolean(node));
    if (entries.length === 0) return;

    const bounds: Array<{ date: Date; x: number; width: number }> = [];
    let pending = entries.length;

    entries.forEach(([dayKey, node]) => {
      node?.measureInWindow((x, _y, width) => {
        bounds.push({ date: new Date(dayKey), x, width });
        pending -= 1;
        if (pending <= 0) columnBoundsRef.current = bounds;
      });
    });
  }, []);

  /** La callback debe ser estable: si cambia en cada render, React la limpia y se pierde la medida. */
  const registerColumnRef = useCallback((day: Date) => {
    const dayKey = day.toISOString();
    const cached = columnRefCallbacksRef.current.get(dayKey);
    if (cached) return cached;

    const callback = (node: View | null) => {
      columnNodesRef.current.set(dayKey, node);
    };
    columnRefCallbacksRef.current.set(dayKey, callback);
    return callback;
  }, []);

  const renderChip = (item: SchedulePreviewItem) => {
    const expanded = expandedItemIds?.includes(scheduleItemKey(item)) ?? false;
    const chipProps = {
      item,
      onPress: onSessionPress,
      expanded,
      onToggleExpanded: onToggleItemExpanded ? () => onToggleItemExpanded(item) : undefined,
      onMenuPress: onSessionMenuPress
        ? (anchor: PopoverAnchor) => onSessionMenuPress(item, anchor)
        : undefined,
      detail: renderItemDetail && expanded ? renderItemDetail(item) : undefined,
    };

    if (canDrag && sessionActions?.onMoveToDate) {
      return (
        <DraggableSessionChip
          key={scheduleItemKey(item)}
          {...chipProps}
          columnBoundsRef={columnBoundsRef}
          onMoveEnd={sessionActions.onMoveToDate}
          onDragStart={measureColumns}
        />
      );
    }

    return <SessionChip key={scheduleItemKey(item)} {...chipProps} />;
  };

  return (
    <View style={[styles.weekGrid, fill && styles.weekGridFill]} onLayout={canDrag ? measureColumns : undefined}>
      {days.map((day) => {
        const dayItems = itemsForDate(items, day);
        const weekday = WEEKDAY_SHORT_LABELS[day.getDay() === 0 ? 6 : day.getDay() - 1];
        const selected = isSameDate(day, selectedDate);
        const Wrapper = onDayPress ? Pressable : View;
        return (
          <Wrapper
            key={day.toISOString()}
            ref={canDrag ? registerColumnRef(day) : undefined}
            collapsable={false}
            onPress={onDayPress ? () => onDayPress(day, dayItems) : undefined}
            style={[
              styles.weekColumn,
              size === 'large' && styles.weekColumnLarge,
              onDayPress && styles.weekColumnPressable,
              selected && styles.weekColumnSelected,
            ]}
          >
            <View style={styles.weekColumnHeader}>
              <Text style={styles.weekColumnDay}>{weekday}</Text>
              <Text style={styles.weekColumnDate}>{day.getDate()}</Text>
            </View>
            {dayItems.length === 0 ? (
              <Text style={styles.weekEmpty}>Sin sesión</Text>
            ) : (
              dayItems.map((item) => renderChip(item))
            )}
          </Wrapper>
        );
      })}
    </View>
  );
}

function DayView({
  focusDate,
  items,
  onSessionPress,
  expandedItemIds,
  onToggleItemExpanded,
  renderItemDetail,
  onSessionMenuPress,
}: {
  focusDate: Date;
  items: SchedulePreviewItem[];
  onSessionPress?: (item: SchedulePreviewItem) => void;
  expandedItemIds?: readonly string[];
  onToggleItemExpanded?: (item: SchedulePreviewItem) => void;
  renderItemDetail?: (item: SchedulePreviewItem) => ReactNode;
  onSessionMenuPress?: (item: SchedulePreviewItem, anchor: PopoverAnchor) => void;
}) {
  const dayItems = itemsForDate(items, focusDate);

  return (
    <View style={styles.dayView}>
      {dayItems.length === 0 ? (
        <View style={styles.dayEmpty}>
          <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
          <Text style={styles.dayEmptyText}>No hay sesiones programadas para este día.</Text>
        </View>
      ) : (
        dayItems.map((item) => {
          const expanded = expandedItemIds?.includes(scheduleItemKey(item)) ?? false;
          return (
            <View key={item.id} style={styles.dayCard}>
              <View style={styles.dayCardHeader}>
                <Text style={styles.dayCardTitle}>{item.name}</Text>
                {item.isDraft ? <Text style={styles.dayCardDraft}>Borrador</Text> : null}
                <View style={styles.sessionChipActions}>
                  {onSessionMenuPress ? (
                    <ChipMenuButton onPress={(anchor) => onSessionMenuPress(item, anchor)} />
                  ) : null}
                  {onToggleItemExpanded ? (
                    <ExpandToggle expanded={expanded} onPress={() => onToggleItemExpanded(item)} />
                  ) : null}
                </View>
              </View>
              <Pressable
                onPress={onSessionPress ? () => onSessionPress(item) : undefined}
                disabled={!onSessionPress}
                style={({ pressed }) => [onSessionPress && pressed && styles.dayCardPressed]}
              >
                <Text style={styles.dayCardMeta}>
                  {item.dayLabel} · {item.estimatedDuration}
                </Text>
                <Text style={styles.dayCardSummary}>
                  {item.blockCount > 0
                    ? `${item.blockCount} bloque${item.blockCount === 1 ? '' : 's'} de metcon`
                    : 'Sin bloques de metcon'}
                  {item.exerciseCount > 0
                    ? ` · ${item.exerciseCount} ejercicio${item.exerciseCount === 1 ? '' : 's'} de fuerza`
                    : ''}
                </Text>
              </Pressable>
              {expanded && renderItemDetail ? (
                <View style={styles.dayCardDetail}>{renderItemDetail(item)}</View>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containerFill: {
    flex: 1,
  },
  period: {
    gap: spacing.xs,
  },
  periodFill: {
    flex: 1,
  },
  periodStacked: {
    marginTop: spacing.lg,
  },
  periodSectionLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  extendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  extendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`,
  },
  extendBtnGhost: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  extendBtnPressed: {
    opacity: 0.8,
  },
  extendBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  extendBtnGhostText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  modeBtnActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}18`,
  },
  modeBtnText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: colors.accent,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  periodLabelLarge: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  monthWeekdays: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  monthWeekday: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthCell: {
    width: '14.2857%',
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    backgroundColor: colors.background,
  },
  monthCellLarge: {
    minHeight: 112,
    padding: spacing.xs,
  },
  monthCellMuted: {
    backgroundColor: `${colors.surfaceLight}88`,
  },
  monthCellPressable: {
    cursor: 'pointer' as const,
  },
  monthCellSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}12`,
  },
  monthDayNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 2,
  },
  monthDayNumberMuted: {
    color: colors.textMuted,
  },
  monthSessionDot: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 12,
    marginBottom: 1,
  },
  monthSessionDotLarge: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  monthSessionDotCurrent: {
    color: colors.accent,
    fontWeight: '700',
  },
  monthSessionDotActivation: {
    color: colors.activation,
    fontWeight: '700',
  },
  monthMore: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  weekGridFill: {
    flex: 1,
    alignItems: 'stretch',
  },
  weekColumn: {
    flex: 1,
    minWidth: 72,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    gap: spacing.xs,
    minHeight: 180,
  },
  weekColumnLarge: {
    minHeight: 320,
    padding: spacing.sm,
  },
  weekColumnPressable: {
    cursor: 'pointer' as const,
  },
  weekColumnSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}10`,
  },
  weekColumnHeader: {
    alignItems: 'center',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  weekColumnDay: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  weekColumnDate: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  weekEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  sessionChip: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionChipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 4,
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
  chipIconBtnPressed: {
    opacity: 0.7,
    backgroundColor: colors.surfaceLight,
  },
  chipDragHandle: Platform.select({
    web: { cursor: 'grab', userSelect: 'none' } as object,
    default: {},
  }),
  sessionChipDragging: {
    borderColor: colors.accent,
    opacity: 0.92,
  },
  sessionChipDragLayer: {
    zIndex: 20,
    elevation: 20,
  },
  sessionChipTitleBtn: {
    flex: 1,
    minWidth: 0,
  },
  sessionChipExpanded: {
    borderColor: colors.accent,
    backgroundColor: colors.background,
  },
  sessionChipDetail: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  expandToggle: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  expandTogglePressed: {
    opacity: 0.7,
  },
  sessionChipCurrent: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`,
  },
  sessionChipDraft: {
    borderStyle: 'dashed',
  },
  sessionChipActivation: {
    borderColor: `${colors.activation}66`,
    backgroundColor: `${colors.activation}1A`,
  },
  sessionChipPressed: {
    opacity: 0.85,
  },
  sessionChipName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
  },
  sessionChipNameActivation: {
    color: colors.activation,
  },
  sessionChipMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  sessionChipDraftLabel: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    marginTop: 4,
  },
  dayView: {
    gap: spacing.sm,
  },
  dayEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  dayEmptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: 20,
  },
  dayCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  dayCardPressed: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}10`,
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dayCardDetail: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dayCardTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  dayCardDraft: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  dayCardMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  dayCardSummary: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
