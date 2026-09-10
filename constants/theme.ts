import { Platform } from 'react-native';

export type AppColorScheme = 'light' | 'dark';

export const APP_COLOR_SCHEME_STORAGE_KEY = 'app-color-scheme';

/** Colores que cambian entre claro y oscuro. */
/** Paleta de marca Training ProgLine. */
export const brandColors = {
  /** Naranja cobre/ámbar del logo (sin tono neón). */
  orange: '#D4844A',
  orangeDark: '#A85F2E',
  orangeLight: '#E8A86A',
  orangeGlow: '#F0B87A',
  /** Título principal de servicio (Personal, Training…). */
  orangeHighlight: '#FFA23A',
  /** Botón de acción: naranja intenso (más fuerte que el título). */
  orangeAction: '#FF6A00',
  /** Subtítulo y descripción: naranja visible pero por debajo del título. */
  orangeSecondary: '#E08A45',
  /** Plateado cepillado del logo Training ProgLine. */
  silver: '#CDD3DB',
  silverLight: '#EEF1F5',
  silverMid: '#B5BDC8',
  silverDark: '#8B95A3',
  silverDeep: '#6E7886',
} as const;

export type ThemeSurfacePalette = {
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceGhost: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  overlay: string;
  accent: string;
  accentDark: string;
};

const THEME_CSS_VARS = {
  background: '--app-background',
  surface: '--app-surface',
  surfaceLight: '--app-surface-light',
  surfaceGhost: '--app-surface-ghost',
  border: '--app-border',
  text: '--app-text',
  textSecondary: '--app-text-secondary',
  textMuted: '--app-text-muted',
  overlay: '--app-overlay',
  accent: '--app-accent',
  accentDark: '--app-accent-dark',
} as const;

export const darkSurfacePalette: ThemeSurfacePalette = {
  background: '#0F1419',
  surface: '#1A2332',
  surfaceLight: '#243044',
  surfaceGhost: 'rgba(255, 255, 255, 0.03)',
  border: '#2D3A4F',
  text: '#F0F4F8',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  overlay: 'rgba(0, 0, 0, 0.6)',
  accent: brandColors.orange,
  accentDark: brandColors.orangeDark,
};

export const lightSurfacePalette: ThemeSurfacePalette = {
  background: '#F4F6F9',
  surface: '#FFFFFF',
  surfaceLight: '#EEF1F6',
  surfaceGhost: 'rgba(15, 23, 42, 0.04)',
  border: '#D8DEE9',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  overlay: 'rgba(15, 20, 25, 0.45)',
  accent: brandColors.orange,
  accentDark: brandColors.orangeDark,
};

export function paletteForScheme(scheme: AppColorScheme): ThemeSurfacePalette {
  return scheme === 'light' ? lightSurfacePalette : darkSurfacePalette;
}

export function cssVarsFromPalette(palette: ThemeSurfacePalette): Record<string, string> {
  return {
    [THEME_CSS_VARS.background]: palette.background,
    [THEME_CSS_VARS.surface]: palette.surface,
    [THEME_CSS_VARS.surfaceLight]: palette.surfaceLight,
    [THEME_CSS_VARS.surfaceGhost]: palette.surfaceGhost,
    [THEME_CSS_VARS.border]: palette.border,
    [THEME_CSS_VARS.text]: palette.text,
    [THEME_CSS_VARS.textSecondary]: palette.textSecondary,
    [THEME_CSS_VARS.textMuted]: palette.textMuted,
    [THEME_CSS_VARS.overlay]: palette.overlay,
    [THEME_CSS_VARS.accent]: palette.accent,
    [THEME_CSS_VARS.accentDark]: palette.accentDark,
  };
}

export function rootThemeCss(scheme: AppColorScheme = 'dark') {
  const vars = cssVarsFromPalette(paletteForScheme(scheme));
  const body = Object.entries(vars)
    .map(([name, value]) => `${name}: ${value};`)
    .join(' ');
  return `:root { color-scheme: ${scheme}; ${body} }`;
}

