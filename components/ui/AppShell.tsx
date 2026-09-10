import { View, StyleSheet } from 'react-native';
import { Redirect, usePathname, useSegments } from 'expo-router';

import { AthleteTabBar } from '@/components/ui/AthleteTabBar';
import { AuthWebShell } from '@/components/ui/AuthWebShell';
import { GymShell } from '@/components/ui/GymShell';
import { MobileShell } from '@/components/ui/MobileShell';
import { TrainerDesktopShell } from '@/components/ui/TrainerDesktopShell';
import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isGymRole } from '@/lib/athleteService';
import {
  isGymRoleAthleteRouteAllowed,
  isGymTvDisplayRoute,
  isTrainerDesktopWeb,
  isWebPlatform,
  usesGymPanel,
} from '@/lib/platformAccess';

interface AppShellProps {
  children: React.ReactNode;
}

function isAuthRoute(segments: string[]) {
  return segments[0] === 'auth';
}

function isLandingRoute(segments: string[]) {
  const [first] = segments;
  return first === undefined || first === 'index';
}

function withPersistentTabs(children: React.ReactNode) {
  return (
    <View style={styles.shell}>
      <View style={styles.content}>{children}</View>
      <AthleteTabBar />
    </View>
  );
}

export function AppShell({ children }: AppShellProps) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const isGymPanel = !isLoading && Boolean(user) && usesGymPanel(user?.role);
  const showAthleteTabs =
    !isLoading &&
    Boolean(user) &&
    !isAuthRoute(segments) &&
    !isLandingRoute(segments) &&
    !isTrainerDesktopWeb(user?.role) &&
    !isGymPanel;

  const gymRoleBlockedRoute =
    !isLoading &&
    isGymRole(user?.role) &&
    !pathname.startsWith('/gym') &&
    !pathname.startsWith('/auth') &&
    !isGymRoleAthleteRouteAllowed(pathname);

  if (gymRoleBlockedRoute) {
    return <Redirect href="/gym" />;
  }

  // El CRM de gimnasios usa el mismo panel en web y en la app.
  // La vista de TV va a pantalla completa, sin el menú lateral.
  if (isGymTvDisplayRoute([...segments])) {
    return <>{children}</>;
  }

  if (isGymPanel && !isAuthRoute(segments)) {
    return <GymShell>{children}</GymShell>;
  }

  if (!isWebPlatform()) {
    return showAthleteTabs ? withPersistentTabs(children) : <>{children}</>;
  }

  if (!isLoading && isTrainerDesktopWeb(user?.role)) {
    return <TrainerDesktopShell>{children}</TrainerDesktopShell>;
  }

  // La portada pública ocupa todo el ancho, no el marco estrecho de las pantallas de acceso.
  if (!user && isLandingRoute(segments)) {
    return <>{children}</>;
  }

  if (isAuthRoute(segments) || !user) {
    return <AuthWebShell>{children}</AuthWebShell>;
  }

  return <MobileShell>{showAthleteTabs ? withPersistentTabs(children) : children}</MobileShell>;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
