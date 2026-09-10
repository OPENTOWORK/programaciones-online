import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useGym } from '@/hooks/useGym';
import { fetchGymClassRosters, type GymClassRoster } from '@/lib/athleteGymService';
import { fetchGymProductMovements, fetchGymProducts, seedHypeGymShopProducts } from '@/lib/gymShopService';
import {
  fetchGymBookings,
  fetchGymClassTypes,
  fetchGymClasses,
  fetchGymDashboardStats,
  fetchGymMembershipPlans,
  fetchGymPlanActiveCounts,
  fetchGymPromotions,
  fetchGymMembers,
  fetchGymProgramLinks,
  fetchGymStaff,
  fetchGymSubscription,
  seedHypeGymCatalog,
} from '@/lib/gymService';
import { isHypeCatalogNeedsSync, isHypeGymCatalogTarget } from '@/lib/hypeGymRatesCatalog';
import { isHypeGym } from '@/lib/hypeGymSchedule';
import type {
  GymBooking,
  GymClass,
  GymClassType,
  GymDashboardStats,
  GymMember,
  GymMembershipPlan,
  GymPromotion,
  GymProduct,
  GymProductMovement,
  GymProgramLink,
  GymSubscription,
  GymUser,
} from '@/lib/gymTypes';

/** Lunes de la semana de `date`, a las 00:00 locales. */
export function startOfWeek(date: Date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  copy.setDate(copy.getDate() + (day === 0 ? -6 : 1 - day));
  return copy;
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function useGymDashboard() {
  const { gym } = useGym();
  const [stats, setStats] = useState<GymDashboardStats | null>(null);
  const [subscription, setSubscription] = useState<GymSubscription | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<GymClass[]>([]);
  const [recentMembers, setRecentMembers] = useState<GymMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!gym) {
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const now = new Date();
      const [statsResult, subscriptionResult, classesResult, membersResult] = await Promise.all([
        fetchGymDashboardStats(gym.id),
        fetchGymSubscription(gym.id),
        fetchGymClasses(gym.id, {
          from: now.toISOString(),
          to: addDays(now, 7).toISOString(),
        }),
        fetchGymMembers(gym.id),
      ]);

      setStats(statsResult.data ?? null);
      setSubscription(subscriptionResult.data ?? null);
      setUpcomingClasses((classesResult.data ?? []).slice(0, 6));
      setRecentMembers((membersResult.data ?? []).slice(0, 6));
      setError(statsResult.error ?? classesResult.error ?? membersResult.error ?? null);
      setIsLoading(false);
    },
    [gym],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  return {
    stats,
    subscription,
    upcomingClasses,
    recentMembers,
    isLoading,
    error,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}

export function useGymMembers() {
  const { gym } = useGym();
  const [members, setMembers] = useState<GymMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!gym) {
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const result = await fetchGymMembers(gym.id);
      setMembers(result.data ?? []);
      setError(result.error ?? null);
      setIsLoading(false);
    },
    [gym],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  return {
    members,
    isLoading,
    error,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}

export function useGymStaff() {
  const { gym } = useGym();
  const [staff, setStaff] = useState<GymUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!gym) {
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const result = await fetchGymStaff(gym.id);
      setStaff(result.data ?? []);
      setError(result.error ?? null);
      setIsLoading(false);
    },
    [gym],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  return {
    staff,
    isLoading,
    error,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}

export function useGymSchedule() {
  const { gym } = useGym();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [classTypes, setClassTypes] = useState<GymClassType[]>([]);
  const [staff, setStaff] = useState<GymUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!gym) {
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const [classesResult, typesResult, staffResult] = await Promise.all([
        fetchGymClasses(gym.id, {
          from: weekStart.toISOString(),
          to: addDays(weekStart, 7).toISOString(),
        }),
        fetchGymClassTypes(gym.id),
        fetchGymStaff(gym.id),
      ]);

      setClasses(classesResult.data ?? []);
      setClassTypes(typesResult.data ?? []);
      setStaff(staffResult.data ?? []);
      setError(classesResult.error ?? typesResult.error ?? null);
      setIsLoading(false);
    },
    [gym, weekStart],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const classesByDay = useMemo(() => {
    const map = new Map<string, GymClass[]>();
    for (const day of days) {
      map.set(day.toDateString(), []);
    }

    for (const gymClass of classes) {
      const key = new Date(gymClass.startAt).toDateString();
      const bucket = map.get(key);
      if (bucket) bucket.push(gymClass);
    }

    for (const bucket of map.values()) {
      bucket.sort((left, right) => left.startAt.localeCompare(right.startAt));
    }

    return map;
  }, [classes, days]);

  return {
    weekStart,
    days,
    classes,
    classesByDay,
    classTypes,
    staff,
    isLoading,
    error,
    goToPreviousWeek: useCallback(() => setWeekStart((current) => addDays(current, -7)), []),
    goToNextWeek: useCallback(() => setWeekStart((current) => addDays(current, 7)), []),
    goToThisWeek: useCallback(() => setWeekStart(startOfWeek(new Date())), []),
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}

export function useGymBookings() {
  const { gym } = useGym();
  const [day, setDay] = useState(() => startOfDay(new Date()));
  const [bookings, setBookings] = useState<GymBooking[]>([]);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [rosters, setRosters] = useState<Record<string, GymClassRoster>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!gym) {
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const range = { from: day.toISOString(), to: addDays(day, 1).toISOString() };
      const [bookingsResult, classesResult] = await Promise.all([
        fetchGymBookings(gym.id, range),
        fetchGymClasses(gym.id, range),
      ]);

      const nextClasses = classesResult.data ?? [];
      const classIds = nextClasses.map((gymClass) => gymClass.id);
      const rostersResult =
        classIds.length > 0 ? await fetchGymClassRosters(gym.id, classIds) : { data: {} };

      setBookings(bookingsResult.data ?? []);
      setClasses(nextClasses);
      setRosters(rostersResult.data ?? {});
      setError(bookingsResult.error ?? classesResult.error ?? rostersResult.error ?? null);
      setIsLoading(false);
    },
    [day, gym],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    day,
    bookings,
    classes,
    rosters,
    isLoading,
    error,
    goToPreviousDay: useCallback(() => setDay((current) => addDays(current, -1)), []),
    goToNextDay: useCallback(() => setDay((current) => addDays(current, 1)), []),
    goToToday: useCallback(() => setDay(startOfDay(new Date())), []),
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}

