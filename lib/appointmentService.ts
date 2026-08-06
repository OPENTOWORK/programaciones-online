import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchProfileNames } from '@/lib/trainerNames';
import type { Appointment, AppointmentStatus } from '@/lib/types';

/* La agenda es común a todo el equipo de entrenadores, igual que el tablero CRM: `trainer_id` dice
 * quién atiende la cita, no de quién es la vista. */
const TABLE = 'appointments';

const SELECT_COLUMNS =
  'id, athlete_id, trainer_id, created_by, title, notes, starts_at, duration_minutes, meeting_url, status, cancelled_by, created_at, updated_at';

export interface AppointmentBoard {
  appointments: Appointment[];
  /** false si la tabla aún no existe en Supabase: las citas se quedan solo en esta sesión. */
  persistent: boolean;
}

export interface AppointmentDraft {
  athleteId: string;
  title: string;
  notes?: string;
  /** Inicio en ISO. */
  startsAt: string;
  durationMinutes: number;
  meetingUrl?: string;
}

export interface AppointmentContext {
  userId: string;
  isTrainer: boolean;
  useLocalStore: boolean;
}

export const APPOINTMENTS_MIGRATION_HINT =
  'Falta la migración de citas en Supabase: ejecuta npm run supabase:appointments';

// ---- Almacén local en memoria (modo demo o respaldo si la tabla no existe todavía) ----
let localAppointments: Appointment[] = [];

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function mapRow(row: Record<string, unknown>): Appointment {
  return {
    id: row.id as string,
    athleteId: row.athlete_id as string,
    trainerId: (row.trainer_id as string | null) ?? undefined,
    createdBy: row.created_by as string,
    title: row.title as string,
    notes: (row.notes as string | null) ?? undefined,
    startsAt: row.starts_at as string,
    durationMinutes: row.duration_minutes as number,
    meetingUrl: (row.meeting_url as string | null) ?? undefined,
    status: row.status as AppointmentStatus,
    cancelledBy: (row.cancelled_by as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function localVisibleFor(context: Pick<AppointmentContext, 'userId' | 'isTrainer'>) {
  const visible = context.isTrainer
    ? localAppointments
    : localAppointments.filter((appointment) => appointment.athleteId === context.userId);

  return [...visible].sort((left, right) => right.startsAt.localeCompare(left.startsAt));
}

/** Pone nombre al atleta y al entrenador de cada cita para no mostrar identificadores en pantalla. */
async function attachNames(appointments: Appointment[]) {
  const ids = appointments.flatMap((appointment) =>
    [appointment.athleteId, appointment.trainerId].filter((id): id is string => Boolean(id)),
  );
  if (ids.length === 0) return appointments;

  const names = await fetchProfileNames(ids);
  if (names.size === 0) return appointments;

  return appointments.map((appointment) => ({
    ...appointment,
    athleteName: names.get(appointment.athleteId) ?? appointment.athleteName,
    trainerName: appointment.trainerId
      ? names.get(appointment.trainerId) ?? appointment.trainerName
      : undefined,
  }));
}

export async function fetchAppointments(
  context: Pick<AppointmentContext, 'userId' | 'isTrainer'> & { isDemoMode: boolean },
): Promise<AppointmentBoard> {
  // `persistent` solo avisa de que falta la migración: en demo el almacén local ya se elige aparte.
  if (context.isDemoMode || !isSupabaseConfigured) {
    return { appointments: localVisibleFor(context), persistent: true };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { appointments: localVisibleFor(context), persistent: true };
  }

  const query = supabase.from(TABLE).select(SELECT_COLUMNS).order('starts_at', { ascending: false });
  const { data, error } = context.isTrainer ? await query : await query.eq('athlete_id', context.userId);

  if (error) {
    if (isMissingTableError(error)) {
      return { appointments: localVisibleFor(context), persistent: false };
    }
    throw new Error(error.message);
  }

  const appointments = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  return { appointments: await attachNames(appointments), persistent: true };
}

export async function createAppointment(
  draft: AppointmentDraft,
  context: AppointmentContext,
): Promise<{ appointment?: Appointment; error?: string }> {
  const base: Appointment = {
    id: `local-appointment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    athleteId: draft.athleteId,
    // Cuando la pide el atleta se queda sin entrenador hasta que uno la confirma.
    trainerId: context.isTrainer ? context.userId : undefined,
    createdBy: context.userId,
    title: draft.title,
    notes: draft.notes,
    startsAt: draft.startsAt,
    durationMinutes: draft.durationMinutes,
    meetingUrl: draft.meetingUrl,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (context.useLocalStore) {
    localAppointments = [...localAppointments, base];
    return { appointment: base };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'No se pudo conectar con Supabase.' };

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      athlete_id: base.athleteId,
      trainer_id: base.trainerId ?? null,
      created_by: base.createdBy,
      title: base.title,
      notes: base.notes ?? null,
      starts_at: base.startsAt,
      duration_minutes: base.durationMinutes,
      meeting_url: base.meetingUrl ?? null,
      status: base.status,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    if (isMissingTableError(error)) {
      localAppointments = [...localAppointments, base];
      return { appointment: base, error: APPOINTMENTS_MIGRATION_HINT };
    }
    return { error: error?.message ?? 'No se pudo guardar la cita.' };
  }

  return { appointment: mapRow(data as Record<string, unknown>) };
}

/** Confirmar una cita propuesta. Si la pidió el atleta, el entrenador que confirma se queda a cargo. */
export async function confirmAppointment(
  appointment: Appointment,
  context: AppointmentContext,
): Promise<{ appointment?: Appointment; error?: string }> {
  const trainerId = context.isTrainer ? appointment.trainerId ?? context.userId : appointment.trainerId;

  return applyUpdate(
    appointment,
    { status: 'confirmed', trainer_id: trainerId ?? null },
    { ...appointment, status: 'confirmed', trainerId },
    context,
  );
}

export async function cancelAppointment(
  appointment: Appointment,
  context: AppointmentContext,
): Promise<{ appointment?: Appointment; error?: string }> {
  return applyUpdate(
    appointment,
    { status: 'cancelled', cancelled_by: context.userId },
    { ...appointment, status: 'cancelled', cancelledBy: context.userId },
    context,
  );
}

async function applyUpdate(
  appointment: Appointment,
  payload: Record<string, unknown>,
  optimistic: Appointment,
  context: AppointmentContext,
): Promise<{ appointment?: Appointment; error?: string }> {
  const updated: Appointment = { ...optimistic, updatedAt: new Date().toISOString() };

  if (context.useLocalStore || appointment.id.startsWith('local-appointment-')) {
    localAppointments = localAppointments.map((item) => (item.id === appointment.id ? updated : item));
    return { appointment: updated };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'No se pudo conectar con Supabase.' };

  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: updated.updatedAt })
    .eq('id', appointment.id)
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    if (isMissingTableError(error)) {
      return { error: APPOINTMENTS_MIGRATION_HINT };
    }
    return { error: error?.message ?? 'No se pudo actualizar la cita.' };
  }

  return { appointment: { ...mapRow(data as Record<string, unknown>), athleteName: appointment.athleteName } };
}
