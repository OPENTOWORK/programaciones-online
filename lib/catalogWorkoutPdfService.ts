import type { PickedPlanPdf } from '@/lib/planPdfPicker';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const PDF_BUCKET = 'catalog-workout-pdfs';
const SIGNED_URL_TTL = 60 * 60;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w.\-() ]+/g, '_').trim() || 'entreno.pdf';
}

async function uriToArrayBuffer(uri: string) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('No se pudo leer el PDF seleccionado');
  }
  return response.arrayBuffer();
}

export async function uploadCatalogWorkoutPdf(
  programId: string,
  pdf: PickedPlanPdf,
): Promise<{ storagePath: string; fileName: string } | { error: string }> {
  const fileName = sanitizeFileName(pdf.fileName);
  const storagePath = `${programId}/${Date.now()}_${fileName}`;

  if (!isSupabaseConfigured) {
    return { storagePath: `local://${storagePath}`, fileName };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  try {
    const fileData = await uriToArrayBuffer(pdf.uri);
    const { error: uploadError } = await supabase.storage.from(PDF_BUCKET).upload(storagePath, fileData, {
      contentType: pdf.mimeType,
      upsert: true,
    });

    if (uploadError) return { error: uploadError.message };
    return { storagePath, fileName };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo subir el PDF' };
  }
}

export async function signedUrlForCatalogWorkoutPdf(storagePath: string) {
  if (storagePath.startsWith('local://')) return undefined;

  const supabase = getSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase.storage
    .from(PDF_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  if (error || !data?.signedUrl) return undefined;
  return data.signedUrl;
}
