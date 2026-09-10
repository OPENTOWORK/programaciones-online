import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/athleteService';
import {
  GYM_ADMIN_ACTION_LABELS,
  fetchGymAdminActivity,
  fetchGymSaasPlans,
  logGymAdminActivity,
  updateGymSubscription,
} from '@/lib/gymAdminService';
import {
  fetchGym,
  fetchGymDashboardStats,
  fetchGymStaff,
  fetchGymSubscription,
  updateGym,
} from '@/lib/gymService';
import {
  GYM_STATUS_LABELS,
  GYM_SUBSCRIPTION_STATUS_LABELS,
  GYM_USER_ROLE_LABELS,
  type Gym,
  type GymAdminActivityEntry,
  type GymDashboardStats,
  type GymSaasPlan,
  type GymStatus,
  type GymSubscription,
  type GymSubscriptionStatus,
  type GymUser,
} from '@/lib/gymTypes';
import { safeGoBack } from '@/lib/navigation';

type GymTab = 'summary' | 'analytics' | 'membership' | 'settings' | 'users' | 'activity';

const TABS: Array<{ key: GymTab; label: string }> = [
  { key: 'summary', label: 'Resumen' },
  { key: 'analytics', label: 'Analíticas' },
  { key: 'membership', label: 'Membresía' },
  { key: 'settings', label: 'Configuración' },
  { key: 'users', label: 'Usuarios' },
  { key: 'activity', label: 'Actividad' },
];

const STATUS_ORDER: GymStatus[] = ['active', 'trial', 'suspended', 'cancelled'];
const SUBSCRIPTION_STATUS_ORDER: GymSubscriptionStatus[] = [
  'trial',
  'active',
  'past_due',
  'suspended',
  'cancelled',
];

