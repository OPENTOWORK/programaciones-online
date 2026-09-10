import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GymClassSlotsGrid } from '@/components/gym/GymClassSlotsGrid';
import { GymAthleteChatPanel } from '@/components/gym/GymAthleteChatPanel';
import { ShopProductThumbnail } from '@/components/gym/ShopProductThumbnail';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  bookAthleteGymClass,
  cancelAthleteGymBooking,
  fetchAthleteGymPortal,
  purchaseAthleteGymMembership,
} from '@/lib/athleteGymService';
import { GYM_BILLING_PERIOD_LABELS, GYM_BOOKING_STATUS_LABELS, GYM_MEMBERSHIP_STATUS_LABELS } from '@/lib/gymTypes';
import { isSameCalendarDay } from '@/lib/appointmentSchedule';
import { formatGymMoney, isGymProductService } from '@/lib/gymShopService';
import type { GymBooking, GymClass, GymMembershipPlan, GymProduct } from '@/lib/gymTypes';
import type { GymClassRoster } from '@/lib/athleteGymService';

type PortalTab = 'classes' | 'billing' | 'shop' | 'chat';

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toIsoRange(weekStart: Date) {
  const from = weekStart.toISOString();
  const to = addDays(weekStart, 7).toISOString();
  return { from, to };
}


function formatClassTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isDateInWeek(date: Date, weekStart: Date) {
  const start = startOfDay(weekStart).getTime();
  const end = addDays(weekStart, 7).getTime();
  const value = startOfDay(date).getTime();
  return value >= start && value < end;
}

function defaultDayForWeek(weekStart: Date) {
  const today = startOfDay(new Date());
  if (isDateInWeek(today, weekStart)) return today;
  return startOfDay(weekStart);
}

function formatDayChip(date: Date) {
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
}

function formatSelectedDayLabel(date: Date) {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatWeekLabel(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  const startLabel = weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const endLabel = weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `${startLabel} – ${endLabel}`;
}

function bookingForClass(bookings: GymBooking[], classId: string) {
  return bookings.find(
    (booking) =>
      booking.classId === classId &&
      booking.status !== 'cancelled' &&
      booking.status !== 'no_show',
  );
}

function MembershipPlanCard({
  plan,
  isCurrent,
  busy,
  onPurchase,
}: {
  plan: GymMembershipPlan;
  isCurrent: boolean;
  busy: boolean;
  onPurchase: () => void;
}) {
  const purchasable = plan.price != null && plan.price > 0;

  return (
    <Card style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
      <View style={styles.planHeader}>
        <View style={styles.planCopy}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.description ? <Text style={styles.planDescription}>{plan.description}</Text> : null}
          <Text style={styles.planPrice}>
            {plan.price != null ? formatGymMoney(plan.price) : 'Consultar'}
            {plan.price != null ? ` · ${GYM_BILLING_PERIOD_LABELS[plan.billingPeriod]}` : ''}
          </Text>
        </View>
        {isCurrent ? (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Actual</Text>
          </View>
        ) : null}
      </View>

      {purchasable ? (
        <Button
          title={isCurrent ? 'Renovar tarifa' : `Pagar ${formatGymMoney(plan.price!)}`}
          size="compact"
          loading={busy}
          onPress={onPurchase}
        />
      ) : (
        <Text style={styles.planContactHint}>Pregunta en recepción el precio de esta tarifa.</Text>
      )}
    </Card>
  );
}

function ShopProductCard({ product }: { product: GymProduct }) {
  const service = isGymProductService(product);
  const available = service || product.stock > 0;

  return (
    <Card style={styles.shopCard}>
      <ShopProductThumbnail product={product} size={88} style={styles.shopImage} />
      <View style={styles.shopCopy}>
        <Text style={styles.shopName}>{product.name}</Text>
        {product.description ? <Text style={styles.shopDescription}>{product.description}</Text> : null}
        <Text style={styles.shopPrice}>{formatGymMoney(product.price)}</Text>
        <Text style={[styles.shopStock, !available && styles.shopStockOut]}>
          {service
            ? 'Disponible'
            : available
              ? `${product.stock} ${product.unit} disponibles`
              : 'Agotado'}
        </Text>
      </View>
    </Card>
  );
}

