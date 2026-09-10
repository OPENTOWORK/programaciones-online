const SEGMENT_PREFIXES = [
  'Front Hold',
  'Plancha Hold',
  'Balance',
  'Plancha',
  'Tirón',
  'Empuje',
  'Front',
] as const;

const BLOCK = {
  technique: 'Técnica/skills',
  strength: 'Fuerza',
} as const;

type ParsedExercise = {
  name: string;
  sets: string;
  reps: string;
  detail: string;
  rir: string;
  notes: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function headerPart(value: string) {
  return String(value).replace(/\s*·\s*/g, ' - ').replace(/\s+/g, ' ').trim();
}

function block(
  label: string,
  {
    title,
    timing,
    note,
    items = [],
  }: { title?: string; timing?: string; note?: string; items?: string[] } = {},
) {
  const header = [label, title, timing].filter(Boolean).map(headerPart).join(' · ');
  const lines = [header];
  if (note) lines.push(headerPart(note));
  for (const item of items) lines.push(`• ${item}`);
  return lines.join('\n');
}

function setsItem(name: string, sets: string, reps: string, load?: string) {
  return `${name}: ${sets} × ${reps}${load ? ` · ${load}` : ''}`;
}

function qtyItem(name: string, quantity: string, load?: string) {
  return `${name}: ${quantity}${load ? ` · ${load}` : ''}`;
}

function splitSegments(text: string) {
  const pattern = new RegExp(
    `(?=(?:${SEGMENT_PREFIXES.map((prefix) => escapeRegex(prefix)).join('|')})\\b)`,
    'gi',
  );
  return text
    .split(pattern)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function splitAlternates(body: string) {
  return body.split(/\s+O\s+/i).map((part) => part.trim()).filter(Boolean);
}

function inferRepsAndDetail(prescription: string): { reps: string; detail: string } {
  const complex =
    /press|flex|pull|dominada|muscle|negativa/i.test(prescription) &&
    (prescription.includes(',') || /\s+y\s+/i.test(prescription));
  if (complex) {
    return { reps: prescription.trim(), detail: '' };
  }

  const holdDe = prescription.match(/^(\d+(?:-\d+)?)\s*secs?\s+de\s+(.+)$/i);
  if (holdDe) {
    return { reps: `${holdDe[1]} s`, detail: holdDe[2].trim() };
  }

  const holdOnly = prescription.match(/^(\d+(?:-\d+)?)\s*secs?\b/i);
  if (holdOnly) {
    const rest = prescription.slice(holdOnly[0].length).replace(/^\s*de\s+/i, '').trim();
    return { reps: `${holdOnly[1]} s`, detail: rest };
  }

  const repFirst = prescription.match(/^(\d+(?:-\d+)?)\s+(.+)$/);
  if (repFirst) {
    return { reps: repFirst[1], detail: repFirst[2].trim() };
  }

  return { reps: '', detail: prescription.trim() };
}

function formatExerciseName(category: string, detail: string, isAlternate: boolean) {
  const prefix = isAlternate ? '(Alt) ' : '';
  if (!detail) return `${prefix}${category}`;
  return `${prefix}${category} — ${detail}`;
}

function formatExerciseItem(exercise: ParsedExercise) {
  const name =
    exercise.reps && !exercise.detail ? exercise.name.replace(/ — .+$/, '') : exercise.name;
  const load = exercise.rir ? `RIR ${exercise.rir}` : '';
  const reps = exercise.reps || exercise.detail;
  if (exercise.sets && reps) return setsItem(name, exercise.sets, reps, load);
  if (exercise.sets) return setsItem(name, exercise.sets, '1', load);
  if (reps) return qtyItem(name, reps, load);
  return name;
}

function parseVariant(category: string, text: string, isAlternate: boolean): ParsedExercise {
  let working = text.trim();

  working = working.replace(/\s+x(\d{2,}-\d{2,})\s*$/i, '').trim();

  let sets = '';
  const setsMatch = working.match(/\s+x(\d+(?:-\d+)?)\s*$/i);
  if (setsMatch) {
    sets = setsMatch[1];
    working = working.slice(0, -setsMatch[0].length).trim();
  }

  const notes: string[] = [];
  working = working
    .replace(/\*([^*]+)\*/g, (_, note) => {
      notes.push(note.trim());
      return ' ';
    })
    .trim();

  let rir = '';
  const rirMatch = working.match(/\(\s*RIR\s*([^)]+)\)/i);
  if (rirMatch) {
    rir = rirMatch[1].trim();
    working = working.replace(rirMatch[0], ' ').trim();
  }

  const bandMatch = working.match(/\bCon goma de [\d.]+\s*kg\b/i);
  if (bandMatch) {
    notes.push(bandMatch[0]);
    working = working.replace(bandMatch[0], ' ').trim();
  }

  working = working.replace(/\s+/g, ' ').trim();
  const { reps, detail } = inferRepsAndDetail(working);

  return {
    name: formatExerciseName(category, detail, isAlternate),
    sets,
    reps,
    detail,
    rir,
    notes: notes.join(' · '),
  };
}

function parseBalanceSegment(body: string) {
  const timingMatch = body.match(/(\d+(?:-\d+)?)\s*mins?\b/i);
  const timing = timingMatch ? `${timingMatch[1]} min` : '15-20 min';
  const note = body
    .replace(timingMatch?.[0] ?? '', '')
    .replace(/\.{2,}|…/g, '…')
    .trim();

  return block(BLOCK.technique, {
    title: 'Balance',
    timing,
    note,
    items: [qtyItem('Aguante de pino', timing)],
  });
}

function parseStrengthSegment(segment: string): ParsedExercise[] {
  const prefixMatch = segment.match(
    /^(Front Hold|Plancha Hold|Balance|Plancha|Tirón|Empuje|Front)\s*/i,
  );
  if (!prefixMatch) return [];

  const category = prefixMatch[1];
  const body = segment.slice(prefixMatch[0].length).trim();
  if (category.toLowerCase() === 'balance') return [];

  return splitAlternates(body).map((variant, index) => parseVariant(category, variant, index > 0));
}

export function isCalisthenicsPlanText(text: string) {
  const normalized = text.trim();
  if (!normalized) return false;
  return (
    /→\s*.+\bSERIES\b/i.test(normalized) &&
    /\b(Front Hold|Plancha Hold|Plancha)\b/i.test(normalized) &&
    /\bRIR\b/i.test(normalized)
  );
}

export function serializeCalisthenicsPlanMain(text: string) {
  let body = text.trim().replace(/^→\s*/, '').trim();
  const seriesMatch = body.match(/^([A-ZÁÉÍÓÚÑ() Y]+SERIES)\s*/i);
  const seriesTitle = seriesMatch?.[1]?.trim() ?? '';
  if (seriesMatch) {
    body = body.slice(seriesMatch[0].length).trim();
  }

  const segments = splitSegments(body);
  const techniqueBlocks: string[] = [];
  const strengthItems: string[] = [];
  const strengthNotes: string[] = [];

  for (const segment of segments) {
    if (/^Balance\b/i.test(segment)) {
      const balanceBody = segment.replace(/^Balance\s*/i, '').trim();
      techniqueBlocks.push(parseBalanceSegment(balanceBody));
      continue;
    }

    const exercises = parseStrengthSegment(segment);
    for (const exercise of exercises) {
      strengthItems.push(formatExerciseItem(exercise));
      if (exercise.notes) strengthNotes.push(`${exercise.name}: ${exercise.notes}`);
    }
  }

  const totalRepsMatch = text.match(/\s+x(\d+-\d+)\s*$/);
  if (totalRepsMatch) {
    strengthNotes.push(`Volumen total de tirón: ${totalRepsMatch[1]} repeticiones`);
  }

  const strengthBlock = block(BLOCK.strength, {
    title: seriesTitle || undefined,
    note: strengthNotes.length > 0 ? strengthNotes.join(' · ') : undefined,
    items: strengthItems,
  });

  return [...techniqueBlocks, strengthBlock].join('\n\n');
}
