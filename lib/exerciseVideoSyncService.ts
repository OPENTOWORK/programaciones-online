import { lookupCardioExerciseVideoId } from '@/lib/cardioExerciseVideos';
import { findBestVideoMatch, shouldSkipExercise } from '@/lib/exerciseVideoMatcher';
import { normalizeExerciseName } from '@/lib/exerciseName';
import { fetchExerciseVideoCatalog } from '@/lib/exerciseVideoService';
import { HYPE_CHANNEL_VIDEOS } from '@/lib/hypeChannelVideos';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ExerciseVideoSyncResult {
  synced: number;
  skipped: number;
  unmatched: string[];
  error?: string;
}

function resolveYoutubeVideoId(
  exerciseName: string,
  existingNameKeys: Set<string>,
  catalogByNameKey: Map<string, string>,
) {
  const nameKey = normalizeExerciseName(exerciseName);
  if (!nameKey || existingNameKeys.has(nameKey)) return null;

  const catalogVideo = catalogByNameKey.get(nameKey);
  if (catalogVideo) return catalogVideo;

  const cardioVideo = lookupCardioExerciseVideoId(exerciseName);
  if (cardioVideo) return cardioVideo;

  const channelMatch = findBestVideoMatch(exerciseName, HYPE_CHANNEL_VIDEOS, { minScore: 55 });
  if (channelMatch) return channelMatch.videoId;

  const catalogCandidates = [...catalogByNameKey.entries()].map(([key, videoId]) => ({
    videoId,
    title: key,
  }));
  const fuzzyCatalogMatch = findBestVideoMatch(exerciseName, catalogCandidates, { minScore: 80 });
  if (fuzzyCatalogMatch) return fuzzyCatalogMatch.videoId;

  return null;
}

export async function syncExerciseVideosForNames(
  exerciseNames: string[],
): Promise<ExerciseVideoSyncResult> {
  const uniqueNames = [...new Set(exerciseNames.map((name) => name.trim()).filter(Boolean))].filter(
    (name) => !shouldSkipExercise(name),
  );

  if (uniqueNames.length === 0) {
    return { synced: 0, skipped: 0, unmatched: [] };
  }

  if (!isSupabaseConfigured) {
    return { synced: 0, skipped: uniqueNames.length, unmatched: [] };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { synced: 0, skipped: 0, unmatched: uniqueNames, error: 'Supabase no está disponible' };
  }

  const catalog = await fetchExerciseVideoCatalog();
  const existingNameKeys = new Set(catalog.byNameKey.keys());
  const catalogByNameKey = catalog.byNameKey;

  let synced = 0;
  let skipped = 0;
  const unmatched: string[] = [];

  for (const exerciseName of uniqueNames) {
    const nameKey = normalizeExerciseName(exerciseName);
    if (!nameKey) continue;

    if (existingNameKeys.has(nameKey)) {
      skipped += 1;
      continue;
    }

    const youtubeVideoId = resolveYoutubeVideoId(exerciseName, existingNameKeys, catalogByNameKey);
    if (!youtubeVideoId) {
      unmatched.push(exerciseName);
      continue;
    }

    const { data, error } = await supabase
      .from('ejercicios_videos')
      .upsert(
        {
          name: exerciseName,
          name_key: nameKey,
          youtube_video_id: youtubeVideoId,
        },
        { onConflict: 'name_key' },
      )
      .select('name_key')
      .maybeSingle();

    if (error || !data) {
      return {
        synced,
        skipped,
        unmatched,
        error: error?.message ?? `No se pudo guardar el vídeo de "${exerciseName}"`,
      };
    }

    existingNameKeys.add(nameKey);
    catalogByNameKey.set(nameKey, youtubeVideoId);
    synced += 1;
  }

  return { synced, skipped, unmatched };
}
