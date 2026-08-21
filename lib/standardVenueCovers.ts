import type { ImageSourcePropType } from 'react-native';

import {
  STANDARD_VENUE_PROGRAMS,
  getVenuePlaceholderSlot,
  namesMatchCatalog,
} from '@/lib/standardVenueCatalog';
import type { Program } from '@/lib/types';

const STANDARD_VENUE_COVERS: Record<string, ImageSourcePropType> = {
  'gym-basic': require('@/assets/catalog/gym-base.jpg'),
  'gym-intermediate': require('@/assets/catalog/gym-strength.jpg'),
  'gym-advanced': require('@/assets/catalog/gym-performance.jpg'),
  'gym-metcon': require('@/assets/catalog/gym-metcon.jpg'),
  'calisthenics-pushup': require('@/assets/catalog/calisthenics-pushup.jpg'),
  'calisthenics-pullup': require('@/assets/catalog/calisthenics-pullup.jpg'),
  'calisthenics-muscle-up': require('@/assets/catalog/calisthenics-muscle-up.jpg'),
  'calisthenics-metcon': require('@/assets/catalog/calisthenics-metcon.jpg'),
};

export function getVenueCatalogCover(program: Program): ImageSourcePropType | undefined {
  const placeholder = getVenuePlaceholderSlot(program.id);
  if (placeholder) return STANDARD_VENUE_COVERS[placeholder.slot.id];

  const venue = program.standardVenue ?? 'gym';
  const slot = STANDARD_VENUE_PROGRAMS[venue].find((item) =>
    namesMatchCatalog(program.name, item.matchNames),
  );
  return slot ? STANDARD_VENUE_COVERS[slot.id] : undefined;
}
