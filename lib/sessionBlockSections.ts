import {
  blockUsesSeries,
  parseWorkoutBlocksFromText,
  sanitizeWorkoutBlock,
  serializeWorkoutBlocks,
  type WorkoutBlockDraft,
} from '@/lib/workoutBlockBuilder';
import { createEmptyExercise, type SessionDraft } from '@/lib/trainerSessionDraft';
import type { Exercise } from '@/lib/types';

export type SessionBlockSection = 'warmup' | 'main' | 'metcon' | 'core' | 'cooldown';

export const SESSION_BLOCK_SECTIONS: Array<{ key: SessionBlockSection; label: string }> = [
  { key: 'warmup', label: 'Calentamiento' },
  { key: 'main', label: 'Parte principal' },
  { key: 'metcon', label: 'Metcon' },
  { key: 'core', label: 'Core / Accesorio' },
  { key: 'cooldown', label: 'Vuelta a la calma' },
];

export interface TaggedWorkoutBlock extends WorkoutBlockDraft {
  section: SessionBlockSection;
}

export function getSessionSectionLabel(section: SessionBlockSection) {
  return SESSION_BLOCK_SECTIONS.find((entry) => entry.key === section)?.label ?? section;
}

export function getSessionSectionField(section: SessionBlockSection): keyof SessionDraft {
  return section;
}

export function draftSectionFingerprint(draft: SessionDraft) {
  return [draft.warmup, draft.main, draft.metcon, draft.core, draft.cooldown].join('|||');
}

export function draftToTaggedBlocks(draft: SessionDraft): TaggedWorkoutBlock[] {
  return SESSION_BLOCK_SECTIONS.flatMap(({ key }) =>
    parseWorkoutBlocksFromText(draft[key]).map((block) => ({
      ...block,
      section: 'main' as SessionBlockSection,
    })),
  );
}

export function taggedBlocksToDraft(
  blocks: TaggedWorkoutBlock[],
  confirmedIds: Set<string>,
  base: SessionDraft,
): SessionDraft {
  const confirmed = blocks
    .filter((block) => confirmedIds.has(block.id))
    .map((block) => sanitizeWorkoutBlock(block));

  const serialized = serializeWorkoutBlocks(confirmed);

  return {
    ...base,
    warmup: '',
    main: serialized,
    metcon: '',
    core: '',
    cooldown: '',
  };
}

export function combineMainPartsForSave(main: string, metcon: string) {
  return [main.trim(), metcon.trim()].filter(Boolean).join('\n\n');
}

export function hasSessionBlockContent(draft: SessionDraft) {
  return Boolean(
    draft.warmup.trim() ||
      draft.main.trim() ||
      draft.metcon.trim() ||
      draft.core.trim() ||
      draft.cooldown.trim(),
  );
}

export function extractExercisesFromSessionDraft(draft: SessionDraft): Exercise[] {
  const blocks = draftToTaggedBlocks(draft);
  const exercises: Exercise[] = [];

  for (const block of blocks) {
    if (!blockUsesSeries(block.type)) continue;
    for (const item of block.items) {
      if (!item.text.trim()) continue;
      const base = createEmptyExercise();
      exercises.push({
        ...base,
        id: item.id,
        name: item.text.trim(),
        sets: Number.parseInt(item.sets ?? '', 10) || base.sets,
        reps: item.reps?.trim() || base.reps,
        aimharderEjerId: item.aimharderEjerId,
      });
    }
  }

  return exercises;
}