export function useGymCatalog() {
  const { gym } = useGym();
  const [classTypes, setClassTypes] = useState<GymClassType[]>([]);
  const [plans, setPlans] = useState<GymMembershipPlan[]>([]);
  const [promotions, setPromotions] = useState<GymPromotion[]>([]);
  const [planActiveCounts, setPlanActiveCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false, trySeed = false }: { silent?: boolean; trySeed?: boolean } = {}) => {
      if (!gym) {
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const [typesResult, plansResult, promotionsResult, countsResult] = await Promise.all([
        fetchGymClassTypes(gym.id),
        fetchGymMembershipPlans(gym.id),
        fetchGymPromotions(gym.id),
        fetchGymPlanActiveCounts(gym.id),
      ]);

      let nextPlans = plansResult.data ?? [];
      let nextPromotions = promotionsResult.data ?? [];
      let nextCounts = countsResult.data ?? {};
      let nextError =
        typesResult.error ?? plansResult.error ?? promotionsResult.error ?? countsResult.error ?? null;

      if (
        trySeed &&
        isHypeGymCatalogTarget(gym) &&
        isHypeCatalogNeedsSync(nextPlans, nextPromotions)
      ) {
        const seed = await seedHypeGymCatalog(gym.id);
        if (seed.error) {
          nextError = seed.error;
        } else if (seed.data) {
          const notices: string[] = [];
          if (seed.data.plansRemoved > 0 || seed.data.promotionsRemoved > 0) {
            notices.push(
              `Duplicados eliminados: ${seed.data.plansRemoved} tarifas y ${seed.data.promotionsRemoved} descuentos.`,
            );
          }
          if (seed.data.plansCreated > 0 || seed.data.promotionsCreated > 0) {
            notices.push(
              `Catálogo Hype cargado: ${seed.data.plansCreated} tarifas y ${seed.data.promotionsCreated} descuentos.`,
            );
          }
          if (notices.length > 0) {
            setSeedNotice(notices.join(' '));
          }

          const [plansRefresh, promotionsRefresh, countsRefresh] = await Promise.all([
            fetchGymMembershipPlans(gym.id),
            fetchGymPromotions(gym.id),
            fetchGymPlanActiveCounts(gym.id),
          ]);

          nextPlans = plansRefresh.data ?? nextPlans;
          nextPromotions = promotionsRefresh.data ?? nextPromotions;
          nextCounts = countsRefresh.data ?? nextCounts;
          nextError =
            nextError ??
            plansRefresh.error ??
            promotionsRefresh.error ??
            countsRefresh.error ??
            null;
        }
      }

      setClassTypes(typesResult.data ?? []);
      setPlans(nextPlans);
      setPromotions(nextPromotions);
      setPlanActiveCounts(nextCounts);
      setError(nextError);
      setIsLoading(false);
    },
    [gym],
  );

  useEffect(() => {
    void load({ trySeed: true });
  }, [load]);

  return {
    classTypes,
    plans,
    promotions,
    planActiveCounts,
    seedNotice,
    isLoading,
    error,
    refresh: useCallback(() => load({ silent: true }), [load]),
    reloadCatalog: useCallback(() => load({ silent: true, trySeed: true }), [load]),
  };
}

export function useGymTrainingLinks() {
  const { gym } = useGym();
  const [links, setLinks] = useState<GymProgramLink[]>([]);
  const [classTypes, setClassTypes] = useState<GymClassType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!gym) {
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const [linksResult, typesResult] = await Promise.all([
        fetchGymProgramLinks(gym.id),
        fetchGymClassTypes(gym.id),
      ]);

      setLinks(linksResult.data ?? []);
      setClassTypes((typesResult.data ?? []).filter((type) => type.active));
      setError(linksResult.error ?? typesResult.error ?? null);
      setIsLoading(false);
    },
    [gym],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  return {
    links,
    classTypes,
    isLoading,
    error,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}

export function useGymShop() {
  const { gym } = useGym();
  const [products, setProducts] = useState<GymProduct[]>([]);
  const [movements, setMovements] = useState<GymProductMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!gym) {
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const [productsResult, movementsResult] = await Promise.all([
        fetchGymProducts(gym.id),
        fetchGymProductMovements(gym.id, 500),
      ]);

      let nextProducts = productsResult.data ?? [];
      if (isHypeGym(gym) && nextProducts.length === 0) {
        const seed = await seedHypeGymShopProducts(gym.id);
        if (!seed.error) {
          const refreshProducts = await fetchGymProducts(gym.id);
          nextProducts = refreshProducts.data ?? nextProducts;
        }
      }

      setProducts(nextProducts);
      setMovements(movementsResult.data ?? []);
      setError(productsResult.error ?? movementsResult.error ?? null);
      setIsLoading(false);
    },
    [gym],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  return {
    products,
    movements,
    isLoading,
    error,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}
