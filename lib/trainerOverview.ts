import { fetchAssignedAthletesForTrainer } from '@/lib/athleteService';
import {
  groupPersonalizedPlans,
  type PersonalizedPlanGroup,
} from '@/lib/personalizedPlanGroups';
import { isDateWithinPlanValidity, type PlanValidity } from '@/lib/planValidity';
import { toLocalDateString } from '@/lib/sessionSchedule';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AthletePlan, AthletePlanType, AthleteSummary } from '@/lib/types';

/** Umbral único para considerar que una programación está a punto de acabar. */
export const PLAN_ENDING_SOON_DAYS = 7;

/** Filas de `workout_logs` que se leen para el último entreno y el feed de actividad. */
const WORKOUT_LOG_SCAN_LIMIT = 300;
const ACTIVITY_ITEM_LIMIT = 10;
/** Margen para no contar como "modificada" una programación recién creada. */
const PLAN_UPDATE_EPSILON_MS = 60_000;

const PLANS_TABLE = 'athlete_plans';
const LOGS_TABLE = 'workout_logs';

const PLAN_SELECT_FULL =
  'id, athlete_id, trainer_id, plan_type, title, content, created_at, updated_at, plan_group_id, session_number';
const PLAN_SELECT_BASE =
  'id, athlete_id, trainer_id, plan_type, title, content, created_at, updated_at';

export type TrainerClientStatus = 'active' | 'upcoming' | 'ending_soon' | 'ended' | 'no_plan';

export interface TrainerClientRow {
  athlete: AthleteSummary;
  status: TrainerClientStatus;
  planTitle?: string;
  validFrom?: string;
  validUntil?: string | null;
  /** Días hasta el fin de la programación. Negativo si ya terminó. */
  daysToEnd?: number;
  lastWorkoutDate?: string;
  pendingAlerts: number;
}

export type TrainerActivityKind = 'plan_created' | 'plan_updated' | 'workout_logged';

export interface TrainerActivityItem {
  id: string;
  kind: TrainerActivityKind;
  description: string;
  athleteName?: string;
  at: string;
}

export interface TrainerOverviewStats {
  plansCreated: number;
  plansActive: number;
  plansEnded: number;
  clientsWithoutPlan: number;
  clientsEndingSoon: number;
  nutritionPlans: number;
  homeTrainingPlans: number;
  totalWorkoutLogs: number;
  lastPlanCreatedAt?: string;
  lastPlanUpdatedAt?: string;
}

export interface TrainerOverview {
  clients: TrainerClientRow[];
  totalClients: number;
  activeClients: number;
  activePlanGroups: number;
  needsAttention: number;
  pendingAlerts: number;
  stats: TrainerOverviewStats;
  activity: TrainerActivityItem[];
}

export const EMPTY_TRAINER_OVERVIEW: TrainerOverview = {
  clients: [],
  totalClients: 0,
  activeClients: 0,
  activePlanGroups: 0,
  needsAttention: 0,
  pendingAlerts: 0,
  stats: {
    plansCreated: 0,
    plansActive: 0,
    plansEnded: 0,
    clientsWithoutPlan: 0,
    clientsEndingSoon: 0,
    nutritionPlans: 0,
    homeTrainingPlans: 0,
    totalWorkoutLogs: 0,
  },
  activity: [],
};

interface PlanRow {
  id: string;
  athlete_id: string;
  trainer_id: string;
  plan_type: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  plan_group_id?: string | null;
  session_number?: number | null;
}

interface LogRow {
  user_id: string;
  workout_name: string | null;
  scheduled_date: string | null;
  completed_at: string | null;
  updated_at: string | null;
}

type GroupState = 'active' | 'upcoming' | 'ending_soon' | 'ended';

interface GroupStatus {
  group: PersonalizedPlanGroup;
  state: GroupState;
  daysToEnd?: number;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysFromToday(isoDate: string, today: Date) {
  const target = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(target.getTime())) return undefined;
  const noon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  return Math.round((target.getTime() - noon.getTime()) / 86_400_000);
}

function resolveGroupState(validity: PlanValidity, today: Date): GroupStatus['state'] {
  const todayKey = toLocalDateString(today);

  if (validity.validUntil && validity.validUntil < todayKey) return 'ended';
  if (validity.validFrom && validity.validFrom > todayKey) return 'upcoming';
  if (!isDateWithinPlanValidity(today, validity)) return 'ended';

  if (validity.validUntil) {
    const remaining = daysFromToday(validity.validUntil, today);
    if (remaining !== undefined && remaining <= PLAN_ENDING_SOON_DAYS) return 'ending_soon';
  }

  return 'active';
}

function buildGroupStatus(group: PersonalizedPlanGroup, today: Date): GroupStatus {
  const state = resolveGroupState(group.validity, today);
  const daysToEnd = group.validity.validUntil
    ? daysFromToday(group.validity.validUntil, today)
    : undefined;

  return { group, state, daysToEnd };
}

