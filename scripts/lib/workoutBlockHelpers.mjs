/** Helpers compartidos para serializar bloques que el parser de la app entiende. */

export const BLOCK = {
  activation: 'Activación',
  strength: 'Fuerza',
  technique: 'Técnica/skills',
  mobility: 'Movilidad',
  emom: 'EMOM',
  amrap: 'AMRAP',
  forTime: 'For Time',
  roundsForTime: 'Rounds For Time',
  tabata: 'Tabata',
};

function headerPart(value) {
  return String(value).replace(/\s*·\s*/g, ' - ').replace(/\s+/g, ' ').trim();
}

export function block(label, { title, timing, rounds, note, items = [] } = {}) {
  const header = [label, title, timing, rounds].filter(Boolean).map(headerPart).join(' · ');
  const lines = [header];
  if (note) lines.push(headerPart(note));
  for (const item of items) lines.push(`• ${item}`);
  return lines.join('\n');
}

export function qtyItem(name, quantity, load) {
  return `${name}: ${quantity}${load ? ` · ${load}` : ''}`;
}

export function setsItem(name, sets, reps, load) {
  return `${name}: ${sets} × ${reps}${load ? ` · ${load}` : ''}`;
}
