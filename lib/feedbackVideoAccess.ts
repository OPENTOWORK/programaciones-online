import type { AthletePlanType, ProgramCategory } from '@/lib/types';

/** Solo Personal · Coaching puede enviar vídeos al entrenador. Base y HYPE no. */
export function allowsTrainerFeedbackVideos(source?: {
  category?: ProgramCategory;
  planType?: AthletePlanType;
}) {
  return source?.planType === 'personalized' || source?.category === 'personalized';
}
