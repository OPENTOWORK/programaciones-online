import { fetchProfileNamesByIds } from '@/lib/athleteService';
import { HYPE_GYM_DISCOUNTS, HYPE_GYM_RATES, normalizeGymCatalogName } from '@/lib/hypeGymRatesCatalog';
import { seedHypeGymShopProducts } from '@/lib/gymShopService';
import type {
  Gym,
  GymBooking,
  GymBookingStatus,
  GymClass,
  GymClassType,
  GymDashboardStats,
  GymMember,
  GymMemberMembership,
  GymMemberPipelineStage,
  GymMembershipPlan,
  GymMembershipStatus,
  GymPromotion,
  GymPromotionDiscountType,
  GymStatus,
  GymSubscription,
  GymUser,
  GymUserRole,
  GymProgramLink,
} from '@/lib/gymTypes';
import type { AthleteSummary } from '@/lib/types';
import {
  defaultGymMemberPipelineStage,
  gymMemberStatusForPipeline,
  isGymMemberPipelineStage,
} from '@/lib/gymTypes';
import { isWellhubPlanName } from '@/lib/gymWellhub';
import { toWeekdayIndex } from '@/lib/sessionSchedule';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { SessionDraft } from '@/lib/trainerSessionDraft';

const GYMS = 'gyms';
const GYM_USERS = 'gym_users';
const MEMBERS = 'gym_members';
const CLASS_TYPES = 'gym_class_types';
const CLASSES = 'gym_classes';
const BOOKINGS = 'gym_bookings';
const PLANS = 'gym_membership_plans';
const PROMOTIONS = 'gym_promotions';
const MEMBERSHIPS = 'gym_member_memberships';
const SUBSCRIPTIONS = 'gym_subscriptions';
const PROGRAM_LINKS = 'gym_program_links';
const STATS_VIEW = 'gym_dashboard_stats';

const GYM_SELECT =
  'id, name, slug, logo_url, email, phone, address, city, postal_code, country, timezone, status, owner_user_id, created_at, updated_at';
const MEMBER_SELECT =
  'id, gym_id, user_id, first_name, last_name, email, phone, birth_date, status, pipeline_stage, signup_source, wellhub_user_id, wellhub_synced_at, notes, joined_at, created_at, updated_at';
const MEMBER_SELECT_LEGACY =
  'id, gym_id, user_id, first_name, last_name, email, phone, birth_date, status, notes, joined_at, created_at, updated_at';
const CLASS_TYPE_SELECT =
  'id, gym_id, name, description, duration_minutes, capacity, color, active';
const CLASS_SELECT =
  'id, gym_id, class_type_id, coach_user_id, title, start_at, end_at, capacity, location, status';
const BOOKING_SELECT =
  'id, gym_id, class_id, member_id, status, booked_at, checked_in_at, cancelled_at';
const PLAN_SELECT =
  'id, gym_id, name, description, price, billing_period, validity_days, max_bookings, active';
const PROMOTION_SELECT =
  'id, gym_id, name, description, discount_type, discount_value, starts_at, ends_at, active, created_at, updated_at';
const MEMBERSHIP_SELECT = 'id, gym_id, member_id, plan_id, starts_at, ends_at, status';
const SUBSCRIPTION_SELECT =
  'id, gym_id, plan_id, status, starts_at, trial_ends_at, current_period_start, current_period_end, cancelled_at';
const PROGRAM_LINK_SELECT =
  'id, gym_id, program_id, class_type_id, member_id, weekday, scheduled_date, published_date, published_time, session_draft, label, created_at';
const PROGRAM_LINK_SELECT_TIMES =
  'id, gym_id, program_id, class_type_id, member_id, weekday, scheduled_date, published_date, published_time, label, created_at';
const PROGRAM_LINK_SELECT_DATES =
  'id, gym_id, program_id, class_type_id, member_id, weekday, scheduled_date, published_date, label, created_at';
const PROGRAM_LINK_SELECT_SCHEDULED =
  'id, gym_id, program_id, class_type_id, member_id, weekday, scheduled_date, label, created_at';
const PROGRAM_LINK_SELECT_WEEKDAY =
  'id, gym_id, program_id, class_type_id, member_id, weekday, label, created_at';
const PROGRAM_LINK_SELECT_FALLBACK =
  'id, gym_id, program_id, class_type_id, member_id, label, created_at';

export interface GymResult<T> {
  data?: T;
  error?: string;
}

type Row = Record<string, unknown>;
type PgError = { message?: string; code?: string } | null | undefined;

const MIGRATION_HINT = 'Falta aplicar el CRM de gimnasios en Supabase: ejecuta npm run supabase:gym-crm';

function isMissingSchemaError(error: PgError) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('gym_') ||
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

  const message = error.message ?? '';
  if (/row-level security|permission denied|violates/i.test(message)) {
    return 'No tienes permiso para hacer eso en este gimnasio.';
  }
  if (/duplicate key/i.test(message)) {
    return 'Ese registro ya existe.';
  }
  if (/obligatorio|administrador|no hay ninguna cuenta/i.test(message)) {
    return message;
  }

  return fallback;
}

function text(value: unknown): string | undefined {
  const result = value as string | null;
  return result ?? undefined;
}

function num(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

// ---- Mappers ----

export function mapGym(row: Row): Gym {
  return {
    id: row.id as string,
    name: (row.name as string) ?? 'Gimnasio',
    slug: text(row.slug),
    logoUrl: text(row.logo_url),
    email: text(row.email),
    phone: text(row.phone),
    address: text(row.address),
    city: text(row.city),
    postalCode: text(row.postal_code),
    country: text(row.country),
    timezone: (row.timezone as string) ?? 'Europe/Madrid',
    status: ((row.status as string) ?? 'trial') as GymStatus,
    ownerUserId: text(row.owner_user_id),
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? (row.created_at as string),
  };
}

function mapMember(row: Row): GymMember {
  const status = ((row.status as string) ?? 'active') as GymMember['status'];
  const rawStage = typeof row.pipeline_stage === 'string' ? row.pipeline_stage : undefined;
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    userId: text(row.user_id),
    firstName: (row.first_name as string) ?? '',
    lastName: (row.last_name as string) ?? '',
    email: text(row.email),
    phone: text(row.phone),
    birthDate: text(row.birth_date),
    status,
    pipelineStage: isGymMemberPipelineStage(rawStage)
      ? rawStage
      : defaultGymMemberPipelineStage(status),
    signupSource: (row.signup_source as GymMember['signupSource']) ?? 'manual',
    wellhubUserId: text(row.wellhub_user_id),
    wellhubSyncedAt: text(row.wellhub_synced_at),
    notes: text(row.notes),
    joinedAt: (row.joined_at as string) ?? '',
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? (row.created_at as string),
  };
}

function isMissingPipelineColumn(error: { message?: string } | null | undefined) {
  return (error?.message ?? '').toLowerCase().includes('pipeline_stage');
}

function isMissingSignupSourceColumn(error: { message?: string } | null | undefined) {
  const message = (error?.message ?? '').toLowerCase();
  return message.includes('signup_source') || message.includes('wellhub_user_id');
}

function mapClassType(row: Row): GymClassType {
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    name: (row.name as string) ?? '',
    description: text(row.description),
    durationMinutes: num(row.duration_minutes) ?? 60,
    capacity: num(row.capacity) ?? 12,
    color: text(row.color),
    active: Boolean(row.active),
  };
}

