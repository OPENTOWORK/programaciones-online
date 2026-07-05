import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AuthProvider } from '@/hooks/useAuth';
import { MobileShell } from '@/components/ui/MobileShell';
import { colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <MobileShell>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="tabs" options={{ headerShown: false }} />
          <Stack.Screen name="program/[id]" options={{ title: 'Programación' }} />
          <Stack.Screen name="workout/[id]" options={{ title: 'Sesión' }} />
          <Stack.Screen name="profile/edit" options={{ title: 'Editar perfil' }} />
          <Stack.Screen name="trainer/athlete/[id]" options={{ title: 'Ficha del atleta' }} />
          <Stack.Screen name="trainer/chat/[id]" options={{ title: 'Chat con atleta' }} />
          <Stack.Screen name="trainer/plan/create" options={{ title: 'Nuevo plan' }} />
          <Stack.Screen name="trainer/program/[id]/edit" options={{ title: 'Editar programación' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </MobileShell>
    </AuthProvider>
  );
}