export default function AdminGymDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [gym, setGym] = useState<Gym | null>(null);
  const [stats, setStats] = useState<GymDashboardStats | null>(null);
  const [subscription, setSubscription] = useState<GymSubscription | null>(null);
  const [plans, setPlans] = useState<GymSaasPlan[]>([]);
  const [staff, setStaff] = useState<GymUser[]>([]);
  const [activity, setActivity] = useState<GymAdminActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<GymTab>('summary');
  const [busy, setBusy] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<GymStatus | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    const gymResult = await fetchGym(id);

    if (gymResult.error || !gymResult.data) {
      setGym(null);
      setError(gymResult.error ?? 'No se pudo cargar el gimnasio.');
      setIsLoading(false);
      return;
    }

    const [statsResult, subscriptionResult, plansResult, staffResult, activityResult] =
      await Promise.all([
        fetchGymDashboardStats(id),
        fetchGymSubscription(id),
        fetchGymSaasPlans(),
        fetchGymStaff(id),
        fetchGymAdminActivity(id),
      ]);

    setGym(gymResult.data);
    setStats(statsResult.data ?? null);
    setSubscription(subscriptionResult.data ?? null);
    setPlans(plansResult.data ?? []);
    setStaff(staffResult.data ?? []);
    setActivity(activityResult.data ?? []);
    setError(null);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isAdminRole(user?.role)) {
    return <Redirect href="/tabs/trainer" />;
  }

  const applyStatus = async (status: GymStatus) => {
    if (!id || !gym) return;

    setBusy(true);
    const result = await updateGym(id, { status });
    if (!result.error) {
      await logGymAdminActivity({
        gymId: id,
        action: 'status_changed',
        detail: `Estado cambiado a ${GYM_STATUS_LABELS[status]}`,
      });
    }
    setBusy(false);
    setPendingStatus(null);

    if (result.error) setError(result.error);
    else await load();
  };

  const applyPlan = async (planId: string) => {
    if (!id) return;

    setBusy(true);
    const result = await updateGymSubscription(id, { planId });
    if (!result.error) {
      const planName = plans.find((plan) => plan.id === planId)?.name ?? 'plan';
      await logGymAdminActivity({
        gymId: id,
        action: 'plan_changed',
        detail: `Plan cambiado a ${planName}`,
      });
    }
    setBusy(false);

    if (result.error) setError(result.error);
    else await load();
  };

  const applySubscriptionStatus = async (status: GymSubscriptionStatus) => {
    if (!id) return;

    setBusy(true);
    const result = await updateGymSubscription(id, { status });
    if (!result.error) {
      await logGymAdminActivity({
        gymId: id,
        action: 'subscription_changed',
        detail: `Suscripción: ${GYM_SUBSCRIPTION_STATUS_LABELS[status]}`,
      });
    }
    setBusy(false);

    if (result.error) setError(result.error);
    else await load();
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <SkeletonBlock height={24} width="42%" />
        <SkeletonBlock height={14} width="28%" style={styles.spacer} />
        <View style={styles.loadingBlocks}>
          <SkeletonBlock height={110} />
          <SkeletonBlock height={110} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!gym) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>{error ?? 'Este gimnasio no existe.'}</Text>
        <Button
          title="Volver a CRM Gimnasios"
          variant="secondary"
          onPress={() => safeGoBack(router, '/trainer/gyms')}
        />
      </ScreenWrapper>
    );
  }

  const currentPlan = plans.find((plan) => plan.id === subscription?.planId);

  return (
    <ScreenWrapper>
      <Pressable
        onPress={() => safeGoBack(router, '/trainer/gyms')}
        accessibilityRole="button"
        accessibilityLabel="Volver a CRM Gimnasios"
        style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
      >
        <AppIcon name="chevronLeft" size={15} color={colors.textMuted} />
        <Text style={styles.backLinkText}>CRM Gimnasios</Text>
      </Pressable>

      <View style={styles.identity}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{gym.name.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.name}>{gym.name}</Text>
          <Text style={styles.identityMeta}>
            {GYM_STATUS_LABELS[gym.status]}
            {currentPlan ? ` · ${currentPlan.name}` : ' · sin plan'}
            {gym.city ? ` · ${gym.city}` : ''}
          </Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'summary' ? (
        <View style={styles.panel}>
          <InfoRow label="Nombre" value={gym.name} />
          <InfoRow label="Email" value={gym.email ?? 'No indicado'} />
          <InfoRow label="Teléfono" value={gym.phone ?? 'No indicado'} />
          <InfoRow
            label="Ubicación"
            value={[gym.address, gym.city, gym.postalCode, gym.country].filter(Boolean).join(', ') || 'No indicada'}
          />
          <InfoRow label="Zona horaria" value={gym.timezone} />
          <InfoRow
            label="Fecha de alta"
            value={new Date(gym.createdAt).toLocaleDateString('es-ES')}
          />
          <InfoRow label="Estado" value={GYM_STATUS_LABELS[gym.status]} last />
        </View>
      ) : null}

      {tab === 'analytics' ? (
        <View style={styles.panel}>
          <InfoRow label="Miembros totales" value={String(stats?.totalMembers ?? 0)} />
          <InfoRow label="Miembros activos" value={String(stats?.activeMembers ?? 0)} />
          <InfoRow label="Nuevos este mes" value={String(stats?.newMembersThisMonth ?? 0)} />
          <InfoRow label="Clases hoy" value={String(stats?.classesToday ?? 0)} />
          <InfoRow label="Reservas hoy" value={String(stats?.bookingsToday ?? 0)} />
          <InfoRow label="Reservas 30 días" value={String(stats?.bookingsLast30Days ?? 0)} />
          <InfoRow
            label="Membresías por vencer"
            value={String(stats?.membershipsExpiringSoon ?? 0)}
            last
          />
        </View>
      ) : null}

      {tab === 'membership' ? (
        <View>
          <View style={styles.panel}>
            <InfoRow label="Plan" value={currentPlan?.name ?? 'Sin plan'} />
            <InfoRow
              label="Precio mensual"
              value={
                currentPlan?.priceMonthly === undefined ? 'Sin definir' : `${currentPlan.priceMonthly} €`
              }
            />
            <InfoRow
              label="Estado"
              value={
                subscription ? GYM_SUBSCRIPTION_STATUS_LABELS[subscription.status] : 'Sin suscripción'
              }
            />
            <InfoRow
              label="Inicio"
              value={
                subscription ? new Date(subscription.startsAt).toLocaleDateString('es-ES') : '—'
              }
            />
            <InfoRow
              label="Fin de prueba"
              value={
                subscription?.trialEndsAt
                  ? new Date(subscription.trialEndsAt).toLocaleDateString('es-ES')
                  : '—'
              }
            />
            <InfoRow
              label="Límite de miembros"
              value={currentPlan?.maxMembers === undefined ? 'Sin límite definido' : String(currentPlan.maxMembers)}
              last
            />
          </View>

          <Text style={styles.blockTitle}>Cambiar plan</Text>
          <View style={styles.chips}>
            {plans.map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => void applyPlan(plan.id)}
                disabled={busy || plan.id === subscription?.planId}
                accessibilityRole="button"
                accessibilityState={{ selected: plan.id === subscription?.planId }}
                style={({ pressed }) => [
                  styles.chip,
                  plan.id === subscription?.planId && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    plan.id === subscription?.planId && styles.chipTextActive,
                  ]}
                >
                  {plan.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.blockTitle}>Estado de la suscripción</Text>
          <View style={styles.chips}>
            {SUBSCRIPTION_STATUS_ORDER.map((status) => (
              <Pressable
                key={status}
                onPress={() => void applySubscriptionStatus(status)}
                disabled={busy || status === subscription?.status}
                accessibilityRole="button"
                accessibilityState={{ selected: status === subscription?.status }}
                style={({ pressed }) => [
                  styles.chip,
                  status === subscription?.status && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    status === subscription?.status && styles.chipTextActive,
                  ]}
                >
                  {GYM_SUBSCRIPTION_STATUS_LABELS[status]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.hint}>
            Los precios y límites de cada plan se definen en la tabla gym_saas_plans. Cuando se
            integre la pasarela, el identificador externo se guardará en la suscripción.
          </Text>
        </View>
      ) : null}

      {tab === 'settings' ? (
        <View>
          <Text style={styles.blockTitle}>Estado del gimnasio</Text>
          <View style={styles.chips}>
            {STATUS_ORDER.map((status) => (
              <Pressable
                key={status}
                onPress={() => setPendingStatus(status)}
                disabled={busy || status === gym.status}
                accessibilityRole="button"
                accessibilityState={{ selected: status === gym.status }}
                style={({ pressed }) => [
                  styles.chip,
                  status === gym.status && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.chipText, status === gym.status && styles.chipTextActive]}>
                  {GYM_STATUS_LABELS[status]}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.hint}>
            Suspender un gimnasio no borra sus datos. El propietario y su equipo dejan de poder
            operar cuando se retiran sus accesos.
          </Text>
        </View>
      ) : null}

      {tab === 'users' ? (
        <View style={styles.list}>
          {staff.length === 0 ? (
            <Text style={styles.emptyRow}>Este gimnasio no tiene usuarios asignados.</Text>
          ) : (
            staff.map((member, index) => (
              <View
                key={member.id}
                style={[styles.row, index === staff.length - 1 && styles.rowLast]}
              >
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {member.name ?? 'Usuario'}
                  </Text>
                  <Text style={styles.rowMeta}>{GYM_USER_ROLE_LABELS[member.role]}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}

      {tab === 'activity' ? (
        activity.length === 0 ? (
          <Text style={styles.emptyRow}>Todavía no hay actividad administrativa.</Text>
        ) : (
          <View style={styles.list}>
            {activity.map((entry, index) => (
              <View
                key={entry.id}
                style={[styles.row, index === activity.length - 1 && styles.rowLast]}
              >
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {GYM_ADMIN_ACTION_LABELS[entry.action] ?? entry.action}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={2}>
                    {entry.detail ?? ''}
                  </Text>
                </View>
                <Text style={styles.rowDate}>
                  {new Date(entry.createdAt).toLocaleDateString('es-ES')}
                </Text>
              </View>
            ))}
          </View>
        )
      ) : null}

      <ConfirmModal
        visible={pendingStatus !== null}
        title={
          pendingStatus
            ? `¿Cambiar el estado a ${GYM_STATUS_LABELS[pendingStatus].toLowerCase()}?`
            : ''
        }
        message="El cambio queda registrado en la pestaña de Actividad."
        confirmLabel="Cambiar estado"
        destructive={pendingStatus === 'suspended' || pendingStatus === 'cancelled'}
        busy={busy}
        onCancel={() => setPendingStatus(null)}
        onConfirm={() => {
          if (pendingStatus) void applyStatus(pendingStatus);
        }}
      />
    </ScreenWrapper>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, last && styles.rowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  backLinkText: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  pressed: { opacity: 0.8 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: withAlpha(colors.accentBlue, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { ...typography.h3, color: colors.accentBlue, fontWeight: '800' },
  identityCopy: { flex: 1, minWidth: 0 },
  name: { ...typography.h2, color: colors.text },
  identityMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
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
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: colors.black },
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
  infoLabel: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  infoValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  blockTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: { backgroundColor: withAlpha(colors.accent, '22'), borderColor: colors.accent },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.accent, fontWeight: '800' },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
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
  rowLast: { borderBottomWidth: 0 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  rowMeta: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
  rowDate: { ...typography.caption, color: colors.textMuted },
  emptyRow: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.sm },
  spacer: { marginTop: spacing.sm },
  loadingBlocks: { marginTop: spacing.lg, gap: spacing.sm },
});
