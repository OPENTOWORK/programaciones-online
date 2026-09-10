import type { GymResult } from '@/lib/gymService';
import { fetchGymMembers, fetchGymMembershipPlans } from '@/lib/gymService';
import {
  fetchGymProductMovements,
  gymShopSaleBuyerLabel,
  parseShopSalePaymentNote,
} from '@/lib/gymShopService';
import { gymMemberFullName, type GymBillingPeriod, type GymMember, type GymProductMovement } from '@/lib/gymTypes';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type GymFinanceKind = 'income' | 'expense';
export type GymFinancePeriod = 'this_month' | 'last_month' | 'this_year';
export type GymFinanceAccount = 'cash' | 'bank';

export const GYM_FINANCE_ACCOUNT_LABELS: Record<GymFinanceAccount, string> = {
  cash: 'Caja',
  bank: 'Banco',
};

/** Efectivo → caja; tarjeta → banco. */
export function gymFinanceAccountFromShopPayment(method: 'cash' | 'card'): GymFinanceAccount {
  return method === 'card' ? 'bank' : 'cash';
}

export type GymIncomeCategory = 'memberships' | 'shop' | 'drop_in' | 'other';
export type GymExpenseCategory =
  | 'rent'
  | 'salaries'
  | 'utilities'
  | 'suppliers'
  | 'marketing'
  | 'equipment'
  | 'software'
  | 'other';

export const GYM_INCOME_CATEGORY_LABELS: Record<GymIncomeCategory, string> = {
  memberships: 'Cuotas de socios',
  shop: 'Tienda',
  drop_in: 'Clases sueltas',
  other: 'Otros ingresos',
};

export const GYM_EXPENSE_CATEGORY_LABELS: Record<GymExpenseCategory, string> = {
  rent: 'Alquiler',
  salaries: 'Nóminas',
  utilities: 'Suministros',
  suppliers: 'Proveedores',
  marketing: 'Marketing',
  equipment: 'Material',
  software: 'Software',
  other: 'Otros gastos',
};

export const GYM_FINANCE_PERIOD_LABELS: Record<GymFinancePeriod, string> = {
  this_month: 'Este mes',
  last_month: 'Mes anterior',
  this_year: 'Este año',
};

export interface GymFinanceEntryLinks {
  memberId?: string;
  memberName?: string;
  originType?: 'membership' | 'shop_sale';
  originId?: string;
  originLabel?: string;
}

export interface GymFinanceEntry {
  id: string;
  gymId: string;
  kind: GymFinanceKind;
  category: string;
  amount: number;
  entryDate: string;
  concept?: string;
  counterparty?: string;
  account: GymFinanceAccount;
  source: 'manual' | 'shop';
  createdAt: string;
  links?: GymFinanceEntryLinks;
}

export interface GymFinanceEntryInput {
  kind: GymFinanceKind;
  category: string;
  amount: number;
  entryDate: string;
  concept?: string;
  counterparty?: string;
  account?: GymFinanceAccount;
}

export interface GymFinanceBreakdownRow {
  category: string;
  label: string;
  amount: number;
}

export interface GymFinanceSummary {
  income: number;
  expense: number;
  balance: number;
  cashOnHand: number;
  bankOnHand: number;
  incomeByOrigin: GymFinanceBreakdownRow[];
  expenseByDestination: GymFinanceBreakdownRow[];
  expectedMemberships: number;
  paidPaymentsTotal: number;
  pendingPaymentsTotal: number;
}

export interface GymPendingPayment {
  id: string;
  membershipId: string;
  memberId: string;
  memberName: string;
  planName: string;
  amount: number;
  billingPeriod: GymBillingPeriod;
  dueLabel: string;
}

const TABLE = 'gym_finance_entries';
const MIGRATION_HINT = 'Falta aplicar el panel financiero: ejecuta npm run supabase:gym-finance';
const SELECT =
  'id, gym_id, kind, category, amount, entry_date, concept, counterparty, account, created_at';
const ACCOUNT_MIGRATION_HINT =
  'Falta aplicar la cuenta caja/banco: ejecuta npm run supabase:gym-finance-account';

