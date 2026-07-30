import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { CrmLeadPosition, CrmStage } from '@/lib/types';

const STAGES_TABLE = 'trainer_crm_stages';
const LEADS_TABLE = 'trainer_crm_leads';

export const DEFAULT_CRM_STAGE_NAMES = ['Registrado', 'Contactado', 'Propuesta enviada', 'Cliente activo'];

export interface CrmBoardData {
  stages: CrmStage[];
  positions: Map<string, CrmLeadPosition>;
  /** false si la tabla real aún no existe en Supabase (falta ejecutar la migración) */
  persistent: boolean;
}

// ---- Almacén local en memoria (modo demo o respaldo si la tabla no existe todavía) ----
const localStagesByTrainer = new Map<string, CrmStage[]>();
const localPositionsByTrainer = new Map<string, Map<string, CrmLeadPosition>>();

function buildDefaultStages(): CrmStage[] {
  return DEFAULT_CRM_STAGE_NAMES.map((name, index) => ({
    id: `local-stage-${index}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    position: index,
  }));
}

function getLocalStages(trainerId: string): CrmStage[] {
  let stages = localStagesByTrainer.get(trainerId);
  if (!stages || stages.length === 0) {
    stages = buildDefaultStages();
    localStagesByTrainer.set(trainerId, stages);
  }
  return stages;
}

function getLocalPositions(trainerId: string): Map<string, CrmLeadPosition> {
  let positions = localPositionsByTrainer.get(trainerId);
  if (!positions) {
    positions = new Map();
    localPositionsByTrainer.set(trainerId, positions);
  }
  return positions;
}

function isLocalStageId(stageId: string) {
  return stageId.startsWith('local-stage-');
}

// ---- Detección de tabla ausente (migración SQL no aplicada todavía) ----
function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

export async function fetchCrmBoard(trainerId: string, isDemoMode: boolean): Promise<CrmBoardData> {
  if (isDemoMode || !isSupabaseConfigured) {
    return { stages: getLocalStages(trainerId), positions: getLocalPositions(trainerId), persistent: isDemoMode };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { stages: getLocalStages(trainerId), positions: getLocalPositions(trainerId), persistent: false };
  }

  const { data: stageRows, error: stageError } = await supabase
    .from(STAGES_TABLE)
    .select('id, name, position')
    .eq('trainer_id', trainerId)
    .order('position', { ascending: true });

  if (isMissingTableError(stageError)) {
    return { stages: getLocalStages(trainerId), positions: getLocalPositions(trainerId), persistent: false };
  }

  let stages: CrmStage[] = (stageRows ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    position: row.position as number,
  }));

  if (stages.length === 0) {
    stages = await createDefaultCrmStages(trainerId);
  }

  const { data: leadRows, error: leadError } = await supabase
    .from(LEADS_TABLE)
    .select('athlete_id, stage_id, position')
    .eq('trainer_id', trainerId);

  const positions = new Map<string, CrmLeadPosition>();
  if (!leadError && leadRows) {
    for (const row of leadRows) {
      if (!row.stage_id) continue;
      positions.set(row.athlete_id as string, {
        stageId: row.stage_id as string,
        position: (row.position as number) ?? 0,
      });
    }
  }

  return { stages, positions, persistent: true };
}

async function createDefaultCrmStages(trainerId: string): Promise<CrmStage[]> {
  const defaults = buildDefaultStages();
  const supabase = getSupabase();
  if (!supabase) return defaults;

  const { data, error } = await supabase
    .from(STAGES_TABLE)
    .insert(defaults.map((stage) => ({ trainer_id: trainerId, name: stage.name, position: stage.position })))
    .select('id, name, position');

  if (error || !data) {
    return defaults;
  }

  return data
    .map((row) => ({ id: row.id as string, name: row.name as string, position: row.position as number }))
    .sort((a, b) => a.position - b.position);
}

export async function createCrmStage(
  trainerId: string,
  name: string,
  position: number,
  useLocalStore: boolean,
): Promise<CrmStage> {
  const trimmed = name.trim() || 'Sin nombre';

  if (useLocalStore) {
    const stage: CrmStage = { id: `local-stage-${Date.now()}`, name: trimmed, position };
    getLocalStages(trainerId).push(stage);
    return stage;
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from(STAGES_TABLE)
      .insert({ trainer_id: trainerId, name: trimmed, position })
      .select('id, name, position')
      .single();

    if (!error && data) {
      return { id: data.id as string, name: data.name as string, position: data.position as number };
    }
  }

  const stage: CrmStage = { id: `local-stage-${Date.now()}`, name: trimmed, position };
  getLocalStages(trainerId).push(stage);
  return stage;
}

export async function renameCrmStage(
  trainerId: string,
  stageId: string,
  name: string,
  useLocalStore: boolean,
): Promise<void> {
  const trimmed = name.trim() || 'Sin nombre';

  if (useLocalStore || isLocalStageId(stageId)) {
    const stage = getLocalStages(trainerId).find((item) => item.id === stageId);
    if (stage) stage.name = trimmed;
    return;
  }

  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from(STAGES_TABLE).update({ name: trimmed }).eq('id', stageId);
}

export async function deleteCrmStage(
  trainerId: string,
  stageId: string,
  fallbackStageId: string,
  useLocalStore: boolean,
): Promise<void> {
  if (useLocalStore || isLocalStageId(stageId)) {
    const stages = getLocalStages(trainerId);
    const index = stages.findIndex((item) => item.id === stageId);
    if (index >= 0) stages.splice(index, 1);

    const positions = getLocalPositions(trainerId);
    for (const [athleteId, pos] of positions) {
      if (pos.stageId === stageId) {
        positions.set(athleteId, { stageId: fallbackStageId, position: 0 });
      }
    }
    return;
  }

  const supabase = getSupabase();
  if (!supabase) return;

  await supabase
    .from(LEADS_TABLE)
    .update({ stage_id: fallbackStageId })
    .eq('trainer_id', trainerId)
    .eq('stage_id', stageId);

  await supabase.from(STAGES_TABLE).delete().eq('id', stageId);
}

export async function reorderCrmStages(
  trainerId: string,
  stages: CrmStage[],
  useLocalStore: boolean,
): Promise<void> {
  if (useLocalStore || stages.some((stage) => isLocalStageId(stage.id))) {
    const store = getLocalStages(trainerId);
    for (const stage of stages) {
      const existing = store.find((item) => item.id === stage.id);
      if (existing) existing.position = stage.position;
    }
    return;
  }

  const supabase = getSupabase();
  if (!supabase) return;

  await Promise.all(
    stages.map((stage) => supabase.from(STAGES_TABLE).update({ position: stage.position }).eq('id', stage.id)),
  );
}

export async function saveCrmColumnOrder(
  trainerId: string,
  stageId: string,
  orderedAthleteIds: string[],
  useLocalStore: boolean,
): Promise<void> {
  if (orderedAthleteIds.length === 0) return;

  if (useLocalStore || isLocalStageId(stageId)) {
    const positions = getLocalPositions(trainerId);
    orderedAthleteIds.forEach((athleteId, index) => {
      positions.set(athleteId, { stageId, position: index });
    });
    return;
  }

  const supabase = getSupabase();
  if (!supabase) return;

  const rows = orderedAthleteIds.map((athleteId, index) => ({
    trainer_id: trainerId,
    athlete_id: athleteId,
    stage_id: stageId,
    position: index,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from(LEADS_TABLE).upsert(rows, { onConflict: 'trainer_id,athlete_id' });

  if (isMissingTableError(error)) {
    const positions = getLocalPositions(trainerId);
    orderedAthleteIds.forEach((athleteId, index) => {
      positions.set(athleteId, { stageId, position: index });
    });
  }
}
