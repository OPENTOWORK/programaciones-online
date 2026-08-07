import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
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

import { DayActionsButton } from '@/components/trainer/CalendarDayActionsMenu';
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
import { dropIndexForPosition, dropLineOffsetForIndex } from '@/lib/dragDropList';

export type ScheduleCalendarSize = 'compact' | 'large';

/** Columna de un día medida en coordenadas de la ventana, como en el tablero del CRM. */
interface ColumnBounds {
  date: Date;
  x: number;
  y: number;
  width: number;
}

/** Tarjeta ya colocada, para saber por encima de cuáles ha pasado el dedo. */
interface ChipBounds {
  key: string;
  dayKey: string;
  y: number;
  height: number;
}

/** Día y hueco donde caería la sesión que se arrastra, con la altura de la línea que lo marca. */
interface DropHint {
  date: Date;
  movedKey: string;
  index: number;
  lineTop: number | null;
}

function isSameDropHint(left: DropHint | null, right: DropHint | null) {
  if (!left || !right) return left === right;
  return (
    left.index === right.index &&
    left.movedKey === right.movedKey &&
    left.lineTop === right.lineTop &&
    left.date.toDateString() === right.date.toDateString()
  );
}

export interface CalendarSessionActions {
  onEdit?: (item: SchedulePreviewItem) => void;
  onCopy?: (item: SchedulePreviewItem) => void;
  onDelete?: (item: SchedulePreviewItem) => void;
  /** `dayItems` es el día de destino ya con la sesión colocada en el hueco elegido. */
  onMoveToDate?: (
    item: SchedulePreviewItem,
    date: Date,
    dayItems?: SchedulePreviewItem[],
  ) => void;
  /** Guarda el nuevo orden de un día después de arrastrar una sesión arriba o abajo. */
  onReorderDay?: (date: Date, orderedItems: SchedulePreviewItem[]) => void;
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
  /** Abre el menú de acciones rápidas (crear, copiar, plantilla…) del día. */
  onDayActionsPress?: (
    date: Date,
    dayItems: SchedulePreviewItem[],
    anchor: PopoverAnchor,
  ) => void;
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
  /** Casillas para seleccionar varias sesiones y actuar sobre ellas. */
  sessionSelection?: {
    selectedKeys: ReadonlySet<string>;
    onToggle: (item: SchedulePreviewItem) => void;
  };
  /** Sesión con editor de texto abierto en el calendario. */
  inlineEditingKey?: string;
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

const dayKeyOf = (date: Date) => date.toDateString();

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
      // @ts-expect-error atributo web para excluir del arrastre
      dataSet={{ chipControl: 'true' }}
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
function ChipDragHandle({ dragHandlers }: { dragHandlers?: GestureResponderHandlers }) {
  return (
    <View
      {...dragHandlers}
      accessibilityLabel="Arrastrar sesión a otro día o a otra posición"
      style={[styles.chipIconBtn, styles.chipDragHandle]}
    >
      <Ionicons name="reorder-three" size={16} color={colors.textSecondary} />
    </View>
  );
}

/** Solo las sesiones de planes personalizados se pueden marcar para eliminar en bloque. */
export function isSelectableCalendarSession(item: SchedulePreviewItem) {
  return item.id.startsWith('plan:');
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
      // @ts-expect-error atributo web para excluir del arrastre
      dataSet={{ chipControl: 'true' }}
      style={({ pressed }) => [styles.chipIconBtn, pressed && styles.chipIconBtnPressed]}
      >
        <Ionicons name="ellipsis-vertical" size={14} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

function SessionSelectionToggle({
  selected,
  onPress,
}: {
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={(event) => {
        event.stopPropagation?.();
        onPress();
      }}
      accessibilityLabel={selected ? 'Quitar de la selección' : 'Seleccionar sesión'}
      hitSlop={6}
      // @ts-expect-error atributo web para excluir del arrastre
      dataSet={{ chipControl: 'true' }}
      style={({ pressed }) => [styles.selectionToggle, pressed && styles.chipIconBtnPressed]}
    >
      <Ionicons
        name={selected ? 'checkbox' : 'square-outline'}
        size={18}
        color={selected ? colors.accent : colors.textMuted}
      />
    </Pressable>
  );
}

function SessionChip({
  item,
  onPress,
  expanded = false,
  onToggleExpanded,
  onMenuPress,
  selectionChecked = false,
  onToggleSelection,
  inlineEditing = false,
  dragHandlers,
  draggable = false,
  detail,
  isDragging = false,
}: {
  item: SchedulePreviewItem;
  onPress?: (item: SchedulePreviewItem) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  onMenuPress?: (anchor: PopoverAnchor) => void;
  selectionChecked?: boolean;
  onToggleSelection?: () => void;
  /** La sesión se está editando con texto libre en el calendario. */
  inlineEditing?: boolean;
  dragHandlers?: GestureResponderHandlers;
  draggable?: boolean;
  detail?: ReactNode;
  isDragging?: boolean;
}) {
  const isActivation = item.kind === 'activation';
  const isRestDay = item.kind === 'rest';

  const title = (
    <Text
      style={[
        styles.sessionChipName,
        isActivation && styles.sessionChipNameActivation,
        isRestDay && styles.sessionChipNameRestDay,
      ]}
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
    isRestDay && styles.sessionChipRestDay,
    selectionChecked && styles.sessionChipSelected,
    inlineEditing && styles.sessionChipInlineEditing,
    expanded && styles.sessionChipExpanded,
    isDragging && styles.sessionChipDragging,
    draggable && styles.sessionChipDraggable,
  ];

  const showDragHandle = draggable || Boolean(dragHandlers);

  return (
    <View style={chipStyle}>
      <View style={styles.sessionChipHeader}>
        {showDragHandle ? <ChipDragHandle dragHandlers={dragHandlers} /> : null}
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
          {onToggleSelection ? (
            <SessionSelectionToggle selected={selectionChecked} onPress={onToggleSelection} />
          ) : null}
          {onMenuPress ? <ChipMenuButton onPress={onMenuPress} /> : null}
          {onToggleExpanded ? <ExpandToggle expanded={expanded} onPress={onToggleExpanded} /> : null}
        </View>
      </View>

      {!inlineEditing ? (
        <Text style={styles.sessionChipMeta} numberOfLines={expanded ? 3 : 1}>
          {isRestDay
            ? 'Descanso'
            : `${item.estimatedDuration}${item.blockCount > 0 ? ` · ${item.blockCount} bloque${item.blockCount === 1 ? '' : 's'}` : ''}${
                item.exerciseCount > 0
                  ? ` · ${item.exerciseCount} ejercicio${item.exerciseCount === 1 ? '' : 's'}`
                  : ''
              }`}
        </Text>
      ) : null}
      {item.isDraft ? <Text style={styles.sessionChipDraftLabel}>Borrador</Text> : null}

      {expanded && detail ? (
        <View style={[styles.sessionChipDetail, inlineEditing && styles.sessionChipDetailInline]}>
          {detail}
        </View>
      ) : null}
    </View>
  );
}

/**
 * La tarjeta se arrastra igual que las fichas del CRM: el PanResponder del asa mueve la propia
 * tarjeta con un desplazamiento animado y avisa a la semana con las coordenadas de pantalla.
 */
function DraggableSessionChip({
  item,
  chipRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  ...chipProps
}: Omit<ComponentProps<typeof SessionChip>, 'dragHandlers' | 'isDragging'> & {
  chipRef?: (node: View | null) => void;
  onDragStart: (item: SchedulePreviewItem) => void;
  onDragMove: (item: SchedulePreviewItem, pageX: number, pageY: number) => void;
  onDragEnd: (item: SchedulePreviewItem, pageX: number, pageY: number) => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isDragging, setIsDragging] = useState(false);

  // Las callbacks se leen de una referencia para que el gesto siempre use la semana actual.
  const handlers = useRef({ item, onDragStart, onDragMove, onDragEnd });
  handlers.current = { item, onDragStart, onDragMove, onDragEnd };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          pan.setValue({ x: 0, y: 0 });
          setIsDragging(true);
          handlers.current.onDragStart(handlers.current.item);
        },
        onPanResponderMove: (_event, gesture) => {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
          handlers.current.onDragMove(handlers.current.item, gesture.moveX, gesture.moveY);
        },
        onPanResponderRelease: (_event, gesture) => {
          setIsDragging(false);
          handlers.current.onDragEnd(handlers.current.item, gesture.moveX, gesture.moveY);
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderTerminate: (_event, gesture) => {
          setIsDragging(false);
          handlers.current.onDragEnd(handlers.current.item, gesture.moveX, gesture.moveY);
          pan.setValue({ x: 0, y: 0 });
        },
      }),
    [pan],
  );

  return (
    <Animated.View
      ref={chipRef}
      collapsable={false}
      style={[
        { transform: pan.getTranslateTransform() },
        isDragging && styles.draggingChipLayer,
      ]}
    >
      <SessionChip
        {...chipProps}
        item={item}
        draggable
        isDragging={isDragging}
        dragHandlers={panResponder.panHandlers}
      />
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
  onDayActionsPress,
  onSessionPress,
  visiblePeriods = 1,
  onVisiblePeriodsChange,
  fill = false,
  expandedItemIds,
  onToggleItemExpanded,
  renderItemDetail,
  sessionActions,
  onSessionMenuPress,
  sessionSelection,
  inlineEditingKey,
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
              onDayActionsPress={onDayActionsPress}
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
              onDayActionsPress={onDayActionsPress}
              onSessionPress={onSessionPress}
              expandedItemIds={expandedItemIds}
              onToggleItemExpanded={onToggleItemExpanded}
              renderItemDetail={renderItemDetail}
              sessionActions={sessionActions}
              onSessionMenuPress={onSessionMenuPress}
              sessionSelection={sessionSelection}
              inlineEditingKey={inlineEditingKey}
            />
          ) : null}
          {viewMode === 'day' ? (
            <DayView
              focusDate={periodDate}
              items={items}
              onDayActionsPress={onDayActionsPress}
              onSessionPress={onSessionPress}
              expandedItemIds={expandedItemIds}
              onToggleItemExpanded={onToggleItemExpanded}
              renderItemDetail={renderItemDetail}
              onSessionMenuPress={onSessionMenuPress}
              sessionSelection={sessionSelection}
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
  onDayActionsPress,
  onSessionPress,
}: {
  focusDate: Date;
  items: SchedulePreviewItem[];
  size: ScheduleCalendarSize;
  selectedDate?: Date;
  onDayPress?: (date: Date, dayItems: SchedulePreviewItem[]) => void;
  onDayActionsPress?: (
    date: Date,
    dayItems: SchedulePreviewItem[],
    anchor: PopoverAnchor,
  ) => void;
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
              <View style={styles.monthDayHeader}>
                <Text style={[styles.monthDayNumber, !inMonth && styles.monthDayNumberMuted]}>
                  {day.getDate()}
                </Text>
                {onDayActionsPress ? (
                  <DayActionsButton
                    onPress={(anchor) => onDayActionsPress(day, dayItems, anchor)}
                  />
                ) : null}
              </View>
              {dayItems.slice(0, visibleSessions).map((item) =>
                onSessionPress ? (
                  <Pressable key={item.id} onPress={() => onSessionPress(item)}>
                    <Text
                      style={[
                        styles.monthSessionDot,
                        size === 'large' && styles.monthSessionDotLarge,
                        item.isCurrent && styles.monthSessionDotCurrent,
                        item.kind === 'activation' && styles.monthSessionDotActivation,
                        item.kind === 'rest' && styles.monthSessionDotRestDay,
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
                      item.kind === 'rest' && styles.monthSessionDotRestDay,
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
  onDayActionsPress,
  onSessionPress,
  expandedItemIds,
  onToggleItemExpanded,
  renderItemDetail,
  sessionActions,
  onSessionMenuPress,
  sessionSelection,
  inlineEditingKey,
}: {
  focusDate: Date;
  items: SchedulePreviewItem[];
  size: ScheduleCalendarSize;
  fill?: boolean;
  selectedDate?: Date;
  onDayPress?: (date: Date, dayItems: SchedulePreviewItem[]) => void;
  onDayActionsPress?: (
    date: Date,
    dayItems: SchedulePreviewItem[],
    anchor: PopoverAnchor,
  ) => void;
  onSessionPress?: (item: SchedulePreviewItem) => void;
  expandedItemIds?: readonly string[];
  onToggleItemExpanded?: (item: SchedulePreviewItem) => void;
  renderItemDetail?: (item: SchedulePreviewItem) => ReactNode;
  sessionActions?: CalendarSessionActions;
  onSessionMenuPress?: (item: SchedulePreviewItem, anchor: PopoverAnchor) => void;
  sessionSelection?: {
    selectedKeys: ReadonlySet<string>;
    onToggle: (item: SchedulePreviewItem) => void;
  };
  inlineEditingKey?: string;
}) {
  const days = getWeekDays(focusDate);
  const columnNodesRef = useRef(new Map<string, View | null>());
  const columnRefCallbacksRef = useRef(new Map<string, (node: View | null) => void>());
  const columnBoundsRef = useRef<ColumnBounds[]>([]);
  const chipNodesRef = useRef(new Map<string, View | null>());
  const chipRefCallbacksRef = useRef(new Map<string, (node: View | null) => void>());
  const chipBoundsRef = useRef<ChipBounds[]>([]);
  const [dropHint, setDropHint] = useState<DropHint | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const canDrag = Boolean(sessionActions?.onMoveToDate || sessionActions?.onReorderDay);

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

  const registerChipRef = useCallback((itemKey: string) => {
    const cached = chipRefCallbacksRef.current.get(itemKey);
    if (cached) return cached;

    const callback = (node: View | null) => {
      chipNodesRef.current.set(itemKey, node);
    };
    chipRefCallbacksRef.current.set(itemKey, callback);
    return callback;
  }, []);

  // Las medidas se publican de golpe para que nadie lea una lista a medio hacer.
  const measureColumnBounds = useCallback(() => {
    const entries = Array.from(columnNodesRef.current.entries());
    const bounds: ColumnBounds[] = [];
    let pending = entries.length;

    if (pending === 0) {
      columnBoundsRef.current = [];
      return;
    }

    const settle = () => {
      pending -= 1;
      if (pending <= 0) columnBoundsRef.current = bounds.sort((left, right) => left.x - right.x);
    };

    entries.forEach(([dayKey, node]) => {
      if (!node) {
        settle();
        return;
      }
      node.measureInWindow((x, y, width) => {
        bounds.push({ date: new Date(dayKey), x, y, width });
        settle();
      });
    });
  }, []);

  const measureChipBounds = useCallback(() => {
    const dayByChip = new Map<string, string>();
    days.forEach((day) => {
      itemsForDate(items, day).forEach((entry) =>
        dayByChip.set(scheduleItemKey(entry), dayKeyOf(day)),
      );
    });

    const entries = Array.from(chipNodesRef.current.entries());
    const bounds: ChipBounds[] = [];
    let pending = entries.length;

    if (pending === 0) {
      chipBoundsRef.current = [];
      return;
    }

    const settle = () => {
      pending -= 1;
      if (pending <= 0) chipBoundsRef.current = bounds.sort((left, right) => left.y - right.y);
    };

    entries.forEach(([itemKey, node]) => {
      const dayKey = dayByChip.get(itemKey);
      if (!node || !dayKey) {
        settle();
        return;
      }
      node.measureInWindow((_x, y, _width, height) => {
        bounds.push({ key: itemKey, dayKey, y, height });
        settle();
      });
    });
  }, [days, items]);

  /** Columna bajo el dedo y hueco en el que quedaría la sesión, con la altura de la línea que lo marca. */
  const findDropHint = useCallback(
    (moved: SchedulePreviewItem, pageX: number, pageY: number): DropHint | null => {
      const column = columnBoundsRef.current.find(
        (bounds) => pageX >= bounds.x && pageX <= bounds.x + bounds.width,
      );
      if (!column) return null;

      const movedKey = scheduleItemKey(moved);
      const sameDay = isSameDate(column.date, moved.date);
      if (sameDay ? !sessionActions?.onReorderDay : !sessionActions?.onMoveToDate) return null;

      const columnDayKey = dayKeyOf(column.date);
      const others = chipBoundsRef.current.filter(
        (chip) => chip.dayKey === columnDayKey && chip.key !== movedKey,
      );
      const index = dropIndexForPosition(others, pageY);
      const lineY = dropLineOffsetForIndex(others, index);

      return { date: column.date, movedKey, index, lineTop: lineY === null ? null : lineY - column.y };
    },
    [sessionActions?.onMoveToDate, sessionActions?.onReorderDay],
  );

  const handleDragStart = useCallback(
    (moved: SchedulePreviewItem) => {
      measureColumnBounds();
      measureChipBounds();
      setDraggingKey(scheduleItemKey(moved));
    },
    [measureChipBounds, measureColumnBounds],
  );

  const handleDragMove = useCallback(
    (moved: SchedulePreviewItem, pageX: number, pageY: number) => {
      setDropHint((current) => {
        const next = findDropHint(moved, pageX, pageY);
        return isSameDropHint(current, next) ? current : next;
      });
    },
    [findDropHint],
  );

  const handleDragEnd = useCallback(
    (moved: SchedulePreviewItem, pageX: number, pageY: number) => {
      const target = findDropHint(moved, pageX, pageY);
      setDraggingKey(null);
      setDropHint(null);
      if (!target) return;

      const movedKey = target.movedKey;
      const dayItems = itemsForDate(items, target.date);
      const others = dayItems.filter((entry) => scheduleItemKey(entry) !== movedKey);
      const ordered = [...others];
      ordered.splice(target.index, 0, moved);

      if (!isSameDate(target.date, moved.date)) {
        sessionActions?.onMoveToDate?.(moved, target.date, ordered);
        return;
      }

      // Soltarla en su mismo hueco no es un movimiento: no hay nada que guardar.
      const unchanged = ordered.every(
        (entry, index) => scheduleItemKey(entry) === scheduleItemKey(dayItems[index]),
      );
      if (unchanged) return;

      sessionActions?.onReorderDay?.(moved.date, ordered);
    },
    [findDropHint, items, sessionActions],
  );

  const renderChip = (item: SchedulePreviewItem) => {
    const expanded = expandedItemIds?.includes(scheduleItemKey(item)) ?? false;
    const itemKey = scheduleItemKey(item);
    const canSelect = Boolean(sessionSelection && isSelectableCalendarSession(item));
    const chipProps = {
      item,
      onPress: onSessionPress,
      expanded,
      onToggleExpanded: onToggleItemExpanded ? () => onToggleItemExpanded(item) : undefined,
      onMenuPress: onSessionMenuPress
        ? (anchor: PopoverAnchor) => onSessionMenuPress(item, anchor)
        : undefined,
      selectionChecked: canSelect && sessionSelection?.selectedKeys.has(itemKey),
      onToggleSelection: canSelect
        ? () => sessionSelection?.onToggle(item)
        : undefined,
      inlineEditing: inlineEditingKey === itemKey,
      detail: renderItemDetail && expanded ? renderItemDetail(item) : undefined,
    };

    if (canDrag) {
      return (
        <DraggableSessionChip
          key={itemKey}
          {...chipProps}
          chipRef={registerChipRef(itemKey)}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      );
    }

    return <SessionChip key={itemKey} {...chipProps} />;
  };

  return (
    <View style={[styles.weekGridWrapper, fill && styles.weekGridWrapperFill]}>
      <View
        collapsable={false}
        style={[styles.weekGrid, fill && styles.weekGridFill]}
        onLayout={canDrag ? measureColumnBounds : undefined}
      >
        {days.map((day) => {
        const dayItems = itemsForDate(items, day);
        const weekday = WEEKDAY_SHORT_LABELS[day.getDay() === 0 ? 6 : day.getDay() - 1];
        const selected = isSameDate(day, selectedDate);
        const hint = dropHint && isSameDate(day, dropHint.date) ? dropHint : null;
        const isDragSource = Boolean(
          draggingKey && dayItems.some((entry) => scheduleItemKey(entry) === draggingKey),
        );
        const dropLineTop = hint?.lineTop ?? null;
        const hasInlineEditor = Boolean(
          inlineEditingKey && dayItems.some((entry) => scheduleItemKey(entry) === inlineEditingKey),
        );
        return (
          <View
            key={day.toISOString()}
            ref={canDrag ? registerColumnRef(day) : undefined}
            collapsable={false}
            style={[
              styles.weekColumn,
              size === 'large' && styles.weekColumnLarge,
              fill && styles.weekColumnFill,
              selected && styles.weekColumnSelected,
              hasInlineEditor && styles.weekColumnInlineEditing,
              isDragSource && styles.weekColumnDragSource,
              hint && styles.weekColumnDropTarget,
            ]}
          >
            <Pressable
              onPress={onDayPress ? () => onDayPress(day, dayItems) : undefined}
              disabled={!onDayPress}
              style={({ pressed }) => [
                styles.weekColumnHeader,
                onDayPress && styles.weekColumnPressable,
                onDayPress && pressed && styles.weekColumnHeaderPressed,
              ]}
            >
              <View style={styles.weekColumnHeaderMain}>
                <Text style={styles.weekColumnDay}>{weekday}</Text>
                <Text style={styles.weekColumnDate}>{day.getDate()}</Text>
              </View>
              {onDayActionsPress ? (
                <DayActionsButton
                  size="medium"
                  onPress={(anchor) => onDayActionsPress(day, dayItems, anchor)}
                />
              ) : null}
            </Pressable>
            <View style={fill ? styles.weekColumnBody : undefined}>
              {dayItems.length === 0 ? (
                onDayPress ? (
                  <Pressable
                    onPress={() => onDayPress(day, dayItems)}
                    style={({ pressed }) => [
                      fill && styles.weekColumnEmpty,
                      pressed && styles.weekEmptyPressed,
                    ]}
                  >
                    <Text style={[styles.weekEmpty, hint && styles.weekEmptyDropTarget]}>
                      {hint ? 'Soltar aquí' : 'Sin sesión'}
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={[styles.weekEmpty, hint && styles.weekEmptyDropTarget]}>
                    {hint ? 'Soltar aquí' : 'Sin sesión'}
                  </Text>
                )
              ) : (
                dayItems.map((item) => renderChip(item))
              )}
            </View>
            {dropLineTop !== null ? (
              <View pointerEvents="none" style={[styles.dropLine, { top: dropLineTop }]} />
            ) : null}
          </View>
        );
      })}
      </View>
    </View>
  );
}

function DayView({
  focusDate,
  items,
  onDayActionsPress,
  onSessionPress,
  expandedItemIds,
  onToggleItemExpanded,
  renderItemDetail,
  onSessionMenuPress,
  sessionSelection,
}: {
  focusDate: Date;
  items: SchedulePreviewItem[];
  onDayActionsPress?: (
    date: Date,
    dayItems: SchedulePreviewItem[],
    anchor: PopoverAnchor,
  ) => void;
  onSessionPress?: (item: SchedulePreviewItem) => void;
  expandedItemIds?: readonly string[];
  onToggleItemExpanded?: (item: SchedulePreviewItem) => void;
  renderItemDetail?: (item: SchedulePreviewItem) => ReactNode;
  onSessionMenuPress?: (item: SchedulePreviewItem, anchor: PopoverAnchor) => void;
  sessionSelection?: {
    selectedKeys: ReadonlySet<string>;
    onToggle: (item: SchedulePreviewItem) => void;
  };
}) {
  const dayItems = itemsForDate(items, focusDate);

  return (
    <View style={styles.dayView}>
      {onDayActionsPress ? (
        <View style={styles.dayActionsRow}>
          <Text style={styles.dayActionsLabel}>{formatDayLabel(focusDate)}</Text>
          <DayActionsButton
            size="medium"
            onPress={(anchor) => onDayActionsPress(focusDate, dayItems, anchor)}
          />
        </View>
      ) : null}
      {dayItems.length === 0 ? (
        <View style={styles.dayEmpty}>
          <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
          <Text style={styles.dayEmptyText}>No hay sesiones programadas para este día.</Text>
        </View>
      ) : (
        dayItems.map((item) => {
          const expanded = expandedItemIds?.includes(scheduleItemKey(item)) ?? false;
          const itemKey = scheduleItemKey(item);
          const canSelect = Boolean(sessionSelection && isSelectableCalendarSession(item));
          const selected = canSelect && sessionSelection?.selectedKeys.has(itemKey);

          return (
            <View key={itemKey} style={[styles.dayCard, selected && styles.sessionChipSelected]}>
              <View style={styles.dayCardHeader}>
                <Text style={styles.dayCardTitle}>{item.name}</Text>
                {item.isDraft ? <Text style={styles.dayCardDraft}>Borrador</Text> : null}
                <View style={styles.sessionChipActions}>
                  {canSelect ? (
                    <SessionSelectionToggle
                      selected={Boolean(selected)}
                      onPress={() => sessionSelection?.onToggle(item)}
                    />
                  ) : null}
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
    minHeight: 0,
  },
  period: {
    gap: spacing.xs,
  },
  periodFill: {
    flex: 1,
    minHeight: 0,
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
  },
  monthDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  monthSessionDotRestDay: {
    color: colors.restDay,
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
    overflow: 'visible',
  },
  weekGridWrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  weekGridWrapperFill: {
    flex: 1,
    minHeight: 0,
  },
  weekGridFill: {
    flex: 1,
    alignItems: 'stretch',
    minHeight: 0,
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
    overflow: 'visible',
    position: 'relative',
  },
  weekColumnFill: {
    alignSelf: 'stretch',
    minHeight: 0,
  },
  weekColumnBody: {
    flex: 1,
    minHeight: 0,
  },
  weekColumnEmpty: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  weekColumnLarge: {
    minHeight: 320,
    padding: spacing.sm,
  },
  weekColumnInlineEditing: {
    minHeight: 560,
    alignSelf: 'stretch',
  },
  weekColumnPressable: {
    cursor: 'pointer' as const,
  },
  weekColumnHeaderPressed: {
    opacity: 0.85,
  },
  weekEmptyPressed: {
    opacity: 0.85,
  },
  weekColumnSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}10`,
  },
  weekColumnHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  weekColumnHeaderMain: {
    alignItems: 'center',
    flex: 1,
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
  weekColumnDropTarget: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`,
  },
  weekColumnDragSource: {
    borderStyle: 'dashed',
  },
  weekEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  weekEmptyDropTarget: {
    color: colors.accent,
    fontWeight: '700',
  },
  dropLine: {
    position: 'absolute',
    left: spacing.xs,
    right: spacing.xs,
    height: 3,
    marginTop: -1.5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    zIndex: 10,
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
  selectionToggle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  sessionChipSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}12`,
  },
  chipDragHandle: Platform.select({
    web: { cursor: 'grab', userSelect: 'none', touchAction: 'none', minWidth: 26, minHeight: 26 } as object,
    default: { minWidth: 26, minHeight: 26 },
  }),
  sessionChipDraggable: Platform.select({
    web: { cursor: 'grab', userSelect: 'none' } as object,
    default: {},
  }),
  sessionChipDragging: {
    borderColor: colors.accent,
    opacity: 0.96,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 12,
  },
  /** La tarjeta que viaja se pinta por encima del resto de la semana. */
  draggingChipLayer: {
    zIndex: 50,
    elevation: 12,
  },
  sessionChipTitleBtn: {
    flex: 1,
    minWidth: 0,
  },
  sessionChipExpanded: {
    borderColor: colors.accent,
    backgroundColor: colors.background,
  },
  sessionChipInlineEditing: {
    flexGrow: 1,
    minHeight: 480,
  },
  sessionChipDetail: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sessionChipDetailInline: {
    flexGrow: 1,
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
  sessionChipRestDay: {
    borderColor: `${colors.restDay}66`,
    backgroundColor: `${colors.restDay}1A`,
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
  sessionChipNameRestDay: {
    color: colors.restDay,
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
  dayActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayActionsLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
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
