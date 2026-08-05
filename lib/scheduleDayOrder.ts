import { parsePersonalizedPlanContent, serializePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import type { AthletePlan } from '@/lib/types';

/** Posición y alto de una tarjeta dentro de la columna de su día. */
export interface ChipLayout {
  y: number;
  height: number;
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

  let index = 0;
  for (const key of keys) {
    if (key === movedKey) continue;
    const layout = layouts.get(key);
    // Solo se adelanta a una tarjeta si la ha rebasado por la mitad.
    if (layout && movedCenterY > layout.y + layout.height / 2) index += 1;
  }

  return index;
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
  const rest = keys.filter((key) => key !== movedKey);
  const before = index > 0 ? layouts.get(rest[index - 1]) : undefined;
  const after = index < rest.length ? layouts.get(rest[index]) : undefined;

  // Entre dos tarjetas la línea va centrada en la separación; en los extremos, pegada a la única.
  if (before && after) return (before.y + before.height + after.y) / 2;
  if (before) return before.y + before.height;
  if (after) return after.y;
  return null;
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
