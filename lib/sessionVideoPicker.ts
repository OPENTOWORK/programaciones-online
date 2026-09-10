import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { ensureMediaLibraryPickerAccess } from '@/lib/mediaLibraryPicker';

const MAX_VIDEO_DURATION_SEC = 300;

export type SessionVideoSource = 'camera' | 'library';

export type SessionVideoAsset = {
  uri: string;
  mimeType: string;
  fileName: string;
  duration?: number;
  file?: File;
};

export type SessionVideoPickOptions = {
  allowsEditing?: boolean;
};

type SessionVideoPickResult =
  | SessionVideoAsset
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

/** En el navegador (sobre todo el móvil) abre la cámara nativa para grabar. */
function pickWebCameraVideo(): Promise<SessionVideoPickResult> {
  if (typeof document === 'undefined') {
    return Promise.resolve({ error: 'La cámara no está disponible en este dispositivo' });
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.multiple = false;
    input.setAttribute('capture', 'environment');
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.width = '1px';
    input.style.height = '1px';

    let settled = false;
    const finish = (result: SessionVideoPickResult) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(result);
    };

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        finish({ cancelled: true });
        return;
      }

      finish({
        uri: URL.createObjectURL(file),
        mimeType: file.type || 'video/mp4',
        fileName: file.name || `video-${Date.now()}.mp4`,
        file,
      });
    });

    input.addEventListener('cancel', () => finish({ cancelled: true }));
    document.body.appendChild(input);
    input.click();
  });
}

export async function pickSessionVideo(
  source: SessionVideoSource = 'library',
  options: SessionVideoPickOptions = {},
): Promise<SessionVideoPickResult> {
  const allowsEditing = options.allowsEditing ?? false;

  if (source === 'camera') {
    if (Platform.OS === 'web') {
      return pickWebCameraVideo();
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return { error: 'Necesitamos permiso para usar la cámara' };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing,
      videoMaxDuration: MAX_VIDEO_DURATION_SEC,
      quality: 1,
      cameraType: ImagePicker.CameraType.back,
    });

    return assetFromResult(result);
  }

  const permission = await ensureMediaLibraryPickerAccess();
  if (!permission.granted) {
    return { error: 'Necesitamos permiso para acceder a tus videos' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsEditing,
    videoMaxDuration: MAX_VIDEO_DURATION_SEC,
    quality: allowsEditing ? 1 : 0.8,
  });

  return assetFromResult(result);
}

/** Vuelve a abrir cámara o galería para ajustar el vídeo antes de enviarlo. */
export async function editSessionVideoBeforeSend(
  source: SessionVideoSource,
): Promise<SessionVideoPickResult> {
  return pickSessionVideo(source, { allowsEditing: Platform.OS === 'ios' });
}
