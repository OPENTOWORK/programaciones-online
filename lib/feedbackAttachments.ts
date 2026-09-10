import { pickSessionVideo, type SessionVideoSource } from '@/lib/sessionVideoPicker';
import type { FeedbackAttachmentDraft } from '@/lib/trainerFeedbackMediaService';

export const MAX_FEEDBACK_ATTACHMENTS = 4;

export async function pickFeedbackVideo(
  source: SessionVideoSource = 'library',
): Promise<{
  draft?: FeedbackAttachmentDraft;
  error?: string;
  cancelled?: boolean;
}> {
  const picked = await pickSessionVideo(source);

  if ('cancelled' in picked) return { cancelled: true };
  if ('error' in picked) return { error: picked.error };
  if (!('uri' in picked)) return { cancelled: true };

  return {
    draft: {
      kind: 'video',
      uri: picked.uri,
      mimeType: picked.mimeType,
      fileName: picked.fileName,
      durationSeconds: picked.duration ? Math.round(picked.duration / 1000) : undefined,
    },
  };
}

export function formatAttachmentDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
