import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

import { logReleaseDiagnostic, logReleaseError } from '@/lib/releaseDiagnostics';

/**
 * Bloquea capturas y grabaciones de pantalla en móvil para que las programaciones
 * no se puedan compartir fuera de la cuenta que las ha pagado.
 *
 * En web no hay API equivalente: el navegador siempre permite capturar.
 */
export async function enableScreenCaptureProtection() {
  if (Platform.OS === 'web') return;

  try {
    const available = await ScreenCapture.isAvailableAsync();
    if (!available) {
      logReleaseDiagnostic('screen_capture_protection_unavailable', {}, 'warn');
      return;
    }

    await ScreenCapture.preventScreenCaptureAsync();

    // En iOS además oculta el contenido en el selector de apps; en Android lo hace FLAG_SECURE.
    if (Platform.OS === 'ios') {
      await ScreenCapture.enableAppSwitcherProtectionAsync();
    }

    logReleaseDiagnostic('screen_capture_protection_enabled');
  } catch (error) {
    logReleaseError('screen_capture_protection_failed', error);
  }
}
