import { mockAthletePlans } from '@/lib/mockData';
import { buildNutritionSummaryText, hasNutritionContent, sanitizeNutritionPlan } from '@/lib/nutritionPlanContent';
import type { PickedPlanPdf } from '@/lib/planPdfPicker';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { addCrmActivity, buildPlanAssignedMessage } from '@/lib/trainerCrmActivity';
import type { AthletePlan, AthletePlanType, NutritionPlanData } from '@/lib/types';

const TABLE = 'athlete_plans';
const PERFIL_TABLE = 'Perfil';
const PDF_BUCKET = 'athlete-plan-pdfs';
const SIGNED_URL_TTL = 60 * 60;

const PLAN_SELECT_BASE =
  'id, athlete_id, trainer_id, plan_type, title, content, nutrition_data, created_at, pdf_storage_path, pdf_file_name';
const PLAN_SELECT_FULL = `${PLAN_SELECT_BASE}, plan_group_id, session_number`;

let demoPlans: AthletePlan[] = [...mockAthletePlans];

function isMissingOptionalPlanColumnError(error: { message?: string }) {
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('plan_group_id') ||
    message.includes('session_number') ||
    (message.includes('schema cache') &&
      (message.includes('plan_group_id') || message.includes('session_number')))
  );
}

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

async function selectPlanRows<T>(
  run: (select: string) => PromiseLike<{ data: T; error: { message?: string; code?: string } | null }>,
) {
  const full = await run(PLAN_SELECT_FULL);
  if (!full.error) {
    return full;
  }
  if (isMissingOptionalPlanColumnError(full.error)) {
    return run(PLAN_SELECT_BASE);
  }
  return full;
}

async function selectPlanRow(
  run: (select: string) => PromiseLike<{ data: unknown; error: { message?: string; code?: string } | null }>,
) {
  return selectPlanRows(run);
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
    planGroupId: (row.plan_group_id as string | null | undefined) ?? undefined,
    sessionNumber: (row.session_number as number | null | undefined) ?? undefined,
    nutritionData: (row.nutrition_data as NutritionPlanData | null) ?? undefined,
    createdAt: row.created_at as string,
    pdfFileName: (row.pdf_file_name as string | null) ?? undefined,
  };
}

function withSessionMetadata(
  plan: AthletePlan,
  sessionNumber: number,
  planGroupId?: string | null,
): AthletePlan {
  return {
    ...plan,
    sessionNumber: plan.sessionNumber ?? sessionNumber,
    planGroupId: plan.planGroupId ?? planGroupId ?? plan.id,
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

  const { data, error } = await selectPlanRows((select) => {
    let query = supabase
      .from(TABLE)
      .select(select)
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false });

    if (planType) {
      query = query.eq('plan_type', planType);
    }

    return query;
  });
  if (error) {
    if (isMissingAthletePlansTableError(error)) return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const plans = rows.map((row) => mapRow(row));
  return attachPdfUrls(plans, rows);
}