function mapBooking(row: Row): GymBooking {
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    classId: row.class_id as string,
    memberId: row.member_id as string,
    status: ((row.status as string) ?? 'confirmed') as GymBookingStatus,
    bookedAt: row.booked_at as string,
    checkedInAt: text(row.checked_in_at),
    cancelledAt: text(row.cancelled_at),
  };
}

function mapPlan(row: Row): GymMembershipPlan {
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    name: (row.name as string) ?? '',
    description: text(row.description),
    price: num(row.price),
    billingPeriod: ((row.billing_period as string) ?? 'monthly') as GymMembershipPlan['billingPeriod'],
    validityDays: num(row.validity_days),
    maxBookings: num(row.max_bookings),
    active: Boolean(row.active),
  };
}

function mapPromotion(row: Row): GymPromotion {
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    name: (row.name as string) ?? '',
    description: text(row.description),
    discountType: ((row.discount_type as string) ?? 'percentage') as GymPromotionDiscountType,
    discountValue: num(row.discount_value),
    startsAt: text(row.starts_at),
    endsAt: text(row.ends_at),
    active: Boolean(row.active),
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? (row.created_at as string),
  };
}

function mapMembership(row: Row): GymMemberMembership {
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    memberId: row.member_id as string,
    planId: text(row.plan_id),
    startsAt: (row.starts_at as string) ?? '',
    endsAt: text(row.ends_at),
    status: ((row.status as string) ?? 'active') as GymMembershipStatus,
  };
}

function mapSubscription(row: Row): GymSubscription {
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    planId: text(row.plan_id),
    status: ((row.status as string) ?? 'trial') as GymSubscription['status'],
    startsAt: row.starts_at as string,
    trialEndsAt: text(row.trial_ends_at),
    currentPeriodStart: text(row.current_period_start),
    currentPeriodEnd: text(row.current_period_end),
    cancelledAt: text(row.cancelled_at),
  };
}

// ---- Gimnasio y pertenencia ----

export interface GymMembershipContext {
  gym: Gym;
  role: GymUserRole;
}

