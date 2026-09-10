import schedule from '@/data/hype-gym-weekly-schedule.json';

import { addDays } from '@/hooks/useGymData';
import type { GymClassInput } from '@/lib/gymService';
import type { GymClassType } from '@/lib/gymTypes';

export interface HypeClassTypeSeed {
  name: string;
  color: string;
  durationMinutes: number;
  capacity: number;
  description: string;
}

export interface HypeScheduleSlot {
  day: number;
  start: string;
  end: string;
  type: string;
  capacity: number;
}

export const HYPE_OWNER_EMAIL = 'info@trainwithhype.com';
export const HYPE_GYM_SLUG = 'hype';

export const HYPE_CLASS_TYPES = schedule.classTypes as HypeClassTypeSeed[];
export const HYPE_WEEKLY_SLOTS = schedule.slots as HypeScheduleSlot[];

/** Este horario semanal pertenece solo al gimnasio de info@trainwithhype.com. */
export function isHypeGym(gym?: { slug?: string; email?: string } | null) {
  if (!gym) return false;
  return gym.slug === HYPE_GYM_SLUG || gym.email?.trim().toLowerCase() === HYPE_OWNER_EMAIL;
}

function atLocalTime(day: Date, hhmm: string) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes, 0, 0);
}

/** Convierte la plantilla semanal de Hype en clases concretas para el lunes indicado. */
export function buildHypeWeekClassInputs(
  weekStart: Date,
  types: readonly GymClassType[],
): { inputs: GymClassInput[]; missingTypes: string[] } {
  const typeByName = new Map(types.map((type) => [type.name.toUpperCase(), type]));
  const missing = new Set<string>();
  const inputs: GymClassInput[] = [];

  for (const slot of HYPE_WEEKLY_SLOTS) {
    const type = typeByName.get(slot.type.toUpperCase());
    if (!type) {
      missing.add(slot.type);
      continue;
    }

    const day = addDays(weekStart, slot.day);
    inputs.push({
      classTypeId: type.id,
      startAt: atLocalTime(day, slot.start).toISOString(),
      endAt: atLocalTime(day, slot.end).toISOString(),
      capacity: slot.capacity,
    });
  }

  return { inputs, missingTypes: [...missing] };
}
