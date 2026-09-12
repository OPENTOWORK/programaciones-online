import { peekExerciseVideoCatalog } from '@/lib/exerciseVideoCatalogCache';
import { normalizeExerciseName } from '@/lib/exerciseName';
import {
  lookupExerciseVideoId,
  type ExerciseVideoCatalog,
} from '@/lib/exerciseVideoService';
import { HYPE_CHANNEL_VIDEOS } from '@/lib/hypeChannelVideos';
import {
  parseWorkoutBlocksFromText,
  serializeWorkoutBlocks,
  type WorkoutBlockDraft,
  type WorkoutBlockItemDraft,
} from '@/lib/workoutBlockBuilder';

let hypeChannelCatalog: ExerciseVideoCatalog | null = null;

function buildCatalogFromEntries(
  entries: Array<{ name: string; youtubeVideoId: string; aimharderEjerId?: number }>,
): ExerciseVideoCatalog {
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

function hypeChannelVideoCatalog() {
  if (!hypeChannelCatalog) {
    hypeChannelCatalog = buildCatalogFromEntries(
      HYPE_CHANNEL_VIDEOS.map((video) => ({
        name: video.title,
        youtubeVideoId: video.videoId,
      })),
    );
  }
  return hypeChannelCatalog;
}

function mergeCatalogs(
  primary: ExerciseVideoCatalog,
  secondary: ExerciseVideoCatalog,
): ExerciseVideoCatalog {
  const byEjerId = new Map(primary.byEjerId);
  const byNameKey = new Map(primary.byNameKey);

  for (const [key, value] of secondary.byEjerId) {
    if (!byEjerId.has(key)) byEjerId.set(key, value);
  }
  for (const [key, value] of secondary.byNameKey) {
    if (!byNameKey.has(key)) byNameKey.set(key, value);
  }

  return { byEjerId, byNameKey };
}

/** Catálogo local del canal Hype + Supabase si ya está en caché. */
export function resolveExerciseVideoCatalog(): ExerciseVideoCatalog {
  const remote = peekExerciseVideoCatalog();
  const local = hypeChannelVideoCatalog();
  if (remote.byNameKey.size === 0) return local;
  return mergeCatalogs(remote, local);
}

function attachVideoToItem(
  item: WorkoutBlockItemDraft,
  catalog: ExerciseVideoCatalog,
): WorkoutBlockItemDraft {
  if (!item.text.trim()) return item;
  if (item.youtubeVideoId?.trim()) return item;

  const videoId = lookupExerciseVideoId(catalog, item.text, item.aimharderEjerId, item.youtubeVideoId);
  if (!videoId) return item;
  return { ...item, youtubeVideoId: videoId };
}

export function attachExerciseVideosToBlocks(
  blocks: readonly WorkoutBlockDraft[],
  catalog = resolveExerciseVideoCatalog(),
): WorkoutBlockDraft[] {
  return blocks.map((block) => {
    if (block.type === 'free_text') return block;
    return {
      ...block,
      items: block.items.map((item) => attachVideoToItem(item, catalog)),
    };
  });
}

export function enrichStructuredWorkoutContent(
  content: string,
  catalog = resolveExerciseVideoCatalog(),
) {
  const trimmed = content.trim();
  if (!trimmed) return content;

  const blocks = parseWorkoutBlocksFromText(trimmed);
  if (blocks.length === 0) return content;

  const enriched = attachExerciseVideosToBlocks(blocks, catalog);
  return serializeWorkoutBlocks(enriched);
}
