import type { AppIconName } from '@/constants/icons';
import { normalizeExerciseName } from '@/lib/exerciseName';
import type { Program } from '@/lib/types';
import type { StandardVenueId } from '@/lib/standardVenues';

export const STANDARD_VENUE_MARKER = /@venue:(home|gym|calisthenics)\b/i;

export type StandardVenuePriceTier = 'basic' | 'intermediate' | 'advanced';

export const STANDARD_VENUE_PRICES: Record<StandardVenuePriceTier, string> = {
  basic: '13,99 € / mes',
  intermediate: '15,99 € / mes',
  advanced: '19,99 € / mes',
};

export interface StandardVenueProgramSlot {
  id: string;
  name: string;
  description: string;
  equipment: string[];
  icon: AppIconName;
  matchNames: string[];
  priceTier: StandardVenuePriceTier;
  /** Etiqueta corta entre paréntesis, p. ej. push / pull / skills. */
  nameTag?: string;
}

export const STANDARD_VENUE_PROGRAMS: Record<StandardVenueId, StandardVenueProgramSlot[]> = {
  gym: [
    {
      id: 'gym-basic',
      name: 'Base',
      description: 'Programación de inicio para consolidar técnica y una base sólida de fuerza.',
      equipment: ['Mancuernas', 'Barra y discos', 'Banco', 'Rack', 'Máquinas básicas'],
      icon: 'strength',
      matchNames: ['base', 'basico', 'básico'],
      priceTier: 'basic',
    },
    {
      id: 'gym-intermediate',
      name: 'Strength',
      description: 'Progresión de fuerza con mayor volumen, intensidad y trabajo accesorio.',
      equipment: ['Barra y discos', 'Rack', 'Banco ajustable', 'Mancuernas', 'Polea', 'Kettlebells'],
      icon: 'hypertrophy',
      matchNames: ['strength', 'intermedio'],
      priceTier: 'intermediate',
    },
    {
      id: 'gym-advanced',
      name: 'Performance',
      description: 'Programación exigente para atletas con experiencia y alta demanda técnica.',
      equipment: ['Barra y discos', 'Rack', 'Banco', 'Mancuernas', 'Polea', 'Trineo o prowler'],
      icon: 'power',
      matchNames: ['performance', 'avanzado'],
      priceTier: 'advanced',
    },
    {
      id: 'gym-metcon',
      name: 'Metcon',
      description: 'Bloques metabólicos independientes para entrenar a tu ritmo.',
      equipment: ['Barra y discos', 'Mancuernas', 'Kettlebells', 'Cajón pliométrico', 'Cuerda'],
      icon: 'intense',
      matchNames: ['metcon'],
      priceTier: 'advanced',
    },
  ],
  calisthenics: [
    {
      id: 'calisthenics-pushup',
      name: 'Primera flexión',
      description: 'Progresión técnica del patrón de empuje hasta completar la primera flexión.',
      equipment: ['Parque o suelo', 'Superficie elevada', 'Banda elástica'],
      icon: 'strength',
      matchNames: [
        'primera flexión',
        'primera flexion',
        'consigue tu primera flexión',
        'consigue tu primera flexion',
      ],
      priceTier: 'basic',
      nameTag: 'Push',
    },
    {
      id: 'calisthenics-pullup',
      name: 'Primera dominada',
      description: 'Desarrollo de fuerza de tracción hasta completar la primera dominada.',
      equipment: ['Barra de dominadas', 'Banda elástica', 'Barra baja o anillas'],
      icon: 'strength',
      matchNames: ['primera dominada', 'consigue tu primera dominada'],
      priceTier: 'intermediate',
      nameTag: 'Pull',
    },
    {
      id: 'calisthenics-muscle-up',
      name: 'Primer muscle-up',
      description: 'Trabajo de fuerza y técnica para completar el primer muscle-up con control.',
      equipment: ['Barra de dominadas', 'Anillas o barras paralelas', 'Banda elástica'],
      icon: 'power',
      matchNames: [
        'primer muscle-up',
        'primer muscle up',
        'consigue tu primer muscle up',
        'consigue tu primer muscle-up',
        'muscle up',
        'muscle-up',
      ],
      priceTier: 'advanced',
      nameTag: 'Skills',
    },
    {
      id: 'calisthenics-metcon',
      name: 'Metcon',
      description: 'Bloques metabólicos independientes para entrenar a tu ritmo.',
      equipment: ['Barra de dominadas', 'Parque de calistenia'],
      icon: 'intense',
      matchNames: ['metcon'],
      priceTier: 'advanced',
    },
  ],
};

function normalizeCatalogName(name: string) {
  return normalizeExerciseName(name);
}

function stripCatalogTag(name: string) {
  return name.replace(/\s*\((push|pull|skills)\)\s*$/i, '').trim();
}

export function namesMatchCatalog(programName: string, matchNames: readonly string[]) {
  const normalized = normalizeCatalogName(stripCatalogTag(programName));
  return matchNames.some((candidate) => normalizeCatalogName(stripCatalogTag(candidate)) === normalized);
}

