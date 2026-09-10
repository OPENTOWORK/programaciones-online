import {
  cssVarsFromPalette,
  darkSurfacePalette,
  lightSurfacePalette,
  type AppColorScheme,
  type ThemeSurfacePalette,
} from '@/constants/theme';

export type AppThemeId =
  | 'day'
  | 'night'
  | 'navy'
  | 'forest'
  | 'sand'
  | 'slate'
  | 'teal'
  | 'wine'
  | 'lavender'
  | 'olive'
  | 'rose';

export interface AppThemeDefinition {
  id: AppThemeId;
  label: string;
  swatch: string;
  scheme: AppColorScheme;
  palette: ThemeSurfacePalette;
  /** Tinte que colorea las fotos de cada bloque. */
  coverTint: string;
  coverOverlay: readonly [string, string, string];
}

export const APP_THEME_STORAGE_KEY = 'staff-theme-id';
export const APP_THEME_OVERRIDE_KEY = 'staff-theme-override';
export const APP_THEME_OVERRIDE_UNTIL_KEY = 'staff-theme-override-until';
export const DEFAULT_STAFF_THEME_ID: AppThemeId = 'day';
export const DAY_MODE_START_HOUR = 9;
export const DAY_MODE_END_HOUR = 19;

function richPalette(
  palette: ThemeSurfacePalette,
  overlay: readonly [string, string, string],
): Pick<AppThemeDefinition, 'scheme' | 'palette' | 'coverTint' | 'coverOverlay'> {
  return {
    scheme: 'dark',
    palette,
    coverTint: 'transparent',
    coverOverlay: overlay,
  };
}

const DAY_THEME: AppThemeDefinition = {
  id: 'day',
  label: 'Día',
  swatch: '#F4F6F9',
  scheme: 'light',
  palette: lightSurfacePalette,
  coverTint: 'transparent',
  coverOverlay: ['rgba(15,20,25,0.10)', 'rgba(15,20,25,0.38)', 'rgba(15,20,25,0.58)'],
};

const NIGHT_THEME: AppThemeDefinition = {
  id: 'night',
  label: 'Noche',
  swatch: '#0F1419',
  scheme: 'dark',
  palette: darkSurfacePalette,
  coverTint: 'transparent',
  coverOverlay: ['rgba(15,20,25,0.22)', 'rgba(15,20,25,0.68)', 'rgba(15,20,25,0.90)'],
};

