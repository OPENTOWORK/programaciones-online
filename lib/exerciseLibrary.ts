import { normalizeExerciseName } from '@/lib/exerciseName';
import { HYPE_CHANNEL_VIDEOS } from '@/lib/hypeChannelVideos';

export interface ExerciseLibraryItem {
  videoId: string;
  name: string;
  /** Vídeos del canal Trainwithhype o subidos por un entrenador. */
  source: 'channel' | 'user';
  createdBy?: string;
  /** Otros nombres con los que el mismo vídeo aparece en los entrenos. */
  aliases: string[];
}

export type ExerciseLibraryOriginFilter = 'all' | 'page' | 'mine';

/**
 * Catálogo del canal de YouTube Trainwithhype.
 */
export function buildExerciseLibrary(): ExerciseLibraryItem[] {
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

  return Array.from(byVideoId.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
  );
}

/**
 * Biblioteca = catálogo del canal de YouTube Trainwithhype más los vídeos subidos por el equipo.
 */
export function mergeExerciseLibrary(
  channelItems: ExerciseLibraryItem[],
  uploads: ExerciseLibraryItem[],
): ExerciseLibraryItem[] {
  const byVideoId = new Map<string, ExerciseLibraryItem>();

  for (const item of channelItems) {
    if (!item.videoId || byVideoId.has(item.videoId)) continue;
    byVideoId.set(item.videoId, item);
  }

  for (const item of uploads) {
    if (!item.videoId || byVideoId.has(item.videoId)) continue;
    byVideoId.set(item.videoId, item);
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

export function filterExerciseLibraryByOrigin(
  items: ExerciseLibraryItem[],
  origin: ExerciseLibraryOriginFilter,
  userId?: string,
) {
  if (origin === 'page') return items.filter((item) => item.source === 'channel');
  if (origin === 'mine') {
    return items.filter((item) => item.source === 'user' && Boolean(userId) && item.createdBy === userId);
  }
  return items;
}

export function getYoutubeThumbnailUrl(videoId: string) {
  // maxres (~1280px) para rejillas retina; si no existe, el componente cae a hq/sd.
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

/** Orden de calidad: maxres → sd → hq (mq solo como último recurso). */
export function getYoutubeThumbnailCandidates(videoId: string) {
  return [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
  ];
}