type Row = Record<string, unknown>;
type PgError = { message?: string; code?: string } | null | undefined;

const demoEntries = new Map<string, GymFinanceEntry[]>();

function isMissingSchemaError(error: PgError) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes(TABLE) ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST202' ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function friendlyError(error: PgError, fallback: string) {
  if (!error) return fallback;
  if (isMissingSchemaError(error)) return MIGRATION_HINT;
  if (/row-level security|permission denied|violates/i.test(error.message ?? '')) {
    return 'No tienes permiso para hacer eso en este gimnasio.';
  }
  return fallback;
}

function text(value: unknown) {
  return (value as string | null) ?? undefined;
}

function num(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapAccount(value: unknown): GymFinanceAccount {
  return value === 'bank' ? 'bank' : 'cash';
}

function mapEntry(row: Row): GymFinanceEntry {
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    kind: row.kind as GymFinanceKind,
    category: String(row.category),
    amount: num(row.amount),
    entryDate: String(row.entry_date).slice(0, 10),
    concept: text(row.concept),
    counterparty: text(row.counterparty),
    account: mapAccount(row.account),
    source: 'manual',
    createdAt: row.created_at as string,
  };
}

export function gymFinancePeriodRange(period: GymFinancePeriod, today = new Date()) {
  const year = today.getFullYear();
  const month = today.getMonth();

  if (period === 'this_year') {
    return {
      from: `${year}-01-01`,
      to: `${year}-12-31`,
    };
  }

  const start = period === 'last_month' ? new Date(year, month - 1, 1) : new Date(year, month, 1);
  const end = period === 'last_month' ? new Date(year, month, 0) : new Date(year, month + 1, 0);
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    from: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    to: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
  };
}

export function gymFinanceCategoryLabel(kind: GymFinanceKind, category: string) {
  if (kind === 'income') {
    return GYM_INCOME_CATEGORY_LABELS[category as GymIncomeCategory] ?? category;
  }
  return GYM_EXPENSE_CATEGORY_LABELS[category as GymExpenseCategory] ?? category;
}

function monthlyEquivalent(price: number, period: GymBillingPeriod) {
  if (period === 'quarterly') return price / 3;
  if (period === 'annual') return price / 12;
  if (period === 'one_time') return 0;
  return price;
}

function inRange(dateKey: string, from: string, to: string) {
  return dateKey >= from && dateKey <= to;
}

function amountsMatch(left: number, right: number) {
  return Math.abs(left - right) < 0.01;
}

function findMemberIdByName(members: readonly GymMember[], name?: string) {
  const normalized = normalizeLabel(name ?? '');
  if (!normalized) return undefined;
  return members.find((member) => normalizeLabel(gymMemberFullName(member)) === normalized)?.id;
}

function planNameFromConcept(concept?: string) {
  const trimmed = concept?.trim();
  if (!trimmed) return undefined;
  const match = trimmed.match(/^cuota\s*[·\-]\s*(.+)$/i);
  return match?.[1]?.trim() ?? trimmed.replace(/^cuota\s*/i, '').trim();
}

type MembershipLinkRow = {
  id: string;
  memberId: string;
  planName?: string;
};

async function fetchGymMembershipsForLinks(gymId: string): Promise<MembershipLinkRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('gym_member_memberships')
    .select('id, member_id, gym_membership_plans(name)')
    .eq('gym_id', gymId)
    .neq('status', 'cancelled');

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map((row) => {
    const planRow = Array.isArray(row.gym_membership_plans)
      ? row.gym_membership_plans[0]
      : row.gym_membership_plans;
    return {
      id: String(row.id),
      memberId: String(row.member_id),
      planName: (planRow as { name?: string } | null | undefined)?.name,
    };
  });
}

