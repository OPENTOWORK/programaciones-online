import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { ProfileAppointmentsCard } from '@/components/appointments/ProfileAppointmentsCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PrivacyPolicyLink } from '@/components/legal/PrivacyPolicyLink';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { goalLabels, levelColors, colors, spacing, typography } from '@/constants/theme';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';

function formatOptionalValue(value: string | number | undefined, suffix = '') {
  if (value === undefined || value === null || value === '') {
    return 'No indicado';
  }

  return `${value}${suffix}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, signOut, refreshUser } = useAuth();
  const isAthlete = !isTrainerRole(user?.role);
  const { isComplete: intakeComplete, isLoading: intakeLoading } = useAthleteIntakeForm();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  /** Remonta las secciones para dejarlas siempre cerradas al volver al perfil. */
  const [sectionsKey, setSectionsKey] = useState(0);

  const collapseSections = useCallback(() => {
    setSectionsKey((current) => current + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      collapseSections();
    }, [collapseSections]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      collapseSections();
    });
    return unsubscribe;
  }, [collapseSections, navigation]);

  useFocusRefresh(() => {
    void refreshUser();
  });

  if (!user) return null;

  const confirmLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    setShowLogoutConfirm(false);
    router.replace('/auth/login');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      setShowLogoutConfirm(true);
      return;
    }

    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: confirmLogout },
    ]);
  };

  const handleEdit = () => {
    router.push('/profile/edit');
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.avatarInitials}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.fitnessLevel || user.mainGoal ? (
          <View style={styles.badges}>
            {user.fitnessLevel ? (
              <Badge label={user.fitnessLevel} color={levelColors[user.fitnessLevel]} />
            ) : null}
            {user.mainGoal ? <Badge label={goalLabels[user.mainGoal]} color={colors.accentBlue} /> : null}
          </View>
        ) : null}
      </View>

      <View key={sectionsKey}>
        {isAthlete ? (
          <CollapsibleSection
            title="Formulario de bienvenida"
            subtitle={
              intakeLoading
                ? 'Comprobando…'
                : intakeComplete
                  ? 'Completado'
                  : 'Pendiente · ayuda a tu entrenador a conocerte'
            }
            style={
              !intakeComplete && !intakeLoading
                ? { ...styles.sectionCard, ...styles.intakeCardPending }
                : styles.sectionCard
            }
          >
            <Button
              title={intakeComplete ? 'Ver o editar respuestas' : 'Completar formulario'}
              variant={intakeComplete ? 'outline' : 'primary'}
              onPress={() => router.push('/profile/intake-form')}
            />
          </CollapsibleSection>
        ) : null}

        <ProfileAppointmentsCard style={styles.sectionCard} />

        <CollapsibleSection title="Datos físicos" style={styles.sectionCard}>
          <InfoRow label="Altura" value={formatOptionalValue(user.height, ' cm')} />
          <InfoRow label="Peso" value={formatOptionalValue(user.weight, ' kg')} />
          <InfoRow label="Limitaciones" value={formatOptionalValue(user.injuries)} />
        </CollapsibleSection>
      </View>

      <Button title="Editar perfil" onPress={handleEdit} variant="outline" style={styles.btn} />

      {showLogoutConfirm ? (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>¿Seguro que quieres salir?</Text>
          <Text style={styles.confirmText}>Tendrás que iniciar sesión de nuevo para acceder a tu cuenta.</Text>
          <View style={styles.confirmActions}>
            <Button
              title="Cancelar"
              onPress={() => setShowLogoutConfirm(false)}
              variant="outline"
              disabled={loggingOut}
              style={styles.confirmBtn}
            />
            <Button
              title="Salir"
              onPress={confirmLogout}
              loading={loggingOut}
              style={styles.confirmBtn}
            />
          </View>
        </View>
      ) : (
        <Button title="Cerrar sesión" onPress={handleLogout} variant="ghost" style={styles.btn} />
      )}

      <PrivacyPolicyLink variant="small" />
    </ScreenWrapper>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.black },
  name: { ...typography.h2, color: colors.text },
  email: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  sectionCard: { marginTop: spacing.md },
  intakeCardPending: { borderColor: colors.accent },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { ...typography.body, color: colors.textSecondary },
  rowValue: { ...typography.body, color: colors.text, fontWeight: '500' },
  btn: { marginTop: spacing.md },
  confirmBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: `${colors.danger}11`,
  },
  confirmTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  confirmText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  confirmBtn: { flex: 1, marginTop: 0, minHeight: 44 },
});
