export const SESSION_TEMPLATE_MODALITY_TAGS = [
  'Calistenia',
  'ATHX',
  'Crosstraining',
  'Hype',
  'Hyrox',
];

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
];

const MODALITY_CONTENT_HINTS = {
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

function normalizeName(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function namesMatchCatalog(name, matchNames) {
  const normalized = normalizeName(name);
  return matchNames.some((candidate) => normalized.includes(normalizeName(candidate)));
}

function scoreModalityFromContent(content, name) {
  const haystack = `${name}\n${content}`.toLowerCase();
  const scores = new Map();

  for (const modality of SESSION_TEMPLATE_MODALITY_TAGS) {
    scores.set(modality, 0);
    for (const pattern of MODALITY_CONTENT_HINTS[modality] ?? []) {
      if (pattern.test(haystack)) {
        scores.set(modality, (scores.get(modality) ?? 0) + 1);
      }
    }
  }

  return scores;
}

export function isCalisteniaMetconContent(content, name = '') {
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

export function inferSessionTemplateModality({ name, content, tag }) {
  for (const modality of SESSION_TEMPLATE_MODALITY_TAGS) {
    if (namesMatchCatalog(name, [modality.toLowerCase()])) {
      return modality;
    }
  }

  if (tag === 'Metcon' || /\bmetcon\b/i.test(name)) {
    if (isCalisteniaMetconContent(content, name)) {
      return 'Calistenia';
    }
  }

  const scores = scoreModalityFromContent(content, name);
  let best = null;
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

export function rebuildTemplateNameWithModality({ name, tag, formatTag, modalityTag }) {
  const parts = name.split(' · ').map((part) => part.trim()).filter(Boolean);
  const withoutModalities = parts.filter(
    (part) => !SESSION_TEMPLATE_MODALITY_TAGS.includes(part),
  );

  const nextParts = [];
  if (tag) nextParts.push(tag);
  if (modalityTag) nextParts.push(modalityTag);
  if (formatTag) nextParts.push(formatTag);

  const hint = withoutModalities.find(
    (part) => part !== tag && part !== formatTag && part !== modalityTag,
  );
  if (hint) nextParts.push(hint);

  return nextParts.join(' · ') || name;
}
