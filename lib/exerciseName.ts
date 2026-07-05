export function normalizeExerciseName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function parseExerciseLabelFromBlockItem(item: string): string {
  const colonIndex = item.indexOf(':');
  if (colonIndex > 0) {
    return item.slice(0, colonIndex).trim();
  }

  return item.trim();
}