export function parseStandardVenueFromDescription(description?: string | null): {
  venue?: StandardVenueId;
  description: string;
} {
  const raw = description?.trim() ?? '';
  const match = raw.match(STANDARD_VENUE_MARKER);
  if (!match) return { description: raw };

  const rawVenue = match[1].toLowerCase();
  const cleaned = raw.replace(STANDARD_VENUE_MARKER, '').replace(/\s{2,}/g, ' ').trim();
  if (rawVenue === 'gym' || rawVenue === 'calisthenics') {
    return { venue: rawVenue, description: cleaned };
  }
  return { description: cleaned };
}

export function formatStandardVenueDescription(description: string, venue: StandardVenueId) {
  const cleaned = description.trim();
  if (!cleaned) return `@venue:${venue}`;
  return `${cleaned} @venue:${venue}`;
}

export function isVenuePlaceholderProgram(program: Pick<Program, 'id'>) {
  return program.id.startsWith('venue-placeholder-');
}

export function getVenuePlaceholderSlot(placeholderId: string) {
  const match = placeholderId.match(/^venue-placeholder-(gym|calisthenics)-(.+)$/);
  if (!match) return null;

  const venue = match[1] as StandardVenueId;
  const slotId = match[2];
  const slot = STANDARD_VENUE_PROGRAMS[venue].find((item) => item.id === slotId);
  if (!slot) return null;

  return { venue, slot };
}

function createPlaceholderProgram(
  slot: StandardVenueProgramSlot,
  venue: StandardVenueId,
  planId?: string,
): Program {
  return {
    id: `venue-placeholder-${venue}-${slot.id}`,
    name: slot.name,
    planId,
    category: 'standard',
    level: 'principiante',
    duration: 'Por definir',
    goal: undefined,
    sessionsPerWeek: 0,
    status: 'bloqueada',
    icon: slot.icon,
    description: slot.description,
    equipment: slot.equipment,
    catalogPrice: STANDARD_VENUE_PRICES[slot.priceTier],
    catalogNameTag: slot.nameTag,
    trainingDays: [],
    weeks: [],
    standardVenue: venue,
  };
}

function applyVenueSlotCatalog(
  program: Program,
  slot: StandardVenueProgramSlot,
  venue: StandardVenueId,
): Program {
  return {
    ...program,
    name: slot.name,
    description: slot.description,
    equipment: slot.equipment,
    icon: slot.icon,
    catalogPrice: STANDARD_VENUE_PRICES[slot.priceTier],
    catalogNameTag: slot.nameTag,
    standardVenue: venue,
  };
}

export function enrichProgramFromVenueCatalog(program: Program): Program {
  if (program.category !== 'standard') return program;

  const venue = program.standardVenue ?? 'gym';
  const slot = STANDARD_VENUE_PROGRAMS[venue].find((item) =>
    namesMatchCatalog(program.name, item.matchNames),
  );
  if (!slot) return program;

  return applyVenueSlotCatalog(program, slot, venue);
}

export function resolveStandardVenuePrograms(
  venue: StandardVenueId,
  programs: Program[],
  planId?: string,
): Program[] {
  const standardPrograms = programs.filter((program) => program.category === 'standard');
  const slots = STANDARD_VENUE_PROGRAMS[venue];

  return slots.map((slot) => {
    const matches = standardPrograms.filter((program) => {
      const sameVenue =
        program.standardVenue === venue ||
        (venue === 'gym' && !program.standardVenue);
      return sameVenue && namesMatchCatalog(program.name, slot.matchNames);
    });
    const match = pickPreferredVenueProgram(matches);
    return match
      ? applyVenueSlotCatalog(match, slot, venue)
      : createPlaceholderProgram(slot, venue, planId);
  });
}

/** Programaciones de metcon: sesiones sueltas en cuadrícula, sin calendario. */
export function isMetconCatalogProgram(program: Pick<Program, 'name'>) {
  return normalizeCatalogName(program.name) === 'metcon';
}

/** Con duplicados del mismo nombre, prioriza la que ya tiene sesiones (si el contador viene del fetch). */
function pickPreferredVenueProgram(matches: Program[]) {
  if (matches.length <= 1) return matches[0];

  return [...matches].sort((left, right) => {
    const leftSessions = left.catalogSessionCount ?? -1;
    const rightSessions = right.catalogSessionCount ?? -1;
    if (leftSessions !== rightSessions) return rightSessions - leftSessions;
    return left.id.localeCompare(right.id);
  })[0];
}

function compareVenuePrograms(left: Program, right: Program) {
  const leftLoose = isLooseSessionCatalog(left.name);
  const rightLoose = isLooseSessionCatalog(right.name);
  if (leftLoose !== rightLoose) return leftLoose ? 1 : -1;
  return left.name.localeCompare(right.name, 'es', { sensitivity: 'base' });
}

function isLooseSessionCatalog(name: string) {
  const normalized = normalizeCatalogName(name);
  return normalized.includes('cuanto tiempo tienes') || normalized === 'metcon';
}
