import {
  parsePersonalizedPlanContent,
  serializePersonalizedPlanContent,
} from '@/lib/personalizedPlanContent';
import { draftToTaggedBlocks, hasSessionBlockContent } from '@/lib/sessionBlockSections';
import { formatScheduleSummary } from '@/lib/sessionSchedule';
import type { SessionDraft } from '@/lib/trainerSessionDraft';
import { getBlockTypeConfig, getWorkoutBlockSummary, formatBlockItemLineForDisplay } from '@/lib/workoutBlockBuilder';

export interface SessionTemplateSummary {
  blockCount: number;
  duration: string;
  schedule: string;
  blockLabels: string[];
  firstBlockSummary: string;
  exerciseLines: string[];
}

/** Contenido que se guarda en la plantilla: mismo formato que el plan del atleta. */
export function sessionDraftToTemplateContent(draft: SessionDraft) {
  return serializePersonalizedPlanContent(draft);
}

export function canSaveSessionAsTemplate(draft: SessionDraft) {
  return hasSessionBlockContent(draft);
}

function appendSection(current: string, incoming: string) {
  return [current.trim(), incoming.trim()].filter(Boolean).join('\n\n');
}

/**
 * Aplica una plantilla como sesión nueva: copia bloques/contenido y conserva
 * nombre, número y calendario del destino (el día donde se está creando/editando).
 */
export function applyTemplateToDraft(draft: SessionDraft, templateContent: string): SessionDraft {
  const parsed = parsePersonalizedPlanContent(templateContent);

  return {
    ...draft,
    estimatedDuration: parsed.estimatedDuration || draft.estimatedDuration,
    warmup: parsed.warmup,
    main: parsed.main,
    metcon: parsed.metcon,
    core: parsed.core,
    cooldown: parsed.cooldown,
    exercises: parsed.exercises,
  };
}

/**
 * Inserta los bloques/ejercicios de una plantilla en la sesión actual sin
 * reemplazarla entera. Conserva nombre, duración y calendario del destino.
 */
export function mergeTemplateIntoDraft(draft: SessionDraft, templateContent: string): SessionDraft {
  const parsed = parsePersonalizedPlanContent(templateContent);

  return {
    ...draft,
    warmup: appendSection(draft.warmup, parsed.warmup),
    main: appendSection(draft.main, parsed.main),
    metcon: appendSection(draft.metcon, parsed.metcon),
    core: appendSection(draft.core, parsed.core),
    cooldown: appendSection(draft.cooldown, parsed.cooldown),
  };
}

/** Combina varias plantillas en orden sobre un borrador de sesión. */
export function mergeTemplatesIntoDraft(
  draft: SessionDraft,
  templateContents: string[],
): SessionDraft {
  return templateContents.reduce(
    (current, content) => mergeTemplateIntoDraft(current, content),
    draft,
  );
}

export function describeSessionTemplate(templateContent: string): SessionTemplateSummary {
  const draft = parsePersonalizedPlanContent(templateContent);
  const blocks = draftToTaggedBlocks(draft);
  const exerciseLines: string[] = [];

  for (const block of blocks) {
    if (block.type === 'free_text') {
      const text = block.timing.trim() || block.title?.trim();
      if (text) exerciseLines.push(text);
      continue;
    }
    for (const item of block.items) {
      if (!item.text.trim()) continue;
      exerciseLines.push(formatBlockItemLineForDisplay(item, block.type) || item.text.trim());
    }
  }

  return {
    blockCount: blocks.length,
    duration: draft.estimatedDuration,
    schedule: formatScheduleSummary(draft.schedule),
    blockLabels: blocks.map((block) => getBlockTypeConfig(block.type).label),
    firstBlockSummary: blocks[0] ? getWorkoutBlockSummary(blocks[0]) : '',
    exerciseLines,
  };
}
