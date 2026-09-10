import type { SessionDraft } from '@/lib/trainerSessionDraft';

export type GymStatus = 'active' | 'trial' | 'suspended' | 'cancelled';
export type GymUserRole = 'owner' | 'manager' | 'coach' | 'reception';
export type GymMemberStatus = 'active' | 'inactive' | 'blocked' | 'lead';
export type GymMemberPipelineStage =
  | 'potencial'
  | 'contactado'
  | 'prueba'
  | 'alta'
  | 'activo'
  | 'pausa'
  | 'baja';
export type GymClassStatus = 'scheduled' | 'completed' | 'cancelled';
export type GymBookingStatus = 'confirmed' | 'waiting' | 'cancelled' | 'attended' | 'no_show';
export type GymBillingPeriod = 'monthly' | 'quarterly' | 'annual' | 'one_time';
export type GymMembershipStatus = 'active' | 'expired' | 'cancelled' | 'paused';
export type GymPromotionDiscountType = 'percentage' | 'fixed' | 'free_trial';
export type GymSubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended';
export type GymMemberSignupSource = 'manual' | 'wellhub' | 'import';

export const GYM_STATUS_LABELS: Record<GymStatus, string> = {
  active: 'Activo',
  trial: 'En prueba',
  suspended: 'Suspendido',
  cancelled: 'Cancelado',
};

export const GYM_USER_ROLE_LABELS: Record<GymUserRole, string> = {
  owner: 'Propietario',
  manager: 'Gerente',
  coach: 'Entrenador',
  reception: 'Recepción',
};

export const GYM_MEMBER_STATUS_LABELS: Record<GymMemberStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  blocked: 'Bloqueado',
  lead: 'Miembro potencial',
};

export const GYM_MEMBER_KIND_LABELS = {
  member: 'Miembro',
  potential: 'Miembro potencial',
} as const;

export function isGymPotentialMember(status: GymMemberStatus) {
  return status === 'lead';
}

export const GYM_MEMBER_PIPELINE_STAGES: Array<{
  key: GymMemberPipelineStage;
  label: string;
  hint: string;
}> = [
  { key: 'potencial', label: 'Potencial', hint: 'Interesado, aún no contactado' },
  { key: 'contactado', label: 'Contactado', hint: 'Ya habéis hablado' },
  { key: 'prueba', label: 'Prueba', hint: 'Clase o semana de prueba' },
  { key: 'alta', label: 'Alta', hint: 'Se está apuntando' },
  { key: 'activo', label: 'Activo', hint: 'Miembro del gimnasio' },
  { key: 'pausa', label: 'Pausa', hint: 'Ha dejado de venir un tiempo' },
  { key: 'baja', label: 'Baja', hint: 'Ya no es cliente' },
];

export const GYM_MEMBER_PIPELINE_LABELS = Object.fromEntries(
  GYM_MEMBER_PIPELINE_STAGES.map((stage) => [stage.key, stage.label]),
) as Record<GymMemberPipelineStage, string>;

export function defaultGymMemberPipelineStage(status: GymMemberStatus): GymMemberPipelineStage {
  if (status === 'lead') return 'potencial';
  if (status === 'inactive') return 'pausa';
  if (status === 'blocked') return 'baja';
  return 'activo';
}

export function gymMemberStatusForPipeline(stage: GymMemberPipelineStage): GymMemberStatus {
  if (stage === 'potencial' || stage === 'contactado' || stage === 'prueba') return 'lead';
  if (stage === 'pausa') return 'inactive';
  if (stage === 'baja') return 'blocked';
  return 'active';
}

/** Columna del tablero CRM según el estado real del miembro. */
export function gymMemberCrmColumn(
  member: Pick<GymMember, 'status' | 'pipelineStage'>,
): GymMemberPipelineStage {
  if (member.status === 'active') return 'activo';
  if (member.status === 'blocked') return 'baja';
  if (member.status === 'inactive') {
    return member.pipelineStage === 'baja' ? 'baja' : 'pausa';
  }
  return member.pipelineStage;
}

export function isGymMemberPipelineStage(value: string | undefined): value is GymMemberPipelineStage {
  return GYM_MEMBER_PIPELINE_STAGES.some((stage) => stage.key === value);
}

