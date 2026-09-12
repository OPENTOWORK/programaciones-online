import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { isSameCalendarDay } from '@/lib/appointmentSchedule';
import {
  formatGymTaskDue,
  gymTaskOccursOnDate,
  gymTasksByRecurrence,
  gymTasksForDate,
  isGymTaskDueToday,
  isGymTaskOverdue,
} from '@/lib/gymTaskService';
import {
  GYM_TASK_PRIORITY_LABELS,
  GYM_TASK_RECURRENCE_LABELS,
  GYM_TASK_RECURRENCE_ORDER,
  GYM_TASK_STATUS_LABELS,
  GYM_TASK_STATUS_ORDER,
  type GymTask,
  type GymTaskStatus,
} from '@/lib/gymTypes';
import {
  formatMonthLabel,
  getMonthGrid,
  getWeekdayShortLabels,
  isDateInSameMonth,
  shiftMonth,
} from '@/lib/programSchedulePreview';

function priorityColor(priority: GymTask['priority']) {
  if (priority === 'high') return colors.danger;
  if (priority === 'medium') return colors.warning;
  return colors.textMuted;
}

export function GymTaskCard({
  task,
  canWrite,
  onPress,
  onMove,
  onDelete,
}: {
  task: GymTask;
  canWrite: boolean;
  onPress: () => void;
  onMove: () => void;
  onDelete: () => void;
}) {
  const overdueTask = isGymTaskOverdue(task);
  const today = isGymTaskDueToday(task);

  return (
    <Pressable
      onPress={onPress}
      disabled={!canWrite}
      style={({ pressed }) => [
        styles.card,
        overdueTask && styles.cardOverdue,
        today && !overdueTask && styles.cardToday,
        pressed && canWrite && styles.pressed,
      ]}
    >
      <View style={styles.cardTop}>
        <Text style={[styles.priority, { color: priorityColor(task.priority) }]}>
          {GYM_TASK_PRIORITY_LABELS[task.priority]}
        </Text>
        <Text style={[styles.due, overdueTask && styles.dueOverdue, today && styles.dueToday]}>
          {formatGymTaskDue(task)}
        </Text>
      </View>
      <Text style={styles.cardTitle}>{task.title}</Text>
      {task.description ? (
        <Text style={styles.cardDetail} numberOfLines={2}>{task.description}</Text>
      ) : null}
      <Text style={styles.assignee}>
        {task.assigneeName ?? 'Sin asignar'} · {GYM_TASK_STATUS_LABELS[task.status]}
      </Text>
      {canWrite ? (
        <View style={styles.cardActions}>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onMove();
            }}
            style={({ pressed }) => [styles.miniBtn, pressed && styles.pressed]}
          >
            <Text style={styles.miniBtnText}>
              {task.status === 'pending'
                ? 'Empezar'
                : task.status === 'in_progress'
                  ? task.recurrence === 'once'
                    ? 'Hecha'
                    : 'Hecha y repetir'
                  : 'Reabrir'}
            </Text>
          </Pressable>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            accessibilityLabel="Eliminar tarea"
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <AppIcon name="trash" size={15} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

export function GymTasksGridView({
  tasks,
  canWrite,
  onEdit,
  onMove,
  onDelete,
}: {
  tasks: readonly GymTask[];
  canWrite: boolean;
  onEdit: (task: GymTask) => void;
  onMove: (task: GymTask) => void;
  onDelete: (task: GymTask) => void;
}) {
  const { width } = useWindowDimensions();
  const itemBasis = width >= 1100 ? '31%' : width >= 720 ? '48%' : '100%';
  const grouped = useMemo(() => gymTasksByRecurrence(tasks), [tasks]);

  return (
    <View style={styles.sections}>
      {GYM_TASK_RECURRENCE_ORDER.map((recurrence) => {
        const sectionTasks = grouped.get(recurrence) ?? [];
        return (
          <View key={recurrence} style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{GYM_TASK_RECURRENCE_LABELS[recurrence]}</Text>
              <Text style={styles.sectionCount}>{sectionTasks.length}</Text>
            </View>
            {sectionTasks.length === 0 ? (
              <Text style={styles.sectionEmpty}>Sin tareas en esta frecuencia</Text>
            ) : (
              <View style={styles.grid}>
                {sectionTasks.map((task) => (
                  <View key={task.id} style={[styles.gridItem, { flexBasis: itemBasis }]}>
                    <GymTaskCard
                      task={task}
                      canWrite={canWrite}
                      onPress={() => onEdit(task)}
                      onMove={() => onMove(task)}
                      onDelete={() => onDelete(task)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

export function GymTasksCalendarView({
  tasks,
  canWrite,
  onEdit,
  onMove,
  onDelete,
}: {
  tasks: readonly GymTask[];
  canWrite: boolean;
  onEdit: (task: GymTask) => void;
  onMove: (task: GymTask) => void;
  onDelete: (task: GymTask) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [focusDate, setFocusDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  const days = getMonthGrid(focusDate);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const selectedTasks = useMemo(
    () => gymTasksForDate(tasks, selectedDate),
    [selectedDate, tasks],
  );

  const countForDay = (day: Date) =>
    tasks.filter((task) => gymTaskOccursOnDate(task, day)).length;

  return (
    <View style={styles.calendarWrap}>
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Pressable
            onPress={() => setFocusDate((current) => shiftMonth(current, -1))}
            style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
          >
            <AppIcon name="chevronLeft" size={18} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.monthLabel}>{formatMonthLabel(focusDate)}</Text>
          <Pressable
            onPress={() => setFocusDate((current) => shiftMonth(current, 1))}
            style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
          >
            <AppIcon name="chevronRight" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {getWeekdayShortLabels().map((label, index) => (
            <Text key={`${label}-${index}`} style={styles.weekdayLabel}>{label}</Text>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day) => {
              const selected = isSameCalendarDay(day, selectedDate);
              const outside = !isDateInSameMonth(day, focusDate);
              const isToday = isSameCalendarDay(day, today);
              const count = countForDay(day);

              return (
                <Pressable
                  key={day.toISOString()}
                  onPress={() => {
                    setSelectedDate(day);
                    setFocusDate(day);
                  }}
                  style={({ pressed }) => [
                    styles.dayCell,
                    selected && styles.dayCellSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      outside && styles.dayNumberOutside,
                      isToday && !selected && styles.dayNumberToday,
                      selected && styles.dayNumberSelected,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                  {count > 0 ? (
                    <View style={styles.dayDots}>
                      {count <= 3 ? (
                        Array.from({ length: count }).map((_, index) => (
                          <View key={index} style={styles.dayDot} />
                        ))
                      ) : (
                        <Text style={styles.dayCount}>{count}</Text>
                      )}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.dayPanel}>
        <Text style={styles.dayPanelTitle}>
          {selectedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        {selectedTasks.length === 0 ? (
          <Text style={styles.sectionEmpty}>No hay tareas para este día</Text>
        ) : (
          <View style={styles.dayList}>
            {selectedTasks.map((task) => (
              <GymTaskCard
                key={task.id}
                task={task}
                canWrite={canWrite}
                onPress={() => onEdit(task)}
                onMove={() => onMove(task)}
                onDelete={() => onDelete(task)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const KANBAN_COLUMN_WIDTH = 280;

function statusColumnColor(status: GymTaskStatus) {
  if (status === 'pending') return colors.textMuted;
  if (status === 'in_progress') return colors.warning;
  return colors.success;
}

export function GymTasksKanbanView({
  tasks,
  canWrite,
  onEdit,
  onMove,
  onDelete,
}: {
  tasks: readonly GymTask[];
  canWrite: boolean;
  onEdit: (task: GymTask) => void;
  onMove: (task: GymTask) => void;
  onDelete: (task: GymTask) => void;
}) {
  const grouped = useMemo(() => {
    const columns = new Map<GymTaskStatus, GymTask[]>();
    for (const status of GYM_TASK_STATUS_ORDER) columns.set(status, []);
    for (const task of tasks) {
      columns.get(task.status)?.push(task);
    }
    return columns;
  }, [tasks]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={Platform.OS === 'web'}
      contentContainerStyle={styles.kanbanBoard}
    >
      {GYM_TASK_STATUS_ORDER.map((status) => {
        const columnTasks = grouped.get(status) ?? [];
        const accent = statusColumnColor(status);

        return (
          <View key={status} style={styles.kanbanColumn}>
            <View style={[styles.kanbanColumnHead, { borderTopColor: accent }]}>
              <Text style={styles.kanbanColumnTitle}>{GYM_TASK_STATUS_LABELS[status]}</Text>
              <Text style={styles.kanbanColumnCount}>{columnTasks.length}</Text>
            </View>
            <View style={styles.kanbanCards}>
              {columnTasks.length === 0 ? (
                <Text style={styles.kanbanEmpty}>Sin tareas</Text>
              ) : (
                columnTasks.map((task) => (
                  <GymTaskCard
                    key={task.id}
                    task={task}
                    canWrite={canWrite}
                    onPress={() => onEdit(task)}
                    onMove={() => onMove(task)}
                    onDelete={() => onDelete(task)}
                  />
                ))
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

export function GymTasksListView({
  tasks,
  canWrite,
  onEdit,
  onMove,
  onDelete,
}: {
  tasks: readonly GymTask[];
  canWrite: boolean;
  onEdit: (task: GymTask) => void;
  onMove: (task: GymTask) => void;
  onDelete: (task: GymTask) => void;
}) {
  const grouped = useMemo(() => gymTasksByRecurrence(tasks), [tasks]);

  return (
    <View style={styles.sections}>
      {GYM_TASK_RECURRENCE_ORDER.map((recurrence) => {
        const sectionTasks = grouped.get(recurrence) ?? [];
        return (
          <View key={recurrence} style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{GYM_TASK_RECURRENCE_LABELS[recurrence]}</Text>
              <Text style={styles.sectionCount}>{sectionTasks.length}</Text>
            </View>
            {sectionTasks.length === 0 ? (
              <Text style={styles.sectionEmpty}>Sin tareas en esta frecuencia</Text>
            ) : (
              <View style={styles.list}>
                {sectionTasks.map((task, index) => (
                  <GymTaskListRow
                    key={task.id}
                    task={task}
                    canWrite={canWrite}
                    bordered={index > 0}
                    onPress={() => onEdit(task)}
                    onMove={() => onMove(task)}
                    onDelete={() => onDelete(task)}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function GymTaskListRow({
  task,
  canWrite,
  bordered,
  onPress,
  onMove,
  onDelete,
}: {
  task: GymTask;
  canWrite: boolean;
  bordered: boolean;
  onPress: () => void;
  onMove: () => void;
  onDelete: () => void;
}) {
  const overdueTask = isGymTaskOverdue(task);
  const today = isGymTaskDueToday(task);

  return (
    <Pressable
      onPress={onPress}
      disabled={!canWrite}
      style={({ pressed }) => [
        styles.listRow,
        bordered && styles.listRowBorder,
        overdueTask && styles.listRowOverdue,
        today && !overdueTask && styles.listRowToday,
        pressed && canWrite && styles.pressed,
      ]}
    >
      <View style={styles.listRowCopy}>
        <Text style={styles.listRowTitle} numberOfLines={1}>{task.title}</Text>
        <Text style={styles.listRowMeta} numberOfLines={1}>
          {task.assigneeName ?? 'Sin asignar'}
          {` · ${GYM_TASK_STATUS_LABELS[task.status]}`}
          {` · ${GYM_TASK_PRIORITY_LABELS[task.priority]}`}
        </Text>
      </View>
      <Text
        style={[
          styles.listRowDue,
          overdueTask && styles.dueOverdue,
          today && styles.dueToday,
        ]}
      >
        {formatGymTaskDue(task)}
      </Text>
      {canWrite ? (
        <View style={styles.listRowActions}>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onMove();
            }}
            style={({ pressed }) => [styles.miniBtn, pressed && styles.pressed]}
          >
            <Text style={styles.miniBtnText}>
              {task.status === 'pending'
                ? 'Empezar'
                : task.status === 'in_progress'
                  ? task.recurrence === 'once'
                    ? 'Hecha'
                    : 'Repetir'
                  : 'Reabrir'}
            </Text>
          </Pressable>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            accessibilityLabel="Eliminar tarea"
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <AppIcon name="trash" size={15} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

export type GymTasksViewMode = 'list' | 'kanban' | 'grid' | 'calendar';

export function GymTasksViewToggle({
  mode,
  onChange,
}: {
  mode: GymTasksViewMode;
  onChange: (mode: GymTasksViewMode) => void;
}) {
  return (
    <View style={styles.viewToggle}>
      {(
        [
          { id: 'list' as const, label: 'Lista', icon: 'programs' as const },
          { id: 'kanban' as const, label: 'Kanban', icon: 'kanban' as const },
          { id: 'grid' as const, label: 'Cuadrícula', icon: 'templates' as const },
          { id: 'calendar' as const, label: 'Calendario', icon: 'calendar' as const },
        ] as const
      ).map((item) => {
        const active = mode === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            style={({ pressed }) => [
              styles.viewChip,
              active && styles.viewChipActive,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon
              name={item.icon}
              size={14}
              color={active ? colors.accent : colors.textMuted}
            />
            <Text style={[styles.viewChipText, active && styles.viewChipTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sections: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
  },
  sectionCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
  },
  sectionEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItem: {
    flexGrow: 1,
    padding: 4,
    minWidth: 240,
  },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  listRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listRowOverdue: {
    backgroundColor: withAlpha(colors.danger, '08'),
  },
  listRowToday: {
    backgroundColor: withAlpha(colors.warning, '08'),
  },
  listRowCopy: {
    flex: 1,
    minWidth: 0,
  },
  listRowTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  listRowMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  listRowDue: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    minWidth: 72,
    textAlign: 'right',
  },
  listRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  card: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  cardOverdue: {
    borderColor: withAlpha(colors.danger, '66'),
    backgroundColor: withAlpha(colors.danger, '10'),
  },
  cardToday: {
    borderColor: withAlpha(colors.warning, '66'),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  priority: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  due: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  dueOverdue: {
    color: colors.danger,
  },
  dueToday: {
    color: colors.warning,
  },
  cardTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
  },
  cardDetail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  assignee: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  miniBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  miniBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
  },
  iconBtn: {
    padding: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  pressed: { opacity: 0.8 },
  viewToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  viewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  viewChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  viewChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  viewChipTextActive: {
    color: colors.accent,
  },
  calendarWrap: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  calendarCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navBtn: {
    padding: 6,
    borderRadius: borderRadius.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  monthLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 10,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  dayCellSelected: {
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  dayNumber: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  dayNumberOutside: {
    color: colors.textMuted,
    opacity: 0.55,
  },
  dayNumberToday: {
    color: colors.accent,
  },
  dayNumberSelected: {
    color: colors.accent,
    fontWeight: '800',
  },
  dayDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
    minHeight: 8,
    alignItems: 'center',
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  dayCount: {
    ...typography.caption,
    fontSize: 9,
    color: colors.accent,
    fontWeight: '800',
  },
  dayPanel: {
    gap: spacing.sm,
  },
  dayPanelTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  dayList: {
    gap: spacing.sm,
  },
  kanbanBoard: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    ...(Platform.OS === 'web' ? ({ minHeight: 420 } as object) : null),
  },
  kanbanColumn: {
    width: KANBAN_COLUMN_WIDTH,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: withAlpha(colors.surface, 'F2'),
    overflow: 'hidden',
  },
  kanbanColumnHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderTopWidth: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  kanbanColumnTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
  },
  kanbanColumnCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
  },
  kanbanCards: {
    gap: spacing.sm,
    padding: spacing.sm,
    minHeight: 120,
  },
  kanbanEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
