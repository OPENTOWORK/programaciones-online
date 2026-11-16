import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { useAthletePreviewNavigation } from '@/hooks/useAthletePreviewMode';
import { useTrainerMobilePreviewNavigation } from '@/hooks/useTrainerMobilePreview';
import { safeGoBack } from '@/lib/navigation';
import { hrefToTrainerPreviewNavAction } from '@/lib/trainerMobilePreviewRoutes';

export function useAppNavigation() {
  const router = useRouter();
  const athleteNav = useAthletePreviewNavigation();
  const previewNav = useTrainerMobilePreviewNavigation();

  const push = useCallback(
    (href: Href) => {
      if (athleteNav) {
        athleteNav.pushHref(href);
        return;
      }
      if (previewNav?.pushHref(href)) return;
      router.push(href);
    },
    [athleteNav, previewNav, router],
  );

  const replace = useCallback(
    (href: Href) => {
      if (athleteNav) {
        athleteNav.replaceHref(href);
        return;
      }
      if (previewNav?.replaceHref(href)) return;
      router.replace(href);
    },
    [athleteNav, previewNav, router],
  );

  const back = useCallback(
    (fallback: Href = '/tabs/home') => {
      if (athleteNav) {
        if (athleteNav.canGoBack()) {
          athleteNav.pop();
          return;
        }
        if (!athleteNav.replaceHref(fallback)) athleteNav.resetStack();
        return;
      }

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
    [athleteNav, previewNav, router],
  );

  return useMemo(
    () => ({
      push,
      replace,
      back,
      canGoBack: () =>
        athleteNav
          ? athleteNav.canGoBack()
          : previewNav
            ? previewNav.canGoBack()
            : router.canGoBack(),
    }),
    [athleteNav, back, previewNav, push, replace, router],
  );
}
