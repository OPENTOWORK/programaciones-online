import { SESSION_BLOCK_SECTIONS } from '@/lib/sessionBlockSections';
import {
  formatBlockItemLine,
  getBlockTypeConfig,
  parseWorkoutBlocksFromText,
  serializeWorkoutBlocks,
  type WorkoutBlockDraft,
} from '@/lib/workoutBlockBuilder';
import type { SessionDraft } from '@/lib/trainerSessionDraft';

function blockHeaderLine(block: WorkoutBlockDraft) {
  const config = getBlockTypeConfig(block.type);
  return [block.title?.trim(), config.label, block.timing.trim(), block.subtitle?.trim()]
    .filter(Boolean)
    .join(' · ');
}

function blockToTextLines(block: WorkoutBlockDraft): string[] {
  if (block.type === 'free_text') {
    const lines: string[] = [];
    if (block.title?.trim()) lines.push(block.title.trim());
    if (block.timing.trim()) lines.push(block.timing.trim());
    return lines;
  }

  const lines = [blockHeaderLine(block)];
  for (const item of block.items) {
    const formatted = formatBlockItemLine(item, block.type).trim();
    if (formatted) lines.push(`· ${formatted}`);
  }
  if (block.notes?.trim()) lines.push(block.notes.trim());
  return lines;
}

/** Texto legible del entreno, igual que en la vista expandida del calendario. */
export function sessionDraftToInlineText(draft: SessionDraft): string {
  const sections = SESSION_BLOCK_SECTIONS.map(({ key, label }) => ({
    label,
    blocks: parseWorkoutBlocksFromText(draft[key]),
  })).filter((section) => section.blocks.length > 0);

  if (sections.length === 0) return '';

  const chunks: string[] = [];
  for (const section of sections) {
    const header = section.label.toUpperCase();
    const body = section.blocks
      .map((block) => blockToTextLines(block).join('\n'))
      .filter(Boolean)
      .join('\n\n');
    chunks.push(body ? `${header}\n${body}` : header);
  }

  return chunks.join('\n\n').trim();
}

/** Aplica el texto editado al borrador, normalizándolo al formato interno de bloques. */
export function applyInlineTextToSessionDraft(text: string, draft: SessionDraft): SessionDraft {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ...draft, warmup: '', main: '', metcon: '', core: '', cooldown: '' };
  }

  const withoutSectionHeaders = trimmed
    .split('\n')
    .filter((line) => {
      const normalized = line.trim().toUpperCase();
      return !SESSION_BLOCK_SECTIONS.some((section) => section.label.toUpperCase() === normalized);
    })
    .join('\n')
    .trim();

  const blocks = parseWorkoutBlocksFromText(withoutSectionHeaders);
  const main = blocks.length > 0 ? serializeWorkoutBlocks(blocks) : withoutSectionHeaders;

  return {
    ...draft,
    warmup: '',
    main,
    metcon: '',
    core: '',
    cooldown: '',
  };
}
