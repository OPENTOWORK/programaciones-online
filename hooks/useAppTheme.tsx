import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import {
  APP_THEMES,
  getAppTheme,
  nextScheduleBoundary,
  persistStaffThemeChoice,
  resolveStaffThemeId,
  type AppThemeDefinition,
  type AppThemeId,
} from '@/constants/appThemes';
import { applyThemePalette, type AppColorScheme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isBackofficeRole } from '@/lib/athleteService';

interface AppThemeContextValue {
  scheme: AppColorScheme;
  theme: AppThemeDefinition;
  themeId: AppThemeId;
  nightMode: boolean;
  canChooseTheme: boolean;
  canToggleNightMode: boolean;
  setThemeId: (id: AppThemeId) => void;
  toggleNightMode: () => void;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isStaff = isBackofficeRole(user?.role);
  const canChooseTheme = Platform.OS === 'web' && isStaff;
  const canToggleNightMode = canChooseTheme;
  const [themeId, setThemeIdState] = useState<AppThemeId>(resolveStaffThemeId);

  // Sin sesión (login/registro) siempre modo noche para que no mezcle fondo oscuro con tarjeta clara.
  const theme = user && canChooseTheme ? getAppTheme(themeId) : getAppTheme('night');
  const scheme = theme.scheme;
  const nightMode = theme.id === 'night';

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    applyThemePalette(theme.scheme, theme.palette, theme.id);
  }, [theme]);

  useEffect(() => {
    if (!canChooseTheme || Platform.OS !== 'web' || typeof window === 'undefined') return;

    const applyResolved = () => setThemeIdState(resolveStaffThemeId());
    applyResolved();

    const onVisible = () => {
      if (document.visibilityState === 'visible') applyResolved();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', applyResolved);

    let timeoutId: ReturnType<typeof setTimeout>;
    const arm = () => {
      const delay = Math.max(250, nextScheduleBoundary().getTime() - Date.now());
      timeoutId = setTimeout(() => {
        applyResolved();
        arm();
      }, Math.min(delay, 60 * 60 * 1000));
    };
    arm();

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', applyResolved);
    };
  }, [canChooseTheme]);

  const setThemeId = useCallback(
    (id: AppThemeId) => {
      if (!canChooseTheme) return;
      persistStaffThemeChoice(id);
      setThemeIdState(id);
    },
    [canChooseTheme],
  );

  const toggleNightMode = useCallback(() => {
    if (!canToggleNightMode) return;
    setThemeId(nightMode ? 'day' : 'night');
  }, [canToggleNightMode, nightMode, setThemeId]);

  const value = useMemo(
    () => ({
      scheme,
      theme,
      themeId: theme.id,
      nightMode,
      canChooseTheme,
      canToggleNightMode,
      setThemeId,
      toggleNightMode,
    }),
    [canChooseTheme, canToggleNightMode, nightMode, scheme, setThemeId, theme, toggleNightMode],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);
  if (!value) {
    const theme = getAppTheme('night');
    return {
      scheme: theme.scheme,
      theme,
      themeId: theme.id,
      nightMode: true,
      canChooseTheme: false,
      canToggleNightMode: false,
      setThemeId: () => undefined,
      toggleNightMode: () => undefined,
    };
  }
  return value;
}

export { APP_THEMES };
export type { AppThemeId };
