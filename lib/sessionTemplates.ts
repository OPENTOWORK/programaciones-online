import {
  parsePersonalizedPlanContent,
  serializePersonalizedPlanContent,
} from '@/lib/personalizedPlanContent';
import { draftToTaggedBlocks, hasSessionBlockContent } from '@/lib/sessionBlockSections';
import { formatScheduleSummary } from '@/lib/sessionSchedule';
import type { SessionDraft } from '@/lib/trainerSessionDraft';
import { getBlockTypeConfig, getWorkoutBlockSummary } from '@/lib/workoutBlockBuilder';

export interface SessionTemplateSummary {
  blockCount: number;
  duration: string;
  schedule: string;
  blockLabels: string[];
  firstBlockSummary: string;
}

/** Contenido que se guarda en la plantilla: mismo formato que el plan del atleta. */
export function sessionDraftToTemplateContent(draft: SessionDraft) {
  return serializePersonalizedPlanContent(draft);
}

export function canSaveSessionAsTemplate(draft: SessionDraft) {
  return hasSessionBlockContent(draft);
}

/**
 * Aplica una plantilla sobre el borrador actual: sustituye bloques, duración y
 * días de entrenamiento, y conserva el nombre y el número de la sesión.
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
    schedule: parsed.schedule,
    dayLabel: formatScheduleSummary(parsed.schedule),
  };
}

export function describeSessionTemplate(templateContent: string): SessionTemplateSummary {
  const draft = parsePersonalizedPlanContent(templateContent);
  const blocks = draftToTaggedBlocks(draft);

  return {
    blockCount: blocks.length,
    duration: draft.estimatedDuration,
    schedule: formatScheduleSummary(draft.schedule),
    blockLabels: blocks.map((block) => getBlockTypeConfig(block.type).label),
    firstBlockSummary: blocks[0] ? getWorkoutBlockSummary(blocks[0]) : '',
  };
}
