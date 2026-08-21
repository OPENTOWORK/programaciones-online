import { lookupCardioExerciseVideoId } from '@/lib/cardioExerciseVideos';
import { normalizeExerciseName } from '@/lib/exerciseName';
import {
  findBestVideoMatch,
  shouldSkipExercise,
  videoLookupNames,
} from '@/lib/exerciseVideoMatcher';
import { HYPE_CHANNEL_VIDEOS } from '@/lib/hypeChannelVideos';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ExerciseVideoEntry {
  aimharderEjerId?: number;
  name: string;
  youtubeVideoId: string;
}

export interface ExerciseCatalogEntry {
  name: string;
  aimharderEjerId?: number;
}

export interface ExerciseVideoCatalog {
  byEjerId: Map<number, string>;
  byNameKey: Map<string, string>;
}

function buildCatalog(entries: ExerciseVideoEntry[]): ExerciseVideoCatalog {
  const byEjerId = new Map<number, string>();
  const byNameKey = new Map<string, string>();

  for (const entry of entries) {
    if (entry.aimharderEjerId != null) {
      byEjerId.set(entry.aimharderEjerId, entry.youtubeVideoId);
    }

    byNameKey.set(normalizeExerciseName(entry.name), entry.youtubeVideoId);
  }

  return { byEjerId, byNameKey };
}

/** Vídeo genérico del canal mientras el entrenador asigna el correcto. */
export const PLACEHOLDER_EXERCISE_VIDEO_ID = 'L7Cxfvr1jXU';

export function lookupExerciseVideoId(
  catalog: ExerciseVideoCatalog,
  name: string,
  aimharderEjerId?: number,
  youtubeVideoId?: string,
): string | null {
  const override = youtubeVideoId?.trim();
  if (override) return override;
  if (shouldSkipExercise(name)) return null;

  if (aimharderEjerId != null) {
    const byId = catalog.byEjerId.get(aimharderEjerId);
    if (byId) return byId;
  }

  const names = videoLookupNames(name);
  for (const candidate of names) {
    const cardioVideoId = lookupCardioExerciseVideoId(candidate);
    if (cardioVideoId) return cardioVideoId;

    const exact = catalog.byNameKey.get(normalizeExerciseName(candidate));
    if (exact) return exact;
  }

  for (const candidate of names) {
    const channelMatch = findBestVideoMatch(candidate, HYPE_CHANNEL_VIDEOS, { minScore: 55 });
    if (channelMatch) return channelMatch.videoId;
  }

  const catalogCandidates = [...catalog.byNameKey.entries()].map(([key, videoId]) => ({
    videoId,
    title: key,
  }));
  for (const candidate of names) {
    const fuzzyCatalogMatch = findBestVideoMatch(candidate, catalogCandidates, { minScore: 72 });
    if (fuzzyCatalogMatch) return fuzzyCatalogMatch.videoId;
  }

  return PLACEHOLDER_EXERCISE_VIDEO_ID;
}

export async function fetchExerciseCatalogEntries(): Promise<ExerciseCatalogEntry[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('ejercicios_videos')
    .select('aimharder_ejer_id, name')
    .order('name');

  if (error || !data) return [];

  return data.map((row) => ({
    name: row.name,
    aimharderEjerId: row.aimharder_ejer_id ?? undefined,
  }));
}

export function searchExerciseCatalog(
  query: string,
  entries: ExerciseCatalogEntry[],
  limit = 8,
): ExerciseCatalogEntry[] {
  const normalized = normalizeExerciseName(query);
  if (!normalized) return entries.slice(0, limit);

  const matches = entries.filter((entry) => normalizeExerciseName(entry.name).includes(normalized));
  return matches.slice(0, limit);
}

export async function fetchExerciseVideoEntries(): Promise<ExerciseVideoEntry[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('ejercicios_videos')
    .select('aimharder_ejer_id, name, youtube_video_id')
    .order('name');

  if (error || !data) return [];

  return data
    .filter((row) => Boolean(row.youtube_video_id))
    .map((row) => ({
      aimharderEjerId: row.aimharder_ejer_id ?? undefined,
      name: row.name,
      youtubeVideoId: row.youtube_video_id,
    }));
}

export async function fetchExerciseVideoCatalog(): Promise<ExerciseVideoCatalog> {
  if (!isSupabaseConfigured) {
    return { byEjerId: new Map(), byNameKey: new Map() };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { byEjerId: new Map(), byNameKey: new Map() };
  }

  const { data, error } = await supabase
    .from('ejercicios_videos')
    .select('aimharder_ejer_id, name, youtube_video_id');

  if (error || !data) {
    return { byEjerId: new Map(), byNameKey: new Map() };
  }

  return buildCatalog(
    data.map((row) => ({
      aimharderEjerId: row.aimharder_ejer_id ?? undefined,
      name: row.name,
      youtubeVideoId: row.youtube_video_id,
    })),
  );
}

export function getYoutubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    fs: '1',
    enablejsapi: '1',
    autoplay: '1',
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function getYoutubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
