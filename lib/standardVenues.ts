import type { AppIconName } from '@/constants/icons';

export type StandardVenueId = 'home' | 'gym' | 'calisthenics';

export interface StandardVenue {
  id: StandardVenueId;
  label: string;
  description: string;
  icon: AppIconName;
  /** Si aún no hay catálogo publicado en este espacio. */
  available: boolean;
}

export const STANDARD_VENUES: StandardVenue[] = [
  {
    id: 'home',
    label: 'Desde casa',
    description: 'Programaciones para entrenar en casa.',
    icon: 'home',
    available: true,
  },
  {
    id: 'gym',
    label: 'Desde el gym',
    description: 'Programaciones para entrenar en gimnasio.',
    icon: 'strength',
    available: true,
  },
  {
    id: 'calisthenics',
    label: 'Parque de calistenia',
    description: 'Programaciones para entrenar al aire libre.',
    icon: 'mobility',
    available: true,
  },
];

export function getStandardVenue(id?: string): StandardVenue | undefined {
  return STANDARD_VENUES.find((venue) => venue.id === id);
}

export function isStandardVenueId(id?: string): id is StandardVenueId {
  return STANDARD_VENUES.some((venue) => venue.id === id);
}
