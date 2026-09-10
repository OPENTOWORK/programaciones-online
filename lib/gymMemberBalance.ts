import type { GymFinanceEntry } from '@/lib/gymFinance';
import {
  type GymMemberMembership,
  type GymMembershipPlan,
  type GymProductMovement,
} from '@/lib/gymTypes';

export interface GymMemberBalanceLine {
  id: string;
  kind: 'charge' | 'payment';
  category: 'membership' | 'shop';
  label: string;
  detail?: string;
  amount: number;
  date: string;
}

export interface GymMemberReconcileState {
  matched: boolean;
  warning?: string;
  paymentId?: string;
  chargeAmount?: number;
}

export interface GymMemberBalanceSummary {
  membershipCharges: number;
  shopCharges: number;
  membershipPayments: number;
  shopPayments: number;
  totalCharges: number;
  totalPayments: number;
  /** Positivo = el cliente debe dinero. */
  balanceDue: number;
  lines: GymMemberBalanceLine[];
  reconciliation: {
    memberships: Record<string, GymMemberReconcileState>;
    shopSales: Record<string, GymMemberReconcileState>;
    payments: Record<string, GymMemberReconcileState>;
    hasWarnings: boolean;
  };
}

function normalizeLabel(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeMatchText(value: string) {
  return normalizeLabel(value)
    .replace(/^cuota\s*[·\-–—]\s*/i, '')
    .replace(/^venta\s*[·\-–—]\s*/i, '')
    .trim();
}

function amountsMatch(left: number, right: number) {
  return Math.abs(left - right) < 0.01;
}

function padDate(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function defaultMembershipEndDate(
  startsAt: string,
  billingPeriod: GymMembershipPlan['billingPeriod'],
  validityDays?: number,
): string {
  const start = new Date(`${startsAt}T12:00:00`);
  if (Number.isNaN(start.getTime())) return startsAt;

  const end = new Date(start);
  if (validityDays !== undefined && validityDays > 0) {
    end.setDate(end.getDate() + validityDays);
    return padDate(end);
  }

  if (billingPeriod === 'monthly') end.setMonth(end.getMonth() + 1);
  else if (billingPeriod === 'quarterly') end.setMonth(end.getMonth() + 3);
  else if (billingPeriod === 'annual') end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 3);

  return padDate(end);
}

function paymentMatchesMembershipCharge(
  payment: GymFinanceEntry,
  chargeLabel: string,
  chargeAmount: number,
) {
  if (payment.kind !== 'income' || payment.category === 'shop') return false;

  const label = normalizeLabel(chargeLabel);
  const concept = normalizeMatchText(payment.concept ?? '');
  const labelMatch =
    concept.length > 0 && (concept.includes(label) || label.includes(concept));

  if (!labelMatch) return false;
  if (amountsMatch(payment.amount, chargeAmount)) return true;
  return 'partial';
}

function paymentMatchesShopCharge(
  payment: GymFinanceEntry,
  productName: string,
  chargeAmount: number,
) {
  if (payment.kind !== 'income') return false;
  if (payment.category !== 'shop' && payment.category !== 'other') return false;

  const label = normalizeLabel(productName);
  const concept = normalizeMatchText(payment.concept ?? '');
  const labelMatch =
    concept.length > 0 && (concept.includes(label) || label.includes(concept));

  if (!labelMatch) return false;
  if (amountsMatch(payment.amount, chargeAmount)) return true;
  return 'partial';
}

function findMembershipPayment(
  payments: GymFinanceEntry[],
  usedPaymentIds: Set<string>,
  chargeLabel: string,
  chargeAmount: number,
) {
  if (chargeAmount <= 0) return null;

  let partialCandidate: { payment: GymFinanceEntry; partial: true } | null = null;

  for (const payment of payments) {
    if (usedPaymentIds.has(payment.id)) continue;
    const match = paymentMatchesMembershipCharge(payment, chargeLabel, chargeAmount);
    if (match === true) return { payment, partial: false as const };
    if (match === 'partial' && !partialCandidate) {
      partialCandidate = { payment, partial: true };
    }
  }

  return partialCandidate;
}

function findShopPayment(
  payments: GymFinanceEntry[],
  usedPaymentIds: Set<string>,
  productName: string,
  chargeAmount: number,
) {
  if (chargeAmount <= 0) return null;

  let partialCandidate: { payment: GymFinanceEntry; partial: true } | null = null;

  for (const payment of payments) {
    if (usedPaymentIds.has(payment.id)) continue;
    const match = paymentMatchesShopCharge(payment, productName, chargeAmount);
    if (match === true) return { payment, partial: false as const };
    if (match === 'partial' && !partialCandidate) {
      partialCandidate = { payment, partial: true };
    }
  }

  return partialCandidate;
}

export function buildGymMemberBalance(input: {
  member: { firstName: string; lastName?: string | null };
  memberships: readonly GymMemberMembership[];
  plans: readonly GymMembershipPlan[];
  payments: readonly GymFinanceEntry[];
  shopSales: readonly GymProductMovement[];
}): GymMemberBalanceSummary {
  const planById = new Map(input.plans.map((plan) => [plan.id, plan]));
  const incomePayments = input.payments.filter((payment) => payment.kind === 'income');
  const membershipPayments = incomePayments.filter((payment) => payment.category !== 'shop');
  const shopPayments = incomePayments.filter(
    (payment) => payment.category === 'shop' || payment.category === 'other',
  );

  const membershipReconciliation: Record<string, GymMemberReconcileState> = {};
  const shopSaleReconciliation: Record<string, GymMemberReconcileState> = {};
  const paymentReconciliation: Record<string, GymMemberReconcileState> = {};
  const usedPaymentIds = new Set<string>();
  const lines: GymMemberBalanceLine[] = [];

  for (const membership of input.memberships) {
    if (membership.status === 'cancelled') continue;

    const plan = membership.planId ? planById.get(membership.planId) : undefined;
    const amount = plan?.price ?? 0;
    const label = membership.planName ?? plan?.name ?? 'Tarifa';

    if (amount > 0) {
      lines.push({
        id: `membership-charge-${membership.id}`,
        kind: 'charge',
        category: 'membership',
        label,
        detail: `${membership.startsAt}${membership.endsAt ? ` → ${membership.endsAt}` : ''}`,
        amount,
        date: membership.startsAt,
      });

      const match = findMembershipPayment(membershipPayments, usedPaymentIds, label, amount);
      if (!match) {
        membershipReconciliation[membership.id] = {
          matched: false,
          warning: `Falta el pago de ${label}.`,
          chargeAmount: amount,
        };
      } else if (match.partial) {
        usedPaymentIds.add(match.payment.id);
        membershipReconciliation[membership.id] = {
          matched: false,
          warning: `El pago no coincide con el importe de ${label}.`,
          paymentId: match.payment.id,
          chargeAmount: amount,
        };
        paymentReconciliation[match.payment.id] = {
          matched: false,
          warning: 'El importe no coincide con la tarifa asignada.',
        };
      } else {
        usedPaymentIds.add(match.payment.id);
        membershipReconciliation[membership.id] = {
          matched: true,
          paymentId: match.payment.id,
          chargeAmount: amount,
        };
        paymentReconciliation[match.payment.id] = { matched: true };
      }
    } else {
      membershipReconciliation[membership.id] = { matched: true, chargeAmount: 0 };
    }
  }

  for (const sale of input.shopSales) {
    const amount = (sale.unitPrice ?? 0) * sale.quantity;
    const label = sale.productName ?? 'Producto tienda';
    if (amount <= 0) continue;

    lines.push({
      id: `shop-charge-${sale.id}`,
      kind: 'charge',
      category: 'shop',
      label,
      detail: sale.note,
      amount,
      date: sale.createdAt.slice(0, 10),
    });

    const match = findShopPayment(shopPayments, usedPaymentIds, label, amount);
    if (!match) {
      shopSaleReconciliation[sale.id] = {
        matched: false,
        warning: `Falta el pago de ${label}.`,
        chargeAmount: amount,
      };
    } else if (match.partial) {
      usedPaymentIds.add(match.payment.id);
      shopSaleReconciliation[sale.id] = {
        matched: false,
        warning: `El pago no coincide con la compra de ${label}.`,
        paymentId: match.payment.id,
        chargeAmount: amount,
      };
      paymentReconciliation[match.payment.id] = {
        matched: false,
        warning: 'El importe no coincide con la compra de tienda.',
      };
    } else {
      usedPaymentIds.add(match.payment.id);
      shopSaleReconciliation[sale.id] = {
        matched: true,
        paymentId: match.payment.id,
        chargeAmount: amount,
      };
      paymentReconciliation[match.payment.id] = { matched: true };
    }
  }

  for (const payment of incomePayments) {
    if (paymentReconciliation[payment.id]) continue;

    const isShop = payment.category === 'shop' || payment.category === 'other';
    paymentReconciliation[payment.id] = {
      matched: false,
      warning: isShop
        ? 'Pago de tienda sin compra asociada.'
        : 'Pago de tarifa sin asignación asociada.',
    };
  }

  for (const payment of incomePayments) {
    const isShop = payment.category === 'shop' || payment.category === 'other';
    lines.push({
      id: `payment-${payment.id}`,
      kind: 'payment',
      category: isShop ? 'shop' : 'membership',
      label: payment.concept || (isShop ? 'Pago tienda' : 'Pago tarifa'),
      detail: payment.entryDate,
      amount: payment.amount,
      date: payment.entryDate,
    });
  }

  const membershipCharges = lines
    .filter((line) => line.kind === 'charge' && line.category === 'membership')
    .reduce((total, line) => total + line.amount, 0);
  const shopCharges = lines
    .filter((line) => line.kind === 'charge' && line.category === 'shop')
    .reduce((total, line) => total + line.amount, 0);
  const membershipPaymentsTotal = lines
    .filter((line) => line.kind === 'payment' && line.category === 'membership')
    .reduce((total, line) => total + line.amount, 0);
  const shopPaymentsTotal = lines
    .filter((line) => line.kind === 'payment' && line.category === 'shop')
    .reduce((total, line) => total + line.amount, 0);

  const totalCharges = membershipCharges + shopCharges;
  const totalPayments = membershipPaymentsTotal + shopPaymentsTotal;

  lines.sort((left, right) => right.date.localeCompare(left.date));

  const hasWarnings = [
    ...Object.values(membershipReconciliation),
    ...Object.values(shopSaleReconciliation),
    ...Object.values(paymentReconciliation),
  ].some((item) => !item.matched);

  return {
    membershipCharges,
    shopCharges,
    membershipPayments: membershipPaymentsTotal,
    shopPayments: shopPaymentsTotal,
    totalCharges,
    totalPayments,
    balanceDue: Math.round((totalCharges - totalPayments) * 100) / 100,
    lines,
    reconciliation: {
      memberships: membershipReconciliation,
      shopSales: shopSaleReconciliation,
      payments: paymentReconciliation,
      hasWarnings,
    },
  };
}

export function memberShopSaleMatchesNote(note?: string, memberName?: string) {
  if (!note?.trim() || !memberName?.trim()) return false;
  return normalizeLabel(note).includes(normalizeLabel(memberName));
}

export function findLinkedMembershipForPayment(
  paymentId: string,
  memberships: readonly GymMemberMembership[],
  reconciliation: GymMemberBalanceSummary['reconciliation'],
): GymMemberMembership | null {
  for (const membership of memberships) {
    const state = reconciliation.memberships[membership.id];
    if (state?.paymentId === paymentId && state.matched) {
      return membership;
    }
  }
  return null;
}

export function findLinkedShopSaleForPayment(
  paymentId: string,
  shopSales: readonly GymProductMovement[],
  reconciliation: GymMemberBalanceSummary['reconciliation'],
): GymProductMovement | null {
  for (const sale of shopSales) {
    const state = reconciliation.shopSales[sale.id];
    if (state?.paymentId === paymentId && state.matched) {
      return sale;
    }
  }
  return null;
}
