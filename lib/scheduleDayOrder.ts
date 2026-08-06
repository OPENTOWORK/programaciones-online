import {
  dropIndexForPosition,
  dropLineOffsetForIndex,
  type DragItemBounds,
} from '@/lib/dragDropList';
import { parsePersonalizedPlanContent, serializePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import type { AthletePlan } from '@/lib/types';

/** Posición y alto de una tarjeta dentro de la columna de su día. */
export type ChipLayout = DragItemBounds;

function otherChips(
  keys: readonly string[],
  movedKey: string,
  layouts: ReadonlyMap<string, ChipLayout>,
) {
  return keys.filter((key) => key !== movedKey).map((key) => layouts.get(key));
}

/**
 * Hueco en el que caería la sesión arrastrada, contado sobre el día sin ella. Tanto `movedCenterY`
 * como los `layouts` van medidos desde el borde superior de la columna.
 */
export function dropIndexForDay(
  keys: readonly string[],
  movedKey: string,
  movedCenterY: number,
  layouts: ReadonlyMap<string, ChipLayout>,
): number | null {
  if (!keys.includes(movedKey)) return null;
  return dropIndexForPosition(otherChips(keys, movedKey, layouts), movedCenterY);
}

/** Reordena el día colocando la sesión en el hueco indicado. Devuelve null si el orden no cambia. */
export function applyDropIndex(
  keys: readonly string[],
  movedKey: string,
  index: number,
): string[] | null {
  if (!keys.includes(movedKey)) return null;

  const next = keys.filter((key) => key !== movedKey);
  next.splice(index, 0, movedKey);
  if (next.every((key, position) => key === keys[position])) return null;
  return next;
}

/** Altura de la línea que marca el hueco de destino, en las coordenadas de la columna. */
export function dropLineOffset(
  keys: readonly string[],
  movedKey: string,
  index: number,
  layouts: ReadonlyMap<string, ChipLayout>,
): number | null {
  return dropLineOffsetForIndex(otherChips(keys, movedKey, layouts), index);
}

export interface DayOrderUpdate {
  id: string;
  athleteId: string;
  title: string;
  content: string;
}

/** Numera de arriba abajo las sesiones del día y deja fuera las que ya tenían su posición. */
export function buildDayOrderUpdates(
  orderedIds: readonly string[],
  sessions: readonly AthletePlan[],
): DayOrderUpdate[] {
  const updates: DayOrderUpdate[] = [];

  orderedIds.forEach((id, index) => {
    const session = sessions.find((entry) => entry.id === id);
    if (!session) return;

    const sessionNumber = session.sessionNumber ?? 1;
    const draft = parsePersonalizedPlanContent(session.content, sessionNumber - 1);
    if (draft.dayOrder === index) return;

    updates.push({
      id: session.id,
      athleteId: session.athleteId,
      title: session.title,
      content: serializePersonalizedPlanContent({ ...draft, dayOrder: index }, sessionNumber),
    });
  });

  return updates;
}
