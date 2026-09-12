import { isHyroxProgram } from '@/lib/hypeBoardSessionDraft';
import { SESSION_BLOCK_SECTIONS } from '@/lib/sessionBlockSections';
import { workoutToSessionDraft } from '@/lib/trainerSessionDraft';
import { isStructuredWorkoutContent } from '@/lib/workoutContentParser';
import { formatBlockItemLineForDisplay, parseWorkoutBlocksFromText } from '@/lib/workoutBlockBuilder';
import type { Workout } from '@/lib/types';

export interface GymTvExerciseLine {
  key: string;
  label: string;
  blockTitle?: string;
  youtubeVideoId?: string;
}

export interface GymTvVideoItem {
  key: string;
  youtubeVideoId: string;
  title: string;
}

export function collectGymTvExerciseLines(workout: Workout): GymTvExerciseLine[] {
  const draft = workoutToSessionDraft(workout);
  const lines: GymTvExerciseLine[] = [];

  for (const { key } of SESSION_BLOCK_SECTIONS) {
    const blocks = parseWorkoutBlocksFromText(draft[key]);
    for (const block of blocks) {
      const blockTitle = [block.title?.trim(), block.timing.trim(), block.subtitle?.trim()]
        .filter(Boolean)
        .join(' · ');

      if (block.type === 'free_text') {
        const text = block.timing.trim();
        if (text) {
          lines.push({
            key: `${block.id}-free`,
            label: text,
            blockTitle: block.title?.trim() || undefined,
          });
        }
        continue;
      }

      if (block.timing.trim()) {
        lines.push({
          key: `${block.id}-timing`,
          label: block.timing.trim(),
          blockTitle: blockTitle || undefined,
        });
      }

      for (const [index, item] of block.items.entries()) {
        const label = formatBlockItemLineForDisplay(item, block.type);
        if (!label.trim()) continue;
        lines.push({
          key: `${block.id}-${index}`,
          label,
          blockTitle: blockTitle || undefined,
          youtubeVideoId: item.youtubeVideoId?.trim() || undefined,
        });
      }
    }
  }

  return lines;
}

export function collectGymTvExerciseVideos(lines: readonly GymTvExerciseLine[]): GymTvVideoItem[] {
  return lines
    .filter((line) => line.youtubeVideoId?.trim())
    .map((line) => ({
      key: line.key,
      youtubeVideoId: line.youtubeVideoId!.trim(),
      title: line.label,
    }));
}

export function firstGymTvExerciseVideo(
  lines: GymTvExerciseLine[],
): { youtubeVideoId: string; title: string } | null {
  const match = lines.find((line) => line.youtubeVideoId);
  if (!match?.youtubeVideoId) return null;
  return { youtubeVideoId: match.youtubeVideoId, title: match.label };
}

export function parseGymTvBodyLines(body: string): GymTvExerciseLine[] {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((label, index) => ({
      key: `body-${index}`,
      label,
    }));
}

function linesFromStructuredContent(content: string): GymTvExerciseLine[] {
  const lines: GymTvExerciseLine[] = [];
  const blocks = parseWorkoutBlocksFromText(content);

  for (const block of blocks) {
    const blockTitle = [block.title?.trim(), block.timing.trim(), block.subtitle?.trim()]
      .filter(Boolean)
      .join(' · ');

    if (block.type === 'free_text') {
      const text = block.timing.trim();
      if (text) {
        for (const [index, label] of text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).entries()) {
          lines.push({
            key: `${block.id}-free-${index}`,
            label,
            blockTitle: block.title?.trim() || undefined,
          });
        }
      }
      continue;
    }

    if (block.timing.trim()) {
      lines.push({
        key: `${block.id}-timing`,
        label: block.timing.trim(),
        blockTitle: blockTitle || undefined,
      });
    }

    for (const [index, item] of block.items.entries()) {
      const label = formatBlockItemLineForDisplay(item, block.type);
      if (!label.trim()) continue;
      lines.push({
        key: `${block.id}-${index}`,
        label,
        blockTitle: blockTitle || undefined,
        youtubeVideoId: item.youtubeVideoId?.trim() || undefined,
      });
    }
  }

  return lines;
}

export function parseGymTvContentLines(body: string, programName?: string): GymTvExerciseLine[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  if (programName && isHyroxProgram(programName)) {
    if (isStructuredWorkoutContent(trimmed)) {
      const freeText = parseWorkoutBlocksFromText(trimmed).find((block) => block.type === 'free_text');
      if (freeText?.timing.trim()) return parseGymTvBodyLines(freeText.timing);
    }
    return parseGymTvBodyLines(trimmed);
  }

  if (isStructuredWorkoutContent(trimmed) || trimmed.includes('•')) {
    return linesFromStructuredContent(trimmed);
  }

  return parseGymTvBodyLines(trimmed);
}
