import { findAthleteProfileByEmail } from '@/lib/athleteService';
import { getEmailConfirmationRedirectUrl } from '@/lib/authRedirect';
import { interpretSignUpResponse, mapSignUpErrorMessage } from '@/lib/signUpResult';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface CreateTrainerClientInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateTrainerClientResult {
  athleteId?: string;
  alreadyExisted?: boolean;
  needsEmailConfirmation?: boolean;
  error?: string;
}

/** Crea una cuenta de atleta o recupera la existente para añadirla al tablero. */
export async function createTrainerClient(
  input: CreateTrainerClientInput,
  isDemoMode: boolean,
): Promise<CreateTrainerClientResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name) return { error: 'El nombre es obligatorio.' };
  if (!email) return { error: 'El email es obligatorio.' };
  if (!/\S+@\S+\.\S+/.test(email)) return { error: 'El email no es válido.' };
  if (input.password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' };

  if (isDemoMode || !isSupabaseConfigured) {
    return { error: 'Crear clientes solo está disponible con Supabase configurado.' };
  }

  const existing = await findAthleteProfileByEmail(email);
  if (existing) {
    return { athleteId: existing.id, alreadyExisted: true };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { name },
      emailRedirectTo: getEmailConfirmationRedirectUrl(),
    },
  });

  if (error) {
    return { error: mapSignUpErrorMessage(error.message) };
  }

  const interpretation = interpretSignUpResponse(data);
  if (interpretation.type === 'already_registered') {
    const registered = await findAthleteProfileByEmail(email);
    if (registered) {
      return { athleteId: registered.id, alreadyExisted: true };
    }
    return { error: 'Este email ya está registrado, pero no aparece como atleta en el tablero.' };
  }

  const athleteId = data.user?.id;
  if (!athleteId) {
    return { error: 'No se pudo crear el cliente. Inténtalo de nuevo.' };
  }

  return {
    athleteId,
    needsEmailConfirmation: interpretation.type === 'needs_email_confirmation',
  };
}
