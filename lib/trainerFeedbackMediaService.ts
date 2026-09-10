import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { TrainerFeedbackAttachment, TrainerFeedbackAttachmentKind } from '@/lib/types';

const TABLE = 'trainer_feedback_media';
const BUCKET = 'feedback-media';
const SIGNED_URL_TTL = 60 * 60;
const MAX_ATTACHMENTS_PER_FEEDBACK = 4;

const localMediaByFeedback = new Map<string, TrainerFeedbackAttachment[]>();

export interface FeedbackAttachmentDraft {
  kind: TrainerFeedbackAttachmentKind;
  uri: string;
  mimeType: string;
  fileName: string;
  durationSeconds?: number;
  file?: Blob;
}

function extensionFor(kind: TrainerFeedbackAttachmentKind, mimeType: string) {
  if (kind === 'audio') {
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('mpeg')) return 'mp3';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('wav')) return 'wav';
    return 'm4a';
  }
  if (mimeType.includes('quicktime')) return 'mov';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('m4v')) return 'm4v';
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

function mapRow(row: Record<string, unknown>, url: string): TrainerFeedbackAttachment {
  return {
    id: row.id as string,
    feedbackId: row.feedback_id as string,
    kind: row.kind as TrainerFeedbackAttachmentKind,
    fileName: row.file_name as string,
    mimeType: row.mime_type as string,
    url,
    durationSeconds: row.duration_seconds == null ? undefined : Number(row.duration_seconds),
    createdAt: row.created_at as string,
  };
}

function localList(feedbackId: string) {
  const existing = localMediaByFeedback.get(feedbackId);
  if (existing) return existing;
  const created: TrainerFeedbackAttachment[] = [];
  localMediaByFeedback.set(feedbackId, created);
  return created;
}

async function uriToArrayBuffer(uri: string) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('No se pudo leer el archivo adjunto');
  }
  return response.arrayBuffer();
}

export function localFeedbackAttachments(feedbackId: string): TrainerFeedbackAttachment[] {
  return [...localList(feedbackId)];
}

export async function fetchFeedbackAttachments(
  feedbackIds: string[],
  useLocalStore = false,
): Promise<Record<string, TrainerFeedbackAttachment[]>> {
  if (feedbackIds.length === 0) return {};

  if (useLocalStore || !isSupabaseConfigured) {
    return Object.fromEntries(feedbackIds.map((id) => [id, localFeedbackAttachments(id)]));
  }

  const supabase = getSupabase();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, feedback_id, kind, storage_path, file_name, mime_type, duration_seconds, created_at')
    .in('feedback_id', feedbackIds)
    .order('created_at', { ascending: true });

  if (error || !data) {
    if (isMissingTableError(error)) {
      return Object.fromEntries(feedbackIds.map((id) => [id, localFeedbackAttachments(id)]));
    }
    return {};
  }

  const grouped: Record<string, TrainerFeedbackAttachment[]> = {};

  await Promise.all(
    data.map(async (row) => {
      const record = row as Record<string, unknown>;
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(record.storage_path as string, SIGNED_URL_TTL);

      if (!signed?.signedUrl) return;

      const attachment = mapRow(record, signed.signedUrl);
      grouped[attachment.feedbackId] = [...(grouped[attachment.feedbackId] ?? []), attachment];
    }),
  );

  for (const attachments of Object.values(grouped)) {
    attachments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  return grouped;
}

export async function uploadFeedbackAttachment(input: {
  trainerId: string;
  athleteId: string;
  feedbackId: string;
  draft: FeedbackAttachmentDraft;
  useLocalStore: boolean;
}): Promise<{ attachment?: TrainerFeedbackAttachment; error?: string }> {
  const { draft } = input;
  const fallbackName = draft.kind === 'audio' ? 'nota-de-voz.m4a' : 'video.mp4';
  const safeName = sanitizeFileName(draft.fileName, fallbackName);
  const ext = extensionFor(draft.kind, draft.mimeType);
  const storageFileName = `${Date.now()}-${safeName.includes('.') ? safeName : `${safeName}.${ext}`}`;
  const storagePath = `${input.athleteId}/${input.feedbackId}/${storageFileName}`;

  if (input.useLocalStore || !isSupabaseConfigured) {
    const existing = localList(input.feedbackId);
    if (existing.length >= MAX_ATTACHMENTS_PER_FEEDBACK) {
      return { error: `Máximo ${MAX_ATTACHMENTS_PER_FEEDBACK} adjuntos por feedback.` };
    }

    const attachment: TrainerFeedbackAttachment = {
      id: `local-media-${Date.now()}-${existing.length}`,
      feedbackId: input.feedbackId,
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
    const fileData = draft.file
      ? await draft.file.arrayBuffer()
      : await uriToArrayBuffer(draft.uri);
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, fileData, {
      contentType: draft.mimeType,
      upsert: false,
    });

    if (uploadError) return { error: uploadError.message };

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        feedback_id: input.feedbackId,
        trainer_id: input.trainerId,
        athlete_id: input.athleteId,
        kind: draft.kind,
        storage_path: storagePath,
        file_name: safeName,
        mime_type: draft.mimeType,
        duration_seconds: draft.durationSeconds ?? null,
      })
      .select('id, feedback_id, kind, storage_path, file_name, mime_type, duration_seconds, created_at')
      .single();

    if (error || !data) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return {
        error: isMissingTableError(error)
          ? 'Falta aplicar la tabla de adjuntos en Supabase: npm run supabase:trainer-athlete-feedback'
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

export async function deleteFeedbackAttachments(
  feedbackId: string,
  useLocalStore: boolean,
): Promise<void> {
  if (useLocalStore || !isSupabaseConfigured || feedbackId.startsWith('local-feedback-')) {
    localMediaByFeedback.delete(feedbackId);
    return;
  }

  const supabase = getSupabase();
  if (!supabase) return;

  const { data } = await supabase.from(TABLE).select('storage_path').eq('feedback_id', feedbackId);

  const paths = (data ?? []).map((row) => (row as Record<string, unknown>).storage_path as string);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  await supabase.from(TABLE).delete().eq('feedback_id', feedbackId);
}
