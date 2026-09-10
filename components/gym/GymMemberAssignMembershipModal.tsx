import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { GymMembershipDateFields } from '@/components/gym/GymMembershipDateFields';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { defaultMembershipEndDate } from '@/lib/gymMemberBalance';
import { formatGymMoney } from '@/lib/gymShopService';
import { GYM_BILLING_PERIOD_LABELS, type GymMembershipPlan } from '@/lib/gymTypes';

function todayKey() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function GymMemberAssignMembershipModal({
  visible,
  plan,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  plan: GymMembershipPlan | null;
  onCancel: () => void;
  onSubmit: (input: { startsAt: string; endsAt: string }) => Promise<{ error?: string }>;
}) {
  const [startsAt, setStartsAt] = useState(todayKey());
  const [endsAt, setEndsAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !plan) return;
    const start = todayKey();
    setStartsAt(start);
    setEndsAt(defaultMembershipEndDate(start, plan.billingPeriod, plan.validityDays));
    setError(null);
  }, [plan, visible]);

  if (!plan) return null;

  const handleSubmit = async () => {
    if (!isValidDate(startsAt)) {
      setError('La fecha de inicio debe tener formato AAAA-MM-DD.');
      return;
    }
    if (!isValidDate(endsAt)) {
      setError('La fecha de fin debe tener formato AAAA-MM-DD.');
      return;
    }
    if (endsAt < startsAt) {
      setError('La fecha de fin no puede ser anterior al inicio.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await onSubmit({ startsAt, endsAt });
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Asignar tarifa</Text>
            <Text style={styles.subtitle}>
              {plan.name} · {GYM_BILLING_PERIOD_LABELS[plan.billingPeriod]}
              {plan.price !== undefined ? ` · ${formatGymMoney(plan.price)}` : ''}
            </Text>

            <GymMembershipDateFields
              startsAt={startsAt}
              endsAt={endsAt}
              onStartsAtChange={(value) => {
                setStartsAt(value);
                setEndsAt(defaultMembershipEndDate(value, plan.billingPeriod, plan.validityDays));
              }}
              onEndsAtChange={setEndsAt}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} disabled={saving} />
            <Button title="Asignar" onPress={() => void handleSubmit()} loading={saving} />
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
    maxWidth: 440,
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
    marginBottom: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