const STATE_PRIORITY: Record<GroupState, number> = {
  ending_soon: 0,
  active: 1,
  upcoming: 2,
  ended: 3,
};

/** El grupo que define el estado del cliente: primero lo vigente, y de lo terminado lo más reciente. */
function pickRelevantGroup(statuses: GroupStatus[]): GroupStatus | undefined {
  return [...statuses].sort((left, right) => {
    const byState = STATE_PRIORITY[left.state] - STATE_PRIORITY[right.state];
    if (byState !== 0) return byState;

    if (left.state === 'ended' && right.state === 'ended') {
      return (right.daysToEnd ?? -Infinity) - (left.daysToEnd ?? -Infinity);
    }

    return (left.daysToEnd ?? Infinity) - (right.daysToEnd ?? Infinity);
  })[0];
}

function toAthletePlan(row: PlanRow): AthletePlan {
  return {
    id: row.id,
    athleteId: row.athlete_id,
    trainerId: row.trainer_id,
    planType: row.plan_type as AthletePlanType,
    title: row.title,
    content: row.content,
    planGroupId: row.plan_group_id ?? undefined,
    sessionNumber: row.session_number ?? undefined,
    createdAt: row.created_at,
  };
}

async function fetchPlanRows(trainerId: string): Promise<PlanRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const run = (select: string) =>
    supabase
      .from(PLANS_TABLE)
      .select(select)
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

  let result = await run(PLAN_SELECT_FULL);

  const message = result.error?.message?.toLowerCase() ?? '';
  if (result.error && (message.includes('plan_group_id') || message.includes('session_number'))) {
    result = await run(PLAN_SELECT_BASE);
  }

  if (result.error || !result.data) return [];
  return result.data as unknown as PlanRow[];
}

async function fetchLogRows(athleteIds: string[]): Promise<LogRow[]> {
  if (athleteIds.length === 0) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(LOGS_TABLE)
    .select('user_id, workout_name, scheduled_date, completed_at, updated_at')
    .in('user_id', athleteIds)
    .order('scheduled_date', { ascending: false, nullsFirst: false })
    .limit(WORKOUT_LOG_SCAN_LIMIT);

  if (error || !data) return [];
  return data as unknown as LogRow[];
}

async function fetchLogCount(athleteIds: string[]): Promise<number> {
  if (athleteIds.length === 0) return 0;

  const supabase = getSupabase();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from(LOGS_TABLE)
    .select('id', { count: 'exact', head: true })
    .in('user_id', athleteIds);

  if (error) return 0;
  return count ?? 0;
}

function latestIso(values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => right.localeCompare(left))[0];
}

function buildActivity(
  planRows: PlanRow[],
  logRows: LogRow[],
  nameById: Map<string, string>,
): TrainerActivityItem[] {
  const items: TrainerActivityItem[] = [];

  for (const row of planRows) {
    const athleteName = nameById.get(row.athlete_id);

    items.push({
      id: `plan-created-${row.id}`,
      kind: 'plan_created',
      description: `Creó "${row.title}"`,
      athleteName,
      at: row.created_at,
    });

    const updatedAt = row.updated_at;
    if (
      updatedAt &&
      new Date(updatedAt).getTime() - new Date(row.created_at).getTime() > PLAN_UPDATE_EPSILON_MS
    ) {
      items.push({
        id: `plan-updated-${row.id}`,
        kind: 'plan_updated',
        description: `Modificó "${row.title}"`,
        athleteName,
        at: updatedAt,
      });
    }
  }

  for (const row of logRows) {
    const at = row.completed_at ?? row.updated_at;
    if (!at) continue;

    items.push({
      id: `log-${row.user_id}-${at}`,
      kind: 'workout_logged',
      description: `Registró ${row.workout_name?.trim() || 'un entreno'}`,
      athleteName: nameById.get(row.user_id),
      at,
    });
  }

  return items
    .sort((left, right) => right.at.localeCompare(left.at))
    .slice(0, ACTIVITY_ITEM_LIMIT);
}

/**
 * Dashboard del entrenador para la ficha de administrador.
 * Cuatro consultas independientes en paralelo: clientes, planes, logs recientes y total de logs.
 */