function ClassRow({
  gymClass,
  roster,
  booking,
  canBook,
  busy,
  onBook,
  onCancel,
}: {
  gymClass: GymClass;
  roster?: GymClassRoster;
  booking?: GymBooking;
  canBook: boolean;
  busy: boolean;
  onBook: () => void;
  onCancel: () => void;
}) {
  const title = gymClass.title || gymClass.classTypeName || 'Clase';
  const full = gymClass.bookedCount >= gymClass.capacity;
  const waitingCount = roster?.waiting.length ?? gymClass.waitingCount ?? 0;
  const waitPosition =
    booking?.status === 'waiting'
      ? (roster?.waiting.findIndex((slot) => slot.bookingId === booking.id) ?? -1) + 1
      : 0;

  return (
    <Card style={styles.classCard}>
      <View style={styles.classHeader}>
        <Text style={styles.classTime}>{formatClassTime(gymClass.startAt)}</Text>
        <View style={styles.classHeaderBody}>
          <Text style={styles.classTitle}>{title}</Text>
          {gymClass.coachName ? <Text style={styles.classCoach}>{gymClass.coachName}</Text> : null}
          {full ? <Text style={styles.classFull}>Clase completa</Text> : null}
          {waitingCount > 0 ? (
            <Text style={styles.classWaitingMeta}>
              Lista de espera · {waitingCount} {waitingCount === 1 ? 'persona' : 'personas'}
            </Text>
          ) : null}
          {booking ? (
            <View style={styles.bookingBadge}>
              <Text style={styles.bookingBadgeText}>
                {booking.status === 'waiting' && waitPosition > 0
                  ? `Lista de espera · puesto ${waitPosition}`
                  : GYM_BOOKING_STATUS_LABELS[booking.status]}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <GymClassSlotsGrid roster={roster} capacity={gymClass.capacity} />

      {canBook ? (
        booking ? (
          <Button
            title={booking.status === 'waiting' ? 'Salir de la lista de espera' : 'Cancelar reserva'}
            variant="secondary"
            size="compact"
            loading={busy}
            onPress={onCancel}
          />
        ) : (
          <Button
            title={full ? 'Apuntarme a lista de espera' : 'Reservar plaza'}
            size="compact"
            loading={busy}
            onPress={onBook}
          />
        )
      ) : (
        <Text style={styles.blockedHint}>Tu membresía no permite reservar. Contacta con recepción.</Text>
      )}
    </Card>
  );
}

export default function AthleteGymPortalScreen() {
  const router = useRouter();
  const { gymId } = useLocalSearchParams<{ gymId: string }>();
  const [tab, setTab] = useState<PortalTab>('classes');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => defaultDayForWeek(startOfWeek(new Date())));
  const [portal, setPortal] = useState<Awaited<ReturnType<typeof fetchAthleteGymPortal>>['data']>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyClassId, setBusyClassId] = useState<string | null>(null);
  const [pendingCancel, setPendingCancel] = useState<GymBooking | null>(null);
  const [pendingPlan, setPendingPlan] = useState<GymMembershipPlan | null>(null);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    const result = await fetchAthleteGymPortal(gymId, toIsoRange(weekStart));
    setIsLoading(false);

    if (result.error || !result.data) {
      setError(result.error ?? 'No se pudo cargar el gimnasio.');
      setPortal(undefined);
      return;
    }

    setError(null);
    setPortal(result.data);
  }, [gymId, weekStart]);

  useEffect(() => {
    void load();
  }, [load]);

  const canBook = portal?.linked.member.status === 'active';
  const activeMembership = useMemo(
    () => portal?.memberships.find((item) => item.status === 'active'),
    [portal?.memberships],
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const classesForDay = useMemo(() => {
    if (!portal) return [] as GymClass[];
    return portal.classes
      .filter((gymClass) => isSameCalendarDay(new Date(gymClass.startAt), selectedDay))
      .sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime());
  }, [portal, selectedDay]);

  const shiftWeek = (delta: number) => {
    const nextWeekStart = addDays(weekStart, delta * 7);
    setWeekStart(nextWeekStart);
    setSelectedDay(defaultDayForWeek(nextWeekStart));
  };

  const shiftDay = (delta: number) => {
    const nextDay = addDays(selectedDay, delta);
    if (!isDateInWeek(nextDay, weekStart)) {
      const nextWeekStart = addDays(weekStart, delta * 7);
      setWeekStart(nextWeekStart);
    }
    setSelectedDay(startOfDay(nextDay));
  };

  const handleBook = async (gymClass: GymClass) => {
    if (!portal || !gymId) return;

    setBusyClassId(gymClass.id);
    setNotice(null);
    const result = await bookAthleteGymClass({
      gymId,
      memberId: portal.linked.member.id,
      classId: gymClass.id,
    });
    setBusyClassId(null);

    if (result.error) {
      setNotice(result.error);
      return;
    }

    setNotice(
      result.data?.status === 'waiting'
        ? 'Estás en lista de espera. Si alguien cancela, ocuparás su plaza automáticamente.'
        : 'Reserva confirmada.',
    );
    void load();
  };

  const handleCancel = async () => {
    if (!pendingCancel) return;

    setBusyClassId(pendingCancel.classId);
    const result = await cancelAthleteGymBooking(pendingCancel.id);
    setBusyClassId(null);
    setPendingCancel(null);

    if (result.error) {
      setNotice(result.error);
      return;
    }

    const wasWaiting = pendingCancel.status === 'waiting';
    setNotice(
      wasWaiting
        ? 'Has salido de la lista de espera.'
        : 'Reserva cancelada. Si había lista de espera, el primero ha ocupado la plaza.',
    );
    void load();
  };

  const handlePurchasePlan = async () => {
    if (!portal || !gymId || !pendingPlan) return;

    setBusyPlanId(pendingPlan.id);
    const result = await purchaseAthleteGymMembership({
      gymId,
      planId: pendingPlan.id,
    });
    setBusyPlanId(null);
    setPendingPlan(null);

    if (result.error) {
      setNotice(result.error);
      return;
    }

    setNotice(`Tarifa "${pendingPlan.name}" contratada. Ya puedes reservar clases.`);
    void load();
  };

  if (!gymId) {
    return (
      <ScreenWrapper>
        <Text style={styles.errorText}>No se encontró el gimnasio.</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Volver"
        style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        <Text style={styles.backText}>Volver al inicio</Text>
      </Pressable>

      {isLoading && !portal ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : error ? (
        <Card>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      ) : portal ? (
        <>
          <View style={styles.hero}>
            <Text style={styles.gymName}>{portal.linked.gym.name}</Text>
            {portal.linked.gym.city ? (
              <Text style={styles.gymCity}>{portal.linked.gym.city}</Text>
            ) : null}
          </View>

          <View style={styles.tabs}>
            <Pressable
              onPress={() => setTab('classes')}
              style={[styles.tab, tab === 'classes' && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === 'classes' && styles.tabTextActive]}>Clases</Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('billing')}
              style={[styles.tab, tab === 'billing' && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === 'billing' && styles.tabTextActive]}>Tarifa</Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('shop')}
              style={[styles.tab, tab === 'shop' && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === 'shop' && styles.tabTextActive]}>Tienda</Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('chat')}
              style={[styles.tab, tab === 'chat' && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === 'chat' && styles.tabTextActive]}>Chat</Text>
            </Pressable>
          </View>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          {tab === 'classes' ? (
            <View style={styles.section}>
              <View style={styles.weekNav}>
                <Pressable
                  onPress={() => shiftWeek(-1)}
                  accessibilityLabel="Semana anterior"
                  style={({ pressed }) => [styles.weekBtn, pressed && styles.pressed]}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </Pressable>
                <Text style={styles.weekLabel}>{formatWeekLabel(weekStart)}</Text>
                <Pressable
                  onPress={() => shiftWeek(1)}
                  accessibilityLabel="Semana siguiente"
                  style={({ pressed }) => [styles.weekBtn, pressed && styles.pressed]}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.dayStrip}>
                {weekDays.map((day) => {
                  const selected = isSameCalendarDay(day, selectedDay);
                  const hasClasses = portal.classes.some((gymClass) =>
                    isSameCalendarDay(new Date(gymClass.startAt), day),
                  );

                  return (
                    <Pressable
                      key={day.toISOString()}
                      onPress={() => setSelectedDay(startOfDay(day))}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={formatSelectedDayLabel(day)}
                      style={({ pressed }) => [
                        styles.dayChip,
                        selected && styles.dayChipActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.dayChipWeekday, selected && styles.dayChipTextActive]}>
                        {formatDayChip(day)}
                      </Text>
                      <Text style={[styles.dayChipDate, selected && styles.dayChipTextActive]}>
                        {day.getDate()}
                      </Text>
                      {hasClasses ? (
                        <View style={[styles.dayChipDot, selected && styles.dayChipDotActive]} />
                      ) : (
                        <View style={styles.dayChipDotSpacer} />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.selectedDayLabel}>{formatSelectedDayLabel(selectedDay)}</Text>

              {isLoading ? (
                <ActivityIndicator color={colors.accent} style={styles.inlineLoader} />
              ) : classesForDay.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No hay clases este día</Text>
                  <Text style={styles.emptyText}>Prueba otro día de la semana o pregunta en recepción.</Text>
                </Card>
              ) : (
                <View style={styles.classList}>
                  {classesForDay.map((gymClass) => (
                    <ClassRow
                      key={gymClass.id}
                      gymClass={gymClass}
                      roster={portal.rosters[gymClass.id]}
                      booking={bookingForClass(portal.bookings, gymClass.id)}
                      canBook={canBook}
                      busy={busyClassId === gymClass.id}
                      onBook={() => void handleBook(gymClass)}
                      onCancel={() => {
                        const booking = bookingForClass(portal.bookings, gymClass.id);
                        if (booking) setPendingCancel(booking);
                      }}
                    />
                  ))}
                </View>
              )}

              <View style={styles.dayNav}>
                <Button
                  title="Día anterior"
                  variant="secondary"
                  size="compact"
                  onPress={() => shiftDay(-1)}
                  style={styles.dayNavButton}
                />
                <Button
                  title="Día siguiente"
                  variant="secondary"
                  size="compact"
                  onPress={() => shiftDay(1)}
                  style={styles.dayNavButton}
                />
              </View>
            </View>
          ) : tab === 'billing' ? (
            <View style={styles.section}>
              <Card style={styles.billingCard}>
                <Text style={styles.billingLabel}>Tu tarifa actual</Text>
                {activeMembership ? (
                  <>
                    <Text style={styles.billingValue}>
                      {activeMembership.planName ?? 'Membresía activa'}
                    </Text>
                    <Text style={styles.billingMeta}>
                      {GYM_MEMBERSHIP_STATUS_LABELS[activeMembership.status]}
                      {activeMembership.endsAt
                        ? ` · Hasta ${new Date(`${activeMembership.endsAt}T12:00:00`).toLocaleDateString('es-ES')}`
                        : ''}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.billingValue}>Sin tarifa activa</Text>
                    <Text style={styles.billingMeta}>
                      Contrata una tarifa abajo para poder reservar clases.
                    </Text>
                  </>
                )}
              </Card>

              {portal.plans.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons name="card-outline" size={28} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>Sin tarifas publicadas</Text>
                  <Text style={styles.emptyText}>
                    El gimnasio aún no ha publicado tarifas en la app. Pregunta en recepción.
                  </Text>
                </Card>
              ) : (
                <>
                  <Text style={styles.plansTitle}>Elige tu tarifa</Text>
                  <View style={styles.planList}>
                    {portal.plans.map((plan) => (
                      <MembershipPlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrent={activeMembership?.planId === plan.id}
                        busy={busyPlanId === plan.id}
                        onPurchase={() => setPendingPlan(plan)}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>
          ) : tab === 'shop' ? (
            <View style={styles.section}>
              {portal.products.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons name="bag-handle-outline" size={28} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>Tienda sin productos</Text>
                </Card>
              ) : (
                <View style={styles.shopList}>
                  {portal.products.map((product) => (
                    <ShopProductCard key={product.id} product={product} />
                  ))}
                  <Card style={styles.paymentHint}>
                    <Ionicons name="storefront-outline" size={22} color={colors.accent} />
                    <Text style={styles.paymentHintText}>
                      Compra en recepción. Pronto podrás pagar desde la app.
                    </Text>
                  </Card>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.section}>
              <GymAthleteChatPanel
                gymId={gymId}
                memberId={portal.linked.member.id}
                gymName={portal.linked.gym.name}
              />
            </View>
          )}
        </>
      ) : null}

      <ConfirmModal
        visible={Boolean(pendingCancel)}
        title="Cancelar reserva"
        message="¿Seguro que quieres cancelar esta reserva?"
        confirmLabel="Sí, cancelar"
        onConfirm={() => void handleCancel()}
        onCancel={() => setPendingCancel(null)}
      />

      <ConfirmModal
        visible={Boolean(pendingPlan)}
        title="Confirmar pago"
        message={
          pendingPlan
            ? `Vas a contratar "${pendingPlan.name}" por ${formatGymMoney(pendingPlan.price ?? 0)} (${GYM_BILLING_PERIOD_LABELS[pendingPlan.billingPeriod].toLowerCase()}).`
            : undefined
        }
        confirmLabel={
          pendingPlan?.price != null ? `Pagar ${formatGymMoney(pendingPlan.price)}` : 'Confirmar'
        }
        busy={Boolean(busyPlanId)}
        onConfirm={() => void handlePurchasePlan()}
        onCancel={() => setPendingPlan(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.85,
  },
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  hero: {
    marginBottom: spacing.md,
    gap: 4,
  },
  gymName: {
    ...typography.h2,
    color: colors.text,
  },
  gymCity: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  tabTextActive: {
    color: colors.black,
  },
  notice: {
    ...typography.caption,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  weekBtn: {
    padding: spacing.xs,
  },
  weekLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dayStrip: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayChipWeekday: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  dayChipDate: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  dayChipTextActive: {
    color: colors.black,
  },
  dayChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
  dayChipDotActive: {
    backgroundColor: colors.black,
  },
  dayChipDotSpacer: {
    width: 6,
    height: 6,
    marginTop: 2,
  },
  selectedDayLabel: {
    ...typography.h3,
    color: colors.text,
    textTransform: 'capitalize',
    marginBottom: spacing.sm,
  },
  dayNav: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dayNavButton: {
    flex: 1,
  },
  inlineLoader: {
    marginVertical: spacing.lg,
  },
  classList: {
    gap: spacing.sm,
  },
  classCard: {
    gap: spacing.md,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  classHeaderBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  classTitle: {
    ...typography.h3,
    color: colors.text,
    flexShrink: 1,
  },
  classTime: {
    ...typography.h3,
    color: colors.accent,
    fontWeight: '700',
    minWidth: 52,
  },
  classCoach: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  classFull: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
  },
  classWaitingMeta: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  bookingBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accentBlue, '22'),
  },
  bookingBadgeText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  blockedHint: {
    ...typography.caption,
    color: colors.warning,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  billingCard: {
    gap: spacing.xs,
  },
  billingLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  billingValue: {
    ...typography.h3,
    color: colors.text,
  },
  billingMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  plansTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  planList: {
    gap: spacing.sm,
  },
  planCard: {
    gap: spacing.md,
  },
  planCardCurrent: {
    borderColor: withAlpha(colors.accent, '66'),
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  planCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  planName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  planDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  planPrice: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  planContactHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  currentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accent, '22'),
  },
  currentBadgeText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  paymentHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  paymentHintText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  shopList: {
    gap: spacing.sm,
  },
  shopCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  shopImage: {
    width: 88,
    height: 88,
  },
  shopCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  shopName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  shopDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  shopPrice: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  shopStock: {
    ...typography.caption,
    color: colors.textMuted,
  },
  shopStockOut: {
    color: colors.warning,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
});
