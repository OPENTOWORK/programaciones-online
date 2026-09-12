import { attachExerciseVideosToBlocks, resolveExerciseVideoCatalog } from '@/lib/attachExerciseVideos';
import { pinCatalogSessionToDate } from '@/lib/catalogProgramCalendar';
import type { ExerciseVideoCatalog } from '@/lib/exerciseVideoService';
import { isKnownBlockLabel } from '@/lib/workoutContentParser';
import { createEmptySessionDraft, type SessionDraft } from '@/lib/trainerSessionDraft';
import {
  createEmptyBlock,
  createEmptyBlockItem,
  parseBlockItemFromText,
  serializeWorkoutBlocks,
  type WorkoutBlockDraft,
  type WorkoutBlockType,
} from '@/lib/workoutBlockBuilder';

function createBlockId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isHyroxProgram(programName: string) {
  return programName.trim().toLowerCase() === 'hyrox';
}

function splitBoardSections(lines: readonly string[]) {
  const sections: string[][] = [];
  let current: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (current.length > 0) {
        sections.push(current);
        current = [];
      }
      continue;
    }
    current.push(line);
  }

  if (current.length > 0) sections.push(current);
  return sections;
}

function isInstructionLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^(se |salimos|alternaremos|después|cuando|partner)/i.test(trimmed)) return true;
  const first = trimmed[0];
  return Boolean(first && first === first.toLowerCase() && /[a-záéíóúñ]/.test(first));
}

function isExerciseLikeLine(line: string) {
  const upper = line.toUpperCase();
  if (/\d+\s*[x×]\s*\d+/i.test(line)) return true;
  if (/^\d+\s/.test(line)) return true;
  if (/\d+\s*(CAL|M RUN|REPS?|RM|KG|METROS|SANDBAG|WALL)/i.test(upper)) return true;
  if (/^(MAX|REST|T\.C)/i.test(upper)) return false;
  if (/RUN|PRESS|SQUAT|PULL|BURPEE|ROW|SWING|LUNGE|THRUSTER|WALL|SNATCH|JUMP|CLEAN|DEADLIFT|BOX|SKIERG|BIKE/i.test(upper)) {
    return true;
  }
  return false;
}

function headerBlockType(header: string): WorkoutBlockType {
  const normalized = header.toLowerCase();
  if (normalized.includes('emom')) return 'emom';
  if (normalized.includes('amrap')) return 'amrap';
  if (normalized.includes('rounds for time') || normalized.includes('rondas for time')) return 'rounds_for_time';
  if (normalized.includes('for time')) return 'for_time';
  if (normalized.includes('tabata')) return 'tabata';
  if (normalized.includes('complex') || normalized.includes('fuerza') || normalized.includes('open')) {
    return 'strength';
  }
  if (normalized.includes('partner')) return 'for_time';
  return 'free_training';
}

function isTimingHeader(line: string) {
  return /(amrap|emom|for time|rondas|mins|minutos|on\s+\d)/i.test(line);
}

function buildBlock(
  type: WorkoutBlockType,
  title: string,
  timing: string,
  subtitle: string,
  notes: string,
  items: ReturnType<typeof itemsFromLines>,
): WorkoutBlockDraft {
  return {
    id: createBlockId('block'),
    type,
    title,
    timing,
    subtitle,
    notes,
    items: items.length > 0 ? items : [createEmptyBlockItem()],
  };
}

function itemsFromLines(lines: readonly string[]) {
  return lines.map((line) => ({
    id: createBlockId('block-item'),
    ...parseBlockItemFromText(line),
  }));
}

type SectionResult = WorkoutBlockDraft | { pendingTitle: string };

function sectionToBlock(
  section: readonly string[],
  sessionTitle: string,
  pendingTitle?: string,
): SectionResult | null {
  if (section.length === 0) return null;

  const instructionLines = section.filter(isInstructionLine);
  const workLines = section.filter((line) => !isInstructionLine(line));
  const notes = instructionLines.join(' · ');

  if (workLines.length === 0) {
    return buildBlock('free_text', sessionTitle, section.join('\n'), '', '', []);
  }

  const first = workLines[0];

  if (first.includes('·')) {
    const [label, ...restParts] = first.split('·').map((part) => part.trim());
    const timing = restParts.join(' · ');
    const exercises = workLines.slice(1);
    const type = headerBlockType(`${label} ${timing}`);
    const title = isKnownBlockLabel(label) ? pendingTitle ?? sessionTitle : label;
    return buildBlock(type, title, timing, '', notes, itemsFromLines(exercises));
  }

  if (isTimingHeader(first) && workLines.length > 1) {
    const type = headerBlockType(first);
    return buildBlock(type, pendingTitle ?? sessionTitle, first, '', notes, itemsFromLines(workLines.slice(1)));
  }

  if (workLines.length === 1 && !isExerciseLikeLine(first)) {
    return { pendingTitle: first };
  }

  if (workLines.length > 1 && !isExerciseLikeLine(first)) {
    const type = headerBlockType(first);
    return buildBlock(type, first, '', '', notes, itemsFromLines(workLines.slice(1)));
  }

  return buildBlock('strength', pendingTitle ?? sessionTitle, '', '', notes, itemsFromLines(workLines));
}

export function boardLinesToBlocks(
  sessionTitle: string,
  lines: readonly string[],
  programName: string,
  catalog = resolveExerciseVideoCatalog(),
): WorkoutBlockDraft[] {
  if (isHyroxProgram(programName)) {
    const text = lines.map((line) => line.trim()).filter(Boolean).join('\n');
    return [
      {
        ...createEmptyBlock('free_text'),
        id: createBlockId('block'),
        title: sessionTitle,
        timing: text,
        items: [],
      },
    ];
  }

  const sections = splitBoardSections(lines);
  const blocks: WorkoutBlockDraft[] = [];
  let pendingTitle: string | undefined;

  for (const section of sections) {
    const result = sectionToBlock(section, sessionTitle, pendingTitle);
    if (!result) continue;
    if ('pendingTitle' in result) {
      pendingTitle = result.pendingTitle;
      continue;
    }
    pendingTitle = undefined;
    blocks.push(result);
  }

  return attachExerciseVideosToBlocks(blocks, catalog);
}

export function boardLinesToStructuredContent(
  sessionTitle: string,
  lines: readonly string[],
  programName: string,
  catalog?: ExerciseVideoCatalog,
) {
  return serializeWorkoutBlocks(
    boardLinesToBlocks(sessionTitle, lines, programName, catalog ?? resolveExerciseVideoCatalog()),
  );
}

export function boardLinesToSessionDraft(
  sessionTitle: string,
  lines: readonly string[],
  programName: string,
  dateKey?: string,
  catalog?: ExerciseVideoCatalog,
): SessionDraft {
  const draft = createEmptySessionDraft(0);
  draft.name = sessionTitle;
  draft.main = boardLinesToStructuredContent(sessionTitle, lines, programName, catalog);

  if (!dateKey) return draft;

  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return draft;
  return pinCatalogSessionToDate(draft, date);
}
