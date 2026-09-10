import { createClient } from '@supabase/supabase-js';

import { findAthleteProfileByEmail } from '@/lib/athleteService';
import { getEmailConfirmationRedirectUrl } from '@/lib/authRedirect';
import { interpretSignUpResponse, mapSignUpErrorMessage } from '@/lib/signUpResult';
import { getSupabase, isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/supabase';

export interface CreateTrainerClientInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateTrainerClientResult {
  athleteId?: string;
  alreadyExisted?: boolean;
  needsEmailConfirmation?: boolean;
  welcomeEmailSent?: boolean;
  error?: string;
}

interface CreateTrainerClientResponse {
  athleteId?: string;
  alreadyExisted?: boolean;
  needsEmailConfirmation?: boolean;
  welcomeEmailSent?: boolean;
  error?: string;
}

function shouldFallbackFromEdgeFunction(errorMessage: string) {
  const normalized = errorMessage.toLowerCase();
  return (
    normalized.includes('function not found') ||
    normalized.includes('failed to send a request to the edge function') ||
    normalized.includes('non-2xx') ||
    normalized.includes('404')
  );
}

async function createTrainerClientViaEdgeFunction(
  input: CreateTrainerClientInput,
): Promise<CreateTrainerClientResult | 'fallback'> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.functions.invoke<CreateTrainerClientResponse>(
    'create-trainer-client',
    {
      body: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
      },
    },
  );

  if (error) {
    const responseError =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : null;
    const message = responseError ?? error.message;

    if (shouldFallbackFromEdgeFunction(message)) {
      return 'fallback';
    }

    const normalized = message.toLowerCase();
    if (normalized.includes('fetch') || normalized.includes('network')) {
      return {
        error:
          'No se pudo contactar con el servidor para crear el cliente. Comprueba tu conexión e inténtalo de nuevo.',
      };
    }

    return { error: message };
  }

  if (!data) {
    return 'fallback';
  }

  if (data.error) {
    return { error: data.error };
  }

  if (!data.athleteId) {
    return { error: 'No se pudo crear el cliente. Inténtalo de nuevo.' };
  }

  return {
    athleteId: data.athleteId,
    alreadyExisted: data.alreadyExisted,
    needsEmailConfirmation: data.needsEmailConfirmation,
    welcomeEmailSent: data.welcomeEmailSent,
  };
}

async function createTrainerClientViaSignUp(
  input: CreateTrainerClientInput,
): Promise<CreateTrainerClientResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  const ephemeral = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: async () => null,
        setItem: async () => undefined,
        removeItem: async () => undefined,
      },
    },
  });

  const { data, error } = await ephemeral.auth.signUp({
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

  const needsEmailConfirmation = interpretation.type === 'needs_email_confirmation';

  return {
    athleteId,
    needsEmailConfirmation,
    welcomeEmailSent: needsEmailConfirmation,
  };
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

  const edgeResult = await createTrainerClientViaEdgeFunction(input);
  if (edgeResult !== 'fallback') {
    return edgeResult;
  }

  return createTrainerClientViaSignUp(input);
}
