import { isLikelyYoutubeVideoId } from '@/lib/youtubeVideoId';

export interface FreeTextBlockVideo {
  /** Nombre del ejercicio o etiqueta que ve el atleta. */
  label: string;
  youtubeVideoId: string;
}

/**
 * Los bloques de texto libre no tienen lista de ejercicios donde colgar un vídeo, así que los
 * vídeos viajan al final del propio texto detrás de esta línea centinela. El editor y la vista del
 * atleta la ocultan: para el entrenador es una lista aparte y para el atleta son botones de vídeo.
 */
const VIDEO_SECTION_MARKER = '@videos';

const VIDEO_ENTRY = /^(.*?)@video:([a-zA-Z0-9_-]{11})\s*$/;

/**
 * Solo quita el separador que va delante del marcador. No recorta espacios porque el nombre se
 * edita letra a letra: si se recortaran, el entrenador no podría escribir «Back Squat».
 */
function stripTrailingSeparator(label: string) {
  return label.replace(/\s*·\s*$/, '');
}

export function parseFreeTextBlockContent(content: string): {
  body: string;
  videos: FreeTextBlockVideo[];
} {
  const lines = content.split('\n');
  const markerIndex = lines.findIndex(
    (line) => line.trim().toLowerCase() === VIDEO_SECTION_MARKER,
  );
  if (markerIndex < 0) return { body: content, videos: [] };

  const videos: FreeTextBlockVideo[] = [];

  for (const line of lines.slice(markerIndex + 1)) {
    const match = line.trimStart().match(VIDEO_ENTRY);
    if (!match || !isLikelyYoutubeVideoId(match[2])) continue;
    videos.push({ label: stripTrailingSeparator(match[1]), youtubeVideoId: match[2] });
  }

  return { body: lines.slice(0, markerIndex).join('\n'), videos };
}

export function serializeFreeTextBlockContent(
  body: string,
  videos: FreeTextBlockVideo[],
): string {
  const entries = videos
    .filter((video) => isLikelyYoutubeVideoId(video.youtubeVideoId))
    .map((video) => `${video.label} · @video:${video.youtubeVideoId}`);

  if (entries.length === 0) return body;

  const section = [VIDEO_SECTION_MARKER, ...entries].join('\n');
  return body ? `${body}\n${section}` : section;
}

/** Texto visible del bloque, sin la sección de vídeos. */
export function freeTextBlockBody(content: string) {
  return parseFreeTextBlockContent(content).body;
}
