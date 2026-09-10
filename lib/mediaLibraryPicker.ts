import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

/**
 * En Android usamos el selector del sistema (Photo Picker), sin permisos READ_MEDIA_*.
 * En iOS seguimos pidiendo acceso a la biblioteca cuando hace falta.
 */
export async function ensureMediaLibraryPickerAccess(writeOnly = false): Promise<{ granted: boolean }> {
  if (Platform.OS !== 'ios') {
    return { granted: true };
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(writeOnly);
  return { granted: permission.granted };
}
