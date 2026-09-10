import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isAdminRole, isTrainerRole } from '@/lib/athleteService';
import { fetchAdminGymsOverview, type AdminGymRow } from '@/lib/gymAdminService';
import { useAthletes } from '@/hooks/useAthletes';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  archiveCrmLead,
  createCrmStage,
  deleteCrmStage,
  fetchCrmBoard,
  firstAssignableCrmStage,
  getLocalLeadRole,
  isCededClientStage,
  isGymsStage,
  isReadOnlyCrmStage,
  renameCrmStage,
  reorderCrmStages,
  restoreCrmLead,
  saveCrmColumnOrder,
  setCrmLeadRole,
} from '@/lib/trainerCrm';
import { addCrmActivity } from '@/lib/trainerCrmActivity';
import { createTrainerClient } from '@/lib/trainerClientService';
import { createStaleRefresh } from '@/lib/staleRefresh';
import {
  EMPTY_ATHLETE_ALERTS,
  markAthleteAlertSourcesRead,
  pendingAlertSources,
} from '@/lib/trainerAthleteAlerts';
import type { AthleteSummary, CrmLeadPosition, CrmStage, UserRole } from '@/lib/types';

export interface CrmColumn {
  stage: CrmStage;
  leads: AthleteSummary[];
  gyms?: AdminGymRow[];
}

export interface CrmRoleNotice {
  kind: 'success' | 'error';
  message: string;
}

function sortStages(stages: CrmStage[]) {
  return [...stages].sort((a, b) => a.position - b.position);
}

