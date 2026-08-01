import { fetchNonAthleteProfiles } from '@/lib/athleteService';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AthleteSummary, CrmLeadPosition, CrmStage, UserRole } from '@/lib/types';

const STAGES_TABLE = 'trainer_crm_stages';
const LEADS_TABLE = 'trainer_crm_leads';

const DEFAULT_CRM_STAGES: Array<{ name: string; roleSlug?: UserRole }> = [
  { name: 'Registrado' },
  { name: 'Contactado' },
  { name: 'Propuesta enviada' },
  { name: 'Cliente activo' },
  { name: 'Rol entrenador', roleSlug: 'entrenador' },
];

export const DEFAULT_CRM_STAGE_NAMES = DEFAULT_CRM_STAGES.map((stage) => stage.name);

export interface CrmBoardData {
  stages: CrmStage[];
  positions: Map<string, CrmLeadPosition>;
  /** Leads del tablero que ya no son atletas (promocionados a entrenador). */
  promotedLeads: AthleteSummary[];
  /** Fichas que el entrenador ha quitado del tablero. */
  archivedLeadIds: Set<string>;
  /** false si la tabla real aún no existe en Supabase (falta ejecutar la migración) */
  persistent: boolean;
}

// ---- Almacén local en memoria (modo demo o respaldo si la tabla no existe todavía) ----
const localStagesByTrainer = new Map<string, CrmStage[]>();
const localPositionsByTrainer = new Map<string, Map<string, CrmLeadPosition>>();
const localRolesByAthlete = new Map<string, UserRole>();
const localArchivedByTrainer = new Map<string, Set<string>>();

