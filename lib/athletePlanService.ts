import { mockAthletePlans } from '@/lib/mockData';
import type { PickedPlanPdf } from '@/lib/planPdfPicker';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AthletePlan, AthletePlanType } from '@/lib/types';

const TABLE = 'athlete_plans';
const PERFIL_TABLE = 'Perfil';
const PDF_BUCKET = 'athlete-plan-pdfs';
const SIGNED_URL_TTL = 60 * 60;

const PLAN_SELECT =
  'id, athlete_id, trainer_id, plan_type, title, content, created_at, pdf_storage_path, pdf_file_name';

let demoPlans: AthletePlan[] = [...mockAthletePlans];

function isMissingAthletePlansTableError(error: { message?: string; code?: string }) {
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('athlete_plans') &&
    (message.includes('schema cache') ||
      message.includes('does not exist') ||
      message.includes('could not find the table') ||
      message.includes('pdf_storage_path') ||
      error.code === 'PGRST205')
  );
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w.\-() ]+/g, '_').trim() || 'plan.pdf';
}

async function uriToArrayBuffer(uri: string) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('No se pudo leer el PDF seleccionado');
  }
  return response.arrayBuffer();
}

function mapRow(row: Record<string, unknown>, athleteName?: string): AthletePlan {
  return {
    id: row.id as string,
    athleteId: row.athlete_id as string,
    athleteName,
    trainerId: row.trainer_id as string,
    planType: row.plan_type as AthletePlanType,
    title: row.title as string,
    content: row.content as string,
    createdAt: row.created_at as string,
    pdfFileName: (row.pdf_file_name as string | null) ?? undefined,
  };
}

async function signedUrlForPdf(storagePath: string) {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase.storage
    .from(PDF_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  if (error || !data?.signedUrl) return undefined;
  return data.signedUrl;
}

async function attachPdfUrls(plans: AthletePlan[], rows: Record<string, unknown>[]): Promise<AthletePlan[]> {
  return Promise.all(
    plans.map(async (plan, index) => {
      const storagePath = rows[index]?.pdf_storage_path as string | null | undefined;
      if (!storagePath) return plan;

      const pdfUrl = await signedUrlForPdf(storagePath);
      return { ...plan, pdfUrl };
    }),
  );
}

async function attachAthleteNames(plans: AthletePlan[]): Promise<AthletePlan[]> {
  if (plans.length === 0) return plans;

  const supabase = getSupabase();
  if (!supabase) return plans;

  const athleteIds = [...new Set(plans.map((plan) => plan.athleteId))];
  const { data, error } = await supabase.from(PERFIL_TABLE).select('id, name').in('id', athleteIds);

  if (error || !data) return plans;

  const names = new Map(data.map((row) => [row.id as string, row.name as string]));
  return plans.map((plan) => ({
    ...plan,
    athleteName: names.get(plan.athleteId) ?? plan.athleteName,
  }));
}

async function uploadPlanPdf(
  athleteId: string,
  planId: string,
  pdf: PickedPlanPdf,
): Promise<{ storagePath: string; fileName: string }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase no está disponible');

  const fileName = sanitizeFileName(pdf.fileName);
  const storagePath = `${athleteId}/${planId}/${fileName}`;
  const fileData = await uriToArrayBuffer(pdf.uri);

  const { error: uploadError } = await supabase.storage.from(PDF_BUCKET).upload(storagePath, fileData, {
    contentType: pdf.mimeType,
    upsert: true,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  return { storagePath, fileName };
}

export async function fetchAthletePlansForUser(
  athleteId: string,
  planType?: AthletePlanType,
): Promise<AthletePlan[]> {
  if (!isSupabaseConfigured) {
    return demoPlans.filter(
      (plan) => plan.athleteId === athleteId && (!planType || plan.planType === planType),
    );
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from(TABLE)
    .select(PLAN_SELECT)
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false });

  if (planType) {
    query = query.eq('plan_type', planType);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingAthletePlansTableError(error)) return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const plans = rows.map((row) => mapRow(row));
  return attachPdfUrls(plans, rows);
}

export async function fetchTrainerAthletePlans(
  trainerId: string,
  planType?: AthletePlanType,
): Promise<AthletePlan[]> {
  if (!isSupabaseConfigured) {
    return demoPlans.filter(
      (plan) => plan.trainerId === trainerId && (!planType || plan.planType === planType),
    );
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from(TABLE)
    .select(PLAN_SELECT)
    .eq('trainer_id', trainerId)
    .order('created_at', { ascending: false });

  if (planType) {
    query = query.eq('plan_type', planType);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingAthletePlansTableError(error)) return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const plans = rows.map((row) => mapRow(row));
  const withNames = await attachAthleteNames(plans);
  return attachPdfUrls(withNames, rows);
}

export async function fetchAthletePlansForAthlete(
  athleteId: string,
  trainerId: string,
): Promise<AthletePlan[]> {
  if (!isSupabaseConfigured) {
    return demoPlans.filter((plan) => plan.athleteId === athleteId && plan.trainerId === trainerId);
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select(PLAN_SELECT)
    .eq('athlete_id', athleteId)
    .eq('trainer_id', trainerId)
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingAthletePlansTableError(error)) return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const plans = rows.map((row) => mapRow(row));
  return attachPdfUrls(plans, rows);
}

export async function createAthletePlan(input: {
  athleteId: string;
  trainerId: string;
  planType: AthletePlanType;
  title: string;
  content: string;
  athleteName?: string;
  pdf?: PickedPlanPdf;
}): Promise<AthletePlan> {
  const trimmedTitle = input.title.trim();
  const trimmedContent = input.content.trim();

  if (!trimmedTitle) {
    throw new Error('El título del plan es obligatorio');
  }

  if (!trimmedContent && !input.pdf) {
    throw new Error('Añade contenido al plan o adjunta un PDF');
  }

  if (!isSupabaseConfigured) {
    const plan: AthletePlan = {
      id: `plan-demo-${Date.now()}`,
      athleteId: input.athleteId,
      athleteName: input.athleteName,
      trainerId: input.trainerId,
      planType: input.planType,
      title: trimmedTitle,
      content: trimmedContent || 'Plan adjunto en PDF.',
      createdAt: new Date().toISOString(),
      pdfFileName: input.pdf?.fileName,
      pdfUrl: input.pdf ? input.pdf.uri : undefined,
    };
    demoPlans = [plan, ...demoPlans];
    return plan;
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase no configurado');

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      athlete_id: input.athleteId,
      trainer_id: input.trainerId,
      plan_type: input.planType,
      title: trimmedTitle,
      content: trimmedContent || 'Consulta el PDF adjunto para ver tu plan completo.',
    })
    .select(PLAN_SELECT)
    .single();

  if (error) throw new Error(error.message);

  let plan = mapRow(data as Record<string, unknown>, input.athleteName);

  if (input.pdf) {
    const uploaded = await uploadPlanPdf(input.athleteId, plan.id, input.pdf);
    const { error: updateError } = await supabase
      .from(TABLE)
      .update({
        pdf_storage_path: uploaded.storagePath,
        pdf_file_name: uploaded.fileName,
      })
      .eq('id', plan.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    plan = {
      ...plan,
      pdfFileName: uploaded.fileName,
      pdfUrl: await signedUrlForPdf(uploaded.storagePath),
    };
  }

  return plan;
}
