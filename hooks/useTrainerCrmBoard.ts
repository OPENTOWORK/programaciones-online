import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAthletes } from '@/hooks/useAthletes';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  archiveCrmLead,
  createCrmStage,
  deleteCrmStage,
  fetchCrmBoard,
  getLocalLeadRole,
  renameCrmStage,
  reorderCrmStages,
  saveCrmColumnOrder,
  setCrmLeadRole,
} from '@/lib/trainerCrm';
import { addCrmActivity } from '@/lib/trainerCrmActivity';
import { createStaleRefresh } from '@/lib/staleRefresh';
import type { AthleteSummary, CrmLeadPosition, CrmStage, UserRole } from '@/lib/types';

export interface CrmColumn {
  stage: CrmStage;
  leads: AthleteSummary[];
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
  } = useAthletes();

  const [stages, setStages] = useState<CrmStage[]>([]);
  const [positions, setPositions] = useState<Map<string, CrmLeadPosition>>(new Map());
  const [promotedLeads, setPromotedLeads] = useState<AthleteSummary[]>([]);
  const [archivedLeadIds, setArchivedLeadIds] = useState<Set<string>>(new Set());
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
        const board = await fetchCrmBoard(trainerId, isDemoMode);
        setStages(sortStages(board.stages));
        setPositions(board.positions);
        setPromotedLeads(board.promotedLeads);
        setArchivedLeadIds(new Set(board.archivedLeadIds));
        setPersistent(board.persistent);
        refreshGate.current.markFetched();
      } finally {
        setIsLoading(false);
      }
    },
    [trainerId, isDemoMode],
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
    const withLocalRole = athletes.map((athlete) => {
      const localRole = getLocalLeadRole(athlete.id);
      return localRole ? { ...athlete, role: localRole } : athlete;
    });
    const knownIds = new Set(withLocalRole.map((athlete) => athlete.id));
    return [...withLocalRole, ...promotedLeads.filter((lead) => !knownIds.has(lead.id))].filter(
      (lead) => !archivedLeadIds.has(lead.id),
    );
  }, [athletes, promotedLeads, archivedLeadIds]);

  const columns = useMemo<CrmColumn[]>(() => {
    const sorted = sortStages(stages);
    const firstStageId = sorted[0]?.id;

    return sorted.map((stage) => {
      const leads = boardLeads
        .filter((athlete) => (positions.get(athlete.id)?.stageId ?? firstStageId) === stage.id)
        .sort((a, b) => {
          const posA = positions.get(a.id)?.position ?? Number.MAX_SAFE_INTEGER;
          const posB = positions.get(b.id)?.position ?? Number.MAX_SAFE_INTEGER;
          if (posA !== posB) return posA - posB;
          return a.name.localeCompare(b.name);
        });

      return { stage, leads };
    });
  }, [stages, boardLeads, positions]);

  const applyRoleChange = useCallback(
    async (athleteId: string, role: UserRole) => {
      if (!trainerId) return;

      const lead = boardLeads.find((athlete) => athlete.id === athleteId);
      const name = lead?.name ?? 'El atleta';

      const { error } = await setCrmLeadRole(athleteId, role, useLocalStore);

      if (error) {
        setRoleNotice({ kind: 'error', message: `No se pudo cambiar el rol de ${name}: ${error}` });
        return;
      }

      setRoleNotice({
        kind: 'success',
        message:
          role === 'entrenador'
            ? `${name} pasa a rol entrenador. Verá el panel de entrenador al volver a entrar en la app.`
            : `${name} vuelve a rol atleta.`,
      });

      void addCrmActivity(
        trainerId,
        athleteId,
        role === 'entrenador' ? 'Cambiado a rol entrenador' : 'Devuelto a rol atleta',
        'stage_change',
        useLocalStore,
      );

      void refreshAthletes(true);
      void load({ force: true, silent: true });
    },
    [boardLeads, trainerId, useLocalStore, refreshAthletes, load],
  );

  const moveLeadToStage = useCallback(
    async (athleteId: string, targetStageId: string, targetIndex?: number) => {
      if (!trainerId) return;

      const previousStageId = positions.get(athleteId)?.stageId;
      const previousStage = stages.find((stage) => stage.id === previousStageId);
      const targetColumn = columns.find((column) => column.stage.id === targetStageId);
      const targetLeadIds = (targetColumn?.leads ?? []).map((athlete) => athlete.id).filter((id) => id !== athleteId);
      const insertIndex = targetIndex ?? targetLeadIds.length;
      const nextOrder = [
        ...targetLeadIds.slice(0, insertIndex),
        athleteId,
        ...targetLeadIds.slice(insertIndex),
      ];

      setPositions((prev) => {
        const next = new Map(prev);
        nextOrder.forEach((id, index) => next.set(id, { stageId: targetStageId, position: index }));
        return next;
      });

      await saveCrmColumnOrder(trainerId, targetStageId, nextOrder, useLocalStore);

      const targetStageName = targetColumn?.stage.name;
      if (targetStageName) {
        void addCrmActivity(trainerId, athleteId, `Movido a "${targetStageName}"`, 'stage_change', useLocalStore);
      }

      const targetRole = targetColumn?.stage.roleSlug;
      const nextRole: UserRole | undefined = targetRole ?? (previousStage?.roleSlug ? 'atleta' : undefined);
      if (nextRole) {
        await applyRoleChange(athleteId, nextRole);
      }
    },
    [columns, positions, stages, trainerId, useLocalStore, applyRoleChange],
  );

  const moveLeadToAdjacentStage = useCallback(
    (athleteId: string, direction: 'prev' | 'next') => {
      const sorted = sortStages(stages);
      const currentStageId = positions.get(athleteId)?.stageId ?? sorted[0]?.id;
      const currentIndex = sorted.findIndex((stage) => stage.id === currentStageId);
      const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      const targetStage = sorted[targetIndex];
      if (!targetStage) return;
      void moveLeadToStage(athleteId, targetStage.id);
    },
    [stages, positions, moveLeadToStage],
  );

  const reorderLeadWithinStage = useCallback(
    async (stageId: string, athleteId: string, direction: 'up' | 'down') => {
      if (!trainerId) return;
      const column = columns.find((item) => item.stage.id === stageId);
      if (!column) return;

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

      const name = boardLeads.find((lead) => lead.id === athleteId)?.name ?? 'La ficha';

      setArchivedLeadIds((prev) => new Set(prev).add(athleteId));

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
    [boardLeads, trainerId, useLocalStore],
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
      const trimmed = name.trim();
      if (!trimmed) return;
      setStages((prev) => prev.map((stage) => (stage.id === stageId ? { ...stage, name: trimmed } : stage)));
      await renameCrmStage(trainerId, stageId, trimmed, useLocalStore);
    },
    [trainerId, useLocalStore],
  );

  const removeStage = useCallback(
    async (stageId: string) => {
      if (!trainerId || stages.length <= 1) return;
      const sorted = sortStages(stages);
      const fallbackStage = sorted.find((stage) => stage.id !== stageId) ?? sorted[0];
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

  return {
    columns,
    isLoading: isLoading || athletesLoading,
    error: athletesError,
    persistent,
    roleNotice,
    dismissRoleNotice,
    refresh,
    moveLeadToStage,
    moveLeadToAdjacentStage,
    reorderLeadWithinStage,
    removeLead,
    addStage,
    renameStage,
    removeStage,
    moveStage,
  };
}
