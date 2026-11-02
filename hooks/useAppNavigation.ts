import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { useTrainerMobilePreviewNavigation } from '@/hooks/useTrainerMobilePreview';
import { safeGoBack } from '@/lib/navigation';
import { hrefToTrainerPreviewNavAction } from '@/lib/trainerMobilePreviewRoutes';

export function useAppNavigation() {
  const router = useRouter();
  const previewNav = useTrainerMobilePreviewNavigation();

  const push = useCallback(
    (href: Href) => {
      if (previewNav?.pushHref(href)) return;
      router.push(href);
    },
    [previewNav, router],
  );

  const replace = useCallback(
    (href: Href) => {
      if (previewNav?.replaceHref(href)) return;
      router.replace(href);
    },
    [previewNav, router],
  );

  const back = useCallback(
    (fallback: Href = '/tabs/home') => {
      if (previewNav) {
        if (previewNav.canGoBack()) {
          previewNav.pop();
          return;
        }

        const action = hrefToTrainerPreviewNavAction(fallback);
        if (action?.kind === 'reset-tabs') {
          previewNav.resetStack();
          return;
        }

        if (previewNav.pushHref(fallback)) return;
        previewNav.resetStack();
        return;
      }

      safeGoBack(router, fallback);
    },
    [previewNav, router],
  );

  return useMemo(
    () => ({
      push,
      replace,
      back,
      canGoBack: () => (previewNav ? previewNav.canGoBack() : router.canGoBack()),
    }),
    [back, previewNav, push, replace, router],
  );
}
