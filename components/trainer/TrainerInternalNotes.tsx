import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { TrainerInternalNote } from '@/lib/trainerProfessionalProfile';

function formatUpdatedAt(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function TrainerInternalNotes({
  note,
  persistent,
  onSave,
}: {
  note: TrainerInternalNote;
  persistent: boolean;
  onSave: (value: string) => Promise<{ error?: string }>;
}) {
  const [value, setValue] = useState(note.note);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(note.note);
    setSaved(false);
  }, [note.note]);

  const dirty = value.trim() !== note.note.trim();

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await onSave(value);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSaved(true);
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

  const updatedAt = formatUpdatedAt(note.updatedAt);

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>
        Solo la ven los administradores. El entrenador no tiene acceso a estas notas.
      </Text>

      <TextInput
        value={value}
        onChangeText={(next) => {
          setValue(next);
          setSaved(false);
        }}
        placeholder="Ej. Especializado en Hyrox. Revisar ampliación de clientes en octubre."
        placeholderTextColor={colors.textMuted}
        multiline
        style={styles.input}
        accessibilityLabel="Notas internas sobre el entrenador"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Text style={styles.meta}>
          {saved && !dirty
            ? 'Guardado'
            : updatedAt
              ? `Última edición: ${updatedAt}`
              : 'Sin notas todavía'}
        </Text>
        <Button
          title="Guardar nota"
          variant="outline"
          size="compact"
          onPress={() => void handleSave()}
          loading={saving}
          disabled={!dirty}
        />
      </View>
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
  input: {
    minHeight: 92,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.bodySmall,
    textAlignVertical: 'top',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 1,
  },
});
