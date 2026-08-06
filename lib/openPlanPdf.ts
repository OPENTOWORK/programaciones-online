import { openExternalUrl } from '@/lib/openExternalUrl';

export async function openPlanPdf(url: string) {
  await openExternalUrl(url);
}