/** Colores del selector. El blanco y el negro van por modo día/noche. */
export const PICKER_THEMES: AppThemeDefinition[] = [
  {
    id: 'navy',
    label: 'Azul',
    swatch: '#3B82C8',
    scheme: 'dark',
    palette: {
      background: '#0C1A2E',
      surface: '#13253F',
      surfaceLight: '#1B3454',
      surfaceGhost: 'rgba(90, 150, 220, 0.10)',
      border: '#2A4A72',
      text: '#F3F7FC',
      textSecondary: '#A9C0D8',
      textMuted: '#7A9BB8',
      overlay: 'rgba(6, 14, 28, 0.55)',
      accent: '#5BA3E8',
      accentDark: '#3B82C8',
    },
    coverTint: 'transparent',
    coverOverlay: ['rgba(8, 20, 42, 0.12)', 'rgba(8, 20, 42, 0.48)', 'rgba(6, 16, 36, 0.78)'],
  },
  {
    id: 'forest',
    label: 'Verde',
    swatch: '#43A047',
    ...richPalette(
      {
        background: '#0D1A10',
        surface: '#152A18',
        surfaceLight: '#1E3822',
        surfaceGhost: 'rgba(67, 160, 71, 0.12)',
        border: '#2E5A34',
        text: '#F2F7F2',
        textSecondary: '#A8C4A8',
        textMuted: '#7A947A',
        overlay: 'rgba(8, 16, 10, 0.55)',
        accent: '#66BB6A',
        accentDark: '#43A047',
      },
      ['rgba(12, 28, 16, 0.12)', 'rgba(12, 28, 16, 0.48)', 'rgba(8, 20, 12, 0.78)'],
    ),
  },
  {
    id: 'sand',
    label: 'Arena',
    swatch: '#A08A72',
    ...richPalette(
      {
        background: '#141210',
        surface: '#1C1A16',
        surfaceLight: '#26221C',
        surfaceGhost: 'rgba(194, 176, 154, 0.10)',
        border: '#3A342C',
        text: '#F6F1EA',
        textSecondary: '#C2B6A6',
        textMuted: '#8E8476',
        overlay: 'rgba(12, 10, 8, 0.55)',
        accent: '#C2B09A',
        accentDark: '#A08A72',
      },
      ['rgba(18, 16, 12, 0.14)', 'rgba(18, 16, 12, 0.50)', 'rgba(12, 12, 10, 0.80)'],
    ),
  },
  {
    id: 'slate',
    label: 'Niebla',
    swatch: '#6E7884',
    ...richPalette(
      {
        background: '#131518',
        surface: '#1A1D21',
        surfaceLight: '#24282E',
        surfaceGhost: 'rgba(142, 154, 166, 0.10)',
        border: '#363C44',
        text: '#F1F3F5',
        textSecondary: '#A8B0B8',
        textMuted: '#7A848C',
        overlay: 'rgba(10, 12, 14, 0.55)',
        accent: '#8E9AA6',
        accentDark: '#6E7884',
      },
      ['rgba(16, 18, 22, 0.14)', 'rgba(18, 20, 24, 0.50)', 'rgba(10, 12, 16, 0.80)'],
    ),
  },
  {
    id: 'teal',
    label: 'Agua',
    swatch: '#4E7A76',
    ...richPalette(
      {
        background: '#0E1617',
        surface: '#151F21',
        surfaceLight: '#1C2A2C',
        surfaceGhost: 'rgba(106, 154, 150, 0.10)',
        border: '#2E3E40',
        text: '#F0F5F5',
        textSecondary: '#A4B6B6',
        textMuted: '#7A8C8C',
        overlay: 'rgba(8, 12, 14, 0.55)',
        accent: '#6A9A96',
        accentDark: '#4E7A76',
      },
      ['rgba(10, 18, 20, 0.14)', 'rgba(10, 18, 20, 0.50)', 'rgba(8, 14, 16, 0.80)'],
    ),
  },
  {
    id: 'wine',
    label: 'Rosa',
    swatch: '#E0567A',
    ...richPalette(
      {
        background: '#1A1016',
        surface: '#281820',
        surfaceLight: '#382430',
        surfaceGhost: 'rgba(224, 86, 122, 0.12)',
        border: '#5A3040',
        text: '#FDF2F5',
        textSecondary: '#D4A8B4',
        textMuted: '#A07884',
        overlay: 'rgba(16, 8, 12, 0.55)',
        accent: '#F07A96',
        accentDark: '#E0567A',
      },
      ['rgba(28, 12, 20, 0.12)', 'rgba(28, 12, 20, 0.48)', 'rgba(20, 8, 16, 0.78)'],
    ),
  },
  {
    id: 'lavender',
    label: 'Lavanda',
    swatch: '#7A6E88',
    ...richPalette(
      {
        background: '#141318',
        surface: '#1C1A22',
        surfaceLight: '#26222C',
        surfaceGhost: 'rgba(160, 144, 176, 0.10)',
        border: '#38343F',
        text: '#F3F1F6',
        textSecondary: '#B4AEC0',
        textMuted: '#868094',
        overlay: 'rgba(10, 10, 14, 0.55)',
        accent: '#A090B0',
        accentDark: '#7A6E88',
      },
      ['rgba(16, 14, 22, 0.14)', 'rgba(16, 14, 22, 0.50)', 'rgba(12, 10, 18, 0.80)'],
    ),
  },
  {
    id: 'olive',
    label: 'Oliva',
    swatch: '#7E7858',
    ...richPalette(
      {
        background: '#13140F',
        surface: '#1A1C16',
        surfaceLight: '#24261C',
        surfaceGhost: 'rgba(168, 160, 122, 0.10)',
        border: '#38382C',
        text: '#F3F3EC',
        textSecondary: '#B8B4A0',
        textMuted: '#8A8878',
        overlay: 'rgba(10, 12, 8, 0.55)',
        accent: '#A8A07A',
        accentDark: '#7E7858',
      },
      ['rgba(16, 18, 12, 0.14)', 'rgba(16, 18, 12, 0.50)', 'rgba(12, 14, 10, 0.80)'],
    ),
  },
  {
    id: 'rose',
    label: 'Rosa suave',
    swatch: '#C47D8C',
    ...richPalette(
      {
        background: '#181216',
        surface: '#241A1E',
        surfaceLight: '#302428',
        surfaceGhost: 'rgba(196, 125, 140, 0.10)',
        border: '#4A3840',
        text: '#F7F0F2',
        textSecondary: '#C8B0B6',
        textMuted: '#947C84',
        overlay: 'rgba(12, 10, 12, 0.55)',
        accent: '#D49AAA',
        accentDark: '#C47D8C',
      },
      ['rgba(24, 16, 20, 0.12)', 'rgba(24, 16, 20, 0.48)', 'rgba(16, 12, 16, 0.78)'],
    ),
  },
];

export const APP_THEMES: AppThemeDefinition[] = [DAY_THEME, NIGHT_THEME, ...PICKER_THEMES];

