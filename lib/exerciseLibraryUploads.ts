import { normalizeExerciseName } from '@/lib/exerciseName';
import type { ExerciseLibraryItem } from '@/lib/exerciseLibrary';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { parseWorkoutItemVideoFromInput } from '@/lib/workoutItemVideo';

export interface ExerciseLibraryUploadInput {
  name: string;
  youtubeUrl: string;
  userId: string;
}

function libraryNameKey(videoId: string) {
  return `library:${videoId}`;
}

export async function fetchExerciseLibraryUploads(): Promise<ExerciseLibraryItem[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('ejercicios_videos')
    .select('name, youtube_video_id, created_by')
    .not('created_by', 'is', null)
    .order('name');

  if (error || !data) return [];

  return data
    .filter((row) => Boolean(row.youtube_video_id) && Boolean(row.created_by))
    .map((row) => ({
      videoId: row.youtube_video_id as string,
      name: String(row.name ?? '').trim() || 'Vídeo de YouTube',
      source: 'user' as const,
      createdBy: row.created_by as string,
      aliases: [],
    }));
}

export async function createExerciseLibraryUpload(
  input: ExerciseLibraryUploadInput,
): Promise<{ item?: ExerciseLibraryItem; error?: string }> {
  const name = input.name.trim();
  if (!name) return { error: 'Pon un nombre al ejercicio.' };
  if (!normalizeExerciseName(name)) return { error: 'El nombre del ejercicio no es válido.' };

  const videoId = parseWorkoutItemVideoFromInput(input.youtubeUrl);
  if (!videoId) {
    return { error: 'Pega un enlace de YouTube válido o un id de 11 caracteres.' };
  }

  if (!isSupabaseConfigured) {
    return { error: 'Supabase no está disponible.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data: existing } = await supabase
    .from('ejercicios_videos')
    .select('id')
    .eq('youtube_video_id', videoId)
    .not('created_by', 'is', null)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { error: 'Este vídeo ya está en la biblioteca.' };
  }

  const { data, error } = await supabase
    .from('ejercicios_videos')
    .insert({
      name,
      name_key: libraryNameKey(videoId),
      youtube_video_id: videoId,
      created_by: input.userId,
    })
    .select('name, youtube_video_id, created_by')
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      return { error: 'Este vídeo ya está en la biblioteca.' };
    }
    return { error: error?.message ?? 'No se pudo guardar el vídeo.' };
  }

  return {
    item: {
      videoId: data.youtube_video_id,
      name: data.name,
      source: 'user',
      createdBy: data.created_by ?? input.userId,
      aliases: [],
    },
  };
}
