import { getSupabase } from '@/lib/supabase';

const PERFIL_TABLE = 'Perfil';

/** Nombres de los entrenadores del equipo, para firmar lo que crea cada uno. */
export async function fetchTrainerNames(trainerIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(trainerIds.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const supabase = getSupabase();
  if (!supabase) return new Map();

  const { data, error } = await supabase.from(PERFIL_TABLE).select('id, name').in('id', unique);
  if (error || !data) return new Map();

  const names = new Map<string, string>();
  for (const row of data) {
    const name = (row.name as string | null)?.trim();
    if (name) names.set(row.id as string, name);
  }

  return names;
}
