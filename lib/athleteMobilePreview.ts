import { findAthleteProfileByEmail } from '@/lib/athleteService';
import { fetchActiveProgramsForUser } from '@/lib/userProgramService';
import type { UserActiveProgram } from '@/lib/types';

/** Atleta de referencia en «Vista móvil atleta» → Atleta cedido. */
export const CEDED_ATHLETE_MOBILE_PREVIEW_EMAIL = 'estoicoycalistenico@gmail.com';

export type AthleteMobilePreviewSubject = {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  currentPrograms: UserActiveProgram[];
};

export async function loadAthleteMobilePreviewSubject(
  email: string = CEDED_ATHLETE_MOBILE_PREVIEW_EMAIL,
): Promise<AthleteMobilePreviewSubject | null> {
  const athlete = await findAthleteProfileByEmail(email);
  if (!athlete) return null;

  const currentPrograms = await fetchActiveProgramsForUser(athlete.id);

  return {
    id: athlete.id,
    name: athlete.name,
    email: athlete.email,
    avatarInitials: athlete.avatarInitials,
    currentPrograms,
  };
}
