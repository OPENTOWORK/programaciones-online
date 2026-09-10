import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { formatGymMoney } from '@/lib/gymShopService';
import { GYM_BILLING_PERIOD_LABELS, formatPlanValidityLabel, type GymMembershipPlan } from '@/lib/gymTypes';

export function GymMemberPlanPickerModal({
  visible,
  plans,
  onCancel,
  onSelect,
}: {
  visible: boolean;
  plans: GymMembershipPlan[];
  onCancel: () => void;
  onSelect: (plan: GymMembershipPlan) => void;
}) {
  const activePlans = plans.filter((plan) => plan.active);

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
          <Text style={styles.title}>Seleccionar tarifa</Text>
          <Text style={styles.subtitle}>Elige la tarifa que quieres asignar a este miembro.</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {activePlans.length === 0 ? (
              <Text style={styles.empty}>No hay tarifas activas disponibles.</Text>
            ) : (
              activePlans.map((plan, index) => (
                <Pressable
                  key={plan.id}
                  onPress={() => onSelect(plan)}
                  accessibilityRole="button"
                  accessibilityLabel={`Asignar ${plan.name}`}
                  style={({ pressed }) => [
                    styles.row,
                    index > 0 && styles.rowBorder,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle} numberOfLines={2}>{plan.name}</Text>
                    <Text style={styles.rowMeta}>
                      {[
                        GYM_BILLING_PERIOD_LABELS[plan.billingPeriod],
                        formatPlanValidityLabel(plan),
                        plan.price !== undefined ? formatGymMoney(plan.price) : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <AppIcon name="chevronRight" size={16} color={colors.textMuted} />
                </Pressable>
              ))
            )}
          </ScrollView>
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
    maxWidth: 480,
    maxHeight: '80%',
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
  list: {
    maxHeight: 360,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    padding: spacing.md,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  rowMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
