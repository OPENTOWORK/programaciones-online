/** Posición y alto de un elemento de una lista arrastrable, en las coordenadas de su contenedor. */
export interface DragItemBounds {
  y: number;
  height: number;
}

/**
 * Hueco en el que caería el elemento arrastrado. `others` son los que se quedan quietos, ordenados
 * de arriba abajo, y `pointerY` va en sus mismas coordenadas.
 */
export function dropIndexForPosition(others: ReadonlyArray<DragItemBounds | undefined>, pointerY: number) {
  let index = 0;
  for (const item of others) {
    // Solo se adelanta a un elemento si lo ha rebasado por la mitad.
    if (item && pointerY > item.y + item.height / 2) index += 1;
  }
  return index;
}

/** Altura a la que dibujar la línea que marca ese hueco, o null si no hay nada con lo que medirla. */
export function dropLineOffsetForIndex(
  others: ReadonlyArray<DragItemBounds | undefined>,
  index: number,
): number | null {
  const before = index > 0 ? others[index - 1] : undefined;
  const after = index < others.length ? others[index] : undefined;

  // Entre dos elementos la línea va centrada en la separación; en los extremos, pegada al único.
  if (before && after) return (before.y + before.height + after.y) / 2;
  if (before) return before.y + before.height;
  if (after) return after.y;
  return null;
}
