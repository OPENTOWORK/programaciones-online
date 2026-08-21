import type { ImageSourcePropType } from 'react-native';

import { getHypeCatalogSlotId } from '@/lib/hypeCatalog';
import { getVenueCatalogCover } from '@/lib/standardVenueCovers';
import type { Program } from '@/lib/types';

const HYPE_COVERS: Record<string, ImageSourcePropType> = {
  'hype-athx': require('@/assets/catalog/hype-athx.jpg'),
  'hype-calistenia': require('@/assets/catalog/hype-calistenia.jpg'),
  'hype-crosstraining': require('@/assets/catalog/hype-crosstraining.jpg'),
  'hype-hype': require('@/assets/catalog/hype-hype.jpg'),
  'hype-hyrox': require('@/assets/catalog/hype-hyrox.jpg'),
  'hype-styrkur': require('@/assets/catalog/hype-styrkur.jpg'),
};

export function getProgramCover(program: Program): ImageSourcePropType | undefined {
  const venueCover = getVenueCatalogCover(program);
  if (venueCover) return venueCover;

  const hypeSlotId = getHypeCatalogSlotId(program);
  return hypeSlotId ? HYPE_COVERS[hypeSlotId] : undefined;
}