export const GYM_BOOKING_STATUS_LABELS: Record<GymBookingStatus, string> = {
  confirmed: 'Confirmada',
  waiting: 'Lista de espera',
  cancelled: 'Cancelada',
  attended: 'Asistió',
  no_show: 'No asistió',
};

export const GYM_CLASS_STATUS_LABELS: Record<GymClassStatus, string> = {
  scheduled: 'Programada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export const GYM_BILLING_PERIOD_LABELS: Record<GymBillingPeriod, string> = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  annual: 'Anual',
  one_time: 'Pago único',
};

export const GYM_MEMBERSHIP_STATUS_LABELS: Record<GymMembershipStatus, string> = {
  active: 'Activa',
  expired: 'Caducada',
  cancelled: 'Cancelada',
  paused: 'Pausada',
};

export const GYM_PROMOTION_DISCOUNT_TYPE_LABELS: Record<GymPromotionDiscountType, string> = {
  percentage: 'Porcentaje',
  fixed: 'Importe fijo',
  free_trial: 'Prueba gratuita',
};

export const GYM_SUBSCRIPTION_STATUS_LABELS: Record<GymSubscriptionStatus, string> = {
  trial: 'En prueba',
  active: 'Activa',
  past_due: 'Pago pendiente',
  cancelled: 'Cancelada',
  suspended: 'Suspendida',
};

