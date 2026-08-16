import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const MAX_VIDEO_DURATION_SEC = 300;

export type SessionVideoSource = 'camera' | 'library';

type SessionVideoPickResult =
  | {
      uri: string;
      mimeType: string;
      fileName: string;
      duration?: number;
    }
  | { cancelled: true }
  | { error: string };

async function assetFromResult(result: ImagePicker.ImagePickerResult): Promise<SessionVideoPickResult> {
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

export async function pickSessionVideo(source: SessionVideoSource = 'library'): Promise<SessionVideoPickResult> {
  if (source === 'camera') {
    if (Platform.OS === 'web') {
      // En web la cámara de ImagePicker no graba vídeo de forma fiable; usamos galería.
      return pickSessionVideo('library');
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return { error: 'Necesitamos permiso para usar la cámara' };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      videoMaxDuration: MAX_VIDEO_DURATION_SEC,
      quality: 0.8,
      cameraType: ImagePicker.CameraType.back,
    });

    return assetFromResult(result);
  }

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

  return assetFromResult(result);
}
