import { normalizeExerciseName } from '@/lib/exerciseName';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ExerciseVideoEntry {
  aimharderEjerId?: number;
  name: string;
  youtubeVideoId: string;
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
): string | null {
  if (aimharderEjerId != null) {
    const byId = catalog.byEjerId.get(aimharderEjerId);
    if (byId) return byId;
  }

  return catalog.byNameKey.get(normalizeExerciseName(name)) ?? null;
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
    origin: 'https://www.youtube.com',
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function getYoutubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
