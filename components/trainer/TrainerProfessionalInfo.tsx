import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  isProfessionalProfileEmpty,
  TRAINER_MODALITY_OPTIONS,
  type TrainerModality,
  type TrainerProfessionalProfile,
} from '@/lib/trainerProfessionalProfile';

interface FormState {
  specialty: string;
  education: string;
  certifications: string;
  experienceYears: string;
  modality?: TrainerModality;
  centerName: string;
  bio: string;
}

function toForm(profile: TrainerProfessionalProfile): FormState {
  return {
    specialty: profile.specialty ?? '',
    education: profile.education ?? '',
    certifications: profile.certifications ?? '',
    experienceYears:
      profile.experienceYears === undefined ? '' : String(profile.experienceYears),
    modality: profile.modality,
    centerName: profile.centerName ?? '',
    bio: profile.bio ?? '',
  };
}

function modalityLabel(modality?: TrainerModality) {
  return TRAINER_MODALITY_OPTIONS.find((option) => option.value === modality)?.label;
}

export function TrainerProfessionalInfo({
  profile,
  persistent,
  canEdit,
  onSave,
}: {
  profile: TrainerProfessionalProfile;
  persistent: boolean;
  canEdit: boolean;
  onSave: (input: TrainerProfessionalProfile) => Promise<{ error?: string }>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(() => toForm(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) setForm(toForm(profile));
  }, [editing, profile]);

  const patch = (changes: Partial<FormState>) => setForm((current) => ({ ...current, ...changes }));

  const handleSave = async () => {
    const rawYears = form.experienceYears.trim();
    if (rawYears && !/^\d{1,2}$/.test(rawYears)) {
      setError('Los años de experiencia deben ser un número entre 0 y 70.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await onSave({
      specialty: form.specialty,
      education: form.education,
      certifications: form.certifications,
      experienceYears: rawYears ? Number(rawYears) : undefined,
      modality: form.modality,
      centerName: form.centerName,
      bio: form.bio,
    });
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setEditing(false);
  };

  if (!persistent) {
    return (
      <Text style={styles.hint}>
        Falta aplicar la migración en Supabase. Ejecuta{' '}
        <Text style={styles.code}>npm run supabase:trainer-professional-profile</Text> y vuelve a
        entrar.
      </Text>
    );
  }

  const empty = isProfessionalProfileEmpty(profile);

  return (
    <View style={styles.wrap}>
      {empty ? (
        <Text style={styles.hint}>
          Todavía no hay información profesional de este entrenador.
        </Text>
      ) : (
        <View>
          <Row label="Especialidad" value={profile.specialty} />
          <Row label="Titulación" value={profile.education} />
          <Row label="Certificaciones" value={profile.certifications} />
          <Row
            label="Experiencia"
            value={
              profile.experienceYears === undefined
                ? undefined
                : `${profile.experienceYears} año${profile.experienceYears === 1 ? '' : 's'}`
            }
          />
          <Row label="Modalidad" value={modalityLabel(profile.modality)} />
          <Row label="Centro" value={profile.centerName} last={!profile.bio} />
          {profile.bio ? (
            <View style={styles.bioBlock}>
              <Text style={styles.bioLabel}>Descripción</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          ) : null}
        </View>
      )}

      {canEdit ? (
        <Button
          title={empty ? 'Completar información' : 'Editar información'}
          variant="outline"
          size="compact"
          onPress={() => setEditing(true)}
        />
      ) : null}

      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
            onPress={() => setEditing(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.card}>
            <Text style={styles.title}>Información profesional</Text>
            <Text style={styles.subtitle}>
              Se guarda en la ficha del entrenador. La ve todo el staff.
            </Text>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <Input
                label="Especialidad"
                value={form.specialty}
                onChangeText={(value) => patch({ specialty: value })}
                placeholder="Ej. Hyrox y resistencia"
              />
              <Input
                label="Titulación"
                value={form.education}
                onChangeText={(value) => patch({ education: value })}
                placeholder="Ej. CAFyD"
              />
              <Input
                label="Certificaciones"
                value={form.certifications}
                onChangeText={(value) => patch({ certifications: value })}
                placeholder="Ej. CrossFit L2, Kettlebell L1"
                multiline
                style={styles.multiline}
              />
              <Input
                label="Años de experiencia"
                value={form.experienceYears}
                onChangeText={(value) => patch({ experienceYears: value.replace(/[^\d]/g, '') })}
                placeholder="Ej. 6"
                keyboardType="number-pad"
              />

              <Text style={styles.fieldLabel}>Modalidad</Text>
              <View style={styles.chips}>
                {TRAINER_MODALITY_OPTIONS.map((option) => {
                  const selected = form.modality === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => patch({ modality: selected ? undefined : option.value })}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={({ pressed }) => [
                        styles.chip,
                        selected && styles.chipActive,
                        pressed && styles.chipPressed,
                      ]}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Input
                label="Centro o gimnasio"
                value={form.centerName}
                onChangeText={(value) => patch({ centerName: value })}
                placeholder="Ej. Training ProgLine Madrid"
              />
              <Input
                label="Descripción profesional"
                value={form.bio}
                onChangeText={(value) => patch({ bio: value })}
                placeholder="Enfoque de trabajo, tipo de cliente, idiomas..."
                multiline
                style={styles.multilineTall}
              />
            </ScrollView>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setEditing(false)}
                style={styles.actionButton}
              />
              <Button
                title="Guardar"
                onPress={() => void handleSave()}
                loading={saving}
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Row({ label, value, last = false }: { label: string; value?: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value?.trim() || 'No indicado'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  code: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flexBasis: '42%',
  },
  rowValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  bioBlock: {
    paddingTop: spacing.sm,
  },
  bioLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  bioText: {
    ...typography.caption,
    color: colors.text,
    lineHeight: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '86%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  formScroll: {
    flexGrow: 0,
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.black,
  },
  multiline: {
    minHeight: 72,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  multilineTall: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