/** Gimnasios a los que pertenece el usuario. La RLS ya limita el resultado. */
export async function fetchMyGyms(): Promise<GymResult<GymMembershipContext[]>> {
  if (!isSupabaseConfigured) return { data: [] };

  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return { data: [] };

  const { data, error } = await supabase
    .from(GYM_USERS)
    .select(`role, gyms!inner(${GYM_SELECT})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) return { error: friendlyError(error, 'No se pudo cargar tu gimnasio.') };

  const rows = (data ?? []) as unknown as Array<{ role: string; gyms: Row | Row[] }>;
  const contexts = rows
    .map((row) => {
      const gymRow = Array.isArray(row.gyms) ? row.gyms[0] : row.gyms;
      if (!gymRow) return null;
      return { gym: mapGym(gymRow), role: row.role as GymUserRole };
    })
    .filter((entry): entry is GymMembershipContext => entry !== null);

  return { data: contexts };
}

export async function fetchGym(gymId: string): Promise<GymResult<Gym>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.from(GYMS).select(GYM_SELECT).eq('id', gymId).maybeSingle();

  if (error) return { error: friendlyError(error, 'No se pudo cargar el gimnasio.') };
  if (!data) return { error: 'Este gimnasio no existe o no tienes acceso.' };

  return { data: mapGym(data as Row) };
}

export async function updateGym(
  gymId: string,
  changes: Partial<
    Pick<
      Gym,
      | 'name'
      | 'email'
      | 'phone'
      | 'address'
      | 'city'
      | 'postalCode'
      | 'country'
      | 'timezone'
      | 'logoUrl'
      | 'status'
    >
  >,
): Promise<GymResult<Gym>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload: Row = {};
  if (changes.name !== undefined) payload.name = changes.name.trim();
  if (changes.email !== undefined) payload.email = changes.email.trim() || null;
  if (changes.phone !== undefined) payload.phone = changes.phone.trim() || null;
  if (changes.address !== undefined) payload.address = changes.address.trim() || null;
  if (changes.city !== undefined) payload.city = changes.city.trim() || null;
  if (changes.postalCode !== undefined) payload.postal_code = changes.postalCode.trim() || null;
  if (changes.country !== undefined) payload.country = changes.country.trim() || null;
  if (changes.timezone !== undefined) payload.timezone = changes.timezone.trim() || 'Europe/Madrid';
  if (changes.logoUrl !== undefined) payload.logo_url = changes.logoUrl.trim() || null;
  if (changes.status !== undefined) payload.status = changes.status;

  if (Object.keys(payload).length === 0) return { error: 'No hay cambios que guardar.' };

  const { data, error } = await supabase
    .from(GYMS)
    .update(payload)
    .eq('id', gymId)
    .select(GYM_SELECT)
    .single();

  if (error || !data) return { error: friendlyError(error, 'No se pudo guardar el gimnasio.') };
  return { data: mapGym(data as Row) };
}

function readRoleSlug(roles: unknown): string | undefined {
  if (!roles) return undefined;
  if (Array.isArray(roles)) {
    const first = roles[0] as { slug?: string } | undefined;
    return typeof first?.slug === 'string' ? first.slug : undefined;
  }
  const slug = (roles as { slug?: string }).slug;
  return typeof slug === 'string' ? slug : undefined;
}

export async function fetchGymStaff(gymId: string): Promise<GymResult<GymUser[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(GYM_USERS)
    .select('id, gym_id, user_id, role, created_at')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: true });

  if (error) return { error: friendlyError(error, 'No se pudo cargar el equipo del gimnasio.') };

  const rows = (data ?? []) as Row[];
  const userIds = rows.map((row) => row.user_id as string);
  const profiles = new Map<string, { name?: string; email?: string; globalRole?: string }>();

  if (userIds.length > 0 && supabase) {
    const { data: profileRows } = await supabase
      .from('Perfil')
      .select('id, name, email, roles(slug)')
      .in('id', userIds);

    for (const profile of profileRows ?? []) {
      const id = profile.id as string;
      if (!id) continue;
      profiles.set(id, {
        name: typeof profile.name === 'string' ? profile.name.trim() : undefined,
        email: typeof profile.email === 'string' ? profile.email.trim() : undefined,
        globalRole: readRoleSlug(profile.roles),
      });
    }
  }

  return {
    data: rows
      .filter((row) => {
        const profile = profiles.get(row.user_id as string);
        if (!profile) return false;
        // Un atleta no es personal del gimnasio aunque exista un gym_users erróneo.
        return profile.globalRole !== 'atleta';
      })
      .map((row) => {
        const profile = profiles.get(row.user_id as string);
        return {
          id: row.id as string,
          gymId: row.gym_id as string,
          userId: row.user_id as string,
          role: row.role as GymUserRole,
          createdAt: row.created_at as string,
          name: profile?.name,
          email: profile?.email,
        };
      }),
  };
}

export async function updateGymStaffRole(
  gymUserId: string,
  role: GymUserRole,
): Promise<GymResult<GymUser>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(GYM_USERS)
    .update({ role })
    .eq('id', gymUserId)
    .select('id, gym_id, user_id, role, created_at')
    .single();

  if (error) {
    return { error: friendlyError(error, 'No se pudo cambiar el rol del usuario.') };
  }

  const row = data as Row;
  const userId = row.user_id as string;
  let name: string | undefined;
  let email: string | undefined;

  const { data: profile } = await supabase
    .from('Perfil')
    .select('name, email')
    .eq('id', userId)
    .maybeSingle();

  if (profile) {
    name = typeof profile.name === 'string' ? profile.name.trim() : undefined;
    email = typeof profile.email === 'string' ? profile.email.trim() : undefined;
  }

  return {
    data: {
      id: row.id as string,
      gymId: row.gym_id as string,
      userId,
      role: row.role as GymUserRole,
      createdAt: row.created_at as string,
      name,
      email,
    },
  };
}

export async function fetchGymDashboardStats(
  gymId: string,
): Promise<GymResult<GymDashboardStats>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(STATS_VIEW)
    .select('*')
    .eq('gym_id', gymId)
    .maybeSingle();

  if (error) return { error: friendlyError(error, 'No se pudieron cargar las métricas.') };
  if (!data) return { error: 'No hay métricas para este gimnasio.' };

  const row = data as Row;
  return {
    data: {
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
  };
}

export async function fetchGymSubscription(
  gymId: string,
): Promise<GymResult<GymSubscription | null>> {
  const supabase = getSupabase();
  if (!supabase) return { data: null };

  const { data, error } = await supabase
    .from(SUBSCRIPTIONS)
    .select(SUBSCRIPTION_SELECT)
    .eq('gym_id', gymId)
    .maybeSingle();

  if (error) return { error: friendlyError(error, 'No se pudo cargar la suscripción.') };
  if (!data) return { data: null };

  return { data: mapSubscription(data as Row) };
}

// ---- Miembros ----

export async function fetchGymMembers(gymId: string): Promise<GymResult<GymMember[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const query = (columns: string) =>
    supabase.from(MEMBERS).select(columns).eq('gym_id', gymId).order('created_at', { ascending: false });

  const first = await query(MEMBER_SELECT);
  const result =
    first.error && (isMissingPipelineColumn(first.error) || isMissingSignupSourceColumn(first.error))
      ? await query(MEMBER_SELECT_LEGACY)
      : first;

  if (result.error) return { error: friendlyError(result.error, 'No se pudieron cargar los miembros.') };
  return { data: (result.data as Row[]).map(mapMember) };
}

function gymMemberDisplayName(member: GymMember) {
  return `${member.firstName} ${member.lastName}`.trim();
}

function gymMemberInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Miembros del gimnasio con cuenta vinculada, como resumen de atleta para planes personalizados. */
export async function fetchGymMemberAthletes(gymId: string): Promise<AthleteSummary[]> {
  const result = await fetchGymMembers(gymId);
  if (!result.data) return [];

  return result.data
    .filter((member) => Boolean(member.userId))
    .map((member) => {
      const name = gymMemberDisplayName(member);
      return {
        id: member.userId!,
        name,
        email: member.email ?? '',
        avatarInitials: gymMemberInitials(name),
        gymMemberId: member.id,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, 'es'));
}

export async function fetchGymMemberAthleteByUserId(
  gymId: string,
  userId: string,
): Promise<AthleteSummary | null> {
  const athletes = await fetchGymMemberAthletes(gymId);
  return athletes.find((athlete) => athlete.id === userId) ?? null;
}

export async function fetchGymMember(memberId: string): Promise<GymResult<GymMember>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const query = (columns: string) =>
    supabase.from(MEMBERS).select(columns).eq('id', memberId).maybeSingle();

  const first = await query(MEMBER_SELECT);
  const result =
    first.error && (isMissingPipelineColumn(first.error) || isMissingSignupSourceColumn(first.error))
      ? await query(MEMBER_SELECT_LEGACY)
      : first;

  if (result.error) return { error: friendlyError(result.error, 'No se pudo cargar el miembro.') };
  if (!result.data) return { error: 'Este miembro no existe o no tienes acceso.' };

  return { data: mapMember(result.data as Row) };
}

export interface GymMemberInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  status?: GymMember['status'];
  pipelineStage?: GymMemberPipelineStage;
  signupSource?: GymMember['signupSource'];
  wellhubUserId?: string;
  notes?: string;
  joinedAt?: string;
}

export async function createGymMember(
  gymId: string,
  input: GymMemberInput,
): Promise<GymResult<GymMember>> {
  if (!input.firstName.trim()) return { error: 'El nombre es obligatorio.' };

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const status = input.status ?? 'active';
  const pipelineStage = input.pipelineStage ?? defaultGymMemberPipelineStage(status);
  const payload: Row = {
    gym_id: gymId,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    birth_date: input.birthDate || null,
    status,
    pipeline_stage: pipelineStage,
    notes: input.notes?.trim() || null,
    joined_at: input.joinedAt || new Date().toISOString().slice(0, 10),
  };
  if (input.signupSource) payload.signup_source = input.signupSource;
  if (input.wellhubUserId?.trim()) payload.wellhub_user_id = input.wellhubUserId.trim();

  let result = await supabase.from(MEMBERS).insert(payload).select(MEMBER_SELECT).single();
  if (result.error && isMissingSignupSourceColumn(result.error)) {
    delete payload.signup_source;
    delete payload.wellhub_user_id;
    result = await supabase.from(MEMBERS).insert(payload).select(MEMBER_SELECT).single();
  }
  if (result.error && isMissingPipelineColumn(result.error)) {
    delete payload.pipeline_stage;
    result = await supabase.from(MEMBERS).insert(payload).select(MEMBER_SELECT_LEGACY).single();
  }

  if (result.error || !result.data) {
    return { error: friendlyError(result.error, 'No se pudo crear el miembro.') };
  }
  return { data: mapMember(result.data as Row) };
}

export async function updateGymMember(
  memberId: string,
  changes: Partial<GymMemberInput>,
): Promise<GymResult<GymMember>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload: Row = {};
  if (changes.firstName !== undefined) payload.first_name = changes.firstName.trim();
  if (changes.lastName !== undefined) payload.last_name = changes.lastName.trim();
  if (changes.email !== undefined) payload.email = changes.email.trim() || null;
  if (changes.phone !== undefined) payload.phone = changes.phone.trim() || null;
  if (changes.birthDate !== undefined) payload.birth_date = changes.birthDate || null;
  if (changes.status !== undefined) {
    payload.status = changes.status;
    if (changes.pipelineStage === undefined) {
      payload.pipeline_stage = defaultGymMemberPipelineStage(changes.status);
    }
  }
  if (changes.pipelineStage !== undefined) {
    payload.pipeline_stage = changes.pipelineStage;
    if (changes.status === undefined) payload.status = gymMemberStatusForPipeline(changes.pipelineStage);
  }
  if (changes.notes !== undefined) payload.notes = changes.notes.trim() || null;
  if (changes.signupSource !== undefined) payload.signup_source = changes.signupSource;
  if (changes.wellhubUserId !== undefined) {
    payload.wellhub_user_id = changes.wellhubUserId.trim() || null;
  }

  if (Object.keys(payload).length === 0) return { error: 'No hay cambios que guardar.' };

  const first = await supabase.from(MEMBERS).update(payload).eq('id', memberId).select(MEMBER_SELECT).single();
  if (first.error && isMissingSignupSourceColumn(first.error)) {
    delete payload.signup_source;
    delete payload.wellhub_user_id;
    const retry = await supabase.from(MEMBERS).update(payload).eq('id', memberId).select(MEMBER_SELECT).single();
    if (retry.error && isMissingPipelineColumn(retry.error)) {
      delete payload.pipeline_stage;
    }
    if (retry.error && isMissingPipelineColumn(retry.error)) {
      const fallback = await supabase
        .from(MEMBERS)
        .update(payload)
        .eq('id', memberId)
        .select(MEMBER_SELECT_LEGACY)
        .single();
      if (fallback.error || !fallback.data) {
        return { error: friendlyError(fallback.error, 'No se pudo guardar el miembro.') };
      }
      return { data: mapMember(fallback.data as Row) };
    }
    if (retry.error || !retry.data) {
      return { error: friendlyError(retry.error, 'No se pudo guardar el miembro.') };
    }
    return { data: mapMember(retry.data as Row) };
  }
  if (first.error && isMissingPipelineColumn(first.error)) {
    delete payload.pipeline_stage;
    const fallback = await supabase
      .from(MEMBERS)
      .update(payload)
      .eq('id', memberId)
      .select(MEMBER_SELECT_LEGACY)
      .single();
    if (fallback.error || !fallback.data) {
      return { error: friendlyError(fallback.error, 'No se pudo guardar el miembro.') };
    }
    return { data: mapMember(fallback.data as Row) };
  }

  if (first.error || !first.data) return { error: friendlyError(first.error, 'No se pudo guardar el miembro.') };
  return { data: mapMember(first.data as Row) };
}

// ---- Tipos de clase ----

export async function fetchGymClassTypes(gymId: string): Promise<GymResult<GymClassType[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(CLASS_TYPES)
    .select(CLASS_TYPE_SELECT)
    .eq('gym_id', gymId)
    .order('name', { ascending: true });

  if (error) return { error: friendlyError(error, 'No se pudieron cargar las clases.') };
  return { data: (data as Row[]).map(mapClassType) };
}

export interface GymClassTypeInput {
  name: string;
  description?: string;
  durationMinutes: number;
  capacity: number;
  color?: string;
  active?: boolean;
}

export async function saveGymClassType(
  gymId: string,
  input: GymClassTypeInput & { id?: string },
): Promise<GymResult<GymClassType>> {
  if (!input.name.trim()) return { error: 'El nombre de la clase es obligatorio.' };

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload = {
    gym_id: gymId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    duration_minutes: input.durationMinutes,
    capacity: input.capacity,
    color: input.color?.trim() || null,
    active: input.active ?? true,
  };

  const query = input.id
    ? supabase.from(CLASS_TYPES).update(payload).eq('id', input.id)
    : supabase.from(CLASS_TYPES).insert(payload);

  const { data, error } = await query.select(CLASS_TYPE_SELECT).single();

  if (error || !data) return { error: friendlyError(error, 'No se pudo guardar la clase.') };
  return { data: mapClassType(data as Row) };
}

// ---- Clases programadas ----

async function decorateClasses(gymId: string, rows: Row[]): Promise<GymClass[]> {
  const supabase = getSupabase();
  const classIds = rows.map((row) => row.id as string);

  const [typesResult, bookingRows, coachNames] = await Promise.all([
    fetchGymClassTypes(gymId),
    (async () => {
      if (!supabase || classIds.length === 0) return [] as Row[];
      const { data } = await supabase
        .from(BOOKINGS)
        .select('class_id, status')
        .in('class_id', classIds);
      return (data ?? []) as Row[];
    })(),
    fetchProfileNamesByIds(
      rows.map((row) => row.coach_user_id as string | null).filter((id): id is string => Boolean(id)),
    ),
  ]);

  const typeById = new Map((typesResult.data ?? []).map((type) => [type.id, type]));

  const booked = new Map<string, number>();
  const waiting = new Map<string, number>();
  for (const row of bookingRows) {
    const classId = row.class_id as string;
    const status = row.status as GymBookingStatus;
    if (status === 'confirmed' || status === 'attended') {
      booked.set(classId, (booked.get(classId) ?? 0) + 1);
    } else if (status === 'waiting') {
      waiting.set(classId, (waiting.get(classId) ?? 0) + 1);
    }
  }

  return rows.map((row) => {
    const typeId = text(row.class_type_id);
    const type = typeId ? typeById.get(typeId) : undefined;
    const coachId = text(row.coach_user_id);

    return {
      id: row.id as string,
      gymId: row.gym_id as string,
      classTypeId: typeId,
      coachUserId: coachId,
      title: text(row.title),
      startAt: row.start_at as string,
      endAt: row.end_at as string,
      capacity: num(row.capacity) ?? type?.capacity ?? 12,
      location: text(row.location),
      status: ((row.status as string) ?? 'scheduled') as GymClass['status'],
      classTypeName: type?.name,
      classTypeColor: type?.color,
      coachName: coachId ? coachNames.get(coachId) : undefined,
      bookedCount: booked.get(row.id as string) ?? 0,
      waitingCount: waiting.get(row.id as string) ?? 0,
    };
  });
}

export async function fetchGymClasses(
  gymId: string,
  range: { from: string; to: string },
): Promise<GymResult<GymClass[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(CLASSES)
    .select(CLASS_SELECT)
    .eq('gym_id', gymId)
    .gte('start_at', range.from)
    .lt('start_at', range.to)
    .order('start_at', { ascending: true });

  if (error) return { error: friendlyError(error, 'No se pudo cargar el horario.') };

  return { data: await decorateClasses(gymId, (data ?? []) as Row[]) };
}

export interface GymClassInput {
  classTypeId?: string;
  coachUserId?: string;
  title?: string;
  startAt: string;
  endAt: string;
  capacity: number;
  location?: string;
}

export async function saveGymClass(
  gymId: string,
  input: GymClassInput & { id?: string },
): Promise<GymResult<null>> {
  if (new Date(input.endAt) <= new Date(input.startAt)) {
    return { error: 'La clase debe terminar después de empezar.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload = {
    gym_id: gymId,
    class_type_id: input.classTypeId || null,
    coach_user_id: input.coachUserId || null,
    title: input.title?.trim() || null,
    start_at: input.startAt,
    end_at: input.endAt,
    capacity: input.capacity,
    location: input.location?.trim() || null,
  };

  const { error } = input.id
    ? await supabase.from(CLASSES).update(payload).eq('id', input.id)
    : await supabase.from(CLASSES).insert(payload);

  if (error) return { error: friendlyError(error, 'No se pudo guardar la clase.') };
  return { data: null };
}

export async function saveGymClasses(
  gymId: string,
  inputs: readonly GymClassInput[],
): Promise<GymResult<{ inserted: number }>> {
  if (inputs.length === 0) return { data: { inserted: 0 } };

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload = inputs.map((input) => ({
    gym_id: gymId,
    class_type_id: input.classTypeId || null,
    coach_user_id: input.coachUserId || null,
    title: input.title?.trim() || null,
    start_at: input.startAt,
    end_at: input.endAt,
    capacity: input.capacity,
    location: input.location?.trim() || null,
  }));

  const { data, error } = await supabase.from(CLASSES).insert(payload).select('id');
  if (error) return { error: friendlyError(error, 'No se pudo guardar el horario.') };
  return { data: { inserted: data?.length ?? payload.length } };
}

export async function setGymClassStatus(
  classId: string,
  status: GymClass['status'],
): Promise<GymResult<null>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(CLASSES).update({ status }).eq('id', classId);
  if (error) return { error: friendlyError(error, 'No se pudo actualizar la clase.') };
  return { data: null };
}

/** Duplica una clase desplazándola los días indicados. */
export async function duplicateGymClass(
  gymClass: GymClass,
  offsetDays: number,
): Promise<GymResult<null>> {
  const shift = (iso: string) => {
    const date = new Date(iso);
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString();
  };

  return saveGymClass(gymClass.gymId, {
    classTypeId: gymClass.classTypeId,
    coachUserId: gymClass.coachUserId,
    title: gymClass.title,
    startAt: shift(gymClass.startAt),
    endAt: shift(gymClass.endAt),
    capacity: gymClass.capacity,
    location: gymClass.location,
  });
}

// ---- Reservas ----

export async function fetchGymBookings(
  gymId: string,
  range: { from: string; to: string },
): Promise<GymResult<GymBooking[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(BOOKINGS)
    .select(`${BOOKING_SELECT}, gym_classes!inner(start_at, title, class_type_id), gym_members!inner(first_name, last_name)`)
    .eq('gym_id', gymId)
    .gte('gym_classes.start_at', range.from)
    .lt('gym_classes.start_at', range.to)
    .order('booked_at', { ascending: false });

  if (error) return { error: friendlyError(error, 'No se pudieron cargar las reservas.') };

  const rows = (data ?? []) as unknown as Array<
    Row & {
      gym_classes: { start_at: string; title: string | null } | Array<{ start_at: string; title: string | null }>;
      gym_members: { first_name: string; last_name: string } | Array<{ first_name: string; last_name: string }>;
    }
  >;

  return {
    data: rows.map((row) => {
      const classRow = Array.isArray(row.gym_classes) ? row.gym_classes[0] : row.gym_classes;
      const memberRow = Array.isArray(row.gym_members) ? row.gym_members[0] : row.gym_members;

      return {
        ...mapBooking(row),
        classStartAt: classRow?.start_at,
        classTitle: classRow?.title ?? undefined,
        memberName: memberRow
          ? `${memberRow.first_name ?? ''} ${memberRow.last_name ?? ''}`.trim() || 'Miembro'
          : undefined,
      };
    }),
  };
}

export async function fetchMemberBookings(memberId: string): Promise<GymResult<GymBooking[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(BOOKINGS)
    .select(`${BOOKING_SELECT}, gym_classes(start_at, title)`)
    .eq('member_id', memberId)
    .order('booked_at', { ascending: false })
    .limit(50);

  if (error) return { error: friendlyError(error, 'No se pudieron cargar las reservas.') };

  const rows = (data ?? []) as unknown as Array<
    Row & { gym_classes: { start_at: string; title: string | null } | null }
  >;

  return {
    data: rows.map((row) => ({
      ...mapBooking(row),
      classStartAt: row.gym_classes?.start_at,
      classTitle: row.gym_classes?.title ?? undefined,
    })),
  };
}

/**
 * Crea la reserva. Si la clase está llena, el trigger de la base de datos
 * la deja en lista de espera en lugar de superar el aforo.
 */
export async function createGymBooking(input: {
  gymId: string;
  classId: string;
  memberId: string;
}): Promise<GymResult<GymBooking>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(BOOKINGS)
    .insert({ gym_id: input.gymId, class_id: input.classId, member_id: input.memberId })
    .select(BOOKING_SELECT)
    .single();

  if (error || !data) {
    if (error && /duplicate key/i.test(error.message ?? '')) {
      return { error: 'Ese miembro ya tiene reserva en esta clase.' };
    }
    return { error: friendlyError(error, 'No se pudo crear la reserva.') };
  }

  return { data: mapBooking(data as Row) };
}

export async function setGymBookingStatus(
  bookingId: string,
  status: GymBookingStatus,
): Promise<GymResult<GymBooking>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload: Row = { status };
  if (status === 'attended') payload.checked_in_at = new Date().toISOString();
  if (status === 'cancelled') payload.cancelled_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(BOOKINGS)
    .update(payload)
    .eq('id', bookingId)
    .select(BOOKING_SELECT)
    .single();

  if (error || !data) return { error: friendlyError(error, 'No se pudo actualizar la reserva.') };
  return { data: mapBooking(data as Row) };
}

// ---- Tarifas de los clientes del gimnasio ----

export async function fetchGymMembershipPlans(
  gymId: string,
): Promise<GymResult<GymMembershipPlan[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(PLANS)
    .select(PLAN_SELECT)
    .eq('gym_id', gymId)
    .order('name', { ascending: true });

  if (error) return { error: friendlyError(error, 'No se pudieron cargar las tarifas.') };
  return { data: (data as Row[]).map(mapPlan) };
}

export interface GymMembershipPlanInput {
  name: string;
  description?: string;
  price?: number;
  billingPeriod: GymMembershipPlan['billingPeriod'];
  validityDays?: number;
  maxBookings?: number;
  active?: boolean;
}

export async function saveGymMembershipPlan(
  gymId: string,
  input: GymMembershipPlanInput & { id?: string },
): Promise<GymResult<GymMembershipPlan>> {
  if (!input.name.trim()) return { error: 'El nombre de la tarifa es obligatorio.' };

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload = {
    gym_id: gymId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    price: input.price ?? null,
    billing_period: input.billingPeriod,
    validity_days: input.validityDays ?? null,
    max_bookings: input.maxBookings ?? null,
    active: input.active ?? true,
  };

  const query = input.id
    ? supabase.from(PLANS).update(payload).eq('id', input.id)
    : supabase.from(PLANS).insert(payload);

  const { data, error } = await query.select(PLAN_SELECT).single();

  if (error || !data) return { error: friendlyError(error, 'No se pudo guardar la tarifa.') };
  return { data: mapPlan(data as Row) };
}

export async function deleteGymMembershipPlan(
  gymId: string,
  planId: string,
): Promise<GymResult<null>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { count, error: countError } = await supabase
    .from(MEMBERSHIPS)
    .select('id', { count: 'exact', head: true })
    .eq('gym_id', gymId)
    .eq('plan_id', planId)
    .eq('status', 'active');

  if (countError) {
    return { error: friendlyError(countError, 'No se pudo comprobar los clientes de la tarifa.') };
  }

  if ((count ?? 0) > 0) {
    const label = count === 1 ? 'cliente tiene' : 'clientes tienen';
    return {
      error: `No se puede eliminar: ${count} ${label} esta tarifa activa. Reasígnalos o desactívala.`,
    };
  }

  const { error } = await supabase.from(PLANS).delete().eq('id', planId).eq('gym_id', gymId);

  if (error) return { error: friendlyError(error, 'No se pudo eliminar la tarifa.') };
  return { data: null };
}

export async function fetchGymPlanActiveCounts(
  gymId: string,
): Promise<GymResult<Record<string, number>>> {
  const supabase = getSupabase();
  if (!supabase) return { data: {} };

  const { data, error } = await supabase
    .from(MEMBERSHIPS)
    .select('plan_id')
    .eq('gym_id', gymId)
    .eq('status', 'active');

  if (error) return { error: friendlyError(error, 'No se pudieron cargar los clientes por tarifa.') };

  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as Array<{ plan_id?: string }>) {
    if (!row.plan_id) continue;
    counts[row.plan_id] = (counts[row.plan_id] ?? 0) + 1;
  }

  return { data: counts };
}

export async function fetchGymPromotions(gymId: string): Promise<GymResult<GymPromotion[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(PROMOTIONS)
    .select(PROMOTION_SELECT)
    .eq('gym_id', gymId)
    .order('name', { ascending: true });

  if (error) return { error: friendlyError(error, 'No se pudieron cargar los descuentos.') };
  return { data: (data as Row[]).map(mapPromotion) };
}

export interface GymPromotionInput {
  name: string;
  description?: string;
  discountType: GymPromotionDiscountType;
  discountValue?: number;
  startsAt?: string;
  endsAt?: string;
  active?: boolean;
}

export async function saveGymPromotion(
  gymId: string,
  input: GymPromotionInput & { id?: string },
): Promise<GymResult<GymPromotion>> {
  if (!input.name.trim()) return { error: 'El nombre del descuento es obligatorio.' };

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload = {
    gym_id: gymId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    discount_type: input.discountType,
    discount_value: input.discountValue ?? null,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    active: input.active ?? true,
  };

  const query = input.id
    ? supabase.from(PROMOTIONS).update(payload).eq('id', input.id)
    : supabase.from(PROMOTIONS).insert(payload);

  const { data, error } = await query.select(PROMOTION_SELECT).single();
  if (error || !data) return { error: friendlyError(error, 'No se pudo guardar el descuento.') };
  return { data: mapPromotion(data as Row) };
}

export async function deleteGymPromotion(
  gymId: string,
  promotionId: string,
): Promise<GymResult<null>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase
    .from(PROMOTIONS)
    .delete()
    .eq('id', promotionId)
    .eq('gym_id', gymId);

  if (error) return { error: friendlyError(error, 'No se pudo eliminar el descuento.') };
  return { data: null };
}

type CatalogSeedResult = {
  plansCreated: number;
  promotionsCreated: number;
  plansRemoved: number;
  promotionsRemoved: number;
};

const hypeCatalogSeedLocks = new Map<string, Promise<GymResult<CatalogSeedResult>>>();

async function dedupeGymMembershipPlans(gymId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from(PLANS)
    .select('id, name, created_at')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: true });

  if (error || !data?.length) return 0;

  const groups = new Map<string, Array<{ id: string; name: string }>>();
  for (const row of data as Array<{ id: string; name: string }>) {
    const key = normalizeGymCatalogName(row.name);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  let removed = 0;
  for (const group of groups.values()) {
    if (group.length <= 1) continue;

    const [keeper, ...duplicates] = group;
    for (const duplicate of duplicates) {
      const { error: moveError } = await supabase
        .from(MEMBERSHIPS)
        .update({ plan_id: keeper.id })
        .eq('plan_id', duplicate.id);

      if (moveError) return removed;

      const { error: deleteError } = await supabase.from(PLANS).delete().eq('id', duplicate.id);
      if (deleteError) return removed;
      removed += 1;
    }
  }

  return removed;
}

async function dedupeGymPromotions(gymId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from(PROMOTIONS)
    .select('id, name, created_at')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: true });

  if (error || !data?.length) return 0;

  const groups = new Map<string, Array<{ id: string; name: string }>>();
  for (const row of data as Array<{ id: string; name: string }>) {
    const key = normalizeGymCatalogName(row.name);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  let removed = 0;
  for (const group of groups.values()) {
    if (group.length <= 1) continue;

    const [, ...duplicates] = group;
    for (const duplicate of duplicates) {
      const { error: deleteError } = await supabase.from(PROMOTIONS).delete().eq('id', duplicate.id);
      if (deleteError) return removed;
      removed += 1;
    }
  }

  return removed;
}

async function seedHypeGymCatalogInternal(
  gymId: string,
): Promise<GymResult<CatalogSeedResult>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const [plansRemoved, promotionsRemoved] = await Promise.all([
    dedupeGymMembershipPlans(gymId),
    dedupeGymPromotions(gymId),
  ]);

  const [existingPlans, existingPromotions] = await Promise.all([
    fetchGymMembershipPlans(gymId),
    fetchGymPromotions(gymId),
  ]);

  if (existingPlans.error) return { error: existingPlans.error };
  if (existingPromotions.error) return { error: existingPromotions.error };

  const planNames = new Set(
    (existingPlans.data ?? []).map((plan) => normalizeGymCatalogName(plan.name)),
  );
  const promoNames = new Set(
    (existingPromotions.data ?? []).map((promo) => normalizeGymCatalogName(promo.name)),
  );

  let plansCreated = 0;
  let promotionsCreated = 0;

  for (const rate of HYPE_GYM_RATES) {
    const key = normalizeGymCatalogName(rate.name);
    if (planNames.has(key)) continue;

    const result = await saveGymMembershipPlan(gymId, {
      name: rate.name,
      description: rate.description,
      price: rate.price,
      billingPeriod: rate.billingPeriod,
      maxBookings: rate.maxBookings,
      active: true,
    });
    if (result.error) return { error: result.error };
    plansCreated += 1;
    planNames.add(key);
  }

  for (const discount of HYPE_GYM_DISCOUNTS) {
    const key = normalizeGymCatalogName(discount.name);
    if (promoNames.has(key)) continue;

    const result = await saveGymPromotion(gymId, {
      name: discount.name,
      description: discount.description,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      active: true,
    });
    if (result.error) return { error: result.error };
    promotionsCreated += 1;
    promoNames.add(key);
  }

  const shopSeed = await seedHypeGymShopProducts(gymId);
  if (shopSeed.error) return { error: shopSeed.error };

  return {
    data: {
      plansCreated,
      promotionsCreated,
      plansRemoved,
      promotionsRemoved,
    },
  };
}

export async function seedHypeGymCatalog(
  gymId: string,
): Promise<GymResult<CatalogSeedResult>> {
  const inFlight = hypeCatalogSeedLocks.get(gymId);
  if (inFlight) return inFlight;

  const operation = seedHypeGymCatalogInternal(gymId);
  hypeCatalogSeedLocks.set(gymId, operation);

  try {
    return await operation;
  } finally {
    hypeCatalogSeedLocks.delete(gymId);
  }
}

function gymMembershipDateKey(value: string): string {
  return value.slice(0, 10);
}

function gymDayBeforeDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function resolveMembershipEndDate(currentEndsAt: string | null, effectiveFrom: string): string {
  const effectiveDate = gymMembershipDateKey(effectiveFrom);
  if (!currentEndsAt) return gymDayBeforeDateKey(effectiveDate);
  const currentDate = gymMembershipDateKey(currentEndsAt);
  if (currentDate >= effectiveDate) return gymDayBeforeDateKey(effectiveDate);
  return currentDate;
}

async function deactivateOtherActiveMemberMemberships(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  input: { memberId: string; effectiveFrom: string; excludeId?: string },
): Promise<GymResult<null>> {
  let query = supabase
    .from(MEMBERSHIPS)
    .select('id, ends_at')
    .eq('member_id', input.memberId)
    .eq('status', 'active');

  if (input.excludeId) {
    query = query.neq('id', input.excludeId);
  }

  const { data, error } = await query;
  if (error) {
    return { error: friendlyError(error, 'No se pudo actualizar las tarifas activas.') };
  }

  for (const row of data ?? []) {
    const currentEndsAt = row.ends_at ? String(row.ends_at).slice(0, 10) : null;
    const { error: updateError } = await supabase
      .from(MEMBERSHIPS)
      .update({
        status: 'cancelled',
        ends_at: resolveMembershipEndDate(currentEndsAt, input.effectiveFrom),
      })
      .eq('id', row.id as string);

    if (updateError) {
      return { error: friendlyError(updateError, 'No se pudo desactivar la tarifa anterior.') };
    }
  }

  return { data: null };
}

async function reconcileDuplicateActiveMemberMemberships(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  memberId: string,
): Promise<GymResult<null>> {
  const { data, error } = await supabase
    .from(MEMBERSHIPS)
    .select('id, starts_at, ends_at, created_at')
    .eq('member_id', memberId)
    .eq('status', 'active')
    .order('starts_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return { error: friendlyError(error, 'No se pudo comprobar las tarifas activas.') };
  }

  if (!data || data.length <= 1) return { data: null };

  const [keep, ...rest] = data;
  const effectiveFrom = gymMembershipDateKey(String(keep.starts_at));

  for (const row of rest) {
    const currentEndsAt = row.ends_at ? String(row.ends_at).slice(0, 10) : null;
    const { error: updateError } = await supabase
      .from(MEMBERSHIPS)
      .update({
        status: 'cancelled',
        ends_at: resolveMembershipEndDate(currentEndsAt, effectiveFrom),
      })
      .eq('id', row.id as string);

    if (updateError) {
      return { error: friendlyError(updateError, 'No se pudo corregir las tarifas duplicadas.') };
    }
  }

  return { data: null };
}

export async function fetchMemberMemberships(
  memberId: string,
): Promise<GymResult<GymMemberMembership[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const reconcileResult = await reconcileDuplicateActiveMemberMemberships(supabase, memberId);
  if (reconcileResult.error) return { error: reconcileResult.error };

  const { data, error } = await supabase
    .from(MEMBERSHIPS)
    .select(`${MEMBERSHIP_SELECT}, gym_membership_plans(name)`)
    .eq('member_id', memberId)
    .order('starts_at', { ascending: false });

  if (error) return { error: friendlyError(error, 'No se pudo cargar la membresía.') };

  const rows = (data ?? []) as unknown as Array<Row & { gym_membership_plans: { name: string } | null }>;

  return {
    data: rows.map((row) => ({
      ...mapMembership(row),
      planName: row.gym_membership_plans?.name,
    })),
  };
}

export async function assignMemberMembership(input: {
  gymId: string;
  memberId: string;
  planId: string;
  startsAt: string;
  endsAt?: string;
}): Promise<GymResult<null>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const deactivateResult = await deactivateOtherActiveMemberMemberships(supabase, {
    memberId: input.memberId,
    effectiveFrom: input.startsAt,
  });
  if (deactivateResult.error) return deactivateResult;

  const { error } = await supabase.from(MEMBERSHIPS).insert({
    gym_id: input.gymId,
    member_id: input.memberId,
    plan_id: input.planId,
    starts_at: input.startsAt,
    ends_at: input.endsAt || null,
    status: 'active',
  });

  if (error) return { error: friendlyError(error, 'No se pudo asignar la tarifa.') };

  const { data: plan } = await supabase
    .from(PLANS)
    .select('name')
    .eq('id', input.planId)
    .maybeSingle();

  if (isWellhubPlanName((plan as { name?: string } | null)?.name)) {
    await supabase
      .from(MEMBERS)
      .update({ signup_source: 'wellhub' })
      .eq('id', input.memberId);
  }

  return { data: null };
}

export async function setMembershipStatus(
  membershipId: string,
  status: GymMembershipStatus,
): Promise<GymResult<null>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  if (status === 'active') {
    const { data: membership, error: fetchError } = await supabase
      .from(MEMBERSHIPS)
      .select('member_id, starts_at')
      .eq('id', membershipId)
      .maybeSingle();

    if (fetchError) {
      return { error: friendlyError(fetchError, 'No se pudo cargar la tarifa.') };
    }
    if (!membership) return { error: 'Tarifa no encontrada.' };

    const deactivateResult = await deactivateOtherActiveMemberMemberships(supabase, {
      memberId: membership.member_id as string,
      effectiveFrom: String(membership.starts_at),
      excludeId: membershipId,
    });
    if (deactivateResult.error) return deactivateResult;
  }

  const { error } = await supabase.from(MEMBERSHIPS).update({ status }).eq('id', membershipId);
  if (error) return { error: friendlyError(error, 'No se pudo actualizar la membresía.') };
  return { data: null };
}

export interface GymMemberMembershipUpdateInput {
  planId: string;
  startsAt: string;
  endsAt?: string;
  status: GymMembershipStatus;
}

export async function updateMemberMembership(
  membershipId: string,
  input: GymMemberMembershipUpdateInput,
): Promise<GymResult<null>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  if (input.status === 'active') {
    const { data: membership, error: fetchError } = await supabase
      .from(MEMBERSHIPS)
      .select('member_id')
      .eq('id', membershipId)
      .maybeSingle();

    if (fetchError) {
      return { error: friendlyError(fetchError, 'No se pudo cargar la tarifa.') };
    }
    if (!membership) return { error: 'Tarifa no encontrada.' };

    const deactivateResult = await deactivateOtherActiveMemberMemberships(supabase, {
      memberId: membership.member_id as string,
      effectiveFrom: input.startsAt,
      excludeId: membershipId,
    });
    if (deactivateResult.error) return deactivateResult;
  }

  const { error } = await supabase
    .from(MEMBERSHIPS)
    .update({
      plan_id: input.planId,
      starts_at: input.startsAt,
      ends_at: input.endsAt?.trim() ? input.endsAt.trim() : null,
      status: input.status,
    })
    .eq('id', membershipId);

  if (error) return { error: friendlyError(error, 'No se pudo actualizar la tarifa.') };
  return { data: null };
}

export async function deleteMemberMembership(membershipId: string): Promise<GymResult<null>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(MEMBERSHIPS).delete().eq('id', membershipId);
  if (error) return { error: friendlyError(error, 'No se pudo eliminar la tarifa.') };
  return { data: null };
}

// ---- Entrenamientos (programación + modalidad + día) ----

function scheduledDateKey(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined;
  return value.slice(0, 10);
}

function publishedTimeValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const match = value.match(/^(\d{2}:\d{2})/);
  return match?.[1];
}

function mapSessionDraft(value: unknown): SessionDraft | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const row = value as Record<string, unknown>;
  if (typeof row.name !== 'string') return undefined;
  return value as SessionDraft;
}

function mapProgramLink(row: Row): GymProgramLink {
  const weekday = num(row.weekday);
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    programId: row.program_id as string,
    classTypeId: text(row.class_type_id),
    memberId: text(row.member_id),
    weekday: weekday != null && weekday >= 0 && weekday <= 6 ? weekday : undefined,
    scheduledDate: scheduledDateKey(row.scheduled_date),
    publishedDate: scheduledDateKey(row.published_date),
    publishedTime: publishedTimeValue(row.published_time),
    sessionDraft: mapSessionDraft(row.session_draft),
    label: text(row.label),
    createdAt: (row.created_at as string) ?? '',
  };
}

function isMissingColumn(error: PgError, column: string) {
  const message = error?.message?.toLowerCase() ?? '';
  return message.includes(column) && (message.includes('does not exist') || message.includes('schema cache'));
}

function isMissingWeekdayColumn(error: PgError) {
  return isMissingColumn(error, 'weekday') || (error?.message?.toLowerCase().includes('weekday') ?? false);
}

function isMissingScheduledDateColumn(error: PgError) {
  return isMissingColumn(error, 'scheduled_date') || (error?.message?.toLowerCase().includes('scheduled_date') ?? false);
}

function isMissingPublishedDateColumn(error: PgError) {
  return isMissingColumn(error, 'published_date') || (error?.message?.toLowerCase().includes('published_date') ?? false);
}

function isMissingPublishedTimeColumn(error: PgError) {
  return isMissingColumn(error, 'published_time') || (error?.message?.toLowerCase().includes('published_time') ?? false);
}

function isMissingSessionDraftColumn(error: PgError) {
  return isMissingColumn(error, 'session_draft') || (error?.message?.toLowerCase().includes('session_draft') ?? false);
}

async function fetchProgramNamesByIds(ids: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const names = new Map<string, string>();
  if (unique.length === 0) return names;

  const supabase = getSupabase();
  if (!supabase) return names;

  const { data } = await supabase.from('programas').select('id, name').in('id', unique);
  for (const row of data ?? []) {
    names.set(row.id as string, (row.name as string) ?? '');
  }
  return names;
}

async function decorateProgramLinks(gymId: string, links: GymProgramLink[]): Promise<GymProgramLink[]> {
  const types = (await fetchGymClassTypes(gymId)).data ?? [];
  const typeById = new Map(types.map((type) => [type.id, type]));
  const names = await fetchProgramNamesByIds(links.map((link) => link.programId));

  return links.map((link) => ({
    ...link,
    programName: names.get(link.programId) || link.label,
    classTypeName: link.classTypeId ? typeById.get(link.classTypeId)?.name : undefined,
    classTypeColor: link.classTypeId ? typeById.get(link.classTypeId)?.color : undefined,
  }));
}

export async function fetchGymProgramLinks(gymId: string): Promise<GymResult<GymProgramLink[]>> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const selects = [
    PROGRAM_LINK_SELECT,
    PROGRAM_LINK_SELECT_TIMES,
    PROGRAM_LINK_SELECT_DATES,
    PROGRAM_LINK_SELECT_SCHEDULED,
    PROGRAM_LINK_SELECT_WEEKDAY,
    PROGRAM_LINK_SELECT_FALLBACK,
  ];

  let rows: Row[] | null = null;

  for (const select of selects) {
    const query = supabase.from(PROGRAM_LINKS).select(select).eq('gym_id', gymId);
    const result = select.includes('scheduled_date')
      ? await query.order('scheduled_date', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false })
      : await query.order('created_at', { ascending: false });

    if (!result.error) {
      rows = (result.data ?? []) as unknown as Row[];
      break;
    }

    const missingColumn =
      isMissingSessionDraftColumn(result.error) ||
      isMissingPublishedTimeColumn(result.error) ||
      isMissingPublishedDateColumn(result.error) ||
      isMissingScheduledDateColumn(result.error) ||
      isMissingWeekdayColumn(result.error);
    if (!missingColumn) {
      return { error: friendlyError(result.error, 'No se pudieron cargar los entrenamientos.') };
    }
  }

  const links = (rows ?? []).map(mapProgramLink);
  return { data: await decorateProgramLinks(gymId, links) };
}

export async function fetchGymProgramLinkById(linkId: string): Promise<GymResult<GymProgramLink>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const selects = [
    PROGRAM_LINK_SELECT,
    PROGRAM_LINK_SELECT_TIMES,
    PROGRAM_LINK_SELECT_DATES,
    PROGRAM_LINK_SELECT_SCHEDULED,
    PROGRAM_LINK_SELECT_WEEKDAY,
    PROGRAM_LINK_SELECT_FALLBACK,
  ];

  for (const select of selects) {
    const { data, error } = await supabase
      .from(PROGRAM_LINKS)
      .select(select)
      .eq('id', linkId)
      .maybeSingle();

    if (!error && data) {
      const link = mapProgramLink(data as Row);
      const [decorated] = await decorateProgramLinks(link.gymId, [link]);
      return { data: decorated };
    }

    const missingColumn =
      isMissingSessionDraftColumn(error) ||
      isMissingPublishedTimeColumn(error) ||
      isMissingPublishedDateColumn(error) ||
      isMissingScheduledDateColumn(error) ||
      isMissingWeekdayColumn(error);
    if (!missingColumn) {
      return { error: friendlyError(error, 'No se pudo cargar el entrenamiento.') };
    }
  }

  return { error: 'No se encontró el entrenamiento.' };
}

export interface GymProgramLinkInput {
  programId: string;
  classTypeId: string;
  publishedDate: string;
  publishedTime: string;
  scheduledDate: string;
  sessionDraft?: SessionDraft;
  label?: string;
}

export async function saveGymProgramLink(
  gymId: string,
  input: GymProgramLinkInput & { id?: string },
): Promise<GymResult<GymProgramLink>> {
  if (!input.programId) return { error: 'Elige una programación.' };
  if (!input.classTypeId) return { error: 'Elige una modalidad del gimnasio.' };

  const publishedDate = scheduledDateKey(input.publishedDate);
  if (!publishedDate) return { error: 'Elige la fecha de publicación.' };

  const publishedTime = publishedTimeValue(input.publishedTime);
  if (!publishedTime) return { error: 'Elige la hora de publicación.' };

  const scheduledDate = scheduledDateKey(input.scheduledDate);
  if (!scheduledDate) return { error: 'Elige la fecha del entrenamiento.' };

  const date = new Date(`${scheduledDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { error: 'Elige la fecha del entrenamiento.' };

  if (publishedDate > scheduledDate) {
    return { error: 'La fecha de publicación no puede ser posterior a la del entrenamiento.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data: sessionData } = await supabase.auth.getSession();
  const payload = {
    gym_id: gymId,
    program_id: input.programId,
    class_type_id: input.classTypeId,
    weekday: toWeekdayIndex(date),
    scheduled_date: scheduledDate,
    published_date: publishedDate,
    published_time: publishedTime,
    session_draft: input.sessionDraft ?? null,
    label: input.label?.trim() || input.sessionDraft?.name?.trim() || null,
    created_by: sessionData.session?.user.id ?? null,
  };

  const query = input.id
    ? supabase.from(PROGRAM_LINKS).update(payload).eq('id', input.id)
    : supabase.from(PROGRAM_LINKS).insert(payload);

  const { data, error } = await query.select(PROGRAM_LINK_SELECT).maybeSingle();

  if (error) {
    if (
      isMissingSessionDraftColumn(error) ||
      isMissingPublishedTimeColumn(error) ||
      isMissingPublishedDateColumn(error) ||
      isMissingScheduledDateColumn(error)
    ) {
      return { error: 'Falta aplicar las fechas del calendario: ejecuta npm run supabase:gym-program-links-date' };
    }
    if (isMissingWeekdayColumn(error)) {
      return { error: 'Falta aplicar el día de la semana: ejecuta npm run supabase:gym-program-links-weekday' };
    }
    return { error: friendlyError(error, 'No se pudo guardar el entrenamiento.') };
  }
  if (!data) return { error: 'No se pudo guardar el entrenamiento.' };

  const [decorated] = await decorateProgramLinks(gymId, [mapProgramLink(data as Row)]);
  return { data: decorated };
}

export async function deleteGymProgramLink(linkId: string): Promise<GymResult<null>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(PROGRAM_LINKS).delete().eq('id', linkId);
  if (error) return { error: friendlyError(error, 'No se pudo quitar el entrenamiento.') };
  return { data: null };
}
