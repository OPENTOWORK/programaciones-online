import type { AppIconName } from '@/constants/icons';
import { namesMatchCatalog } from '@/lib/standardVenueCatalog';
import type { Program } from '@/lib/types';

export const HYPE_PROGRAM_PRICES = {
  race: '29,99 € / mes',
  hybrid: '23,99 € / mes',
  skills: '19,99 € / mes',
} as const;

export type HypeProgramPriceTier = keyof typeof HYPE_PROGRAM_PRICES;

export interface HypeProgramSlot {
  id: string;
  name: string;
  description: string;
  equipment: string[];
  icon: AppIconName;
  matchNames: string[];
  nameTag?: string;
  priceTier: HypeProgramPriceTier;
}

export const HYPE_PROGRAMS: HypeProgramSlot[] = [
  {
    id: 'hype-calistenia',
    name: 'Calistenia',
    nameTag: 'Skills',
    description: 'Fuerza relativa y control en barra, fondos y progresiones de peso corporal.',
    equipment: ['Barra de dominadas', 'Paralelas', 'Anillas', 'Banda elástica'],
    icon: 'strength',
    matchNames: ['calistenia', 'calisthenics'],
    priceTier: 'skills',
  },
  {
    id: 'hype-styrkur',
    name: 'Styrkur',
    nameTag: 'Strength',
    description: 'Fuerza pura en plataforma: cargas pesadas, técnica y progresión de hierro.',
    equipment: ['Barra y discos', 'Plataforma', 'Rack', 'Cinturón'],
    icon: 'strength',
    matchNames: ['styrkur'],
    priceTier: 'skills',
  },
  {
    id: 'hype-athx',
    name: 'ATHX',
    nameTag: 'Hybrid',
    description: 'Condición híbrida: potencia, agilidad y trabajo metabólico en el mismo bloque.',
    equipment: ['Turf', 'Kettlebells', 'Balón medicinal', 'Conos'],
    icon: 'intense',
    matchNames: ['athx'],
    priceTier: 'hybrid',
  },
  {
    id: 'hype-crosstraining',
    name: 'Crosstraining',
    nameTag: 'Engine',
    description: 'Entrenamiento funcional con barra, cajón y máquina para construir motor.',
    equipment: ['Barra y discos', 'Cajón pliométrico', 'Remo', 'Kettlebells'],
    icon: 'programs',
    matchNames: ['crosstraining', 'cross training'],
    priceTier: 'hybrid',
  },
  {
    id: 'hype-hype',
    name: 'Hype',
    nameTag: 'Intense',
    description: 'Sesiones de alta intensidad para subir el ritmo y la capacidad de trabajo.',
    equipment: ['Cuerda de batalla', 'Slam ball', 'Mancuernas', 'Cajón'],
    icon: 'intense',
    matchNames: ['hype'],
    priceTier: 'race',
  },
  {
    id: 'hype-hyrox',
    name: 'Hyrox',
    nameTag: 'Race',
    description: 'Preparación de carrera: estaciones, trineo y máquina con ritmo de competición.',
    equipment: ['SkiErg o remo', 'Trineo', 'Saco', 'Turf'],
    icon: 'power',
    matchNames: ['hyrox'],
    priceTier: 'race',
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
  };
}

export function getHypeCatalogSlotId(program: Pick<Program, 'category' | 'name'>): string | undefined {
  if (program.category !== 'hype') return undefined;
  return findHypeSlot(program.name)?.id;
}
