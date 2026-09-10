import type { GymResult } from '@/lib/gymService';
import { fetchGymStaff } from '@/lib/gymService';
import type { GymTask, GymTaskPriority, GymTaskRecurrence, GymTaskStatus } from '@/lib/gymTypes';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const TABLE = 'gym_tasks';
const SELECT_BASE =
  'id, gym_id, title, description, assigned_to, due_at, priority, status, created_by, created_at, updated_at';
const SELECT = `${SELECT_BASE}, recurrence`;
const CRM_MIGRATION_HINT = 'Falta aplicar el CRM de gimnasios: ejecuta npm run supabase:gym-crm';
const RECURRENCE_MIGRATION_HINT =
  'Falta aplicar la frecuencia de tareas: ejecuta npm run supabase:gym-tasks-recurrence';

type Row = Record<string, unknown>;
type PgError = { message?: string; code?: string } | null | undefined;

const demoTasks = new Map<string, GymTask[]>();

function isMissingTableError(error: PgError) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('could not find the table') ||
    (message.includes('does not exist') && message.includes('relation')) ||
    error.code === '42P01' ||
    error.code === 'PGRST205'
  );
}

function isMissingRecurrenceColumn(error: PgError) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return message.includes('recurrence') || error.code === 'PGRST202';
}

function friendlyError(error: PgError, fallback: string) {
  if (!error) return fallback;
  if (isMissingTableError(error)) return CRM_MIGRATION_HINT;
  if (isMissingRecurrenceColumn(error)) return RECURRENCE_MIGRATION_HINT;
  if (/row-level security|permission denied|violates/i.test(error.message ?? '')) {
    return 'No tienes permiso para gestionar tareas en este gimnasio.';
  }
  return fallback;
}

function text(value: unknown) {
  return (value as string | null) ?? undefined;
}

function mapRecurrence(value: unknown): GymTaskRecurrence {
  if (value === 'daily' || value === 'weekly' || value === 'monthly') return value;
  return 'once';
}

function mapTask(row: Row, assigneeName?: string): GymTask {
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    title: String(row.title ?? ''),
    description: text(row.description),
    assignedTo: text(row.assigned_to),
    assigneeName,
    dueAt: text(row.due_at),
    priority: ((row.priority as string) ?? 'medium') as GymTaskPriority,
    recurrence: mapRecurrence(row.recurrence),
    status: ((row.status as string) ?? 'pending') as GymTaskStatus,
    createdBy: text(row.created_by),
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? (row.created_at as string),
  };
}

function startOfLocalDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function gymTaskDueDate(task: Pick<GymTask, 'dueAt'>) {
  if (!task.dueAt) return null;
  const date = new Date(task.dueAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isGymTaskOverdue(task: GymTask, now = new Date()) {
  if (task.status === 'completed') return false;
  const due = gymTaskDueDate(task);
  if (!due) return false;
  return due.getTime() < startOfLocalDay(now).getTime();
}

export function isGymTaskDueToday(task: GymTask, now = new Date()) {
  if (task.status === 'completed') return false;
  const due = gymTaskDueDate(task);
  if (!due) return false;
  return due.toDateString() === now.toDateString();
}

export function formatGymTaskDue(task: GymTask) {
  const due = gymTaskDueDate(task);
  if (!due) return 'Sin fecha';
  if (isGymTaskDueToday(task)) return 'Hoy';
  if (isGymTaskOverdue(task)) {
    return `Venció ${due.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
  }
  return due.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

function sameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

/** Indica si la tarea cae en un día concreto (incluye recurrencias). */
export function gymTaskOccursOnDate(task: GymTask, date: Date) {
  if (task.status === 'completed') return false;

  const due = gymTaskDueDate(task);
  if (!due) return false;

  const day = startOfLocalDay(date);
  const dueDay = startOfLocalDay(due);
  if (day.getTime() < dueDay.getTime()) return false;

  if (task.recurrence === 'once') return sameCalendarDay(day, dueDay);
  if (task.recurrence === 'daily') return true;
  if (task.recurrence === 'weekly') return day.getDay() === dueDay.getDay();
  if (task.recurrence === 'monthly') return day.getDate() === dueDay.getDate();

  return sameCalendarDay(day, dueDay);
}

export function gymTasksForDate(tasks: readonly GymTask[], date: Date) {
  return sortGymTasks(tasks.filter((task) => gymTaskOccursOnDate(task, date)));
}

export function gymTasksByRecurrence(tasks: readonly GymTask[]) {
  const buckets = new Map<GymTaskRecurrence, GymTask[]>([
    ['once', []],
    ['daily', []],
    ['weekly', []],
    ['monthly', []],
  ]);

  for (const task of tasks) {
    buckets.get(task.recurrence)?.push(task);
  }

  for (const list of buckets.values()) {
    list.splice(0, list.length, ...sortGymTasks(list));
  }

  return buckets;
}

const PRIORITY_RANK: Record<GymTaskPriority, number> = { high: 0, medium: 1, low: 2 };

export function sortGymTasks(tasks: readonly GymTask[]) {
  return [...tasks].sort((left, right) => {
    if (left.status === 'completed' && right.status !== 'completed') return 1;
    if (right.status === 'completed' && left.status !== 'completed') return -1;

    const leftOverdue = isGymTaskOverdue(left) ? 0 : 1;
    const rightOverdue = isGymTaskOverdue(right) ? 0 : 1;
    if (leftOverdue !== rightOverdue) return leftOverdue - rightOverdue;

    const leftDue = gymTaskDueDate(left)?.getTime() ?? Number.POSITIVE_INFINITY;
    const rightDue = gymTaskDueDate(right)?.getTime() ?? Number.POSITIVE_INFINITY;
    if (leftDue !== rightDue) return leftDue - rightDue;

    return PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];
  });
}

export function nextGymTaskStatus(status: GymTaskStatus): GymTaskStatus {
  if (status === 'pending') return 'in_progress';
  if (status === 'in_progress') return 'completed';
  return 'pending';
}

export interface GymTaskInput {
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  priority: GymTaskPriority;
  recurrence?: GymTaskRecurrence;
  status?: GymTaskStatus;
}

function dueAtFromDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return new Date(`${value}T23:59:00`).toISOString();
}

function dateKeyFromIso(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function nextGymTaskDueAt(
  recurrence: GymTaskRecurrence,
  currentDueAt?: string,
  now = new Date(),
): string | undefined {
  if (recurrence === 'once') return currentDueAt;

  const base = gymTaskDueDate({ dueAt: currentDueAt }) ?? startOfLocalDay(now);
  const next = new Date(base);

  if (recurrence === 'daily') {
    next.setDate(next.getDate() + 1);
  } else if (recurrence === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else {
    next.setMonth(next.getMonth() + 1);
  }

  return dueAtFromDate(dateKeyFromIso(next.toISOString())) ?? undefined;
}

export async function fetchGymTasks(gymId: string): Promise<GymResult<GymTask[]>> {
  if (!gymId) return { data: [] };

  if (!isSupabaseConfigured) {
    return { data: sortGymTasks(demoTasks.get(gymId) ?? []) };
  }

  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const [{ data, error }, staffResult] = await Promise.all([
    supabase.from(TABLE).select(SELECT).eq('gym_id', gymId).order('due_at', { ascending: true }),
    fetchGymStaff(gymId),
  ]);

  let rows = data;
  let loadError = error;

  if (loadError && isMissingRecurrenceColumn(loadError)) {
    const fallback = await supabase
      .from(TABLE)
      .select(SELECT_BASE)
      .eq('gym_id', gymId)
      .order('due_at', { ascending: true });
    rows = fallback.data;
    loadError = fallback.error;
  }

  if (loadError) return { error: friendlyError(loadError, 'No se pudieron cargar las tareas.') };

  const names = new Map((staffResult.data ?? []).map((member) => [member.userId, member.name]));
  return {
    data: sortGymTasks(
      ((rows ?? []) as Row[]).map((row) => mapTask(row, names.get(row.assigned_to as string))),
    ),
  };
}

export async function saveGymTask(
  gymId: string,
  input: GymTaskInput & { id?: string },
  userId?: string,
): Promise<GymResult<GymTask>> {
  const title = input.title.trim();
  if (!title) return { error: 'Pon un título a la tarea.' };

  const payload = {
    gym_id: gymId,
    title,
    description: input.description?.trim() || null,
    assigned_to: input.assignedTo || null,
    due_at: dueAtFromDate(input.dueDate),
    priority: input.priority,
    recurrence: input.recurrence ?? 'once',
    status: input.status ?? 'pending',
    ...(input.id ? {} : { created_by: userId ?? null }),
  };

  const payloadWithoutRecurrence = { ...payload };
  delete (payloadWithoutRecurrence as { recurrence?: string }).recurrence;

  if (!isSupabaseConfigured) {
    const current = demoTasks.get(gymId) ?? [];
    if (input.id) {
      const next = current.map((task) =>
        task.id === input.id
          ? {
              ...task,
              title,
              description: input.description?.trim() || undefined,
              assignedTo: input.assignedTo,
              dueAt: dueAtFromDate(input.dueDate) ?? undefined,
              priority: input.priority,
              recurrence: input.recurrence ?? task.recurrence,
              status: input.status ?? task.status,
              updatedAt: new Date().toISOString(),
            }
          : task,
      );
      demoTasks.set(gymId, next);
      return { data: next.find((task) => task.id === input.id) };
    }

    const created: GymTask = {
      id: `local-${Date.now()}`,
      gymId,
      title,
      description: input.description?.trim() || undefined,
      assignedTo: input.assignedTo,
      dueAt: dueAtFromDate(input.dueDate) ?? undefined,
      priority: input.priority,
      recurrence: input.recurrence ?? 'once',
      status: input.status ?? 'pending',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    demoTasks.set(gymId, [created, ...current]);
    return { data: created };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const query = input.id
    ? supabase.from(TABLE).update(payload).eq('id', input.id)
    : supabase.from(TABLE).insert(payload);

  let { data, error } = await query.select(SELECT).single();

  if (error && isMissingRecurrenceColumn(error)) {
    const retry = input.id
      ? supabase.from(TABLE).update(payloadWithoutRecurrence).eq('id', input.id)
      : supabase.from(TABLE).insert(payloadWithoutRecurrence);
    ({ data, error } = await retry.select(SELECT_BASE).single());
  }

  if (error || !data) return { error: friendlyError(error, 'No se pudo guardar la tarea.') };
  return { data: mapTask(data as Row) };
}

export async function setGymTaskStatus(
  taskId: string,
  status: GymTaskStatus,
): Promise<GymResult<GymTask>> {
  if (taskId.startsWith('local-')) {
    let updated: GymTask | undefined;
    for (const [gymId, tasks] of demoTasks) {
      const next = tasks.map((task) => {
        if (task.id !== taskId) return task;
        if (status === 'completed' && task.recurrence !== 'once') {
          updated = {
            ...task,
            status: 'pending',
            dueAt: nextGymTaskDueAt(task.recurrence, task.dueAt),
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }
        updated = { ...task, status, updatedAt: new Date().toISOString() };
        return updated;
      });
      demoTasks.set(gymId, next);
    }
    return updated ? { data: updated } : { error: 'Tarea no encontrada.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data: current, error: readError } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('id', taskId)
    .maybeSingle();

  if (readError || !current) {
    return { error: friendlyError(readError, 'No se pudo actualizar la tarea.') };
  }

  const task = mapTask(current as Row);
  const patch =
    status === 'completed' && task.recurrence !== 'once'
      ? {
          status: 'pending' as const,
          due_at: nextGymTaskDueAt(task.recurrence, task.dueAt) ?? null,
        }
      : { status };

  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq('id', taskId)
    .select(SELECT)
    .single();

  if (error || !data) return { error: friendlyError(error, 'No se pudo actualizar la tarea.') };
  return { data: mapTask(data as Row) };
}

export async function deleteGymTask(taskId: string): Promise<GymResult<true>> {
  if (taskId.startsWith('local-')) {
    for (const [gymId, tasks] of demoTasks) {
      demoTasks.set(
        gymId,
        tasks.filter((task) => task.id !== taskId),
      );
    }
    return { data: true };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(TABLE).delete().eq('id', taskId);
  if (error) return { error: friendlyError(error, 'No se pudo eliminar la tarea.') };
  return { data: true };
}
