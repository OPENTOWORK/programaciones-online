import { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { GymTaskInput } from '@/lib/gymTaskService';
import {
  GYM_TASK_PRIORITY_LABELS,
  GYM_TASK_RECURRENCE_LABELS,
  GYM_USER_ROLE_LABELS,
  gymUserDisplayName,
  type GymTask,
  type GymTaskPriority,
  type GymTaskRecurrence,
  type GymUser,
} from '@/lib/gymTypes';

function dueInput(task?: GymTask | null) {
  if (!task?.dueAt) return '';
  const date = new Date(task.dueAt);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function todayKey() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function AssigneeChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipActive, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function GymTaskFormModal({
  visible,
  task,
  staff,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  task?: GymTask | null;
  staff: readonly GymUser[];
  onCancel: () => void;
  onSubmit: (input: GymTaskInput) => Promise<{ error?: string }>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<GymTaskPriority>('medium');
  const [recurrence, setRecurrence] = useState<GymTaskRecurrence>('once');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const coaches = useMemo(() => staff.filter((person) => person.role === 'coach'), [staff]);
  const team = useMemo(() => staff.filter((person) => person.role !== 'coach'), [staff]);

  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setAssignedTo(task?.assignedTo);
    setDueDate(dueInput(task) || todayKey());
    setPriority(task?.priority ?? 'medium');
    setRecurrence(task?.recurrence ?? 'once');
    setError(null);
  }, [task, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{task ? 'Editar tarea' : 'Nueva tarea'}</Text>
            <Text style={styles.hint}>
              Asigna un responsable, la frecuencia y una fecha para que no se quede en el aire.
            </Text>

            <Input
              label="Título"
              value={title}
              onChangeText={setTitle}
              placeholder="Reponer toallas, llamar a un socio…"
            />
            <Input
              label="Detalle (opcional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Qué hay que hacer exactamente"
              multiline
            />
            <Input
              label="Vencimiento (AAAA-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="2026-09-08"
            />

            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.chips}>
              {(Object.keys(GYM_TASK_PRIORITY_LABELS) as GymTaskPriority[]).map((id) => (
                <AssigneeChip
                  key={id}
                  label={GYM_TASK_PRIORITY_LABELS[id]}
                  selected={priority === id}
                  onPress={() => setPriority(id)}
                />
              ))}
            </View>

            <Text style={styles.label}>Frecuencia</Text>
            <View style={styles.chips}>
              {(Object.keys(GYM_TASK_RECURRENCE_LABELS) as GymTaskRecurrence[]).map((id) => (
                <AssigneeChip
                  key={id}
                  label={GYM_TASK_RECURRENCE_LABELS[id]}
                  selected={recurrence === id}
                  onPress={() => setRecurrence(id)}
                />
              ))}
            </View>
            {recurrence !== 'once' ? (
              <Text style={styles.recurrenceHint}>
                Al marcarla como hecha, volverá a pendiente con la siguiente fecha.
              </Text>
            ) : null}

            <Text style={styles.label}>Responsable</Text>
            <View style={styles.chips}>
              <AssigneeChip
                label="Sin asignar"
                selected={!assignedTo}
                onPress={() => setAssignedTo(undefined)}
              />
            </View>

            {team.length > 0 ? (
              <>
                <Text style={styles.subLabel}>Equipo del gimnasio</Text>
                <View style={styles.chips}>
                  {team.map((member) => {
                    const name = gymUserDisplayName(member);
                    const selected = assignedTo === member.userId;
                    return (
                      <AssigneeChip
                        key={member.userId}
                        label={`${name} · ${GYM_USER_ROLE_LABELS[member.role]}`}
                        selected={selected}
                        onPress={() => setAssignedTo(member.userId)}
                      />
                    );
                  })}
                </View>
              </>
            ) : null}

            {coaches.length > 0 ? (
              <>
                <Text style={styles.subLabel}>Entrenadores</Text>
                <View style={styles.chips}>
                  {coaches.map((member) => {
                    const name = gymUserDisplayName(member);
                    const selected = assignedTo === member.userId;
                    return (
                      <AssigneeChip
                        key={member.userId}
                        label={name}
                        selected={selected}
                        onPress={() => setAssignedTo(member.userId)}
                      />
                    );
                  })}
                </View>
              </>
            ) : (
              <Text style={styles.emptyAssignees}>
                Invita entrenadores desde Miembros → Entrenadores para asignarles tareas.
              </Text>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.action} />
            <Button
              title={task ? 'Guardar' : 'Crear'}
              loading={saving}
              onPress={async () => {
                setSaving(true);
                const result = await onSubmit({
                  title,
                  description,
                  assignedTo,
                  dueDate: dueDate.trim() || undefined,
                  priority,
                  recurrence,
                  status: task?.status,
                });
                setSaving(false);
                if (result.error) setError(result.error);
              }}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '92%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 6,
  },
  subLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '100%',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.accent,
  },
  recurrenceHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  emptyAssignees: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.md,
  },
  action: {
    flex: 1,
  },
  pressed: { opacity: 0.8 },
});
