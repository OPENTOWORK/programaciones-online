import type { AppIconName } from '@/constants/icons';
import { isAdminRole } from '@/lib/athleteService';
import { namesMatchCatalog } from '@/lib/standardVenueCatalog';
import type { Program, UserRole } from '@/lib/types';

export const HYPE_PROGRAM_PRICES = {
  challenge: '5,99 € / mes',
  basic: '9,99 € / mes',
  standard: '15,99 € / mes',
} as const;

export type HypeProgramPriceTier = keyof typeof HYPE_PROGRAM_PRICES;

export interface HypeProgramSlot {
  id: string;
  name: string;
  description: string;
  /** Público al que va dirigida la programación. */
  designedFor: string;
  /** Monitor que lleva la programación. */
  monitor?: string;
  equipment: string[];
  icon: AppIconName;
  matchNames: string[];
  nameTag?: string;
  priceTier: HypeProgramPriceTier;
}

export const HYPE_WEEKLY_CHALLENGE: HypeProgramSlot = {
  id: 'hype-weekly-challenge',
  name: 'Reto',
  description: 'Reto semanal compartido para toda la comunidad Training · Performance.',
  designedFor: 'Toda la comunidad, adaptable a distintos niveles',
  equipment: [],
  icon: 'catalogChallenge',
  matchNames: ['reto', 'desafio de la semana', 'desafío de la semana', 'desafio semanal', 'weekly challenge'],
  priceTier: 'challenge',
};

export const HYPE_PROGRAMS: HypeProgramSlot[] = [
  {
    id: 'hype-calistenia',
    name: 'Calistenia',
    nameTag: 'Skills',
    description: 'Fuerza relativa y control en barra, fondos y progresiones de peso corporal.',
    designedFor: 'Quien domina lo básico y quiere progresar en barra y peso corporal',
    monitor: 'Charly',
    equipment: ['Barra de dominadas', 'Paralelas', 'Anillas', 'Banda elástica'],
    icon: 'catalogCalistenia',
    matchNames: ['calistenia', 'calisthenics'],
    priceTier: 'standard',
  },
  {
    id: 'hype-basico',
    name: 'Básico',
    description: 'Programación de inicio para consolidar técnica y una base sólida de fuerza.',
    designedFor: 'Principiantes o quien retoma el entreno tras tiempo parado',
    monitor: 'Charly',
    equipment: ['Mancuernas', 'Barra y discos', 'Banco', 'Rack'],
    icon: 'catalogBasico',
    matchNames: ['basico', 'básico', 'styrkur'],
    priceTier: 'basic',
  },
  {
    id: 'hype-athx',
    name: 'ATHX',
    nameTag: 'Hybrid',
    description: 'Condición híbrida: potencia, agilidad y trabajo metabólico en el mismo bloque.',
    designedFor: 'Atletas con base que buscan mezclar fuerza, potencia y condición',
    monitor: 'Peter',
    equipment: ['Turf', 'Kettlebells', 'Balón medicinal', 'Conos'],
    icon: 'catalogAthx',
    matchNames: ['athx'],
    priceTier: 'standard',
  },
  {
    id: 'hype-crosstraining',
    name: 'Crosstraining',
    nameTag: 'Engine',
    description: 'Entrenamiento funcional con barra, cajón y máquina para construir motor.',
    designedFor: 'Personas con experiencia en fuerza que quieren mejorar el motor',
    monitor: 'Nelly',
    equipment: ['Barra y discos', 'Cajón pliométrico', 'Remo', 'Kettlebells'],
    icon: 'catalogCrosstraining',
    matchNames: ['crosstraining', 'cross training'],
    priceTier: 'standard',
  },
  {
    id: 'hype-hype',
    name: 'Hype',
    nameTag: 'Intense',
    description: 'Sesiones de alta intensidad para subir el ritmo y la capacidad de trabajo.',
    designedFor: 'Atletas avanzados que toleran alta intensidad y mucho volumen',
    monitor: 'Peter',
    equipment: ['Cuerda de batalla', 'Slam ball', 'Mancuernas', 'Cajón'],
    icon: 'catalogHype',
    matchNames: ['hype'],
    priceTier: 'standard',
  },
  {
    id: 'hype-hyrox',
    name: 'Hyrox',
    nameTag: 'Race',
    description: 'Preparación de carrera: estaciones, trineo y máquina con ritmo de competición.',
    designedFor: 'Quien prepara Hyrox o carreras de estaciones y running',
    monitor: 'Nelly',
    equipment: ['SkiErg o remo', 'Trineo', 'Saco', 'Turf'],
    icon: 'catalogHyrox',
    matchNames: ['hyrox'],
    priceTier: 'standard',
  },
];

