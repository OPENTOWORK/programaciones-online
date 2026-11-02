import { useWindowDimensions } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { useTrainerMobilePreviewMode } from '@/hooks/useTrainerMobilePreview';
import { isTrainerRole } from '@/lib/athleteService';
import {
  isTrainerDesktopWeb,
  isTrainerMobileLayout,
  isWebPlatform,
} from '@/lib/platformAccess';

export function useTrainerMobileLayout() {
  const { user, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const preview = useTrainerMobilePreviewMode();

  if (preview.enabled) {
    return true;
  }

  if (isLoading || !user || !isTrainerRole(user.role)) {
    return false;
  }

  return isTrainerMobileLayout(user.role, width);
}

export function useTrainerDesktopWebLayout() {
  const { user, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const preview = useTrainerMobilePreviewMode();

  if (preview.enabled) {
    return false;
  }

  if (isLoading || !user) {
    return false;
  }

  return isTrainerDesktopWeb(user.role, width);
}

export function useTrainerPostLoginHref() {
  const desktop = useTrainerDesktopWebLayout();
  const { user } = useAuth();

  if (!user || !isTrainerRole(user.role)) {
    return '/tabs/home' as const;
  }

  if (isWebPlatform() && desktop) {
    return '/tabs/programs' as const;
  }

  return '/tabs/home' as const;
}