function buildDefaultStages(): CrmStage[] {
  return DEFAULT_CRM_STAGES.map((stage, index) => ({
    id: `local-stage-${index}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: stage.name,
    position: index,
    roleSlug: stage.roleSlug,
  }));
}

function mapStageRow(row: Record<string, unknown>): CrmStage {
  const roleSlug = row.role_slug as string | null | undefined;

  return {
    id: row.id as string,
    name: row.name as string,
    position: row.position as number,
    roleSlug: roleSlug === 'atleta' || roleSlug === 'entrenador' ? roleSlug : undefined,
  };
}

/** Rol aplicado en modo local/demo, donde no se puede tocar la tabla Perfil. */
export function getLocalLeadRole(athleteId: string): UserRole | undefined {
  return localRolesByAthlete.get(athleteId);
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

function getLocalArchived(trainerId: string): Set<string> {
  let archived = localArchivedByTrainer.get(trainerId);
  if (!archived) {
    archived = new Set();
    localArchivedByTrainer.set(trainerId, archived);
  }
  return archived;
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

function localBoard(trainerId: string, persistent: boolean): CrmBoardData {
  return {
    stages: getLocalStages(trainerId),
    positions: getLocalPositions(trainerId),
    promotedLeads: [],
    archivedLeadIds: getLocalArchived(trainerId),
    persistent,
  };
}

function isMissingArchivedColumnError(error: { message?: string } | null | undefined) {
  return (error?.message ?? '').toLowerCase().includes('archived_at');
}

export async function fetchCrmBoard(trainerId: string, isDemoMode: boolean): Promise<CrmBoardData> {
  if (isDemoMode || !isSupabaseConfigured) {
    return localBoard(trainerId, isDemoMode);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return localBoard(trainerId, false);
  }

  const { data: stageRows, error: stageError } = await supabase
    .from(STAGES_TABLE)
    .select('id, name, position, role_slug')
    .eq('trainer_id', trainerId)
    .order('position', { ascending: true });

  if (isMissingTableError(stageError)) {
    return localBoard(trainerId, false);
  }

  let stages: CrmStage[] = (stageRows ?? []).map(mapStageRow);

  if (stages.length === 0) {
    stages = await createDefaultCrmStages(trainerId);
  }

  // La columna archived_at es opcional: si falta la migración, se lee sin ella.
  const selectLeads = (select: string) =>
    supabase.from(LEADS_TABLE).select(select).eq('trainer_id', trainerId);

  let leadResult = await selectLeads('athlete_id, stage_id, position, archived_at');
  if (leadResult.error && isMissingArchivedColumnError(leadResult.error)) {
    leadResult = await selectLeads('athlete_id, stage_id, position');
  }

  const leadRows = leadResult.data as Array<Record<string, unknown>> | null;
  const leadError = leadResult.error;

  const positions = new Map<string, CrmLeadPosition>();
  const archivedLeadIds = new Set<string>();

  if (!leadError && leadRows) {
    for (const row of leadRows) {
      const athleteId = row.athlete_id as string;

      if (row.archived_at) {
        archivedLeadIds.add(athleteId);
        continue;
      }

      if (!row.stage_id) continue;
      positions.set(athleteId, {
        stageId: row.stage_id as string,
        position: (row.position as number) ?? 0,
      });
    }
  }

  const promotedLeads = await fetchNonAthleteProfiles(Array.from(positions.keys()));

  return { stages, positions, promotedLeads, archivedLeadIds, persistent: true };
}

/** Quita la ficha del tablero del entrenador sin tocar la cuenta del atleta. */
export async function archiveCrmLead(
  trainerId: string,
  athleteId: string,
  useLocalStore: boolean,
): Promise<{ error?: string }> {
  if (useLocalStore) {
    getLocalArchived(trainerId).add(athleteId);
    getLocalPositions(trainerId).delete(athleteId);
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(LEADS_TABLE).upsert(
    {
      trainer_id: trainerId,
      athlete_id: athleteId,
      stage_id: null,
      position: 0,
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'trainer_id,athlete_id' },
  );

  if (error) {
    if (isMissingArchivedColumnError(error)) {
      return { error: 'Falta la migración del CRM en Supabase: ejecuta npm run supabase:crm-archived-leads' };
    }
    if (isMissingTableError(error)) {
      getLocalArchived(trainerId).add(athleteId);
      return {};
    }
    return { error: error.message };
  }

  return {};
}

/** Devuelve la ficha al tablero, a la primera columna. */
export async function restoreCrmLead(
  trainerId: string,
  athleteId: string,
  useLocalStore: boolean,
): Promise<{ error?: string }> {
  if (useLocalStore) {
    getLocalArchived(trainerId).delete(athleteId);
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase
    .from(LEADS_TABLE)
    .delete()
    .eq('trainer_id', trainerId)
    .eq('athlete_id', athleteId);

  if (error) return { error: error.message };
  return {};
}

export async function setCrmLeadRole(
  athleteId: string,
  role: UserRole,
  useLocalStore: boolean,
): Promise<{ error?: string }> {
  if (useLocalStore) {
    localRolesByAthlete.set(athleteId, role);
    return {};
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.rpc('set_crm_lead_role', { target_id: athleteId, new_role: role });

  if (error) {
    if (isMissingTableError(error)) {
      return { error: 'Falta la migración del CRM en Supabase: ejecuta npm run supabase:crm-role-stage' };
    }
    return { error: error.message };
  }

  return {};
}

async function createDefaultCrmStages(trainerId: string): Promise<CrmStage[]> {
  const defaults = buildDefaultStages();
  const supabase = getSupabase();
  if (!supabase) return defaults;

  const { data, error } = await supabase
    .from(STAGES_TABLE)
    .insert(
      defaults.map((stage) => ({
        trainer_id: trainerId,
        name: stage.name,
        position: stage.position,
        role_slug: stage.roleSlug ?? null,
      })),
    )
    .select('id, name, position, role_slug');

  if (error || !data) {
    return defaults;
  }

  return data.map(mapStageRow).sort((a, b) => a.position - b.position);
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
      .select('id, name, position, role_slug')
      .single();

    if (!error && data) {
      return mapStageRow(data);
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
