import type { SupabaseClient } from '@supabase/supabase-js';

import { getSupabase, isAuthDemoMode } from '@/lib/supabase';

/**
 * Buckets donde el primer segmento de la ruta es el id del usuario.
 * Storage no tiene `on delete cascade`, así que los ficheros se borran aquí
 * antes de llamar a la función: así desaparece el fichero físico y no solo
 * su registro. Los buckets que todavía no existen se ignoran sin error.
 */
const USER_SCOPED_BUCKETS = [
  'fotos',
  'athlete-plan-pdfs',
  'session-videos',
  'session-block-audio',
  'feedback-media',
  'chat-media',
];

const MAX_DEPTH = 4;
const REMOVE_BATCH_SIZE = 100;

/** Recorre el prefijo del usuario y devuelve las rutas de todos sus ficheros. */
async function listUserFiles(
  supabase: SupabaseClient,
  bucket: string,
  prefix: string,
  depth = 0,
): Promise<string[]> {
  if (depth > MAX_DEPTH) return [];

  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error || !data) return [];

  const paths: string[] = [];
  for (const entry of data) {
    const path = `${prefix}/${entry.name}`;
    // Storage devuelve las carpetas con `id` nulo.
    if (entry.id === null) paths.push(...(await listUserFiles(supabase, bucket, path, depth + 1)));
    else paths.push(path);
  }

  return paths;
}

async function removeUserFiles(supabase: SupabaseClient, userId: string) {
  for (const bucket of USER_SCOPED_BUCKETS) {
    try {
      const paths = await listUserFiles(supabase, bucket, userId);
      for (let index = 0; index < paths.length; index += REMOVE_BATCH_SIZE) {
        await supabase.storage.from(bucket).remove(paths.slice(index, index + REMOVE_BATCH_SIZE));
      }
    } catch {
      // Un bucket inaccesible no debe impedir el borrado de la cuenta: la
      // función SQL limpia los registros que queden como red de seguridad.
    }
  }
}

/**
 * Borra de forma permanente la cuenta del usuario autenticado y todos sus datos.
 * `delete_own_account` resuelve la identidad con `auth.uid()`, así que no se
 * envía ningún id y nadie puede borrar la cuenta de otro.
 */
export async function deleteOwnAccount(): Promise<{ error?: string }> {
  if (isAuthDemoMode) {
    return { error: 'La cuenta de demostración no se puede borrar.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'No hay conexión con el servidor.' };

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { error: 'Tu sesión ha caducado. Vuelve a iniciar sesión e inténtalo de nuevo.' };
  }

  await removeUserFiles(supabase, authData.user.id);

  const { error } = await supabase.rpc('delete_own_account');

  if (error) {
    const normalized = error.message.toLowerCase();

    if (normalized.includes('could not find') || normalized.includes('does not exist')) {
      return {
        error:
          'El borrado de cuenta no está disponible todavía. Escríbenos desde Contacto y lo hacemos por ti.',
      };
    }

    if (normalized.includes('fetch') || normalized.includes('network')) {
      return { error: 'No se pudo contactar con el servidor. Comprueba tu conexión.' };
    }

    return { error: 'No se pudo borrar la cuenta. Inténtalo de nuevo.' };
  }

  return {};
}
