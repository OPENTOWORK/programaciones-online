import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Reserva inferior típica cuando Android no reporta insets (3 botones o gestos). */
const ANDROID_NAV_BAR_HEIGHT = 48;

/** Icono + etiqueta + padding superior de la tab bar propia, sin inset del sistema. */
const ATHLETE_TAB_BAR_BODY_HEIGHT = 52;

/**
 * Inset inferior fiable para barras fijas (tab bar, compositors, etc.).
 * En algunos Android `insets.bottom` llega a 0 aunque la barra del sistema tape la UI.
 */
export function useBottomSafeInset(minimum = 12) {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'web') {
    return minimum;
  }

  if (Platform.OS === 'android') {
    return Math.max(insets.bottom, ANDROID_NAV_BAR_HEIGHT, minimum);
  }

  return Math.max(insets.bottom, minimum);
}

/** Altura total de la tab bar del atleta (contenido + inset inferior). */
export function useAthleteTabBarHeight() {
  const bottomInset = useBottomSafeInset();
  return ATHLETE_TAB_BAR_BODY_HEIGHT + bottomInset;
}

/** @deprecated Usa useAthleteTabBarHeight(). */
export const ATHLETE_TAB_BAR_HEIGHT = ATHLETE_TAB_BAR_BODY_HEIGHT;