export interface Gym {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  timezone: string;
  status: GymStatus;
  ownerUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GymUser {
  id: string;
  gymId: string;
  userId: string;
  role: GymUserRole;
  createdAt: string;
  name?: string;
  email?: string;
}

export interface GymMember {
  id: string;
  gymId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  status: GymMemberStatus;
  pipelineStage: GymMemberPipelineStage;
  signupSource?: GymMemberSignupSource;
  wellhubUserId?: string;
  wellhubSyncedAt?: string;
  notes?: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GymClassType {
  id: string;
  gymId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  capacity: number;
  color?: string;
  active: boolean;
}

export interface GymClass {
  id: string;
  gymId: string;
  classTypeId?: string;
  coachUserId?: string;
  title?: string;
  startAt: string;
  endAt: string;
  capacity: number;
  location?: string;
  status: GymClassStatus;
  /** Nombre del tipo de clase, resuelto al cargar. */
  classTypeName?: string;
  classTypeColor?: string;
  coachName?: string;
  bookedCount: number;
  waitingCount: number;
}

export interface GymBooking {
  id: string;
  gymId: string;
  classId: string;
  memberId: string;
  status: GymBookingStatus;
  bookedAt: string;
  checkedInAt?: string;
  cancelledAt?: string;
  memberName?: string;
  classTitle?: string;
  classStartAt?: string;
}

export interface GymMembershipPlan {
  id: string;
  gymId: string;
  name: string;
  description?: string;
  price?: number;
  billingPeriod: GymBillingPeriod;
  /** Días de validez al asignar la tarifa. Vacío = según periodo de facturación. */
  validityDays?: number;
  maxBookings?: number;
  active: boolean;
}

export function formatPlanValidityLabel(
  plan: Pick<GymMembershipPlan, 'validityDays'>,
): string | null {
  if (plan.validityDays === undefined || plan.validityDays <= 0) return null;
  return `Caduca a los ${plan.validityDays} día${plan.validityDays === 1 ? '' : 's'}`;
}

export interface GymPromotion {
  id: string;
  gymId: string;
  name: string;
  description?: string;
  discountType: GymPromotionDiscountType;
  discountValue?: number;
  startsAt?: string;
  endsAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GymMemberMembership {
  id: string;
  gymId: string;
  memberId: string;
  planId?: string;
  planName?: string;
  startsAt: string;
  endsAt?: string;
  status: GymMembershipStatus;
}

export interface GymSaasPlan {
  id: string;
  name: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  maxMembers?: number;
  maxStaff?: number;
  maxLocations?: number;
  active: boolean;
}

export interface GymSubscription {
  id: string;
  gymId: string;
  planId?: string;
  planName?: string;
  status: GymSubscriptionStatus;
  startsAt: string;
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
}

export interface GymDashboardStats {
  gymId: string;
  activeMembers: number;
  newMembersThisMonth: number;
  totalMembers: number;
  classesToday: number;
  bookingsToday: number;
  wellhubBookingsToday: number;
  bookingsLast30Days: number;
  membershipsExpiringSoon: number;
}

export interface GymAdminActivityEntry {
  id: string;
  gymId: string;
  actorUserId?: string;
  action: string;
  detail?: string;
  createdAt: string;
}

export interface GymProgramLink {
  id: string;
  gymId: string;
  programId: string;
  programName?: string;
  classTypeId?: string;
  classTypeName?: string;
  classTypeColor?: string;
  memberId?: string;
  /** 0 = lunes … 6 = domingo. */
  weekday?: number;
  /** Fecha concreta del entrenamiento `aaaa-mm-dd`. */
  scheduledDate?: string;
  /** Fecha en la que se publica `aaaa-mm-dd`. */
  publishedDate?: string;
  /** Hora de publicación `hh:mm`. */
  publishedTime?: string;
  /** Contenido del entreno, en el mismo formato que usan los entrenadores. */
  sessionDraft?: SessionDraft;
  label?: string;
  createdAt: string;
}

/** Lunes = 0, como el horario semanal del gimnasio. */
export const GYM_WEEKDAY_LABELS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export function gymWeekdayLabel(weekday?: number) {
  if (weekday == null || weekday < 0 || weekday > 6) return 'Sin día';
  return GYM_WEEKDAY_LABELS[weekday];
}

export function gymTrainingDateLabel(dateKey?: string, weekday?: number) {
  if (!dateKey) return gymWeekdayLabel(weekday);
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return gymWeekdayLabel(weekday);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function gymMemberFullName(member: Pick<GymMember, 'firstName' | 'lastName'>) {
  return `${member.firstName} ${member.lastName}`.trim() || 'Miembro';
}

export function gymMemberInitials(member: Pick<GymMember, 'firstName' | 'lastName'>) {
  const first = member.firstName.trim()[0] ?? '';
  const last = member.lastName.trim()[0] ?? '';
  return `${first}${last}`.toUpperCase() || 'M';
}

export function gymUserDisplayName(user: Pick<GymUser, 'name' | 'email'>) {
  return user.name?.trim() || user.email || 'Entrenador';
}

export function gymUserInitials(user: Pick<GymUser, 'name' | 'email'>) {
  const source = user.name?.trim() || user.email || 'E';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/** Los roles que pueden cambiar ajustes, tarifas y usuarios del gimnasio. */
export function canManageGym(role?: GymUserRole, isGlobalAdmin = false) {
  return isGlobalAdmin || role === 'owner' || role === 'manager';
}

/** Los roles que pueden operar el día a día: reservas, asistencia, miembros. */
export function canOperateGym(role?: GymUserRole, isGlobalAdmin = false) {
  return isGlobalAdmin || role !== undefined;
}

export type GymTaskStatus = 'pending' | 'in_progress' | 'completed';
export type GymTaskPriority = 'low' | 'medium' | 'high';
export type GymTaskRecurrence = 'once' | 'daily' | 'weekly' | 'monthly';

export const GYM_TASK_STATUS_LABELS: Record<GymTaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  completed: 'Hecha',
};

export const GYM_TASK_PRIORITY_LABELS: Record<GymTaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export const GYM_TASK_RECURRENCE_LABELS: Record<GymTaskRecurrence, string> = {
  once: 'Una vez',
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

export const GYM_TASK_RECURRENCE_ORDER: GymTaskRecurrence[] = [
  'once',
  'daily',
  'weekly',
  'monthly',
];

export interface GymTask {
  id: string;
  gymId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assigneeName?: string;
  dueAt?: string;
  priority: GymTaskPriority;
  recurrence: GymTaskRecurrence;
  status: GymTaskStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type GymProductMovementKind = 'sale' | 'restock' | 'adjustment';

export const GYM_PRODUCT_MOVEMENT_LABELS: Record<GymProductMovementKind, string> = {
  sale: 'Venta',
  restock: 'Entrada',
  adjustment: 'Ajuste',
};

export interface GymProduct {
  id: string;
  gymId: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  stock: number;
  lowStockAlert: number;
  unit: string;
  active: boolean;
  imagePath?: string;
  imageThemes?: import('@/constants/appThemes').AppThemeId[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GymProductInput {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  stock: number;
  lowStockAlert?: number;
  unit?: string;
  active?: boolean;
}

export interface GymProductMovement {
  id: string;
  gymId: string;
  productId: string;
  productName?: string;
  kind: GymProductMovementKind;
  quantity: number;
  unitPrice?: number;
  note?: string;
  createdAt: string;
}
