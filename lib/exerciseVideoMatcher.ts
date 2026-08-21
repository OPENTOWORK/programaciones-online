import { normalizeExerciseName } from '@/lib/exerciseName';

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'with',
  'de',
  'la',
  'el',
  'y',
  'en',
  'un',
  'una',
]);

const TOKEN_ALIASES = new Map([
  ['db', 'dumbbell'],
  ['dbs', 'dumbbell'],
  ['kb', 'kettlebell'],
  ['ktb', 'kettlebell'],
  ['bb', 'barbell'],
  ['oh', 'overhead'],
  ['pu', 'pullup'],
  ['pullups', 'pullup'],
  ['pushups', 'pushup'],
  ['push up', 'pushup'],
  ['pull up', 'pullup'],
  ['chinup', 'chin up'],
  ['hspu', 'handstand push up'],
  ['t2b', 'toes to bar'],
  ['ttb', 'toes to bar'],
  ['rft', 'rounds for time'],
]);

const EXERCISE_VARIANTS: Array<[RegExp, string[]]> = [
  [/deadlift/i, ['peso muerto', 'deadlift']],
  [/romanian deadlift|rdl/i, ['peso muerto rumano', 'romanian deadlift']],
  [/front squat/i, ['sentadilla frontal', 'front squat']],
  [/back squat/i, ['sentadilla trasera', 'back squat', 'sentadilla']],
  [/shoulder press|press militar/i, ['press militar', 'shoulder press']],
  [/thruster/i, ['thruster']],
  [/devil\s*press/i, ['devil press', 'devilpress']],
  [/wall ball/i, ['wall ball']],
  [/kettlebell swing|russian ktb swing/i, ['swing ruso', 'russian swing']],
  [/hang clean/i, ['hang clean', 'hang power clean']],
  [/strict pullup/i, ['pull up', 'strict pull up']],
  [/strict chinup/i, ['chin up', 'pull up']],
  [/run synchro/i, ['run', 'synchro run']],
];

export interface VideoCandidate {
  videoId: string;
  title: string;
}

function tokenize(value: string) {
  const normalized = normalizeExerciseName(value)
    .replace(/\./g, ' ')
    .replace(/\bx\b/g, ' ')
    .replace(/\//g, ' ');

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => TOKEN_ALIASES.get(token) ?? token)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function getExerciseMatchVariants(exerciseName: string) {
  const variants = new Set([exerciseName]);
  for (const [pattern, extras] of EXERCISE_VARIANTS) {
    if (pattern.test(exerciseName)) {
      extras.forEach((item) => variants.add(item));
    }
  }
  return [...variants];
}

function scoreTokens(exerciseName: string, videoTitle: string) {
  const exerciseTokens = tokenize(exerciseName);
  const videoTokens = tokenize(videoTitle);

  if (exerciseTokens.length === 0 || videoTokens.length === 0) return 0;

  const exerciseKey = normalizeExerciseName(exerciseName);
  const videoKey = normalizeExerciseName(videoTitle);

  if (exerciseKey === videoKey) return 100;
  if (videoKey.includes(exerciseKey) || exerciseKey.includes(videoKey)) return 90;

  const exerciseSet = new Set(exerciseTokens);
  const videoSet = new Set(videoTokens);
  let overlap = 0;

  for (const token of exerciseSet) {
    if (videoSet.has(token)) overlap += 1;
  }

  if (overlap === 0) return 0;

  const coverage = overlap / exerciseSet.size;
  const density = overlap / Math.max(videoSet.size, exerciseSet.size);
  let score = coverage * 70 + density * 30;

  if (videoKey.includes('tutorial') || videoKey.includes('how to')) score += 3;
  if (videoKey.includes('wod') || videoKey.includes('partner')) score -= 8;
  if (videoKey.includes('rest')) score -= 20;

  return Math.round(score);
}

export function scoreExerciseVideoMatch(exerciseName: string, videoTitle: string) {
  const variants = getExerciseMatchVariants(exerciseName);
  return Math.max(...variants.map((variant) => scoreTokens(variant, videoTitle)));
}

export function findBestVideoMatch(
  exerciseName: string,
  candidates: VideoCandidate[],
  { minScore = 55 }: { minScore?: number } = {},
) {
  let best: (VideoCandidate & { score: number }) | null = null;

  for (const candidate of candidates) {
    const score = scoreExerciseVideoMatch(exerciseName, candidate.title);
    if (score < minScore) continue;
    if (!best || score > best.score) {
      best = { ...candidate, score };
    }
  }

  return best;
}

export function shouldSkipExercise(name: string) {
  const key = normalizeExerciseName(name);
  return key === 'descanso rest' || key === 'rest' || key === 'texto libre';
}

/** Quita series, reps y tiempos para poder emparejar el nombre con el vídeo. */
export function cleanExerciseNameForVideo(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return '';

  const withoutPrescription = trimmed
    .replace(/\s+\d+\s*[x×]\s*\d+.*$/i, '')
    .replace(/\s+\d+\s*reps?.*$/i, '')
    .replace(/\s+\d+\s*[''].*$/i, '')
    .replace(/\s+\d+\s*min(?:utos?)?.*$/i, '')
    .trim();

  const colonIndex = withoutPrescription.indexOf(':');
  if (colonIndex > 0) return withoutPrescription.slice(0, colonIndex).trim();

  return withoutPrescription || trimmed;
}

export function videoLookupNames(name: string) {
  const cleaned = cleanExerciseNameForVideo(name);
  return [...new Set([name.trim(), cleaned].filter(Boolean))];
}
