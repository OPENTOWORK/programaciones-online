import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  GYM_MEMBER_KIND_LABELS,
  GYM_MEMBER_STATUS_LABELS,
  isGymPotentialMember,
  type GymMember,
  type GymMemberStatus,
} from '@/lib/gymTypes';
import type { GymMemberInput } from '@/lib/gymService';
import type { GymMemberSignupSource } from '@/lib/gymTypes';

const MEMBER_STATUSES: Exclude<GymMemberStatus, 'lead'>[] = ['active', 'inactive', 'blocked'];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: GymMemberStatus;
  notes: string;
  fromWellhub: boolean;
}

function toForm(
  member?: GymMember | null,
  defaultStatus: GymMemberStatus = 'active',
  defaultSignupSource?: GymMemberSignupSource,
): FormState {
  return {
    firstName: member?.firstName ?? '',
    lastName: member?.lastName ?? '',
    email: member?.email ?? '',
    phone: member?.phone ?? '',
    status: member?.status ?? defaultStatus,
    notes: member?.notes ?? '',
    fromWellhub: member?.signupSource === 'wellhub' || defaultSignupSource === 'wellhub',
  };
}

export function GymMemberFormModal({
  visible,
  member,
  defaultStatus = 'active',
  defaultSignupSource,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  member?: GymMember | null;
  defaultStatus?: GymMemberStatus;
  defaultSignupSource?: GymMemberSignupSource;
  onCancel: () => void;
  onSubmit: (input: GymMemberInput) => Promise<{ error?: string }>;
}) {
  const [form, setForm] = useState<FormState>(() => toForm(member, defaultStatus, defaultSignupSource));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setForm(toForm(member, defaultStatus, defaultSignupSource));
      setError(null);
    }
  }, [defaultSignupSource, defaultStatus, member, visible]);

  const patch = (changes: Partial<FormState>) => setForm((current) => ({ ...current, ...changes }));

  const handleSubmit = async () => {
    if (!form.firstName.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      status: form.status,
      notes: form.notes,
      signupSource: form.fromWellhub ? 'wellhub' : 'manual',
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
          <Text style={styles.title}>
            {member
              ? isGymPotentialMember(form.status)
                ? 'Editar miembro potencial'
                : 'Editar miembro'
              : isGymPotentialMember(form.status)
                ? 'Nuevo miembro potencial'
                : 'Nuevo miembro'}
          </Text>
          <Text style={styles.subtitle}>
            {isGymPotentialMember(form.status)
              ? 'Posible cliente. Cuando se apunte, conviértelo en miembro.'
              : 'Los datos se guardan en tu gimnasio. Si pones el email de su cuenta de la app, podrá reservar clases desde Inicio.'}
          </Text>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <Input
              label="Nombre"
              value={form.firstName}
              onChangeText={(value) => patch({ firstName: value })}
              placeholder="Ej. Ana"
              autoCapitalize="words"
            />
            <Input
              label="Apellidos"
              value={form.lastName}
              onChangeText={(value) => patch({ lastName: value })}
              placeholder="Ej. López"
              autoCapitalize="words"
            />
            <Input
              label="Email"
              value={form.email}
              onChangeText={(value) => patch({ email: value })}
              placeholder="cliente@email.com"
              autoCapitalize="none"
            />
            <Input
              label="Teléfono"
              value={form.phone}
              onChangeText={(value) => patch({ phone: value })}
              placeholder="600 000 000"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.chips}>
              <Pressable
                onPress={() =>
                  patch({ status: isGymPotentialMember(form.status) ? 'active' : form.status })
                }
                accessibilityRole="button"
                accessibilityState={{ selected: !isGymPotentialMember(form.status) }}
                style={({ pressed }) => [
                  styles.chip,
                  !isGymPotentialMember(form.status) && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    !isGymPotentialMember(form.status) && styles.chipTextActive,
                  ]}
                >
                  {GYM_MEMBER_KIND_LABELS.member}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => patch({ status: 'lead' })}
                accessibilityRole="button"
                accessibilityState={{ selected: isGymPotentialMember(form.status) }}
                style={({ pressed }) => [
                  styles.chip,
                  isGymPotentialMember(form.status) && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isGymPotentialMember(form.status) && styles.chipTextActive,
                  ]}
                >
                  {GYM_MEMBER_KIND_LABELS.potential}
                </Text>
              </Pressable>
            </View>

            {isGymPotentialMember(form.status) ? null : (
              <>
                <Pressable
                  onPress={() => patch({ fromWellhub: !form.fromWellhub })}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: form.fromWellhub }}
                  style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
                >
                  <Text style={styles.toggleLabel}>Se apuntó desde Wellhub</Text>
                  <View style={[styles.toggleBox, form.fromWellhub && styles.toggleBoxActive]}>
                    {form.fromWellhub ? <Text style={styles.toggleMark}>✓</Text> : null}
                  </View>
                </Pressable>

                <Text style={styles.label}>Estado</Text>
                <View style={styles.chips}>
                  {MEMBER_STATUSES.map((status) => {
                    const selected = form.status === status;
                    return (
                      <Pressable
                        key={status}
                        onPress={() => patch({ status })}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        style={({ pressed }) => [
                          styles.chip,
                          selected && styles.chipActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                          {GYM_MEMBER_STATUS_LABELS[status]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <Input
              label="Notas internas"
              value={form.notes}
              onChangeText={(value) => patch({ notes: value })}
              placeholder="Lesiones, objetivos, observaciones..."
              multiline
              style={styles.textarea}
            />
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onCancel}
              style={styles.actionButton}
            />
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
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  form: {
    flexGrow: 0,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
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
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.black,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  toggleLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBoxActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  toggleMark: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '800',
  },
  textarea: {
    minHeight: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
