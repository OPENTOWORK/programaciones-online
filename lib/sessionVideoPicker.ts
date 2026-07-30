import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const MAX_VIDEO_DURATION_SEC = 300;

export async function pickSessionVideo() {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { error: 'Necesitamos permiso para acceder a tus videos' };
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsEditing: false,
    videoMaxDuration: MAX_VIDEO_DURATION_SEC,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return { cancelled: true as const };
  }

  const asset = result.assets[0];
  const fileName = asset.fileName ?? `video-${Date.now()}.mp4`;

  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'video/mp4',
    fileName,
    duration: asset.duration ?? undefined,
  };
}
