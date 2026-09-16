import { useCallback, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  sendTrainerBroadcast,
  type BroadcastOutcome,
  type BroadcastRecipient,
} from '@/lib/trainerBroadcast';
import { fetchCrmBoard, firstAssignableCrmStage, isReadOnlyCrmStage } from '@/lib/trainerCrm';
import type { AthleteSummary } from '@/lib/types';

/** Atletas agrupados por la columna del CRM en la que están (Registrado, Cliente activo…). */
export interface BroadcastGroup {
  stageId: string;
  stageName: string;
  athletes: AthleteSummary[];
}

export interface BroadcastProgress {
  done: number;
  total: number;
}

export function useTrainerBroadcast() {
  const { user, isDemoMode } = useAuth();
  const [groups, setGroups] = useState<BroadcastGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<BroadcastProgress | null>(null);
  const [outcome, setOutcome] = useState<BroadcastOutcome | null>(null);

  const loadGroups = useCallback(
    async (athletes: readonly AthleteSummary[]) => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const board = await fetchCrmBoard(user.id, isDemoMode, user.role);

        /* Las columnas de rol y las de solo lectura (Cliente cedido, Gimnasios) no son
         * destinatarios: ahí no hay atletas propios a los que escribir. */
        const stages = board.stages
          .filter((stage) => !stage.roleSlug && !isReadOnlyCrmStage(stage))
          .sort((left, right) => left.position - right.position);

        const fallbackStageId = firstAssignableCrmStage(stages)?.id;
        const byStage = new Map<string, AthleteSummary[]>(stages.map((stage) => [stage.id, []]));

        for (const athlete of athletes) {
          const stageId = board.positions.get(athlete.id)?.stageId ?? fallbackStageId;
          const bucket = stageId ? byStage.get(stageId) : undefined;
          if (bucket) bucket.push(athlete);
        }

        setGroups(
          stages.map((stage) => ({
            stageId: stage.id,
            stageName: stage.name,
            athletes: (byStage.get(stage.id) ?? []).sort((left, right) =>
              left.name.localeCompare(right.name, 'es'),
            ),
          })),
        );
      } catch {
        setError('No se pudieron cargar los estados de tus atletas.');
      } finally {
        setIsLoading(false);
      }
    },
    [isDemoMode, user?.id, user?.role],
  );

  const send = useCallback(
    async (recipients: readonly BroadcastRecipient[], template: string) => {
      if (recipients.length === 0) return null;

      setOutcome(null);
      setProgress({ done: 0, total: recipients.length });

      const result = await sendTrainerBroadcast(recipients, template, {
        simulate: isDemoMode,
        onProgress: (done, total) => setProgress({ done, total }),
      });

      setProgress(null);
      setOutcome(result);
      return result;
    },
    [isDemoMode],
  );

  const reset = useCallback(() => {
    setProgress(null);
    setOutcome(null);
    setError(null);
  }, []);

  return { groups, isLoading, error, progress, outcome, loadGroups, send, reset };
}
