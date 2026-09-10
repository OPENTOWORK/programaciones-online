import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GymMemberShopSaleModal } from '@/components/gym/GymMemberShopSaleModal';
import { GymMemberAssignMembershipModal } from '@/components/gym/GymMemberAssignMembershipModal';
import { GymMemberFormModal } from '@/components/gym/GymMemberFormModal';
import { GymMemberPlanPickerModal } from '@/components/gym/GymMemberPlanPickerModal';
import { GymMemberMembershipModal } from '@/components/gym/GymMemberMembershipModal';
import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
} from '@/components/gym/GymScreen';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useGym } from '@/hooks/useGym';
import { linkGymMemberAccount } from '@/lib/athleteGymService';
import {
  buildGymMemberActivityTimeline,
  formatGymMemberActivityWhen,
  type GymMemberActivityTone,
} from '@/lib/gymMemberActivity';
import {
  canEditGymFinanceEntry,
  deleteGymFinanceEntry,
  fetchGymMemberFinancePayments,
  formatFinanceEntryDate,
  gymFinanceAccountFromShopPayment,
  gymFinanceCategoryLabel,
  saveGymFinanceEntry,
  updateGymFinanceEntry,
  type GymFinanceEntry,
  type GymPendingPayment,
} from '@/lib/gymFinance';
import {
  assignMemberMembership,
  deleteMemberMembership,
  fetchGymMember,
  fetchGymMembershipPlans,
  fetchMemberBookings,
  fetchMemberMemberships,
  updateGymMember,
  updateMemberMembership,
  type GymMemberInput,
  type GymMemberMembershipUpdateInput,
} from '@/lib/gymService';
import {
  GYM_BOOKING_STATUS_LABELS,
  GYM_BILLING_PERIOD_LABELS,
  GYM_MEMBERSHIP_STATUS_LABELS,
  GYM_MEMBER_STATUS_LABELS,
  gymMemberFullName,
  gymMemberInitials,
  isGymPotentialMember,
  type GymBooking,
  type GymMember,
  type GymMemberMembership,
  type GymMembershipPlan,
  type GymProductMovement,
} from '@/lib/gymTypes';
import { buildGymMemberBalance, findLinkedMembershipForPayment, findLinkedShopSaleForPayment, memberShopSaleMatchesNote } from '@/lib/gymMemberBalance';
import {
  fetchGymProductMovements,
  formatGymMoney,
  buildShopSaleNote,
  deleteGymProductMovement,
  extractShopSaleExtraNote,
  gymShopSalePaymentLabel,
  parseShopSalePaymentNote,
  updateGymProductMovement,
  type GymShopSalePayment,
} from '@/lib/gymShopService';
import { openExternalUrl } from '@/lib/openExternalUrl';
import { getWhatsAppUrl } from '@/lib/whatsappLink';

type MemberTab = 'summary' | 'bookings' | 'attendance' | 'membership' | 'notes' | 'activity';
type MemberBalanceSection = 'tariffs' | 'shop' | 'payments';

function memberRowDomId(section: MemberBalanceSection, id: string) {
  return `member-row-${section}-${id}`;
}

function scrollToMemberRow(section: MemberBalanceSection, id: string) {
  if (Platform.OS !== 'web') return;
  document.getElementById(memberRowDomId(section, id))?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

function MemberReconcileLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      hitSlop={4}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Text style={styles.reconcileLink}>{label}</Text>
    </Pressable>
  );
}

const TABS: Array<{ key: MemberTab; label: string }> = [
  { key: 'summary', label: 'Resumen' },
  { key: 'bookings', label: 'Reservas' },
  { key: 'attendance', label: 'Asistencia' },
  { key: 'membership', label: 'Membresía' },
  { key: 'notes', label: 'Notas' },
  { key: 'activity', label: 'Actividad' },
];

