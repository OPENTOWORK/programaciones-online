import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/ui/AppLogo';
import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { AppUpdateStatus } from '@/lib/appUpdateService';
import { openExternalUrl } from '@/lib/openExternalUrl';

interface UpdateRequiredScreenProps {
  status: AppUpdateStatus;
  onRetry: () => void;
}

const DEFAULT_MESSAGE =
  'Hay una versión nueva de Training ProgLine. Actualiza desde la tienda para seguir entrenando con tus programaciones al día.';

export function UpdateRequiredScreen({ status, onRetry }: UpdateRequiredScreenProps) {
  const storeUrl = status.storeUrl;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppLogo size={72} style={styles.logo} />

        <View style={styles.iconWrap}>
          <Ionicons name="cloud-download-outline" size={30} color={colors.accent} />
        </View>

        <Text style={styles.title}>Actualización necesaria</Text>
        <Text style={styles.message}>{status.updateMessage?.trim() || DEFAULT_MESSAGE}</Text>

        {status.currentVersion || status.latestVersion ? (
          <View style={styles.versionBox}>
            {status.currentVersion ? (
              <Text style={styles.versionText}>Tu versión: {status.currentVersion}</Text>
            ) : null}
            {status.latestVersion ? (
              <Text style={styles.versionTextStrong}>Disponible: {status.latestVersion}</Text>
            ) : null}
          </View>
        ) : null}

        {storeUrl ? (
          <Button
            title="Actualizar ahora"
            onPress={() => void openExternalUrl(storeUrl)}
            style={styles.action}
          />
        ) : null}

        <Button
          title="Ya he actualizado"
          variant="outline"
          onPress={onRetry}
          style={styles.action}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  logo: {
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.accent, '1A'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '55'),
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 420,
  },
  versionBox: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 2,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  versionTextStrong: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  action: {
    marginTop: spacing.md,
    minWidth: 240,
  },
});
