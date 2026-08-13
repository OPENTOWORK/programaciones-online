import { lookupCardioExerciseVideoId } from '@/lib/cardioExerciseVideos';
import { normalizeExerciseName } from '@/lib/exerciseName';
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

export function lookupExerciseVideoId(
  catalog: ExerciseVideoCatalog,
  name: string,
  aimharderEjerId?: number,
  youtubeVideoId?: string,
): string | null {
  const override = youtubeVideoId?.trim();
  if (override) return override;

  if (aimharderEjerId != null) {
    const byId = catalog.byEjerId.get(aimharderEjerId);
    if (byId) return byId;
  }

  const cardioVideoId = lookupCardioExerciseVideoId(name);
  if (cardioVideoId) return cardioVideoId;

  return catalog.byNameKey.get(normalizeExerciseName(name)) ?? null;
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