function formatDateTime(iso?: string) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function GymMemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { gym, permissions } = useGym();

  const [member, setMember] = useState<GymMember | null>(null);
  const [bookings, setBookings] = useState<GymBooking[]>([]);
  const [memberships, setMemberships] = useState<GymMemberMembership[]>([]);
  const [plans, setPlans] = useState<GymMembershipPlan[]>([]);
  const [paidPayments, setPaidPayments] = useState<GymFinanceEntry[]>([]);
  const [pendingPayments, setPendingPayments] = useState<GymPendingPayment[]>([]);
  const [shopSales, setShopSales] = useState<GymProductMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<MemberTab>('summary');
  const [editing, setEditing] = useState(false);
  const [editingMembership, setEditingMembership] = useState<GymMemberMembership | null>(null);
  const [pendingDeleteMembership, setPendingDeleteMembership] = useState<GymMemberMembership | null>(null);
  const [pendingDeactivate, setPendingDeactivate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [linkNotice, setLinkNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [assigningPlan, setAssigningPlan] = useState<GymMembershipPlan | null>(null);
  const [assignPickerOpen, setAssignPickerOpen] = useState(false);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<GymFinanceEntry | null>(null);
  const [pendingDeletePayment, setPendingDeletePayment] = useState<GymFinanceEntry | null>(null);
  const [editingShopSale, setEditingShopSale] = useState<GymProductMovement | null>(null);
  const [pendingDeleteShopSale, setPendingDeleteShopSale] = useState<GymProductMovement | null>(null);
  const [paymentPrefill, setPaymentPrefill] = useState<{
    amount?: string;
    concept?: string;
    entryDate?: string;
  } | null>(null);
  const [balanceSectionsOpen, setBalanceSectionsOpen] = useState({
    tariffs: false,
    shop: false,
    payments: false,
  });
  const [highlightedRow, setHighlightedRow] = useState<{
    section: MemberBalanceSection;
    id: string;
  } | null>(null);
  const membershipSectionsInitializedRef = useRef(false);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusBalanceRow = useCallback((section: MemberBalanceSection, id: string) => {
    setBalanceSectionsOpen((current) => ({ ...current, [section]: true }));
    setHighlightedRow({ section, id });
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => setHighlightedRow(null), 2500);
    requestAnimationFrame(() => scrollToMemberRow(section, id));
  }, []);

  const activeMembership = useMemo(
    () => memberships.find((item) => item.status === 'active'),
    [memberships],
  );

  const load = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!id) return;

    if (silent) setRefreshing(true);
    else setIsLoading(true);
    const memberResult = await fetchGymMember(id);

    if (memberResult.error || !memberResult.data) {
      setMember(null);
      setError(memberResult.error ?? 'No se pudo cargar el miembro.');
      if (silent) setRefreshing(false);
      else setIsLoading(false);
      return;
    }

    const memberName = gymMemberFullName(memberResult.data);
    const [bookingsResult, membershipsResult, plansResult, paymentsResult, shopResult] =
      await Promise.all([
      fetchMemberBookings(id),
      fetchMemberMemberships(id),
      gym ? fetchGymMembershipPlans(gym.id) : Promise.resolve({ data: [] as GymMembershipPlan[] }),
      gym && memberResult.data
        ? fetchGymMemberFinancePayments(gym.id, memberResult.data)
        : Promise.resolve({ data: { paid: [] as GymFinanceEntry[], pending: [] as GymPendingPayment[] } }),
      gym
        ? fetchGymProductMovements(gym.id, 400)
        : Promise.resolve({ data: [] as GymProductMovement[] }),
    ]);

    setMember(memberResult.data);
    setBookings(bookingsResult.data ?? []);
    setMemberships(membershipsResult.data ?? []);
    setPlans(plansResult.data ?? []);
    setPaidPayments(paymentsResult.data?.paid ?? []);
    setPendingPayments(paymentsResult.data?.pending ?? []);
    setShopSales(
      (shopResult.data ?? []).filter(
        (movement) =>
          movement.kind === 'sale' && memberShopSaleMatchesNote(movement.note, memberName),
      ),
    );
    setError(null);
    if (silent) setRefreshing(false);
    else setIsLoading(false);
  }, [gym, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpdate = async (input: GymMemberInput) => {
    if (!id || !gym) return { error: 'Miembro no válido.' };
    const result = await updateGymMember(id, input);
    if (!result.error) {
      const email = input.email?.trim().toLowerCase();
      if (email) {
        const link = await linkGymMemberAccount(gym.id, id, email);
        if (link.linked) {
          setLinkNotice('Cuenta de la app vinculada. El atleta verá este gimnasio en su Inicio.');
        } else if (!link.error) {
          setLinkNotice('Aún no hay cuenta con ese email en la app.');
        }
      }
      await load();
    }
    return result;
  };

  const handleConvertToMember = async () => {
    if (!id) return;
    setBusy(true);
    await updateGymMember(id, { status: 'active', pipelineStage: 'activo' });
    setBusy(false);
    await load();
  };

  const handleDeactivate = async () => {
    if (!id) return;
    setBusy(true);
    await updateGymMember(id, { status: 'inactive' });
    setBusy(false);
    setPendingDeactivate(false);
    await load();
  };

  const handleAssignPlan = async (input: { startsAt: string; endsAt: string }) => {
    if (!gym || !id || !assigningPlan) return { error: 'Tarifa no válida.' };

    setBusy(true);
    const result = await assignMemberMembership({
      gymId: gym.id,
      memberId: id,
      planId: assigningPlan.id,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    });
    setBusy(false);

    if (!result.error) {
      setAssigningPlan(null);
      await load();
    }

    return result;
  };

  const handleUpdateMembership = async (input: GymMemberMembershipUpdateInput) => {
    if (!editingMembership) return { error: 'No hay tarifa seleccionada.' };

    setBusy(true);
    const result = await updateMemberMembership(editingMembership.id, input);
    setBusy(false);

    if (!result.error) {
      setEditingMembership(null);
      await load();
    }

    return result;
  };

  const openPaymentForm = (
    prefill?: { amount?: string; concept?: string; entryDate?: string },
    payment?: GymFinanceEntry | null,
  ) => {
    setEditingPayment(payment ?? null);
    setPaymentPrefill(
      prefill ??
        (payment
          ? {
              amount: String(payment.amount),
              concept: payment.concept ?? '',
              entryDate: payment.entryDate,
            }
          : null),
    );
    setPaymentFormOpen(true);
  };

  const closePaymentForm = () => {
    setPaymentFormOpen(false);
    setEditingPayment(null);
    setPaymentPrefill(null);
  };

  const handleSavePayment = async (input: {
    amount: number;
    entryDate: string;
    concept?: string;
  }) => {
    if (!gym || !member) return { error: 'Miembro no válido.' };

    const payload = {
      kind: 'income' as const,
      category: 'memberships',
      amount: input.amount,
      entryDate: input.entryDate,
      concept: input.concept,
      counterparty: gymMemberFullName(member),
    };

    const result = editingPayment
      ? await updateGymFinanceEntry(editingPayment.id, payload)
      : await saveGymFinanceEntry(gym.id, payload, user?.id);

    if (!result.error) {
      closePaymentForm();
      await load();
    }

    return result;
  };

  const handleDeletePayment = async (options?: { optionalChecked?: boolean }) => {
    if (!pendingDeletePayment || !memberBalance) return;

    const linkedMembership = findLinkedMembershipForPayment(
      pendingDeletePayment.id,
      memberships,
      memberBalance.reconciliation,
    );
    const linkedShopSale = findLinkedShopSaleForPayment(
      pendingDeletePayment.id,
      shopSales,
      memberBalance.reconciliation,
    );

    setBusy(true);

    const paymentResult = await deleteGymFinanceEntry(pendingDeletePayment.id);
    if (paymentResult.error) {
      setBusy(false);
      setActionError(paymentResult.error);
      setPendingDeletePayment(null);
      return;
    }

    if (options?.optionalChecked) {
      if (linkedMembership) {
        const membershipResult = await deleteMemberMembership(linkedMembership.id);
        if (membershipResult.error) {
          setBusy(false);
          setActionError(membershipResult.error);
          setPendingDeletePayment(null);
          return;
        }
      }

      if (linkedShopSale) {
        const shopResult = await deleteGymProductMovement(linkedShopSale.id);
        if (shopResult.error) {
          setBusy(false);
          setActionError(shopResult.error);
          setPendingDeletePayment(null);
          return;
        }
      }
    }

    setBusy(false);
    setActionError(null);
    setPendingDeletePayment(null);
    await load();
  };

  const handleDeleteShopSale = async (options?: { optionalChecked?: boolean }) => {
    if (!pendingDeleteShopSale || !memberBalance) return;

    const linkedPaymentId =
      memberBalance.reconciliation.shopSales[pendingDeleteShopSale.id]?.paymentId;

    setBusy(true);

    if (options?.optionalChecked && linkedPaymentId) {
      const paymentResult = await deleteGymFinanceEntry(linkedPaymentId);
      if (paymentResult.error) {
        setBusy(false);
        setActionError(paymentResult.error);
        setPendingDeleteShopSale(null);
        return;
      }
    }

    const result = await deleteGymProductMovement(pendingDeleteShopSale.id);
    setBusy(false);

    if (result.error) {
      setActionError(result.error);
      setPendingDeleteShopSale(null);
      return;
    }

    setActionError(null);
    setPendingDeleteShopSale(null);
    await load();
  };

  const handleUpdateShopSale = async (input: {
    quantity: number;
    unitPrice: number;
    note?: string;
    payment: GymShopSalePayment;
  }) => {
    if (!member || !editingShopSale || !gym) return { error: 'Compra no válida.' };

    const result = await updateGymProductMovement(editingShopSale.id, {
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      note: buildShopSaleNote(gymMemberFullName(member), input.payment, input.note),
    });

    if (result.error) return result;

    const previousPayment = parseShopSalePaymentNote(
      extractShopSaleExtraNote(editingShopSale.note, gymMemberFullName(member)),
    ).payment;

    if (
      input.payment.status === 'paid' &&
      input.payment.method &&
      previousPayment.status !== 'paid'
    ) {
      const amount = input.quantity * input.unitPrice;
      const financeResult = await saveGymFinanceEntry(
        gym.id,
        {
          kind: 'income',
          category: 'shop',
          amount,
          entryDate: new Date().toISOString().slice(0, 10),
          concept: `${editingShopSale.productName ?? 'Producto tienda'} · ${
            input.payment.method === 'cash' ? 'Efectivo' : 'Tarjeta'
          }`,
          counterparty: gymMemberFullName(member),
          account: gymFinanceAccountFromShopPayment(input.payment.method),
        },
        user?.id,
      );
      if (financeResult.error) return { error: financeResult.error };
    }

    setEditingShopSale(null);
    await load();
    return result;
  };

  const handleDeleteMembership = async (options?: { optionalChecked?: boolean }) => {
    if (!pendingDeleteMembership) return;

    const linkedPaymentId =
      memberBalance?.reconciliation.memberships[pendingDeleteMembership.id]?.paymentId;

    setBusy(true);

    if (options?.optionalChecked && linkedPaymentId) {
      const paymentResult = await deleteGymFinanceEntry(linkedPaymentId);
      if (paymentResult.error) {
        setBusy(false);
        return;
      }
    }

    const result = await deleteMemberMembership(pendingDeleteMembership.id);
    setBusy(false);
    setPendingDeleteMembership(null);

    if (!result.error) {
      await load();
    }
  };

  const activity = useMemo(
    () => (member ? buildGymMemberActivityTimeline(member, bookings, memberships) : []),
    [bookings, member, memberships],
  );

  const memberBalance = useMemo(
    () =>
      member
        ? buildGymMemberBalance({
            member,
            memberships,
            plans,
            payments: paidPayments,
            shopSales,
          })
        : null,
    [member, memberships, paidPayments, plans, shopSales],
  );

  const planById = useMemo(() => new Map(plans.map((plan) => [plan.id, plan])), [plans]);

  const pendingDeleteMembershipPayment = useMemo(() => {
    if (!pendingDeleteMembership || !memberBalance) return null;

    const paymentId =
      memberBalance.reconciliation.memberships[pendingDeleteMembership.id]?.paymentId;
    if (!paymentId) return null;

    return paidPayments.find((payment) => payment.id === paymentId) ?? null;
  }, [memberBalance, paidPayments, pendingDeleteMembership]);

  const pendingDeletePaymentLinkedCharge = useMemo(() => {
    if (!pendingDeletePayment || !memberBalance) return null;

    const membership = findLinkedMembershipForPayment(
      pendingDeletePayment.id,
      memberships,
      memberBalance.reconciliation,
    );
    if (membership) {
      return `la tarifa "${membership.planName ?? 'Tarifa'}"`;
    }

    const shopSale = findLinkedShopSaleForPayment(
      pendingDeletePayment.id,
      shopSales,
      memberBalance.reconciliation,
    );
    if (shopSale) {
      return `la compra "${shopSale.productName ?? 'Producto tienda'}"`;
    }

    return null;
  }, [memberBalance, memberships, pendingDeletePayment, shopSales]);

  const pendingDeleteShopSalePayment = useMemo(() => {
    if (!pendingDeleteShopSale || !memberBalance) return null;

    const paymentId =
      memberBalance.reconciliation.shopSales[pendingDeleteShopSale.id]?.paymentId;
    if (!paymentId) return null;

    return paidPayments.find((payment) => payment.id === paymentId) ?? null;
  }, [memberBalance, paidPayments, pendingDeleteShopSale]);

  const membershipSectionWarning = useMemo(
    () =>
      memberships.some((membership) => {
        const reconcile = memberBalance?.reconciliation.memberships[membership.id];
        return reconcile && !reconcile.matched;
      }),
    [memberBalance, memberships],
  );

  const shopSectionWarning = useMemo(
    () =>
      shopSales.some((sale) => {
        const reconcile = memberBalance?.reconciliation.shopSales[sale.id];
        return reconcile && !reconcile.matched;
      }),
    [memberBalance, shopSales],
  );

  const paymentsSectionWarning = useMemo(
    () =>
      pendingPayments.length > 0 ||
      paidPayments.some((payment) => {
        const reconcile = memberBalance?.reconciliation.payments[payment.id];
        return reconcile && !reconcile.matched;
      }),
    [memberBalance, paidPayments, pendingPayments],
  );

  useEffect(() => {
    membershipSectionsInitializedRef.current = false;
  }, [id]);

  useEffect(() => {
    if (tab !== 'membership' || membershipSectionsInitializedRef.current || !memberBalance) return;
    membershipSectionsInitializedRef.current = true;
    setBalanceSectionsOpen({
      tariffs: memberships.length === 0 || membershipSectionWarning,
      shop: shopSectionWarning,
      payments: pendingPayments.length > 0 || paymentsSectionWarning,
    });
  }, [
    tab,
    memberBalance,
    memberships.length,
    membershipSectionWarning,
    shopSectionWarning,
    paymentsSectionWarning,
    pendingPayments.length,
  ]);

  if (isLoading) {
    return (
      <GymScreen>
        <ScreenWrapper>
          <SkeletonBlock height={24} width="46%" />
          <SkeletonBlock height={14} width="30%" style={styles.skeletonSpacer} />
          <View style={styles.skeletonBlocks}>
            <SkeletonBlock height={96} />
            <SkeletonBlock height={96} />
          </View>
        </ScreenWrapper>
      </GymScreen>
    );
  }

  if (!member) {
    return (
      <GymScreen>
        <ScreenWrapper>
          <GymErrorBanner message={error ?? 'Este miembro no existe.'} />
          <Button title="Volver a miembros" variant="secondary" onPress={() => router.replace('/gym/members')} />
        </ScreenWrapper>
      </GymScreen>
    );
  }

  const attended = bookings.filter((booking) => booking.status === 'attended');

  return (
    <GymScreen>
      <ScreenWrapper>
        <Pressable
          onPress={() => router.replace('/gym/members')}
          accessibilityRole="button"
          accessibilityLabel="Volver a miembros"
          style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
        >
          <AppIcon name="chevronLeft" size={15} color={colors.textMuted} />
          <Text style={styles.backLinkText}>Miembros</Text>
        </Pressable>

        {linkNotice ? <Text style={styles.linkNotice}>{linkNotice}</Text> : null}
        {actionError ? (
          <GymErrorBanner message={actionError} onRetry={() => setActionError(null)} />
        ) : null}

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{gymMemberInitials(member)}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{gymMemberFullName(member)}</Text>
            <Text style={styles.identityMeta}>
              {GYM_MEMBER_STATUS_LABELS[member.status]} · Alta {member.joinedAt}
            </Text>
          </View>
          {permissions.canOperate ? (
            <View style={styles.identityActions}>
              <Button title="Editar" variant="outline" size="compact" onPress={() => setEditing(true)} />
              {isGymPotentialMember(member.status) ? (
                <Button
                  title="Convertir en miembro"
                  variant="ghost"
                  size="compact"
                  onPress={() => void handleConvertToMember()}
                  loading={busy}
                />
              ) : member.status !== 'inactive' ? (
                <Button
                  title="Desactivar"
                  variant="ghost"
                  size="compact"
                  onPress={() => setPendingDeactivate(true)}
                />
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.tabs}>
          {TABS.map((option) => {
            const selected = tab === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setTab(option.key)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.tab,
                  selected && styles.tabActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'summary' ? (
          <View style={styles.panel}>
            <InfoRow label="Email" value={member.email ?? 'No indicado'} />
            <PhoneInfoRow phone={member.phone} onAddPhone={() => setEditing(true)} />
            <InfoRow label="Estado" value={GYM_MEMBER_STATUS_LABELS[member.status]} />
            <InfoRow label="Fecha de alta" value={member.joinedAt} />
            <InfoRow
              label="Tarifa activa"
              value={activeMembership?.planName ?? 'Sin tarifa asignada'}
            />
            <InfoRow label="Reservas totales" value={String(bookings.length)} />
            <InfoRow label="Asistencias" value={String(attended.length)} last />
          </View>
        ) : null}

        {tab === 'bookings' ? (
          bookings.length === 0 ? (
            <GymEmptyState icon="check" title="Sin reservas" text="Este miembro no tiene reservas todavía." />
          ) : (
            <View style={styles.list}>
              {bookings.map((booking) => (
                <View key={booking.id} style={styles.row}>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {booking.classTitle ?? 'Clase'}
                    </Text>
                    <Text style={styles.rowMeta}>{formatDateTime(booking.classStartAt)}</Text>
                  </View>
                  <Text style={styles.rowValue}>{GYM_BOOKING_STATUS_LABELS[booking.status]}</Text>
                </View>
              ))}
            </View>
          )
        ) : null}

        {tab === 'attendance' ? (
          attended.length === 0 ? (
            <GymEmptyState
              icon="streak"
              title="Sin asistencias registradas"
              text="Marca la asistencia desde la pantalla de reservas."
            />
          ) : (
            <View style={styles.list}>
              {attended.map((booking) => (
                <View key={booking.id} style={styles.row}>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {booking.classTitle ?? 'Clase'}
                    </Text>
                    <Text style={styles.rowMeta}>{formatDateTime(booking.checkedInAt)}</Text>
                  </View>
                  <AppIcon name="check" size={15} color="#4ADE80" />
                </View>
              ))}
            </View>
          )
        ) : null}

        {tab === 'membership' ? (
          <View>
            {memberBalance ? (
              <View style={styles.balanceCard}>
                <Text style={styles.balanceTitle}>Balance</Text>
                {memberBalance.reconciliation.hasWarnings ? (
                  <View style={styles.balanceWarningBanner}>
                    <AppIcon name="info" size={16} color="#B45309" />
                    <Text style={styles.balanceWarningText}>
                      Hay tarifas, compras o pagos que no cuadran entre sí.
                    </Text>
                  </View>
                ) : null}
                <View style={styles.balanceGrid}>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Tarifas asignadas</Text>
                    <Text style={styles.balanceValue}>{formatGymMoney(memberBalance.membershipCharges)}</Text>
                  </View>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Compras tienda</Text>
                    <Text style={styles.balanceValue}>{formatGymMoney(memberBalance.shopCharges)}</Text>
                  </View>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Pagos de tarifas</Text>
                    <Text style={[styles.balanceValue, styles.balanceValuePositive]}>
                      {formatGymMoney(memberBalance.membershipPayments)}
                    </Text>
                  </View>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Pagos de tienda</Text>
                    <Text style={[styles.balanceValue, styles.balanceValuePositive]}>
                      {formatGymMoney(memberBalance.shopPayments)}
                    </Text>
                  </View>
                </View>
                <View style={styles.balanceTotal}>
                  <Text style={styles.balanceTotalLabel}>Pendiente de cobro</Text>
                  <Text
                    style={[
                      styles.balanceTotalValue,
                      memberBalance.balanceDue > 0
                        ? styles.balanceTotalDue
                        : memberBalance.balanceDue < 0
                          ? styles.balanceTotalCredit
                          : styles.balanceTotalSettled,
                    ]}
                  >
                    {formatGymMoney(Math.abs(memberBalance.balanceDue))}
                    {memberBalance.balanceDue < 0 ? ' a favor' : ''}
                  </Text>
                </View>
              </View>
            ) : null}

            <CollapsibleSection
              title="Asignar tarifa"
              subtitle={
                memberships.length === 0
                  ? 'Sin membresía asignada'
                  : `${memberships.length} tarifa${memberships.length === 1 ? '' : 's'}`
              }
              style={styles.membershipSection}
              expanded={balanceSectionsOpen.tariffs}
              onExpandedChange={(open) =>
                setBalanceSectionsOpen((current) => ({ ...current, tariffs: open }))
              }
              autoExpand={membershipSectionWarning}
              tone={membershipSectionWarning ? 'warning' : 'default'}
              headerActions={
                <View style={styles.sectionHeaderActions}>
                  {permissions.canOperate && plans.length > 0 ? (
                    <Button
                      title="Seleccionar tarifa"
                      size="compact"
                      variant="outline"
                      onPress={() => setAssignPickerOpen(true)}
                    />
                  ) : null}
                  <Button
                    title="Actualizar"
                    size="compact"
                    variant="outline"
                    loading={refreshing}
                    onPress={() => void load({ silent: true })}
                  />
                </View>
              }
            >
              {memberships.length === 0 ? (
                <GymEmptyState
                  icon="programs"
                  title="Sin membresía"
                  text="Asigna una tarifa para controlar sus reservas y renovaciones."
                />
              ) : (
                <View style={styles.list}>
                  {memberships.map((membership) => {
                    const reconcile = memberBalance?.reconciliation.memberships[membership.id];
                    const isLinked = reconcile?.matched === true;
                    const hasWarning = reconcile && !reconcile.matched;
                    const plan = membership.planId ? planById.get(membership.planId) : undefined;
                    const chargeAmount = reconcile?.chargeAmount ?? plan?.price ?? 0;
                    const linkedPayment = reconcile?.paymentId
                      ? paidPayments.find((payment) => payment.id === reconcile.paymentId)
                      : null;
                    const isHighlighted =
                      highlightedRow?.section === 'tariffs' && highlightedRow.id === membership.id;

                    return (
                      <View
                        key={membership.id}
                        nativeID={memberRowDomId('tariffs', membership.id)}
                        style={[
                          styles.row,
                          isLinked && styles.rowMatched,
                          hasWarning && styles.rowWarning,
                          isHighlighted && styles.rowHighlighted,
                        ]}
                      >
                        {reconcile ? (
                          <View
                            style={[
                              styles.chargeStatusIcon,
                              isLinked && styles.chargeStatusIconMatched,
                              hasWarning && styles.chargeStatusIconWarning,
                            ]}
                          >
                            <AppIcon
                              name={isLinked ? 'check' : 'info'}
                              size={14}
                              color={isLinked ? '#16A34A' : '#B45309'}
                            />
                          </View>
                        ) : null}
                        <View style={styles.rowCopy}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {membership.planName ?? 'Tarifa'}
                          </Text>
                          <Text style={styles.rowMeta}>
                            {membership.endsAt
                              ? `Desde ${membership.startsAt} hasta ${membership.endsAt}`
                              : `Desde ${membership.startsAt}`}
                          </Text>
                          {reconcile?.warning ? (
                            <Text style={styles.reconcileWarning}>{reconcile.warning}</Text>
                          ) : linkedPayment ? (
                            <MemberReconcileLink
                              label={`Ver cobro · ${
                                linkedPayment.concept ?? formatGymMoney(linkedPayment.amount)
                              }`}
                              onPress={() => focusBalanceRow('payments', linkedPayment.id)}
                            />
                          ) : isLinked ? (
                            <Text style={styles.reconcileOk}>Vinculado con su pago</Text>
                          ) : null}
                        </View>
                        {chargeAmount > 0 ? (
                          <Text style={[styles.rowAmount, isLinked && styles.rowAmountMatched]}>
                            {formatGymMoney(chargeAmount)}
                          </Text>
                        ) : null}
                        <Text style={styles.rowValue}>
                          {GYM_MEMBERSHIP_STATUS_LABELS[membership.status]}
                        </Text>
                        {permissions.canOperate ? (
                          <View style={styles.rowIconActions}>
                            <Pressable
                              onPress={() => setEditingMembership(membership)}
                              accessibilityRole="button"
                              accessibilityLabel={`Editar tarifa ${membership.planName ?? ''}`}
                              hitSlop={6}
                              style={({ pressed }) => [styles.rowIconBtn, pressed && styles.pressed]}
                            >
                              <AppIcon name="edit" size={16} color={colors.textSecondary} />
                            </Pressable>
                            <Pressable
                              onPress={() => setPendingDeleteMembership(membership)}
                              accessibilityRole="button"
                              accessibilityLabel={`Eliminar tarifa ${membership.planName ?? ''}`}
                              hitSlop={6}
                              style={({ pressed }) => [styles.rowIconBtn, pressed && styles.pressed]}
                            >
                              <AppIcon name="trash" size={16} color={colors.danger} />
                            </Pressable>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              )}
            </CollapsibleSection>

            {shopSales.length > 0 ? (
              <CollapsibleSection
                title="Compras tienda"
                subtitle={`${shopSales.length} compra${shopSales.length === 1 ? '' : 's'}`}
                style={styles.membershipSection}
                expanded={balanceSectionsOpen.shop}
                onExpandedChange={(open) =>
                  setBalanceSectionsOpen((current) => ({ ...current, shop: open }))
                }
                autoExpand={shopSectionWarning}
                tone={shopSectionWarning ? 'warning' : 'default'}
              >
                <View style={styles.list}>
                  {shopSales.map((sale) => {
                    const reconcile = memberBalance?.reconciliation.shopSales[sale.id];
                    const isLinked = reconcile?.matched === true;
                    const hasWarning = reconcile && !reconcile.matched;
                    const chargeAmount = reconcile?.chargeAmount ?? (sale.unitPrice ?? 0) * sale.quantity;
                    const label = sale.productName ?? 'Producto tienda';
                    const linkedPayment = reconcile?.paymentId
                      ? paidPayments.find((payment) => payment.id === reconcile.paymentId)
                      : null;
                    const isHighlighted =
                      highlightedRow?.section === 'shop' && highlightedRow.id === sale.id;

                    return (
                      <View
                        key={sale.id}
                        nativeID={memberRowDomId('shop', sale.id)}
                        style={[
                          styles.row,
                          isLinked && styles.rowMatched,
                          hasWarning && styles.rowWarning,
                          isHighlighted && styles.rowHighlighted,
                        ]}
                      >
                        {reconcile ? (
                          <View
                            style={[
                              styles.chargeStatusIcon,
                              isLinked && styles.chargeStatusIconMatched,
                              hasWarning && styles.chargeStatusIconWarning,
                            ]}
                          >
                            <AppIcon
                              name={isLinked ? 'check' : 'info'}
                              size={14}
                              color={isLinked ? '#16A34A' : '#B45309'}
                            />
                          </View>
                        ) : null}
                        <View style={styles.rowCopy}>
                          <Text style={styles.rowTitle} numberOfLines={1}>{label}</Text>
                          <Text style={styles.rowMeta} numberOfLines={1}>
                            {sale.quantity > 1 ? `${sale.quantity} uds · ` : ''}
                            {sale.createdAt.slice(0, 10)}
                            {' · '}
                            {gymShopSalePaymentLabel(sale.note, gymMemberFullName(member))}
                          </Text>
                          {reconcile?.warning ? (
                            <Text style={styles.reconcileWarning}>{reconcile.warning}</Text>
                          ) : linkedPayment ? (
                            <MemberReconcileLink
                              label={`Ver cobro · ${
                                linkedPayment.concept ?? formatGymMoney(linkedPayment.amount)
                              }`}
                              onPress={() => focusBalanceRow('payments', linkedPayment.id)}
                            />
                          ) : isLinked ? (
                            <Text style={styles.reconcileOk}>Vinculado con su pago</Text>
                          ) : null}
                        </View>
                        <Text style={[styles.rowAmount, isLinked && styles.rowAmountMatched]}>
                          {formatGymMoney(chargeAmount)}
                        </Text>
                        {permissions.canOperate ? (
                          <View style={styles.rowIconActions}>
                            <Pressable
                              onPress={() => setEditingShopSale(sale)}
                              accessibilityRole="button"
                              accessibilityLabel={`Editar compra ${label}`}
                              hitSlop={6}
                              style={({ pressed }) => [styles.rowIconBtn, pressed && styles.pressed]}
                            >
                              <AppIcon name="edit" size={16} color={colors.textSecondary} />
                            </Pressable>
                            <Pressable
                              onPress={() => setPendingDeleteShopSale(sale)}
                              accessibilityRole="button"
                              accessibilityLabel={`Eliminar compra ${label}`}
                              hitSlop={6}
                              style={({ pressed }) => [styles.rowIconBtn, pressed && styles.pressed]}
                            >
                              <AppIcon name="trash" size={16} color={colors.danger} />
                            </Pressable>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </CollapsibleSection>
            ) : null}

            <CollapsibleSection
              title="Pagos del cliente"
              subtitle={
                pendingPayments.length > 0
                  ? `${pendingPayments.length} pendiente${pendingPayments.length === 1 ? '' : 's'}`
                  : paidPayments.length > 0
                    ? `${paidPayments.length} cobro${paidPayments.length === 1 ? '' : 's'}`
                    : 'Sin pagos registrados'
              }
              style={styles.membershipSection}
              expanded={balanceSectionsOpen.payments}
              onExpandedChange={(open) =>
                setBalanceSectionsOpen((current) => ({ ...current, payments: open }))
              }
              autoExpand={paymentsSectionWarning}
              tone={paymentsSectionWarning ? 'warning' : 'default'}
              headerActions={
                permissions.canOperate ? (
                  <Button
                    title="Registrar cobro"
                    size="compact"
                    variant="outline"
                    onPress={() =>
                      openPaymentForm(
                        activeMembership?.planName
                          ? { concept: `Cuota · ${activeMembership.planName}` }
                          : undefined,
                      )
                    }
                  />
                ) : null
              }
            >
              {pendingPayments.length > 0 ? (
                <View style={styles.paymentsList}>
                  {pendingPayments.map((payment, index) => (
                    <View
                      key={payment.id}
                      style={[styles.paymentRow, index > 0 && styles.paymentRowBorder]}
                    >
                      <View style={[styles.paymentIcon, styles.paymentIconPending]}>
                        <AppIcon name="time" size={14} color={colors.warning} />
                      </View>
                      <View style={styles.paymentCopy}>
                        <Text style={styles.paymentTitle} numberOfLines={1}>
                          {payment.dueLabel}
                        </Text>
                        <Text style={styles.paymentMeta} numberOfLines={1}>
                          {payment.planName} ·{' '}
                          {GYM_BILLING_PERIOD_LABELS[payment.billingPeriod].toLowerCase()}
                        </Text>
                      </View>
                      <Text style={styles.paymentAmountPending}>
                        {formatGymMoney(payment.amount)}
                      </Text>
                      {permissions.canOperate ? (
                        <Button
                          title="Cobrar"
                          size="compact"
                          onPress={() =>
                            openPaymentForm({
                              amount: String(payment.amount),
                              concept: `Cuota · ${payment.planName}`,
                            })
                          }
                        />
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}

              {paidPayments.length === 0 && pendingPayments.length === 0 ? (
                <GymEmptyState
                  icon="wallet"
                  title="Sin pagos registrados"
                  text="Los cobros que registres en el panel financiero o desde aquí aparecerán en esta lista."
                  action={
                    permissions.canOperate ? (
                      <Button
                        title="Registrar primer cobro"
                        variant="outline"
                        size="compact"
                        onPress={() => openPaymentForm()}
                      />
                    ) : undefined
                  }
                />
              ) : paidPayments.length > 0 ? (
                <View style={styles.paymentsList}>
                  {paidPayments.map((payment, index) => {
                    const reconcile = memberBalance?.reconciliation.payments[payment.id];
                    const isLinked = reconcile?.matched === true;
                    const hasWarning = reconcile && !reconcile.matched;
                    const linkedMembership =
                      memberBalance && isLinked
                        ? findLinkedMembershipForPayment(
                            payment.id,
                            memberships,
                            memberBalance.reconciliation,
                          )
                        : null;
                    const linkedShopSale =
                      memberBalance && isLinked
                        ? findLinkedShopSaleForPayment(
                            payment.id,
                            shopSales,
                            memberBalance.reconciliation,
                          )
                        : null;
                    const isHighlighted =
                      highlightedRow?.section === 'payments' && highlightedRow.id === payment.id;

                    return (
                      <View
                        key={payment.id}
                        nativeID={memberRowDomId('payments', payment.id)}
                        style={[
                          styles.paymentRow,
                          index > 0 && styles.paymentRowBorder,
                          isLinked && styles.paymentRowMatched,
                          hasWarning && styles.paymentRowWarning,
                          isHighlighted && styles.rowHighlighted,
                        ]}
                      >
                        <View
                          style={[
                            styles.paymentIcon,
                            isLinked && styles.paymentIconMatched,
                            hasWarning && styles.paymentIconWarning,
                          ]}
                        >
                          <AppIcon
                            name={isLinked ? 'check' : 'info'}
                            size={14}
                            color={isLinked ? '#16A34A' : '#B45309'}
                          />
                        </View>
                        <View style={styles.paymentCopy}>
                          <Text style={styles.paymentTitle} numberOfLines={1}>
                            {payment.concept || gymFinanceCategoryLabel(payment.kind, payment.category)}
                          </Text>
                          <Text style={styles.paymentMeta} numberOfLines={1}>
                            {gymFinanceCategoryLabel(payment.kind, payment.category)}
                            {payment.source === 'shop' ? ' · Tienda' : ''}
                            {` · ${formatFinanceEntryDate(payment.entryDate)}`}
                          </Text>
                          {reconcile?.warning ? (
                            <Text style={styles.reconcileWarning}>{reconcile.warning}</Text>
                          ) : linkedMembership ? (
                            <MemberReconcileLink
                              label={`Ver tarifa · ${linkedMembership.planName ?? 'Tarifa'}`}
                              onPress={() => focusBalanceRow('tariffs', linkedMembership.id)}
                            />
                          ) : linkedShopSale ? (
                            <MemberReconcileLink
                              label={`Ver compra · ${linkedShopSale.productName ?? 'Producto'}`}
                              onPress={() => focusBalanceRow('shop', linkedShopSale.id)}
                            />
                          ) : isLinked ? (
                            <Text style={styles.reconcileOk}>Vinculado con su tarifa o compra</Text>
                          ) : null}
                        </View>
                        <Text style={[styles.paymentAmount, isLinked && styles.paymentAmountMatched]}>
                          +{formatGymMoney(payment.amount)}
                        </Text>
                        {permissions.canOperate && canEditGymFinanceEntry(payment) ? (
                          <View style={styles.rowIconActions}>
                            <Pressable
                              onPress={() => openPaymentForm(undefined, payment)}
                              accessibilityRole="button"
                              accessibilityLabel={`Editar cobro ${payment.concept ?? ''}`}
                              hitSlop={6}
                              style={({ pressed }) => [styles.rowIconBtn, pressed && styles.pressed]}
                            >
                              <AppIcon name="edit" size={16} color={colors.textSecondary} />
                            </Pressable>
                            <Pressable
                              onPress={() => setPendingDeletePayment(payment)}
                              accessibilityRole="button"
                              accessibilityLabel={`Eliminar cobro ${payment.concept ?? ''}`}
                              hitSlop={6}
                              style={({ pressed }) => [styles.rowIconBtn, pressed && styles.pressed]}
                            >
                              <AppIcon name="trash" size={16} color={colors.danger} />
                            </Pressable>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </CollapsibleSection>
          </View>
        ) : null}

        {tab === 'notes' ? (
          <View style={styles.panel}>
            <Text style={styles.notesText}>
              {member.notes?.trim() || 'No hay notas internas sobre este miembro.'}
            </Text>
            {permissions.canOperate ? (
              <Button
                title="Editar notas"
                variant="outline"
                size="compact"
                onPress={() => setEditing(true)}
                style={styles.notesButton}
              />
            ) : null}
          </View>
        ) : null}

        {tab === 'activity' ? (
          activity.length === 0 ? (
            <GymEmptyState
              icon="stats"
              title="Sin movimientos"
              text="Todavía no hay actividad registrada para este miembro."
            />
          ) : (
            <View style={styles.list}>
              {activity.map((entry, index) => (
                <View
                  key={entry.id}
                  style={[styles.activityRow, index === activity.length - 1 && styles.activityRowLast]}
                >
                  <Text style={styles.activityDate}>{formatGymMemberActivityWhen(entry.at)}</Text>
                  <View style={styles.activityCopy}>
                    <Text style={[styles.activityLabel, activityToneStyle(entry.tone)]}>
                      {entry.label}
                    </Text>
                    {entry.detail ? <Text style={styles.activityDetail}>{entry.detail}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          )
        ) : null}

        <GymMemberFormModal
          visible={editing}
          member={member}
          onCancel={() => setEditing(false)}
          onSubmit={handleUpdate}
        />

        <GymMemberMembershipModal
          visible={Boolean(editingMembership)}
          membership={editingMembership}
          plans={plans}
          onCancel={() => setEditingMembership(null)}
          onSubmit={handleUpdateMembership}
        />

        <GymMemberPlanPickerModal
          visible={assignPickerOpen}
          plans={plans}
          onCancel={() => setAssignPickerOpen(false)}
          onSelect={(plan) => {
            setAssignPickerOpen(false);
            setAssigningPlan(plan);
          }}
        />

        <GymMemberAssignMembershipModal
          visible={Boolean(assigningPlan)}
          plan={assigningPlan}
          onCancel={() => setAssigningPlan(null)}
          onSubmit={handleAssignPlan}
        />

        <ConfirmModal
          visible={pendingDeactivate}
          title={`¿Desactivar a ${gymMemberFullName(member)}?`}
          message="Dejará de contar como miembro activo. Podrás volver a activarlo cuando quieras."
          confirmLabel="Desactivar"
          destructive
          busy={busy}
          onCancel={() => setPendingDeactivate(false)}
          onConfirm={() => void handleDeactivate()}
        />

        <ConfirmModal
          visible={Boolean(pendingDeleteMembership)}
          title="¿Eliminar esta tarifa?"
          message={
            pendingDeleteMembership
              ? `Se quitará "${pendingDeleteMembership.planName ?? 'la tarifa'}" de ${gymMemberFullName(member)}.`
              : ''
          }
          optionalCheckboxLabel={
            pendingDeleteMembershipPayment
              ? `También eliminar el pago vinculado (${pendingDeleteMembershipPayment.concept ?? 'Cuota'} · ${formatGymMoney(pendingDeleteMembershipPayment.amount)})`
              : undefined
          }
          confirmLabel="Eliminar"
          destructive
          busy={busy}
          onCancel={() => setPendingDeleteMembership(null)}
          onConfirm={(options) => void handleDeleteMembership(options)}
        />

        <MemberPaymentModal
          visible={paymentFormOpen}
          memberName={gymMemberFullName(member)}
          editing={Boolean(editingPayment)}
          initial={paymentPrefill}
          onCancel={closePaymentForm}
          onSubmit={handleSavePayment}
        />

        <ConfirmModal
          visible={Boolean(pendingDeletePayment)}
          title="¿Eliminar este cobro?"
          message={
            pendingDeletePayment
              ? `Se eliminará el pago de ${formatGymMoney(pendingDeletePayment.amount)}${
                  pendingDeletePayment.concept ? ` (${pendingDeletePayment.concept})` : ''
                }.`
              : ''
          }
          optionalCheckboxLabel={
            pendingDeletePaymentLinkedCharge
              ? `También eliminar ${pendingDeletePaymentLinkedCharge}`
              : undefined
          }
          confirmLabel="Eliminar"
          destructive
          busy={busy}
          onCancel={() => setPendingDeletePayment(null)}
          onConfirm={(options) => void handleDeletePayment(options)}
        />

        <GymMemberShopSaleModal
          visible={Boolean(editingShopSale)}
          sale={editingShopSale}
          memberName={gymMemberFullName(member)}
          onCancel={() => setEditingShopSale(null)}
          onSubmit={handleUpdateShopSale}
        />

        <ConfirmModal
          visible={Boolean(pendingDeleteShopSale)}
          title="¿Eliminar esta compra?"
          message={
            pendingDeleteShopSale
              ? `Se eliminará "${pendingDeleteShopSale.productName ?? 'la compra'}" y se devolverá el stock al inventario.`
              : ''
          }
          optionalCheckboxLabel={
            pendingDeleteShopSalePayment
              ? `También eliminar el pago vinculado (${pendingDeleteShopSalePayment.concept ?? 'Tienda'} · ${formatGymMoney(pendingDeleteShopSalePayment.amount)})`
              : undefined
          }
          confirmLabel="Eliminar"
          destructive
          busy={busy}
          onCancel={() => setPendingDeleteShopSale(null)}
          onConfirm={(options) => void handleDeleteShopSale(options)}
        />
      </ScreenWrapper>
    </GymScreen>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function PhoneInfoRow({
  phone,
  last = false,
  onAddPhone,
}: {
  phone?: string;
  last?: boolean;
  onAddPhone?: () => void;
}) {
  const whatsappUrl = getWhatsAppUrl(phone);
  const display = phone?.trim() || 'No indicado';
  const hasPhone = Boolean(whatsappUrl);

  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <View style={styles.phoneLabelRow}>
        <Text style={[styles.infoLabel, styles.infoLabelInline]}>Teléfono</Text>
        <Pressable
          onPress={() => {
            if (whatsappUrl) void openExternalUrl(whatsappUrl);
            else onAddPhone?.();
          }}
          accessibilityRole="link"
          accessibilityLabel={
            hasPhone ? `Abrir WhatsApp de ${display}` : 'Añadir teléfono para WhatsApp'
          }
          hitSlop={8}
          style={({ pressed }) => [
            styles.whatsappBtn,
            !hasPhone && styles.whatsappBtnDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="logo-whatsapp"
            size={20}
            color={hasPhone ? '#25D366' : colors.textMuted}
          />
        </Pressable>
      </View>
      <Text style={styles.infoValue}>{display}</Text>
    </View>
  );
}

function activityToneStyle(tone?: GymMemberActivityTone) {
  if (tone === 'success') return styles.activityLabelSuccess;
  if (tone === 'warning') return styles.activityLabelWarning;
  if (tone === 'muted') return styles.activityLabelMuted;
  return null;
}

function todayKey() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function MemberPaymentModal({
  visible,
  memberName,
  editing = false,
  initial,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  memberName: string;
  editing?: boolean;
  initial?: { amount?: string; concept?: string; entryDate?: string } | null;
  onCancel: () => void;
  onSubmit: (input: {
    amount: number;
    entryDate: string;
    concept?: string;
  }) => Promise<{ error?: string }>;
}) {
  const [amount, setAmount] = useState('');
  const [entryDate, setEntryDate] = useState(todayKey());
  const [concept, setConcept] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setAmount(initial?.amount ?? '');
    setEntryDate(initial?.entryDate ?? todayKey());
    setConcept(initial?.concept ?? '');
    setError(null);
  }, [initial, visible]);

  const handleSubmit = async () => {
    const parsed = Number(amount.trim().replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Indica un importe válido.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
      setError('Indica una fecha válida (AAAA-MM-DD).');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      amount: parsed,
      entryDate,
      concept: concept.trim() || undefined,
    });
    setSaving(false);
    if (result.error) setError(result.error);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{editing ? 'Editar cobro' : 'Registrar cobro'}</Text>
          <Text style={styles.modalSubtitle}>
            {editing
              ? `Actualiza el cobro de ${memberName}.`
              : `El pago quedará registrado para ${memberName} en el panel financiero.`}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Input
              label="Importe (€)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0,00"
            />
            <Input
              label="Fecha"
              value={entryDate}
              onChangeText={setEntryDate}
              placeholder="AAAA-MM-DD"
              autoCapitalize="none"
            />
            <Input
              label="Concepto"
              value={concept}
              onChangeText={setConcept}
              placeholder="Cuota · HY-PE UNLIMITED"
            />
          </ScrollView>
          {error ? <Text style={styles.modalError}>{error}</Text> : null}
          <View style={styles.modalActions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.modalBtn} />
            <Button
              title="Guardar"
              onPress={() => void handleSubmit()}
              loading={saving}
              style={styles.modalBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  backLinkText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  linkNotice: {
    ...typography.caption,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.8 },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accentBlue, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  identityCopy: {
    flex: 1,
    minWidth: 180,
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  identityMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  identityActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  tabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.black,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  infoLabelInline: {
    flex: 0,
  },
  phoneLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  whatsappBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha('#25D366', '14'),
    borderWidth: 1,
    borderColor: withAlpha('#25D366', '28'),
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  whatsappBtnDisabled: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  infoValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'right',
  },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  chargeGroup: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chargeGroupLast: {
    borderBottomWidth: 0,
  },
  rowCharge: {
    borderBottomWidth: 0,
  },
  rowAmount: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    flexShrink: 0,
  },
  rowAmountMatched: {
    color: '#16A34A',
  },
  tariffsBlock: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  membershipSection: {
    marginTop: spacing.md,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowWarning: {
    backgroundColor: withAlpha('#FACC15', '14'),
    borderBottomColor: withAlpha('#FACC15', '35'),
  },
  rowMatched: {
    backgroundColor: withAlpha('#16A34A', '10'),
    borderBottomColor: withAlpha('#16A34A', '28'),
  },
  chargeStatusIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chargeStatusIconMatched: {
    backgroundColor: withAlpha('#16A34A', '14'),
  },
  chargeStatusIconWarning: {
    backgroundColor: withAlpha('#FACC15', '22'),
  },
  reconcileWarning: {
    ...typography.caption,
    color: '#B45309',
    marginTop: 4,
    fontWeight: '600',
    lineHeight: 16,
  },
  reconcileOk: {
    ...typography.caption,
    color: '#16A34A',
    marginTop: 4,
    fontWeight: '600',
  },
  reconcileLink: {
    ...typography.caption,
    color: colors.accentBlue,
    marginTop: 4,
    fontWeight: '700',
    textDecorationLine: Platform.OS === 'web' ? 'underline' : 'none',
  },
  rowHighlighted: {
    backgroundColor: withAlpha(colors.accentBlue, '18'),
    borderBottomColor: withAlpha(colors.accentBlue, '40'),
  },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  rowMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  rowValue: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  rowIconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rowIconBtn: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  assignBlock: {
    marginTop: spacing.md,
  },
  shopBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  balanceCard: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  balanceTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceWarningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withAlpha('#FACC15', '55'),
    backgroundColor: withAlpha('#FACC15', '18'),
  },
  balanceWarningText: {
    ...typography.caption,
    color: '#B45309',
    flex: 1,
    lineHeight: 18,
    fontWeight: '600',
  },
  balanceGrid: {
    gap: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  balanceLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  balanceValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  balanceValuePositive: {
    color: '#16A34A',
  },
  balanceTotal: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  balanceTotalLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  balanceTotalValue: {
    ...typography.bodySmall,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  balanceTotalDue: {
    color: colors.warning,
  },
  balanceTotalCredit: {
    color: '#16A34A',
  },
  balanceTotalSettled: {
    color: colors.textSecondary,
  },
  assignTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  paymentsBlock: {
    marginTop: spacing.lg,
  },
  paymentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  paymentsList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  paymentsSubheading: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    backgroundColor: colors.surface,
  },
  paymentRowNested: {
    paddingLeft: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: withAlpha(colors.surfaceLight, '80'),
  },
  paymentRowWarning: {
    backgroundColor: withAlpha('#FACC15', '14'),
  },
  paymentRowMatched: {
    backgroundColor: withAlpha('#16A34A', '10'),
  },
  paymentRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha('#16A34A', '14'),
    flexShrink: 0,
  },
  paymentIconWarning: {
    backgroundColor: withAlpha('#FACC15', '22'),
  },
  paymentIconMatched: {
    backgroundColor: withAlpha('#16A34A', '14'),
  },
  paymentIconPending: {
    backgroundColor: withAlpha(colors.warning, '14'),
  },
  paymentCopy: {
    flex: 1,
    minWidth: 0,
  },
  paymentTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  paymentMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  paymentAmount: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
  paymentAmountMatched: {
    color: '#16A34A',
  },
  paymentAmountPending: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  modalError: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalBtn: {
    flex: 1,
  },
  notesText: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
    paddingVertical: spacing.md,
  },
  notesButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  activityRowLast: {
    borderBottomWidth: 0,
  },
  activityDate: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    width: 108,
    flexShrink: 0,
    paddingTop: 1,
  },
  activityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  activityLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  activityLabelSuccess: {
    color: '#4ADE80',
  },
  activityLabelWarning: {
    color: colors.warning,
  },
  activityLabelMuted: {
    color: colors.textSecondary,
  },
  activityDetail: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  skeletonSpacer: { marginTop: spacing.sm },
  skeletonBlocks: { marginTop: spacing.lg, gap: spacing.sm },
});