function catalogPriceValue(price?: string) {
  if (!price) return Number.POSITIVE_INFINITY;
  const match = price.replace(/\./g, '').replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export function hypeCatalogSortIndex(program: Pick<Program, 'category' | 'name'>): number {
  if (program.category !== 'hype') return Number.POSITIVE_INFINITY;
  const index = HYPE_PROGRAMS.findIndex((slot) => namesMatchCatalog(program.name, slot.matchNames));
  return index < 0 ? Number.POSITIVE_INFINITY : index;
}

export function sortHypePrograms<T extends Pick<Program, 'category' | 'name' | 'catalogPrice'>>(
  programs: T[],
): T[] {
  return [...programs].sort((left, right) => {
    const byPrice = catalogPriceValue(left.catalogPrice) - catalogPriceValue(right.catalogPrice);
    if (byPrice !== 0) return byPrice;

    const bySlot = hypeCatalogSortIndex(left) - hypeCatalogSortIndex(right);
    if (bySlot !== 0) return bySlot;

    return left.name.localeCompare(right.name, 'es');
  });
}

function findHypeSlot(programName: string) {
  return HYPE_PROGRAMS.find((slot) => namesMatchCatalog(programName, slot.matchNames));
}

export function enrichProgramFromHypeCatalog(program: Program): Program {
  if (program.category !== 'hype') return program;

  if (isHypeWeeklyChallengeProgram(program)) {
    return applyWeeklyChallengeSlot(program);
  }

  const slot = findHypeSlot(program.name);
  if (!slot) return program;

  return {
    ...program,
    name: slot.name,
    description: slot.description,
    equipment: slot.equipment,
    icon: slot.icon,
    catalogNameTag: slot.nameTag,
    catalogPrice: HYPE_PROGRAM_PRICES[slot.priceTier],
    catalogDesignedFor: slot.designedFor,
    catalogMonitor: slot.monitor,
  };
}

export function getHypeCatalogSlotId(program: Pick<Program, 'category' | 'name'>): string | undefined {
  if (program.category !== 'hype') return undefined;
  return findHypeSlot(program.name)?.id;
}

export function canEnterHypeCatalogProgram(role?: UserRole) {
  return isAdminRole(role);
}

export const HYPE_CATALOG_PURCHASE_PENDING_TITLE = 'Compra próximamente';
export const HYPE_CATALOG_PURCHASE_PENDING_MESSAGE =
  'Esta programación se podrá comprar cuando conectemos la pasarela de pagos.';

export function isHypeWeeklyChallengeProgram(program: Pick<Program, 'category' | 'name'>): boolean {
  if (program.category !== 'hype') return false;
  return namesMatchCatalog(program.name, HYPE_WEEKLY_CHALLENGE.matchNames);
}

export function isHypeWeeklyChallengePlaceholder(program: Pick<Program, 'id'>): boolean {
  return program.id === 'hype-placeholder-weekly-challenge';
}

/** Catálogo Hype de pago. El desafío semanal lo publica el entrenador, no se compra. */
export function isPaidHypeCatalogProgram(program: Pick<Program, 'category' | 'name' | 'id'>) {
  if (program.category !== 'hype') return false;
  return !isHypeWeeklyChallengePlaceholder(program) && !isHypeWeeklyChallengeProgram(program);
}

function applyWeeklyChallengeSlot(program: Program): Program {
  return {
    ...program,
    name: HYPE_WEEKLY_CHALLENGE.name,
    description: HYPE_WEEKLY_CHALLENGE.description,
    equipment: HYPE_WEEKLY_CHALLENGE.equipment,
    icon: HYPE_WEEKLY_CHALLENGE.icon,
    catalogDesignedFor: HYPE_WEEKLY_CHALLENGE.designedFor,
    catalogMonitor: HYPE_WEEKLY_CHALLENGE.monitor,
    catalogPrice: HYPE_PROGRAM_PRICES[HYPE_WEEKLY_CHALLENGE.priceTier],
  };
}

function createWeeklyChallengePlaceholder(planId: string): Program {
  return {
    id: 'hype-placeholder-weekly-challenge',
    name: HYPE_WEEKLY_CHALLENGE.name,
    planId,
    category: 'hype',
    level: 'intermedio',
    duration: 'Por definir',
    goal: 'rendimiento',
    sessionsPerWeek: 1,
    status: 'bloqueada',
    icon: HYPE_WEEKLY_CHALLENGE.icon,
    description: HYPE_WEEKLY_CHALLENGE.description,
    equipment: HYPE_WEEKLY_CHALLENGE.equipment,
    catalogDesignedFor: HYPE_WEEKLY_CHALLENGE.designedFor,
    catalogMonitor: HYPE_WEEKLY_CHALLENGE.monitor,
    catalogPrice: HYPE_PROGRAM_PRICES[HYPE_WEEKLY_CHALLENGE.priceTier],
    trainingDays: [],
    weeks: [],
  };
}

export function partitionHypePlanPrograms(
  programs: Program[],
  planId: string,
): { catalogPrograms: Program[]; weeklyChallenge: Program } {
  const hypePrograms = sortHypePrograms(programs.filter((program) => program.category === 'hype'));
  const weeklyMatch = hypePrograms.find(isHypeWeeklyChallengeProgram);
  const catalogPrograms = hypePrograms.filter((program) => !isHypeWeeklyChallengeProgram(program));

  return {
    catalogPrograms,
    weeklyChallenge: weeklyMatch ? applyWeeklyChallengeSlot(weeklyMatch) : createWeeklyChallengePlaceholder(planId),
  };
}

export function resolvePublishedWeeklyChallenge(
  programs: Program[],
  planId: string,
): Program | undefined {
  const { weeklyChallenge } = partitionHypePlanPrograms(programs, planId);
  if (isHypeWeeklyChallengePlaceholder(weeklyChallenge)) return undefined;
  return weeklyChallenge;
}
