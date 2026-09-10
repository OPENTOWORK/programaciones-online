import { INTAKE_GOAL_OPTIONS } from '@/lib/types';

export type IntakeFormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'single_select'
  | 'multi_select'
  | 'yes_no'
  | 'yes_no_detail';

export interface IntakeFormField {
  id: string;
  type: IntakeFormFieldType;
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
}

export interface IntakeFormSchema {
  fields: IntakeFormField[];
}

export type IntakeFormAnswers = Record<string, unknown>;

export interface IntakeFormTemplate {
  id: string;
  trainerId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  schema: IntakeFormSchema;
  createdAt: string;
  updatedAt: string;
}

export interface AthleteIntakeSubmission {
  id: string;
  athleteId: string;
  templateId: string;
  answers: IntakeFormAnswers;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AthleteIntakeFormStatus {
  template: IntakeFormTemplate;
  submission: AthleteIntakeSubmission | null;
  isComplete: boolean;
}

export const INTAKE_FIELD_TYPE_LABELS: Record<IntakeFormFieldType, string> = {
  text: 'Texto corto',
  textarea: 'Texto largo',
  number: 'Número',
  single_select: 'Opción única',
  multi_select: 'Opción múltiple',
  yes_no: 'Sí / No',
  yes_no_detail: 'Sí / No con detalle',
};

export function createEmptyIntakeField(type: IntakeFormFieldType = 'text'): IntakeFormField {
  const id = `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const base: IntakeFormField = { id, type, label: '', required: false };

  if (type === 'single_select' || type === 'multi_select') {
    return { ...base, options: ['Opción 1', 'Opción 2'] };
  }

  return base;
}

export const DEFAULT_WELCOME_INTAKE_SCHEMA: IntakeFormSchema = {
  fields: [
    {
      id: 'goals',
      type: 'multi_select',
      label: 'Objetivos de entrenamiento',
      required: true,
      options: [...INTAKE_GOAL_OPTIONS],
    },
    {
      id: 'goals_other',
      type: 'text',
      label: 'Otros objetivos (opcional)',
      required: false,
    },
    {
      id: 'experience',
      type: 'textarea',
      label: 'Experiencia en gimnasios o deporte',
      required: true,
    },
    {
      id: 'training_place',
      type: 'single_select',
      label: '¿Dónde entrenas?',
      required: true,
      options: ['Gimnasio', 'Casa', 'Gimnasio y casa'],
    },
    {
      id: 'equipment',
      type: 'textarea',
      label: 'Equipamiento deportivo disponible',
      description: 'Indica lo que tienes o escribe "ninguno".',
      required: true,
    },
    {
      id: 'availability',
      type: 'textarea',
      label: 'Disponibilidad para entrenar',
      required: true,
    },
    {
      id: 'pushups_reps',
      type: 'number',
      label: 'Flexiones en una tirada',
      required: true,
    },
    {
      id: 'squats_reps',
      type: 'number',
      label: 'Sentadillas en una tirada',
      required: true,
    },
    {
      id: 'pullups_reps',
      type: 'number',
      label: 'Dominadas en una tirada (0 si no puedes)',
      required: true,
    },
    {
      id: 'has_injuries',
      type: 'yes_no_detail',
      label: '¿Tienes o has tenido alguna lesión?',
      required: true,
    },
    {
      id: 'takes_medication',
      type: 'yes_no',
      label: '¿Tomas algún medicamento relevante?',
      required: true,
    },
    {
      id: 'had_surgery',
      type: 'yes_no',
      label: '¿Has tenido cirugías relevantes?',
      required: true,
    },
    {
      id: 'has_medical_condition',
      type: 'yes_no',
      label: '¿Tienes alguna condición médica relevante?',
      required: true,
    },
  ],
};

export function normalizeIntakeSchema(raw: unknown): IntakeFormSchema {
  if (!raw || typeof raw !== 'object') return { fields: [] };
  const fields = (raw as { fields?: unknown }).fields;
  if (!Array.isArray(fields)) return { fields: [] };

  const allowedTypes = new Set<string>(Object.keys(INTAKE_FIELD_TYPE_LABELS));

  return {
    fields: fields
      .filter((entry): entry is Record<string, unknown> => entry && typeof entry === 'object')
      .map((entry) => {
        const type = String(entry.type ?? 'text');
        const normalizedType = allowedTypes.has(type) ? (type as IntakeFormFieldType) : 'text';
        const options = Array.isArray(entry.options)
          ? entry.options.map((option) => String(option).trim()).filter(Boolean)
          : undefined;

        return {
          id: String(entry.id ?? createEmptyIntakeField(normalizedType).id),
          type: normalizedType,
          label: String(entry.label ?? '').trim(),
          description: typeof entry.description === 'string' ? entry.description.trim() : undefined,
          required: Boolean(entry.required),
          options,
        };
      }),
  };
}

export function isIntakeAnswerPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if ('value' in record && typeof record.value === 'boolean') {
      if (record.value && 'detail' in record) {
        return typeof record.detail === 'string' && record.detail.trim().length > 0;
      }
      return true;
    }
  }
  return false;
}

export function isIntakeSubmissionComplete(
  schema: IntakeFormSchema,
  answers: IntakeFormAnswers,
): boolean {
  for (const field of schema.fields) {
    if (!field.required) continue;
    const value = answers[field.id];
    if (!isIntakeAnswerPresent(value)) return false;

    if (field.type === 'yes_no_detail') {
      const record = value as { value?: boolean; detail?: string };
      if (record?.value === true && !record.detail?.trim()) return false;
    }
  }
  return schema.fields.length > 0;
}

export function formatIntakeAnswerValue(field: IntakeFormField, value: unknown): string {
  if (value === undefined || value === null) return 'No indicado';

  if (field.type === 'yes_no') {
    if (typeof value !== 'boolean') return 'No indicado';
    return value ? 'Sí' : 'No';
  }

  if (field.type === 'yes_no_detail') {
    const record = value as { value?: boolean; detail?: string };
    if (typeof record?.value !== 'boolean') return 'No indicado';
    if (!record.value) return 'No';
    return record.detail?.trim() ? `Sí — ${record.detail.trim()}` : 'Sí';
  }

  if (field.type === 'multi_select' && Array.isArray(value)) {
    return value.map(String).join(', ') || 'No indicado';
  }

  if (field.type === 'number' && typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    return value.trim() || 'No indicado';
  }

  return String(value);
}

export function validateIntakeAnswers(
  schema: IntakeFormSchema,
  answers: IntakeFormAnswers,
): string | null {
  for (const field of schema.fields) {
    if (!field.required) continue;
    const value = answers[field.id];

    if (!isIntakeAnswerPresent(value)) {
      return `Completa: ${field.label || 'campo obligatorio'}.`;
    }

    if (field.type === 'yes_no_detail') {
      const record = value as { value?: boolean; detail?: string };
      if (record?.value === true && !record.detail?.trim()) {
        return `Indica el detalle de: ${field.label}.`;
      }
    }
  }

  return null;
}
