import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { GymClassInput } from '@/lib/gymService';
import type { GymClass, GymClassType, GymUser } from '@/lib/gymTypes';

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toTimeInput(date: Date) {
  return date.toTimeString().slice(0, 5);
}

function combine(dateValue: string, timeValue: string) {
  return new Date(`${dateValue}T${timeValue || '00:00'}:00`);
}

interface FormState {
  classTypeId?: string;
  coachUserId?: string;
  date: string;
  time: string;
  durationMinutes: string;
  capacity: string;
  location: string;
}

export function GymClassFormModal({
  visible,
  gymClass,
  classTypes,
  staff,
  defaultDate,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  gymClass?: GymClass | null;
  classTypes: readonly GymClassType[];
  staff: readonly GymUser[];
  defaultDate?: Date;
  onCancel: () => void;
  onSubmit: (input: GymClassInput & { id?: string }) => Promise<{ error?: string }>;
}) {
  const [form, setForm] = useState<FormState>(() => buildForm(gymClass, classTypes, defaultDate));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setForm(buildForm(gymClass, classTypes, defaultDate));
      setError(null);
    }
  }, [classTypes, defaultDate, gymClass, visible]);

  const patch = (changes: Partial<FormState>) => setForm((current) => ({ ...current, ...changes }));

  const handleSubmit = async () => {
    const duration = Number(form.durationMinutes);
    const capacity = Number(form.capacity);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      setError('Introduce la fecha como aaaa-mm-dd.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(form.time)) {
      setError('Introduce la hora como hh:mm.');
      return;
    }
    if (!Number.isFinite(duration) || duration < 5) {
      setError('La duración debe ser de al menos 5 minutos.');
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      setError('El aforo debe ser de al menos 1 plaza.');
      return;
    }

    const startAt = combine(form.date, form.time);
    if (Number.isNaN(startAt.getTime())) {
      setError('Esa fecha y hora no son válidas.');
      return;
    }

    const endAt = new Date(startAt.getTime() + duration * 60_000);

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      id: gymClass?.id,
      classTypeId: form.classTypeId,
      coachUserId: form.coachUserId,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      capacity,
      location: form.location,
    });
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.card}>
          <Text style={styles.title}>{gymClass ? 'Editar clase' : 'Nueva clase'}</Text>
          <Text style={styles.subtitle}>
            El aforo se respeta al reservar: si se llena, las nuevas reservas van a lista de espera.
          </Text>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {classTypes.length > 0 ? (
              <>
                <Text style={styles.label}>Tipo de clase</Text>
                <View style={styles.chips}>
                  {classTypes
                    .filter((type) => type.active)
                    .map((type) => {
                      const selected = form.classTypeId === type.id;
                      return (
                        <Pressable
                          key={type.id}
                          onPress={() =>
                            patch({
                              classTypeId: type.id,
                              durationMinutes: String(type.durationMinutes),
                              capacity: String(type.capacity),
                            })
                          }
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          style={({ pressed }) => [
                            styles.chip,
                            selected && styles.chipActive,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                            {type.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                </View>
              </>
            ) : (
              <Text style={styles.hint}>
                Crea primero un tipo de clase en «Clases y tarifas» para reutilizar duración y aforo.
              </Text>
            )}

            <Input
              label="Fecha (aaaa-mm-dd)"
              value={form.date}
              onChangeText={(value) => patch({ date: value })}
              placeholder="2026-09-15"
              autoCapitalize="none"
            />
            <Input
              label="Hora (hh:mm)"
              value={form.time}
              onChangeText={(value) => patch({ time: value })}
              placeholder="18:00"
              autoCapitalize="none"
            />
            <Input
              label="Duración (minutos)"
              value={form.durationMinutes}
              onChangeText={(value) => patch({ durationMinutes: value.replace(/[^\d]/g, '') })}
              keyboardType="number-pad"
            />
            <Input
              label="Aforo"
              value={form.capacity}
              onChangeText={(value) => patch({ capacity: value.replace(/[^\d]/g, '') })}
              keyboardType="number-pad"
            />
            <Input
              label="Sala o ubicación"
              value={form.location}
              onChangeText={(value) => patch({ location: value })}
              placeholder="Sala 1"
            />

            {staff.length > 0 ? (
              <>
                <Text style={styles.label}>Entrenador</Text>
                <View style={styles.chips}>
                  <Pressable
                    onPress={() => patch({ coachUserId: undefined })}
                    accessibilityRole="button"
                    accessibilityState={{ selected: !form.coachUserId }}
                    style={({ pressed }) => [
                      styles.chip,
                      !form.coachUserId && styles.chipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.chipText, !form.coachUserId && styles.chipTextActive]}>
                      Sin asignar
                    </Text>
                  </Pressable>
                  {staff.map((member) => {
                    const selected = form.coachUserId === member.userId;
                    return (
                      <Pressable
                        key={member.id}
                        onPress={() => patch({ coachUserId: member.userId })}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        style={({ pressed }) => [
                          styles.chip,
                          selected && styles.chipActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                          {member.name ?? 'Entrenador'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.actionButton} />
            <Button
              title="Guardar"
              onPress={() => void handleSubmit()}
              loading={saving}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function buildForm(
  gymClass: GymClass | null | undefined,
  classTypes: readonly GymClassType[],
  defaultDate?: Date,
): FormState {
  if (gymClass) {
    const start = new Date(gymClass.startAt);
    const end = new Date(gymClass.endAt);
    return {
      classTypeId: gymClass.classTypeId,
      coachUserId: gymClass.coachUserId,
      date: toDateInput(start),
      time: toTimeInput(start),
      durationMinutes: String(Math.round((end.getTime() - start.getTime()) / 60_000)),
      capacity: String(gymClass.capacity),
      location: gymClass.location ?? '',
    };
  }

  const firstType = classTypes.find((type) => type.active);
  const base = defaultDate ?? new Date();

  return {
    classTypeId: firstType?.id,
    coachUserId: undefined,
    date: toDateInput(base),
    time: '18:00',
    durationMinutes: String(firstType?.durationMinutes ?? 60),
    capacity: String(firstType?.capacity ?? 12),
    location: '',
  };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  title: { ...typography.h3, color: colors.text },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  form: { flexGrow: 0 },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.black },
  pressed: { opacity: 0.85 },
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionButton: { flex: 1 },
});
