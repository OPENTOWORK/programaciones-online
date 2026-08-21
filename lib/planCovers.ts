import type { ImageSourcePropType } from 'react-native';

import type { ProgramCategory } from '@/lib/types';

export const PLAN_COVERS: Record<ProgramCategory, ImageSourcePropType> = {
  personalized: require('@/assets/catalog/plan-personalized.jpg'),
  standard: require('@/assets/catalog/plan-standard.jpg'),
  hype: require('@/assets/catalog/plan-hype.jpg'),
  nutrition: require('@/assets/catalog/plan-nutrition.jpg'),
  home_training: require('@/assets/catalog/plan-home.jpg'),
  gym_training: require('@/assets/catalog/plan-gym.jpg'),
};

export const LIBRARY_COVER = require('@/assets/catalog/plan-library.jpg');
