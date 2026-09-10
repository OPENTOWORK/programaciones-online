export const SESSION_TEMPLATE_ZONE_TAGS = [
  'All',
  'Tren inferior',
  'Tren superior',
  'Core',
  'Metcon',
  'Descanso',
] as const;

export const SESSION_TEMPLATE_FORMAT_TAGS = [
  'Activación',
  'EMOM',
  'For Time',
  'Rounds For Time',
  'AMRAP',
  'Tabata',
  'Reps For Time / Ladder',
  'Estaciones de tiempo',
  'Fuerza',
  'Técnica',
  'Movilidad',
  'Unbroken',
] as const;

/** Modalidades del catálogo HYPE (sin Básico). */
export const SESSION_TEMPLATE_MODALITY_TAGS = [
  'Calistenia',
  'ATHX',
  'Crosstraining',
  'Hype',
  'Hyrox',
] as const;

/** @deprecated Usa SESSION_TEMPLATE_ZONE_TAGS */
export const SESSION_TEMPLATE_TAGS = SESSION_TEMPLATE_ZONE_TAGS;

export type SessionTemplateTag = (typeof SESSION_TEMPLATE_ZONE_TAGS)[number];
export type SessionTemplateFormatTag = (typeof SESSION_TEMPLATE_FORMAT_TAGS)[number];
export type SessionTemplateModalityTag = (typeof SESSION_TEMPLATE_MODALITY_TAGS)[number];

export const UNTAGGED_TEMPLATE_LABEL = 'Sin etiqueta';
export const UNTAGGED_FORMAT_LABEL = 'Sin formato';
export const UNTAGGED_MODALITY_LABEL = 'Sin modalidad';

export function isSessionTemplateTag(value: string | null | undefined): value is SessionTemplateTag {
  return Boolean(value && (SESSION_TEMPLATE_ZONE_TAGS as readonly string[]).includes(value));
}

export function isSessionTemplateFormatTag(
  value: string | null | undefined,
): value is SessionTemplateFormatTag {
  return Boolean(value && (SESSION_TEMPLATE_FORMAT_TAGS as readonly string[]).includes(value));
}

export function isSessionTemplateModalityTag(
  value: string | null | undefined,
): value is SessionTemplateModalityTag {
  return Boolean(value && (SESSION_TEMPLATE_MODALITY_TAGS as readonly string[]).includes(value));
}

export function normalizeSessionTemplateTag(
  value: string | null | undefined,
): SessionTemplateTag | null {
  const trimmed = value?.trim();
  return isSessionTemplateTag(trimmed) ? trimmed : null;
}

export function normalizeSessionTemplateFormatTag(
  value: string | null | undefined,
): SessionTemplateFormatTag | null {
  const trimmed = value?.trim();
  return isSessionTemplateFormatTag(trimmed) ? trimmed : null;
}

export function normalizeSessionTemplateModalityTag(
  value: string | null | undefined,
): SessionTemplateModalityTag | null {
  const trimmed = value?.trim();
  return isSessionTemplateModalityTag(trimmed) ? trimmed : null;
}

export function sessionTemplateTagLabel(tag: SessionTemplateTag | null | undefined) {
  return tag ?? UNTAGGED_TEMPLATE_LABEL;
}

export function buildSessionTemplateName(input: {
  tag: SessionTemplateTag;
  formatTag?: SessionTemplateFormatTag | null;
  modalityTag?: SessionTemplateModalityTag | null;
  exerciseHint?: string | null;
}) {
  const parts: string[] = [input.tag];
  if (input.modalityTag) parts.push(input.modalityTag);
  if (input.formatTag) parts.push(input.formatTag);
  const hint = input.exerciseHint?.trim();
  if (hint) parts.push(hint.length > 48 ? `${hint.slice(0, 45)}…` : hint);
  return parts.join(' · ');
}

/** Orden de grupos en listados: etiquetas de zona y, al final, sin etiqueta. */
export function groupTemplatesByTag<T extends { tag?: SessionTemplateTag | null }>(
  templates: T[],
): Array<{ tag: SessionTemplateTag | null; label: string; templates: T[] }> {
  const buckets = new Map<string, T[]>();

  for (const template of templates) {
    const key = template.tag ?? UNTAGGED_TEMPLATE_LABEL;
    const list = buckets.get(key) ?? [];
    list.push(template);
    buckets.set(key, list);
  }

  const groups: Array<{ tag: SessionTemplateTag | null; label: string; templates: T[] }> = [];

  for (const tag of SESSION_TEMPLATE_ZONE_TAGS) {
    const list = buckets.get(tag);
    if (!list?.length) continue;
    groups.push({ tag, label: tag, templates: list });
  }

  const untagged = buckets.get(UNTAGGED_TEMPLATE_LABEL);
  if (untagged?.length) {
    groups.push({ tag: null, label: UNTAGGED_TEMPLATE_LABEL, templates: untagged });
  }

  return groups;
}

export function groupTemplatesByFormatTag<
  T extends { formatTag?: SessionTemplateFormatTag | null },
>(templates: T[]): Array<{ formatTag: SessionTemplateFormatTag | null; label: string; templates: T[] }> {
  const buckets = new Map<string, T[]>();

  for (const template of templates) {
    const key = template.formatTag ?? UNTAGGED_FORMAT_LABEL;
    const list = buckets.get(key) ?? [];
    list.push(template);
    buckets.set(key, list);
  }

  const groups: Array<{ formatTag: SessionTemplateFormatTag | null; label: string; templates: T[] }> = [];

  for (const formatTag of SESSION_TEMPLATE_FORMAT_TAGS) {
    const list = buckets.get(formatTag);
    if (!list?.length) continue;
    groups.push({ formatTag, label: formatTag, templates: list });
  }

  const untagged = buckets.get(UNTAGGED_FORMAT_LABEL);
  if (untagged?.length) {
    groups.push({ formatTag: null, label: UNTAGGED_FORMAT_LABEL, templates: untagged });
  }

  return groups;
}

export function groupTemplatesByModalityTag<
  T extends { modalityTag?: SessionTemplateModalityTag | null },
>(templates: T[]): Array<{ modalityTag: SessionTemplateModalityTag | null; label: string; templates: T[] }> {
  const buckets = new Map<string, T[]>();

  for (const template of templates) {
    const key = template.modalityTag ?? UNTAGGED_MODALITY_LABEL;
    const list = buckets.get(key) ?? [];
    list.push(template);
    buckets.set(key, list);
  }

  const groups: Array<{ modalityTag: SessionTemplateModalityTag | null; label: string; templates: T[] }> = [];

  for (const modalityTag of SESSION_TEMPLATE_MODALITY_TAGS) {
    const list = buckets.get(modalityTag);
    if (!list?.length) continue;
    groups.push({ modalityTag, label: modalityTag, templates: list });
  }

  const untagged = buckets.get(UNTAGGED_MODALITY_LABEL);
  if (untagged?.length) {
    groups.push({ modalityTag: null, label: UNTAGGED_MODALITY_LABEL, templates: untagged });
  }

  return groups;
}