export function attachFinanceEntryLinks(
  entries: readonly GymFinanceEntry[],
  members: readonly GymMember[],
  memberships: readonly MembershipLinkRow[],
  shopMovements: readonly GymProductMovement[],
): GymFinanceEntry[] {
  const usedShopMovementIds = new Set<string>();
  const usedMembershipIds = new Set<string>();

  return entries.map((entry) => {
    if (entry.kind !== 'income') return entry;

    const links: GymFinanceEntryLinks = {};

    if (entry.id.startsWith('shop-')) {
      const movementId = entry.id.slice(5);
      const movement = shopMovements.find((item) => item.id === movementId);
      const buyer = gymShopSaleBuyerLabel(movement?.note);
      links.originType = 'shop_sale';
      links.originId = movementId;
      links.originLabel = movement?.productName ?? entry.concept ?? 'Venta de tienda';
      links.memberId = findMemberIdByName(members, buyer);
      links.memberName = buyer !== 'Sin cliente' ? buyer : entry.counterparty;
      return { ...entry, links };
    }

    links.memberId = findMemberIdByName(members, entry.counterparty);
    links.memberName = entry.counterparty;

    if (entry.category === 'shop') {
      const movement = shopMovements.find((item) => {
        if (item.kind !== 'sale' || usedShopMovementIds.has(item.id)) return false;
        const { payment } = parseShopSalePaymentNote(item.note);
        if (payment.status !== 'paid') return false;
        const amount = (item.unitPrice ?? 0) * item.quantity;
        if (!amountsMatch(amount, entry.amount)) return false;
        const buyer = gymShopSaleBuyerLabel(item.note);
        if (
          entry.counterparty &&
          normalizeLabel(buyer) !== normalizeLabel(entry.counterparty) &&
          buyer !== 'Sin cliente'
        ) {
          return false;
        }
        return item.createdAt.slice(0, 10) === entry.entryDate;
      });

      if (movement) {
        usedShopMovementIds.add(movement.id);
        links.originType = 'shop_sale';
        links.originId = movement.id;
        links.originLabel = movement.productName ?? 'Venta de tienda';
        if (!links.memberId) {
          links.memberId = findMemberIdByName(members, gymShopSaleBuyerLabel(movement.note));
        }
      } else {
        links.originType = 'shop_sale';
        links.originLabel =
          entry.concept?.replace(/\s*·\s*(Efectivo|Tarjeta)\s*$/i, '').trim() ?? 'Venta de tienda';
      }
    } else if (entry.category === 'memberships') {
      const planName = planNameFromConcept(entry.concept);
      const memberMemberships = memberships.filter((item) => item.memberId === links.memberId);
      const membership =
        memberMemberships.find((item) => {
          if (usedMembershipIds.has(item.id)) return false;
          const name = normalizeLabel(item.planName ?? '');
          const target = normalizeLabel(planName ?? '');
          return Boolean(name && target && (name === target || target.includes(name) || name.includes(target)));
        }) ?? memberMemberships[0];

      links.originType = 'membership';
      if (membership) {
        usedMembershipIds.add(membership.id);
        links.originId = membership.id;
        links.originLabel = membership.planName ?? planName ?? 'Tarifa';
      } else {
        links.originLabel = planName ?? entry.concept ?? 'Cuota de socio';
      }
    }

    return { ...entry, links };
  });
}

