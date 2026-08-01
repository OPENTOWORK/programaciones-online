import { CARDIO_EXERCISE_VIDEO_ENTRIES } from '@/lib/cardioExerciseVideos';
import { normalizeExerciseName } from '@/lib/exerciseName';
import type { ExerciseVideoEntry } from '@/lib/exerciseVideoService';
import { HYPE_CHANNEL_VIDEOS } from '@/lib/hypeChannelVideos';

export interface ExerciseLibraryItem {
  videoId: string;
  name: string;
  /** `channel` si el vídeo está en el canal; `plan` si solo aparece enlazado desde los planes. */
  source: 'channel' | 'plan';
  /** Otros nombres con los que el mismo vídeo aparece en los entrenos. */
  aliases: string[];
}

function addAlias(item: ExerciseLibraryItem, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const key = normalizeExerciseName(trimmed);
  if (!key || key === normalizeExerciseName(item.name)) return;
  if (item.aliases.some((alias) => normalizeExerciseName(alias) === key)) return;

  item.aliases.push(trimmed);
}

/**
 * Une el catálogo del canal de YouTube con los ejercicios que ya están enlazados desde los planes,
 * para que la biblioteca enseñe un vídeo una sola vez aunque tenga varios nombres.
 */
export function buildExerciseLibrary(planEntries: ExerciseVideoEntry[] = []): ExerciseLibraryItem[] {
  const byVideoId = new Map<string, ExerciseLibraryItem>();

  for (const video of HYPE_CHANNEL_VIDEOS) {
    if (!video.videoId) continue;
    if (byVideoId.has(video.videoId)) continue;
    byVideoId.set(video.videoId, {
      videoId: video.videoId,
      name: video.title.trim(),
      source: 'channel',
      aliases: [],
    });
  }

  const extras: Array<{ name: string; youtubeVideoId: string }> = [
    ...CARDIO_EXERCISE_VIDEO_ENTRIES.map((entry) => ({ ...entry })),
    ...planEntries.map((entry) => ({ name: entry.name, youtubeVideoId: entry.youtubeVideoId })),
  ];

  for (const entry of extras) {
    if (!entry.youtubeVideoId || !entry.name?.trim()) continue;

    const existing = byVideoId.get(entry.youtubeVideoId);
    if (existing) {
      addAlias(existing, entry.name);
      continue;
    }

    byVideoId.set(entry.youtubeVideoId, {
      videoId: entry.youtubeVideoId,
      name: entry.name.trim(),
      source: 'plan',
      aliases: [],
    });
  }

  return Array.from(byVideoId.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
  );
}

/** Filtra por nombre o por cualquiera de sus alias, ignorando tildes y mayúsculas. */
export function filterExerciseLibrary(items: ExerciseLibraryItem[], query: string) {
  const normalized = normalizeExerciseName(query);
  if (!normalized) return items;

  const terms = normalized.split(' ').filter(Boolean);

  return items.filter((item) => {
    const haystack = normalizeExerciseName([item.name, ...item.aliases].join(' '));
    return terms.every((term) => haystack.includes(term));
  });
}

export function getYoutubeThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}
