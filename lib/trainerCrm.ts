import {
  fetchAssignedAthleteIds,
  fetchAthleteIdsAssignedToOtherTrainers,
  fetchAthleteSummariesByIds,
  fetchLeadOwnerMap,
  fetchNonAthleteProfiles,
  fetchProfileNamesByIds,
  fetchTeamStaffProfiles,
  isAdminRole,
} from '@/lib/athleteService';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AthleteSummary, CrmLeadPosition, CrmStage, UserRole } from '@/lib/types';

/* Cada entrenador tiene su propio tablero (`trainer_id`). El administrador ve los atletas
 * asignados a otros en la columna de sistema "Cliente cedido", sin gestionarlos. */
const STAGES_TABLE = 'trainer_crm_stages';
const LEADS_TABLE = 'trainer_crm_leads';
const STAGE_SELECT = 'id, name, position, role_slug, system_key';

export const CEDED_CLIENT_STAGE_KEY = 'ceded_client';
export const CEDED_CLIENT_STAGE_NAME = 'Cliente cedido';
export const GYMS_STAGE_KEY = 'gyms';
export const GYMS_STAGE_NAME = 'Gimnasios';

const DEFAULT_CRM_STAGES: Array<{ name: string; roleSlug?: UserRole }> = [
  { name: 'Registrado' },
  { name: 'Contactado' },
  { name: 'Propuesta enviada' },
  { name: 'Cliente activo' },
  { name: 'Rol entrenador', roleSlug: 'entrenador' },
  { name: 'Rol administrador', roleSlug: 'administrador' },
];

export const DEFAULT_CRM_STAGE_NAMES = DEFAULT_CRM_STAGES.map((stage) => stage.name);

const ROLE_STAGES_TO_ENSURE: Array<{ name: string; roleSlug: UserRole }> = [
  { name: 'Rol entrenador', roleSlug: 'entrenador' },
  { name: 'Rol administrador', roleSlug: 'administrador' },
];

export interface CrmBoardData {
  stages: CrmStage[];
  positions: Map<string, CrmLeadPosition>;
  /** Leads del tablero que ya no son atletas (promocionados a entrenador). */
  promotedLeads: AthleteSummary[];
  /** Fichas que se han quitado del tablero. */
  archivedLeadIds: Set<string>;
  /** Atletas de otros entrenadores (solo administrador, columna Cliente cedido). */
  cededLeads: AthleteSummary[];
  /** false si la tabla real aún no existe en Supabase (falta ejecutar la migración) */
  persistent: boolean;
}

// ---- Almacén local en memoria (modo demo o respaldo si la tabla no existe todavía) ----
const localStagesByTrainer = new Map<string, CrmStage[]>();
const localPositionsByTrainer = new Map<string, Map<string, CrmLeadPosition>>();
const localRolesByAthlete = new Map<string, UserRole>();
const localArchivedByTrainer = new Map<string, Set<string>>();

