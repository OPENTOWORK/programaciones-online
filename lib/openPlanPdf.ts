import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';

export async function openPlanPdf(url: string) {
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
