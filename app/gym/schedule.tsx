import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { GymClassFormModal } from '@/components/gym/GymClassFormModal';
import { GymErrorBanner, GymScreen, GymScreenHeader } from '@/components/gym/GymScreen';
import { GymWeekTimetable } from '@/components/gym/GymWeekTimetable';
import { ActionSheetModal, type ActionSheetAction } from '@/components/ui/ActionSheetModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { useGymSchedule } from '@/hooks/useGymData';
import {
  duplicateGymClass,
  saveGymClass,
  saveGymClassType,
  saveGymClasses,
  setGymClassStatus,
  type GymClassInput,
} from '@/lib/gymService';
import { HYPE_CLASS_TYPES, buildHypeWeekClassInputs, isHypeGym } from '@/lib/hypeGymSchedule';
import type { GymClass } from '@/lib/gymTypes';

const WIDE_BREAKPOINT = 900;

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function GymScheduleScreen() {
  const { width } = useWindowDimensions();
  const { gym, permissions } = useGym();
  const {
    weekStart,
    days,
    classes,
    classesByDay,
    classTypes,
    staff,
    isLoading,
    error,
    goToPreviousWeek,
    goToNextWeek,
    goToThisWeek,
    refresh,
  } = useGymSchedule();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GymClass | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [actions, setActions] = useState<GymClass | null>(null);
  const [pendingCancel, setPendingCancel] = useState<GymClass | null>(null);
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);

  const wide = width >= WIDE_BREAKPOINT;
  const isHype = isHypeGym(gym);
  const showAllTypes = typeFilters.length === 0;

  const filteredByDay = useMemo(() => {
    if (showAllTypes) return classesByDay;
    const selected = new Set(typeFilters);
    const next = new Map<string, GymClass[]>();
    for (const [key, dayClasses] of classesByDay) {
      next.set(
        key,
        dayClasses.filter((item) => item.classTypeId && selected.has(item.classTypeId)),
      );
    }
    return next;
  }, [classesByDay, showAllTypes, typeFilters]);

  const toggleTypeFilter = (typeId: string) => {
    setTypeFilters((current) =>
      current.includes(typeId) ? current.filter((id) => id !== typeId) : [...current, typeId],
    );
  };

  const handleSubmit = async (input: GymClassInput & { id?: string }) => {
    if (!gym) return { error: 'No hay gimnasio activo.' };

    const result = await saveGymClass(gym.id, input);
    if (!result.error) refresh();
    return result;
  };

  const handleCancelClass = async () => {
    if (!pendingCancel) return;

    setBusy(true);
    const result = await setGymClassStatus(pendingCancel.id, 'cancelled');
    setBusy(false);
    setPendingCancel(null);

    if (result.error) setActionError(result.error);
    else refresh();
  };

  const handleDuplicate = async (gymClass: GymClass) => {
    const result = await duplicateGymClass(gymClass, 7);
    if (result.error) setActionError(result.error);
    else refresh();
  };

  const ensureClassTypes = async () => {
    if (!gym) return classTypes;
    const existing = new Map(classTypes.map((type) => [type.name.toUpperCase(), type]));
    const next = [...classTypes];

    for (const seed of HYPE_CLASS_TYPES) {
      if (existing.has(seed.name.toUpperCase())) continue;
      const result = await saveGymClassType(gym.id, seed);
      if (result.data) {
        existing.set(seed.name.toUpperCase(), result.data);
        next.push(result.data);
      }
    }

    return next;
  };

  const applyWeeklyTemplate = async () => {
    if (!gym || !isHype) return;

    setApplying(true);
    setActionError(null);
    const types = await ensureClassTypes();
    const { inputs, missingTypes } = buildHypeWeekClassInputs(weekStart, types);
    if (missingTypes.length > 0) {
      setApplying(false);
      setActionError(`Faltan tipos de clase: ${missingTypes.join(', ')}.`);
      return;
    }

    const existingKeys = new Set(
      classes.map((item) => `${item.classTypeId}|${new Date(item.startAt).toISOString()}`),
    );
    const fresh = inputs.filter(
      (input) => !existingKeys.has(`${input.classTypeId}|${new Date(input.startAt).toISOString()}`),
    );

    if (fresh.length === 0) {
      setApplying(false);
      setActionError('Esta semana ya tiene el horario de Hype.');
      return;
    }

    const result = await saveGymClasses(gym.id, fresh);
    setApplying(false);
    if (result.error) setActionError(result.error);
    else refresh();
  };

  const openCreate = (day?: Date) => {
    setEditing(null);
    setDefaultDate(day ?? weekStart);
    setFormOpen(true);
  };

  const classActions: ActionSheetAction[] = actions
    ? [
        {
          key: 'edit',
          label: 'Editar clase',
          onPress: () => {
            setEditing(actions);
            setDefaultDate(undefined);
            setActions(null);
            setFormOpen(true);
          },
        },
        {
          key: 'duplicate',
          label: 'Duplicar en la semana siguiente',
          onPress: () => {
            const target = actions;
            setActions(null);
            void handleDuplicate(target);
          },
        },
        ...(actions.status !== 'cancelled'
          ? [
              {
                key: 'cancel',
                label: 'Cancelar clase',
                destructive: true,
                onPress: () => {
                  setPendingCancel(actions);
                  setActions(null);
                },
              },
            ]
          : [
              {
                key: 'restore',
                label: 'Reactivar clase',
                onPress: () => {
                  const target = actions;
                  setActions(null);
                  void setGymClassStatus(target.id, 'scheduled').then(refresh);
                },
              },
            ]),
      ]
    : [];

  return (
    <GymScreen>
      <ScreenWrapper scrollable={false} style={styles.page}>
        <GymScreenHeader
          title="Horario"
          subtitle="Clases dirigidas de la semana"
          action={
            <View style={styles.headerActions}>
              <View style={styles.weekNav}>
                <Pressable
                  onPress={goToPreviousWeek}
                  accessibilityLabel="Semana anterior"
                  style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
                >
                  <AppIcon name="chevronLeft" size={16} color={colors.textSecondary} />
                </Pressable>
                <Text style={styles.weekLabel}>
                  {weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} –{' '}
                  {days[6]?.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </Text>
                <Pressable
                  onPress={goToNextWeek}
                  accessibilityLabel="Semana siguiente"
                  style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
                >
                  <AppIcon name="chevronRight" size={16} color={colors.textSecondary} />
                </Pressable>
                <Button title="Hoy" variant="ghost" size="compact" onPress={goToThisWeek} />
              </View>
              {permissions.canOperate ? (
                <>
                  {isHype ? (
                    <Button
                      title={applying ? 'Aplicando…' : 'Cargar horario Hype'}
                      variant="outline"
                      size="compact"
                      disabled={applying}
                      onPress={() => void applyWeeklyTemplate()}
                    />
                  ) : null}
                  <Button title="Crear clase" size="compact" onPress={() => openCreate()} />
                </>
              ) : null}
            </View>
          }
        />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}
        {actionError ? <GymErrorBanner message={actionError} /> : null}

        {classTypes.length > 0 ? (
          <View style={styles.filters}>
            <Pressable
              onPress={() => setTypeFilters([])}
              accessibilityRole="button"
              accessibilityState={{ selected: showAllTypes }}
              style={({ pressed }) => [
                styles.filterChip,
                showAllTypes && styles.filterChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterText, showAllTypes && styles.filterTextActive]}>
                Todas las clases
              </Text>
            </Pressable>
            {classTypes.map((type) => {
              const selected = typeFilters.includes(type.id);
              return (
                <Pressable
                  key={type.id}
                  onPress={() => toggleTypeFilter(type.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.filterChip,
                    selected && styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.filterDot, { backgroundColor: type.color ?? colors.border }]} />
                  <Text style={[styles.filterText, selected && styles.filterTextActive]}>
                    {type.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.skeletonWeek}>
            <SkeletonBlock height={420} />
          </View>
        ) : (
          <GymWeekTimetable
            days={days}
            classesByDay={filteredByDay}
            classTypes={classTypes}
            wide={wide}
            canOperate={permissions.canOperate}
            onPressClass={permissions.canOperate ? setActions : undefined}
            onAddDay={permissions.canOperate ? openCreate : undefined}
          />
        )}

        <GymClassFormModal
          visible={formOpen}
          gymClass={editing}
          classTypes={classTypes}
          staff={staff}
          defaultDate={defaultDate}
          onCancel={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />

        <ActionSheetModal
          visible={actions !== null}
          title={actions?.classTypeName ?? 'Clase'}
          subtitle={actions ? formatTime(actions.startAt) : undefined}
          actions={classActions}
          onClose={() => setActions(null)}
        />

        <ConfirmModal
          visible={pendingCancel !== null}
          title="¿Cancelar esta clase?"
          message="Las reservas existentes se mantienen, pero la clase queda marcada como cancelada."
          confirmLabel="Cancelar clase"
          destructive
          busy={busy}
          onCancel={() => setPendingCancel(null)}
          onConfirm={() => void handleCancelClass()}
        />
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: 0,
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  weekLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    minWidth: 108,
  },
  pressed: { opacity: 0.8 },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
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
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.accent,
  },
  skeletonWeek: {
    flex: 1,
    minHeight: 280,
  },
});
