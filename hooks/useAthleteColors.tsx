import { createContext, useContext } from 'react';

import type { AthleteColors } from '@/constants/athleteColors';

const AthleteColorsContext = createContext<AthleteColors | null>(null);

export const AthleteColorsProvider = AthleteColorsContext.Provider;

/** Paleta del marco móvil; null fuera de él (escritorio del entrenador o app instalada). */
export function useAthleteColors() {
  return useContext(AthleteColorsContext);
}
