import type { ImageSourcePropType } from 'react-native';

import type { AppThemeId } from '@/constants/appThemes';
import type { AppColorScheme } from '@/constants/theme';
import type { ProgramCategory } from '@/lib/types';

export const PLAN_COVERS: Record<ProgramCategory, ImageSourcePropType> = {
  personalized: require('@/assets/catalog/plan-personalized.jpg'),
  standard: require('@/assets/catalog/plan-standard.jpg'),
  hype: require('@/assets/catalog/plan-hype.jpg'),
  nutrition: require('@/assets/catalog/plan-nutrition.jpg'),
  home_training: require('@/assets/catalog/plan-home.jpg'),
  gym_training: require('@/assets/catalog/plan-gym.jpg'),
};

const PLAN_COVERS_LIGHT: Partial<Record<ProgramCategory, ImageSourcePropType>> = {
  personalized: require('@/assets/catalog/plan-personalized-light.jpg'),
  hype: require('@/assets/catalog/plan-hype-light.jpg'),
  nutrition: require('@/assets/catalog/plan-nutrition-light.jpg'),
  home_training: require('@/assets/catalog/plan-home-light.jpg'),
  gym_training: require('@/assets/catalog/plan-gym-light.jpg'),
};

const PLAN_COVERS_BY_THEME: Partial<Record<AppThemeId, Partial<Record<ProgramCategory, ImageSourcePropType>>>> = {
  navy: {
    personalized: require('@/assets/catalog/plan-personalized-navy.jpg'),
    hype: require('@/assets/catalog/plan-hype-navy.jpg'),
    nutrition: require('@/assets/catalog/plan-nutrition-navy.jpg'),
    home_training: require('@/assets/catalog/plan-home-navy.jpg'),
    gym_training: require('@/assets/catalog/plan-gym-navy.jpg'),
  },
  forest: {
    personalized: require('@/assets/catalog/plan-personalized-forest.jpg'),
    hype: require('@/assets/catalog/plan-hype-forest.jpg'),
    nutrition: require('@/assets/catalog/plan-nutrition-forest.jpg'),
    home_training: require('@/assets/catalog/plan-home-forest.jpg'),
    gym_training: require('@/assets/catalog/plan-gym-forest.jpg'),
  },
  sand: {
    personalized: require('@/assets/catalog/plan-personalized-sand.jpg'),
    hype: require('@/assets/catalog/plan-hype-sand.jpg'),
    nutrition: require('@/assets/catalog/plan-nutrition-sand.jpg'),
    home_training: require('@/assets/catalog/plan-home-sand.jpg'),
    gym_training: require('@/assets/catalog/plan-gym-sand.jpg'),
  },
  slate: {
    personalized: require('@/assets/catalog/plan-personalized-slate.jpg'),
    hype: require('@/assets/catalog/plan-hype-slate.jpg'),
    nutrition: require('@/assets/catalog/plan-nutrition-slate.jpg'),
    home_training: require('@/assets/catalog/plan-home-slate.jpg'),
    gym_training: require('@/assets/catalog/plan-gym-slate.jpg'),
  },
  teal: {
    personalized: require('@/assets/catalog/plan-personalized-teal.jpg'),
    hype: require('@/assets/catalog/plan-hype-teal.jpg'),
    nutrition: require('@/assets/catalog/plan-nutrition-teal.jpg'),
    home_training: require('@/assets/catalog/plan-home-teal.jpg'),
    gym_training: require('@/assets/catalog/plan-gym-teal.jpg'),
  },
  wine: {
    personalized: require('@/assets/catalog/plan-personalized-wine.jpg'),
    hype: require('@/assets/catalog/plan-hype-wine.jpg'),
    nutrition: require('@/assets/catalog/plan-nutrition-wine.jpg'),
    home_training: require('@/assets/catalog/plan-home-wine.jpg'),
    gym_training: require('@/assets/catalog/plan-gym-wine.jpg'),
  },
  lavender: {
    personalized: require('@/assets/catalog/plan-personalized-lavender.jpg'),
    hype: require('@/assets/catalog/plan-hype-lavender.jpg'),
    nutrition: require('@/assets/catalog/plan-nutrition-lavender.jpg'),
    home_training: require('@/assets/catalog/plan-home-lavender.jpg'),
    gym_training: require('@/assets/catalog/plan-gym-lavender.jpg'),
  },
  olive: {
    personalized: require('@/assets/catalog/plan-personalized-olive.jpg'),
    hype: require('@/assets/catalog/plan-hype-olive.jpg'),
    nutrition: require('@/assets/catalog/plan-nutrition-olive.jpg'),
    home_training: require('@/assets/catalog/plan-home-olive.jpg'),
    gym_training: require('@/assets/catalog/plan-gym-olive.jpg'),
  },
  rose: {
    personalized: require('@/assets/catalog/plan-personalized-rose.jpg'),
    hype: require('@/assets/catalog/plan-hype-rose.jpg'),
    nutrition: require('@/assets/catalog/plan-nutrition-rose.jpg'),
    home_training: require('@/assets/catalog/plan-home-rose.jpg'),
    gym_training: require('@/assets/catalog/plan-gym-rose.jpg'),
  },
};

export const LIBRARY_COVER = require('@/assets/catalog/plan-library.jpg');

export function getPlanCover(
  category: ProgramCategory,
  scheme: AppColorScheme = 'dark',
  themeId?: AppThemeId,
): ImageSourcePropType {
  if (themeId) {
    const themed = PLAN_COVERS_BY_THEME[themeId]?.[category];
    if (themed) return themed;
  }
  if (scheme === 'light') {
    return PLAN_COVERS_LIGHT[category] ?? PLAN_COVERS[category];
  }
  return PLAN_COVERS[category];
}