/** Los entrenadores trabajan en equipo, así que la lista incluye las de todos. */
export async function fetchTrainerAthletePlans(planType?: AthletePlanType): Promise<AthletePlan[]> {
  if (!isSupabaseConfigured) {
    return demoPlans.filter((plan) => !planType || plan.planType === planType);
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await selectPlanRows((select) => {
    let query = supabase.from(TABLE).select(select).order('created_at', { ascending: false });

    if (planType) {
      query = query.eq('plan_type', planType);
    }

    return query;
  });
  if (error) {
    if (isMissingAthletePlansTableError(error)) return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const plans = rows.map((row) => mapRow(row));
  const withNames = await attachAthleteNames(plans);
  return attachPdfUrls(withNames, rows);
}

export async function fetchAthletePlanById(planId: string): Promise<AthletePlan | null> {
  if (!isSupabaseConfigured) {
    return demoPlans.find((plan) => plan.id === planId) ?? null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await selectPlanRow((select) =>
    supabase.from(TABLE).select(select).eq('id', planId).maybeSingle(),
  );

  if (error) {
    if (isMissingAthletePlansTableError(error)) return null;
    throw new Error(error.message);
  }

  if (!data) return null;

  const row = data as Record<string, unknown>;
  const [plan] = await attachAthleteNames([mapRow(row)]);
  const [withPdf] = await attachPdfUrls([plan], [row]);
  return withPdf;
}

export async function fetchAthletePlansForAthlete(athleteId: string): Promise<AthletePlan[]> {
  if (!isSupabaseConfigured) {
    return demoPlans.filter((plan) => plan.athleteId === athleteId);
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await selectPlanRows((select) =>
    supabase
      .from(TABLE)
      .select(select)
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false }),
  );

  if (error) {
    if (isMissingAthletePlansTableError(error)) return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const plans = rows.map((row) => mapRow(row));
  return attachPdfUrls(plans, rows);
}

export async function createAthletePlan(input: {
  athleteId: string;
  trainerId: string;
  planType: AthletePlanType;
  title: string;
  content: string;
  planGroupId?: string;
  sessionNumber?: number;
  nutritionData?: NutritionPlanData;
  athleteName?: string;
  pdf?: PickedPlanPdf;
}): Promise<AthletePlan> {
  const trimmedTitle = input.title.trim();
  const trimmedContent = input.content.trim();
  const sanitizedNutrition = input.nutritionData ? sanitizeNutritionPlan(input.nutritionData) : undefined;
  const nutritionHasContent = sanitizedNutrition ? hasNutritionContent(sanitizedNutrition) : false;

  if (!trimmedTitle) {
    throw new Error('El título del plan es obligatorio');
  }

  if (!trimmedContent && !input.pdf && !nutritionHasContent) {
    throw new Error(
      input.planType === 'nutrition'
        ? 'Añade al menos una comida, tus macros o adjunta un PDF'
        : 'Añade contenido al plan o adjunta un PDF',
    );
  }

  const finalContent =
    trimmedContent || (nutritionHasContent ? buildNutritionSummaryText(sanitizedNutrition!) : '');

  const sessionNumber = input.sessionNumber ?? 1;

  if (!isSupabaseConfigured) {
    const id = `plan-demo-${Date.now()}`;
    const plan: AthletePlan = {
      id,
      athleteId: input.athleteId,
      athleteName: input.athleteName,
      trainerId: input.trainerId,
      planType: input.planType,
      title: trimmedTitle,
      content: finalContent || 'Plan adjunto en PDF.',
      planGroupId: input.planGroupId ?? id,
      sessionNumber,
      nutritionData: nutritionHasContent ? sanitizedNutrition : undefined,
      createdAt: new Date().toISOString(),
      pdfFileName: input.pdf?.fileName,
      pdfUrl: input.pdf ? input.pdf.uri : undefined,
    };
    demoPlans = [plan, ...demoPlans];
    void addCrmActivity(
      input.trainerId,
      input.athleteId,
      buildPlanAssignedMessage(input.planType, trimmedTitle, sessionNumber),
      'plan_assigned',
      true,
    );
    return plan;
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase no configurado');

  const insertBase = {
    athlete_id: input.athleteId,
    trainer_id: input.trainerId,
    plan_type: input.planType,
    title: trimmedTitle,
    content: finalContent || 'Consulta el PDF adjunto para ver tu plan completo.',
    nutrition_data: nutritionHasContent ? sanitizedNutrition : null,
  };

  let { data, error } = await supabase
    .from(TABLE)
    .insert({
      ...insertBase,
      plan_group_id: input.planGroupId ?? null,
      session_number: sessionNumber,
    })
    .select(PLAN_SELECT_FULL)
    .single();

  if (error && isMissingOptionalPlanColumnError(error)) {
    ({ data, error } = await supabase.from(TABLE).insert(insertBase).select(PLAN_SELECT_BASE).single());
  }

  if (error) throw new Error(error.message);

  let plan = withSessionMetadata(
    mapRow(data as Record<string, unknown>, input.athleteName),
    sessionNumber,
    input.planGroupId,
  );

  if (!input.planGroupId) {
    const { data: grouped, error: groupError } = await supabase
      .from(TABLE)
      .update({ plan_group_id: plan.id })
      .eq('id', plan.id)
      .select(PLAN_SELECT_FULL)
      .single();

    if (!groupError && grouped) {
      plan = withSessionMetadata(
        mapRow(grouped as Record<string, unknown>, input.athleteName),
        sessionNumber,
        plan.id,
      );
    } else if (groupError && !isMissingOptionalPlanColumnError(groupError)) {
      throw new Error(groupError.message);
    } else {
      plan = withSessionMetadata(plan, sessionNumber, plan.id);
    }
  }

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

  void addCrmActivity(
    input.trainerId,
    input.athleteId,
    buildPlanAssignedMessage(input.planType, trimmedTitle, sessionNumber),
    'plan_assigned',
    false,
  );

  return plan;
}

export async function updateAthletePlan(
  planId: string,
  input: {
    athleteId: string;
    planType: AthletePlanType;
    title: string;
    content: string;
    nutritionData?: NutritionPlanData;
    pdf?: PickedPlanPdf;
    removePdf?: boolean;
  },
): Promise<AthletePlan> {
  const trimmedTitle = input.title.trim();
  const trimmedContent = input.content.trim();
  const sanitizedNutrition = input.nutritionData ? sanitizeNutritionPlan(input.nutritionData) : undefined;
  const nutritionHasContent = sanitizedNutrition ? hasNutritionContent(sanitizedNutrition) : false;

  if (!trimmedTitle) {
    throw new Error('El título del plan es obligatorio');
  }

  if (!trimmedContent && !input.pdf && !nutritionHasContent) {
    throw new Error(
      input.planType === 'nutrition'
        ? 'Añade al menos una comida, tus macros o adjunta un PDF'
        : 'Añade contenido al plan o adjunta un PDF',
    );
  }

  const finalContent =
    trimmedContent || (nutritionHasContent ? buildNutritionSummaryText(sanitizedNutrition!) : '') || 'Consulta el PDF adjunto para ver tu plan completo.';

  if (!isSupabaseConfigured) {
    let updated: AthletePlan | undefined;
    demoPlans = demoPlans.map((plan) => {
      if (plan.id !== planId) return plan;
      updated = {
        ...plan,
        title: trimmedTitle,
        content: finalContent,
        nutritionData: nutritionHasContent ? sanitizedNutrition : undefined,
        pdfFileName: input.removePdf ? undefined : input.pdf?.fileName ?? plan.pdfFileName,
        pdfUrl: input.removePdf ? undefined : input.pdf ? input.pdf.uri : plan.pdfUrl,
      };
      return updated;
    });
    if (!updated) throw new Error('Plan no encontrado');
    return updated;
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase no configurado');

  const updatePayload: Record<string, unknown> = {
    title: trimmedTitle,
    content: finalContent,
    nutrition_data: nutritionHasContent ? sanitizedNutrition : null,
  };

  if (input.removePdf) {
    updatePayload.pdf_storage_path = null;
    updatePayload.pdf_file_name = null;
  }

  if (input.pdf) {
    const uploaded = await uploadPlanPdf(input.athleteId, planId, input.pdf);
    updatePayload.pdf_storage_path = uploaded.storagePath;
    updatePayload.pdf_file_name = uploaded.fileName;
  }

  const { data, error } = await selectPlanRow((select) =>
    supabase.from(TABLE).update(updatePayload).eq('id', planId).select(select).maybeSingle(),
  );

  if (error) throw new Error(error.message);
  if (!data) throw new Error('No se pudo actualizar el plan');

  const row = data as Record<string, unknown>;
  const [plan] = await attachPdfUrls([mapRow(row)], [row]);
  return plan;
}

export async function deleteAthletePlan(planId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    demoPlans = demoPlans.filter((plan) => plan.id !== planId);
    return;
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase no configurado');

  const { error } = await supabase.from(TABLE).delete().eq('id', planId);
  if (error) throw new Error(error.message);
}
