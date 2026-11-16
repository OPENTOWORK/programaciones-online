import { getAppTheme, type AppThemeDefinition } from '@/constants/appThemes';
import type { BrandColorOverrides } from '@/constants/theme';

export type AthleteColorsId = 'night' | 'pastel';

/**
 * Colores del atleta en la web (en la app instalada siguen los de noche).
 * 'pastel' es la prueba en gris claro con celeste y rosa; 'night' vuelve a los de siempre.
 */
export const ATHLETE_COLORS_DEFAULT: AthleteColorsId = 'pastel';

export interface AthleteColors {
  id: AthleteColorsId;
  label: string;
  theme: AppThemeDefinition;
  brand?: BrandColorOverrides;
  /** Celeste y rosa a partes iguales, cada uno en su mitad (sin degradado). */
  duo?: readonly [string, string];
}

const SKY = '#4AA3D6';
const SKY_INK = '#2B87BC';
const SKY_TINT = '#DFF1FB';
const PINK = '#E8829F';
const PINK_INK = '#C2527B';
const PINK_SOFT = '#F6B9CC';

const INK = '#1F2633';
const INK_SECONDARY = '#5B6576';
const LINE = '#DCE1E8';

const PASTEL_THEME: AppThemeDefinition = {
  id: 'pastel',
  label: 'Celeste y rosa',
  swatch: '#EDEFF3',
  scheme: 'light',
  palette: {
    background: '#EDEFF3',
    surface: '#FFFFFF',
    surfaceLight: '#F4F6F9',
    surfaceGhost: 'rgba(31, 38, 51, 0.04)',
    border: LINE,
    text: INK,
    textSecondary: INK_SECONDARY,
    textMuted: '#8A93A2',
    overlay: 'rgba(31, 38, 51, 0.35)',
    accent: SKY,
    accentDark: SKY_INK,
  },
  coverTint: 'transparent',
  coverOverlay: ['rgba(15,20,25,0.10)', 'rgba(15,20,25,0.38)', 'rgba(15,20,25,0.58)'],
};

const ATHLETE_COLORS: Record<AthleteColorsId, AthleteColors> = {
  night: {
    id: 'night',
    label: 'Actuales',
    theme: getAppTheme('night'),
  },
  pastel: {
    id: 'pastel',
    label: 'Prueba celeste y rosa',
    theme: PASTEL_THEME,
    // Celeste para títulos, navegación y precios; rosa para etiquetas y acciones.
    brand: {
      title: SKY_INK,
      titleGlow: 'transparent',
      tag: PINK_INK,
      body: INK_SECONDARY,
      card: '#FFFFFF',
      cardBorder: LINE,
      action: PINK,
      actionInk: PINK_INK,
      button: PINK_SOFT,
      buttonEdge: PINK,
      buttonShadow: 'rgba(232, 130, 159, 0.28)',
      onButton: INK,
      price: SKY_INK,
      pill: SKY_TINT,
      pillBorder: '#B9DFF4',
      inactive: '#C9D0DA',
      trial: SKY_INK,
      rest: SKY_INK,
    },
    duo: [SKY, PINK],
  },
};

export const ATHLETE_COLOR_OPTIONS: AthleteColors[] = [ATHLETE_COLORS.night, ATHLETE_COLORS.pastel];

export function getAthleteColors(id: AthleteColorsId = ATHLETE_COLORS_DEFAULT): AthleteColors {
  return ATHLETE_COLORS[id];
}
