import type { Gym } from '@/lib/gymTypes';
import { isHypeGym } from '@/lib/hypeGymSchedule';

const hypeLogo = require('@/assets/gyms/hype-logo.png');

type GymBrandingSource = Pick<Gym, 'slug' | 'email' | 'logoUrl' | 'name'>;

/** Logo local o remoto para mostrar en tarjetas del atleta. */
export function resolveGymLogoSource(gym: GymBrandingSource) {
  const remote = gym.logoUrl?.trim();
  if (remote) return { uri: remote };

  if (isHypeGym(gym) || gym.name.trim().toLowerCase() === 'hype') return hypeLogo;

  return null;
}
