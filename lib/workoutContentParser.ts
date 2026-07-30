export interface WorkoutContentBlock {
  label: string;
  timing?: string;
  items: string[];
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

export function parseWorkoutContent(content: string): WorkoutContentBlock[] {
  return content
    .split(/\n\n+/)
    .map((section) => section.trim())
    .filter(Boolean)
    .map((section) => {
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

      return { label, timing, items };
    })
    .map(normalizeEmomBlock);
}

export function isStructuredWorkoutContent(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return false;

  return trimmed.includes('•') || /\n\n/.test(trimmed);
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
