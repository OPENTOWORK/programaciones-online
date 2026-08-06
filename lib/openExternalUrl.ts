import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';

/** Abre un enlace fuera de la app: pestaña nueva en web, app nativa si puede, navegador dentro de la app si no. */
export async function openExternalUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return;
  }

  await WebBrowser.openBrowserAsync(url);
}
