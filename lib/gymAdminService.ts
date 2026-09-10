import { fetchProfileNamesByIds } from '@/lib/athleteService';
import { mapGym, type GymResult } from '@/lib/gymService';
import type {
  Gym,
  GymAdminActivityEntry,
  GymDashboardStats,
  GymSaasPlan,
  GymSubscription,
  GymSubscriptionStatus,
} from '@/lib/gymTypes';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const GYMS = 'gyms';
const SAAS_PLANS = 'gym_saas_plans';
const SUBSCRIPTIONS = 'gym_subscriptions';
const ACTIVITY = 'gym_admin_activity';
const STATS_VIEW = 'gym_dashboard_stats';

const GYM_SELECT =
  'id, name, slug, logo_url, email, phone, address, city, postal_code, country, timezone, status, owner_user_id, created_at, updated_at';
const SAAS_PLAN_SELECT =
  'id, name, description, price_monthly, price_yearly, max_members, max_staff, max_locations, active';

type Row = Record<string, unknown>;
type PgError = { message?: string; code?: string } | null | undefined;

const MIGRATION_HINT = 'Falta aplicar el CRM de gimnasios en Supabase: ejecuta npm run supabase:gym-crm';

function friendlyError(error: PgError, fallback: string) {
  if (!error) return fallback;

  const message = error.message?.toLowerCase() ?? '';
  if (
    message.includes('gym_') ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    error.code === 'PGRST202' ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  ) {
    return MIGRATION_HINT;
  }

  if (/row-level security|permission denied/i.test(error.message ?? '')) {
    return 'Solo un administrador puede gestionar los gimnasios.';
  }

  if (/administrador|obligatorio|no hay ninguna cuenta/i.test(error.message ?? '')) {
    return error.message ?? fallback;
  }

  return fallback;
}

function num(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapSaasPlan(row: Row): GymSaasPlan {
  return {
    id: row.id as string,
    name: (row.name as string) ?? '',
    description: (row.description as string | null) ?? undefined,
    priceMonthly: num(row.price_monthly),
    priceYearly: num(row.price_yearly),
    maxMembers: num(row.max_members),
    maxStaff: num(row.max_staff),
    maxLocations: num(row.max_locations),
    active: Boolean(row.active),
  };
}

export interface AdminGymRow {
  gym: Gym;
  stats?: GymDashboardStats;
  subscription?: GymSubscription;
  planName?: string;
  ownerName?: string;
}

export interface AdminGymsOverview {
  rows: AdminGymRow[];
  totals: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
    cancelled: number;
    managedMembers: number;
    bookingsLast30Days: number;
    /** Suma de los precios mensuales de las suscripciones activas. 0 si no hay precios definidos. */
    mrr: number;
    /** true si algún plan asignado no tiene precio, para no dar el MRR por completo. */
    mrrIncomplete: boolean;
  };
  plans: GymSaasPlan[];
}

/** Todos los gimnasios con sus métricas. Cuatro consultas en paralelo, sin N+1. */
export async function fetchAdminGymsOverview(): Promise<GymResult<AdminGymsOverview>> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase no está configurado.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const [gymsResult, statsResult, subscriptionsResult, plansResult] = await Promise.all([
    supabase.from(GYMS).select(GYM_SELECT).order('created_at', { ascending: false }),
    supabase.from(STATS_VIEW).select('*'),
    supabase
      .from(SUBSCRIPTIONS)
      .select(
        'id, gym_id, plan_id, status, starts_at, trial_ends_at, current_period_start, current_period_end, cancelled_at',
      ),
    supabase.from(SAAS_PLANS).select(SAAS_PLAN_SELECT).order('name', { ascending: true }),
  ]);

  if (gymsResult.error) {
    return { error: friendlyError(gymsResult.error, 'No se pudieron cargar los gimnasios.') };
  }

  const gyms = ((gymsResult.data ?? []) as Row[]).map(mapGym);
  const plans = ((plansResult.data ?? []) as Row[]).map(mapSaasPlan);
  const planById = new Map(plans.map((plan) => [plan.id, plan]));

  const statsByGym = new Map<string, GymDashboardStats>(
    ((statsResult.data ?? []) as Row[]).map((row) => [
      row.gym_id as string,
      {
        gymId: row.gym_id as string,
        activeMembers: num(row.active_members) ?? 0,
        newMembersThisMonth: num(row.new_members_this_month) ?? 0,
        totalMembers: num(row.total_members) ?? 0,
        classesToday: num(row.classes_today) ?? 0,
        bookingsToday: num(row.bookings_today) ?? 0,
        wellhubBookingsToday: num(row.wellhub_bookings_today) ?? 0,
        bookingsLast30Days: num(row.bookings_last_30_days) ?? 0,
        membershipsExpiringSoon: num(row.memberships_expiring_soon) ?? 0,
      },
    ]),
  );

  const subscriptionByGym = new Map<string, GymSubscription>(
    ((subscriptionsResult.data ?? []) as Row[]).map((row) => [
      row.gym_id as string,
      {
        id: row.id as string,
        gymId: row.gym_id as string,
        planId: (row.plan_id as string | null) ?? undefined,
        status: ((row.status as string) ?? 'trial') as GymSubscriptionStatus,
        startsAt: row.starts_at as string,
        trialEndsAt: (row.trial_ends_at as string | null) ?? undefined,
        currentPeriodStart: (row.current_period_start as string | null) ?? undefined,
        currentPeriodEnd: (row.current_period_end as string | null) ?? undefined,
        cancelledAt: (row.cancelled_at as string | null) ?? undefined,
      },
    ]),
  );

  const ownerNames = await fetchProfileNamesByIds(
    gyms.map((gym) => gym.ownerUserId).filter((id): id is string => Boolean(id)),
  );

  let mrr = 0;
  let mrrIncomplete = false;

  const rows: AdminGymRow[] = gyms.map((gym) => {
    const subscription = subscriptionByGym.get(gym.id);
    const plan = subscription?.planId ? planById.get(subscription.planId) : undefined;

    if (subscription?.status === 'active') {
      if (plan?.priceMonthly === undefined) {
        mrrIncomplete = true;
      } else {
        mrr += plan.priceMonthly;
      }
    }

    return {
      gym,
      stats: statsByGym.get(gym.id),
      subscription: subscription ? { ...subscription, planName: plan?.name } : undefined,
      planName: plan?.name,
      ownerName: gym.ownerUserId ? ownerNames.get(gym.ownerUserId) : undefined,
    };
  });

  return {
    data: {
      rows,
      plans,
      totals: {
        total: gyms.length,
        active: gyms.filter((gym) => gym.status === 'active').length,
        trial: gyms.filter((gym) => gym.status === 'trial').length,
        suspended: gyms.filter((gym) => gym.status === 'suspended').length,
        cancelled: gyms.filter((gym) => gym.status === 'cancelled').length,
        managedMembers: rows.reduce((sum, row) => sum + (row.stats?.totalMembers ?? 0), 0),
        bookingsLast30Days: rows.reduce(
          (sum, row) => sum + (row.stats?.bookingsLast30Days ?? 0),
          0,
        ),
        mrr,
        mrrIncomplete,
      },
    },
  };
}

