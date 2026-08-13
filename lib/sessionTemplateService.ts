import {
  normalizeSessionTemplateFormatTag,
  normalizeSessionTemplateTag,
  type SessionTemplateFormatTag,
  type SessionTemplateTag,
} from '@/lib/sessionTemplateTags';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const TABLE = 'trainer_session_templates';
const LOCAL_STORAGE_KEY = 'trainer-session-templates-v3';
const SELECT_FULL =
  'id, trainer_id, name, content, tag, format_tag, created_at, updated_at';
const SELECT_WITH_TAG = 'id, trainer_id, name, content, tag, created_at, updated_at';
const SELECT_WITHOUT_TAG = 'id, trainer_id, name, content, created_at, updated_at';

export interface SessionTemplate {
  id: string;
  trainerId: string;
  name: string;
  content: string;
  tag: SessionTemplateTag | null;
  formatTag: SessionTemplateFormatTag | null;
  createdAt: string;
  updatedAt: string;
}

const localTemplatesByTrainer = new Map<string, SessionTemplate[]>();

function normalizeTemplate(template: Partial<SessionTemplate> & { name: string; content: string; id: string; trainerId: string; createdAt: string; updatedAt: string }): SessionTemplate {
  return {
    ...template,
    tag: normalizeSessionTemplateTag(template.tag),
    formatTag: normalizeSessionTemplateFormatTag(template.formatTag),
  };
}

function readPersistedLocalTemplates(): Record<string, SessionTemplate[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SessionTemplate[]>;
    if (!parsed || typeof parsed !== 'object') return {};

    const normalized: Record<string, SessionTemplate[]> = {};
    for (const [trainerId, list] of Object.entries(parsed)) {
      normalized[trainerId] = (list ?? []).map((template) => normalizeTemplate(template));
    }
    return normalized;
  } catch {
    return {};
  }
}

function writePersistedLocalTemplates(all: Record<string, SessionTemplate[]>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore quota / private mode failures
  }
}

function localList(trainerId: string) {
  const existing = localTemplatesByTrainer.get(trainerId);
  if (existing) return existing;

  const persisted = readPersistedLocalTemplates()[trainerId] ?? [];
  const created = [...persisted];
  localTemplatesByTrainer.set(trainerId, created);
  return created;
}

function persistLocalList(trainerId: string) {
  const all = readPersistedLocalTemplates();
  all[trainerId] = localList(trainerId);
  writePersistedLocalTemplates(all);
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

function isMissingColumnError(
  error: { message?: string; code?: string } | null | undefined,
  column: string,
) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return message.includes(column) && (message.includes('column') || message.includes('schema cache'));
}

function isDuplicateNameError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  return error.code === '23505' || (error.message?.toLowerCase().includes('unique') ?? false);
}

