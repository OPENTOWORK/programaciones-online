import { useRouter, type Href } from 'expo-router';

import { isTrainerDesktopWeb, usesGymPanel } from '@/lib/platformAccess';
import type { AthleteSummary, UserRole } from '@/lib/types';

type AppRouter = ReturnType<typeof useRouter>;

export function getPostLoginRoute(role?: UserRole): '/tabs/programs' | '/tabs/home' | '/gym' {
  if (usesGymPanel(role)) {
    return '/gym';
  }

  if (isTrainerDesktopWeb(role)) {
    return '/tabs/programs';
  }

  return '/tabs/home';
}

export function isStaffLeadRole(role?: UserRole) {
  return role === 'entrenador' || role === 'administrador';
}

export function getTrainerLeadProfileHref(lead: Pick<AthleteSummary, 'id' | 'role'>): Href {
  if (isStaffLeadRole(lead.role)) {
    return { pathname: '/trainer/staff/[id]', params: { id: lead.id } };
  }

  return { pathname: '/trainer/athlete/[id]', params: { id: lead.id } };
}

export function getTrainerAthleteProfileHref(athleteId: string): Href {
  return { pathname: '/trainer/athlete/[id]', params: { id: athleteId } };
}

export function getFeedbackChatHref(input: {
  asTrainer: boolean;
  athleteId: string;
  sessionLogId?: string;
  scheduledDate?: string;
}): Href {
  if (input.asTrainer) {
    if (input.sessionLogId) {
      return {
        pathname: '/trainer/athlete/[id]/log/[logId]',
        params: { id: input.athleteId, logId: input.sessionLogId },
      };
    }
    return getTrainerAthleteProfileHref(input.athleteId);
  }

  if (input.scheduledDate) {
    return { pathname: '/calendar/[date]', params: { date: input.scheduledDate } };
  }

  return '/tabs/progress';
}

export function safeGoBack(router: AppRouter, fallback: Href = '/tabs/home') {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}
