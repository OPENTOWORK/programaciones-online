import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { FeedbackAttachmentDraft } from '@/lib/trainerFeedbackMediaService';

export interface SessionBlockComment {
  id: string;
  workoutLogId: string;
  userId: string;
  blockKey: string;
  text?: string;
  audioUrl?: string;
  audioFileName?: string;
  audioMimeType?: string;
  audioDurationSeconds?: number;
  updatedAt?: string;
}

const TABLE = 'session_log_block_comments';
const BUCKET = 'session-block-audio';
const SIGNED_URL_TTL = 60 * 60;

const demoComments = new Map<string, SessionBlockComment>();

function demoKey(logId: string, blockKey: string) {
  return `${logId}:${blockKey}`;
}

function audioExtension(mimeType: string) {
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  return 'm4a';
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w.\-() ]+/g, '_').trim() || 'nota-de-voz.m4a';
}

async function uriToArrayBuffer(uri: string) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('No se pudo leer el audio');
  }
  return response.arrayBuffer();
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

async function signedUrlForPath(supabase: NonNullable<ReturnType<typeof getSupabase>>, storagePath: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'No se pudo obtener la URL del audio');
  }
  return data.signedUrl;
}

function mapRow(
  row: Record<string, unknown>,
  audioUrl?: string,
): SessionBlockComment {
  return {
    id: row.id as string,
    workoutLogId: row.workout_log_id as string,
    userId: row.user_id as string,
    blockKey: row.block_key as string,
    text: (row.text as string | null) ?? undefined,
    audioUrl,
    audioFileName: (row.audio_file_name as string | null) ?? undefined,
    audioMimeType: (row.audio_mime_type as string | null) ?? undefined,
    audioDurationSeconds:
      row.audio_duration_seconds == null ? undefined : Number(row.audio_duration_seconds),
    updatedAt: (row.updated_at as string | null) ?? undefined,
  };
}

function hasContent(comment?: SessionBlockComment) {
  return Boolean(comment?.text?.trim() || comment?.audioUrl);
}

export async function fetchSessionBlockComments(logId: string): Promise<SessionBlockComment[]> {
  if (!logId) return [];

  if (!isSupabaseConfigured) {
    return [...demoComments.values()].filter((comment) => comment.workoutLogId === logId);
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      'id, workout_log_id, user_id, block_key, text, audio_storage_path, audio_file_name, audio_mime_type, audio_duration_seconds, updated_at',
    )
    .eq('workout_log_id', logId)
    .order('updated_at', { ascending: true });

  if (isMissingTableError(error)) return [];
  if (error || !data) return [];

  return Promise.all(
    data.map(async (row) => {
      const storagePath = row.audio_storage_path as string | null;
      const audioUrl = storagePath ? await signedUrlForPath(supabase, storagePath) : undefined;
      return mapRow(row as Record<string, unknown>, audioUrl);
    }),
  );
}

