import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeTrainingSlotCard } from '@/components/homeTraining/HomeTrainingSlotCard';
import { HomeTrainingSlotFormModal } from '@/components/homeTraining/HomeTrainingSlotFormModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useHomeTrainingSlots } from '@/hooks/useHomeTrainingSlots';
import { isSameCalendarDay } from '@/lib/appointmentSchedule';
import { HOME_TRAINING_SLOTS_MIGRATION_HINT } from '@/lib/homeTrainingSlotService';
import { slotsForDate } from '@/lib/homeTrainingSchedule';
import type { HomeTrainingSlotDraft } from '@/lib/homeTrainingSlotService';
import {
  formatMonthLabel,
  getMonthGrid,
  getWeekdayShortLabels,
  isDateInSameMonth,
  shiftMonth,
} from '@/lib/programSchedulePreview';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import type { HomeTrainingSlot, HomeTrainingSlotStatus } from '@/lib/types';

const DOT_COLORS: Record<HomeTrainingSlotStatus, string> = {
  open: colors.accent,
  booked: colors.accentBlue,
  cancelled: colors.textMuted,
};

export function HomeTrainingCalendarPanel() {
  const {
    slots,
    isLoading,
    error,
    persistent,
    isTrainer,
    viewerId,
    create,
    book,
    cancel,
    refresh,
  } = useHomeTrainingSlots();

  const [focusDate, setFocusDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [toCancel, setToCancel] = useState<HomeTrainingSlot | null>(null);

  const daySlots = useMemo(() => slotsForDate(slots, selectedDate), [slots, selectedDate]);
  const days = useMemo(() => getMonthGrid(focusDate), [focusDate]);
  const weeks = useMemo(
    () => Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7)),
    [days],
  );
  const today = useMemo(() => new Date(), []);

  const handleCreate = async (draft: HomeTrainingSlotDraft) => {
    setSaving(true);
    const result = await create(draft);
    setSaving(false);

    if (!result.slot) {
      setNotice(result.error ?? 'No se pudo publicar el hueco.');
      return;
    }

    setNotice(result.error ?? null);
    setSelectedDate(new Date(result.slot.startsAt));
    setFocusDate(new Date(result.slot.startsAt));
    setFormVisible(false);
  };

  const handleBook = async (slot: HomeTrainingSlot) => {
    setBusyId(slot.id);
    const { error: bookError } = await book(slot);
    setBusyId(null);
    setNotice(bookError ?? 'Reserva hecha. Te esperamos en esa franja.');
  };

  const handleCancel = async (slot: HomeTrainingSlot) => {
    setBusyId(slot.id);
    const { error: cancelError } = await cancel(slot);
    setBusyId(null);
    setToCancel(null);
    setNotice(cancelError ?? (isTrainer ? 'Hueco cancelado.' : 'Reserva cancelada.'));
  };

  return (
    <Card style={styles.panel}>
      <SectionHeader
        title="Calendario a domicilio"
        subtitle={
          isTrainer
            ? 'Publica huecos libres. Cuando un atleta se apunte, verás su nombre enlazado a la ficha.'
            : 'Elige un día con huecos disponibles y apúntate a la franja que te venga bien.'
        }
      />

      {!persistent ? (
        <View style={styles.banner}>
          <AppIcon name="info" size={14} color={colors.warning} />
          <Text style={styles.bannerText}>{HOME_TRAINING_SLOTS_MIGRATION_HINT}</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {isTrainer ? (
        <Button
          title="Publicar hueco"
          onPress={() => setFormVisible(true)}
          style={styles.actionButton}
        />
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : (
        <>
          <View style={styles.calendar}>
            <View style={styles.monthHeader}>
              <Pressable
                onPress={() => setFocusDate(shiftMonth(focusDate, -1))}
                hitSlop={8}
                style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
              >
                <AppIcon name="chevronLeft" size={18} color={colors.textSecondary} />
              </Pressable>
              <Text style={styles.monthLabel}>{formatMonthLabel(focusDate)}</Text>
              <Pressable
                onPress={() => setFocusDate(shiftMonth(focusDate, 1))}
                hitSlop={8}
                style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
              >
                <AppIcon name="chevronRight" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {getWeekdayShortLabels().map((label, index) => (
                <Text key={`${label}-${index}`} style={styles.weekday}>
                  {label}
                </Text>
              ))}
            </View>

            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day) => {
                  const dayItems = slotsForDate(slots, day).filter((slot) => slot.status !== 'cancelled');
                  const selected = isSameCalendarDay(day, selectedDate);
                  const outside = !isDateInSameMonth(day, focusDate);
                  const isToday = isSameCalendarDay(day, today);

                  return (
                    <Pressable
                      key={day.toISOString()}
                      onPress={() => setSelectedDate(day)}
                      style={[
                        styles.dayCell,
                        selected && styles.dayCellSelected,
                        outside && styles.dayCellOutside,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          selected && styles.dayTextSelected,
                          isToday && !selected && styles.dayTextToday,
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                      <View style={styles.dots}>
                        {dayItems.slice(0, 3).map((slot) => (
                          <View
                            key={slot.id}
                            style={[styles.dot, { backgroundColor: DOT_COLORS[slot.status] }]}
                          />
                        ))}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <Text style={styles.dayTitle}>{formatDayLabel(selectedDate)}</Text>

          {daySlots.length === 0 ? (
            <Text style={styles.emptyText}>
              {isTrainer
                ? 'No hay huecos este día. Publica uno con el botón de arriba.'
                : 'No hay huecos disponibles este día.'}
            </Text>
          ) : (
            <View style={styles.list}>
              {daySlots.map((slot) => (
                <HomeTrainingSlotCard
                  key={slot.id}
                  slot={slot}
                  viewerId={viewerId ?? ''}
                  isTrainer={isTrainer}
                  busy={busyId === slot.id}
                  showDay={false}
                  onBook={(item) => void handleBook(item)}
                  onCancel={(item) => setToCancel(item)}
                />
              ))}
            </View>
          )}
        </>
      )}

      <Button title="Actualizar calendario" variant="ghost" onPress={() => void refresh()} style={styles.refreshBtn} />

      <HomeTrainingSlotFormModal
        visible={formVisible}
        initialDate={selectedDate}
        saving={saving}
        onClose={() => setFormVisible(false)}
        onSubmit={(draft) => void handleCreate(draft)}
      />

      <ConfirmModal
        visible={toCancel != null}
        title={isTrainer ? 'Cancelar hueco' : 'Cancelar reserva'}
        message={
          isTrainer
            ? 'El hueco dejará de estar disponible para los atletas.'
            : 'Se cancelará tu reserva en este horario.'
        }
        confirmLabel="Cancelar"
        cancelLabel="Volver"
        destructive
        onConfirm={() => {
          if (toCancel) void handleCancel(toCancel);
        }}
        onCancel={() => setToCancel(null)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.warning}18`,
  },
  bannerText: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
    lineHeight: 18,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  notice: {
    ...typography.bodySmall,
    color: colors.accentBlue,
    marginBottom: spacing.sm,
  },
  actionButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  calendar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navBtn: {
    padding: spacing.xs,
  },
  monthLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textMuted,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: `${colors.accent}22`,
  },
  dayCellOutside: {
    opacity: 0.35,
  },
  dayText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  dayTextSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
  dayTextToday: {
    color: colors.accentBlue,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    minHeight: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  dayTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textTransform: 'capitalize',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  list: {
    gap: spacing.sm,
  },
  refreshBtn: {
    marginTop: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
});
