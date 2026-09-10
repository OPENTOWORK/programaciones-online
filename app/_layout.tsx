import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { TrainerNotificationsProvider } from '@/hooks/useTrainerNotifications';
import { AppThemeProvider, useAppTheme } from '@/hooks/useAppTheme';
import { useAppUpdateGate } from '@/hooks/useAppUpdateGate';
import { GymProvider } from '@/hooks/useGym';
import { ProgramsProvider } from '@/hooks/usePrograms';
import { AppShell } from '@/components/ui/AppShell';
import { UpdateRequiredScreen } from '@/components/ui/UpdateRequiredScreen';
import { colors } from '@/constants/theme';
import { logAppRuntimeInfo, logReleaseDiagnostic, logReleaseError } from '@/lib/releaseDiagnostics';
import { enableScreenCaptureProtection } from '@/lib/screenCaptureProtection';

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
  const { scheme } = useAppTheme();
  const { status: updateStatus, isChecking: checkingUpdate, recheck } = useAppUpdateGate();
  const isBooting = isLoading || checkingUpdate;
  const statusBarStyle = scheme === 'light' ? 'dark' : 'light';

  useEffect(() => {
    void enableScreenCaptureProtection();
  }, []);

  useEffect(() => {
    if (!isBooting) {
      void SplashScreen.hideAsync();
    }
  }, [isBooting]);

  if (updateStatus.updateRequired) {
    return (
      <>
        <StatusBar style={statusBarStyle} />
        <UpdateRequiredScreen status={updateStatus} onRetry={recheck} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={statusBarStyle} />
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
          <Stack.Screen name="plan/[id]/[venue]" options={{ title: 'Base · Training' }} />
          <Stack.Screen name="program/[id]/index" options={{ title: 'Programación' }} />
          <Stack.Screen name="program/[id]/chat" options={{ title: 'Chat grupal' }} />
          <Stack.Screen name="program/[id]/info" options={{ title: 'Ficha de la programación' }} />
          <Stack.Screen name="workout/[id]" options={{ title: 'Sesión' }} />
          <Stack.Screen name="library" options={{ title: 'Library · Exercises' }} />
          <Stack.Screen name="calendar/[date]" options={{ title: 'Día de entreno' }} />
          <Stack.Screen name="athlete/plan/[id]/session" options={{ title: 'Sesión del plan' }} />
          <Stack.Screen name="profile/edit" options={{ title: 'Editar perfil' }} />
          <Stack.Screen name="profile/intake-form" options={{ title: 'Formulario de bienvenida' }} />
          <Stack.Screen name="profile/intake-forms/index" options={{ title: 'Formularios para atletas' }} />
          <Stack.Screen name="profile/intake-forms/[id]" options={{ title: 'Editar formulario' }} />
          <Stack.Screen name="profile/nutrition" options={{ title: 'Datos de nutrición' }} />
          <Stack.Screen name="profile/training" options={{ title: 'Datos de entrenamiento' }} />
          <Stack.Screen name="profile/appointments" options={{ title: 'Citas' }} />
          <Stack.Screen name="legal/privacy" options={{ title: 'Política de privacidad' }} />
          <Stack.Screen name="support/index" options={{ title: 'Contacto' }} />
          <Stack.Screen name="support/[id]" options={{ title: 'Solicitud de soporte' }} />
          <Stack.Screen name="trainer/athlete/[id]/calendar" options={{ title: 'Calendario del atleta', headerShown: false }} />
          <Stack.Screen name="trainer/athlete/[id]" options={{ title: 'Ficha del atleta' }} />
          <Stack.Screen name="trainer/staff/[id]" options={{ title: 'Ficha del entrenador' }} />
          <Stack.Screen name="trainer/athlete/[id]/log/[logId]" options={{ title: 'Registro de sesión' }} />
          <Stack.Screen name="trainer/chat/[id]" options={{ title: 'Chat con atleta' }} />
          <Stack.Screen name="trainer/chats/index" options={{ title: 'Chats' }} />
          <Stack.Screen name="trainer/support/index" options={{ title: 'Soporte' }} />
          <Stack.Screen name="trainer/support/[id]" options={{ title: 'Solicitud de soporte' }} />
          <Stack.Screen name="trainer/gyms/index" options={{ title: 'CRM Gimnasios' }} />
          <Stack.Screen name="trainer/gyms/[id]" options={{ title: 'Ficha del gimnasio' }} />
          <Stack.Screen name="my-gym/[gymId]" options={{ title: 'Tu gimnasio' }} />
          <Stack.Screen name="gym" options={{ headerShown: false }} />
          <Stack.Screen name="trainer/client-chat" options={{ title: 'Tu entrenador' }} />
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
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AuthProvider>
        <TrainerNotificationsProvider>
          <AppThemeProvider>
            <GymProvider>
              <ProgramsProvider>
                <RootNavigator />
              </ProgramsProvider>
            </GymProvider>
          </AppThemeProvider>
        </TrainerNotificationsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
