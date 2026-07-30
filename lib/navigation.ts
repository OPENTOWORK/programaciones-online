import { useRouter, type Href } from 'expo-router';

import { isTrainerDesktopWeb } from '@/lib/platformAccess';
import type { UserRole } from '@/lib/types';

type AppRouter = ReturnType<typeof useRouter>;

export function getPostLoginRoute(role?: UserRole): '/tabs/programs' | '/tabs/home' {
  if (isTrainerDesktopWeb(role)) {
    return '/tabs/programs';
  }

  return '/tabs/home';
}

export function safeGoBack(router: AppRouter, fallback: Href = '/tabs/home') {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}
