import { normalizeExerciseName } from './aimharderVideoExtract.mjs';

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

const SKIP_EXERCISE_KEYS = new Set([
  'descanso rest',
  'rest',
  'any cardio mach metros',
  'any cardio mach cal',
  'texto libre',
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

function tokenize(value) {
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

export function shouldSkipExercise(name) {
  const key = normalizeExerciseName(name);
  return SKIP_EXERCISE_KEYS.has(key);
}

const EXERCISE_VARIANTS = [
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

function getExerciseMatchVariants(exerciseName) {
  const variants = new Set([exerciseName]);
  for (const [pattern, extras] of EXERCISE_VARIANTS) {
    if (pattern.test(exerciseName)) {
      extras.forEach((item) => variants.add(item));
    }
  }
  return [...variants];
}

export function scoreExerciseVideoMatch(exerciseName, videoTitle) {
  const variants = getExerciseMatchVariants(exerciseName);
  return Math.max(...variants.map((variant) => scoreTokens(variant, videoTitle)));
}

function scoreTokens(exerciseName, videoTitle) {
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

export function findBestVideoMatch(exerciseName, candidates, { minScore = 55 } = {}) {
  let best = null;

  for (const candidate of candidates) {
    const score = scoreExerciseVideoMatch(exerciseName, candidate.title);
    if (score < minScore) continue;
    if (!best || score > best.score) {
      best = { ...candidate, score };
    }
  }

  return best;
}

export function buildSearchQuery(exerciseName) {
  const cleaned = exerciseName
    .replace(/\./g, ' ')
    .replace(/\//g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return `${cleaned} crossfit form tutorial`;
}
