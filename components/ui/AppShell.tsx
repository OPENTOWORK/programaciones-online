import { View, StyleSheet } from 'react-native';
import { useSegments } from 'expo-router';

import { AthleteTabBar } from '@/components/ui/AthleteTabBar';
import { AuthWebShell } from '@/components/ui/AuthWebShell';
import { MobileShell } from '@/components/ui/MobileShell';
import { TrainerDesktopShell } from '@/components/ui/TrainerDesktopShell';
import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isTrainerDesktopWeb, isWebPlatform } from '@/lib/platformAccess';

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
  const showAthleteTabs =
    !isLoading && Boolean(user) && !isAuthRoute(segments) && !isLandingRoute(segments) && !isTrainerDesktopWeb(user?.role);

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
