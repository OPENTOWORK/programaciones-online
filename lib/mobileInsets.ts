import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Altura típica de la barra de navegación de 3 botones en Android. */
const ANDROID_NAV_BAR_HEIGHT = 48;

/**
 * Inset inferior fiable para barras fijas (tab bar, compositors, etc.).
 * En algunos Android `insets.bottom` llega a 0 aunque la barra del sistema tape la UI.
 */
export function useBottomSafeInset(minimum = 8) {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'web') {
    return minimum;
  }

  if (Platform.OS === 'android' && insets.bottom === 0) {
    return ANDROID_NAV_BAR_HEIGHT;
  }

  return Math.max(insets.bottom, minimum);
}

/** Altura aproximada de la tab bar propia (iconos + etiquetas), sin el inset del sistema. */
export const ATHLETE_TAB_BAR_HEIGHT = 56;