function mapRow(row: Record<string, unknown>): SessionTemplate {
  const rawTag = typeof row.tag === 'string' ? row.tag : null;
  const rawFormat = typeof row.format_tag === 'string' ? row.format_tag : null;

  // Legacy: Activación estaba como zona; ahora es formato.
  const legacyActivation = rawTag?.trim() === 'Activación';

  return {
    id: row.id as string,
    trainerId: row.trainer_id as string,
    name: row.name as string,
    content: row.content as string,
    tag: legacyActivation ? null : normalizeSessionTemplateTag(rawTag),
    formatTag:
      normalizeSessionTemplateFormatTag(rawFormat) ??
      (legacyActivation ? 'Activación' : null),
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

function validateTag(tag: SessionTemplateTag | null | undefined) {
  if (!tag) return 'Elige una etiqueta de zona para la plantilla.';
  return null;
}

function mirrorLocal(trainerId: string, template: SessionTemplate) {
  const local = localList(trainerId);
  const withoutDup = local.filter(
    (entry) => entry.id !== template.id && entry.name.toLowerCase() !== template.name.toLowerCase(),
  );
  withoutDup.push(template);
  localTemplatesByTrainer.set(trainerId, withoutDup);
  persistLocalList(trainerId);
}

function uniqueName(trainerId: string, baseName: string) {
  const existing = new Set(localList(trainerId).map((template) => template.name.toLowerCase()));
  if (!existing.has(baseName.toLowerCase())) return baseName;
  let suffix = 2;
  while (existing.has(`${baseName} (${suffix})`.toLowerCase())) suffix += 1;
  return `${baseName} (${suffix})`;
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
  if (!supabase) return { templates: sortByName(localList(trainerId)), persistent: false };

  let { data, error } = await supabase.from(TABLE).select(SELECT_FULL).order('name', { ascending: true });

  if (error && isMissingColumnError(error, 'format_tag')) {
    ({ data, error } = await supabase
      .from(TABLE)
      .select(SELECT_WITH_TAG)
      .order('name', { ascending: true }));
  }

  if (error && isMissingColumnError(error, 'tag')) {
    ({ data, error } = await supabase
      .from(TABLE)
      .select(SELECT_WITHOUT_TAG)
      .order('name', { ascending: true }));
  }

  if (error || !data) {
    if (isMissingTableError(error)) {
      return { templates: sortByName(localList(trainerId)), persistent: false };
    }
    const local = localList(trainerId);
    return { templates: sortByName(local), persistent: local.length > 0 ? false : true };
  }

  const templates = data.map((row) => mapRow(row as Record<string, unknown>));
  localTemplatesByTrainer.set(trainerId, [...templates]);
  persistLocalList(trainerId);

  return { templates, persistent: true };
}

export async function createSessionTemplate(input: {
  trainerId: string;
  name: string;
  content: string;
  tag: SessionTemplateTag;
  formatTag?: SessionTemplateFormatTag | null;
  useLocalStore: boolean;
}): Promise<{ template?: SessionTemplate; error?: string }> {
  const tagError = validateTag(input.tag);
  if (tagError) return { error: tagError };
  if (!input.content.trim()) return { error: 'La sesión está vacía, no hay nada que guardar.' };

  const name = uniqueName(input.trainerId, input.name.trim() || input.tag);
  const nameError = validateName(name);
  if (nameError) return { error: nameError };

  const tag = input.tag;
  const formatTag = input.formatTag ?? null;

  if (input.useLocalStore || !isSupabaseConfigured) {
    const templates = localList(input.trainerId);
    if (templates.some((template) => template.name.toLowerCase() === name.toLowerCase())) {
      return { error: 'Ya hay una plantilla con ese nombre.' };
    }

    const now = new Date().toISOString();
    const template: SessionTemplate = {
      id: `local-template-${Date.now()}`,
      trainerId: input.trainerId,
      name,
      content: input.content,
      tag,
      formatTag,
      createdAt: now,
      updatedAt: now,
    };
    templates.push(template);
    persistLocalList(input.trainerId);
    return { template };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const insertPayload: Record<string, unknown> = {
    trainer_id: input.trainerId,
    name,
    content: input.content,
    tag,
    format_tag: formatTag,
  };

  let { data, error } = await supabase.from(TABLE).insert(insertPayload).select(SELECT_FULL).single();

  if (error && isMissingColumnError(error, 'format_tag')) {
    delete insertPayload.format_tag;
    ({ data, error } = await supabase
      .from(TABLE)
      .insert(insertPayload)
      .select(SELECT_WITH_TAG)
      .single());
  }

  if (error && isMissingColumnError(error, 'tag')) {
    delete insertPayload.tag;
    ({ data, error } = await supabase
      .from(TABLE)
      .insert(insertPayload)
      .select(SELECT_WITHOUT_TAG)
      .single());
  }

  if (error || !data) {
    if (isDuplicateNameError(error)) {
      const retryName = uniqueName(input.trainerId, `${name} ${Date.now().toString(36).slice(-4)}`);
      return createSessionTemplate({ ...input, name: retryName });
    }
    if (isMissingTableError(error)) {
      return createSessionTemplate({ ...input, useLocalStore: true });
    }
    return {
      error: error?.message ?? 'No se pudo guardar la plantilla.',
    };
  }

  const mapped = mapRow(data as Record<string, unknown>);
  const template: SessionTemplate = {
    ...mapped,
    tag: mapped.tag ?? tag,
    formatTag: mapped.formatTag ?? formatTag,
  };
  mirrorLocal(input.trainerId, template);
  return { template };
}

export async function updateSessionTemplate(input: {
  template: SessionTemplate;
  name?: string;
  content?: string;
  tag?: SessionTemplateTag | null;
  formatTag?: SessionTemplateFormatTag | null;
  useLocalStore: boolean;
}): Promise<{ template?: SessionTemplate; error?: string }> {
  const { template } = input;
  const name = input.name?.trim() ?? template.name;
  const tag = input.tag === undefined ? template.tag : input.tag;
  const formatTag = input.formatTag === undefined ? template.formatTag : input.formatTag;

  const nameError = validateName(name);
  if (nameError) return { error: nameError };
  if (input.tag !== undefined) {
    const tagError = validateTag(input.tag);
    if (tagError) return { error: tagError };
  }

  const content = input.content ?? template.content;
  const updatedAt = new Date().toISOString();

  if (input.useLocalStore || !isSupabaseConfigured || template.id.startsWith('local-template-')) {
    const templates = localList(template.trainerId);
    const duplicated = templates.some(
      (entry) => entry.id !== template.id && entry.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicated) return { error: 'Ya hay una plantilla con ese nombre.' };

    const index = templates.findIndex((entry) => entry.id === template.id);
    const updated: SessionTemplate = { ...template, name, content, tag, formatTag, updatedAt };
    if (index >= 0) templates[index] = updated;
    else templates.push(updated);
    persistLocalList(template.trainerId);
    return { template: updated };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const updatePayload: Record<string, unknown> = {
    name,
    content,
    tag,
    format_tag: formatTag,
    updated_at: updatedAt,
  };

  let { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq('id', template.id)
    .select(SELECT_FULL)
    .single();

  if (error && isMissingColumnError(error, 'format_tag')) {
    delete updatePayload.format_tag;
    ({ data, error } = await supabase
      .from(TABLE)
      .update(updatePayload)
      .eq('id', template.id)
      .select(SELECT_WITH_TAG)
      .single());
  }

  if (error && isMissingColumnError(error, 'tag')) {
    delete updatePayload.tag;
    ({ data, error } = await supabase
      .from(TABLE)
      .update(updatePayload)
      .eq('id', template.id)
      .select(SELECT_WITHOUT_TAG)
      .single());
  }

  if (error || !data) {
    if (isDuplicateNameError(error)) return { error: 'Ya hay una plantilla con ese nombre.' };
    return { error: error?.message ?? 'No se pudo actualizar la plantilla.' };
  }

  const mapped = mapRow(data as Record<string, unknown>);
  const updated: SessionTemplate = {
    ...mapped,
    tag: mapped.tag ?? tag,
    formatTag: mapped.formatTag ?? formatTag,
  };
  mirrorLocal(template.trainerId, updated);
  return { template: updated };
}

export async function deleteSessionTemplate(
  template: SessionTemplate,
  useLocalStore: boolean,
): Promise<{ error?: string }> {
  if (useLocalStore || !isSupabaseConfigured || template.id.startsWith('local-template-')) {
    const templates = localList(template.trainerId);
    const index = templates.findIndex((entry) => entry.id === template.id);
    if (index >= 0) templates.splice(index, 1);
    persistLocalList(template.trainerId);
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(TABLE).delete().eq('id', template.id);

  return error ? { error: error.message } : {};
}
