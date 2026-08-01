import { parseWorkoutContent, isStructuredWorkoutContent } from '@/lib/workoutContentParser';
import type { Exercise } from '@/lib/types';

export interface ChecklistItem {
  key: string;
  label: string;
  section: string;
}

function itemsFromSection(section: string, content: string): ChecklistItem[] {
  if (!content.trim()) return [];

  if (!isStructuredWorkoutContent(content)) {
    return [{ key: `${section}:text`, label: content.trim(), section }];
  }

  const blocks = parseWorkoutContent(content);
  const items: ChecklistItem[] = [];

  blocks.forEach((block, blockIndex) => {
    if (block.text !== undefined) {
      const firstLine = block.text.split('\n').find((line) => line.trim())?.trim();
      items.push({
        key: `${section}:b${blockIndex}:text`,
        label: block.label.trim() || firstLine || '',
        section,
      });
      return;
    }

    block.items.forEach((item, itemIndex) => {
      items.push({
        key: `${section}:b${blockIndex}:i${itemIndex}`,
        label: item,
        section,
      });
    });
  });

  return items;
}

export function buildWorkoutChecklist(workout: {
  warmup: string;
  main: string;
  core?: string;
  cooldown: string;
  exercises: Exercise[];
}): ChecklistItem[] {
  const items: ChecklistItem[] = [
    ...itemsFromSection('warmup', workout.warmup),
    ...itemsFromSection('main', workout.main),
    ...itemsFromSection('core', workout.core ?? ''),
    ...workout.exercises.map((exercise) => ({
      key: `ex:${exercise.id}`,
      label: exercise.name,
      section: 'exercises',
    })),
    ...itemsFromSection('cooldown', workout.cooldown),
  ];

  return items;
}

export function completedCount(completed: Record<string, boolean>, checklist: ChecklistItem[]) {
  return checklist.filter((item) => completed[item.key]).length;
}

export function completedKeys(completed: Record<string, boolean>) {
  return Object.entries(completed)
    .filter(([, value]) => value)
    .map(([key]) => key);
}

export function completedMapFromKeys(keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, true]));
}
