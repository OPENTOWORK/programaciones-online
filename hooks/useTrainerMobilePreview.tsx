import type { Href } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  hrefToTrainerPreviewNavAction,
  type TrainerPreviewRoute,
} from '@/lib/trainerMobilePreviewRoutes';

export type TrainerPreviewTab = 'home' | 'programs' | 'trainer' | 'chats' | 'profile';

type TrainerMobilePreviewContextValue = {
  enabled: boolean;
  activeTab: TrainerPreviewTab;
  setActiveTab: (tab: TrainerPreviewTab) => void;
};

type TrainerMobilePreviewNavigationValue = {
  stack: TrainerPreviewRoute[];
  pushHref: (href: Href) => boolean;
  replaceHref: (href: Href) => boolean;
  pop: () => boolean;
  resetStack: () => void;
  canGoBack: () => boolean;
};

const TrainerMobilePreviewContext = createContext<TrainerMobilePreviewContextValue>({
  enabled: false,
  activeTab: 'home',
  setActiveTab: () => undefined,
});

const TrainerMobilePreviewNavigationContext = createContext<TrainerMobilePreviewNavigationValue | null>(
  null,
);

export function TrainerMobilePreviewProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const [activeTab, setActiveTabState] = useState<TrainerPreviewTab>('home');
  const [stack, setStack] = useState<TrainerPreviewRoute[]>([]);

  const setActiveTab = useCallback((tab: TrainerPreviewTab) => {
    setStack([]);
    setActiveTabState(tab);
  }, []);

  const applyNavAction = useCallback(
    (href: Href, mode: 'push' | 'replace') => {
      const action = hrefToTrainerPreviewNavAction(href);
      if (!action) return false;

      if (action.kind === 'reset-tabs') {
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
    },
    [],
  );

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

  const previewValue = useMemo(
    () =>
      enabled
        ? { enabled: true, activeTab, setActiveTab }
        : { enabled: false, activeTab: 'home' as TrainerPreviewTab, setActiveTab: () => undefined },
    [activeTab, enabled, setActiveTab],
  );

  const navValue = useMemo(
    () =>
      enabled
        ? {
            stack,
            pushHref,
            replaceHref,
            pop,
            resetStack,
            canGoBack,
          }
        : null,
    [canGoBack, enabled, pop, pushHref, replaceHref, resetStack, stack],
  );

  return (
    <TrainerMobilePreviewContext.Provider value={previewValue}>
      <TrainerMobilePreviewNavigationContext.Provider value={navValue}>
        {children}
      </TrainerMobilePreviewNavigationContext.Provider>
    </TrainerMobilePreviewContext.Provider>
  );
}

export function useTrainerMobilePreviewMode() {
  return useContext(TrainerMobilePreviewContext);
}

export function useTrainerMobilePreviewNavigation() {
  const preview = useTrainerMobilePreviewMode();
  const nav = useContext(TrainerMobilePreviewNavigationContext);
  if (!preview.enabled || !nav) return null;
  return nav;
}
