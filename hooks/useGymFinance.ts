import { useCallback, useEffect, useState } from 'react';

import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useGym } from '@/hooks/useGym';
import {
  loadGymFinanceBoard,
  type GymFinanceEntry,
  type GymFinancePeriod,
  type GymFinanceSummary,
  type GymPendingPayment,
} from '@/lib/gymFinance';

const EMPTY_SUMMARY: GymFinanceSummary = {
  income: 0,
  expense: 0,
  balance: 0,
  cashOnHand: 0,
  bankOnHand: 0,
  incomeByOrigin: [],
  expenseByDestination: [],
  expectedMemberships: 0,
  paidPaymentsTotal: 0,
  pendingPaymentsTotal: 0,
};

export function useGymFinance(period: GymFinancePeriod) {
  const { gym } = useGym();
  const [entries, setEntries] = useState<GymFinanceEntry[]>([]);
  const [paidPayments, setPaidPayments] = useState<GymFinanceEntry[]>([]);
  const [pendingPayments, setPendingPayments] = useState<GymPendingPayment[]>([]);
  const [summary, setSummary] = useState<GymFinanceSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!gym) {
        setIsLoading(false);
        return;
      }
      if (!silent) setIsLoading(true);
      const result = await loadGymFinanceBoard(gym.id, period);
      setEntries(result.data?.entries ?? []);
      setPaidPayments(result.data?.paidPayments ?? []);
      setPendingPayments(result.data?.pendingPayments ?? []);
      setSummary(result.data?.summary ?? EMPTY_SUMMARY);
      setError(result.error ?? null);
      setIsLoading(false);
    },
    [gym, period],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  return {
    entries,
    paidPayments,
    pendingPayments,
    summary,
    isLoading,
    error,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}
