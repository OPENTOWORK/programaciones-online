import { createClient } from '@supabase/supabase-js';

import { getEmailConfirmationRedirectUrl } from '@/lib/authRedirect';
import { interpretSignUpResponse, mapSignUpErrorMessage } from '@/lib/signUpResult';
import { getSupabase, isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/supabase';

export interface InviteGymCoachInput {
  gymId: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface InviteGymCoachResult {
  userId?: string;
  alreadyExisted?: boolean;
  welcomeEmailSent?: boolean;
  temporaryPassword?: string;
  error?: string;
}

interface InviteGymCoachResponse {
  userId?: string;
  alreadyExisted?: boolean;
  welcomeEmailSent?: boolean;
  temporaryPassword?: string;
  error?: string;
}

const PASSWORD_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

export function generateGymCoachPassword() {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return `Hype-${[...bytes].map((byte) => PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length]).join('')}`;
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

async function attachGymCoach(
  gymId: string,
  email: string,
  name: string,
): Promise<InviteGymCoachResult | 'not_found'> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.rpc('attach_gym_coach', {
    target_gym: gymId,
    target_email: email,
    target_name: name,
  });

  if (error) {
    const message = error.message ?? '';
    if (message.includes('USER_NOT_FOUND')) return 'not_found';
    return { error: message || 'No se pudo añadir al entrenador al gimnasio.' };
  }

  if (!data || typeof data !== 'string') {
    return { error: 'No se pudo añadir al entrenador al gimnasio.' };
  }

  return { userId: data, alreadyExisted: true };
}

async function createCoachAccount(input: InviteGymCoachInput): Promise<InviteGymCoachResult> {
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
      data: { name, phone: input.phone?.trim() || undefined, invited_as: 'gym_coach' },
      emailRedirectTo: getEmailConfirmationRedirectUrl(),
    },
  });

  if (error) {
    return { error: mapSignUpErrorMessage(error.message) };
  }

  const interpretation = interpretSignUpResponse(data);
  if (interpretation.type === 'already_registered') {
    return { alreadyExisted: true };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { error: 'No se pudo crear la cuenta del entrenador.' };
  }

  return {
    userId,
    alreadyExisted: false,
    welcomeEmailSent: interpretation.type === 'needs_email_confirmation',
  };
}

async function inviteGymCoachViaFallback(input: InviteGymCoachInput): Promise<InviteGymCoachResult> {
  const attached = await attachGymCoach(input.gymId, input.email, input.name);
  if (attached !== 'not_found') {
    return attached;
  }

  const created = await createCoachAccount(input);
  if (created.error) return created;

  const linked = await attachGymCoach(input.gymId, input.email, input.name);
  if (linked === 'not_found') {
    return { error: 'Se creó la cuenta, pero no se pudo añadir al gimnasio. Inténtalo de nuevo.' };
  }
  if (linked.error) return linked;

  return {
    userId: linked.userId ?? created.userId,
    alreadyExisted: false,
    welcomeEmailSent: created.welcomeEmailSent,
    temporaryPassword: created.welcomeEmailSent ? undefined : input.password,
  };
}

async function inviteGymCoachViaEdgeFunction(
  input: InviteGymCoachInput,
): Promise<InviteGymCoachResult | 'fallback'> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.functions.invoke<InviteGymCoachResponse>('invite-gym-coach', {
    body: {
      gymId: input.gymId,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      phone: input.phone?.trim() || undefined,
    },
  });

  if (error) {
    const responseError =
      data && typeof data === 'object' && typeof data.error === 'string' ? data.error : null;
    const message = responseError ?? error.message;

    if (shouldFallbackFromEdgeFunction(message)) {
      return 'fallback';
    }

    return { error: message || 'No se pudo enviar la invitación.' };
  }

  if (!data) return 'fallback';
  if (data.error) return { error: data.error };
  if (!data.userId) return { error: 'No se pudo invitar al entrenador. Inténtalo de nuevo.' };

  return {
    userId: data.userId,
    alreadyExisted: data.alreadyExisted,
    welcomeEmailSent: data.welcomeEmailSent,
    temporaryPassword: data.temporaryPassword,
  };
}

export async function inviteGymCoach(input: InviteGymCoachInput): Promise<InviteGymCoachResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim();

  if (!input.gymId) return { error: 'No hay gimnasio activo.' };
  if (!name) return { error: 'El nombre es obligatorio.' };
  if (!email) return { error: 'El email es obligatorio.' };
  if (!/\S+@\S+\.\S+/.test(email)) return { error: 'El email no es válido.' };
  if (input.password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' };

  if (!isSupabaseConfigured) {
    return { error: 'Invitar entrenadores solo está disponible con Supabase configurado.' };
  }

  const edgeResult = await inviteGymCoachViaEdgeFunction({ ...input, name, email, phone });
  if (edgeResult !== 'fallback') {
    return edgeResult;
  }

  return inviteGymCoachViaFallback({ ...input, name, email, phone });
}
