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

async function compressImageWeb(
  uri: string,
  mimeType: string,
  maxWidth: number,
  quality: number,
  file?: File,
): Promise<PreparedUpload> {
  if (typeof document === 'undefined') {
    return { uri, mimeType, file };
  }

  try {
    const objectUrl = file ? URL.createObjectURL(file) : uri;
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image load failed'));
      img.src = objectUrl;
    });

    if (file) URL.revokeObjectURL(objectUrl);

    const scale = image.naturalWidth > maxWidth ? maxWidth / image.naturalWidth : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { uri, mimeType, file };

    ctx.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });
    if (!blob) return { uri, mimeType, file };

    const nextFile = new File([blob], 'upload.jpg', { type: 'image/jpeg' });
    return { uri: URL.createObjectURL(blob), mimeType: 'image/jpeg', file: nextFile };
  } catch {
    return { uri, mimeType, file };
  }
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
  return compressImageWeb(uri, mimeType, maxWidth, compress, file);
}

export async function prepareVideoForUpload(
  uri: string,
  mimeType: string,
  file?: File,
): Promise<PreparedUpload> {
  return { uri, mimeType, file };
}

export async function prepareAudioForUpload(uri: string, mimeType: string): Promise<PreparedUpload> {
  return { uri, mimeType };
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
