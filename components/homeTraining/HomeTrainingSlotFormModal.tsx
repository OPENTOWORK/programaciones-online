import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  HOME_TRAINING_DURATION_OPTIONS,
  buildTimeSlots,
  combineDateAndTime,
  formatTime,
} from '@/lib/homeTrainingSchedule';
import type { HomeTrainingSlotDraft } from '@/lib/homeTrainingSlotService';
import { formatMonthLabel, getMonthGrid, getWeekdayShortLabels, isDateInSameMonth, shiftMonth } from '@/lib/programSchedulePreview';
import { isSameCalendarDay } from '@/lib/appointmentSchedule';

const DEFAULT_TITLE = 'Entrenamiento a domicilio';
const TIME_SLOTS = buildTimeSlots();

interface HomeTrainingSlotFormModalProps {
  visible: boolean;
  initialDate: Date;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (draft: HomeTrainingSlotDraft) => void;
}

function nextSlotFrom(date: Date) {
  const minutes = date.getMinutes();
  const rounded = new Date(date);
  rounded.setMinutes(minutes < 30 ? 30 : 60, 0, 0);
  const value = formatTime(rounded);
  return TIME_SLOTS.includes(value) ? value : '10:00';
}

export function HomeTrainingSlotFormModal({
  visible,
  initialDate,
  saving = false,
  onClose,
  onSubmit,
}: HomeTrainingSlotFormModalProps) {
  const [date, setDate] = useState(initialDate);
  const [focusDate, setFocusDate] = useState(initialDate);
  const [time, setTime] = useState(() => nextSlotFrom(new Date()));
  const [duration, setDuration] = useState(60);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const initialDateRef = useRef(initialDate);
  initialDateRef.current = initialDate;

  useEffect(() => {
    if (!visible) return;
    setDate(initialDateRef.current);
    setFocusDate(initialDateRef.current);
    setTime(nextSlotFrom(new Date()));
    setDuration(60);
    setTitle(DEFAULT_TITLE);
    setNotes('');
    setError(null);
  }, [visible]);

  const handleSubmit = () => {
    const startsAt = combineDateAndTime(date, time);
    if (!startsAt) {
      setError('Elige una hora válida.');
      return;
    }
    if (startsAt.getTime() < Date.now()) {
      setError('El hueco debe ser en el futuro.');
      return;
    }
    if (!title.trim()) {
      setError('Pon un título al hueco.');
      return;
    }

    onSubmit({
      title: title.trim(),
      notes: notes.trim() || undefined,
      startsAt: startsAt.toISOString(),
      durationMinutes: duration,
    });
  };

  const days = getMonthGrid(focusDate);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Publicar hueco</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Cerrar">
              <AppIcon name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Input label="Título" value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Día</Text>
            <View style={styles.monthHeader}>
              <Pressable onPress={() => setFocusDate(shiftMonth(focusDate, -1))} hitSlop={8}>
                <AppIcon name="chevronLeft" size={18} color={colors.textSecondary} />
              </Pressable>
              <Text style={styles.monthLabel}>{formatMonthLabel(focusDate)}</Text>
              <Pressable onPress={() => setFocusDate(shiftMonth(focusDate, 1))} hitSlop={8}>
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
                  const selected = isSameCalendarDay(day, date);
                  const outside = !isDateInSameMonth(day, focusDate);
                  return (
                    <Pressable
                      key={day.toISOString()}
                      onPress={() => {
                        setDate(day);
                        setFocusDate(day);
                      }}
                      style={[
                        styles.dayCell,
                        selected && styles.dayCellSelected,
                        outside && styles.dayCellOutside,
                      ]}
                    >
                      <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day.getDate()}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            <Text style={styles.label}>Hora</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {TIME_SLOTS.map((slot) => (
                <Pressable
                  key={slot}
                  onPress={() => setTime(slot)}
                  style={[styles.chip, time === slot && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, time === slot && styles.chipTextSelected]}>{slot}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Duración</Text>
            <View style={styles.chips}>
              {HOME_TRAINING_DURATION_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setDuration(option)}
                  style={[styles.chip, duration === option && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, duration === option && styles.chipTextSelected]}>
                    {option} min
                  </Text>
                </Pressable>
              ))}
            </View>

            <Input
              label="Notas (opcional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Zona, material, indicaciones…"
              multiline
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title="Publicar hueco" onPress={handleSubmit} loading={saving} style={styles.submit} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  sheet: {
    maxHeight: '92%',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
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
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: colors.accent,
  },
  dayCellOutside: {
    opacity: 0.35,
  },
  dayText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  dayTextSelected: {
    color: colors.black,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '22'),
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  submit: {
    marginTop: spacing.sm,
  },
});
