import { useSegments } from 'expo-router';

import { AuthWebShell } from '@/components/ui/AuthWebShell';
import { MobileShell } from '@/components/ui/MobileShell';
import { TrainerDesktopShell } from '@/components/ui/TrainerDesktopShell';
import { useAuth } from '@/hooks/useAuth';
import { isTrainerDesktopWeb, isWebPlatform } from '@/lib/platformAccess';

interface AppShellProps {
  children: React.ReactNode;
}

function isAuthRoute(segments: string[]) {
  return segments[0] === 'auth';
}

export function AppShell({ children }: AppShellProps) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  if (!isWebPlatform()) {
    return <>{children}</>;
  }

  if (!isLoading && isTrainerDesktopWeb(user?.role)) {
    return <TrainerDesktopShell>{children}</TrainerDesktopShell>;
  }

  if (isAuthRoute(segments) || !user) {
    return <AuthWebShell>{children}</AuthWebShell>;
  }

  return <MobileShell>{children}</MobileShell>;
}
