import { Redirect } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { ProfileLoadError } from '@/components/auth/ProfileLoadError';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { parseAuthCallbackResult } from '@/lib/authCallback';
import { getPostLoginRoute } from '@/lib/navigation';
import { isTrainerDesktopWeb } from '@/lib/platformAccess';
import { colors, spacing, typography } from '@/constants/theme';

export default function Index() {
  const { user, isLoading, initError, profileError, retryInit, retryProfileLoad, signOut } = useAuth();
  const [retryingProfile, setRetryingProfile] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (Platform.OS === 'web') {
    const callback = parseAuthCallbackResult();
    if (callback.status === 'error') {
      return (
        <Redirect
          href={`/auth/confirm-email?error=${encodeURIComponent(callback.message)}`}
        />
      );
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorTitle}>No se pudo conectar</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
        <Button title="Reintentar" onPress={retryInit} />
      </View>
    );
  }

  if (profileError) {
    return (
      <ProfileLoadError
        message={profileError}
        retrying={retryingProfile}
        signingOut={signingOut}
        onRetry={async () => {
          setRetryingProfile(true);
          await retryProfileLoad();
          setRetryingProfile(false);
        }}
        onSignOut={async () => {
          setSigningOut(true);
          await signOut();
          setSigningOut(false);
        }}
      />
    );
  }

  if (user) {
    if (isTrainerDesktopWeb(user.role)) {
      return <Redirect href={getPostLoginRoute(user.role)} />;
    }
    return <Redirect href={getPostLoginRoute(user.role)} />;
  }

  return <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
