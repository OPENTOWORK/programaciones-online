import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  isIntakeSubmissionComplete,
  normalizeIntakeSchema,
  type AthleteIntakeFormStatus,
  type AthleteIntakeSubmission,
  type IntakeFormAnswers,
  type IntakeFormTemplate,
} from '@/lib/intakeFormTypes';
import {
  fetchActiveIntakeFormTemplates,
  fetchIntakeFormTemplates,
} from '@/lib/intakeFormTemplateService';

const TABLE = 'athlete_intake_submissions';
const LOCAL_STORAGE_KEY = 'athlete-intake-submissions-v1';
const SELECT = 'id, athlete_id, template_id, answers, completed_at, created_at, updated_at';

const demoSubmissions = new Map<string, AthleteIntakeSubmission>();

function submissionKey(athleteId: string, templateId: string) {
  return `${athleteId}:${templateId}`;
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

function mapRow(row: Record<string, unknown>): AthleteIntakeSubmission {
  const answers =
    row.answers && typeof row.answers === 'object' && !Array.isArray(row.answers)
      ? (row.answers as IntakeFormAnswers)
      : {};

  return {
    id: row.id as string,
    athleteId: row.athlete_id as string,
    templateId: row.template_id as string,
    answers,
    completedAt: (row.completed_at as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function readPersistedLocal(): Record<string, AthleteIntakeSubmission> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, AthleteIntakeSubmission>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePersistedLocal(all: Record<string, AthleteIntakeSubmission>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

function getLocalSubmission(athleteId: string, templateId: string) {
  const key = submissionKey(athleteId, templateId);
  return demoSubmissions.get(key) ?? readPersistedLocal()[key] ?? null;
}

function setLocalSubmission(submission: AthleteIntakeSubmission) {
  const key = submissionKey(submission.athleteId, submission.templateId);
  demoSubmissions.set(key, submission);
  const all = readPersistedLocal();
  all[key] = submission;
  writePersistedLocal(all);
}

export async function fetchAthleteIntakeSubmission(
  athleteId: string,
  templateId: string,
  useLocalStore: boolean,
): Promise<{ submission: AthleteIntakeSubmission | null; persistent: boolean }> {
  if (!athleteId || !templateId) return { submission: null, persistent: false };

  if (useLocalStore || !isSupabaseConfigured) {
    return { submission: getLocalSubmission(athleteId, templateId), persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { submission: getLocalSubmission(athleteId, templateId), persistent: false };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('athlete_id', athleteId)
    .eq('template_id', templateId)
    .maybeSingle();

  if (isMissingTableError(error)) {
    return { submission: getLocalSubmission(athleteId, templateId), persistent: false };
  }

  if (error || !data) return { submission: null, persistent: true };
  return { submission: mapRow(data as Record<string, unknown>), persistent: true };
}

export async function fetchAthleteIntakeSubmissions(
  athleteId: string,
  useLocalStore: boolean,
): Promise<{ submissions: AthleteIntakeSubmission[]; persistent: boolean }> {
  if (!athleteId) return { submissions: [], persistent: false };

  if (useLocalStore || !isSupabaseConfigured) {
    const local = readPersistedLocal();
    const submissions = Object.values(local).filter((entry) => entry.athleteId === athleteId);
    for (const submission of demoSubmissions.values()) {
      if (submission.athleteId === athleteId && !submissions.some((entry) => entry.id === submission.id)) {
        submissions.push(submission);
      }
    }
    return { submissions, persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) return { submissions: [], persistent: false };

  const { data, error } = await supabase.from(TABLE).select(SELECT).eq('athlete_id', athleteId);

  if (isMissingTableError(error)) return { submissions: [], persistent: false };
  if (error || !data) return { submissions: [], persistent: true };

  return {
    submissions: data.map((row) => mapRow(row as Record<string, unknown>)),
    persistent: true,
  };
}

export async function saveAthleteIntakeSubmission(input: {
  athleteId: string;
  template: IntakeFormTemplate;
  answers: IntakeFormAnswers;
  useLocalStore: boolean;
}): Promise<{ submission?: AthleteIntakeSubmission; error?: string }> {
  const complete = isIntakeSubmissionComplete(input.template.schema, input.answers);
  const nowIso = new Date().toISOString();

  if (input.useLocalStore || !isSupabaseConfigured) {
    const existing = getLocalSubmission(input.athleteId, input.template.id);
    const submission: AthleteIntakeSubmission = {
      id: existing?.id ?? `local-submission-${Date.now()}`,
      athleteId: input.athleteId,
      templateId: input.template.id,
      answers: input.answers,
      completedAt: complete ? nowIso : undefined,
      createdAt: existing?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };
    setLocalSubmission(submission);
    return { submission };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload = {
    athlete_id: input.athleteId,
    template_id: input.template.id,
    answers: input.answers,
    completed_at: complete ? nowIso : null,
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'athlete_id,template_id' })
    .select(SELECT)
    .single();

  if (error) {
    const message = isMissingTableError(error)
      ? 'Las tablas de formularios no están disponibles. Ejecuta: npm run supabase:intake-form-templates'
      : error.message;
    return { error: message };
  }

  return { submission: mapRow(data as Record<string, unknown>) };
}

export async function fetchAthleteIntakeFormStatuses(
  athleteId: string,
  isDemoMode: boolean,
  options?: { trainerId?: string; activeOnly?: boolean },
): Promise<{ statuses: AthleteIntakeFormStatus[]; persistent: boolean }> {
  const activeOnly = options?.activeOnly ?? true;
  const templatesResult = options?.trainerId
    ? await fetchIntakeFormTemplates(options.trainerId, isDemoMode)
    : await fetchActiveIntakeFormTemplates(isDemoMode);

  let templates = templatesResult.templates;
  if (activeOnly) {
    templates = templates.filter((template) => template.isActive);
  }

  const submissionsResult = await fetchAthleteIntakeSubmissions(athleteId, isDemoMode);
  const submissionByTemplate = new Map(
    submissionsResult.submissions.map((submission) => [submission.templateId, submission]),
  );

  const statuses: AthleteIntakeFormStatus[] = templates.map((template) => {
    const submission = submissionByTemplate.get(template.id) ?? null;
    const isComplete = submission
      ? isIntakeSubmissionComplete(template.schema, submission.answers)
      : false;
    return { template, submission, isComplete };
  });

  return {
    statuses,
    persistent: templatesResult.persistent && submissionsResult.persistent,
  };
}

export async function isDefaultIntakeFormComplete(
  athleteId: string,
  isDemoMode: boolean,
  trainerId?: string,
): Promise<boolean> {
  const { statuses } = await fetchAthleteIntakeFormStatuses(athleteId, isDemoMode, {
    trainerId,
    activeOnly: true,
  });
  const defaultStatus = statuses.find((status) => status.template.isDefault);
  if (!defaultStatus) return false;
  return defaultStatus.isComplete;
}
