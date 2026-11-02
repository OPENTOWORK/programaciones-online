import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';
import {
  loadAthleteMobilePreviewSubject,
  type AthleteMobilePreviewSubject,
} from '@/lib/athleteMobilePreview';
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

const AthletePreviewContext = createContext<AthletePreviewContextValue>({
  enabled: false,
  activeTab: 'home',
  setActiveTab: () => undefined,
  simulateCededAthlete: false,
  setSimulateCededAthlete: () => undefined,
  previewSubject: null,
  previewSubjectLoading: false,
});

export function AthletePreviewProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<AthletePreviewTab>('home');
  const [simulateCededAthlete, setSimulateCededAthlete] = useState(true);
  const [previewSubject, setPreviewSubject] = useState<AthleteMobilePreviewSubject | null>(null);
  const [previewSubjectLoading, setPreviewSubjectLoading] = useState(false);

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
    [activeTab, previewSubject, previewSubjectLoading, simulateCededAthlete],
  );

  return <AthletePreviewContext.Provider value={value}>{children}</AthletePreviewContext.Provider>;
}

export function useAthletePreviewMode() {
  return useContext(AthletePreviewContext);
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
