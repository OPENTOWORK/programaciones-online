import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type PhotoTipo = 'antes' | 'mensual';

export interface ProgressPhoto {
  id: string;
  tipo: PhotoTipo;
  mes?: string;
  url: string;
  createdAt: string;
}

export interface ProgressPhotosState {
  antesPhoto: ProgressPhoto | null;
  monthlyPhotos: ProgressPhoto[];
  needsBeforePhoto: boolean;
  needsMonthlyPhoto: boolean;
  currentMonthKey: string;
  currentMonthLabel: string;
}

const FOTOS_BUCKET = 'fotos';
const SIGNED_URL_TTL = 60 * 60;

export const emptyProgressPhotos: ProgressPhotosState = {
  antesPhoto: null,
  monthlyPhotos: [],
  needsBeforePhoto: true,
  needsMonthlyPhoto: false,
  currentMonthKey: currentMonthKey(),
  currentMonthLabel: formatMonthLabel(currentMonthKey()),
};

export function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(mes: string) {
  const [year, month] = mes.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function extensionFromMime(mimeType?: string) {
  if (mimeType?.includes('png')) return 'png';
  if (mimeType?.includes('webp')) return 'webp';
  if (mimeType?.includes('heic')) return 'heic';
  return 'jpg';
}

async function uriToArrayBuffer(uri: string) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('No se pudo leer la imagen seleccionada');
  }
  return response.arrayBuffer();
}

async function signedUrlForPath(supabase: NonNullable<ReturnType<typeof getSupabase>>, storagePath: string) {
  const { data, error } = await supabase.storage.from(FOTOS_BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'No se pudo obtener la URL de la foto');
  }
  return data.signedUrl;
}

function mapPhotoRow(
  row: { id: string; tipo: PhotoTipo; mes: string | null; storage_path: string; created_at: string },
  url: string,
): ProgressPhoto {
  return {
    id: row.id,
    tipo: row.tipo,
    mes: row.mes ?? undefined,
    url,
    createdAt: row.created_at,
  };
}

export async function fetchProgressPhotos(userId: string): Promise<ProgressPhotosState> {
  if (!isSupabaseConfigured) return emptyProgressPhotos;

  const supabase = getSupabase();
  if (!supabase) return emptyProgressPhotos;

  const monthKey = currentMonthKey();

  const { data, error } = await supabase
    .from('fotos')
    .select('id, tipo, mes, storage_path, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return { ...emptyProgressPhotos, currentMonthKey: monthKey, currentMonthLabel: formatMonthLabel(monthKey) };
  }

  const photos = await Promise.all(
    data.map(async (row) => {
      const url = await signedUrlForPath(supabase, row.storage_path);
      return mapPhotoRow(row as { id: string; tipo: PhotoTipo; mes: string | null; storage_path: string; created_at: string }, url);
    }),
  );

  const antesPhoto = photos.find((photo) => photo.tipo === 'antes') ?? null;
  const monthlyPhotos = photos
    .filter((photo) => photo.tipo === 'mensual')
    .sort((a, b) => (b.mes ?? '').localeCompare(a.mes ?? ''));

  const hasCurrentMonthPhoto = monthlyPhotos.some((photo) => photo.mes === monthKey);

  return {
    antesPhoto,
    monthlyPhotos,
    needsBeforePhoto: !antesPhoto,
    needsMonthlyPhoto: Boolean(antesPhoto) && !hasCurrentMonthPhoto,
    currentMonthKey: monthKey,
    currentMonthLabel: formatMonthLabel(monthKey),
  };
}

export async function uploadProgressPhoto(
  userId: string,
  tipo: PhotoTipo,
  imageUri: string,
  mimeType = 'image/jpeg',
): Promise<{ error?: string; state?: ProgressPhotosState }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase no está configurado' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Supabase no está disponible' };
  }

  const mes = tipo === 'mensual' ? currentMonthKey() : null;
  const ext = extensionFromMime(mimeType);
  const fileName = tipo === 'antes' ? `antes.${ext}` : `${mes}.${ext}`;
  const storagePath = `${userId}/${fileName}`;

  try {
    const fileData = await uriToArrayBuffer(imageUri);
    const { error: uploadError } = await supabase.storage.from(FOTOS_BUCKET).upload(storagePath, fileData, {
      upsert: true,
      contentType: mimeType,
    });

    if (uploadError) {
      return { error: uploadError.message };
    }

    let dbError: { message: string } | null = null;

    if (tipo === 'antes') {
      const { data: existing } = await supabase
        .from('fotos')
        .select('id')
        .eq('user_id', userId)
        .eq('tipo', 'antes')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from('fotos').update({ storage_path: storagePath }).eq('id', existing.id);
        dbError = error;
      } else {
        const { error } = await supabase.from('fotos').insert({
          user_id: userId,
          tipo,
          mes,
          storage_path: storagePath,
        });
        dbError = error;
      }
    } else {
      const { data: existing } = await supabase
        .from('fotos')
        .select('id')
        .eq('user_id', userId)
        .eq('tipo', 'mensual')
        .eq('mes', mes)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from('fotos').update({ storage_path: storagePath }).eq('id', existing.id);
        dbError = error;
      } else {
        const { error } = await supabase.from('fotos').insert({
          user_id: userId,
          tipo,
          mes,
          storage_path: storagePath,
        });
        dbError = error;
      }
    }

    if (dbError) {
      const message = dbError.message.toLowerCase().includes('fotos')
        ? 'La tabla fotos no está disponible. Ejecuta: npm run supabase:fotos'
        : dbError.message;
      return { error: message };
    }

    const state = await fetchProgressPhotos(userId);
    return { state };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error al subir la foto' };
  }
}
