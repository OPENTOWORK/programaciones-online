import type { Gym, GymBooking, GymClass, GymMember, GymMemberMembership, GymMembershipPlan, GymBookingStatus } from '@/lib/gymTypes';
import { gymMemberFullName, gymMemberInitials } from '@/lib/gymTypes';
import {
  createGymBooking,
  fetchGymClasses,
  fetchGymMembershipPlans,
  fetchMemberBookings,
  fetchMemberMemberships,
  setGymBookingStatus,
  type GymResult,
} from '@/lib/gymService';
import { fetchGymProducts } from '@/lib/gymShopService';
import type { GymProduct } from '@/lib/gymTypes';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const MEMBER_SELECT =
  'id, gym_id, user_id, first_name, last_name, email, phone, birth_date, status, pipeline_stage, notes, joined_at, created_at, updated_at';
const GYM_SELECT =
  'id, name, slug, logo_url, email, phone, address, city, postal_code, country, timezone, status, owner_user_id, created_at, updated_at';

export const ATHLETE_GYM_ACCESS_MIGRATION_HINT =
  'Falta aplicar el acceso de atletas a gimnasios: ejecuta npm run supabase:gym-athlete-access';

export interface AthleteLinkedGym {
  member: GymMember;
  gym: Gym;
}

export interface GymClassRosterSlot {
  bookingId: string;
  memberId: string;
  userId?: string;
  name: string;
  initials: string;
  photoUrl?: string;
  status: GymBookingStatus;
  isViewer: boolean;
}

export interface GymClassRoster {
  classId: string;
  slots: Array<GymClassRosterSlot | null>;
  waiting: GymClassRosterSlot[];
}

