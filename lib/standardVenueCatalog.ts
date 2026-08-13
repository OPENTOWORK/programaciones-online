import type { AppIconName } from '@/constants/icons';
import { normalizeExerciseName } from '@/lib/exerciseName';
import type { Program } from '@/lib/types';
import type { StandardVenueId } from '@/lib/standardVenues';

export const STANDARD_VENUE_MARKER = /@venue:(home|gym|calisthenics)\b/i;

export interface StandardVenueProgramSlot {
  id: string;
  name: string;
  description: string;
  icon: AppIconName;
  matchNames: string[];
}

export const STANDARD_VENUE_PROGRAMS: Record<StandardVenueId, StandardVenueProgramSlot[]> = {
  gym: [],
  home: [
    {
      id: 'home-core',
      name: 'Core',
      description: 'Trabajo de core y estabilidad para entrenar en casa.',
      icon: 'core',
      matchNames: ['core'],
    },
    {
      id: 'home-mobility',
      name: 'Movilidad y estabilidad',
      description: 'Movilidad articular y control corporal sin material de gimnasio.',
      icon: 'mobility',
      matchNames: ['movilidad y estabilidad', 'movilidad & estabilidad'],
    },
    {
      id: 'home-strength',
      name: 'Fuerza fundamental',
      description: 'Base de fuerza con el material que tengas en casa.',
      icon: 'strength',
      matchNames: ['fuerza fundamental'],
    },
    {
      id: 'home-time',
      name: '¿Cuánto tiempo tienes?',
      description: 'Sesiones sueltas por duración para adaptar el entreno al día.',
      icon: 'time',
      matchNames: ['cuanto tiempo tienes', 'cuánto tiempo tienes'],
    },
  ],
  calisthenics: [
    {
      id: 'calisthenics-statics',
      name: 'Estáticos',
      description: 'Progresiones de figuras estáticas en barra y suelo.',
      icon: 'strength',
      matchNames: ['estaticos', 'estáticos'],
    },
    {
      id: 'calisthenics-pullup',
      name: 'Consigue tu primera dominada',
      description: 'Plan progresivo para lograr tu primera dominada.',
      icon: 'strength',
      matchNames: ['consigue tu primera dominada', 'primera dominada'],
    },
    {
      id: 'calisthenics-muscle-up',
      name: 'Consigue tu primer muscle up',
      description: 'Técnica y fuerza para tu primer muscle up.',
      icon: 'power',
      matchNames: ['consigue tu primer muscle up', 'primer muscle up', 'muscle up'],
    },
    {
      id: 'calisthenics-abs',
      name: 'Abdomen de hierro',
      description: 'Core y control para un abdomen fuerte en calistenia.',
      icon: 'core',
      matchNames: ['abdomen de hierro'],
    },
    {
      id: 'calisthenics-rings',
      name: 'Anillas',
      description: 'Trabajo específico en anillas: fuerza, control y estabilidad.',
      icon: 'programs',
      matchNames: ['anillas'],
    },
  ],
};

function normalizeCatalogName(name: string) {
  return normalizeExerciseName(name);
}

export function namesMatchCatalog(programName: string, matchNames: readonly string[]) {
  const normalized = normalizeCatalogName(programName);
  return matchNames.some((candidate) => normalizeCatalogName(candidate) === normalized);
}

export function parseStandardVenueFromDescription(description?: string | null): {
  venue?: StandardVenueId;
  description: string;
} {
  const raw = description?.trim() ?? '';
  const match = raw.match(STANDARD_VENUE_MARKER);
  if (!match) return { description: raw };

  const venue = match[1].toLowerCase() as StandardVenueId;
  const cleaned = raw.replace(STANDARD_VENUE_MARKER, '').replace(/\s{2,}/g, ' ').trim();
  return { venue, description: cleaned };
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
  const match = placeholderId.match(/^venue-placeholder-(home|gym|calisthenics)-(.+)$/);
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
    equipment: [],
    trainingDays: [],
    weeks: [],
    standardVenue: venue,
  };
}

export function resolveStandardVenuePrograms(
  venue: StandardVenueId,
  programs: Program[],
  planId?: string,
): Program[] {
  const standardPrograms = programs.filter((program) => program.category === 'standard');

  if (venue === 'gym') {
    return standardPrograms
      .filter((program) => !program.standardVenue || program.standardVenue === 'gym')
      .sort(compareVenuePrograms);
  }

  const slots = STANDARD_VENUE_PROGRAMS[venue];
  return slots.map((slot) => {
    const match = standardPrograms.find(
      (program) =>
        program.standardVenue === venue && namesMatchCatalog(program.name, slot.matchNames),
    );
    return match ?? createPlaceholderProgram(slot, venue, planId);
  });
}

function compareVenuePrograms(left: Program, right: Program) {
  const leftLoose = isLooseSessionCatalog(left.name);
  const rightLoose = isLooseSessionCatalog(right.name);
  if (leftLoose !== rightLoose) return leftLoose ? 1 : -1;
  return left.name.localeCompare(right.name, 'es', { sensitivity: 'base' });
}

function isLooseSessionCatalog(name: string) {
  const normalized = normalizeCatalogName(name);
  return normalized.includes('cuanto tiempo tienes');
}
