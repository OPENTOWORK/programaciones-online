import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';

interface ProfileLoadErrorProps {
  message: string;
  onRetry: () => void;
  onSignOut: () => void;
  retrying?: boolean;
  signingOut?: boolean;
}

export function ProfileLoadError({
  message,
  onRetry,
  onSignOut,
  retrying = false,
  signingOut = false,
}: ProfileLoadErrorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil no disponible</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        <Button title="Reintentar" onPress={onRetry} loading={retrying} />
        <Button title="Cerrar sesión" variant="secondary" onPress={onSignOut} loading={signingOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
