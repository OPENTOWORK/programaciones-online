import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole, isGymRole } from '@/lib/athleteService';

/**
 * El CRM de gimnasios es exclusivo del rol `gimnasio`. El administrador global
 * también puede entrar para dar soporte. La RLS protege los datos aparte de esto.
 */
export default function GymLayout() {
  const { user, isLoading } = useAuth();

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

  if (!isGymRole(user.role) && !isAdminRole(user.role)) {
    return <Redirect href="/tabs/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
