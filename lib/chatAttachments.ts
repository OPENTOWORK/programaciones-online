import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import type { ChatAttachmentKind } from '@/lib/types';

export const MAX_CHAT_ATTACHMENTS = 6;

export interface ChatAttachmentDraft {
  kind: ChatAttachmentKind;
  uri: string;
  mimeType: string;
  fileName: string;
  durationSeconds?: number;
}

export function kindFromMime(mimeType: string, fileName: string): ChatAttachmentKind {
  const mime = mimeType.toLowerCase();
  const lowerName = fileName.toLowerCase();
  if (mime.includes('gif') || lowerName.endsWith('.gif')) return 'gif';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'file';
}

function canAddMore(currentCount: number) {
  if (currentCount >= MAX_CHAT_ATTACHMENTS) {
    return { error: `Máximo ${MAX_CHAT_ATTACHMENTS} adjuntos por mensaje.` };
  }
  return null;
}

export async function pickChatImage(fromCamera = false): Promise<{
  draft?: ChatAttachmentDraft;
  error?: string;
  cancelled?: boolean;
}> {
  if (Platform.OS !== 'web') {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { error: fromCamera ? 'Necesitamos permiso para usar la cámara.' : 'Necesitamos permiso para acceder a tus fotos.' };
    }
  }

  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.85,
        videoMaxDuration: 300,
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.85,
        videoMaxDuration: 300,
      });

  if (result.canceled || !result.assets[0]) return { cancelled: true };

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
  const fileName =
    asset.fileName ?? (asset.type === 'video' ? `video-${Date.now()}.mp4` : `foto-${Date.now()}.jpg`);

  return {
    draft: {
      kind: kindFromMime(mimeType, fileName),
      uri: asset.uri,
      mimeType,
      fileName,
      durationSeconds: asset.duration ? Math.round(asset.duration / 1000) : undefined,
    },
  };
}

export async function pickChatVideo(): Promise<{
  draft?: ChatAttachmentDraft;
  error?: string;
  cancelled?: boolean;
}> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { error: 'Necesitamos permiso para acceder a tus videos.' };
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsEditing: false,
    videoMaxDuration: 300,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return { cancelled: true };

  const asset = result.assets[0];
  return {
    draft: {
      kind: 'video',
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'video/mp4',
      fileName: asset.fileName ?? `video-${Date.now()}.mp4`,
      durationSeconds: asset.duration ? Math.round(asset.duration / 1000) : undefined,
    },
  };
}

export async function pickChatGif(): Promise<{
  draft?: ChatAttachmentDraft;
  error?: string;
  cancelled?: boolean;
}> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { error: 'Necesitamos permiso para acceder a tus archivos.' };
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) return { cancelled: true };

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? 'image/gif';
  const fileName = asset.fileName ?? `gif-${Date.now()}.gif`;

  return {
    draft: {
      kind: kindFromMime(mimeType, fileName),
      uri: asset.uri,
      mimeType,
      fileName,
    },
  };
}

export async function pickChatFile(): Promise<{
  draft?: ChatAttachmentDraft;
  error?: string;
  cancelled?: boolean;
}> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) return { cancelled: true };

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? 'application/octet-stream';
  const fileName = asset.name ?? `archivo-${Date.now()}`;

  return {
    draft: {
      kind: kindFromMime(mimeType, fileName),
      uri: asset.uri,
      mimeType,
      fileName,
    },
  };
}

export async function draftsFromFileList(
  files: FileList | File[],
  currentCount = 0,
): Promise<{ drafts: ChatAttachmentDraft[]; error?: string }> {
  const list = Array.from(files);
  if (list.length === 0) return { drafts: [] };
  if (currentCount + list.length > MAX_CHAT_ATTACHMENTS) {
    return { drafts: [], error: `Máximo ${MAX_CHAT_ATTACHMENTS} adjuntos por mensaje.` };
  }

  const drafts: ChatAttachmentDraft[] = [];

  for (const file of list) {
    const uri = URL.createObjectURL(file);
    drafts.push({
      kind: kindFromMime(file.type, file.name),
      uri,
      mimeType: file.type || 'application/octet-stream',
      fileName: file.name || `archivo-${Date.now()}`,
    });
  }

  return { drafts };
}

export function appendDrafts(
  current: ChatAttachmentDraft[],
  incoming: ChatAttachmentDraft[],
): { drafts: ChatAttachmentDraft[]; error?: string } {
  if (current.length + incoming.length > MAX_CHAT_ATTACHMENTS) {
    return { drafts: current, error: `Máximo ${MAX_CHAT_ATTACHMENTS} adjuntos por mensaje.` };
  }
  return { drafts: [...current, ...incoming] };
}

export function canAddDrafts(currentCount: number) {
  return canAddMore(currentCount);
}
