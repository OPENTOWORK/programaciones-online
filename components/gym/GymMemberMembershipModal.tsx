import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { GymMembershipDateFields } from '@/components/gym/GymMembershipDateFields';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { defaultMembershipEndDate } from '@/lib/gymMemberBalance';
import type { GymMemberMembershipUpdateInput } from '@/lib/gymService';
import {
  GYM_MEMBERSHIP_STATUS_LABELS,
  type GymMemberMembership,
  type GymMembershipPlan,
  type GymMembershipStatus,
} from '@/lib/gymTypes';

const MEMBERSHIP_STATUSES: GymMembershipStatus[] = ['active', 'paused', 'expired', 'cancelled'];

function toForm(membership: GymMemberMembership) {
  return {
    planId: membership.planId ?? '',
    startsAt: membership.startsAt,
    endsAt: membership.endsAt ?? '',
    status: membership.status,
  };
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function GymMemberMembershipModal({
  visible,
  membership,
  plans,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  membership: GymMemberMembership | null;
  plans: GymMembershipPlan[];
  onCancel: () => void;
  onSubmit: (input: GymMemberMembershipUpdateInput) => Promise<{ error?: string }>;
}) {
  const [form, setForm] = useState(() => (membership ? toForm(membership) : null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && membership) {
      setForm(toForm(membership));
      setError(null);
    }
  }, [membership, visible]);

  if (!membership || !form) return null;

  const patch = (changes: Partial<typeof form>) => setForm((current) => ({ ...current, ...changes }));

  const handleSubmit = async () => {
    if (!form.planId) {
      setError('Selecciona una tarifa.');
      return;
    }
    if (!isValidDate(form.startsAt)) {
      setError('La fecha de inicio debe tener formato AAAA-MM-DD.');
      return;
    }
    if (form.endsAt.trim() && !isValidDate(form.endsAt.trim())) {
      setError('La fecha de fin debe tener formato AAAA-MM-DD.');
      return;
    }
    if (form.endsAt.trim() && form.endsAt.trim() < form.startsAt) {
      setError('La fecha de fin no puede ser anterior al inicio.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      planId: form.planId,
      startsAt: form.startsAt,
      endsAt: form.endsAt.trim() || undefined,
      status: form.status,
    });
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onCancel();
  };

  const activePlans = plans.filter((plan) => plan.active);
  const selectedPlan = activePlans.find((plan) => plan.id === form.planId);

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
          <Text style={styles.title}>Editar tarifa</Text>
          <Text style={styles.subtitle}>
            Ajusta la tarifa asignada, las fechas o el estado de la membresía.
          </Text>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Tarifa</Text>
            <View style={styles.chips}>
              {activePlans.map((plan) => {
                const selected = form.planId === plan.id;
                return (
                  <Pressable
                    key={plan.id}
                    onPress={() => {
                      patch({
                        planId: plan.id,
                        endsAt: defaultMembershipEndDate(
                          form.startsAt,
                          plan.billingPeriod,
                          plan.validityDays,
                        ),
                      });
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.chipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{plan.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            <GymMembershipDateFields
              startsAt={form.startsAt}
              endsAt={form.endsAt}
              onStartsAtChange={(value) => {
                const nextEndsAt = selectedPlan
                  ? defaultMembershipEndDate(
                      value,
                      selectedPlan.billingPeriod,
                      selectedPlan.validityDays,
                    )
                  : form.endsAt;
                patch({ startsAt: value, endsAt: nextEndsAt });
              }}
              onEndsAtChange={(value) => patch({ endsAt: value })}
            />

            <Text style={styles.label}>Estado</Text>
            <View style={styles.chips}>
              {MEMBERSHIP_STATUSES.map((status) => {
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
                      {GYM_MEMBERSHIP_STATUS_LABELS[status]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} disabled={saving} />
            <Button title="Guardar cambios" onPress={() => void handleSubmit()} loading={saving} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: withAlpha(colors.black, '88'),
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    maxHeight: 420,
    marginTop: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.85,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
