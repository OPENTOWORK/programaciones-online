import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  APPOINTMENT_DURATION_OPTIONS,
  buildTimeSlots,
  combineDateAndTime,
  formatTime,
} from '@/lib/appointmentSchedule';
import type { AppointmentDraft } from '@/lib/appointmentService';
import { generateMeetingRoomUrl, meetingProviderLabel, normalizeMeetingUrl } from '@/lib/meetingLinks';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import type { AthleteSummary } from '@/lib/types';

const DEFAULT_TITLE = 'Videollamada de seguimiento';
const TIME_SLOTS = buildTimeSlots();

interface AppointmentFormModalProps {
  visible: boolean;
  isTrainer: boolean;
  /** Solo para el entrenador: a quién cita. El atleta se cita a sí mismo. */
  athletes: readonly AthleteSummary[];
  initialDate: Date;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (draft: AppointmentDraft) => void;
}

function nextSlotFrom(date: Date) {
  const minutes = date.getMinutes();
  const rounded = new Date(date);
  rounded.setMinutes(minutes < 30 ? 30 : 60, 0, 0);
  const value = formatTime(rounded);
  return TIME_SLOTS.includes(value) ? value : '10:00';
}

export function AppointmentFormModal({
  visible,
  isTrainer,
  athletes,
  initialDate,
  saving = false,
  onClose,
  onSubmit,
}: AppointmentFormModalProps) {
  const [athleteId, setAthleteId] = useState<string | null>(null);
  const [athleteQuery, setAthleteQuery] = useState('');
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(() => nextSlotFrom(new Date()));
  const [duration, setDuration] = useState<number>(30);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [notes, setNotes] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [timeOpen, setTimeOpen] = useState(false);

  const athletesRef = useRef(athletes);
  athletesRef.current = athletes;
  const initialDateRef = useRef(initialDate);
  initialDateRef.current = initialDate;

  // Solo al abrir: si dependiera de `athletes` o de `initialDate`, un refresco de fondo borraría lo escrito.
  useEffect(() => {
    if (!visible) return;

    setAthleteId(athletesRef.current.length === 1 ? athletesRef.current[0].id : null);
    setAthleteQuery('');
    setDate(initialDateRef.current);
    setTime(nextSlotFrom(new Date()));
    setDuration(30);
    setTitle(DEFAULT_TITLE);
    setNotes('');
    setMeetingUrl('');
    setError(null);
    setTimeOpen(false);
  }, [visible]);

  const providerLabel = useMemo(() => {
    const { url } = normalizeMeetingUrl(meetingUrl);
    return url ? meetingProviderLabel(url) : null;
  }, [meetingUrl]);

  const visibleAthletes = useMemo(() => {
    const query = athleteQuery.trim().toLowerCase();
    if (!query) return athletes;

    return athletes.filter(
      (athlete) =>
        athlete.name.toLowerCase().includes(query) || athlete.email.toLowerCase().includes(query),
    );
  }, [athletes, athleteQuery]);

  const handleSubmit = () => {
    if (isTrainer && !athleteId) {
      setError('Elige a qué atleta citas.');
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Ponle un motivo a la cita.');
      return;
    }

    const startsAt = combineDateAndTime(date, time);
    if (!startsAt) {
      setError('La hora no es válida.');
      return;
    }

    if (startsAt.getTime() < Date.now()) {
      setError('Esa fecha y hora ya han pasado.');
      return;
    }

    const { url, error: urlError } = normalizeMeetingUrl(meetingUrl);
    if (urlError) {
      setError(urlError);
      return;
    }

    setError(null);
    onSubmit({
      athleteId: athleteId ?? '',
      title: trimmedTitle,
      notes: notes.trim() || undefined,
      startsAt: startsAt.toISOString(),
      durationMinutes: duration,
      meetingUrl: url,
    });
  };

  const shiftDate = (days: number) => {
    setDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + days);
      return next;
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{isTrainer ? 'Proponer cita' : 'Pedir cita'}</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Cerrar">
              <AppIcon name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {isTrainer ? (
              <View style={styles.field}>
                <Text style={styles.label}>Atleta</Text>
                {athletes.length === 0 ? (
                  <Text style={styles.hint}>No tienes atletas todavía.</Text>
                ) : (
                  <>
                    {athletes.length > 6 ? (
                      <Input
                        value={athleteQuery}
                        onChangeText={setAthleteQuery}
                        placeholder="Buscar atleta"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    ) : null}
                    <View style={styles.chipWrap}>
                      {visibleAthletes.map((athlete) => (
                        <Pressable
                          key={athlete.id}
                          onPress={() => setAthleteId(athlete.id)}
                          style={({ pressed }) => [
                            styles.chip,
                            athleteId === athlete.id && styles.chipActive,
                            pressed && styles.chipPressed,
                          ]}
                        >
                          <Text
                            style={[styles.chipText, athleteId === athlete.id && styles.chipTextActive]}
                            numberOfLines={1}
                          >
                            {athlete.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    {visibleAthletes.length === 0 ? (
                      <Text style={styles.hint}>Ningún atleta coincide con la búsqueda.</Text>
                    ) : null}
                  </>
                )}
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Día</Text>
              <View style={styles.dateRow}>
                <Pressable
                  onPress={() => shiftDate(-1)}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel="Día anterior"
                  style={({ pressed }) => [styles.dateNav, pressed && styles.dateNavPressed]}
                >
                  <AppIcon name="chevronLeft" size={16} color={colors.textSecondary} />
                </Pressable>
                <Text style={styles.dateLabel}>{formatDayLabel(date)}</Text>
                <Pressable
                  onPress={() => shiftDate(1)}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel="Día siguiente"
                  style={({ pressed }) => [styles.dateNav, pressed && styles.dateNavPressed]}
                >
                  <AppIcon name="chevronRight" size={16} color={colors.textSecondary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Hora</Text>
              <Pressable
                onPress={() => setTimeOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityLabel={`Hora ${time}`}
                accessibilityState={{ expanded: timeOpen }}
                style={({ pressed }) => [styles.selectTrigger, pressed && styles.dateNavPressed]}
              >
                <Text style={styles.selectValue}>{time}</Text>
                <AppIcon
                  name="chevronDown"
                  size={16}
                  color={colors.textSecondary}
                  style={timeOpen ? styles.selectChevronOpen : undefined}
                />
              </Pressable>
              {timeOpen ? (
                <View style={styles.selectMenu}>
                  <ScrollView
                    nestedScrollEnabled
                    style={styles.selectMenuScroll}
                    keyboardShouldPersistTaps="handled"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <Pressable
                        key={slot}
                        onPress={() => {
                          setTime(slot);
                          setTimeOpen(false);
                        }}
                        style={({ pressed }) => [
                          styles.selectOption,
                          time === slot && styles.selectOptionActive,
                          pressed && styles.chipPressed,
                        ]}
                      >
                        <Text style={[styles.selectOptionText, time === slot && styles.selectOptionTextActive]}>
                          {slot}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Duración</Text>
              <View style={styles.chipWrap}>
                {APPOINTMENT_DURATION_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setDuration(option)}
                    style={({ pressed }) => [
                      styles.chip,
                      duration === option && styles.chipActive,
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text style={[styles.chipText, duration === option && styles.chipTextActive]}>
                      {option} min
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Input label="Motivo" value={title} onChangeText={setTitle} placeholder={DEFAULT_TITLE} />

            <View style={styles.field}>
              <Text style={styles.label}>Enlace de la videollamada</Text>
              <Input
                value={meetingUrl}
                onChangeText={setMeetingUrl}
                placeholder="Pega tu Meet o Zoom, o genera una sala"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <View style={styles.linkActions}>
                <Pressable
                  onPress={() => setMeetingUrl(generateMeetingRoomUrl())}
                  style={({ pressed }) => [styles.linkAction, pressed && styles.chipPressed]}
                >
                  <AppIcon name="video" size={14} color={colors.accent} />
                  <Text style={styles.linkActionText}>Generar sala de vídeo</Text>
                </Pressable>
                {providerLabel ? <Text style={styles.hint}>{providerLabel}</Text> : null}
              </View>
              <Text style={styles.hint}>
                La sala generada se abre en el navegador y no necesita cuenta. Puedes dejarlo vacío y añadirlo
                después.
              </Text>
            </View>

            <Input
              label="Notas (opcional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Qué queréis repasar en la llamada"
              multiline
              style={styles.notesInput}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Cancelar" variant="secondary" onPress={onClose} style={styles.footerButton} />
            <Button
              title={isTrainer ? 'Proponer' : 'Pedir cita'}
              onPress={handleSubmit}
              loading={saving}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.text,
  },
  body: {
    // Sin crecer para que la hoja se ajuste al contenido, pero encogiendo para no tapar el pie.
    flexGrow: 0,
    flexShrink: 1,
  },
  bodyContent: {
    padding: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dateNav: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavPressed: {
    backgroundColor: colors.surface,
  },
  dateLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  selectValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  selectChevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  selectMenu: {
    marginTop: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  selectMenuScroll: {
    maxHeight: 220,
  },
  selectOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectOptionActive: {
    backgroundColor: withAlpha(colors.accent, '1A'),
  },
  selectOptionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  selectOptionTextActive: {
    color: colors.accent,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '1A'),
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.accent,
  },
  linkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  linkAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  linkActionText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
  },
});
