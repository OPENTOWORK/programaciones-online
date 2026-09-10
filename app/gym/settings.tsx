import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
import { useGym } from '@/hooks/useGym';
import { fetchGymStaff, updateGym } from '@/lib/gymService';
import { GYM_USER_ROLE_LABELS, type GymUser } from '@/lib/gymTypes';

export default function GymSettingsScreen() {
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
  const [saveSuccess, setSaveSuccess] = useState(false);
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
        <View style={styles.list}>
          {staff.length === 0 ? (
            <Text style={styles.emptyRow}>Todavía no hay usuarios en este gimnasio.</Text>
          ) : (
            staff.map((member, index) => (
              <View
                key={member.id}
                style={[styles.row, index === staff.length - 1 && styles.rowLast]}
              >
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {member.name ?? 'Usuario'}
                  </Text>
                  <Text style={styles.rowMeta}>{GYM_USER_ROLE_LABELS[member.role]}</Text>
                </View>
              </View>
            ))
          )}
        </View>
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
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowLast: { borderBottomWidth: 0 },
  rowCopy: { minWidth: 0 },
  rowTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  rowMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  emptyRow: {
    ...typography.caption,
    color: colors.textMuted,
    padding: spacing.md,
    fontStyle: 'italic',
  },
});
