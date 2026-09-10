import { addDays, startOfWeek } from '@/hooks/useGymData';
import { getSupabase } from '@/lib/supabase';
import type { Program } from '@/lib/types';

export const HYPE_TRAINING_PROGRAM_NAMES = [
  'ATHX',
  'Calistenia',
  'Crosstraining',
  'Hyrox',
  'Hype',
] as const;

export const HYPE_PROGRAM_COLORS: Record<string, string> = {
  ATHX: '#E85BB8',
  Calistenia: '#5EC95A',
  Crosstraining: '#C4C4C4',
  Hyrox: '#F5E04A',
  Hype: '#F4A06A',
};

function normalizeGymName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

const CLASS_TYPE_PROGRAM_ALIASES: Record<string, string> = {
  athx: 'ATHX',
  calistenia: 'Calistenia',
  crosstraining: 'Crosstraining',
  hype: 'Hype',
  hyrox: 'Hyrox',
  wod: 'Hype',
};

/** Relaciona la modalidad del gimnasio con la programación de catálogo. */
export function programForGymClassType(
  classTypeName: string,
  programs: readonly Program[],
) {
  const key = normalizeGymName(classTypeName);
  const target = CLASS_TYPE_PROGRAM_ALIASES[key] ?? classTypeName;
  const wanted = normalizeGymName(target);
  return (
    programs.find((program) => normalizeGymName(program.name) === wanted) ??
    programs.find((program) => normalizeGymName(program.name) === key)
  );
}

export interface GymTrainingSession {
  id: string;
  programId: string;
  programName: string;
  name: string;
  /** Texto completo del WOD, para leerlo de un vistazo. */
  body?: string;
  dayLabel?: string;
  dateKey: string;
  color: string;
}

/** Une la cabecera del WOD con el resto: en Hype no es un título, es la primera línea. */
export function gymSessionBoardText(session: Pick<GymTrainingSession, 'name' | 'body'>) {
  const title = session.name.trim();
  const body = session.body?.trim() ?? '';
  if (!title) return body;
  if (!body) return title;
  const firstLine = body.split('\n')[0]?.trim();
  if (firstLine === title) return body;
  return `${title}\n${body}`;
}

/** Fecha de calendario `aaaa-mm-dd`, sin desfase UTC. */
export function gymDateKey(value: string | Date) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function weekStartsAround(today = new Date()) {
  const thisWeek = startOfWeek(today);
  return {
    thisWeek,
    nextWeek: addDays(thisWeek, 7),
  };
}

export function formatWeekChip(weekStart: Date) {
  const end = addDays(weekStart, 6);
  return `${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
}

export async function fetchHypeTrainingPrograms(): Promise<Program[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('programas')
    .select('id, name')
    .in('name', [...HYPE_TRAINING_PROGRAM_NAMES])
    .order('name');

  if (error || !data) return [];

  return (data as Array<{ id: string; name: string }>).map((row) => ({
    id: row.id,
    name: row.name,
    category: 'hype',
    level: 'intermedio',
    duration: '12 semanas',
    sessionsPerWeek: 5,
    status: 'disponible',
    icon: 'programs',
    description: '',
    equipment: [],
    trainingDays: [],
    weeks: [],
  }));
}

export async function fetchGymTrainingSessions(
  programs: readonly Program[],
  range: { from: string; to: string },
): Promise<GymTrainingSession[]> {
  const supabase = getSupabase();
  if (!supabase || programs.length === 0) return [];

  const { data, error } = await supabase
    .from('entrenos_diarios')
    .select('id, program_id, name, day_label, workout_date')
    .in('program_id', programs.map((program) => program.id))
    .gte('workout_date', range.from)
    .lte('workout_date', range.to)
    .order('workout_date', { ascending: true });

  if (error || !data) return [];

  const byId = new Map(programs.map((program) => [program.id, program]));
  const sessions: GymTrainingSession[] = [];

  for (const row of data as Array<Record<string, string>>) {
    const program = byId.get(row.program_id);
    if (!program || !row.workout_date) continue;
    if (/descanso|rest day/i.test(row.name ?? '')) continue;

    sessions.push({
      id: row.id,
      programId: row.program_id,
      programName: program.name,
      name: row.name,
      dayLabel: row.day_label,
      dateKey: gymDateKey(row.workout_date),
      color: HYPE_PROGRAM_COLORS[program.name] ?? '#C4C4C4',
    });
  }

  return sessions;
}

export function sessionsForWeek(
  sessions: readonly GymTrainingSession[],
  weekStart: Date,
  programIds: readonly string[],
) {
  const keys = new Set(
    Array.from({ length: 7 }, (_, index) => gymDateKey(addDays(weekStart, index))),
  );
  const selected = new Set(programIds);
  return sessions.filter(
    (session) =>
      keys.has(session.dateKey) && (selected.size === 0 || selected.has(session.programId)),
  );
}

export function groupSessionsByDay(
  days: Date[],
  sessions: readonly GymTrainingSession[],
) {
  const map = new Map<string, GymTrainingSession[]>();
  for (const day of days) {
    map.set(gymDateKey(day), []);
  }
  for (const session of sessions) {
    map.get(session.dateKey)?.push(session);
  }
  return map;
}
