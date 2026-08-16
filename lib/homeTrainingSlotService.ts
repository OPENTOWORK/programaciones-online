import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchProfileNames } from '@/lib/trainerNames';
import type { HomeTrainingSlot, HomeTrainingSlotStatus } from '@/lib/types';

const TABLE = 'home_training_slots';

const SELECT_COLUMNS =
  'id, trainer_id, created_by, title, notes, starts_at, duration_minutes, athlete_id, status, cancelled_by, created_at, updated_at';

export interface HomeTrainingSlotDraft {
  title: string;
  notes?: string;
  startsAt: string;
  durationMinutes: number;
}

export interface HomeTrainingSlotContext {
  userId: string;
  isTrainer: boolean;
  useLocalStore: boolean;
}

export const HOME_TRAINING_SLOTS_MIGRATION_HINT =
  'Falta la migración de huecos a domicilio en Supabase: ejecuta el SQL supabase/home-training-slots.sql';

let localSlots: HomeTrainingSlot[] = [];

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

function mapRow(row: Record<string, unknown>): HomeTrainingSlot {
  return {
    id: row.id as string,
    trainerId: row.trainer_id as string,
    createdBy: row.created_by as string,
    title: row.title as string,
    notes: (row.notes as string | null) ?? undefined,
    startsAt: row.starts_at as string,
    durationMinutes: row.duration_minutes as number,
    athleteId: (row.athlete_id as string | null) ?? undefined,
    status: row.status as HomeTrainingSlotStatus,
    cancelledBy: (row.cancelled_by as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function localVisibleFor(context: Pick<HomeTrainingSlotContext, 'userId' | 'isTrainer'>) {
  const visible = context.isTrainer
    ? localSlots
    : localSlots.filter(
        (slot) => slot.status === 'open' || slot.athleteId === context.userId,
      );

  return [...visible].sort((left, right) => right.startsAt.localeCompare(left.startsAt));
}

async function attachNames(slots: HomeTrainingSlot[]) {
  const ids = slots.flatMap((slot) =>
    [slot.athleteId, slot.trainerId].filter((id): id is string => Boolean(id)),
  );
  if (ids.length === 0) return slots;

  const names = await fetchProfileNames(ids);
  if (names.size === 0) return slots;

  return slots.map((slot) => ({
    ...slot,
    athleteName: slot.athleteId ? names.get(slot.athleteId) ?? slot.athleteName : undefined,
    trainerName: names.get(slot.trainerId) ?? slot.trainerName,
  }));
}

export async function fetchHomeTrainingSlots(
  context: Pick<HomeTrainingSlotContext, 'userId' | 'isTrainer'> & { isDemoMode: boolean },
): Promise<{ slots: HomeTrainingSlot[]; persistent: boolean }> {
  if (context.isDemoMode || !isSupabaseConfigured) {
    return { slots: localVisibleFor(context), persistent: true };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { slots: localVisibleFor(context), persistent: true };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLUMNS)
    .order('starts_at', { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      return { slots: localVisibleFor(context), persistent: false };
    }
    throw new Error(error.message);
  }

  const slots = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  return { slots: await attachNames(slots), persistent: true };
}

export async function createHomeTrainingSlot(
  draft: HomeTrainingSlotDraft,
  context: HomeTrainingSlotContext,
): Promise<{ slot?: HomeTrainingSlot; error?: string }> {
  if (!context.isTrainer) {
    return { error: 'Solo el entrenador puede publicar huecos.' };
  }

  const base: HomeTrainingSlot = {
    id: `local-home-slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    trainerId: context.userId,
    createdBy: context.userId,
    title: draft.title.trim() || 'Entrenamiento a domicilio',
    notes: draft.notes,
    startsAt: draft.startsAt,
    durationMinutes: draft.durationMinutes,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (context.useLocalStore) {
    localSlots = [...localSlots, base];
    return { slot: base };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'No se pudo conectar con Supabase.' };

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      trainer_id: base.trainerId,
      created_by: base.createdBy,
      title: base.title,
      notes: base.notes ?? null,
      starts_at: base.startsAt,
      duration_minutes: base.durationMinutes,
      athlete_id: null,
      status: 'open',
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    if (isMissingTableError(error)) {
      localSlots = [...localSlots, base];
      return { slot: base, error: HOME_TRAINING_SLOTS_MIGRATION_HINT };
    }
    return { error: error?.message ?? 'No se pudo publicar el hueco.' };
  }

  return { slot: mapRow(data as Record<string, unknown>) };
}

export async function bookHomeTrainingSlot(
  slot: HomeTrainingSlot,
  context: HomeTrainingSlotContext,
): Promise<{ slot?: HomeTrainingSlot; error?: string }> {
  if (context.isTrainer) {
    return { error: 'Los entrenadores no reservan huecos; los publican.' };
  }
  if (slot.status !== 'open') {
    return { error: 'Este hueco ya no está disponible.' };
  }

  return applyUpdate(
    slot,
    { athlete_id: context.userId, status: 'booked' },
    { ...slot, athleteId: context.userId, status: 'booked' },
    context,
  );
}

export async function cancelHomeTrainingSlot(
  slot: HomeTrainingSlot,
  context: HomeTrainingSlotContext,
): Promise<{ slot?: HomeTrainingSlot; error?: string }> {
  if (!context.isTrainer && slot.athleteId !== context.userId) {
    return { error: 'No puedes cancelar este hueco.' };
  }

  // El atleta cancela su reserva; el hueco queda cancelado (el entrenador puede publicar otro).
  if (!context.isTrainer && slot.status === 'booked') {
    return applyUpdate(
      slot,
      { status: 'cancelled', cancelled_by: context.userId },
      { ...slot, status: 'cancelled', cancelledBy: context.userId },
      context,
    );
  }

  return applyUpdate(
    slot,
    { status: 'cancelled', cancelled_by: context.userId },
    { ...slot, status: 'cancelled', cancelledBy: context.userId },
    context,
  );
}

async function applyUpdate(
  slot: HomeTrainingSlot,
  payload: Record<string, unknown>,
  optimistic: HomeTrainingSlot,
  context: HomeTrainingSlotContext,
): Promise<{ slot?: HomeTrainingSlot; error?: string }> {
  const updated: HomeTrainingSlot = { ...optimistic, updatedAt: new Date().toISOString() };

  if (context.useLocalStore || slot.id.startsWith('local-home-slot-')) {
    localSlots = localSlots.map((item) => (item.id === slot.id ? updated : item));
    return { slot: updated };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'No se pudo conectar con Supabase.' };

  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: updated.updatedAt })
    .eq('id', slot.id)
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    if (isMissingTableError(error)) {
      return { error: HOME_TRAINING_SLOTS_MIGRATION_HINT };
    }
    return { error: error?.message ?? 'No se pudo actualizar el hueco.' };
  }

  return {
    slot: {
      ...mapRow(data as Record<string, unknown>),
      athleteName: updated.athleteName ?? slot.athleteName,
      trainerName: slot.trainerName,
    },
  };
}
