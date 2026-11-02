import * as ImageManipulator from 'expo-image-manipulator';
import { Audio, Video } from 'react-native-compressor';

export type ImageUploadProfile = 'progress' | 'general';

export type PreparedUpload = {
  uri: string;
  mimeType: string;
  file?: File;
};

function isRasterImageMime(mimeType: string) {
  return mimeType.startsWith('image/') && !mimeType.includes('gif');
}

function isVideoMime(mimeType: string) {
  return mimeType.startsWith('video/');
}

function isAudioMime(mimeType: string) {
  return mimeType.startsWith('audio/');
}

export async function prepareImageForUpload(
  uri: string,
  mimeType: string,
  profile: ImageUploadProfile = 'general',
  file?: File,
): Promise<PreparedUpload> {
  if (!isRasterImageMime(mimeType)) {
    return { uri, mimeType, file };
  }

  const maxWidth = profile === 'progress' ? 1280 : 1600;
  const compress = profile === 'progress' ? 0.72 : 0.78;

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress, format: ImageManipulator.SaveFormat.JPEG },
    );
    return { uri: result.uri, mimeType: 'image/jpeg' };
  } catch {
    return { uri, mimeType, file };
  }
}

export async function prepareVideoForUpload(
  uri: string,
  mimeType: string,
  file?: File,
): Promise<PreparedUpload> {
  if (!isVideoMime(mimeType)) {
    return { uri, mimeType, file };
  }

  try {
    const compressedUri = await Video.compress(
      uri,
      {
        compressionMethod: 'auto',
        maxSize: 1280,
        minimumFileSizeForCompress: 0.25,
      },
      (progress) => {
        void progress;
      },
    );
    return { uri: compressedUri, mimeType: 'video/mp4' };
  } catch {
    return { uri, mimeType, file };
  }
}

export async function prepareAudioForUpload(uri: string, mimeType: string): Promise<PreparedUpload> {
  if (!isAudioMime(mimeType)) {
    return { uri, mimeType };
  }

  try {
    const compressedUri = await Audio.compress(uri, { quality: 'medium' });
    return {
      uri: compressedUri,
      mimeType: mimeType.includes('mpeg') ? 'audio/mpeg' : 'audio/m4a',
    };
  } catch {
    return { uri, mimeType };
  }
}

export async function preparedToArrayBuffer(prepared: PreparedUpload): Promise<ArrayBuffer> {
  if (prepared.file) {
    return prepared.file.arrayBuffer();
  }

  const response = await fetch(prepared.uri);
  if (!response.ok) {
    throw new Error('No se pudo leer el archivo para subir');
  }
  return response.arrayBuffer();
}

export async function prepareMediaForUpload(input: {
  uri: string;
  mimeType: string;
  kind?: 'image' | 'video' | 'audio' | 'gif' | 'file';
  imageProfile?: ImageUploadProfile;
  file?: File;
}): Promise<PreparedUpload> {
  const { uri, mimeType, file } = input;
  const kind = input.kind;

  if (kind === 'gif' || mimeType.includes('gif')) {
    return { uri, mimeType, file };
  }

  if (kind === 'image' || isRasterImageMime(mimeType)) {
    return prepareImageForUpload(uri, mimeType, input.imageProfile ?? 'general', file);
  }

  if (kind === 'video' || isVideoMime(mimeType)) {
    return prepareVideoForUpload(uri, mimeType, file);
  }

  if (kind === 'audio' || isAudioMime(mimeType)) {
    return prepareAudioForUpload(uri, mimeType);
  }

  return { uri, mimeType, file };
}