export async function fetchGymSaasPlans(): Promise<GymResult<GymSaasPlan[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(SAAS_PLANS)
    .select(SAAS_PLAN_SELECT)
    .order('name', { ascending: true });

  if (error) return { error: friendlyError(error, 'No se pudieron cargar los planes.') };
  return { data: (data as Row[]).map(mapSaasPlan) };
}

export async function createGym(input: {
  name: string;
  slug?: string;
  ownerEmail?: string;
  planName?: string;
}): Promise<GymResult<Gym>> {
  if (!input.name.trim()) return { error: 'El nombre del gimnasio es obligatorio.' };

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.rpc('create_gym', {
    p_name: input.name.trim(),
    p_slug: input.slug?.trim() || null,
    p_owner_email: input.ownerEmail?.trim() || null,
    p_plan_name: input.planName ?? 'Starter',
  });

  if (error || !data) {
    return { error: friendlyError(error, 'No se pudo crear el gimnasio.') };
  }

  return { data: mapGym(data as Row) };
}

export async function updateGymSubscription(
  gymId: string,
  changes: { planId?: string | null; status?: GymSubscriptionStatus },
): Promise<GymResult<null>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload: Row = {};
  if (changes.planId !== undefined) payload.plan_id = changes.planId;
  if (changes.status !== undefined) payload.status = changes.status;

  if (Object.keys(payload).length === 0) return { error: 'No hay cambios que guardar.' };

  const { error } = await supabase
    .from(SUBSCRIPTIONS)
    .upsert({ gym_id: gymId, ...payload }, { onConflict: 'gym_id' });

  if (error) return { error: friendlyError(error, 'No se pudo actualizar la suscripción.') };
  return { data: null };
}

export async function logGymAdminActivity(input: {
  gymId: string;
  action: string;
  detail?: string;
}): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();

  await supabase.from(ACTIVITY).insert({
    gym_id: input.gymId,
    actor_user_id: sessionData.session?.user.id ?? null,
    action: input.action,
    detail: input.detail ?? null,
  });
}

export async function fetchGymAdminActivity(
  gymId: string,
): Promise<GymResult<GymAdminActivityEntry[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(ACTIVITY)
    .select('id, gym_id, actor_user_id, action, detail, created_at')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return { error: friendlyError(error, 'No se pudo cargar la actividad.') };

  return {
    data: (data as Row[]).map((row) => ({
      id: row.id as string,
      gymId: row.gym_id as string,
      actorUserId: (row.actor_user_id as string | null) ?? undefined,
      action: row.action as string,
      detail: (row.detail as string | null) ?? undefined,
      createdAt: row.created_at as string,
    })),
  };
}

export const GYM_ADMIN_ACTION_LABELS: Record<string, string> = {
  gym_created: 'Gimnasio creado',
  status_changed: 'Estado cambiado',
  plan_changed: 'Plan cambiado',
  subscription_changed: 'Suscripción actualizada',
};
