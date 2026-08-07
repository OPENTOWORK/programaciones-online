import type { ChatAttachmentDraft } from '@/lib/chatAttachments';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ChatAttachmentKind, TrainerChatAttachment } from '@/lib/types';

const TABLE = 'trainer_message_media';
const BUCKET = 'chat-media';
const SIGNED_URL_TTL = 60 * 60;
const MAX_ATTACHMENTS_PER_MESSAGE = 6;

const localMediaByMessage = new Map<string, TrainerChatAttachment[]>();

function extensionFor(kind: ChatAttachmentKind, mimeType: string) {
  if (kind === 'gif') return 'gif';
  if (kind === 'image') {
    if (mimeType.includes('png')) return 'png';
    if (mimeType.includes('webp')) return 'webp';
    if (mimeType.includes('heic')) return 'heic';
    return 'jpg';
  }
  if (kind === 'audio') {
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('mpeg')) return 'mp3';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('wav')) return 'wav';
    return 'm4a';
  }
  if (kind === 'file') {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word')) return 'docx';
    if (mimeType.includes('sheet')) return 'xlsx';
    if (mimeType.includes('plain')) return 'txt';
    if (mimeType.includes('zip')) return 'zip';
    return 'bin';
  }
  if (mimeType.includes('quicktime')) return 'mov';
  if (mimeType.includes('webm')) return 'webm';
  return 'mp4';
}

function sanitizeFileName(fileName: string, fallback: string) {
  return fileName.replace(/[^\w.\-() ]+/g, '_').trim() || fallback;
}

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes(TABLE) ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function mapRow(row: Record<string, unknown>, url: string): TrainerChatAttachment {
  return {
    id: row.id as string,
    messageId: row.message_id as string,
    kind: row.kind as ChatAttachmentKind,
    fileName: row.file_name as string,
    mimeType: row.mime_type as string,
    url,
    durationSeconds: row.duration_seconds == null ? undefined : Number(row.duration_seconds),
    createdAt: row.created_at as string,
  };
}

function localList(messageId: string) {
  const existing = localMediaByMessage.get(messageId);
  if (existing) return existing;
  const created: TrainerChatAttachment[] = [];
  localMediaByMessage.set(messageId, created);
  return created;
}

async function uriToArrayBuffer(uri: string) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('No se pudo leer el archivo adjunto');
  }
  return response.arrayBuffer();
}

export function localChatAttachments(messageId: string): TrainerChatAttachment[] {
  return [...localList(messageId)];
}

export async function fetchChatAttachments(
  messageIds: string[],
  useLocalStore = false,
): Promise<Record<string, TrainerChatAttachment[]>> {
  if (messageIds.length === 0) return {};

  if (useLocalStore || !isSupabaseConfigured) {
    return Object.fromEntries(messageIds.map((id) => [id, localChatAttachments(id)]));
  }

  const supabase = getSupabase();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, message_id, kind, storage_path, file_name, mime_type, duration_seconds, created_at')
    .in('message_id', messageIds)
    .order('created_at', { ascending: true });

  if (error || !data) {
    if (isMissingTableError(error)) {
      return Object.fromEntries(messageIds.map((id) => [id, localChatAttachments(id)]));
    }
    return {};
  }

  const grouped: Record<string, TrainerChatAttachment[]> = {};

  await Promise.all(
    data.map(async (row) => {
      const record = row as Record<string, unknown>;
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(record.storage_path as string, SIGNED_URL_TTL);

      if (!signed?.signedUrl) return;

      const attachment = mapRow(record, signed.signedUrl);
      grouped[attachment.messageId] = [...(grouped[attachment.messageId] ?? []), attachment];
    }),
  );

  return grouped;
}

export async function uploadChatAttachment(input: {
  athleteUserId: string;
  messageId: string;
  uploaderId: string;
  draft: ChatAttachmentDraft;
  useLocalStore: boolean;
}): Promise<{ attachment?: TrainerChatAttachment; error?: string }> {
  const { draft } = input;
  const fallbackName =
    draft.kind === 'audio'
      ? 'nota-de-voz.m4a'
      : draft.kind === 'image' || draft.kind === 'gif'
        ? 'imagen.jpg'
        : draft.kind === 'file'
          ? 'archivo.pdf'
          : 'video.mp4';
  const safeName = sanitizeFileName(draft.fileName, fallbackName);
  const ext = extensionFor(draft.kind, draft.mimeType);
  const storageFileName = `${Date.now()}-${safeName.includes('.') ? safeName : `${safeName}.${ext}`}`;
  const storagePath = `${input.athleteUserId}/${input.messageId}/${storageFileName}`;

  if (input.useLocalStore || !isSupabaseConfigured) {
    const existing = localList(input.messageId);
    if (existing.length >= MAX_ATTACHMENTS_PER_MESSAGE) {
      return { error: `Máximo ${MAX_ATTACHMENTS_PER_MESSAGE} adjuntos por mensaje.` };
    }

    const attachment: TrainerChatAttachment = {
      id: `local-chat-media-${Date.now()}-${existing.length}`,
      messageId: input.messageId,
      kind: draft.kind,
      fileName: safeName,
      mimeType: draft.mimeType,
      url: draft.uri,
      durationSeconds: draft.durationSeconds,
      createdAt: new Date().toISOString(),
    };
    existing.push(attachment);
    return { attachment };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  try {
    const fileData = await uriToArrayBuffer(draft.uri);
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, fileData, {
      contentType: draft.mimeType,
      upsert: false,
    });

    if (uploadError) return { error: uploadError.message };

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        message_id: input.messageId,
        user_id: input.athleteUserId,
        uploader_id: input.uploaderId,
        kind: draft.kind,
        storage_path: storagePath,
        file_name: safeName,
        mime_type: draft.mimeType,
        duration_seconds: draft.durationSeconds ?? null,
      })
      .select('id, message_id, kind, storage_path, file_name, mime_type, duration_seconds, created_at')
      .single();

    if (error || !data) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return {
        error: isMissingTableError(error)
          ? 'Falta aplicar la tabla de adjuntos del chat: npm run supabase:trainer-chat-media'
          : error?.message ?? 'No se pudo guardar el adjunto.',
      };
    }

    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL);

    return {
      attachment: mapRow(data as Record<string, unknown>, signed?.signedUrl ?? draft.uri),
    };
  } catch (uploadError) {
    return {
      error: uploadError instanceof Error ? uploadError.message : 'No se pudo subir el adjunto.',
    };
  }
}
