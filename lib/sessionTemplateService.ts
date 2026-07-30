import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const TABLE = 'trainer_session_templates';

export interface SessionTemplate {
  id: string;
  trainerId: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const localTemplatesByTrainer = new Map<string, SessionTemplate[]>();

function localList(trainerId: string) {
  const existing = localTemplatesByTrainer.get(trainerId);
  if (existing) return existing;
  const created: SessionTemplate[] = [];
  localTemplatesByTrainer.set(trainerId, created);
  return created;
}

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes(TABLE) ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function isDuplicateNameError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  return error.code === '23505' || (error.message?.toLowerCase().includes('unique') ?? false);
}

function mapRow(row: Record<string, unknown>): SessionTemplate {
  return {
    id: row.id as string,
    trainerId: row.trainer_id as string,
    name: row.name as string,
    content: row.content as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function sortByName(templates: SessionTemplate[]) {
  return [...templates].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

function validateName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return 'Ponle un nombre a la plantilla.';
  if (trimmed.length > 120) return 'El nombre no puede superar los 120 caracteres.';
  return null;
}

export async function fetchSessionTemplates(
  trainerId: string,
  useLocalStore = false,
): Promise<{ templates: SessionTemplate[]; persistent: boolean }> {
  if (!trainerId) return { templates: [], persistent: false };

  if (useLocalStore || !isSupabaseConfigured) {
    return { templates: sortByName(localList(trainerId)), persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) return { templates: [], persistent: false };

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, trainer_id, name, content, created_at, updated_at')
    .eq('trainer_id', trainerId)
    .order('name', { ascending: true });

  if (error || !data) {
    if (isMissingTableError(error)) {
      return { templates: sortByName(localList(trainerId)), persistent: false };
    }
    return { templates: [], persistent: true };
  }

  return { templates: data.map((row) => mapRow(row as Record<string, unknown>)), persistent: true };
}

export async function createSessionTemplate(input: {
  trainerId: string;
  name: string;
  content: string;
  useLocalStore: boolean;
}): Promise<{ template?: SessionTemplate; error?: string }> {
  const nameError = validateName(input.name);
  if (nameError) return { error: nameError };
  if (!input.content.trim()) return { error: 'La sesión está vacía, no hay nada que guardar.' };

  const name = input.name.trim();

  if (input.useLocalStore || !isSupabaseConfigured) {
    const templates = localList(input.trainerId);
    if (templates.some((template) => template.name.toLowerCase() === name.toLowerCase())) {
      return { error: 'Ya tienes una plantilla con ese nombre.' };
    }

    const now = new Date().toISOString();
    const template: SessionTemplate = {
      id: `local-template-${Date.now()}`,
      trainerId: input.trainerId,
      name,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };
    templates.push(template);
    return { template };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ trainer_id: input.trainerId, name, content: input.content })
    .select('id, trainer_id, name, content, created_at, updated_at')
    .single();

  if (error || !data) {
    if (isDuplicateNameError(error)) return { error: 'Ya tienes una plantilla con ese nombre.' };
    return {
      error: isMissingTableError(error)
        ? 'Falta aplicar la tabla de plantillas: npm run supabase:session-templates'
        : error?.message ?? 'No se pudo guardar la plantilla.',
    };
  }

  return { template: mapRow(data as Record<string, unknown>) };
}

export async function updateSessionTemplate(input: {
  template: SessionTemplate;
  name?: string;
  content?: string;
  useLocalStore: boolean;
}): Promise<{ template?: SessionTemplate; error?: string }> {
  const { template } = input;
  const name = input.name?.trim() ?? template.name;

  const nameError = validateName(name);
  if (nameError) return { error: nameError };

  const content = input.content ?? template.content;
  const updatedAt = new Date().toISOString();

  if (input.useLocalStore || !isSupabaseConfigured || template.id.startsWith('local-template-')) {
    const templates = localList(template.trainerId);
    const duplicated = templates.some(
      (entry) => entry.id !== template.id && entry.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicated) return { error: 'Ya tienes una plantilla con ese nombre.' };

    const index = templates.findIndex((entry) => entry.id === template.id);
    const updated: SessionTemplate = { ...template, name, content, updatedAt };
    if (index >= 0) templates[index] = updated;
    return { template: updated };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(TABLE)
    .update({ name, content, updated_at: updatedAt })
    .eq('id', template.id)
    .eq('trainer_id', template.trainerId)
    .select('id, trainer_id, name, content, created_at, updated_at')
    .single();

  if (error || !data) {
    if (isDuplicateNameError(error)) return { error: 'Ya tienes una plantilla con ese nombre.' };
    return { error: error?.message ?? 'No se pudo actualizar la plantilla.' };
  }

  return { template: mapRow(data as Record<string, unknown>) };
}

export async function deleteSessionTemplate(
  template: SessionTemplate,
  useLocalStore: boolean,
): Promise<{ error?: string }> {
  if (useLocalStore || !isSupabaseConfigured || template.id.startsWith('local-template-')) {
    const templates = localList(template.trainerId);
    const index = templates.findIndex((entry) => entry.id === template.id);
    if (index >= 0) templates.splice(index, 1);
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', template.id)
    .eq('trainer_id', template.trainerId);

  return error ? { error: error.message } : {};
}
