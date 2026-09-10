import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  GYM_SHOP_PAYMENT_METHOD_LABELS,
  GYM_SHOP_PAYMENT_STATUS_LABELS,
  type GymShopPaymentMethod,
  type GymShopPaymentStatus,
  type GymShopSalePayment,
} from '@/lib/gymShopService';

export function GymShopSalePaymentFields({
  payment,
  onChange,
}: {
  payment: GymShopSalePayment;
  onChange: (payment: GymShopSalePayment) => void;
}) {
  const statuses = Object.keys(GYM_SHOP_PAYMENT_STATUS_LABELS) as GymShopPaymentStatus[];
  const methods = Object.keys(GYM_SHOP_PAYMENT_METHOD_LABELS) as GymShopPaymentMethod[];

  return (
    <View style={styles.block}>
      <Text style={styles.label}>Estado del pago</Text>
      <View style={styles.chips}>
        {statuses.map((status) => {
          const selected = payment.status === status;
          return (
            <Pressable
              key={status}
              onPress={() =>
                onChange({
                  status,
                  method: status === 'paid' ? payment.method ?? 'cash' : undefined,
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
                {GYM_SHOP_PAYMENT_STATUS_LABELS[status]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {payment.status === 'paid' ? (
        <>
          <Text style={styles.label}>Forma de pago</Text>
          <View style={styles.chips}>
            {methods.map((method) => {
              const selected = payment.method === method;
              return (
                <Pressable
                  key={method}
                  onPress={() => onChange({ ...payment, method })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {GYM_SHOP_PAYMENT_METHOD_LABELS[method]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: spacing.sm,
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
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.black,
  },
  pressed: {
    opacity: 0.85,
  },
});