export async function fetchTrainerOverview(trainerId: string): Promise<TrainerOverview> {
  if (!trainerId || !isSupabaseConfigured) return EMPTY_TRAINER_OVERVIEW;

  const athletes = await fetchAssignedAthletesForTrainer(trainerId);
  const athleteIds = athletes.map((athlete) => athlete.id);

  const [planRows, logRows, totalWorkoutLogs] = await Promise.all([
    fetchPlanRows(trainerId),
    fetchLogRows(athleteIds),
    fetchLogCount(athleteIds),
  ]);

  const today = startOfToday();
  const nameById = new Map(athletes.map((athlete) => [athlete.id, athlete.name]));

  const groups = groupPersonalizedPlans(planRows.map(toAthletePlan));
  const statuses = groups.map((group) => buildGroupStatus(group, today));

  const statusesByAthlete = new Map<string, GroupStatus[]>();
  for (const status of statuses) {
    const list = statusesByAthlete.get(status.group.athleteId) ?? [];
    list.push(status);
    statusesByAthlete.set(status.group.athleteId, list);
  }

  const lastWorkoutByAthlete = new Map<string, string>();
  for (const row of logRows) {
    const date = row.scheduled_date ?? row.completed_at?.slice(0, 10);
    if (!date || lastWorkoutByAthlete.has(row.user_id)) continue;
    lastWorkoutByAthlete.set(row.user_id, date);
  }

  const clients: TrainerClientRow[] = athletes.map((athlete) => {
    const relevant = pickRelevantGroup(statusesByAthlete.get(athlete.id) ?? []);
    const pendingAlerts = athlete.alerts?.total ?? athlete.unansweredCount ?? 0;

    if (!relevant) {
      return { athlete, status: 'no_plan', pendingAlerts, lastWorkoutDate: lastWorkoutByAthlete.get(athlete.id) };
    }

    return {
      athlete,
      status: relevant.state,
      planTitle: relevant.group.title,
      validFrom: relevant.group.validity.validFrom,
      validUntil: relevant.group.validity.validUntil,
      daysToEnd: relevant.daysToEnd,
      lastWorkoutDate: lastWorkoutByAthlete.get(athlete.id),
      pendingAlerts,
    };
  });

  const activePlanGroups = statuses.filter(
    (status) => status.state === 'active' || status.state === 'ending_soon',
  ).length;

  const clientsWithoutPlan = clients.filter((client) => client.status === 'no_plan').length;
  const clientsEndingSoon = clients.filter((client) => client.status === 'ending_soon').length;
  const clientsEnded = clients.filter((client) => client.status === 'ended').length;

  return {
    clients,
    totalClients: clients.length,
    activeClients: clients.filter(
      (client) =>
        client.status === 'active' || client.status === 'upcoming' || client.status === 'ending_soon',
    ).length,
    activePlanGroups,
    needsAttention: clientsWithoutPlan + clientsEndingSoon + clientsEnded,
    pendingAlerts: clients.reduce((sum, client) => sum + client.pendingAlerts, 0),
    stats: {
      plansCreated: groups.length,
      plansActive: activePlanGroups,
      plansEnded: statuses.filter((status) => status.state === 'ended').length,
      clientsWithoutPlan,
      clientsEndingSoon,
      nutritionPlans: planRows.filter((row) => row.plan_type === 'nutrition').length,
      homeTrainingPlans: planRows.filter((row) => row.plan_type === 'home_training').length,
      totalWorkoutLogs,
      lastPlanCreatedAt: latestIso(planRows.map((row) => row.created_at)),
      lastPlanUpdatedAt: latestIso(planRows.map((row) => row.updated_at)),
    },
    activity: buildActivity(planRows, logRows, nameById),
  };
}

// ---- Presentación compartida de estados ----

export const TRAINER_CLIENT_STATUS_LABELS: Record<TrainerClientStatus, string> = {
  active: 'Activo',
  upcoming: 'Programado',
  ending_soon: 'Termina pronto',
  ended: 'Finalizado',
  no_plan: 'Sin programa',
};

export function describeClientIssue(client: TrainerClientRow): string | null {
  if (client.status === 'no_plan') return 'Sin programación asignada';

  if (client.status === 'ending_soon') {
    const days = client.daysToEnd ?? 0;
    if (days <= 0) return 'La programación termina hoy';
    return `La programación termina en ${days} día${days === 1 ? '' : 's'}`;
  }

  if (client.status === 'ended') {
    const days = Math.abs(client.daysToEnd ?? 0);
    if (!client.daysToEnd) return 'La programación ya ha terminado';
    return `La programación terminó hace ${days} día${days === 1 ? '' : 's'}`;
  }

  return null;
}

const ISSUE_ORDER: Record<TrainerClientStatus, number> = {
  ended: 0,
  no_plan: 1,
  ending_soon: 2,
  active: 3,
  upcoming: 4,
};

export function clientsNeedingAttention(clients: readonly TrainerClientRow[]): TrainerClientRow[] {
  return clients
    .filter((client) => describeClientIssue(client) !== null)
    .sort((left, right) => {
      const byStatus = ISSUE_ORDER[left.status] - ISSUE_ORDER[right.status];
      if (byStatus !== 0) return byStatus;
      return (left.daysToEnd ?? 0) - (right.daysToEnd ?? 0);
    });
}