function buildDefaultStages(options?: { includeRoleStages?: boolean }): CrmStage[] {
  const source = options?.includeRoleStages === false
    ? DEFAULT_CRM_STAGES.filter((stage) => !stage.roleSlug)
    : DEFAULT_CRM_STAGES;

  return source.map((stage, index) => ({
    id: `local-stage-${index}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: stage.name,
    position: index,
    roleSlug: stage.roleSlug,
  }));
}

function ensureLocalRoleStages(trainerId: string, stages: CrmStage[]): CrmStage[] {
  let result = [...stages];
  let nextPosition = Math.max(...result.map((stage) => stage.position), -1) + 1;

  for (const desired of ROLE_STAGES_TO_ENSURE) {
    if (result.some((stage) => stage.roleSlug === desired.roleSlug)) continue;

    result.push({
      id: `local-stage-${desired.roleSlug}-${Date.now()}`,
      name: desired.name,
      position: nextPosition,
      roleSlug: desired.roleSlug,
    });
    nextPosition += 1;
  }

  const sorted = result.sort((a, b) => a.position - b.position);
  localStagesByTrainer.set(trainerId, sorted);
  return sorted;
}

/* Dos cargas simultáneas del tablero (arranque + refresco al enfocar) creaban la misma columna de
 * rol dos veces, así que la sincronización se comparte mientras está en marcha. */
const roleStageSyncInFlight = new Map<string, Promise<CrmStage[]>>();

function syncRoleStages(trainerId: string, stageRows: Array<Record<string, unknown>>): Promise<CrmStage[]> {
  const running = roleStageSyncInFlight.get(trainerId);
  if (running) return running;

  const task = runRoleStageSync(trainerId, stageRows).finally(() => {
    roleStageSyncInFlight.delete(trainerId);
  });

  roleStageSyncInFlight.set(trainerId, task);
  return task;
}

function stageMatchesRoleStage(stage: CrmStage, desired: { name: string; roleSlug: UserRole }) {
  return stage.roleSlug === desired.roleSlug || stage.name.trim() === desired.name;
}

async function runRoleStageSync(
  trainerId: string,
  stageRows: Array<Record<string, unknown>>,
): Promise<CrmStage[]> {
  const stages = stageRows.map(mapStageRow);
  const supabase = getSupabase();
  if (!supabase) return stages;

  const rawRoleSlugById = new Map(
    stageRows.map((row) => [row.id as string, (row.role_slug as string | null) ?? null]),
  );

  let result = [...stages];

  for (const desired of ROLE_STAGES_TO_ENSURE) {
    const matches = result
      .filter((stage) => stageMatchesRoleStage(stage, desired))
      .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));

    if (matches.length === 0) {
      const created = await insertRoleStage(trainerId, desired, maxPosition(result) + 1);
      if (created) result.push(created);
      continue;
    }

    const [survivor, ...duplicates] = matches;

    if (rawRoleSlugById.get(survivor.id) !== desired.roleSlug) {
      await supabase.from(STAGES_TABLE).update({ role_slug: desired.roleSlug }).eq('id', survivor.id);
    }

    for (const duplicate of duplicates) {
      await supabase.from(LEADS_TABLE).update({ stage_id: survivor.id }).eq('stage_id', duplicate.id);
      const { error } = await supabase.from(STAGES_TABLE).delete().eq('id', duplicate.id);
      if (!error) {
        result = result.filter((stage) => stage.id !== duplicate.id);
      }
    }
  }

  return result.sort((a, b) => a.position - b.position);
}

function maxPosition(stages: CrmStage[]) {
  return stages.reduce((max, stage) => Math.max(max, stage.position), -1);
}

async function insertRoleStage(
  trainerId: string,
  desired: { name: string; roleSlug: UserRole },
  position: number,
): Promise<CrmStage | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const insert = (roleSlug: UserRole | null) =>
    supabase
      .from(STAGES_TABLE)
      .insert({ trainer_id: trainerId, name: desired.name, position, role_slug: roleSlug })
      .select('id, name, position, role_slug')
      .single();

  // Sin la migración aplicada, el CHECK de la tabla rechaza el rol nuevo: la columna se crea sin él
  // y `mapStageRow` la reconoce por el nombre.
  let result = await insert(desired.roleSlug);
  if (result.error) {
    result = await insert(null);
  }

  return result.error || !result.data ? null : mapStageRow(result.data);
}

function resolveStaffBoardRole(member: AthleteSummary): UserRole {
  return member.role === 'administrador' ? 'administrador' : 'entrenador';
}

function findRoleStage(stages: CrmStage[], roleSlug: UserRole) {
  return stages.find((stage) => stage.roleSlug === roleSlug);
}

async function ensureTeamStaffInBoard(
  trainerId: string,
  stages: CrmStage[],
  positions: Map<string, CrmLeadPosition>,
  archivedLeadIds: Set<string>,
  useLocalStore: boolean,
): Promise<void> {
  const staff = await fetchTeamStaffProfiles();
  if (staff.length === 0) return;

  const supabase = getSupabase();

  for (const member of staff) {
    if (archivedLeadIds.has(member.id)) continue;

    const targetRole = resolveStaffBoardRole(member);
    const targetStage = findRoleStage(stages, targetRole);
    if (!targetStage) continue;

    const current = positions.get(member.id);
    if (current?.stageId === targetStage.id) continue;

    const columnSize = [...positions.values()].filter((pos) => pos.stageId === targetStage.id).length;
    positions.set(member.id, { stageId: targetStage.id, position: columnSize });

    if (useLocalStore || isLocalStageId(targetStage.id)) continue;

    if (!supabase) continue;

    await supabase.from(LEADS_TABLE).upsert(
      {
        trainer_id: trainerId,
        athlete_id: member.id,
        stage_id: targetStage.id,
        position: columnSize,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'athlete_id' },
    );
  }
}

export function isCededClientStage(stage?: Pick<CrmStage, 'name' | 'systemKey'> | null) {
  if (!stage) return false;
  return stage.systemKey === CEDED_CLIENT_STAGE_KEY || stage.name.trim() === CEDED_CLIENT_STAGE_NAME;
}

export function isGymsStage(stage?: Pick<CrmStage, 'name' | 'systemKey'> | null) {
  if (!stage) return false;
  return stage.systemKey === GYMS_STAGE_KEY || stage.name.trim() === GYMS_STAGE_NAME;
}

export function isReadOnlyCrmStage(stage?: Pick<CrmStage, 'name' | 'systemKey' | 'roleSlug'> | null) {
  return isCededClientStage(stage) || isGymsStage(stage);
}

export function firstAssignableCrmStage(stages: CrmStage[]) {
  return stages.find((stage) => !isRoleStage(stage) && !isReadOnlyCrmStage(stage)) ?? stages[0];
}

function arrangeCrmStages(stages: CrmStage[]) {
  const pipeline = stages
    .filter((stage) => !isRoleStage(stage) && !isReadOnlyCrmStage(stage))
    .sort((a, b) => a.position - b.position);
  const ceded = stages.filter((stage) => isCededClientStage(stage)).sort((a, b) => a.position - b.position);
  const roles = stages.filter((stage) => isRoleStage(stage)).sort((a, b) => a.position - b.position);
  const gyms = stages.filter((stage) => isGymsStage(stage)).sort((a, b) => a.position - b.position);

  return [...pipeline, ...ceded, ...roles, ...gyms].map((stage, position) => ({ ...stage, position }));
}

function mapStageRow(row: Record<string, unknown>): CrmStage {
  const roleSlug = row.role_slug as string | null | undefined;
  const name = row.name as string;
  const systemKey = row.system_key as string | null | undefined;

  const resolvedRoleSlug =
    roleSlug === 'atleta' || roleSlug === 'entrenador' || roleSlug === 'administrador'
      ? roleSlug
      : name === 'Rol administrador'
        ? 'administrador'
        : name === 'Rol entrenador'
          ? 'entrenador'
          : undefined;

  const resolvedSystemKey =
    systemKey === GYMS_STAGE_KEY || name.trim() === GYMS_STAGE_NAME
      ? GYMS_STAGE_KEY
      : systemKey === CEDED_CLIENT_STAGE_KEY || name.trim() === CEDED_CLIENT_STAGE_NAME
        ? CEDED_CLIENT_STAGE_KEY
        : undefined;

  return {
    id: row.id as string,
    name,
    position: row.position as number,
    roleSlug: resolvedRoleSlug,
    systemKey: resolvedSystemKey,
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

function isRoleStage(stage: CrmStage) {
  return stage.roleSlug === 'entrenador' || stage.roleSlug === 'administrador';
}

function filterStagesForViewer(stages: CrmStage[], viewerRole?: UserRole) {
  if (isAdminRole(viewerRole)) return stages;
  return stages.filter((stage) => !isRoleStage(stage) && !isReadOnlyCrmStage(stage));
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

function ensureLocalCededStage(trainerId: string, stages: CrmStage[]): CrmStage[] {
  if (stages.some((stage) => isCededClientStage(stage))) {
    localStagesByTrainer.set(trainerId, stages);
    return stages;
  }

  const withCeded = [
    ...stages,
    {
      id: `local-stage-${CEDED_CLIENT_STAGE_KEY}-${Date.now()}`,
      name: CEDED_CLIENT_STAGE_NAME,
      position: maxPosition(stages) + 1,
      systemKey: CEDED_CLIENT_STAGE_KEY as CrmStage['systemKey'],
    },
  ].sort((a, b) => a.position - b.position);

  localStagesByTrainer.set(trainerId, withCeded);
  return withCeded;
}

function ensureLocalGymsStage(trainerId: string, stages: CrmStage[]): CrmStage[] {
  if (stages.some((stage) => isGymsStage(stage))) {
    localStagesByTrainer.set(trainerId, stages);
    return stages;
  }

  const withGyms = [
    ...stages,
    {
      id: `local-stage-${GYMS_STAGE_KEY}-${Date.now()}`,
      name: GYMS_STAGE_NAME,
      position: maxPosition(stages) + 1,
      systemKey: GYMS_STAGE_KEY as CrmStage['systemKey'],
    },
  ].sort((a, b) => a.position - b.position);

  localStagesByTrainer.set(trainerId, withGyms);
  return withGyms;
}

function localBoard(trainerId: string, persistent: boolean, viewerRole?: UserRole): CrmBoardData {
  let stages = getLocalStages(trainerId);
  if (isAdminRole(viewerRole)) {
    stages = ensureLocalRoleStages(trainerId, stages);
    stages = ensureLocalCededStage(trainerId, stages);
    stages = ensureLocalGymsStage(trainerId, stages);
  }

  return {
    stages: arrangeCrmStages(filterStagesForViewer(stages, viewerRole)),
    positions: getLocalPositions(trainerId),
    promotedLeads: [],
    archivedLeadIds: getLocalArchived(trainerId),
    cededLeads: [],
    persistent,
  };
}

function isMissingArchivedColumnError(error: { message?: string } | null | undefined) {
  return (error?.message ?? '').toLowerCase().includes('archived_at');
}

async function fetchOwnStageRows(trainerId: string) {
  const supabase = getSupabase();
  if (!supabase) return { rows: [] as Array<Record<string, unknown>>, missingTable: false };

  const result = await supabase
    .from(STAGES_TABLE)
    .select(STAGE_SELECT)
    .eq('trainer_id', trainerId)
    .order('position', { ascending: true });

  if (isMissingTableError(result.error)) {
    return { rows: [] as Array<Record<string, unknown>>, missingTable: true };
  }

  return { rows: (result.data ?? []) as Array<Record<string, unknown>>, missingTable: false };
}

const cededStageSyncInFlight = new Map<string, Promise<CrmStage[]>>();

function syncCededClientStage(trainerId: string, stages: CrmStage[]): Promise<CrmStage[]> {
  const running = cededStageSyncInFlight.get(trainerId);
  if (running) return running;

  const task = runCededClientStageSync(trainerId, stages).finally(() => {
    cededStageSyncInFlight.delete(trainerId);
  });

  cededStageSyncInFlight.set(trainerId, task);
  return task;
}

async function runCededClientStageSync(trainerId: string, stages: CrmStage[]): Promise<CrmStage[]> {
  if (stages.some((stage) => isCededClientStage(stage))) return stages;

  const supabase = getSupabase();
  if (!supabase) return stages;

  const insert = () =>
    supabase
      .from(STAGES_TABLE)
      .insert({
        trainer_id: trainerId,
        name: CEDED_CLIENT_STAGE_NAME,
        position: maxPosition(stages) + 1,
        system_key: CEDED_CLIENT_STAGE_KEY,
      })
      .select(STAGE_SELECT)
      .single();

  const result = await insert();
  if (result.error || !result.data) return stages;
  return [...stages, mapStageRow(result.data as Record<string, unknown>)].sort((a, b) => a.position - b.position);
}

const gymsStageSyncInFlight = new Map<string, Promise<CrmStage[]>>();

function syncGymsStage(trainerId: string, stages: CrmStage[]): Promise<CrmStage[]> {
  const running = gymsStageSyncInFlight.get(trainerId);
  if (running) return running;

  const task = runGymsStageSync(trainerId, stages).finally(() => {
    gymsStageSyncInFlight.delete(trainerId);
  });

  gymsStageSyncInFlight.set(trainerId, task);
  return task;
}

async function runGymsStageSync(trainerId: string, stages: CrmStage[]): Promise<CrmStage[]> {
  if (stages.some((stage) => isGymsStage(stage))) return stages;

  const supabase = getSupabase();
  if (!supabase) return stages;

  const result = await supabase
    .from(STAGES_TABLE)
    .insert({
      trainer_id: trainerId,
      name: GYMS_STAGE_NAME,
      position: maxPosition(stages) + 1,
      system_key: GYMS_STAGE_KEY,
    })
    .select(STAGE_SELECT)
    .single();

  if (result.error || !result.data) return stages;
  return [...stages, mapStageRow(result.data as Record<string, unknown>)].sort((a, b) => a.position - b.position);
}

function leadOwnerIdFromRow(row: Record<string, unknown>) {
  return ((row.assigned_trainer_id as string | null) ?? (row.trainer_id as string | null)) || null;
}

async function persistLeadStageRemaps(
  trainerId: string,
  remaps: Array<{ athleteId: string; stageId: string; position: number }>,
) {
  if (remaps.length === 0 || remaps.some((item) => isLocalStageId(item.stageId))) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const now = new Date().toISOString();
  await Promise.all(
    remaps.map((item) =>
      supabase
        .from(LEADS_TABLE)
        .update({
          stage_id: item.stageId,
          position: item.position,
          trainer_id: trainerId,
          updated_at: now,
        })
        .eq('athlete_id', item.athleteId),
    ),
  );
}

export async function fetchCrmBoard(
  trainerId: string,
  isDemoMode: boolean,
  viewerRole?: UserRole,
): Promise<CrmBoardData> {
  const adminView = isAdminRole(viewerRole);

  if (isDemoMode || !isSupabaseConfigured) {
    return localBoard(trainerId, isDemoMode, viewerRole);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return localBoard(trainerId, false, viewerRole);
  }

  const { rows, missingTable } = await fetchOwnStageRows(trainerId);
  if (missingTable) {
    return localBoard(trainerId, false, viewerRole);
  }

  let stages: CrmStage[] =
    rows.length === 0
      ? await createDefaultCrmStages(trainerId, { includeRoleStages: adminView })
      : adminView
        ? await syncRoleStages(trainerId, rows)
        : rows.map(mapStageRow);

  if (adminView) {
    stages = await syncCededClientStage(trainerId, stages);
    stages = await syncGymsStage(trainerId, stages);
  }

  stages = arrangeCrmStages(filterStagesForViewer(stages, viewerRole));

  const selectLeads = (select: string) => supabase.from(LEADS_TABLE).select(select);
  const leadSelect = 'athlete_id, stage_id, position, archived_at, assigned_trainer_id, trainer_id';
  const leadSelectFallback = 'athlete_id, stage_id, position, assigned_trainer_id, trainer_id';

  let leadResult = await selectLeads(leadSelect);
  if (leadResult.error && isMissingArchivedColumnError(leadResult.error)) {
    leadResult = await selectLeads(leadSelectFallback);
  }

  const leadRows = leadResult.data as Array<Record<string, unknown>> | null;
  const leadError = leadResult.error;

  const positions = new Map<string, CrmLeadPosition>();
  const archivedLeadIds = new Set<string>();
  const assignedAthleteIds = adminView ? null : await fetchAssignedAthleteIds(trainerId);
  const visibleStageIds = new Set(stages.map((stage) => stage.id));
  const fallbackStage = firstAssignableCrmStage(stages);
  const remaps: Array<{ athleteId: string; stageId: string; position: number }> = [];
  const cededAthleteIds: string[] = [];
  const orphanAthleteIds: string[] = [];
  const ownerByAthlete = new Map<string, string>();
  const candidateLeadIds = [
    ...new Set((leadRows ?? []).map((row) => row.athlete_id as string).filter(Boolean)),
  ];
  const staffOnBoard = await fetchNonAthleteProfiles(candidateLeadIds);
  const staffIds = new Set(staffOnBoard.map((member) => member.id));
  const hiddenOnTrainerBoard = new Set(staffIds);
  hiddenOnTrainerBoard.add(trainerId);

  if (!leadError && leadRows) {
    for (const row of leadRows) {
      const athleteId = row.athlete_id as string;

      if (row.archived_at) {
        archivedLeadIds.add(athleteId);
        continue;
      }

      if (!adminView && hiddenOnTrainerBoard.has(athleteId)) continue;

      if (assignedAthleteIds && !assignedAthleteIds.has(athleteId)) continue;

      const ownerId = leadOwnerIdFromRow(row);
      if (athleteId && ownerId) ownerByAthlete.set(athleteId, ownerId);
      if (adminView && ownerId && ownerId !== trainerId) {
        if (!staffIds.has(athleteId) && athleteId !== trainerId) {
          cededAthleteIds.push(athleteId);
        }
        continue;
      }

      if (adminView && staffIds.has(athleteId)) {
        continue;
      }

      const stageId = row.stage_id as string | null;
      if (stageId && visibleStageIds.has(stageId) && !isReadOnlyCrmStage(stages.find((stage) => stage.id === stageId))) {
        positions.set(athleteId, {
          stageId,
          position: (row.position as number) ?? 0,
        });
        continue;
      }

      orphanAthleteIds.push(athleteId);
    }
  }

  if (fallbackStage) {
    let nextPosition = [...positions.values()].filter((pos) => pos.stageId === fallbackStage.id).length;
    for (const athleteId of orphanAthleteIds) {
      positions.set(athleteId, { stageId: fallbackStage.id, position: nextPosition });
      remaps.push({ athleteId, stageId: fallbackStage.id, position: nextPosition });
      nextPosition += 1;
    }
  }

  await persistLeadStageRemaps(trainerId, remaps);

  const emptyCeded: AthleteSummary[] = [];

  if (adminView) {
    const extraOwners = await fetchLeadOwnerMap();
    for (const [athleteId, ownerId] of extraOwners) {
      ownerByAthlete.set(athleteId, ownerId);
    }

    const assignedToOthers = await fetchAthleteIdsAssignedToOtherTrainers(trainerId);
    for (const athleteId of assignedToOthers) {
      if (staffIds.has(athleteId) || athleteId === trainerId) continue;
      if (!cededAthleteIds.includes(athleteId)) cededAthleteIds.push(athleteId);
    }

    await ensureTeamStaffInBoard(trainerId, stages, positions, archivedLeadIds, false);

    const staffProfiles = (await fetchTeamStaffProfiles()).map((member) => ({
      ...member,
      role: resolveStaffBoardRole(member),
    }));
    const visibleStaffIds = new Set(staffProfiles.map((member) => member.id));
    const visibleCededIds = [...new Set(cededAthleteIds)].filter(
      (id) => !visibleStaffIds.has(id) && id !== trainerId,
    );
    const cededStage = stages.find((stage) => isCededClientStage(stage));

    if (cededStage) {
      visibleCededIds.forEach((athleteId, index) => {
        positions.set(athleteId, { stageId: cededStage.id, position: index });
      });
    }

    const promotedFromPositions = await fetchNonAthleteProfiles(
      Array.from(positions.keys()).filter((id) => !visibleCededIds.includes(id)),
    );
    const knownIds = new Set(promotedFromPositions.map((lead) => lead.id));
    const promotedLeads = [
      ...promotedFromPositions,
      ...staffProfiles.filter((member) => !knownIds.has(member.id)),
    ];
    const rawCededLeads = cededStage ? await fetchAthleteSummariesByIds(visibleCededIds) : emptyCeded;
    const trainerNames = new Map(staffProfiles.map((member) => [member.id, member.name]));
    const missingOwnerIds = [
      ...new Set(
        visibleCededIds
          .map((athleteId) => ownerByAthlete.get(athleteId))
          .filter((ownerId): ownerId is string => Boolean(ownerId && !trainerNames.has(ownerId))),
      ),
    ];
    if (missingOwnerIds.length > 0) {
      const extraNames = await fetchProfileNamesByIds(missingOwnerIds);
      extraNames.forEach((name, id) => trainerNames.set(id, name));
    }
    const cededLeads = rawCededLeads.map((lead) => {
      const assignedTrainerId = ownerByAthlete.get(lead.id);
      const assignedTrainerName = assignedTrainerId ? trainerNames.get(assignedTrainerId) : undefined;
      return {
        ...lead,
        assignedTrainerId,
        assignedTrainerName,
      };
    });

    return { stages, positions, promotedLeads, archivedLeadIds, cededLeads, persistent: true };
  }

  const promotedLeads = [] as AthleteSummary[];

  return { stages, positions, promotedLeads, archivedLeadIds, cededLeads: emptyCeded, persistent: true };
}

/** Quita la ficha del tablero sin tocar la cuenta del atleta. */
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
    { onConflict: 'athlete_id' },
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

  const { error } = await supabase.from(LEADS_TABLE).delete().eq('athlete_id', athleteId);

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
    if ((error.message ?? '').toLowerCase().includes('rol no permitido')) {
      return { error: 'Falta la migración del rol administrador en Supabase: ejecuta npm run supabase:admin-role' };
    }
    return { error: error.message };
  }

  return {};
}

async function createDefaultCrmStages(
  trainerId: string,
  options?: { includeRoleStages?: boolean },
): Promise<CrmStage[]> {
  const defaults = buildDefaultStages({ includeRoleStages: options?.includeRoleStages !== false });
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
    .select(STAGE_SELECT);

  if (error || !data) {
    return defaults;
  }

  return data.map((row) => mapStageRow(row as Record<string, unknown>)).sort((a, b) => a.position - b.position);
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

  await supabase.from(LEADS_TABLE).update({ stage_id: fallbackStageId }).eq('stage_id', stageId);

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

  const { data: existingRows } = await supabase
    .from(LEADS_TABLE)
    .select('athlete_id')
    .in('athlete_id', orderedAthleteIds);

  const existingIds = new Set((existingRows ?? []).map((row) => row.athlete_id as string));
  const now = new Date().toISOString();

  await Promise.all(
    orderedAthleteIds.map(async (athleteId, index) => {
      if (existingIds.has(athleteId)) {
        await supabase
          .from(LEADS_TABLE)
          .update({
            stage_id: stageId,
            position: index,
            trainer_id: trainerId,
            updated_at: now,
          })
          .eq('athlete_id', athleteId);
        return;
      }

      let insertResult = await supabase.from(LEADS_TABLE).insert({
        trainer_id: trainerId,
        assigned_trainer_id: trainerId,
        athlete_id: athleteId,
        stage_id: stageId,
        position: index,
        updated_at: now,
      });

      if (insertResult.error && (insertResult.error.message ?? '').includes('assigned_trainer_id')) {
        await supabase.from(LEADS_TABLE).insert({
          trainer_id: trainerId,
          athlete_id: athleteId,
          stage_id: stageId,
          position: index,
          updated_at: now,
        });
      }
    }),
  );
}
