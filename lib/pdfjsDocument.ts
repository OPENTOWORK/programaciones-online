export async function extractPdfDocument(_buffer: ArrayBuffer): Promise<{ text: string; pageTexts: string[] }> {
  throw new Error('La importación automática del PDF solo está disponible en la versión web del panel.');
}
