import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface SessionLogVideo {
  id: string;
  workoutLogId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  url: string;
  createdAt: string;
}

const TABLE = 'session_log_videos';
const BUCKET = 'session-videos';
const SIGNED_URL_TTL = 60 * 60;
const MAX_VIDEOS_PER_LOG = 5;

const demoVideos = new Map<string, SessionLogVideo[]>();

function extensionFromMime(mimeType: string) {
  if (mimeType.includes('quicktime')) return 'mov';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('m4v')) return 'm4v';
  return 'mp4';
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w.\-() ]+/g, '_').trim() || 'video.mp4';
}

async function uriToArrayBuffer(uri: string) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('No se pudo leer el video seleccionado');
  }
  return response.arrayBuffer();
}

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('session_log_videos') ||
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
    throw new Error(error?.message ?? 'No se pudo obtener la URL del video');
  }
  return data.signedUrl;
}

function mapRow(
  row: {
    id: string;
    workout_log_id: string;
    user_id: string;
    file_name: string;
    mime_type: string;
    created_at: string;
  },
  url: string,
): SessionLogVideo {
  return {
    id: row.id,
    workoutLogId: row.workout_log_id,
    userId: row.user_id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    url,
    createdAt: row.created_at,
  };
}

export async function fetchSessionVideos(logId: string): Promise<SessionLogVideo[]> {
  if (!logId) return [];

  if (!isSupabaseConfigured) {
    return demoVideos.get(logId) ?? [];
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, workout_log_id, user_id, storage_path, file_name, mime_type, created_at')
    .eq('workout_log_id', logId)
    .order('created_at', { ascending: false });

  if (isMissingTableError(error)) return [];
  if (error || !data) return [];

  return Promise.all(
    data.map(async (row) => {
      const url = await signedUrlForPath(supabase, row.storage_path as string);
      return mapRow(
        {
          id: row.id as string,
          workout_log_id: row.workout_log_id as string,
          user_id: row.user_id as string,
          file_name: row.file_name as string,
          mime_type: row.mime_type as string,
          created_at: row.created_at as string,
        },
        url,
      );
    }),
  );
}

export async function uploadSessionVideo(input: {
  userId: string;
  logId: string;
  uri: string;
  mimeType: string;
  fileName: string;
}): Promise<{ error?: string; video?: SessionLogVideo }> {
  const safeName = sanitizeFileName(input.fileName);
  const ext = extensionFromMime(input.mimeType);
  const storageFileName = `${Date.now()}-${safeName.includes('.') ? safeName : `${safeName}.${ext}`}`;
  const storagePath = `${input.userId}/${input.logId}/${storageFileName}`;

  if (!isSupabaseConfigured) {
    const existing = demoVideos.get(input.logId) ?? [];
    if (existing.length >= MAX_VIDEOS_PER_LOG) {
      return { error: `Máximo ${MAX_VIDEOS_PER_LOG} videos por sesión` };
    }

    const video: SessionLogVideo = {
      id: `demo-video-${Date.now()}`,
      workoutLogId: input.logId,
      userId: input.userId,
      fileName: safeName,
      mimeType: input.mimeType,
      url: input.uri,
      createdAt: new Date().toISOString(),
    };
    demoVideos.set(input.logId, [video, ...existing]);
    return { video };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Supabase no está disponible' };
  }

  const { count, error: countError } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('workout_log_id', input.logId);

  if (countError) {
    if (isMissingTableError(countError)) {
      return { error: 'La tabla de videos no está disponible. Ejecuta: npm run supabase:session-videos' };
    }
    return { error: countError.message };
  }

  if ((count ?? 0) >= MAX_VIDEOS_PER_LOG) {
    return { error: `Máximo ${MAX_VIDEOS_PER_LOG} videos por sesión` };
  }

  try {
    const fileData = await uriToArrayBuffer(input.uri);
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, fileData, {
      contentType: input.mimeType,
      upsert: false,
    });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        workout_log_id: input.logId,
        user_id: input.userId,
        storage_path: storagePath,
        file_name: safeName,
        mime_type: input.mimeType,
      })
      .select('id, workout_log_id, user_id, file_name, mime_type, created_at')
      .single();

    if (error || !data) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return { error: error?.message ?? 'No se pudo registrar el video' };
    }

    const url = await signedUrlForPath(supabase, storagePath);
    return {
      video: mapRow(
        {
          id: data.id as string,
          workout_log_id: data.workout_log_id as string,
          user_id: data.user_id as string,
          file_name: data.file_name as string,
          mime_type: data.mime_type as string,
          created_at: data.created_at as string,
        },
        url,
      ),
    };
  } catch (uploadError) {
    return { error: uploadError instanceof Error ? uploadError.message : 'Error al subir el video' };
  }
}

export async function deleteSessionVideo(videoId: string, userId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    for (const [logId, videos] of demoVideos.entries()) {
      const index = videos.findIndex((video) => video.id === videoId);
      if (index >= 0) {
        videos.splice(index, 1);
        demoVideos.set(logId, videos);
        return {};
      }
    }
    return { error: 'Video no encontrado' };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, storage_path')
    .eq('id', videoId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return { error: error?.message ?? 'Video no encontrado' };

  await supabase.storage.from(BUCKET).remove([data.storage_path as string]);

  const { error: deleteError } = await supabase.from(TABLE).delete().eq('id', videoId).eq('user_id', userId);
  if (deleteError) return { error: deleteError.message };

  return {};
}
