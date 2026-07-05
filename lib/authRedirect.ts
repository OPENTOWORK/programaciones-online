import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export function getPasswordResetRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth/update-password`;
  }

  return Linking.createURL('/auth/update-password');
}
