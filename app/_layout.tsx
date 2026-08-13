import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ProgramsProvider } from '@/hooks/usePrograms';
import { AppShell } from '@/components/ui/AppShell';
import { colors } from '@/constants/theme';
import { logAppRuntimeInfo, logReleaseDiagnostic, logReleaseError } from '@/lib/releaseDiagnostics';

SplashScreen.preventAutoHideAsync();

type NativeErrorUtils = {
  getGlobalHandler: () => ((error: Error, isFatal?: boolean) => void) | undefined;
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

function installGlobalErrorHandlers() {
  const errorUtils = (globalThis as typeof globalThis & { ErrorUtils?: NativeErrorUtils }).ErrorUtils;
  if (errorUtils) {
    const previousHandler = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((error, isFatal) => {
      logReleaseError('global_js_error', error, { isFatal });
      previousHandler?.(error, isFatal);
    });
  }
}

installGlobalErrorHandlers();
logReleaseDiagnostic('app_start');
logAppRuntimeInfo();

function RootNavigator() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <>
      <StatusBar style="light" />
      <AppShell>
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
          <Stack.Screen name="plan/[id]/index" options={{ title: 'Programación' }} />
          <Stack.Screen name="plan/[id]/[venue]" options={{ title: 'Estándar' }} />
          <Stack.Screen name="program/[id]/index" options={{ title: 'Programación' }} />
          <Stack.Screen name="program/[id]/info" options={{ title: 'Ficha de la programación' }} />
          <Stack.Screen name="workout/[id]" options={{ title: 'Sesión' }} />
          <Stack.Screen name="library" options={{ title: 'Biblioteca de ejercicios' }} />
          <Stack.Screen name="calendar/[date]" options={{ title: 'Día de entreno' }} />
          <Stack.Screen name="athlete/plan/[id]/session" options={{ title: 'Sesión del plan' }} />
          <Stack.Screen name="profile/edit" options={{ title: 'Editar perfil' }} />
          <Stack.Screen name="profile/intake-form" options={{ title: 'Formulario de bienvenida' }} />
          <Stack.Screen name="profile/appointments" options={{ title: 'Citas' }} />
          <Stack.Screen name="legal/privacy" options={{ title: 'Política de privacidad' }} />
          <Stack.Screen name="trainer/athlete/[id]/calendar" options={{ title: 'Calendario del atleta', headerShown: false }} />
          <Stack.Screen name="trainer/athlete/[id]" options={{ title: 'Ficha del atleta' }} />
          <Stack.Screen name="trainer/athlete/[id]/log/[logId]" options={{ title: 'Registro de sesión' }} />
          <Stack.Screen name="trainer/chat/[id]" options={{ title: 'Chat con atleta' }} />
          <Stack.Screen name="trainer/plan/create" options={{ title: 'Nuevo plan' }} />
          <Stack.Screen name="trainer/plan/[id]" options={{ title: 'Plan del atleta' }} />
          <Stack.Screen name="trainer/template/index" options={{ title: 'Plantillas de sesión' }} />
          <Stack.Screen name="trainer/template/[id]" options={{ title: 'Plantilla de sesión' }} />
          <Stack.Screen name="trainer/program/create" options={{ title: 'Nueva programación' }} />
          <Stack.Screen name="trainer/program/[id]/edit" options={{ title: 'Editar programación' }} />
          <Stack.Screen name="trainer/program/[id]/session/[workoutId]" options={{ title: 'Editar sesión' }} />
          <Stack.Screen name="trainer/preview/session" options={{ title: 'Vista previa de sesión' }} />
          <Stack.Screen name="trainer/preview/day/[date]" options={{ title: 'Vista previa del día' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AppShell>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProgramsProvider>
        <RootNavigator />
      </ProgramsProvider>
    </AuthProvider>
  );
}
