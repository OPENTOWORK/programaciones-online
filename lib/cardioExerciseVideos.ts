import { normalizeExerciseName } from '@/lib/exerciseName';

/** Vídeos manuales del canal Train with HY-PE para cardio genérico y ergos. */
export const CARDIO_EXERCISE_VIDEO_IDS: Record<string, string> = {
  'any cardio mach metros': '7wIUgbLxkDo',
  'any cardio mach cal': '7wIUgbLxkDo',
  'any cardio mach': '7wIUgbLxkDo',
  'ergo row': '1bj10fNADVA',
  'ergo bike': 'RWHR0ctQG7Y',
  'ergo ski': 'l5qMpwsIagw',
};

export const CARDIO_EXERCISE_VIDEO_ENTRIES = [
  { name: 'ANY CARDIO MACH-METROS', youtubeVideoId: '7wIUgbLxkDo' },
  { name: 'ANY CARDIO MACH-CAL', youtubeVideoId: '7wIUgbLxkDo' },
  { name: 'Any Cardio Mach', youtubeVideoId: '7wIUgbLxkDo' },
  { name: 'Ergo Row', youtubeVideoId: '1bj10fNADVA' },
  { name: 'Ergo Bike', youtubeVideoId: 'RWHR0ctQG7Y' },
  { name: 'Ergo Ski', youtubeVideoId: 'l5qMpwsIagw' },
] as const;

export function lookupCardioExerciseVideoId(name: string): string | null {
  const key = normalizeExerciseName(name);
  if (!key) return null;

  const direct = CARDIO_EXERCISE_VIDEO_IDS[key];
  if (direct) return direct;

  if (key.includes('cardio mach')) {
    return CARDIO_EXERCISE_VIDEO_IDS['any cardio mach'];
  }

  return null;
}
