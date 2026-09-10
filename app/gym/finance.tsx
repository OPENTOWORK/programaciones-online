import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
  GymSectionTitle,
} from '@/components/gym/GymScreen';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { useGymFinance } from '@/hooks/useGymFinance';
import {
  deleteGymFinanceEntry,
  GYM_EXPENSE_CATEGORY_LABELS,
  GYM_FINANCE_ACCOUNT_LABELS,
  GYM_FINANCE_PERIOD_LABELS,
  GYM_INCOME_CATEGORY_LABELS,
  gymFinanceCategoryLabel,
  saveGymFinanceEntry,
  type GymExpenseCategory,
  type GymFinanceEntry,
  type GymFinanceKind,
  type GymFinancePeriod,
  type GymIncomeCategory,
  type GymPendingPayment,
} from '@/lib/gymFinance';
import { GYM_BILLING_PERIOD_LABELS } from '@/lib/gymTypes';
import { formatGymMoney } from '@/lib/gymShopService';

function todayKey() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatEntryDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function parseMoney(value: string) {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

type FinanceFormInitial = {
  category?: string;
  amount?: string;
  counterparty?: string;
  concept?: string;
};

type AppIconName = 'wallet' | 'calendar' | 'stats';

export default function GymFinanceScreen() {
  const { gym, permissions } = useGym();
  const [period, setPeriod] = useState<GymFinancePeriod>('this_month');
  const { entries, paidPayments, pendingPayments, summary, isLoading, error, refresh } = useGymFinance(period);

  const [formKind, setFormKind] = useState<GymFinanceKind | null>(null);
  const [formInitial, setFormInitial] = useState<FinanceFormInitial | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GymFinanceEntry | null>(null);
  const [busy, setBusy] = useState(false);

  const expenseEntries = useMemo(
    () => entries.filter((entry) => entry.kind === 'expense'),
    [entries],
  );

  const openIncomeForm = (initial?: FinanceFormInitial) => {
    setFormInitial(initial ?? null);
    setFormKind('income');
  };

  const openExpenseForm = () => {
    setFormInitial(null);
    setFormKind('expense');
  };

  const openPendingPayment = (payment: GymPendingPayment) => {
    openIncomeForm({
      category: 'memberships',
      amount: String(payment.amount),
      counterparty: payment.memberName,
      concept: `Cuota · ${payment.planName}`,
    });
  };

  const canWrite = permissions.canOperate;
  const maxBreakdown = Math.max(
    1,
    ...summary.incomeByOrigin.map((row) => row.amount),
    ...summary.expenseByDestination.map((row) => row.amount),
  );

  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader
          title="Panel financiero"
          subtitle="De dónde vienen los ingresos y a dónde van los gastos"
          action={
            canWrite ? (
              <View style={styles.headerActions}>
                <Button
                  title="Ingreso"
                  size="compact"
                  variant="outline"
                  onPress={() => openIncomeForm()}
                />
                <Button title="Gasto" size="compact" onPress={openExpenseForm} />
              </View>
            ) : undefined
          }
        />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}

        <View style={styles.periods}>
          {(Object.keys(GYM_FINANCE_PERIOD_LABELS) as GymFinancePeriod[]).map((id) => {
            const active = period === id;
            return (
              <Pressable
                key={id}
                onPress={() => setPeriod(id)}
                style={({ pressed }) => [
                  styles.periodChip,
                  active && styles.periodChipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.periodText, active && styles.periodTextActive]}>
                  {GYM_FINANCE_PERIOD_LABELS[id]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <View style={styles.skeleton}>
            <SkeletonBlock height={88} />
            <SkeletonBlock height={160} />
            <SkeletonBlock height={160} />
          </View>
        ) : (
          <>
            <View style={styles.kpis}>
              <KpiCard label="Ingresos" value={summary.income} tone="positive" />
              <KpiCard label="Gastos" value={summary.expense} tone="danger" />
              <KpiCard
                label="Balance"
                value={summary.balance}
                tone={summary.balance >= 0 ? 'positive' : 'danger'}
              />
              <KpiCard
                label="Dinero en caja"
                value={summary.cashOnHand}
                tone={summary.cashOnHand >= 0 ? 'positive' : 'danger'}
              />
              <KpiCard
                label="Dinero en banco"
                value={summary.bankOnHand}
                tone={summary.bankOnHand >= 0 ? 'positive' : 'danger'}
              />
            </View>

            {summary.expectedMemberships > 0 ? (
              <Text style={styles.hint}>
                Cuotas previstas al mes: {formatGymMoney(summary.expectedMemberships)}. Registra cada
                cobro para que entre en ingresos.
              </Text>
            ) : null}

            <View style={styles.columns}>
              <BreakdownCard
                title="De dónde vienen"
                empty="Todavía no hay ingresos en este periodo."
                rows={summary.incomeByOrigin}
                max={maxBreakdown}
                tone="positive"
              />
              <BreakdownCard
                title="A dónde van"
                empty="Todavía no hay gastos en este periodo."
                rows={summary.expenseByDestination}
                max={maxBreakdown}
                tone="danger"
              />
            </View>

            <GymSectionTitle
              title="Movimientos"
              count={paidPayments.length + pendingPayments.length}
              subtitle="Pagos cobrados y cuotas pendientes del periodo"
            />

            <View style={styles.paymentColumns}>
              <PaymentPanel
                title="Pagos realizados"
                count={paidPayments.length}
                total={summary.paidPaymentsTotal}
                tone="positive"
                emptyIcon="wallet"
                emptyTitle="Sin cobros registrados"
                emptyText="Los ingresos del periodo aparecerán aquí: cuotas, tienda y otros cobros."
              >
                {paidPayments.map((entry, index) => (
                  <PaymentRow
                    key={entry.id}
                    entry={entry}
                    index={index}
                    canDelete={canWrite && entry.source === 'manual'}
                    onDelete={() => setPendingDelete(entry)}
                  />
                ))}
              </PaymentPanel>

              <PaymentPanel
                title="Pagos pendientes"
                count={pendingPayments.length}
                total={summary.pendingPaymentsTotal}
                tone="warning"
                emptyIcon="calendar"
                emptyTitle="Sin cuotas pendientes"
                emptyText="Todos los socios con tarifa activa están al día en este periodo."
              >
                {pendingPayments.map((payment, index) => (
                  <PendingPaymentRow
                    key={payment.id}
                    payment={payment}
                    index={index}
                    canCollect={canWrite}
                    onCollect={() => openPendingPayment(payment)}
                  />
                ))}
              </PaymentPanel>
            </View>

            <GymSectionTitle title="Gastos registrados" count={expenseEntries.length} />

            {expenseEntries.length === 0 ? (
              <GymEmptyState
                icon="stats"
                title="Sin gastos"
                text="Registra alquiler, nóminas u otros gastos para ver el desglose arriba."
              />
            ) : (
              <View style={styles.list}>
                {expenseEntries.map((entry) => (
                  <View key={entry.id} style={styles.row}>
                    <View style={[styles.kindDot, { backgroundColor: colors.danger }]} />
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle}>
                        {entry.concept || gymFinanceCategoryLabel(entry.kind, entry.category)}
                      </Text>
                      <Text style={styles.rowMeta}>
                        {gymFinanceCategoryLabel(entry.kind, entry.category)}
                        {entry.counterparty ? ` · ${entry.counterparty}` : ''}
                        {` · ${formatEntryDate(entry.entryDate)}`}
                      </Text>
                    </View>
                    <Text style={[styles.rowAmount, { color: colors.danger }]}>
                      −{formatGymMoney(entry.amount)}
                    </Text>
                    {canWrite && entry.source === 'manual' ? (
                      <Pressable
                        onPress={() => setPendingDelete(entry)}
                        accessibilityLabel="Eliminar gasto"
                        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                      >
                        <AppIcon name="trash" size={16} color={colors.textMuted} />
                      </Pressable>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

          </>
        )}

        <FinanceEntryModal
          key={`${formKind ?? 'closed'}-${formInitial?.counterparty ?? 'new'}`}
          visible={formKind !== null}
          kind={formKind ?? 'income'}
          initial={formInitial}
          onCancel={() => {
            setFormKind(null);
            setFormInitial(null);
          }}
          onSubmit={async (input) => {
            if (!gym) return { error: 'No hay gimnasio activo.' };
            const result = await saveGymFinanceEntry(gym.id, input, user?.id);
            if (!result.error) {
              setFormKind(null);
              setFormInitial(null);
              refresh();
            }
            return result;
          }}
        />

        <ConfirmModal
          visible={pendingDelete !== null}
          title="Eliminar movimiento"
          message={`Se quitará ${formatGymMoney(pendingDelete?.amount ?? 0)} de ${
            pendingDelete ? gymFinanceCategoryLabel(pendingDelete.kind, pendingDelete.category) : ''
          }.`}
          confirmLabel="Eliminar"
          destructive
          busy={busy}
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => {
            if (!pendingDelete) return;
            setBusy(true);
            await deleteGymFinanceEntry(pendingDelete.id);
            setBusy(false);
            setPendingDelete(null);
            refresh();
          }}
        />
      </ScreenWrapper>
    </GymScreen>
  );
}

function PaymentPanel({
  title,
  count,
  total,
  tone,
  emptyIcon,
  emptyTitle,
  emptyText,
  children,
}: {
  title: string;
  count: number;
  total: number;
  tone: 'positive' | 'warning';
  emptyIcon: AppIconName;
  emptyTitle: string;
  emptyText: string;
  children: ReactNode;
}) {
  const toneColor = tone === 'positive' ? '#16A34A' : colors.warning;

  return (
    <View style={styles.paymentPanel}>
      <View style={styles.paymentPanelHeader}>
        <View style={styles.paymentPanelCopy}>
          <Text style={styles.paymentPanelTitle}>{title}</Text>
          <Text style={styles.paymentPanelMeta}>{count} en este periodo</Text>
        </View>
        <Text style={[styles.paymentPanelTotal, { color: toneColor }]}>{formatGymMoney(total)}</Text>
      </View>

      {count === 0 ? (
        <View style={styles.paymentEmpty}>
          <View style={styles.paymentEmptyIcon}>
            <AppIcon name={emptyIcon} size={20} color={colors.textMuted} />
          </View>
          <Text style={styles.paymentEmptyTitle}>{emptyTitle}</Text>
          <Text style={styles.paymentEmptyText}>{emptyText}</Text>
        </View>
      ) : (
        <View style={styles.paymentList}>{children}</View>
      )}
    </View>
  );
}

function FinanceInlineLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Text style={styles.inlineLink}>{label}</Text>
    </Pressable>
  );
}

function PaymentRow({
  entry,
  index,
  canDelete,
  onDelete,
}: {
  entry: GymFinanceEntry;
  index: number;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const router = useRouter();
  const links = entry.links;
  const memberLabel = links?.memberName ?? entry.counterparty;
  const originLabel = links?.originLabel;

  const openMember = () => {
    if (!links?.memberId) return;
    router.push({ pathname: '/gym/members/[id]', params: { id: links.memberId } });
  };

  const openOrigin = () => {
    if (links?.originType === 'shop_sale') {
      router.push('/gym/shop/sales');
      return;
    }
    if (links?.memberId) {
      router.push({ pathname: '/gym/members/[id]', params: { id: links.memberId } });
    }
  };

  return (
    <View style={[styles.paymentRow, index > 0 && styles.paymentRowBorder]}>
      <View style={styles.paymentRowIcon}>
        <AppIcon name="check" size={14} color="#16A34A" />
      </View>
      <View style={styles.paymentRowCopy}>
        <Text style={styles.paymentRowTitle} numberOfLines={1}>
          {entry.concept || gymFinanceCategoryLabel(entry.kind, entry.category)}
        </Text>
        <View style={styles.paymentRowLinks}>
          {memberLabel ? (
            links?.memberId ? (
              <FinanceInlineLink label={memberLabel} onPress={openMember} />
            ) : (
              <Text style={styles.paymentRowMeta}>{memberLabel}</Text>
            )
          ) : null}
          {originLabel ? (
            <>
              {memberLabel ? <Text style={styles.paymentRowMeta}> · </Text> : null}
              {links?.originType ? (
                <FinanceInlineLink label={originLabel} onPress={openOrigin} />
              ) : (
                <Text style={styles.paymentRowMeta}>{originLabel}</Text>
              )}
            </>
          ) : null}
          <Text style={styles.paymentRowMeta}>
            {memberLabel || originLabel ? ' · ' : ''}
            {entry.source === 'shop' ? 'Tienda · ' : ''}
            {GYM_FINANCE_ACCOUNT_LABELS[entry.account]}
            {` · ${formatEntryDate(entry.entryDate)}`}
          </Text>
        </View>
      </View>
      <Text style={styles.paymentRowAmount}>+{formatGymMoney(entry.amount)}</Text>
      {canDelete ? (
        <Pressable
          onPress={onDelete}
          accessibilityLabel="Eliminar cobro"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <AppIcon name="trash" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function PendingPaymentRow({
  payment,
  index,
  canCollect,
  onCollect,
}: {
  payment: GymPendingPayment;
  index: number;
  canCollect: boolean;
  onCollect: () => void;
}) {
  const router = useRouter();

  const openMember = () => {
    router.push({ pathname: '/gym/members/[id]', params: { id: payment.memberId } });
  };

  const openMembership = () => {
    router.push({ pathname: '/gym/members/[id]', params: { id: payment.memberId } });
  };

  return (
    <View style={[styles.paymentRow, index > 0 && styles.paymentRowBorder]}>
      <View style={[styles.paymentRowIcon, styles.paymentRowIconPending]}>
        <AppIcon name="time" size={14} color={colors.warning} />
      </View>
      <View style={styles.paymentRowCopy}>
        <Pressable onPress={openMember} accessibilityRole="link">
          <Text style={[styles.paymentRowTitle, styles.inlineLink]} numberOfLines={1}>
            {payment.memberName}
          </Text>
        </Pressable>
        <View style={styles.paymentRowLinks}>
          <FinanceInlineLink label={payment.planName} onPress={openMembership} />
          <Text style={styles.paymentRowMeta}>
            {` · ${GYM_BILLING_PERIOD_LABELS[payment.billingPeriod].toLowerCase()}`}
            {` · ${payment.dueLabel}`}
          </Text>
        </View>
      </View>
      <Text style={styles.paymentRowAmountPending}>{formatGymMoney(payment.amount)}</Text>
      {canCollect ? (
        <Button title="Cobrar" size="compact" variant="outline" onPress={onCollect} />
      ) : null}
    </View>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'positive' | 'danger';
}) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color: tone === 'positive' ? '#16A34A' : colors.danger }]}>
        {formatGymMoney(value)}
      </Text>
    </View>
  );
}

function BreakdownCard({
  title,
  empty,
  rows,
  max,
  tone,
}: {
  title: string;
  empty: string;
  rows: { category: string; label: string; amount: number }[];
  max: number;
  tone: 'positive' | 'danger';
}) {
  const bar = tone === 'positive' ? '#4ADE80' : colors.danger;
  return (
    <View style={styles.breakdown}>
      <Text style={styles.breakdownTitle}>{title}</Text>
      {rows.length === 0 ? (
        <Text style={styles.breakdownEmpty}>{empty}</Text>
      ) : (
        rows.map((row) => (
          <View key={row.category} style={styles.breakdownRow}>
            <View style={styles.breakdownHead}>
              <Text style={styles.breakdownLabel}>{row.label}</Text>
              <Text style={styles.breakdownAmount}>{formatGymMoney(row.amount)}</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(row.amount / max) * 100}%`, backgroundColor: bar }]} />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function FinanceEntryModal({
  visible,
  kind,
  initial,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  kind: GymFinanceKind;
  initial?: FinanceFormInitial | null;
  onCancel: () => void;
  onSubmit: (input: {
    kind: GymFinanceKind;
    category: string;
    amount: number;
    entryDate: string;
    concept?: string;
    counterparty?: string;
  }) => Promise<{ error?: string }>;
}) {
  const categories = useMemo(
    () =>
      kind === 'income'
        ? (Object.keys(GYM_INCOME_CATEGORY_LABELS) as GymIncomeCategory[])
        : (Object.keys(GYM_EXPENSE_CATEGORY_LABELS) as GymExpenseCategory[]),
    [kind],
  );
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState('');
  const [entryDate, setEntryDate] = useState(todayKey());
  const [concept, setConcept] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setCategory(initial?.category ?? categories[0]);
    setAmount(initial?.amount ?? '');
    setEntryDate(todayKey());
    setConcept(initial?.concept ?? '');
    setCounterparty(initial?.counterparty ?? '');
    setError(null);
  }, [categories, initial, visible]);

  const reset = () => {
    setCategory(categories[0]);
    setAmount('');
    setEntryDate(todayKey());
    setConcept('');
    setCounterparty('');
    setError(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{kind === 'income' ? 'Registrar ingreso' : 'Registrar gasto'}</Text>
          <Text style={styles.modalHint}>
            {kind === 'income' ? 'Indica de dónde viene el dinero.' : 'Indica a qué se destina el dinero.'}
          </Text>

          <View style={styles.chips}>
            {categories.map((id) => {
              const selected = category === id;
              const label =
                kind === 'income'
                  ? GYM_INCOME_CATEGORY_LABELS[id as GymIncomeCategory]
                  : GYM_EXPENSE_CATEGORY_LABELS[id as GymExpenseCategory];
              return (
                <Pressable
                  key={id}
                  onPress={() => setCategory(id)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Input label="Importe (€)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <Input label="Fecha (AAAA-MM-DD)" value={entryDate} onChangeText={setEntryDate} />
          <Input
            label={kind === 'income' ? 'Quién paga (opcional)' : 'Proveedor o destino (opcional)'}
            value={counterparty}
            onChangeText={setCounterparty}
          />
          <Input label="Concepto (opcional)" value={concept} onChangeText={setConcept} />

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => {
                reset();
                onCancel();
              }}
              style={styles.modalBtn}
            />
            <Button
              title="Guardar"
              loading={saving}
              onPress={async () => {
                const parsed = parseMoney(amount);
                setSaving(true);
                const result = await onSubmit({
                  kind,
                  category,
                  amount: parsed,
                  entryDate,
                  concept,
                  counterparty,
                });
                setSaving(false);
                if (result.error) setError(result.error);
                else reset();
              }}
              style={styles.modalBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  periods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  periodChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  periodChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  periodText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  periodTextActive: {
    color: colors.accent,
  },
  skeleton: {
    gap: spacing.sm,
  },
  kpis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kpi: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 140,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  kpiLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  kpiValue: {
    ...typography.h3,
    marginTop: 4,
    fontWeight: '800',
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  breakdown: {
    flexGrow: 1,
    flexBasis: 280,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  breakdownTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
  },
  breakdownEmpty: {
    ...typography.caption,
    color: colors.textMuted,
  },
  breakdownRow: {
    gap: 4,
  },
  breakdownHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  breakdownLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  breakdownAmount: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '800',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  paymentColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  paymentPanel: {
    flexGrow: 1,
    flexBasis: 320,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        } as object)
      : null),
  },
  paymentPanelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  paymentPanelCopy: {
    flex: 1,
    gap: 2,
  },
  paymentPanelTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
  },
  paymentPanelMeta: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  paymentPanelTotal: {
    ...typography.bodySmall,
    fontWeight: '800',
  },
  paymentEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  paymentEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  paymentEmptyTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  paymentEmptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  paymentList: {
    backgroundColor: colors.background,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
  },
  paymentRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentRowIcon: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha('#4ADE80', '14'),
    borderWidth: 1,
    borderColor: withAlpha('#4ADE80', '28'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRowIconPending: {
    backgroundColor: withAlpha(colors.warning, '14'),
    borderColor: withAlpha(colors.warning, '28'),
  },
  paymentRowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  paymentRowTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  paymentRowMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  paymentRowLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 2,
  },
  inlineLink: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  paymentRowAmount: {
    ...typography.bodySmall,
    color: '#16A34A',
    fontWeight: '800',
  },
  paymentRowAmountPending: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: '800',
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  kindDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  rowMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowAmount: {
    ...typography.bodySmall,
    fontWeight: '800',
  },
  iconBtn: {
    padding: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  pressed: { opacity: 0.8 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
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
  formError: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.sm,
  },
  modalBtn: {
    flex: 1,
  },
});
