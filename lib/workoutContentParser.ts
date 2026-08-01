export interface WorkoutContentBlock {
  label: string;
  timing?: string;
  items: string[];
  /** Texto escrito por el entrenador: se muestra tal cual, sin reinterpretar sus líneas. */
  text?: string;
}

function parseBlockTitle(line: string) {
  if (line.includes('·')) {
    const [label, ...rest] = line.split('·').map((part) => part.trim());
    return {
      label: label || line,
      timing: rest.length > 0 ? rest.join(' · ') : undefined,
    };
  }

  return { label: line, timing: undefined };
}

function normalizeItem(line: string) {
  return line.replace(/^[•\-–]\s*/, '').trim();
}

function isEmomBlock(block: WorkoutContentBlock) {
  return block.label.toLowerCase().includes('emom');
}

function parseEmomMinutes(timing?: string) {
  if (!timing) return null;

  const normalized = timing.toLowerCase();
  const rondasMatch = normalized.match(/(\d+)\s*rondas?/);
  if (rondasMatch) return Number(rondasMatch[1]);

  const minutesMatch = normalized.match(/(\d+)\s*(?:min(?:utos?)?|'|m\b)/);
  if (minutesMatch) return Number(minutesMatch[1]);

  return null;
}

function formatRounds(count: number) {
  return count === 1 ? '1 ronda' : `${count} rondas`;
}

function normalizeEmomBlock(block: WorkoutContentBlock): WorkoutContentBlock {
  if (!isEmomBlock(block) || block.items.length === 0) return block;

  const minutes = parseEmomMinutes(block.timing);
  if (!minutes) return block;

  const circuitRounds = Math.floor(minutes / block.items.length);
  if (circuitRounds <= 0) return block;

  const items = block.items.map((item) =>
    item.replace(/\s*[×x]\s*\d+\s*rondas?/gi, '').trim(),
  );

  const timing = `${minutes} min · ${formatRounds(circuitRounds)}`;

  return { ...block, timing, items };
}

function parseListSection(section: string): WorkoutContentBlock {
  const lines = section.split('\n').map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] ?? '';
  const { label, timing: titleTiming } = parseBlockTitle(firstLine);

  let cursor = 1;
  let timing = titleTiming;

  if (lines[1] && !/^[•\-–]/.test(lines[1])) {
    timing = timing ? `${timing} · ${lines[1]}` : lines[1];
    cursor = 2;
  }

  const items = lines.slice(cursor).map(normalizeItem).filter(Boolean);

  return normalizeEmomBlock({ label, timing, items });
}

export function hasBulletList(section: string) {
  return section.split('\n').some((line) => /^[•\-–]\s+/.test(line.trim()));
}

export function parseWorkoutContent(content: string): WorkoutContentBlock[] {
  const sections = content
    .split(/\n\n+/)
    .map((section) => section.trim())
    .filter(Boolean);

  const blocks: WorkoutContentBlock[] = [];
  let pendingText: { title: string; parts: string[] } | null = null;

  const flushText = () => {
    if (!pendingText) return;

    const text = pendingText.parts.join('\n\n');
    if (text || pendingText.title) {
      blocks.push({ label: pendingText.title, items: [], text });
    }
    pendingText = null;
  };

  for (const section of sections) {
    const firstLine = section.split('\n')[0]?.trim() ?? '';
    const { label, timing } = parseBlockTitle(firstLine);

    if (isFreeTextBlockLabel(label)) {
      flushText();
      const body = section.split('\n').slice(1).join('\n').trim();
      pendingText = { title: timing?.trim() ?? '', parts: body ? [body] : [] };
      continue;
    }

    // Solo las cabeceras conocidas y las listas con viñetas se reinterpretan:
    // lo demás es texto del entrenador y se respeta con sus saltos de línea.
    if (isKnownBlockLabel(label) || hasBulletList(section)) {
      flushText();
      blocks.push(parseListSection(section));
      continue;
    }

    if (!pendingText) pendingText = { title: '', parts: [] };
    pendingText.parts.push(section);
  }

  flushText();

  return blocks;
}

export function isStructuredWorkoutContent(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return false;

  return trimmed.includes('•') || /\n\n/.test(trimmed);
}

const KNOWN_BLOCK_LABELS = [
  'amrap',
  'emom',
  'for time',
  'rounds for time',
  'tabata',
  'unbroken',
  'ladder',
  'reps for time',
  'movilidad',
  'entrenamiento de tecnica',
  'entrenamiento libre',
  'estaciones de tiempo',
  'estaciones',
  'texto libre',
];

function normalizeLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Distingue una cabecera con tipo de bloque (AMRAP, EMOM…) del texto que escribe
 * el entrenador, que no debe pintarse como si fuera una etiqueta de tipo.
 */
export function isKnownBlockLabel(label: string) {
  const normalized = normalizeLabel(label);
  return KNOWN_BLOCK_LABELS.some((known) => normalized.startsWith(known));
}

export function isFreeTextBlockLabel(label: string) {
  return normalizeLabel(label) === 'texto libre';
}

export function getBlockAccent(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes('amrap')) {
    return { bg: `${'#FFB300'}22`, text: '#FFB300', border: `${'#FFB300'}55` };
  }

  if (normalized.includes('emom')) {
    return { bg: `${'#00B8D4'}22`, text: '#00B8D4', border: `${'#00B8D4'}55` };
  }

  if (
    normalized.includes('for time') ||
    normalized.includes('rounds for time') ||
    normalized.includes('rondas')
  ) {
    return { bg: `${'#FF7373'}22`, text: '#FF7373', border: `${'#FF7373'}55` };
  }

  if (normalized.includes('tabata')) {
    return { bg: `${'#A78BFA'}22`, text: '#A78BFA', border: `${'#A78BFA'}55` };
  }

  if (normalized.includes('unbroken')) {
    return { bg: `${'#FB923C'}22`, text: '#FB923C', border: `${'#FB923C'}55` };
  }

  if (normalized.includes('ladder') || normalized.includes('reps for time')) {
    return { bg: `${'#818CF8'}22`, text: '#818CF8', border: `${'#818CF8'}55` };
  }

  if (normalized.includes('movilidad')) {
    return { bg: `${'#2DD4BF'}22`, text: '#2DD4BF', border: `${'#2DD4BF'}55` };
  }

  if (normalized.includes('técnica') || normalized.includes('tecnica')) {
    return { bg: `${'#60A5FA'}22`, text: '#60A5FA', border: `${'#60A5FA'}55` };
  }

  if (normalized.includes('estaciones')) {
    return { bg: `${'#FBBF24'}22`, text: '#FBBF24', border: `${'#FBBF24'}55` };
  }

  if (normalized.includes('entrenamiento libre')) {
    return { bg: `${'#4ADE80'}22`, text: '#4ADE80', border: `${'#4ADE80'}55` };
  }

  if (normalized.includes('texto libre')) {
    return { bg: '#243044', text: '#94A3B8', border: '#2D3A4F' };
  }

  return { bg: '#243044', text: '#94A3B8', border: '#2D3A4F' };
}
