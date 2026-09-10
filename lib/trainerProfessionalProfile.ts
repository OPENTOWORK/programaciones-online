import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const PROFILE_TABLE = 'trainer_professional_profile';
const NOTES_TABLE = 'trainer_internal_notes';

const PROFILE_SELECT =
  'user_id, specialty, education, certifications, experience_years, modality, center_name, bio, updated_at';

export type TrainerModality = 'online' | 'presencial' | 'mixta';

export const TRAINER_MODALITY_OPTIONS: Array<{ value: TrainerModality; label: string }> = [
  { value: 'online', label: 'Online' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'mixta', label: 'Mixta' },
];

export interface TrainerProfessionalProfile {
  specialty?: string;
  education?: string;
  certifications?: string;
  experienceYears?: number;
  modality?: TrainerModality;
  centerName?: string;
  bio?: string;
  updatedAt?: string;
}

export interface TrainerInternalNote {
  note: string;
  updatedAt?: string;
}

/** `persistent: false` = falta ejecutar `npm run supabase:trainer-professional-profile`. */
export interface PersistedResult<T> {
  data: T;
  persistent: boolean;
}

export const EMPTY_PROFESSIONAL_PROFILE: TrainerProfessionalProfile = {};

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function trimmedOrNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isModality(value: unknown): value is TrainerModality {
  return value === 'online' || value === 'presencial' || value === 'mixta';
}

function mapProfileRow(row: Record<string, unknown>): TrainerProfessionalProfile {
  const experienceYears = row.experience_years;
  const modality = row.modality;

  return {
    specialty: (row.specialty as string | null) ?? undefined,
    education: (row.education as string | null) ?? undefined,
    certifications: (row.certifications as string | null) ?? undefined,
    experienceYears: typeof experienceYears === 'number' ? experienceYears : undefined,
    modality: isModality(modality) ? modality : undefined,
    centerName: (row.center_name as string | null) ?? undefined,
    bio: (row.bio as string | null) ?? undefined,
    updatedAt: (row.updated_at as string | null) ?? undefined,
  };
}

export function isProfessionalProfileEmpty(profile: TrainerProfessionalProfile) {
  return (
    !profile.specialty &&
    !profile.education &&
    !profile.certifications &&
    profile.experienceYears === undefined &&
    !profile.modality &&
    !profile.centerName &&
    !profile.bio
  );
}

export async function fetchTrainerProfessionalProfile(
  trainerId: string,
): Promise<PersistedResult<TrainerProfessionalProfile>> {
  if (!trainerId || !isSupabaseConfigured) {
    return { data: EMPTY_PROFESSIONAL_PROFILE, persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) return { data: EMPTY_PROFESSIONAL_PROFILE, persistent: false };

  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select(PROFILE_SELECT)
    .eq('user_id', trainerId)
    .maybeSingle();

  if (isMissingTableError(error)) {
    return { data: EMPTY_PROFESSIONAL_PROFILE, persistent: false };
  }

  if (error || !data) {
    return { data: EMPTY_PROFESSIONAL_PROFILE, persistent: true };
  }

  return { data: mapProfileRow(data as Record<string, unknown>), persistent: true };
}

export async function saveTrainerProfessionalProfile(
  trainerId: string,
  input: TrainerProfessionalProfile,
): Promise<{ error?: string }> {
  if (!trainerId) return { error: 'Entrenador no válido.' };

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(PROFILE_TABLE).upsert(
    {
      user_id: trainerId,
      specialty: trimmedOrNull(input.specialty),
      education: trimmedOrNull(input.education),
      certifications: trimmedOrNull(input.certifications),
      experience_years: input.experienceYears ?? null,
      modality: input.modality ?? null,
      center_name: trimmedOrNull(input.centerName),
      bio: trimmedOrNull(input.bio),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (isMissingTableError(error)) {
    return {
      error: 'Falta la migración: ejecuta npm run supabase:trainer-professional-profile',
    };
  }

  if (error) return { error: error.message };
  return {};
}

export async function fetchTrainerInternalNote(
  trainerId: string,
): Promise<PersistedResult<TrainerInternalNote>> {
  const empty: TrainerInternalNote = { note: '' };

  if (!trainerId || !isSupabaseConfigured) return { data: empty, persistent: false };

  const supabase = getSupabase();
  if (!supabase) return { data: empty, persistent: false };

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select('note, updated_at')
    .eq('trainer_id', trainerId)
    .maybeSingle();

  if (isMissingTableError(error)) return { data: empty, persistent: false };
  if (error || !data) return { data: empty, persistent: true };

  return {
    data: {
      note: (data.note as string | null) ?? '',
      updatedAt: (data.updated_at as string | null) ?? undefined,
    },
    persistent: true,
  };
}

export async function saveTrainerInternalNote(
  trainerId: string,
  note: string,
  adminId?: string,
): Promise<{ error?: string }> {
  if (!trainerId) return { error: 'Entrenador no válido.' };

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(NOTES_TABLE).upsert(
    {
      trainer_id: trainerId,
      note: note.trim(),
      updated_by: adminId ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'trainer_id' },
  );

  if (isMissingTableError(error)) {
    return {
      error: 'Falta la migración: ejecuta npm run supabase:trainer-professional-profile',
    };
  }

  if (error) return { error: error.message };
  return {};
}
