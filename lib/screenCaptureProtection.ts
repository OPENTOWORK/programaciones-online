import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

import { logReleaseDiagnostic, logReleaseError } from '@/lib/releaseDiagnostics';

/**
 * Interruptor de pantallazos en Android e iOS.
 * `true`: el móvil no puede capturar ni grabar la pantalla.
 * `false`: se vuelven a permitir. El código se queda; solo hay que cambiar esta constante.
 * En la web no tiene efecto: el navegador siempre puede capturar.
 */
export const SCREEN_CAPTURE_BLOCKED = true;

const PROTECTION_KEY = 'training-progline';

/**
 * Aplica el interruptor de arriba al arrancar la app nativa.
 */
export async function enableScreenCaptureProtection() {
  if (Platform.OS === 'web') return;

  try {
    const available = await ScreenCapture.isAvailableAsync();
    if (!available) {
      logReleaseDiagnostic('screen_capture_protection_unavailable', {}, 'warn');
      return;
    }

    if (!SCREEN_CAPTURE_BLOCKED) {
      await ScreenCapture.allowScreenCaptureAsync(PROTECTION_KEY);
      if (Platform.OS === 'ios') {
        await ScreenCapture.disableAppSwitcherProtectionAsync();
      }
      logReleaseDiagnostic('screen_capture_protection_disabled');
      return;
    }

    await ScreenCapture.preventScreenCaptureAsync(PROTECTION_KEY);

    // En iOS además oculta el contenido en el selector de apps; en Android lo hace FLAG_SECURE.
    if (Platform.OS === 'ios') {
      await ScreenCapture.enableAppSwitcherProtectionAsync();
    }

    logReleaseDiagnostic('screen_capture_protection_enabled');
  } catch (error) {
    logReleaseError('screen_capture_protection_failed', error);
  }
}
