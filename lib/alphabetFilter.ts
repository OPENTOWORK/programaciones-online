export const ALPHABET_FILTER_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function getExerciseNameFirstLetter(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '#';

  const normalized = trimmed
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
  const first = normalized.charAt(0).toUpperCase();

  if (/[A-Z]/.test(first)) return first;
  return '#';
}

export function buildAvailableFirstLetters(names: string[]): Set<string> {
  const letters = new Set<string>();
  for (const name of names) {
    letters.add(getExerciseNameFirstLetter(name));
  }
  return letters;
}

export function filterByFirstLetter<T>(
  items: T[],
  letter: string | null,
  getName: (item: T) => string,
): T[] {
  if (!letter) return items;
  return items.filter((item) => getExerciseNameFirstLetter(getName(item)) === letter);
}
