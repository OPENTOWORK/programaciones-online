export const colors = {
  background: '#0F1419',
  surface: '#1A2332',
  surfaceLight: '#243044',
  border: '#2D3A4F',
  text: '#F0F4F8',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accent: '#FF7373',
  accentDark: '#E85F5F',
  accentBlue: '#00B8D4',
  /** Naranja suave para las sesiones de activación. */
  activation: '#FFB27A',
  /** Azul apagado para los días de descanso. */
  restDay: '#7C9CBF',
  warning: '#FFB300',
  danger: '#FF5252',
  success: '#FF7373',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
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
  intermedio: '#FFB300',
  avanzado: '#FF5252',
};

export const statusColors = {
  disponible: '#FF7373',
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
  standard: 'Estándar',
  hype: 'Hype / Intensivas',
  personalized: 'Entrenamiento personalizado',
  nutrition: 'Nutrición',
  home_training: 'Entrenamiento personal en tu domicilio',
  gym_training: 'Programación para tu gimnasio',
};
