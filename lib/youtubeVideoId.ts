export function isLikelyYoutubeVideoId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(value.trim());
}

/** Extrae el id de un enlace o texto pegado de YouTube. */
export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1] && isLikelyYoutubeVideoId(match[1])) return match[1];
  }

  if (isLikelyYoutubeVideoId(trimmed)) return trimmed;
  return null;
}
