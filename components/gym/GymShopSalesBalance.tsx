import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GymEmptyState } from '@/components/gym/GymScreen';
import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  formatGymMoney,
  GYM_SHOP_SALES_PERIOD_LABELS,
  gymShopSaleAmount,
  gymShopSaleBuyerLabel,
  gymShopSalePaymentLabel,
  summarizeGymShopSales,
  type GymShopSalesPeriod,
} from '@/lib/gymShopService';
import type { GymProductMovement } from '@/lib/gymTypes';

function formatSaleWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface GymShopSalesBalancePanelProps {
  movements: GymProductMovement[];
  isLoading?: boolean;
}

export function GymShopSalesBalancePanel({
  movements,
  isLoading = false,
}: GymShopSalesBalancePanelProps) {
  const [period, setPeriod] = useState<GymShopSalesPeriod>('month');

  const summary = useMemo(
    () => summarizeGymShopSales(movements, period),
    [movements, period],
  );

  return (
    <View style={styles.panel}>
      <View style={styles.periodRow}>
        {(Object.keys(GYM_SHOP_SALES_PERIOD_LABELS) as GymShopSalesPeriod[]).map((item) => {
          const selected = period === item;
          return (
            <Pressable
              key={item}
              onPress={() => setPeriod(item)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.periodChip,
                selected && styles.periodChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.periodChipText, selected && styles.periodChipTextActive]}>
                {GYM_SHOP_SALES_PERIOD_LABELS[item]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.summaryRow}>
        <SummaryStat label="Total" value={formatGymMoney(summary.totalAmount)} highlight />
        <SummaryStat label="Ventas" value={String(summary.saleCount)} />
        <SummaryStat label="Clientes" value={String(summary.buyerCount)} />
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Cargando ventas…</Text>
      ) : summary.sales.length === 0 ? (
        <GymEmptyState
          icon="shop"
          title="Sin ventas en este periodo"
          text="Cuando registres ventas en la tienda, aparecerán aquí con el cliente y el importe."
        />
      ) : (
        <View style={styles.list}>
          {summary.sales.map((sale, index) => (
            <View
              key={sale.id}
              style={[styles.saleRow, index === summary.sales.length - 1 && styles.saleRowLast]}
            >
              <View style={styles.saleCopy}>
                <Text style={styles.saleTitle}>{sale.productName ?? 'Producto'}</Text>
                <Text style={styles.saleBuyer}>{gymShopSaleBuyerLabel(sale.note)}</Text>
                <Text style={styles.saleMeta}>
                  {sale.quantity} ud · {formatGymMoney(gymShopSaleAmount(sale))}
                  {' · '}
                  {gymShopSalePaymentLabel(sale.note)}
                </Text>
              </View>
              <Text style={styles.saleWhen}>{formatSaleWhen(sale.createdAt)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function GymShopSalesBalanceLink({ movements }: { movements: GymProductMovement[] }) {
  const router = useRouter();
  const summary = useMemo(() => summarizeGymShopSales(movements, 'month'), [movements]);

  return (
    <Pressable
      onPress={() => router.push('/gym/shop/sales')}
      accessibilityRole="button"
      accessibilityLabel="Ver balance de ventas"
      style={({ pressed }) => [styles.linkCard, pressed && styles.pressed]}
    >
      <View style={styles.linkIcon}>
        <AppIcon name="stats" size={16} color={colors.accent} />
      </View>
      <View style={styles.linkCopy}>
        <Text style={styles.linkLabel}>Balance de ventas</Text>
        <Text style={styles.linkValue}>{formatGymMoney(summary.totalAmount)} este mes</Text>
      </View>
      <AppIcon name="chevronRight" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

function SummaryStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.summaryStat, highlight && styles.summaryStatHighlight]}>
      <Text style={[styles.summaryValue, highlight && styles.summaryValueHighlight]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  periodChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, 0.12),
  },
  periodChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  periodChipTextActive: {
    color: colors.accent,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryStat: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  summaryStatHighlight: {
    borderColor: withAlpha(colors.accent, 0.35),
    backgroundColor: withAlpha(colors.accent, 0.08),
  },
  summaryValue: {
    ...typography.h2,
    color: colors.text,
  },
  summaryValueHighlight: {
    color: colors.accent,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingVertical: spacing.lg,
  },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  saleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  saleRowLast: {
    borderBottomWidth: 0,
  },
  saleCopy: {
    flex: 1,
    minWidth: 0,
  },
  saleTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  saleBuyer: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  saleMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  saleWhen: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 0,
    marginTop: 2,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 220,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    flexShrink: 0,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.accent, 0.12),
  },
  linkCopy: {
    flex: 1,
    minWidth: 0,
  },
  linkLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  linkValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginTop: 1,
  },
});
