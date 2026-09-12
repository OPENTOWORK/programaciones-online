import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GymCrmPermissionsPanel } from '@/components/gym/GymCrmPermissionsPanel';
import { GymStaffRolesTable } from '@/components/gym/GymStaffRolesTable';
import {
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
  GymSectionTitle,
  GymSuccessBanner,
} from '@/components/gym/GymScreen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useGym } from '@/hooks/useGym';
import { fetchGymStaff, updateGym, updateGymStaffRole } from '@/lib/gymService';
import {
  gymRoleForAccessTier,
  GYM_STAFF_ACCESS_TIER_LABELS,
  type GymStaffAccessTier,
  type GymUser,
} from '@/lib/gymTypes';

export default function GymSettingsScreen() {
  const { user } = useAuth();
  const { gym, permissions, patchGym } = useGym();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    logoUrl: '',
  });
  const [staff, setStaff] = useState<GymUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [roleBusy, setRoleBusy] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [roleSuccess, setRoleSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gym) return;

    setForm({
      name: gym.name,
      email: gym.email ?? '',
      phone: gym.phone ?? '',
      address: gym.address ?? '',
      city: gym.city ?? '',
      postalCode: gym.postalCode ?? '',
      country: gym.country ?? '',
      logoUrl: gym.logoUrl ?? '',
    });
  }, [gym]);

  const loadStaff = useCallback(async () => {
    if (!gym) return;

    const staffResult = await fetchGymStaff(gym.id);
    setStaff(staffResult.data ?? []);
    setError(staffResult.error ?? null);
  }, [gym]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => setSaveSuccess(false), 4000);
    return () => clearTimeout(timer);
  }, [saveSuccess]);

  useEffect(() => {
    if (!roleSuccess) return;
    const timer = setTimeout(() => setRoleSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [roleSuccess]);

  const patch = (changes: Partial<typeof form>) =>
    setForm((current) => ({ ...current, ...changes }));

  const handleSave = async () => {
    if (!gym) return;
    if (!form.name.trim()) {
      setError('El nombre del gimnasio es obligatorio.');
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    const result = await updateGym(gym.id, form);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) patchGym(result.data);
    setSaveSuccess(true);
  };

  const handleRoleChange = useCallback(
    async (member: GymUser, tier: GymStaffAccessTier) => {
      const nextRole = gymRoleForAccessTier(tier, member.role);
      if (nextRole === member.role) return true;

      setRoleBusy(true);
      setError(null);
      setRoleSuccess(null);

      const result = await updateGymStaffRole(member.id, nextRole);
      setRoleBusy(false);

      if (result.error) {
        setError(result.error);
        return false;
      }

      if (result.data) {
        setStaff((current) =>
          current.map((entry) => (entry.id === member.id ? { ...entry, ...result.data } : entry)),
        );
      }

      setRoleSuccess(
        `${member.email ?? member.name ?? 'Usuario'} ahora es ${GYM_STAFF_ACCESS_TIER_LABELS[tier].toLowerCase()}.`,
      );
      return true;
    },
    [],
  );

  if (!permissions.canManage) {
    return (
      <GymScreen>
        <ScreenWrapper>
          <GymScreenHeader title="Configuración" />
          <Text style={styles.readOnly}>
            Solo el propietario o un gerente del gimnasio pueden cambiar la configuración.
          </Text>
        </ScreenWrapper>
      </GymScreen>
    );
  }

  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader title="Configuración" subtitle="Datos del gimnasio y equipo" />

        {error ? <GymErrorBanner message={error} /> : null}
        {roleSuccess ? (
          <GymSuccessBanner message={roleSuccess} onDismiss={() => setRoleSuccess(null)} />
        ) : null}

        <GymSectionTitle title="Datos generales" />
        <Input label="Nombre" value={form.name} onChangeText={(value) => patch({ name: value })} />
        <Input
          label="Email de contacto"
          value={form.email}
          onChangeText={(value) => patch({ email: value })}
          autoCapitalize="none"
        />
        <Input
          label="Teléfono"
          value={form.phone}
          onChangeText={(value) => patch({ phone: value })}
          keyboardType="phone-pad"
        />
        <Input
          label="Dirección"
          value={form.address}
          onChangeText={(value) => patch({ address: value })}
        />
        <Input label="Ciudad" value={form.city} onChangeText={(value) => patch({ city: value })} />
        <Input
          label="Código postal"
          value={form.postalCode}
          onChangeText={(value) => patch({ postalCode: value })}
        />
        <Input
          label="País"
          value={form.country}
          onChangeText={(value) => patch({ country: value })}
        />

        <GymSectionTitle title="Branding" subtitle="Logo que se muestra en el panel" />
        <Input
          label="URL del logo"
          value={form.logoUrl}
          onChangeText={(value) => patch({ logoUrl: value })}
          placeholder="https://..."
          autoCapitalize="none"
        />

        <Button
          title="Guardar cambios"
          onPress={() => void handleSave()}
          loading={saving}
          style={styles.saveButton}
        />
        {saveSuccess ? (
          <GymSuccessBanner
            message="Cambios guardados"
            onDismiss={() => setSaveSuccess(false)}
          />
        ) : null}

        <GymSectionTitle title="Usuarios y permisos" count={staff.length} />
        <GymStaffRolesTable
          staff={staff}
          currentUserId={user?.id}
          busy={roleBusy}
          onChangeRole={handleRoleChange}
        />

        <GymCrmPermissionsPanel />
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  readOnly: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
