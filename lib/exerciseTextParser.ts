import { normalizeExerciseName } from '@/lib/exerciseName';
import { shouldSkipExercise } from '@/lib/exerciseVideoMatcher';

export interface ParsedExerciseLine {
  name: string;
  reps: string;
}

function stripRepsSuffix(line: string) {
  const patterns = [
    /^(.+?)\s+\d+\s*[x×]\s*\d+.*$/i,
    /^(.+?)\s+\d+\s*reps?.*$/i,
    /^(.+?)\s+\d+\s*[''].*$/i,
    /^(.+?)\s+\d+\s*min(?:utos?)?.*$/i,
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  const colonMatch = line.match(/^(.+?):\s*.+$/);
  if (colonMatch?.[1]) return colonMatch[1].trim();

  return line.trim();
}

function parseReps(line: string, name: string) {
  const remainder = line.slice(name.length).trim().replace(/^[:]\s*/, '');
  return remainder || '—';
}

export function parseExerciseLinesFromText(text: string): ParsedExerciseLine[] {
  if (!text.trim()) return [];

  const seen = new Set<string>();
  const results: ParsedExerciseLine[] = [];

  for (const rawLine of text.split(/[\n;]+/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const name = stripRepsSuffix(line);
    if (!name || shouldSkipExercise(name)) continue;

    const key = normalizeExerciseName(name);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    results.push({
      name,
      reps: parseReps(line, name),
    });
  }

  return results;
}

export function collectExerciseNamesFromSessionDraft(draft: {
  exercises: Array<{ name: string }>;
  warmup: string;
  main: string;
  metcon?: string;
  core: string;
  cooldown?: string;
}) {
  const names = new Set<string>();

  for (const exercise of draft.exercises) {
    const trimmed = exercise.name.trim();
    if (trimmed && !shouldSkipExercise(trimmed)) {
      names.add(trimmed);
    }
  }

  for (const parsed of parseExerciseLinesFromText(
    [draft.warmup, draft.main, draft.metcon, draft.core, draft.cooldown].filter(Boolean).join('\n'),
  )) {
    names.add(parsed.name);
  }

  return [...names];
}

export function collectExerciseNamesFromDrafts(
  editorItems: Array<{
    draft: {
      exercises: Array<{ name: string }>;
      warmup: string;
      main: string;
      metcon?: string;
      core: string;
      cooldown?: string;
    };
  }>,
  description: string,
) {
  const names = new Set<string>();

  for (const item of editorItems) {
    for (const exercise of item.draft.exercises) {
      const trimmed = exercise.name.trim();
      if (trimmed && !shouldSkipExercise(trimmed)) {
        names.add(trimmed);
      }
    }

    for (const parsed of parseExerciseLinesFromText(
      [item.draft.warmup, item.draft.main, item.draft.metcon, item.draft.core, item.draft.cooldown]
        .filter(Boolean)
        .join('\n'),
    )) {
      names.add(parsed.name);
    }
  }

  for (const parsed of parseExerciseLinesFromText(description)) {
    names.add(parsed.name);
  }

  return [...names];
}
