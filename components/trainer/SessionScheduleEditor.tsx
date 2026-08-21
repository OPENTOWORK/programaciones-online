import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  formatScheduleSummary,
  RECURRENCE_OPTIONS,
  WEEKDAY_OPTIONS,
  toWeekdayIndex,
  type SessionRecurrence,
  type SessionSchedule,
  type WeekdayIndex,
} from '@/lib/sessionSchedule';

interface SessionScheduleEditorProps {
  schedule: SessionSchedule;
  onChange: (schedule: SessionSchedule) => void;
}

export function SessionScheduleEditor({ schedule, onChange }: SessionScheduleEditorProps) {
  const toggleWeekday = (weekday: WeekdayIndex) => {
    const hasDay = schedule.weekdays.includes(weekday);
    const weekdays = hasDay
      ? schedule.weekdays.filter((day) => day !== weekday)
      : [...schedule.weekdays, weekday].sort();
    onChange({ ...schedule, weekdays });
  };

  const setRecurrence = (recurrence: SessionRecurrence) => {
    onChange({ ...schedule, recurrence });
  };

  const setStartDate = (startDate: string) => {
    const trimmed = startDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      onChange({ ...schedule, startDate: trimmed });
      return;
    }
    const parsed = new Date(`${trimmed}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      onChange({ ...schedule, startDate: trimmed });
      return;
    }
    onChange({
      ...schedule,
      startDate: trimmed,
      weekdays: [toWeekdayIndex(parsed)],
    });
  };

  const activeRecurrence = RECURRENCE_OPTIONS.find((entry) => entry.value === schedule.recurrence);

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Días de la sesión</Text>
      <Text style={styles.hint}>Elige en qué días aparecerá esta sesión en el calendario del atleta.</Text>

      <View style={styles.weekdayRow}>
        {WEEKDAY_OPTIONS.map((entry) => {
          const active = schedule.weekdays.includes(entry.index);
          return (
            <Pressable
              key={entry.index}
              onPress={() => toggleWeekday(entry.index)}
              style={[styles.weekdayBtn, active && styles.weekdayBtnActive]}
              accessibilityLabel={entry.label}
            >
              <Text style={[styles.weekdayBtnText, active && styles.weekdayBtnTextActive]}>{entry.short}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>Repetición</Text>
      <View style={styles.recurrenceRow}>
        {RECURRENCE_OPTIONS.map((entry) => {
          const active = schedule.recurrence === entry.value;
          return (
            <Pressable
              key={entry.value}
              onPress={() => setRecurrence(entry.value)}
              style={[styles.recurrenceBtn, active && styles.recurrenceBtnActive]}
            >
              <Text style={[styles.recurrenceBtnText, active && styles.recurrenceBtnTextActive]}>
                {entry.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {activeRecurrence ? <Text style={styles.recurrenceHint}>{activeRecurrence.hint}</Text> : null}

      {schedule.recurrence !== 'weekly' ? (
        <Input
          label="Fecha de inicio"
          value={schedule.startDate ?? ''}
          onChangeText={setStartDate}
          placeholder="AAAA-MM-DD"
          style={styles.dateInput}
        />
      ) : null}

      <Text style={styles.summary}>{formatScheduleSummary(schedule)}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  weekdayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  weekdayBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  weekdayBtnActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}22`,
  },
  weekdayBtnText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '700',
  },
  weekdayBtnTextActive: {
    color: colors.accent,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  recurrenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  recurrenceBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  recurrenceBtnActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}18`,
  },
  recurrenceBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  recurrenceBtnTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  recurrenceHint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  dateInput: {
    minHeight: 46,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  summary: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
