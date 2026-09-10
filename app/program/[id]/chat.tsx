import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useProgram } from '@/hooks/usePrograms';
import { useProgramChatMessages } from '@/hooks/useProgramChatMessages';
import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';
import { canEnterHypeCatalogProgram, isPaidHypeCatalogProgram } from '@/lib/hypeCatalog';
import { HypeCatalogAccessGate } from '@/components/program/HypeCatalogAccessGate';
import { normalizeRouteParam } from '@/lib/routeParams';

export default function ProgramGroupChatScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const programId = normalizeRouteParam(params.id) ?? '';
  const { user } = useAuth();
  const { program, isLoading: loadingProgram } = useProgram(programId);
  const { messages, isEmpty, isLoading, canAccess, persistent, sendMessage } =
    useProgramChatMessages(programId);

  const composer = useChatComposer({
    onSend: async (text) => sendMessage(text),
    attachmentsEnabled: false,
  });

  if (loadingProgram || isLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!program) {
    return <Redirect href="/tabs/programs" />;
  }

  if (isPaidHypeCatalogProgram(program) && !canEnterHypeCatalogProgram(user?.role)) {
    return <HypeCatalogAccessGate program={program} />;
  }

  if (!canAccess) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>
          Solo puedes entrar al chat grupal si tienes esta programación activa.
        </Text>
      </ScreenWrapper>
    );
  }

  const isStaff = isTrainerRole(user?.role);

  return (
    <>
      <Stack.Screen options={{ title: `Chat · ${program.name}` }} />
      <ScreenWrapper scrollable={false} padded={false}>
        <View style={styles.container}>
          {!persistent ? (
            <Text style={styles.warning}>
              El chat grupal todavía no está guardado en Supabase. Ejecuta npm run
              supabase:program-group-chat.
            </Text>
          ) : null}
          <TrainerChatPanel
            title={`Chat de ${program.name}`}
            subtitle={
              isStaff
                ? 'Administras este chat grupal. Los atletas apuntados pueden leer y escribir.'
                : 'Comparte dudas y avances con el resto de atletas de esta programación.'
            }
            emptyTitle="Sin mensajes todavía"
            emptyText={
              isStaff
                ? 'Da la bienvenida o publica el primer aviso para los atletas.'
                : 'Sé el primero en escribir en este grupo.'
            }
            messages={messages}
            isEmpty={isEmpty}
            viewerRole={isStaff ? 'trainer' : 'user'}
            currentUserId={user?.id}
            composer={composer}
          />
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  loader: { marginTop: spacing.xl },
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
