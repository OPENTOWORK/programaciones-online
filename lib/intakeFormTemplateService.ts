import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  DEFAULT_WELCOME_INTAKE_SCHEMA,
  normalizeIntakeSchema,
  type IntakeFormSchema,
  type IntakeFormTemplate,
} from '@/lib/intakeFormTypes';

const TABLE = 'trainer_intake_form_templates';
const LOCAL_STORAGE_KEY = 'trainer-intake-form-templates-v1';
const SELECT =
  'id, trainer_id, name, description, is_default, is_active, schema, created_at, updated_at';

const localTemplatesByTrainer = new Map<string, IntakeFormTemplate[]>();

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

function mapRow(row: Record<string, unknown>): IntakeFormTemplate {
  return {
    id: row.id as string,
    trainerId: row.trainer_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? undefined,
    isDefault: Boolean(row.is_default),
    isActive: Boolean(row.is_active),
    schema: normalizeIntakeSchema(row.schema),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function sortByName(templates: IntakeFormTemplate[]) {
  return [...templates].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

const WELCOME_TEMPLATE_NAME = 'Formulario de bienvenida';

function isWelcomeTemplateName(name: string) {
  return name.trim().toLowerCase() === WELCOME_TEMPLATE_NAME.toLowerCase();
}

function templatePriority(template: IntakeFormTemplate) {
  let score = 0;
  if (!template.id.startsWith('local-intake-')) score += 10;
  if (template.isDefault) score += 5;
  if (template.isActive) score += 1;
  return score;
}

function dedupeTemplates(templates: IntakeFormTemplate[]) {
  const byName = new Map<string, IntakeFormTemplate>();

  for (const template of templates) {
    const key = template.name.trim().toLowerCase();
    const existing = byName.get(key);
    if (!existing || templatePriority(template) > templatePriority(existing)) {
      byName.set(key, template);
    }
  }

  return sortByName([...byName.values()]);
}

function readPersistedLocal(): Record<string, IntakeFormTemplate[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, IntakeFormTemplate[]>;
    if (!parsed || typeof parsed !== 'object') return {};
    const normalized: Record<string, IntakeFormTemplate[]> = {};
    for (const [trainerId, list] of Object.entries(parsed)) {
      normalized[trainerId] = (list ?? []).map((template) => ({
        ...template,
        schema: normalizeIntakeSchema(template.schema),
      }));
    }
    return normalized;
  } catch {
    return {};
  }
}

function writePersistedLocal(all: Record<string, IntakeFormTemplate[]>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

function localList(trainerId: string) {
  const existing = localTemplatesByTrainer.get(trainerId);
  if (existing) return existing;
  const persisted = readPersistedLocal()[trainerId] ?? [];
  localTemplatesByTrainer.set(trainerId, [...persisted]);
  return localTemplatesByTrainer.get(trainerId)!;
}

function persistLocalList(trainerId: string) {
  const all = readPersistedLocal();
  all[trainerId] = localList(trainerId);
  writePersistedLocal(all);
}

function clearPersistedLocalForTrainer(trainerId: string) {
  const all = readPersistedLocal();
  delete all[trainerId];
  writePersistedLocal(all);
  localTemplatesByTrainer.delete(trainerId);
}

async function migrateLocalIntakeTemplatesToSupabase(
  trainerId: string,
): Promise<IntakeFormTemplate[]> {
  const localTemplates = localList(trainerId);
  if (localTemplates.length === 0) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const migrated: IntakeFormTemplate[] = [];

  for (const template of localTemplates) {
    const result = await createIntakeFormTemplate({
      trainerId,
      name: template.name,
      description: template.description,
      isDefault: template.isDefault,
      isActive: template.isActive,
      schema: template.schema,
      useLocalStore: false,
    });

    if (result.template) {
      migrated.push(result.template);
    }
  }

  if (migrated.length > 0) {
    clearPersistedLocalForTrainer(trainerId);
  }

  return migrated;
}

function ensureDefaultWelcomeTemplate(trainerId: string): IntakeFormTemplate {
  const list = localList(trainerId);
  const existing =
    list.find((template) => template.isDefault) ??
    list.find((template) => isWelcomeTemplateName(template.name));
  if (existing) {
    if (!existing.isDefault) {
      list.forEach((entry) => {
        entry.isDefault = entry.id === existing.id;
      });
      persistLocalList(trainerId);
      return { ...existing, isDefault: true };
    }
    return existing;
  }

  const now = new Date().toISOString();
  const template: IntakeFormTemplate = {
    id: `local-intake-${Date.now()}`,
    trainerId,
    name: WELCOME_TEMPLATE_NAME,
    description: 'Cuestionario previo al entrenamiento online',
    isDefault: true,
    isActive: true,
    schema: DEFAULT_WELCOME_INTAKE_SCHEMA,
    createdAt: now,
    updatedAt: now,
  };
  list.push(template);
  persistLocalList(trainerId);
  return template;
}

function validateName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return 'Ponle un nombre al formulario.';
  if (trimmed.length > 120) return 'El nombre no puede superar los 120 caracteres.';
  return null;
}

function validateSchema(schema: IntakeFormSchema) {
  if (schema.fields.length === 0) return 'Añade al menos un campo al formulario.';
  for (const field of schema.fields) {
    if (!field.label.trim()) return 'Todos los campos deben tener un título.';
    if (
      (field.type === 'single_select' || field.type === 'multi_select') &&
      !field.options?.some((option) => option.trim())
    ) {
      return `El campo "${field.label || 'sin título'}" necesita opciones.`;
    }
  }
  return null;
}

export async function fetchIntakeFormTemplates(
  trainerId: string,
  useLocalStore = false,
): Promise<{ templates: IntakeFormTemplate[]; persistent: boolean }> {
  if (!trainerId) return { templates: [], persistent: false };

  if (useLocalStore || !isSupabaseConfigured) {
    ensureDefaultWelcomeTemplate(trainerId);
    return { templates: dedupeTemplates(localList(trainerId)), persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) {
    ensureDefaultWelcomeTemplate(trainerId);
    return { templates: dedupeTemplates(localList(trainerId)), persistent: false };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('trainer_id', trainerId)
    .order('name', { ascending: true });

  if (error || !data) {
    if (isMissingTableError(error)) {
      ensureDefaultWelcomeTemplate(trainerId);
      return { templates: dedupeTemplates(localList(trainerId)), persistent: false };
    }
    return { templates: dedupeTemplates(localList(trainerId)), persistent: true };
  }

  const templates = dedupeTemplates(data.map((row) => mapRow(row as Record<string, unknown>)));
  if (templates.length === 0) {
    const migrated = await migrateLocalIntakeTemplatesToSupabase(trainerId);
    if (migrated.length > 0) {
      return { templates: dedupeTemplates(migrated), persistent: true };
    }
  }

  localTemplatesByTrainer.set(trainerId, [...templates]);
  persistLocalList(trainerId);
  return { templates, persistent: true };
}

export async function fetchActiveIntakeFormTemplates(
  useLocalStore = false,
): Promise<{ templates: IntakeFormTemplate[]; persistent: boolean }> {
  if (useLocalStore || !isSupabaseConfigured) {
    return { templates: [], persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) return { templates: [], persistent: false };

  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });

  if (error || !data) {
    if (isMissingTableError(error)) return { templates: [], persistent: false };
    return { templates: [], persistent: true };
  }

  return {
    templates: dedupeTemplates(data.map((row) => mapRow(row as Record<string, unknown>))),
    persistent: true,
  };
}

export async function fetchIntakeFormTemplateById(
  templateId: string,
  useLocalStore = false,
): Promise<{ template: IntakeFormTemplate | null; persistent: boolean }> {
  if (!templateId) return { template: null, persistent: false };

  if (useLocalStore || !isSupabaseConfigured) {
    for (const list of localTemplatesByTrainer.values()) {
      const found = list.find((template) => template.id === templateId);
      if (found) return { template: found, persistent: false };
    }
    const persisted = readPersistedLocal();
    for (const list of Object.values(persisted)) {
      const found = list.find((template) => template.id === templateId);
      if (found) return { template: found, persistent: false };
    }
    return { template: null, persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) return { template: null, persistent: false };

  const { data, error } = await supabase.from(TABLE).select(SELECT).eq('id', templateId).maybeSingle();

  if (error || !data) {
    if (isMissingTableError(error)) return { template: null, persistent: false };
    return { template: null, persistent: true };
  }

  return { template: mapRow(data as Record<string, unknown>), persistent: true };
}

export async function createIntakeFormTemplate(input: {
  trainerId: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  schema: IntakeFormSchema;
  useLocalStore: boolean;
}): Promise<{ template?: IntakeFormTemplate; error?: string }> {
  const nameError = validateName(input.name);
  if (nameError) return { error: nameError };
  const schemaError = validateSchema(input.schema);
  if (schemaError) return { error: schemaError };

  const name = input.name.trim();
  const isDefault = input.isDefault ?? false;
  const isActive = input.isActive ?? true;

  if (input.useLocalStore || !isSupabaseConfigured) {
    const list = localList(input.trainerId);
    if (list.some((template) => template.name.toLowerCase() === name.toLowerCase())) {
      return { error: 'Ya hay un formulario con ese nombre.' };
    }
    if (isDefault) {
      list.forEach((template) => {
        template.isDefault = false;
      });
    }
    const now = new Date().toISOString();
    const template: IntakeFormTemplate = {
      id: `local-intake-${Date.now()}`,
      trainerId: input.trainerId,
      name,
      description: input.description?.trim() || undefined,
      isDefault,
      isActive,
      schema: input.schema,
      createdAt: now,
      updatedAt: now,
    };
    list.push(template);
    persistLocalList(input.trainerId);
    return { template };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  if (isDefault) {
    await supabase.from(TABLE).update({ is_default: false }).eq('is_default', true);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      trainer_id: input.trainerId,
      name,
      description: input.description?.trim() || null,
      is_default: isDefault,
      is_active: isActive,
      schema: input.schema,
    })
    .select(SELECT)
    .single();

  if (error) {
    const message = isMissingTableError(error)
      ? 'Las tablas de formularios no están disponibles. Ejecuta: npm run supabase:intake-form-templates'
      : error.message;
    return { error: message };
  }

  return { template: mapRow(data as Record<string, unknown>) };
}

export async function updateIntakeFormTemplate(input: {
  template: IntakeFormTemplate;
  name?: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  schema?: IntakeFormSchema;
  useLocalStore: boolean;
}): Promise<{ template?: IntakeFormTemplate; error?: string }> {
  const name = input.name?.trim() ?? input.template.name;
  const nameError = validateName(name);
  if (nameError) return { error: nameError };

  const schema = input.schema ?? input.template.schema;
  const schemaError = validateSchema(schema);
  if (schemaError) return { error: schemaError };

  const isDefault = input.isDefault ?? input.template.isDefault;
  const isActive = input.isActive ?? input.template.isActive;

  if (input.useLocalStore || input.template.id.startsWith('local-intake-')) {
    const list = localList(input.template.trainerId);
    if (isDefault) {
      list.forEach((entry) => {
        entry.isDefault = false;
      });
    }
    const index = list.findIndex((entry) => entry.id === input.template.id);
    if (index < 0) return { error: 'No se encontró el formulario.' };

    const updated: IntakeFormTemplate = {
      ...input.template,
      name,
      description: input.description?.trim() || undefined,
      isDefault,
      isActive,
      schema,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    persistLocalList(input.template.trainerId);
    return { template: updated };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  if (isDefault) {
    await supabase.from(TABLE).update({ is_default: false }).eq('is_default', true);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      name,
      description: input.description?.trim() || null,
      is_default: isDefault,
      is_active: isActive,
      schema,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.template.id)
    .select(SELECT)
    .single();

  if (error) return { error: error.message };
  return { template: mapRow(data as Record<string, unknown>) };
}

export async function deleteIntakeFormTemplate(
  template: IntakeFormTemplate,
  useLocalStore: boolean,
): Promise<{ error?: string }> {
  if (useLocalStore || template.id.startsWith('local-intake-')) {
    const list = localList(template.trainerId);
    const next = list.filter((entry) => entry.id !== template.id);
    localTemplatesByTrainer.set(template.trainerId, next);
    persistLocalList(template.trainerId);
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(TABLE).delete().eq('id', template.id);
  if (error) return { error: error.message };
  return {};
}

export async function ensureWelcomeIntakeTemplate(trainerId: string): Promise<IntakeFormTemplate | null> {
  const result = await fetchIntakeFormTemplates(trainerId, false);
  const existing =
    result.templates.find((template) => template.isDefault) ??
    result.templates.find((template) => isWelcomeTemplateName(template.name));

  if (existing) {
    if (!existing.isDefault && result.persistent && !existing.id.startsWith('local-intake-')) {
      const updated = await updateIntakeFormTemplate({
        template: existing,
        isDefault: true,
        useLocalStore: false,
      });
      return updated.template ?? existing;
    }

    if (!existing.isDefault && !result.persistent) {
      const list = localList(trainerId);
      list.forEach((entry) => {
        entry.isDefault = entry.id === existing.id;
      });
      persistLocalList(trainerId);
      return { ...existing, isDefault: true };
    }

    return existing;
  }

  if (!result.persistent) {
    return ensureDefaultWelcomeTemplate(trainerId);
  }

  const created = await createIntakeFormTemplate({
    trainerId,
    name: WELCOME_TEMPLATE_NAME,
    description: 'Cuestionario previo al entrenamiento online',
    isDefault: true,
    isActive: true,
    schema: DEFAULT_WELCOME_INTAKE_SCHEMA,
    useLocalStore: false,
  });

  return created.template ?? null;
}