export function applyThemePalette(
  scheme: AppColorScheme,
  palette: ThemeSurfacePalette,
  themeId: string = scheme,
) {
  if (typeof document === 'undefined') return;

  const vars = cssVarsFromPalette(palette);
  const root = document.documentElement;

  root.setAttribute('data-theme', themeId);
  root.style.colorScheme = scheme;

  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }

  document.body.style.background = palette.background;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  themeMeta?.setAttribute('content', palette.background);

  try {
    window.localStorage.setItem(APP_COLOR_SCHEME_STORAGE_KEY, scheme);
  } catch {
    // ignore storage failures
  }
}

export function applyAppColorScheme(scheme: AppColorScheme) {
  applyThemePalette(scheme, paletteForScheme(scheme));
}

function themeToken(cssVar: string, fallback: string) {
  return Platform.OS === 'web' ? `var(${cssVar})` : fallback;
}

/** Convierte un color de tema + alpha hex en un valor usable en web (CSS vars) y nativo. */
export function withAlpha(color: string, hexAlpha: string) {
  if (color.startsWith('var(')) {
    const pct = Math.round((parseInt(hexAlpha, 16) / 255) * 100);
    // Prefijo var() para que react-native-web no descarte color-mix.
    return `var(--app-alpha, color-mix(in srgb, ${color} ${pct}%, transparent))`;
  }
  return `${color}${hexAlpha}`;
}

export const colors = {
  background: themeToken(THEME_CSS_VARS.background, darkSurfacePalette.background),
  surface: themeToken(THEME_CSS_VARS.surface, darkSurfacePalette.surface),
  surfaceLight: themeToken(THEME_CSS_VARS.surfaceLight, darkSurfacePalette.surfaceLight),
  surfaceGhost: themeToken(THEME_CSS_VARS.surfaceGhost, darkSurfacePalette.surfaceGhost),
  border: themeToken(THEME_CSS_VARS.border, darkSurfacePalette.border),
  text: themeToken(THEME_CSS_VARS.text, darkSurfacePalette.text),
  textSecondary: themeToken(THEME_CSS_VARS.textSecondary, darkSurfacePalette.textSecondary),
  textMuted: themeToken(THEME_CSS_VARS.textMuted, darkSurfacePalette.textMuted),
  overlay: themeToken(THEME_CSS_VARS.overlay, darkSurfacePalette.overlay),
  accent: themeToken(THEME_CSS_VARS.accent, darkSurfacePalette.accent),
  accentDark: themeToken(THEME_CSS_VARS.accentDark, darkSurfacePalette.accentDark),
  accentBlue: '#00B8D4',
  /** Naranja claro de marca para activación y avisos. */
  activation: brandColors.orangeLight,
  /** Azul para las sesiones de metcon. */
  metcon: '#4C9AFF',
  /** Azul apagado para los días de descanso. */
  restDay: '#7C9CBF',
  warning: brandColors.orangeLight,
  danger: '#FF5252',
  success: '#4ADE80',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const levelColors = {
  principiante: '#4ADE80',
  intermedio: brandColors.orangeLight,
  avanzado: '#FF5252',
};

export const statusColors = {
  disponible: brandColors.orange,
  activa: '#00B8D4',
  bloqueada: '#64748B',
  personalizada: '#B388FF',
};

export const goalLabels = {
  fuerza: 'Fuerza',
  hipertrofia: 'Hipertrofia',
  'pérdida de grasa': 'Pérdida de grasa',
  rendimiento: 'Rendimiento',
  movilidad: 'Movilidad',
};

export const categoryLabels = {
  standard: 'Base · Training',
  hype: 'Training · Performance',
  personalized: 'Personal · Coaching',
  nutrition: 'Nutrition · Plan',
  home_training: 'Home · Coaching',
  gym_training: 'Gym · Programming',
};
