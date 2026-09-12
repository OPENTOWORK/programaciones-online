import board from '@/data/hype-gym-training-board.json';

import { addDays } from '@/hooks/useGymData';
import { boardLinesToStructuredContent } from '@/lib/hypeBoardSessionDraft';
import {
  HYPE_PROGRAM_COLORS,
  gymDateKey,
  type GymTrainingSession,
} from '@/lib/gymTraining';
import type { Program } from '@/lib/types';

export interface HypeBoardSessionSeed {
  day: number;
  program: string;
  title: string;
  lines: string[];
}

const BOARD_SESSIONS = board.sessions as HypeBoardSessionSeed[];
const BOARD_PROGRAM_NAMES = board.programs as string[];
const BOARD_FROM = typeof board.from === 'string' ? board.from : undefined;
const BOARD_TO = typeof board.to === 'string' ? board.to : undefined;

export function hypeBoardDateRange() {
  if (!BOARD_FROM || !BOARD_TO) return undefined;
  return { from: BOARD_FROM, to: BOARD_TO };
}

function weekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function eachDate(from: string, to: string) {
  const days: Date[] = [];
  let current = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) return days;

  while (current.getTime() <= end.getTime()) {
    days.push(new Date(current.getFullYear(), current.getMonth(), current.getDate()));
    current = addDays(current, 1);
  }
  return days;
}

export function hypeBoardPrograms(): Program[] {
  return BOARD_PROGRAM_NAMES.map((name) => ({
    id: name,
    name,
    category: 'hype',
    level: 'intermedio',
    duration: 'semanal',
    sessionsPerWeek: 5,
    status: 'disponible',
    icon: 'programs',
    description: '',
    equipment: [],
    trainingDays: [],
    weeks: [],
  }));
}

function isWithinBoardWindow(dateKey: string) {
  if (BOARD_FROM && dateKey < BOARD_FROM) return false;
  if (BOARD_TO && dateKey > BOARD_TO) return false;
  return true;
}

/** Pizarra de Hype (solo ese gimnasio). Si el JSON trae `from`/`to`, no se repite fuera de esa semana. */
export function buildHypeBoardSessions(range: { from: string; to: string }): GymTrainingSession[] {
  const sessions: GymTrainingSession[] = [];

  for (const date of eachDate(range.from, range.to)) {
    const dateKey = gymDateKey(date);
    if (!isWithinBoardWindow(dateKey)) continue;

    const day = weekdayIndex(date);
    const seeds = BOARD_SESSIONS.filter((session) => session.day === day);

    seeds.forEach((seed, index) => {
      sessions.push({
        id: `hype-board-${dateKey}-${seed.program}-${index}`,
        programId: seed.program,
        programName: seed.program,
        name: seed.title,
        body: boardLinesToStructuredContent(seed.title, seed.lines, seed.program),
        dateKey,
        color: HYPE_PROGRAM_COLORS[seed.program] ?? '#C4C4C4',
      });
    });
  }

  return sessions;
}

export function findHypeBoardSessionById(id: string) {
  const match = /^hype-board-(\d{4}-\d{2}-\d{2})/.exec(id);
  if (!match) return undefined;
  return buildHypeBoardSessions({ from: match[1], to: match[1] }).find((session) => session.id === id);
}