export async function saveSessionBlockCommentText(input: {
  userId: string;
  logId: string;
  blockKey: string;
  text: string;
}): Promise<{ error?: string; comment?: SessionBlockComment }> {
  const trimmed = input.text.trim();

  if (!isSupabaseConfigured) {
    const key = demoKey(input.logId, input.blockKey);
    const existing = demoComments.get(key);
    if (!trimmed && !existing?.audioUrl) {
      demoComments.delete(key);
      return {};
    }

    const comment: SessionBlockComment = {
      id: existing?.id ?? `demo-block-comment-${Date.now()}`,
      workoutLogId: input.logId,
      userId: input.userId,
      blockKey: input.blockKey,
      text: trimmed || undefined,
      audioUrl: existing?.audioUrl,
      audioFileName: existing?.audioFileName,
      audioMimeType: existing?.audioMimeType,
      audioDurationSeconds: existing?.audioDurationSeconds,
      updatedAt: new Date().toISOString(),
    };
    demoComments.set(key, comment);
    return { comment };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const { data: existing, error: fetchError } = await supabase
    .from(TABLE)
    .select(
      'id, workout_log_id, user_id, block_key, text, audio_storage_path, audio_file_name, audio_mime_type, audio_duration_seconds, updated_at',
    )
    .eq('workout_log_id', input.logId)
    .eq('block_key', input.blockKey)
    .maybeSingle();

  if (fetchError && !isMissingTableError(fetchError)) {
    return { error: fetchError.message };
  }

  if (!trimmed && !existing?.audio_storage_path) {
    if (existing?.id) {
      await supabase.from(TABLE).delete().eq('id', existing.id);
    }
    return {};
  }

  const payload = {
    workout_log_id: input.logId,
    user_id: input.userId,
    block_key: input.blockKey,
    text: trimmed || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = existing?.id
    ? await supabase
        .from(TABLE)
        .update({ text: payload.text, updated_at: payload.updated_at })
        .eq('id', existing.id)
        .select(
          'id, workout_log_id, user_id, block_key, text, audio_storage_path, audio_file_name, audio_mime_type, audio_duration_seconds, updated_at',
        )
        .single()
    : await supabase
        .from(TABLE)
        .insert(payload)
        .select(
          'id, workout_log_id, user_id, block_key, text, audio_storage_path, audio_file_name, audio_mime_type, audio_duration_seconds, updated_at',
        )
        .single();

  if (error || !data) {
    if (isMissingTableError(error)) {
      return { error: 'La tabla de comentarios no está disponible. Ejecuta: npm run supabase:session-block-comments' };
    }
    return { error: error?.message ?? 'No se pudo guardar el comentario' };
  }

  const storagePath = data.audio_storage_path as string | null;
  const audioUrl = storagePath ? await signedUrlForPath(supabase, storagePath) : undefined;
  return { comment: mapRow(data as Record<string, unknown>, audioUrl) };
}

export async function uploadSessionBlockCommentAudio(input: {
  userId: string;
  logId: string;
  blockKey: string;
  draft: FeedbackAttachmentDraft;
}): Promise<{ error?: string; comment?: SessionBlockComment }> {
  const safeName = sanitizeFileName(input.draft.fileName);
  const ext = audioExtension(input.draft.mimeType);
  const storageFileName = `${Date.now()}-${safeName.includes('.') ? safeName : `${safeName}.${ext}`}`;
  const storagePath = `${input.userId}/${input.logId}/${input.blockKey}/${storageFileName}`;

  if (!isSupabaseConfigured) {
    const key = demoKey(input.logId, input.blockKey);
    const existing = demoComments.get(key);
    const comment: SessionBlockComment = {
      id: existing?.id ?? `demo-block-comment-${Date.now()}`,
      workoutLogId: input.logId,
      userId: input.userId,
      blockKey: input.blockKey,
      text: existing?.text,
      audioUrl: input.draft.uri,
      audioFileName: safeName,
      audioMimeType: input.draft.mimeType,
      audioDurationSeconds: input.draft.durationSeconds,
      updatedAt: new Date().toISOString(),
    };
    demoComments.set(key, comment);
    return { comment };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  try {
    const fileData = await uriToArrayBuffer(input.draft.uri);
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, fileData, {
      contentType: input.draft.mimeType,
      upsert: true,
    });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: existing } = await supabase
      .from(TABLE)
      .select('id, text')
      .eq('workout_log_id', input.logId)
      .eq('block_key', input.blockKey)
      .maybeSingle();

    const payload = {
      workout_log_id: input.logId,
      user_id: input.userId,
      block_key: input.blockKey,
      text: (existing?.text as string | null) ?? null,
      audio_storage_path: storagePath,
      audio_file_name: safeName,
      audio_mime_type: input.draft.mimeType,
      audio_duration_seconds: input.draft.durationSeconds ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = existing?.id
      ? await supabase
          .from(TABLE)
          .update({
            audio_storage_path: payload.audio_storage_path,
            audio_file_name: payload.audio_file_name,
            audio_mime_type: payload.audio_mime_type,
            audio_duration_seconds: payload.audio_duration_seconds,
            updated_at: payload.updated_at,
          })
          .eq('id', existing.id)
          .select(
            'id, workout_log_id, user_id, block_key, text, audio_storage_path, audio_file_name, audio_mime_type, audio_duration_seconds, updated_at',
          )
          .single()
      : await supabase
          .from(TABLE)
          .insert(payload)
          .select(
            'id, workout_log_id, user_id, block_key, text, audio_storage_path, audio_file_name, audio_mime_type, audio_duration_seconds, updated_at',
          )
          .single();

    if (error || !data) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      if (isMissingTableError(error)) {
        return { error: 'La tabla de comentarios no está disponible. Ejecuta: npm run supabase:session-block-comments' };
      }
      return { error: error?.message ?? 'No se pudo guardar la nota de voz' };
    }

    const audioUrl = await signedUrlForPath(supabase, storagePath);
    return { comment: mapRow(data as Record<string, unknown>, audioUrl) };
  } catch (uploadError) {
    return { error: uploadError instanceof Error ? uploadError.message : 'Error al subir el audio' };
  }
}

export async function removeSessionBlockCommentAudio(input: {
  userId: string;
  logId: string;
  blockKey: string;
}): Promise<{ error?: string; comment?: SessionBlockComment }> {
  if (!isSupabaseConfigured) {
    const key = demoKey(input.logId, input.blockKey);
    const existing = demoComments.get(key);
    if (!existing?.audioUrl) return {};
    const comment: SessionBlockComment = {
      ...existing,
      audioUrl: undefined,
      audioFileName: undefined,
      audioMimeType: undefined,
      audioDurationSeconds: undefined,
      updatedAt: new Date().toISOString(),
    };
    if (!hasContent(comment)) {
      demoComments.delete(key);
      return {};
    }
    demoComments.set(key, comment);
    return { comment };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const { data: existing, error: fetchError } = await supabase
    .from(TABLE)
    .select(
      'id, text, audio_storage_path, workout_log_id, user_id, block_key, audio_file_name, audio_mime_type, audio_duration_seconds, updated_at',
    )
    .eq('workout_log_id', input.logId)
    .eq('block_key', input.blockKey)
    .maybeSingle();

  if (fetchError || !existing?.audio_storage_path) {
    return { error: fetchError?.message ?? 'No hay audio que eliminar' };
  }

  await supabase.storage.from(BUCKET).remove([existing.audio_storage_path as string]);

  if (!existing.text) {
    await supabase.from(TABLE).delete().eq('id', existing.id);
    return {};
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      audio_storage_path: null,
      audio_file_name: null,
      audio_mime_type: null,
      audio_duration_seconds: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select(
      'id, workout_log_id, user_id, block_key, text, audio_storage_path, audio_file_name, audio_mime_type, audio_duration_seconds, updated_at',
    )
    .single();

  if (error || !data) return { error: error?.message ?? 'No se pudo eliminar el audio' };
  return { comment: mapRow(data as Record<string, unknown>) };
}

export function sessionBlockCommentHasContent(comment?: SessionBlockComment) {
  return hasContent(comment);
}
