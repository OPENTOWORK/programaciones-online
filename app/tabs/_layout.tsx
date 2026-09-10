import { Redirect, Tabs, usePathname } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { isGymRole, isTrainerRole } from '@/lib/athleteService';
import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isGymRoleAthleteRouteAllowed } from '@/lib/platformAccess';

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (isGymRole(user.role) && !isGymRoleAthleteRouteAllowed(pathname)) {
    return <Redirect href="/gym" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarStyle: {
          display: 'none',
          height: 0,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="programs" options={{ title: 'Programas' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progreso' }} />
      <Tabs.Screen
        name="trainer"
        options={{ title: isTrainerRole(user.role) ? 'Atletas' : 'Entrenador' }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
