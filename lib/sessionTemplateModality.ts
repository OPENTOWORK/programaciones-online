import { HYPE_PROGRAMS } from '@/lib/hypeCatalog';
import { isMetconCatalogProgram, namesMatchCatalog } from '@/lib/standardVenueCatalog';
import {
  isSessionTemplateModalityTag,
  SESSION_TEMPLATE_MODALITY_TAGS,
  type SessionTemplateModalityTag,
} from '@/lib/sessionTemplateTags';
import type { Program } from '@/lib/types';

/** Fragmentos únicos de los 30 metcons de calistenia sembrados en Supabase. */
export const CALISTENIA_METCON_CONTENT_MARKERS = [
  'Park Engine',
  'Death by burpee',
  'Grin & bear',
  'muscle-up transition asistida',
  'Partner style (solo)',
  'Buy-then (buy-out)',
  'scapular pull up lentas',
  'Complex: 1 pull up + 2 push up + 3 air squat',
  'I go / You go',
  'Chin-over-bar hold o active hang',
  'burpee pull-up (o burpee + jump to bar)',
  'Handstand hold contra muro o pike hold',
  'support hold en anillas o paralelas',
  'ring row o australian pull up',
  'pistol asistido o shrimp squat',
  'thruster con mochila o goblet squat',
  'Australian pull up: 8 reps',
  'Jump squat: 15 reps',
  'Pike push up: 8 reps',
  'EMOM · 12 min · 4 rondas',
  'Pull up (banda si hace falta): 5 reps',
] as const;

const MODALITY_CONTENT_HINTS: Record<SessionTemplateModalityTag, RegExp[]> = {
  Calistenia: [
    /\baustralian pull up\b/i,
    /\bpull up\b/i,
    /\bpike push up\b/i,
    /\bmuscle-up\b/i,
    /\bhollow rock\b/i,
    /\btoes to bar\b/i,
    /\bparque\b/i,
    /\bcalistenia\b/i,
  ],
  ATHX: [/\bathx\b/i, /\bturf\b/i, /\bagility\b/i, /\bhybrid\b/i, /\bprowler\b/i],
  Crosstraining: [
    /\bcross\s?training\b/i,
    /\bcrosstraining\b/i,
    /\bbarra y discos\b/i,
    /\bbox jump\b/i,
    /\bclean\b/i,
    /\bsnatch\b/i,
  ],
  Hype: [/\bhype\b/i, /\bbattle rope\b/i, /\bslam ball\b/i, /\bcuerda de batalla\b/i],
  Hyrox: [/\bhyrox\b/i, /\bski\s?erg\b/i, /\btrineo\b/i, /\bsled\b/i, /\b800\s*m run\b/i],
};

function scoreModalityFromContent(content: string, name: string): Map<SessionTemplateModalityTag, number> {
  const haystack = `${name}\n${content}`.toLowerCase();
  const scores = new Map<SessionTemplateModalityTag, number>();

  for (const modality of SESSION_TEMPLATE_MODALITY_TAGS) {
    scores.set(modality, 0);
    for (const pattern of MODALITY_CONTENT_HINTS[modality]) {
      if (pattern.test(haystack)) {
        scores.set(modality, (scores.get(modality) ?? 0) + 1);
      }
    }
  }

  return scores;
}

export function isCalisteniaMetconContent(content: string, name = ''): boolean {
  const haystack = `${name}\n${content}`;
  if (CALISTENIA_METCON_CONTENT_MARKERS.some((marker) => haystack.includes(marker))) {
    return true;
  }

  const scores = scoreModalityFromContent(content, name);
  const calisteniaScore = scores.get('Calistenia') ?? 0;
  if (calisteniaScore === 0) return false;

  const gymPatterns = /\b(barbell|mancuerna|kettlebell|ski erg|trineo|sled|battle rope)\b/i;
  if (gymPatterns.test(haystack)) return false;

  let bestOther = 0;
  for (const [modality, score] of scores) {
    if (modality === 'Calistenia') continue;
    bestOther = Math.max(bestOther, score);
  }

  return calisteniaScore > bestOther;
}

export function inferSessionTemplateModality(input: {
  name: string;
  content: string;
  tag?: string | null;
}): SessionTemplateModalityTag | null {
  for (const modality of SESSION_TEMPLATE_MODALITY_TAGS) {
    if (namesMatchCatalog(input.name, [modality.toLowerCase()])) {
      return modality;
    }
  }

  if (input.tag === 'Metcon' || /\bmetcon\b/i.test(input.name)) {
    if (isCalisteniaMetconContent(input.content, input.name)) {
      return 'Calistenia';
    }
  }

  const scores = scoreModalityFromContent(input.content, input.name);
  let best: SessionTemplateModalityTag | null = null;
  let bestScore = 0;

  for (const modality of SESSION_TEMPLATE_MODALITY_TAGS) {
    const score = scores.get(modality) ?? 0;
    if (score > bestScore) {
      bestScore = score;
      best = modality;
    }
  }

  return bestScore > 0 ? best : null;
}

export function resolveSessionTemplateModalityForProgram(
  program: Pick<Program, 'name' | 'category' | 'standardVenue'>,
): SessionTemplateModalityTag | null {
  if (program.category === 'hype') {
    const slot = HYPE_PROGRAMS.find((entry) => namesMatchCatalog(program.name, entry.matchNames));
    if (slot && slot.name !== 'Básico' && isSessionTemplateModalityTag(slot.name)) {
      return slot.name;
    }
  }

  if (isMetconCatalogProgram(program) && program.standardVenue === 'calisthenics') {
    return 'Calistenia';
  }

  if (isMetconCatalogProgram(program) && program.standardVenue === 'gym') {
    return 'Crosstraining';
  }

  return null;
}

export function rebuildTemplateNameWithModality(input: {
  name: string;
  tag: string | null;
  formatTag: string | null;
  modalityTag: SessionTemplateModalityTag | null;
}): string {
  const parts = input.name.split(' · ').map((part) => part.trim()).filter(Boolean);
  const withoutModalities = parts.filter(
    (part) => !SESSION_TEMPLATE_MODALITY_TAGS.includes(part as SessionTemplateModalityTag),
  );

  const nextParts: string[] = [];
  if (input.tag) nextParts.push(input.tag);
  if (input.modalityTag) nextParts.push(input.modalityTag);
  if (input.formatTag) nextParts.push(input.formatTag);

  const hint = withoutModalities.find(
    (part) =>
      part !== input.tag &&
      part !== input.formatTag &&
      part !== input.modalityTag &&
      !SESSION_TEMPLATE_MODALITY_TAGS.includes(part as SessionTemplateModalityTag),
  );
  if (hint) nextParts.push(hint);

  return nextParts.join(' · ') || input.name;
}