export function useTrainerCrmBoard() {
  const { user, isDemoMode } = useAuth();
  const trainerId = user?.id;
  const {
    athletes,
    isLoading: athletesLoading,
    error: athletesError,
    refresh: refreshAthletes,
    patchAthlete,
  } = useAthletes();

  const [stages, setStages] = useState<CrmStage[]>([]);
  const [positions, setPositions] = useState<Map<string, CrmLeadPosition>>(new Map());
  const [promotedLeads, setPromotedLeads] = useState<AthleteSummary[]>([]);
  const [cededLeads, setCededLeads] = useState<AthleteSummary[]>([]);
  const [archivedLeadIds, setArchivedLeadIds] = useState<Set<string>>(new Set());
  const [adminGyms, setAdminGyms] = useState<AdminGymRow[]>([]);
  const [roleNotice, setRoleNotice] = useState<CrmRoleNotice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [persistent, setPersistent] = useState(true);
  const refreshGate = useRef(createStaleRefresh(45_000));

  const useLocalStore = isDemoMode || !persistent;

  const load = useCallback(
    async ({ silent = false, force = false }: { silent?: boolean; force?: boolean } = {}) => {
      if (!trainerId) return;
      if (!force && silent && !refreshGate.current.shouldRefresh(false)) return;

      if (!silent) {
        setIsLoading(true);
      }

      try {
        const board = await fetchCrmBoard(trainerId, isDemoMode, user?.role);
        setStages(sortStages(board.stages));
        setPositions(board.positions);
        setPromotedLeads(board.promotedLeads);
        setCededLeads(board.cededLeads);
        setArchivedLeadIds(new Set(board.archivedLeadIds));
        setPersistent(board.persistent);
        if (isAdminRole(user?.role)) {
          const gymsResult = await fetchAdminGymsOverview();
          setAdminGyms(gymsResult.data?.rows ?? []);
        } else {
          setAdminGyms([]);
        }
        refreshGate.current.markFetched();
      } finally {
        setIsLoading(false);
      }
    },
    [trainerId, isDemoMode, user?.role],
  );

  useEffect(() => {
    refreshGate.current = createStaleRefresh(45_000);
    void load({ force: true });
  }, [load]);

  useFocusRefresh(
    () => refreshAthletes(true),
    () => load({ silent: true }),
  );

  /** Los promocionados dejan de ser atletas, así que ya no llegan por `useAthletes`. */
  const boardLeads = useMemo<AthleteSummary[]>(() => {
    const cededById = new Map(cededLeads.map((lead) => [lead.id, lead]));
    const withLocalRole = athletes.map((athlete) => {
      const localRole = getLocalLeadRole(athlete.id);
      const ceded = cededById.get(athlete.id);
      return {
        ...athlete,
        ...(localRole ? { role: localRole } : null),
        ...(ceded
          ? {
              assignedTrainerId: ceded.assignedTrainerId,
              assignedTrainerName: ceded.assignedTrainerName,
            }
          : null),
      };
    });
    const knownIds = new Set(withLocalRole.map((athlete) => athlete.id));
    return [
      ...withLocalRole,
      ...promotedLeads.filter((lead) => !knownIds.has(lead.id)),
      ...cededLeads.filter((lead) => !knownIds.has(lead.id) && !promotedLeads.some((item) => item.id === lead.id)),
    ].filter((lead) => {
      if (archivedLeadIds.has(lead.id)) return false;
      if (!isAdminRole(user?.role) && (lead.id === trainerId || isTrainerRole(lead.role))) return false;
      return true;
    });
  }, [athletes, promotedLeads, cededLeads, archivedLeadIds, trainerId, user?.role]);

  const columns = useMemo<CrmColumn[]>(() => {
    const sorted = sortStages(stages);
    const fallbackStageId = firstAssignableCrmStage(sorted)?.id;
    const cededStage = sorted.find((stage) => isCededClientStage(stage));
    const cededIds = new Set(cededLeads.map((lead) => lead.id));
    if (cededStage) {
      for (const [athleteId, pos] of positions) {
        if (pos.stageId === cededStage.id) cededIds.add(athleteId);
      }
    }

    return sorted.map((stage) => {
      if (isGymsStage(stage)) {
        return { stage, leads: [], gyms: adminGyms };
      }

      const leads = boardLeads
        .filter((athlete) => {
          if (cededStage && isCededClientStage(stage)) {
            return cededIds.has(athlete.id);
          }
          if (cededIds.has(athlete.id)) return false;
          return (positions.get(athlete.id)?.stageId ?? fallbackStageId) === stage.id;
        })
        .sort((a, b) => {
          const posA = positions.get(a.id)?.position ?? Number.MAX_SAFE_INTEGER;
          const posB = positions.get(b.id)?.position ?? Number.MAX_SAFE_INTEGER;
          if (posA !== posB) return posA - posB;
          return a.name.localeCompare(b.name);
        });

      return { stage, leads };
    });
  }, [stages, boardLeads, positions, cededLeads, adminGyms]);

  const applyRoleChange = useCallback(
    async (athleteId: string, role: UserRole) => {
      if (!trainerId || !isAdminRole(user?.role)) return false;

      const lead = boardLeads.find((athlete) => athlete.id === athleteId);
      const name = lead?.name ?? 'El atleta';

      const { error } = await setCrmLeadRole(athleteId, role, useLocalStore);

      if (error) {
        setRoleNotice({ kind: 'error', message: `No se pudo cambiar el rol de ${name}: ${error}` });
        return false;
      }

      setRoleNotice({
        kind: 'success',
        message:
          role === 'administrador'
            ? `${name} pasa a rol administrador. Verá el panel de entrenador al volver a entrar en la app.`
            : role === 'entrenador'
              ? `${name} pasa a rol entrenador. Verá el panel de entrenador al volver a entrar en la app.`
              : `${name} vuelve a rol atleta.`,
      });

      void addCrmActivity(
        trainerId,
        athleteId,
        role === 'administrador'
          ? 'Cambiado a rol administrador'
          : role === 'entrenador'
            ? 'Cambiado a rol entrenador'
            : 'Devuelto a rol atleta',
        'stage_change',
        useLocalStore,
      );

      void refreshAthletes(true);
      void load({ force: true, silent: true });
      return true;
    },
    [boardLeads, trainerId, useLocalStore, refreshAthletes, load, user?.role],
  );

  const moveLeadToStage = useCallback(
    async (athleteId: string, targetStageId: string, targetIndex?: number) => {
      if (!trainerId) return;

      // Por `columns`, no por `positions`: una ficha sin posición guardada vive en la primera columna.
      const previousStage = columns.find((column) => column.leads.some((lead) => lead.id === athleteId))?.stage;
      const sameStage = previousStage?.id === targetStageId;
      const targetColumn = columns.find((column) => column.stage.id === targetStageId);

      if (isReadOnlyCrmStage(previousStage) || isReadOnlyCrmStage(targetColumn?.stage)) {
        return;
      }

      const nextRole: UserRole | undefined = sameStage
        ? undefined
        : targetColumn?.stage.roleSlug ?? (previousStage?.roleSlug ? 'atleta' : undefined);

      if (nextRole && !isAdminRole(user?.role)) {
        setRoleNotice({ kind: 'error', message: 'Solo un administrador puede cambiar el rol de un usuario.' });
        return;
      }

      if (nextRole && athleteId === trainerId) {
        setRoleNotice({
          kind: 'error',
          message: 'No puedes cambiar tu propio rol. Pídeselo a otro administrador.',
        });
        return;
      }

      const targetLeadIds = (targetColumn?.leads ?? []).map((athlete) => athlete.id).filter((id) => id !== athleteId);
      const insertIndex = targetIndex ?? targetLeadIds.length;
      const nextOrder = [
        ...targetLeadIds.slice(0, insertIndex),
        athleteId,
        ...targetLeadIds.slice(insertIndex),
      ];

      const previousPositions = new Map(positions);

      setPositions((prev) => {
        const next = new Map(prev);
        nextOrder.forEach((id, index) => next.set(id, { stageId: targetStageId, position: index }));
        return next;
      });

      // El rol manda sobre la columna: si el cambio falla, la ficha no puede quedarse ahí.
      if (nextRole && !(await applyRoleChange(athleteId, nextRole))) {
        setPositions(previousPositions);
        return;
      }

      await saveCrmColumnOrder(trainerId, targetStageId, nextOrder, useLocalStore);

      if (sameStage) return;

      const targetStageName = targetColumn?.stage.name;
      if (targetStageName) {
        void addCrmActivity(trainerId, athleteId, `Movido a "${targetStageName}"`, 'stage_change', useLocalStore);
      }
    },
    [columns, positions, trainerId, useLocalStore, applyRoleChange, user?.role],
  );

  const moveLeadToAdjacentStage = useCallback(
    (athleteId: string, direction: 'prev' | 'next') => {
      const sorted = sortStages(stages);
      const currentStageId = positions.get(athleteId)?.stageId ?? firstAssignableCrmStage(sorted)?.id;
      const currentStage = sorted.find((stage) => stage.id === currentStageId);
      const currentIndex = sorted.findIndex((stage) => stage.id === currentStageId);
      const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      const targetStage = sorted[targetIndex];
      if (!targetStage || isReadOnlyCrmStage(currentStage) || isReadOnlyCrmStage(targetStage)) return;
      void moveLeadToStage(athleteId, targetStage.id);
    },
    [stages, positions, moveLeadToStage],
  );

  const reorderLeadWithinStage = useCallback(
    async (stageId: string, athleteId: string, direction: 'up' | 'down') => {
      if (!trainerId) return;
      const column = columns.find((item) => item.stage.id === stageId);
      if (!column || isReadOnlyCrmStage(column.stage)) return;

      const ids = column.leads.map((athlete) => athlete.id);
      const index = ids.indexOf(athleteId);
      if (index < 0) return;

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= ids.length) return;

      const nextOrder = [...ids];
      [nextOrder[index], nextOrder[swapIndex]] = [nextOrder[swapIndex], nextOrder[index]];

      setPositions((prev) => {
        const next = new Map(prev);
        nextOrder.forEach((id, idx) => next.set(id, { stageId, position: idx }));
        return next;
      });

      await saveCrmColumnOrder(trainerId, stageId, nextOrder, useLocalStore);
    },
    [columns, trainerId, useLocalStore],
  );

  /** Saca la ficha del tablero: el atleta y su historial siguen existiendo. */
  const removeLead = useCallback(
    async (athleteId: string) => {
      if (!trainerId) return;
      if (isReadOnlyCrmStage(columns.find((column) => column.leads.some((lead) => lead.id === athleteId))?.stage)) {
        return;
      }

      const name = boardLeads.find((lead) => lead.id === athleteId)?.name ?? 'La ficha';

      const { error } = await archiveCrmLead(trainerId, athleteId, useLocalStore);

      if (error) {
        setArchivedLeadIds((prev) => {
          const next = new Set(prev);
          next.delete(athleteId);
          return next;
        });
        setRoleNotice({ kind: 'error', message: `No se pudo eliminar la ficha de ${name}: ${error}` });
        return;
      }

      setRoleNotice({
        kind: 'success',
        message: `${name} ya no aparece en el tablero. Su cuenta y su historial se mantienen.`,
      });
    },
    [boardLeads, columns, trainerId, useLocalStore],
  );

  const addStage = useCallback(
    async (name: string) => {
      if (!trainerId) return;
      const position = stages.length;
      const stage = await createCrmStage(trainerId, name, position, useLocalStore);
      setStages((prev) => sortStages([...prev, stage]));
    },
    [trainerId, stages.length, useLocalStore],
  );

  const renameStage = useCallback(
    async (stageId: string, name: string) => {
      if (!trainerId) return;
      if (isReadOnlyCrmStage(stages.find((stage) => stage.id === stageId))) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      setStages((prev) => prev.map((stage) => (stage.id === stageId ? { ...stage, name: trimmed } : stage)));
      await renameCrmStage(trainerId, stageId, trimmed, useLocalStore);
    },
    [trainerId, stages, useLocalStore],
  );

  const removeStage = useCallback(
    async (stageId: string) => {
      if (!trainerId || stages.length <= 1) return;
      if (isReadOnlyCrmStage(stages.find((stage) => stage.id === stageId))) return;

      const sorted = sortStages(stages);
      const fallbackStage =
        firstAssignableCrmStage(sorted.filter((stage) => stage.id !== stageId)) ??
        sorted.find((stage) => stage.id !== stageId) ??
        sorted[0];
      if (!fallbackStage) return;

      setStages((prev) => prev.filter((stage) => stage.id !== stageId));
      setPositions((prev) => {
        const next = new Map(prev);
        for (const [athleteId, pos] of prev) {
          if (pos.stageId === stageId) {
            next.set(athleteId, { stageId: fallbackStage.id, position: 0 });
          }
        }
        return next;
      });

      await deleteCrmStage(trainerId, stageId, fallbackStage.id, useLocalStore);
    },
    [trainerId, stages, useLocalStore],
  );

  const moveStage = useCallback(
    async (stageId: string, direction: 'left' | 'right') => {
      if (!trainerId) return;
      const sorted = sortStages(stages);
      const index = sorted.findIndex((stage) => stage.id === stageId);
      const swapIndex = direction === 'left' ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;

      const reordered = [...sorted];
      [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
      const withPositions = reordered.map((stage, i) => ({ ...stage, position: i }));

      setStages(withPositions);
      await reorderCrmStages(trainerId, withPositions, useLocalStore);
    },
    [trainerId, stages, useLocalStore],
  );

  const refresh = useCallback(() => {
    refreshAthletes();
    void load({ silent: true });
  }, [refreshAthletes, load]);

  const dismissRoleNotice = useCallback(() => setRoleNotice(null), []);

  const createClient = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      if (!trainerId) return 'No se pudo identificar al entrenador.';

      const result = await createTrainerClient(input, isDemoMode);
      if (result.error) return result.error;
      if (!result.athleteId) return 'No se pudo crear el cliente.';

      const firstStage = firstAssignableCrmStage(columns.map((column) => column.stage));
      if (!firstStage) return 'No hay columnas en el tablero.';

      if (archivedLeadIds.has(result.athleteId)) {
        const { error } = await restoreCrmLead(trainerId, result.athleteId, useLocalStore);
        if (error) return error;
        setArchivedLeadIds((prev) => {
          const next = new Set(prev);
          next.delete(result.athleteId!);
          return next;
        });
      }

      const targetColumn = columns.find((column) => column.stage.id === firstStage.id);
      const existingIds = (targetColumn?.leads ?? [])
        .map((lead) => lead.id)
        .filter((id) => id !== result.athleteId);
      const nextOrder = [result.athleteId, ...existingIds];

      setPositions((prev) => {
        const next = new Map(prev);
        nextOrder.forEach((id, index) => next.set(id, { stageId: firstStage.id, position: index }));
        return next;
      });

      await saveCrmColumnOrder(trainerId, firstStage.id, nextOrder, useLocalStore);

      void addCrmActivity(
        trainerId,
        result.athleteId,
        result.alreadyExisted ? 'Añadido al tablero' : 'Cliente creado',
        'stage_change',
        useLocalStore,
      );

      void refreshAthletes(true);
      void load({ force: true, silent: true });

      if (result.alreadyExisted) {
        setRoleNotice({
          kind: 'success',
          message: `${input.name.trim()} ya existía y se ha añadido a "${firstStage.name}".`,
        });
        return null;
      }

      if (result.welcomeEmailSent) {
        setRoleNotice({
          kind: 'success',
          message: result.needsEmailConfirmation
            ? `${input.name.trim()} se ha creado y le hemos enviado un correo de bienvenida. Debe confirmar su email antes de poder entrar.`
            : `${input.name.trim()} se ha creado y le hemos enviado un correo de bienvenida a su Gmail.`,
        });
        return null;
      }

      if (result.needsEmailConfirmation) {
        setRoleNotice({
          kind: 'success',
          message: `${input.name.trim()} se ha creado, pero no se pudo enviar el correo de bienvenida. Debe confirmar su email antes de poder entrar.`,
        });
        return null;
      }

      setRoleNotice({
        kind: 'success',
        message: `${input.name.trim()} ya está en la columna "${firstStage.name}", pero no se pudo enviar el correo de bienvenida.`,
      });
      return null;
    },
    [
      archivedLeadIds,
      columns,
      isDemoMode,
      load,
      refreshAthletes,
      trainerId,
      useLocalStore,
    ],
  );

  const dismissLeadAlerts = useCallback(
    async (athleteId: string) => {
      const lead = boardLeads.find((athlete) => athlete.id === athleteId);
      const sources = pendingAlertSources(lead?.alerts);
      if (sources.length === 0) return;

      patchAthlete(athleteId, {
        alerts: { ...EMPTY_ATHLETE_ALERTS },
        unansweredCount: 0,
      });
      await markAthleteAlertSourcesRead(athleteId, sources);
    },
    [boardLeads, patchAthlete],
  );

  return {
    columns,
    isLoading: isLoading || athletesLoading,
    error: athletesError,
    persistent,
    roleNotice,
    dismissRoleNotice,
    setRoleNotice,
    refresh,
    dismissLeadAlerts,
    moveLeadToStage,
    moveLeadToAdjacentStage,
    reorderLeadWithinStage,
    removeLead,
    addStage,
    renameStage,
    removeStage,
    moveStage,
    createClient,
  };
}
