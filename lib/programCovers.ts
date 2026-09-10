import type { ImageSourcePropType } from 'react-native';

import type { AppColorScheme } from '@/constants/theme';
import {
  getHypeCatalogSlotId,
  isHypeWeeklyChallengePlaceholder,
  isHypeWeeklyChallengeProgram,
} from '@/lib/hypeCatalog';
import { getVenueCatalogCover } from '@/lib/standardVenueCovers';
import type { Program } from '@/lib/types';

const HYPE_COVERS: Record<string, ImageSourcePropType> = {
  'hype-athx': require('@/assets/catalog/hype-athx.jpg'),
  'hype-calistenia': require('@/assets/catalog/hype-calistenia.jpg'),
  'hype-crosstraining': require('@/assets/catalog/hype-crosstraining.jpg'),
  'hype-hype': require('@/assets/catalog/hype-hype.jpg'),
  'hype-hyrox': require('@/assets/catalog/hype-hyrox.jpg'),
  'hype-basico': require('@/assets/catalog/gym-base.jpg'),
};

const HYPE_COVERS_LIGHT: Record<string, ImageSourcePropType> = {
  'hype-athx': require('@/assets/catalog/hype-athx-light.jpg'),
  'hype-calistenia': require('@/assets/catalog/hype-calistenia-light.jpg'),
  'hype-crosstraining': require('@/assets/catalog/hype-crosstraining-light.jpg'),
  'hype-hype': require('@/assets/catalog/hype-hype-light.jpg'),
  'hype-hyrox': require('@/assets/catalog/hype-hyrox-light.jpg'),
  'hype-basico': require('@/assets/catalog/hype-basico-light.jpg'),
};

const WEEKLY_CHALLENGE_COVER = require('@/assets/catalog/hype-weekly-challenge.jpg');
const WEEKLY_CHALLENGE_COVER_LIGHT = require('@/assets/catalog/hype-weekly-challenge-light.jpg');

export function getProgramCover(
  program: Program,
  scheme: AppColorScheme = 'dark',
): ImageSourcePropType | undefined {
  if (program.category === 'hype') {
    if (isHypeWeeklyChallengePlaceholder(program) || isHypeWeeklyChallengeProgram(program)) {
      return scheme === 'light' ? WEEKLY_CHALLENGE_COVER_LIGHT : WEEKLY_CHALLENGE_COVER;
    }

    const hypeSlotId = getHypeCatalogSlotId(program);
    if (!hypeSlotId) return undefined;
    if (scheme === 'light') return HYPE_COVERS_LIGHT[hypeSlotId] ?? HYPE_COVERS[hypeSlotId];
    return HYPE_COVERS[hypeSlotId];
  }

  return getVenueCatalogCover(program);
}