const THEMES_BY_ID = Object.fromEntries(APP_THEMES.map((theme) => [theme.id, theme])) as Record<
  AppThemeId,
  AppThemeDefinition
>;

const PICKER_THEME_IDS = new Set(PICKER_THEMES.map((theme) => theme.id));

export function isPickerThemeId(id: string | null | undefined): boolean {
  return Boolean(id && PICKER_THEME_IDS.has(id as AppThemeId));
}

export function scheduledDayNightThemeId(now = new Date()): 'day' | 'night' {
  const hour = now.getHours();
  return hour >= DAY_MODE_START_HOUR && hour < DAY_MODE_END_HOUR ? 'day' : 'night';
}

export function nextScheduleBoundary(now = new Date()): Date {
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setMilliseconds(0);

  if (now.getHours() < DAY_MODE_START_HOUR) {
    next.setHours(DAY_MODE_START_HOUR, 0, 0, 0);
    return next;
  }

  if (now.getHours() < DAY_MODE_END_HOUR) {
    next.setHours(DAY_MODE_END_HOUR, 0, 0, 0);
    return next;
  }

  next.setDate(next.getDate() + 1);
  next.setHours(DAY_MODE_START_HOUR, 0, 0, 0);
  return next;
}

function clearThemeOverride() {
  window.localStorage.removeItem(APP_THEME_OVERRIDE_KEY);
  window.localStorage.removeItem(APP_THEME_OVERRIDE_UNTIL_KEY);
}

export function resolveStaffThemeId(): AppThemeId {
  if (typeof window === 'undefined') return scheduledDayNightThemeId();

  try {
    const stored = window.localStorage.getItem(APP_THEME_STORAGE_KEY);
    if (isPickerThemeId(stored) && isAppThemeId(stored)) return stored;

    const override = window.localStorage.getItem(APP_THEME_OVERRIDE_KEY);
    const until = Number(window.localStorage.getItem(APP_THEME_OVERRIDE_UNTIL_KEY) ?? 0);
    if ((override === 'day' || override === 'night') && until > Date.now()) {
      return override;
    }
    if (override) clearThemeOverride();
  } catch {
    // ignore storage failures
  }

  return scheduledDayNightThemeId();
}

export function persistStaffThemeChoice(id: AppThemeId) {
  if (typeof window === 'undefined') return;

  try {
    if (isPickerThemeId(id)) {
      window.localStorage.setItem(APP_THEME_STORAGE_KEY, id);
      clearThemeOverride();
      return;
    }

    window.localStorage.removeItem(APP_THEME_STORAGE_KEY);
    if (id === scheduledDayNightThemeId()) {
      clearThemeOverride();
      return;
    }

    window.localStorage.setItem(APP_THEME_OVERRIDE_KEY, id);
    window.localStorage.setItem(APP_THEME_OVERRIDE_UNTIL_KEY, String(nextScheduleBoundary().getTime()));
  } catch {
    // ignore storage failures
  }
}

export function themeBootScript() {
  const palettes = Object.fromEntries(APP_THEMES.map((theme) => [theme.id, cssVarsFromPalette(theme.palette)]));
  const schemes = Object.fromEntries(APP_THEMES.map((theme) => [theme.id, theme.scheme]));
  const pickerIds = Object.fromEntries(PICKER_THEMES.map((theme) => [theme.id, true]));
  return `(function(){try{var palettes=${JSON.stringify(palettes)};var schemes=${JSON.stringify(schemes)};var pickers=${JSON.stringify(pickerIds)};var stored=localStorage.getItem(${JSON.stringify(APP_THEME_STORAGE_KEY)});var id;if(stored&&pickers[stored]){id=stored;}else{var override=localStorage.getItem(${JSON.stringify(APP_THEME_OVERRIDE_KEY)});var until=parseInt(localStorage.getItem(${JSON.stringify(APP_THEME_OVERRIDE_UNTIL_KEY)})||'0',10);if((override==='day'||override==='night')&&until>Date.now()){id=override;}else{id='night';}}var v=palettes[id];if(!v)return;var r=document.documentElement;r.setAttribute('data-theme',id);r.style.colorScheme=schemes[id]||'dark';document.body.style.background=v['--app-background'];for(var k in v){r.style.setProperty(k,v[k]);}}catch(e){}})();`;
}

export function isAppThemeId(value: string | null | undefined): value is AppThemeId {
  return Boolean(value && value in THEMES_BY_ID);
}

export function getAppTheme(id?: string | null): AppThemeDefinition {
  if (isAppThemeId(id)) return THEMES_BY_ID[id];
  return THEMES_BY_ID[DEFAULT_STAFF_THEME_ID];
}
