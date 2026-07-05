import * as DocumentPicker from 'expo-document-picker';

export interface PickedPlanPdf {
  uri: string;
  fileName: string;
  mimeType: string;
}

export async function pickPlanPdf(): Promise<
  { cancelled: true } | { error: string } | PickedPlanPdf
> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return { cancelled: true };
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? 'application/pdf';

  if (mimeType !== 'application/pdf' && !asset.name.toLowerCase().endsWith('.pdf')) {
    return { error: 'Solo se permiten archivos PDF' };
  }

  return {
    uri: asset.uri,
    fileName: asset.name,
    mimeType: 'application/pdf',
  };
}
