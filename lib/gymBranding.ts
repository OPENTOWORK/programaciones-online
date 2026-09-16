import type { Gym } from '@/lib/gymTypes';
import { isHypeGym } from '@/lib/hypeGymSchedule';

export const hypeGymLogo = require('@/assets/gyms/hype-logo.png');

type GymBrandingSource = Pick<Gym, 'slug' | 'email' | 'logoUrl' | 'name'>;

export function isHypeBrandedGym(gym: GymBrandingSource) {
  if (isHypeGym(gym)) return true;
  const name = gym.name.trim().toLowerCase();
  return name === 'hype' || name.startsWith('hype ');
}

/** Logo local o remoto para mostrar en tarjetas del atleta. */
export function resolveGymLogoSource(gym: GymBrandingSource) {
  if (isHypeBrandedGym(gym)) return hypeGymLogo;

  const remote = gym.logoUrl?.trim();
  if (remote) return { uri: remote };

  return null;
}
