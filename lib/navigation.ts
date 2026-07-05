import type { Href, Router } from 'expo-router';

export function safeGoBack(router: Router, fallback: Href = '/tabs/home') {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}
