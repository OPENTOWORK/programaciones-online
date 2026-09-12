import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
} from '@/components/gym/GymScreen';
import { GymTaskFormModal } from '@/components/gym/GymTaskFormModal';
import {
  GymTasksCalendarView,
  GymTasksGridView,
  GymTasksKanbanView,
  GymTasksListView,
  GymTasksViewToggle,
  type GymTasksViewMode,
} from '@/components/gym/GymTasksBoard';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useGym } from '@/hooks/useGym';
import { useGymTasks } from '@/hooks/useGymTasks';
import {
  deleteGymTask,
  isGymTaskDueToday,
  isGymTaskOverdue,
  nextGymTaskStatus,
  saveGymTask,
  setGymTaskStatus,
} from '@/lib/gymTaskService';
import type { GymTask } from '@/lib/gymTypes';

type TaskFilter = 'all' | 'mine' | 'overdue';

export default function GymTasksScreen() {
  const { user } = useAuth();
  const { gym, permissions } = useGym();
  const { tasks, staff, isLoading, error, refresh } = useGymTasks();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [viewMode, setViewMode] = useState<GymTasksViewMode>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GymTask | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GymTask | null>(null);
  const [busy, setBusy] = useState(false);

  const canWrite = permissions.canOperate;
  const overdue = tasks.filter(isGymTaskOverdue);
  const dueToday = tasks.filter(isGymTaskDueToday);

  const visible = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'mine') return task.assignedTo === user?.id;
      if (filter === 'overdue') return isGymTaskOverdue(task);
      return true;
    });
  }, [filter, tasks, user?.id]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const moveTask = async (task: GymTask) => {
    await setGymTaskStatus(task.id, nextGymTaskStatus(task.status));
    refresh();
  };

  const sharedTaskProps = {
    tasks: visible,
    canWrite,
    onEdit: (task: GymTask) => {
      setEditing(task);
      setFormOpen(true);
    },
    onMove: (task: GymTask) => {
      void moveTask(task);
    },
    onDelete: (task: GymTask) => {
      setPendingDelete(task);
    },
  };

  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader
          title="Tareas"
          subtitle="Qué tiene que hacer el equipo, quién y para cuándo"
          action={
            canWrite ? (
              <Button title="Nueva tarea" size="compact" onPress={openCreate} />
            ) : undefined
          }
        />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}

        {overdue.length > 0 || dueToday.length > 0 ? (
          <View style={styles.alert}>
            <AppIcon name="time" size={16} color={overdue.length > 0 ? colors.danger : colors.warning} />
            <Text style={styles.alertText}>
              {[
                overdue.length > 0
                  ? `${overdue.length} vencida${overdue.length === 1 ? '' : 's'}`
                  : null,
                dueToday.length > 0 ? `${dueToday.length} para hoy` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              . Prioriza estas primero.
            </Text>
          </View>
        ) : null}

        <View style={styles.toolbar}>
          <View style={styles.filters}>
            {(
              [
                { id: 'all', label: `Todas (${tasks.length})` },
                { id: 'mine', label: 'Mías' },
                { id: 'overdue', label: `Vencidas (${overdue.length})` },
              ] as const
            ).map((item) => {
              const active = filter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setFilter(item.id)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    active && styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <GymTasksViewToggle mode={viewMode} onChange={setViewMode} />
        </View>

        {isLoading ? (
          <View style={styles.skeleton}>
            <SkeletonBlock height={180} />
            <SkeletonBlock height={180} />
          </View>
        ) : tasks.length === 0 ? (
          <GymEmptyState
            icon="templates"
            title="Todavía no hay tareas"
            text="Crea la primera: reponer material, llamar a un socio o dejar un aviso al turno siguiente."
            action={
              canWrite ? (
                <Button title="Crear la primera" variant="outline" size="compact" onPress={openCreate} />
              ) : undefined
            }
          />
        ) : visible.length === 0 ? (
          <GymEmptyState
            icon="search"
            title="Sin resultados"
            text="No hay tareas con este filtro. Prueba con otra vista o crea una nueva."
            action={
              canWrite ? (
                <Button title="Nueva tarea" variant="outline" size="compact" onPress={openCreate} />
              ) : undefined
            }
          />
        ) : viewMode === 'calendar' ? (
          <GymTasksCalendarView {...sharedTaskProps} />
        ) : viewMode === 'grid' ? (
          <GymTasksGridView {...sharedTaskProps} />
        ) : viewMode === 'kanban' ? (
          <GymTasksKanbanView {...sharedTaskProps} />
        ) : (
          <GymTasksListView {...sharedTaskProps} />
        )}

        <GymTaskFormModal
          visible={formOpen}
          task={editing}
          staff={staff}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={async (input) => {
            if (!gym) return { error: 'No hay gimnasio activo.' };
            const result = await saveGymTask(gym.id, { ...input, id: editing?.id }, user?.id);
            if (!result.error) {
              setFormOpen(false);
              setEditing(null);
              refresh();
            }
            return result;
          }}
        />

        <ConfirmModal
          visible={pendingDelete !== null}
          title="Eliminar tarea"
          message={`Se quitará «${pendingDelete?.title ?? 'esta tarea'}».`}
          confirmLabel="Eliminar"
          destructive
          busy={busy}
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => {
            if (!pendingDelete) return;
            setBusy(true);
            await deleteGymTask(pendingDelete.id);
            setBusy(false);
            setPendingDelete(null);
            refresh();
          }}
        />
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withAlpha(colors.warning, '55'),
    backgroundColor: withAlpha(colors.warning, '14'),
  },
  alertText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.accent,
  },
  skeleton: {
    gap: spacing.sm,
  },
  pressed: { opacity: 0.8 },
});