function normalizeLabel(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function monthsBetween(from: Date, to: Date) {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

function membershipPaymentDueInPeriod(
  startsAt: string,
  billingPeriod: GymBillingPeriod,
  range: { from: string; to: string },
) {
  if (billingPeriod === 'monthly') return true;

  const start = new Date(`${startsAt}T12:00:00`);
  const from = new Date(`${range.from}T12:00:00`);
  const to = new Date(`${range.to}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return false;
  }

  if (billingPeriod === 'one_time') {
    return startsAt >= range.from && startsAt <= range.to;
  }

  const interval = billingPeriod === 'quarterly' ? 3 : 12;
  let cursor = new Date(start);

  while (cursor <= to) {
    if (cursor >= from && monthsBetween(start, cursor) % interval === 0) {
      return true;
    }
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, start.getDate());
  }

  return false;
}

function hasMembershipPayment(
  memberName: string,
  planName: string,
  entries: readonly GymFinanceEntry[],
  range: { from: string; to: string },
) {
  const normalizedMember = normalizeLabel(memberName);
  const normalizedPlan = normalizeLabel(planName);

  return entries.some(
    (entry) =>
      entry.kind === 'income' &&
      entry.category === 'memberships' &&
      inRange(entry.entryDate, range.from, range.to) &&
      (normalizeLabel(entry.counterparty ?? '') === normalizedMember ||
        normalizeLabel(entry.concept ?? '').includes(normalizedPlan)),
  );
}

function dueLabelForPeriod(billingPeriod: GymBillingPeriod) {
  if (billingPeriod === 'monthly') return 'Cuota del mes';
  if (billingPeriod === 'quarterly') return 'Cuota trimestral';
  if (billingPeriod === 'annual') return 'Cuota anual';
  return 'Pago único';
}

export async function fetchGymFinanceEntries(
  gymId: string,
  range: { from: string; to: string },
): Promise<GymResult<GymFinanceEntry[]>> {
  if (!gymId) return { data: [] };

  if (!isSupabaseConfigured) {
    const stored = demoEntries.get(gymId) ?? [];
    return {
      data: stored.filter((entry) => inRange(entry.entryDate, range.from, range.to)),
    };
  }

  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('gym_id', gymId)
    .gte('entry_date', range.from)
    .lte('entry_date', range.to)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return { error: friendlyError(error, 'No se pudieron cargar los movimientos.') };
  return { data: ((data ?? []) as Row[]).map(mapEntry) };
}

export async function saveGymFinanceEntry(
  gymId: string,
  input: GymFinanceEntryInput,
  userId?: string,
): Promise<GymResult<GymFinanceEntry>> {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { error: 'El importe tiene que ser mayor que cero.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.entryDate)) {
    return { error: 'Indica una fecha válida.' };
  }

  const account = input.account ?? 'cash';

  const entry: GymFinanceEntry = {
    id: `local-${Date.now()}`,
    gymId,
    kind: input.kind,
    category: input.category,
    amount: Math.round(input.amount * 100) / 100,
    entryDate: input.entryDate,
    concept: input.concept?.trim() || undefined,
    counterparty: input.counterparty?.trim() || undefined,
    account,
    source: 'manual',
    createdAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    demoEntries.set(gymId, [entry, ...(demoEntries.get(gymId) ?? [])]);
    return { data: entry };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      gym_id: gymId,
      kind: input.kind,
      category: input.category,
      amount: entry.amount,
      entry_date: input.entryDate,
      concept: entry.concept ?? null,
      counterparty: entry.counterparty ?? null,
      account,
      created_by: userId ?? null,
    })
    .select(SELECT)
    .single();

  if (error || !data) {
    const message = friendlyError(error, 'No se pudo guardar el movimiento.');
    if (error && /account/i.test(error.message ?? '')) {
      return { error: ACCOUNT_MIGRATION_HINT };
    }
    return { error: message };
  }
  return { data: mapEntry(data as Row) };
}

export function canEditGymFinanceEntry(entry: Pick<GymFinanceEntry, 'id' | 'source'>) {
  return entry.source === 'manual' && !entry.id.startsWith('shop-');
}

export async function updateGymFinanceEntry(
  entryId: string,
  input: GymFinanceEntryInput,
): Promise<GymResult<GymFinanceEntry>> {
  if (entryId.startsWith('shop-')) {
    return { error: 'Las ventas de tienda no se pueden editar desde aquí.' };
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { error: 'El importe tiene que ser mayor que cero.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.entryDate)) {
    return { error: 'Indica una fecha válida.' };
  }

  const account = input.account ?? 'cash';

  const patch = {
    kind: input.kind,
    category: input.category,
    amount: Math.round(input.amount * 100) / 100,
    entryDate: input.entryDate,
    concept: input.concept?.trim() || undefined,
    counterparty: input.counterparty?.trim() || undefined,
    account,
  };

  if (entryId.startsWith('local-')) {
    for (const [gymId, entries] of demoEntries) {
      const index = entries.findIndex((entry) => entry.id === entryId);
      if (index === -1) continue;
      const updated: GymFinanceEntry = {
        ...entries[index],
        kind: patch.kind,
        category: patch.category,
        amount: patch.amount,
        entryDate: patch.entryDate,
        concept: patch.concept,
        counterparty: patch.counterparty,
        account: patch.account,
      };
      const next = [...entries];
      next[index] = updated;
      demoEntries.set(gymId, next);
      return { data: updated };
    }
    return { error: 'No se encontró el movimiento.' };
  }

  if (!isSupabaseConfigured) {
    return { error: 'Supabase no está disponible.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      kind: patch.kind,
      category: patch.category,
      amount: patch.amount,
      entry_date: patch.entryDate,
      concept: patch.concept ?? null,
      counterparty: patch.counterparty ?? null,
      account: patch.account,
    })
    .eq('id', entryId)
    .select(SELECT)
    .single();

  if (error || !data) {
    if (error && /account/i.test(error.message ?? '')) {
      return { error: ACCOUNT_MIGRATION_HINT };
    }
    return { error: friendlyError(error, 'No se pudo actualizar el movimiento.') };
  }
  return { data: mapEntry(data as Row) };
}

export async function deleteGymFinanceEntry(entryId: string): Promise<GymResult<true>> {
  if (entryId.startsWith('local-') || entryId.startsWith('shop-')) {
    for (const [gymId, entries] of demoEntries) {
      demoEntries.set(
        gymId,
        entries.filter((entry) => entry.id !== entryId),
      );
    }
    return { data: true };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(TABLE).delete().eq('id', entryId);
  if (error) return { error: friendlyError(error, 'No se pudo eliminar el movimiento.') };
  return { data: true };
}

async function shopIncomeEntries(
  gymId: string,
  range: { from: string; to: string },
): Promise<GymFinanceEntry[]> {
  const movements = await fetchGymProductMovements(gymId, 400);
  return (movements.data ?? [])
    .filter((movement) => {
      if (movement.kind !== 'sale') return false;
      const { payment } = parseShopSalePaymentNote(movement.note);
      return payment.status !== 'paid';
    })
    .map((movement) => {
      const dateKey = movement.createdAt.slice(0, 10);
      const amount = (movement.unitPrice ?? 0) * movement.quantity;
      return {
        id: `shop-${movement.id}`,
        gymId,
        kind: 'income' as const,
        category: 'shop',
        amount,
        entryDate: dateKey,
        concept: movement.productName
          ? `Venta · ${movement.productName} × ${movement.quantity}`
          : `Venta de tienda × ${movement.quantity}`,
        account: 'cash' as const,
        source: 'shop' as const,
        createdAt: movement.createdAt,
      };
    })
    .filter((entry) => entry.amount > 0 && inRange(entry.entryDate, range.from, range.to));
}

async function expectedMembershipIncome(gymId: string): Promise<number> {
  const supabase = getSupabase();
  const plans = await fetchGymMembershipPlans(gymId);
  const planById = new Map((plans.data ?? []).map((plan) => [plan.id, plan]));

  if (!supabase) {
    return (plans.data ?? [])
      .filter((plan) => plan.active && plan.price)
      .reduce((total, plan) => total + monthlyEquivalent(plan.price ?? 0, plan.billingPeriod), 0);
  }

  const { data } = await supabase
    .from('gym_member_memberships')
    .select('plan_id, status')
    .eq('gym_id', gymId)
    .eq('status', 'active');

  return ((data ?? []) as Array<{ plan_id?: string }>).reduce((total, row) => {
    const plan = row.plan_id ? planById.get(row.plan_id) : undefined;
    if (!plan?.price) return total;
    return total + monthlyEquivalent(plan.price, plan.billingPeriod);
  }, 0);
}

async function fetchGymAccountBalance(gymId: string, account: GymFinanceAccount): Promise<number> {
  if (!gymId) return 0;

  let net = 0;

  if (!isSupabaseConfigured) {
    for (const entry of demoEntries.get(gymId) ?? []) {
      if (entry.account !== account) continue;
      if (entry.kind === 'income') net += entry.amount;
      else net -= entry.amount;
    }

    const movements = await fetchGymProductMovements(gymId, 10_000);
    for (const movement of movements.data ?? []) {
      if (movement.kind !== 'sale') continue;
      const { payment } = parseShopSalePaymentNote(movement.note);
      if (payment.status === 'paid') continue;
      if (account !== 'cash') continue;
      net += (movement.unitPrice ?? 0) * movement.quantity;
    }

    return Math.round(net * 100) / 100;
  }

  const supabase = getSupabase();
  if (!supabase) return 0;

  const { data: financeRows, error: financeError } = await supabase
    .from(TABLE)
    .select('kind, amount, account')
    .eq('gym_id', gymId);

  if (financeError && isMissingSchemaError(financeError)) return 0;
  if (financeError) return 0;

  for (const row of financeRows ?? []) {
    const rowAccount = mapAccount(row.account);
    if (rowAccount !== account) continue;
    if (row.kind === 'income') net += num(row.amount);
    else net -= num(row.amount);
  }

  const { data: saleRows, error: saleError } = await supabase
    .from('gym_product_movements')
    .select('quantity, unit_price, note')
    .eq('gym_id', gymId)
    .eq('kind', 'sale');

  if (!saleError && account === 'cash') {
    for (const row of saleRows ?? []) {
      const { payment } = parseShopSalePaymentNote(text(row.note));
      if (payment.status === 'paid') continue;
      net += num(row.unit_price) * num(row.quantity);
    }
  }

  return Math.round(net * 100) / 100;
}

function breakdown(
  entries: readonly GymFinanceEntry[],
  kind: GymFinanceKind,
): GymFinanceBreakdownRow[] {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    if (entry.kind !== kind) continue;
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount);
  }

  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      label: gymFinanceCategoryLabel(kind, category),
      amount,
    }))
    .sort((left, right) => right.amount - left.amount);
}

export function summarizeGymFinance(
  entries: readonly GymFinanceEntry[],
  expectedMemberships = 0,
  pendingPayments: readonly GymPendingPayment[] = [],
  cashOnHand = 0,
  bankOnHand = 0,
): GymFinanceSummary {
  const income = entries
    .filter((entry) => entry.kind === 'income')
    .reduce((total, entry) => total + entry.amount, 0);
  const expense = entries
    .filter((entry) => entry.kind === 'expense')
    .reduce((total, entry) => total + entry.amount, 0);
  const paidPayments = entries.filter((entry) => entry.kind === 'income');

  return {
    income,
    expense,
    balance: income - expense,
    cashOnHand,
    bankOnHand,
    incomeByOrigin: breakdown(entries, 'income'),
    expenseByDestination: breakdown(entries, 'expense'),
    expectedMemberships,
    paidPaymentsTotal: paidPayments.reduce((total, entry) => total + entry.amount, 0),
    pendingPaymentsTotal: pendingPayments.reduce((total, payment) => total + payment.amount, 0),
  };
}

async function fetchPendingMembershipPayments(
  gymId: string,
  range: { from: string; to: string },
  entries: readonly GymFinanceEntry[],
): Promise<GymPendingPayment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('gym_member_memberships')
    .select(
      'id, member_id, starts_at, gym_members!inner(first_name, last_name, status), gym_membership_plans(name, price, billing_period)',
    )
    .eq('gym_id', gymId)
    .eq('status', 'active');

  if (error || !data) return [];

  const pending: GymPendingPayment[] = [];

  for (const row of data as Array<Record<string, unknown>>) {
    const memberRow = Array.isArray(row.gym_members) ? row.gym_members[0] : row.gym_members;
    const planRow = Array.isArray(row.gym_membership_plans)
      ? row.gym_membership_plans[0]
      : row.gym_membership_plans;

    if (!memberRow || !planRow) continue;
    if ((memberRow as { status?: string }).status !== 'active') continue;

    const price = num((planRow as { price?: unknown }).price);
    const billingPeriod = String((planRow as { billing_period?: string }).billing_period ?? 'monthly') as GymBillingPeriod;
    const planName = String((planRow as { name?: string }).name ?? 'Tarifa');
    const startsAt = String(row.starts_at).slice(0, 10);
    const memberName = gymMemberFullName({
      firstName: String((memberRow as { first_name?: string }).first_name ?? ''),
      lastName: String((memberRow as { last_name?: string }).last_name ?? ''),
    });

    if (price <= 0) continue;
    if (!membershipPaymentDueInPeriod(startsAt, billingPeriod, range)) continue;
    if (hasMembershipPayment(memberName, planName, entries, range)) continue;

    pending.push({
      id: `pending-${row.id as string}`,
      membershipId: row.id as string,
      memberId: row.member_id as string,
      memberName,
      planName,
      amount: price,
      billingPeriod,
      dueLabel: dueLabelForPeriod(billingPeriod),
    });
  }

  return pending.sort((left, right) => right.amount - left.amount || left.memberName.localeCompare(right.memberName));
}

export function paidFinancePayments(entries: readonly GymFinanceEntry[]) {
  return entries
    .filter((entry) => entry.kind === 'income')
    .sort((left, right) => right.entryDate.localeCompare(left.entryDate));
}

export async function loadGymFinanceBoard(
  gymId: string,
  period: GymFinancePeriod,
): Promise<
  GymResult<{
    entries: GymFinanceEntry[];
    paidPayments: GymFinanceEntry[];
    pendingPayments: GymPendingPayment[];
    summary: GymFinanceSummary;
  }>
> {
  const range = gymFinancePeriodRange(period);
  const [manual, shop, expectedMemberships, cashOnHand, bankOnHand, members, memberships, shopMovements] =
    await Promise.all([
    fetchGymFinanceEntries(gymId, range),
    shopIncomeEntries(gymId, range),
    expectedMembershipIncome(gymId),
    fetchGymAccountBalance(gymId, 'cash'),
    fetchGymAccountBalance(gymId, 'bank'),
    fetchGymMembers(gymId),
    fetchGymMembershipsForLinks(gymId),
    fetchGymProductMovements(gymId, 400),
  ]);

  if (manual.error) return { error: manual.error };

  const rawEntries = [...(manual.data ?? []), ...shop].sort((left, right) =>
    right.entryDate.localeCompare(left.entryDate),
  );
  const entries = attachFinanceEntryLinks(
    rawEntries,
    members.data ?? [],
    memberships,
    shopMovements.data ?? [],
  );
  const paidPayments = paidFinancePayments(entries);
  const pendingPayments = await fetchPendingMembershipPayments(gymId, range, entries);

  return {
    data: {
      entries,
      paidPayments,
      pendingPayments,
      summary: summarizeGymFinance(entries, expectedMemberships, pendingPayments, cashOnHand, bankOnHand),
    },
  };
}

function memberMatchesFinanceEntry(entry: GymFinanceEntry, memberName: string) {
  if (entry.kind !== 'income') return false;
  const normalizedMember = normalizeLabel(memberName);
  if (!normalizedMember) return false;
  if (normalizeLabel(entry.counterparty ?? '') === normalizedMember) return true;
  return normalizeLabel(entry.concept ?? '').includes(normalizedMember);
}

export function formatFinanceEntryDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export async function fetchGymMemberFinancePayments(
  gymId: string,
  member: { id: string; firstName: string; lastName?: string | null },
): Promise<GymResult<{ paid: GymFinanceEntry[]; pending: GymPendingPayment[] }>> {
  if (!gymId || !member.id) return { data: { paid: [], pending: [] } };

  const today = new Date();
  const range = {
    from: `${today.getFullYear() - 10}-01-01`,
    to: today.toISOString().slice(0, 10),
  };
  const memberName = gymMemberFullName(member);

  const [manual, shop] = await Promise.all([
    fetchGymFinanceEntries(gymId, range),
    shopIncomeEntries(gymId, range),
  ]);

  if (manual.error) return { error: manual.error };

  const entries = [...(manual.data ?? []), ...shop];
  const paid = paidFinancePayments(entries).filter((entry) =>
    memberMatchesFinanceEntry(entry, memberName),
  );
  const pending = (
    await fetchPendingMembershipPayments(gymId, gymFinancePeriodRange('this_month', today), entries)
  ).filter((payment) => payment.memberId === member.id);

  return { data: { paid, pending } };
}