type Row = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function mapGym(row: Row): Gym {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: text(row.slug),
    logoUrl: text(row.logo_url),
    email: text(row.email),
    phone: text(row.phone),
    address: text(row.address),
    city: text(row.city),
    postalCode: text(row.postal_code),
    country: text(row.country),
    timezone: (row.timezone as string) ?? 'Europe/Madrid',
    status: (row.status as Gym['status']) ?? 'active',
    ownerUserId: text(row.owner_user_id),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapMember(row: Row): GymMember {
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    userId: text(row.user_id),
    firstName: (row.first_name as string) ?? '',
    lastName: (row.last_name as string) ?? '',
    email: text(row.email),
    phone: text(row.phone),
    birthDate: text(row.birth_date),
    status: (row.status as GymMember['status']) ?? 'active',
    pipelineStage: ((row.pipeline_stage as GymMember['pipelineStage']) ?? 'activo') as GymMember['pipelineStage'],
    notes: text(row.notes),
    joinedAt: row.joined_at as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function friendlyError(error: { message?: string } | null | undefined, fallback: string) {
  if (!error) return fallback;
  const message = error.message ?? '';
  if (/row-level security|permission denied|violates/i.test(message)) {
    return 'No tienes permiso para acceder a este gimnasio.';
  }
  if (/schema cache|does not exist|could not find the table/i.test(message)) {
    return ATHLETE_GYM_ACCESS_MIGRATION_HINT;
  }
  return message || fallback;
}

/** Gimnasios donde el atleta tiene ficha vinculada a su cuenta. */
export async function fetchMyLinkedGyms(): Promise<GymResult<AthleteLinkedGym[]>> {
  if (!isSupabaseConfigured) return { data: [] };

  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return { data: [] };

  const { data, error } = await supabase
    .from('gym_members')
    .select(`${MEMBER_SELECT}, gyms!inner(${GYM_SELECT})`)
    .eq('user_id', userId)
    .in('status', ['active', 'inactive'])
    .order('created_at', { ascending: false });

  if (error) return { error: friendlyError(error, 'No se pudieron cargar tus gimnasios.') };

  const rows = (data ?? []) as unknown as Array<Row & { gyms: Row | Row[] }>;
  const linked = rows
    .map((row) => {
      const gymRow = Array.isArray(row.gyms) ? row.gyms[0] : row.gyms;
      if (!gymRow) return null;
      return { member: mapMember(row), gym: mapGym(gymRow) };
    })
    .filter((entry): entry is AthleteLinkedGym => entry !== null);

  return { data: linked };
}

export interface AthleteGymPortalData {
  linked: AthleteLinkedGym;
  classes: GymClass[];
  bookings: GymBooking[];
  memberships: GymMemberMembership[];
  plans: GymMembershipPlan[];
  rosters: Record<string, GymClassRoster>;
  products: GymProduct[];
}

const BOOKING_SELECT =
  'id, gym_id, class_id, member_id, status, booked_at, checked_in_at, cancelled_at';

async function signedPhotoUrls(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  paths: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  const result = new Map<string, string>();
  if (unique.length === 0) return result;

  await Promise.all(
    unique.map(async (path) => {
      const { data, error } = await supabase.storage.from('fotos').createSignedUrl(path, 60 * 60);
      if (!error && data?.signedUrl) result.set(path, data.signedUrl);
    }),
  );

  return result;
}

export async function fetchGymClassRosters(
  gymId: string,
  classIds: string[],
  viewerMemberId?: string,
): Promise<GymResult<Record<string, GymClassRoster>>> {
  if (classIds.length === 0) return { data: {} };

  const supabase = getSupabase();
  if (!supabase) return { data: {} };

  const { data: sessionData } = await supabase.auth.getSession();
  const viewerUserId = sessionData.session?.user.id;

  const { data, error } = await supabase
    .from('gym_bookings')
    .select(`${BOOKING_SELECT}, gym_members!inner(user_id, first_name, last_name)`)
    .eq('gym_id', gymId)
    .in('class_id', classIds)
    .in('status', ['confirmed', 'waiting', 'attended'])
    .order('booked_at', { ascending: true });

  if (error) return { error: friendlyError(error, 'No se pudo cargar el aforo de las clases.') };

  const rows = (data ?? []) as unknown as Array<
    Row & {
      gym_members:
        | { user_id: string | null; first_name: string; last_name: string }
        | Array<{ user_id: string | null; first_name: string; last_name: string }>;
    }
  >;

  const userIds = new Set<string>();
  for (const row of rows) {
    const memberRow = Array.isArray(row.gym_members) ? row.gym_members[0] : row.gym_members;
    if (memberRow?.user_id) userIds.add(memberRow.user_id);
  }

  const photoPathByUser = new Map<string, string>();
  if (userIds.size > 0) {
    const { data: photoRows } = await supabase
      .from('fotos')
      .select('user_id, storage_path')
      .eq('tipo', 'antes')
      .in('user_id', [...userIds]);

    for (const photo of photoRows ?? []) {
      const userId = photo.user_id as string;
      const path = photo.storage_path as string;
      if (userId && path) photoPathByUser.set(userId, path);
    }
  }

  const signedUrls = await signedPhotoUrls(supabase, [...photoPathByUser.values()]);

  const byClass = new Map<string, GymClassRosterSlot[]>();
  for (const row of rows) {
    const memberRow = Array.isArray(row.gym_members) ? row.gym_members[0] : row.gym_members;
    if (!memberRow) continue;

    const member = {
      firstName: (memberRow.first_name as string) ?? '',
      lastName: (memberRow.last_name as string) ?? '',
    };
    const userId = text(memberRow.user_id);
    const photoPath = userId ? photoPathByUser.get(userId) : undefined;
    const slot: GymClassRosterSlot = {
      bookingId: row.id as string,
      memberId: row.member_id as string,
      userId,
      name: gymMemberFullName(member),
      initials: gymMemberInitials(member),
      status: row.status as GymBookingStatus,
      isViewer: row.member_id === viewerMemberId || userId === viewerUserId,
      photoUrl: photoPath ? signedUrls.get(photoPath) : undefined,
    };

    const bucket = byClass.get(row.class_id as string) ?? [];
    bucket.push(slot);
    byClass.set(row.class_id as string, bucket);
  }

  const rosters: Record<string, GymClassRoster> = {};
  for (const classId of classIds) {
    const attendees = byClass.get(classId) ?? [];
    const confirmed = attendees.filter((slot) => slot.status === 'confirmed' || slot.status === 'attended');
    const waiting = attendees.filter((slot) => slot.status === 'waiting');

    rosters[classId] = {
      classId,
      slots: confirmed.map((slot) => slot),
      waiting,
    };
  }

  return { data: rosters };
}

function buildRosterGrid(
  classId: string,
  capacity: number,
  raw?: GymClassRoster,
): GymClassRoster {
  const confirmed = raw?.slots ?? [];
  const waiting = raw?.waiting ?? [];
  const slots: Array<GymClassRosterSlot | null> = Array.from({ length: capacity }, (_, index) =>
    confirmed[index] ?? null,
  );

  return { classId, slots, waiting };
}

export async function fetchAthleteGymPortal(
  gymId: string,
  range: { from: string; to: string },
): Promise<GymResult<AthleteGymPortalData>> {
  const linkedResult = await fetchMyLinkedGyms();
  if (linkedResult.error) return { error: linkedResult.error };

  const linked = linkedResult.data?.find((entry) => entry.gym.id === gymId);
  if (!linked) return { error: 'No tienes acceso a este gimnasio.' };

  const [classesResult, bookingsResult, membershipsResult, plansResult, productsResult] =
    await Promise.all([
    fetchGymClasses(gymId, range),
    fetchMemberBookings(linked.member.id),
    fetchMemberMemberships(linked.member.id),
    fetchGymMembershipPlans(gymId),
    fetchGymProducts(gymId),
  ]);

  const firstError =
    classesResult.error ??
    bookingsResult.error ??
    membershipsResult.error ??
    plansResult.error ??
    productsResult.error;
  if (firstError) return { error: firstError };

  const classes = (classesResult.data ?? []).filter((item) => item.status === 'scheduled');
  const classIds = classes.map((item) => item.id);
  const rostersResult = await fetchGymClassRosters(gymId, classIds, linked.member.id);
  if (rostersResult.error) return { error: rostersResult.error };

  const rosters: Record<string, GymClassRoster> = {};
  for (const gymClass of classes) {
    rosters[gymClass.id] = buildRosterGrid(
      gymClass.id,
      gymClass.capacity,
      rostersResult.data?.[gymClass.id],
    );
  }

  return {
    data: {
      linked,
      classes,
      bookings: bookingsResult.data ?? [],
      memberships: membershipsResult.data ?? [],
      plans: (plansResult.data ?? []).filter((plan) => plan.active),
      rosters,
      products: (productsResult.data ?? []).filter((product) => product.active),
    },
  };
}

export async function bookAthleteGymClass(input: {
  gymId: string;
  memberId: string;
  classId: string;
}): Promise<GymResult<GymBooking>> {
  return createGymBooking(input);
}

export async function cancelAthleteGymBooking(bookingId: string): Promise<GymResult<GymBooking>> {
  return setGymBookingStatus(bookingId, 'cancelled');
}

const MEMBERSHIP_PURCHASE_MIGRATION_HINT =
  'Falta aplicar la compra de tarifas: ejecuta npm run supabase:gym-athlete-membership-purchase';

function membershipPurchaseError(message: string) {
  if (message.includes('AUTH_REQUIRED')) return 'Inicia sesión para contratar una tarifa.';
  if (message.includes('NOT_LINKED')) return 'No tienes acceso a este gimnasio.';
  if (message.includes('PLAN_NOT_FOUND')) return 'Esta tarifa ya no está disponible.';
  if (message.includes('PLAN_INACTIVE')) return 'Esta tarifa ya no está activa.';
  if (message.includes('PLAN_NOT_PURCHASABLE')) {
    return 'Esta tarifa no se puede pagar online. Pregunta en recepción.';
  }
  if (/schema cache|does not exist|could not find the function/i.test(message)) {
    return MEMBERSHIP_PURCHASE_MIGRATION_HINT;
  }
  return message;
}

/** Contrata una tarifa del gimnasio para el atleta autenticado. */
export async function purchaseAthleteGymMembership(input: {
  gymId: string;
  planId: string;
}): Promise<GymResult<{ membershipId: string }>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.rpc('purchase_gym_membership_plan', {
    target_gym: input.gymId,
    target_plan: input.planId,
  });

  if (error) {
    return { error: membershipPurchaseError(error.message ?? 'No se pudo completar el pago.') };
  }

  if (!data || typeof data !== 'string') {
    return { error: 'No se pudo confirmar la contratación.' };
  }

  return { data: { membershipId: data } };
}

export interface LinkGymMemberAccountResult {
  userId?: string;
  linked?: boolean;
  error?: string;
}

/** Vincula la ficha CRM con la cuenta de la app por email (equipo del gimnasio). */
export async function linkGymMemberAccount(
  gymId: string,
  memberId: string,
  email?: string,
): Promise<LinkGymMemberAccountResult> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return { linked: false };

  const { data, error } = await supabase.rpc('link_gym_member_account', {
    target_gym: gymId,
    target_member: memberId,
    target_email: normalizedEmail,
  });

  if (error) {
    const message = error.message ?? '';
    if (message.includes('USER_NOT_FOUND')) return { linked: false };
    return { error: message || 'No se pudo vincular la cuenta del atleta.' };
  }

  if (!data || typeof data !== 'string') return { linked: false };
  return { userId: data, linked: true };
}
