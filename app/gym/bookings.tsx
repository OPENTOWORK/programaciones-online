import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
} from '@/components/gym/GymScreen';
import { GymBookingActionModal } from '@/components/gym/GymBookingActionModal';
import { GymClassBookingTiles } from '@/components/gym/GymClassBookingTiles';
import { GymMemberBookingModal } from '@/components/gym/GymMemberBookingModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { useGymBookings, useGymMembers } from '@/hooks/useGymData';
import { createGymBooking, setGymBookingStatus } from '@/lib/gymService';
import {
  type GymBooking,
  type GymBookingStatus,
  type GymClass,
} from '@/lib/gymTypes';

type StatusFilter = GymBookingStatus | 'all';

const FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'waiting', label: 'En espera' },
  { key: 'attended', label: 'Asistieron' },
  { key: 'no_show', label: 'No asistieron' },
  { key: 'cancelled', label: 'Canceladas' },
];

function formatTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function GymBookingsScreen() {
  const { gym, permissions } = useGym();
  const { day, bookings, classes, rosters, isLoading, error, goToPreviousDay, goToNextDay, goToToday, refresh } =
    useGymBookings();
  const { members } = useGymMembers();

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [bookingFor, setBookingFor] = useState<GymClass | null>(null);
  const [actionFor, setActionFor] = useState<GymBooking | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const bookingsByClass = useMemo(() => {
    const map = new Map<string, GymBooking[]>();
    for (const booking of bookings) {
      if (filter !== 'all' && booking.status !== filter) continue;
      const bucket = map.get(booking.classId) ?? [];
      bucket.push(booking);
      map.set(booking.classId, bucket);
    }
    return map;
  }, [bookings, filter]);

  const totalBookingsByClass = useMemo(() => {
    const map = new Map<string, number>();
    for (const booking of bookings) {
      map.set(booking.classId, (map.get(booking.classId) ?? 0) + 1);
    }
    return map;
  }, [bookings]);

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: bookings.length,
      confirmed: 0,
      waiting: 0,
      attended: 0,
      no_show: 0,
      cancelled: 0,
    };
    for (const booking of bookings) result[booking.status] += 1;
    return result;
  }, [bookings]);

  const handleBook = async (memberId: string) => {
    if (!gym || !bookingFor) return;

    setActionError(null);
    const result = await createGymBooking({
      gymId: gym.id,
      classId: bookingFor.id,
      memberId,
    });

    setBookingFor(null);
    if (result.error) setActionError(result.error);
    else refresh();
  };

  const handleStatus = async (status: GymBookingStatus) => {
    if (!actionFor) return;

    setActionError(null);
    const result = await setGymBookingStatus(actionFor.id, status);
    setActionFor(null);

    if (result.error) setActionError(result.error);
    else refresh();
  };

  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader
          title="Reservas"
          subtitle="Aforo y asistencia por clase"
          action={<Button title="Actualizar" variant="outline" size="compact" onPress={refresh} />}
        />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}
        {actionError ? <GymErrorBanner message={actionError} /> : null}

        <View style={styles.dayNav}>
          <Pressable
            onPress={goToPreviousDay}
            accessibilityLabel="Día anterior"
            style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
          >
            <AppIcon name="chevronLeft" size={16} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.dayLabel}>
            {day.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
          <Pressable
            onPress={goToNextDay}
            accessibilityLabel="Día siguiente"
            style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
          >
            <AppIcon name="chevronRight" size={16} color={colors.textSecondary} />
          </Pressable>
          <Button title="Hoy" variant="ghost" size="compact" onPress={goToToday} />
        </View>

        <View style={styles.filters}>
          {FILTERS.map((option) => {
            const selected = filter === option.key;
            if (option.key !== 'all' && counts[option.key] === 0 && !selected) return null;

            return (
              <Pressable
                key={option.key}
                onPress={() => setFilter(option.key)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.chip,
                  selected && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                  {option.label} · {counts[option.key]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <View style={styles.skeletonList}>
            <SkeletonBlock height={110} />
            <SkeletonBlock height={110} />
          </View>
        ) : classes.length === 0 ? (
          <GymEmptyState
            icon="calendar"
            title="No hay clases este día"
            text="Programa clases en el horario para poder gestionar reservas."
          />
        ) : (
          <View style={styles.classList}>
            {classes.map((gymClass) => {
              const classBookings = bookingsByClass.get(gymClass.id) ?? [];
              const totalClassBookings = totalBookingsByClass.get(gymClass.id) ?? 0;
              const hiddenByFilter = filter !== 'all' && classBookings.length === 0 && totalClassBookings > 0;
              const full = gymClass.bookedCount >= gymClass.capacity;
              const fillRatio = gymClass.capacity > 0 ? gymClass.bookedCount / gymClass.capacity : 0;
              const className = gymClass.classTypeName ?? gymClass.title ?? 'Clase';
              const capacityTone =
                fillRatio >= 1 ? colors.danger : fillRatio >= 0.85 ? colors.warning : colors.accent;

              return (
                <View key={gymClass.id} style={styles.classBlock}>
                  <View style={styles.classHeader}>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeBadgeText}>{formatTime(gymClass.startAt)}</Text>
                    </View>

                    <View style={styles.classHeaderCopy}>
                      <Text style={styles.classTitle} numberOfLines={1}>{className}</Text>

                      <View style={styles.capacityRow}>
                        <View style={styles.capacityTrack}>
                          <View
                            style={[
                              styles.capacityFill,
                              {
                                width: `${Math.min(fillRatio * 100, 100)}%`,
                                backgroundColor: capacityTone,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.capacityText}>
                          {gymClass.bookedCount}/{gymClass.capacity}
                        </Text>
                      </View>

                      <View style={styles.metaRow}>
                        {gymClass.waitingCount > 0 ? (
                          <View style={styles.metaChip}>
                            <Text style={styles.metaChipText}>{gymClass.waitingCount} en espera</Text>
                          </View>
                        ) : null}
                        {gymClass.coachName ? (
                          <View style={styles.metaItem}>
                            <AppIcon name="trainer" size={12} color={colors.textMuted} outlined />
                            <Text style={styles.metaText} numberOfLines={1}>{gymClass.coachName}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    {permissions.canOperate && gymClass.status !== 'cancelled' ? (
                      <Button
                        title={full ? 'Lista de espera' : 'Reservar'}
                        variant={full ? 'outline' : 'primary'}
                        size="compact"
                        onPress={() => setBookingFor(gymClass)}
                      />
                    ) : null}
                  </View>

                  {classBookings.length === 0 ? (
                    <View style={styles.emptyBookings}>
                      <View style={styles.emptyBookingsIcon}>
                        <AppIcon name="calendar" size={20} color={colors.textMuted} />
                      </View>
                      <Text style={styles.emptyBookingsTitle}>
                        {hiddenByFilter
                          ? 'Ninguna reserva con este filtro'
                          : 'Sin reservas en esta clase'}
                      </Text>
                      <Text style={styles.emptyBookingsText}>
                        {hiddenByFilter
                          ? `Hay ${totalClassBookings} reserva${totalClassBookings === 1 ? '' : 's'} en otros estados.`
                          : 'Usa el botón Reservar para apuntar a un miembro.'}
                      </Text>
                      {hiddenByFilter ? (
                        <Button
                          title={`Ver todas (${totalClassBookings})`}
                          variant="outline"
                          size="compact"
                          onPress={() => setFilter('all')}
                          style={styles.emptyBookingsAction}
                        />
                      ) : null}
                    </View>
                  ) : (
                    <GymClassBookingTiles
                      bookings={classBookings}
                      roster={rosters[gymClass.id]}
                      onPress={permissions.canOperate ? setActionFor : undefined}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}

        <GymMemberBookingModal
          visible={bookingFor !== null}
          gymClass={bookingFor}
          members={members}
          onClose={() => setBookingFor(null)}
          onSelect={(memberId) => void handleBook(memberId)}
        />

        <GymBookingActionModal
          visible={actionFor !== null}
          booking={actionFor}
          onClose={() => setActionFor(null)}
          onStatusChange={(status) => void handleStatus(status)}
        />
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  dayNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  dayLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'capitalize',
    flex: 1,
    minWidth: 160,
  },
  pressed: { opacity: 0.8 },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
  chipTextActive: { color: colors.black },
  classList: { gap: spacing.md },
  classBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        } as object)
      : null),
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  timeBadge: {
    minWidth: 54,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: withAlpha(colors.accent, '14'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '28'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBadgeText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  classHeaderCopy: { flex: 1, minWidth: 180, gap: 6 },
  classTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  capacityTrack: {
    flex: 1,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  capacityText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    minWidth: 42,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.warning, '16'),
    borderWidth: 1,
    borderColor: withAlpha(colors.warning, '30'),
  },
  metaChipText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
    fontSize: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 1,
  },
  emptyBookings: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyBookingsIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyBookingsTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBookingsText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  emptyBookingsAction: {
    marginTop: spacing.xs,
  },
  skeletonList: { gap: spacing.sm },
});
