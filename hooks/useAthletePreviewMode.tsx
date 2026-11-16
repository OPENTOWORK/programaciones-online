import type { Href } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';
import {
  loadAthleteMobilePreviewSubject,
  type AthleteMobilePreviewSubject,
} from '@/lib/athleteMobilePreview';
import {
  hrefToAthletePreviewNavAction,
  type AthletePreviewRoute,
} from '@/lib/athleteMobilePreviewRoutes';
import type { UserProfile } from '@/lib/types';

export type AthletePreviewTab = 'home' | 'programs' | 'progress' | 'trainer' | 'profile';

type AthletePreviewContextValue = {
  enabled: boolean;
  activeTab: AthletePreviewTab;
  setActiveTab: (tab: AthletePreviewTab) => void;
  simulateCededAthlete: boolean;
  setSimulateCededAthlete: (value: boolean) => void;
  previewSubject: AthleteMobilePreviewSubject | null;
  previewSubjectLoading: boolean;
};

type AthletePreviewNavigationValue = {
  stack: AthletePreviewRoute[];
  pushHref: (href: Href) => boolean;
  replaceHref: (href: Href) => boolean;
  pop: () => boolean;
  resetStack: () => void;
  canGoBack: () => boolean;
};

const AthletePreviewContext = createContext<AthletePreviewContextValue>({
  enabled: false,
  activeTab: 'home',
  setActiveTab: () => undefined,
  simulateCededAthlete: false,
  setSimulateCededAthlete: () => undefined,
  previewSubject: null,
  previewSubjectLoading: false,
});

const AthletePreviewNavigationContext = createContext<AthletePreviewNavigationValue | null>(null);

export function AthletePreviewProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTabState] = useState<AthletePreviewTab>('home');
  const [stack, setStack] = useState<AthletePreviewRoute[]>([]);
  const [simulateCededAthlete, setSimulateCededAthleteState] = useState(true);
  const [previewSubject, setPreviewSubject] = useState<AthleteMobilePreviewSubject | null>(null);
  const [previewSubjectLoading, setPreviewSubjectLoading] = useState(false);

  const setActiveTab = useCallback((tab: AthletePreviewTab) => {
    setStack([]);
    setActiveTabState(tab);
  }, []);

  const setSimulateCededAthlete = useCallback((value: boolean) => {
    setStack([]);
    setSimulateCededAthleteState(value);
  }, []);

  const applyNavAction = useCallback((href: Href, mode: 'push' | 'replace') => {
    const action = hrefToAthletePreviewNavAction(href);
    if (!action) return false;

    if (action.kind === 'tab') {
      setActiveTabState(action.tab);
      setStack([]);
      return true;
    }

    setStack((current) => {
      if (mode === 'replace' && current.length > 0) {
        return [...current.slice(0, -1), action.route];
      }
      return [...current, action.route];
    });
    return true;
  }, []);

  const pushHref = useCallback((href: Href) => applyNavAction(href, 'push'), [applyNavAction]);
  const replaceHref = useCallback((href: Href) => applyNavAction(href, 'replace'), [applyNavAction]);

  const pop = useCallback(() => {
    let didPop = false;
    setStack((current) => {
      if (current.length === 0) return current;
      didPop = true;
      return current.slice(0, -1);
    });
    return didPop;
  }, []);

  const resetStack = useCallback(() => {
    setStack([]);
  }, []);

  const canGoBack = useCallback(() => stack.length > 0, [stack.length]);

  useEffect(() => {
    if (!simulateCededAthlete) {
      setPreviewSubject(null);
      setPreviewSubjectLoading(false);
      return;
    }

    let cancelled = false;
    setPreviewSubjectLoading(true);

    void loadAthleteMobilePreviewSubject().then((subject) => {
      if (cancelled) return;
      setPreviewSubject(subject);
      setPreviewSubjectLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [simulateCededAthlete]);

  const value = useMemo(
    () => ({
      enabled: true,
      activeTab,
      setActiveTab,
      simulateCededAthlete,
      setSimulateCededAthlete,
      previewSubject,
      previewSubjectLoading,
    }),
    [activeTab, previewSubject, previewSubjectLoading, setActiveTab, setSimulateCededAthlete, simulateCededAthlete],
  );

  const navigation = useMemo(
    () => ({
      stack,
      pushHref,
      replaceHref,
      pop,
      resetStack,
      canGoBack,
    }),
    [canGoBack, pop, pushHref, replaceHref, resetStack, stack],
  );

  return (
    <AthletePreviewContext.Provider value={value}>
      <AthletePreviewNavigationContext.Provider value={navigation}>
        {children}
      </AthletePreviewNavigationContext.Provider>
    </AthletePreviewContext.Provider>
  );
}

export function useAthletePreviewMode() {
  return useContext(AthletePreviewContext);
}

export function useAthletePreviewNavigation() {
  const preview = useAthletePreviewMode();
  const navigation = useContext(AthletePreviewNavigationContext);
  if (!preview.enabled || !navigation) return null;
  return navigation;
}

/** Vista de atleta real o previsualización móvil del entrenador. */
export function useShowsAthleteExperience() {
  const preview = useAthletePreviewMode();
  const { user } = useAuth();
  return preview.enabled || !isTrainerRole(user?.role);
}

/** En vista previa «Atleta cedido», sustituye al entrenador por el atleta de demostración. */
export function useAthletePreviewEffectiveUser(): UserProfile | null {
  const preview = useAthletePreviewMode();
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return null;
    if (!preview.enabled) return user;

    if (preview.simulateCededAthlete && preview.previewSubject) {
      const subject = preview.previewSubject;
      return {
        ...user,
        id: subject.id,
        name: subject.name,
        email: subject.email,
        avatarInitials: subject.avatarInitials,
        role: 'atleta',
        currentPrograms: subject.currentPrograms,
        currentProgram: subject.currentPrograms[0],
        currentProgramId: subject.currentPrograms[0]?.id,
      };
    }

    return user;
  }, [preview.enabled, preview.previewSubject, preview.simulateCededAthlete, user]);
}
