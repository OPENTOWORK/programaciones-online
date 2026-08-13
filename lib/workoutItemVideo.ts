import { extractYoutubeVideoId, isLikelyYoutubeVideoId } from '@/lib/youtubeVideoId';

/** Sufijo embebido en la línea del ejercicio para conservar el vídeo al guardar el bloque. */
export const WORKOUT_ITEM_VIDEO_MARKER = /@video:([a-zA-Z0-9_-]{11})\b/i;

export function formatWorkoutItemVideoSuffix(youtubeVideoId?: string) {
  const id = youtubeVideoId?.trim();
  if (!id || !isLikelyYoutubeVideoId(id)) return '';
  return ` · @video:${id}`;
}

export function parseWorkoutItemVideoId(line: string): string | undefined {
  const match = line.match(WORKOUT_ITEM_VIDEO_MARKER);
  const id = match?.[1];
  return id && isLikelyYoutubeVideoId(id) ? id : undefined;
}

export function stripWorkoutItemVideoMarker(line: string) {
  return line.replace(WORKOUT_ITEM_VIDEO_MARKER, '').replace(/\s*[@·]\s*$/g, '').trim();
}

export function parseWorkoutItemVideoFromInput(input: string): string | null {
  return extractYoutubeVideoId(input);
}
