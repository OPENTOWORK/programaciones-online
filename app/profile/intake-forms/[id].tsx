import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { IntakeFormTemplateFieldEditor } from '@/components/trainer/IntakeFormTemplateFieldEditor';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useIntakeFormTemplates } from '@/hooks/useIntakeFormTemplates';
import { safeGoBack } from '@/lib/navigation';
import { createEmptyIntakeField } from '@/lib/intakeFormTypes';

export default function TrainerIntakeFormEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNew = !rawId || rawId === 'new';

  const { templates, isLoading, saving, persistent, error, isTrainer, create, update, remove } =
    useIntakeFormTemplates();
  const template = isNew ? undefined : templates.find((entry) => entry.id === rawId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState(() => [createEmptyIntakeField('text')]);
  const [formError, setFormError] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isNew || !template || hydratedRef.current) return;
    hydratedRef.current = true;
    setName(template.name);
    setDescription(template.description ?? '');
    setIsDefault(template.isDefault);
    setIsActive(template.isActive);
    setFields(template.schema.fields.length > 0 ? template.schema.fields : [createEmptyIntakeField('text')]);
  }, [isNew, template]);

  const handleSave = async () => {
    setFormError(null);
    const schema = { fields };

    const result = template
      ? await update(template, {
          name,
          description,
          isDefault,
          isActive,
          schema,
        })
      : await create({
          name,
          description,
          isDefault,
          isActive,
          schema,
        });

    if (result.error) {
      setFormError(result.error);
      return;
    }

    router.replace('/profile/intake-forms' as Href);
  };

  const handleDelete = () => {
    if (!template || template.isDefault) return;

    const onConfirm = () => {
      void remove(template).then((result) => {
        if (!result.error) router.replace('/profile/intake-forms' as Href);
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar el formulario "${template.name}"?`)) onConfirm();
      return;
    }

    Alert.alert('Eliminar formulario', `Se eliminará "${template.name}".`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
    ]);
  };

  if (!isTrainer) {
    return (
      <ScreenWrapper>
        <Text style={styles.empty}>Solo el entrenador puede editar formularios.</Text>
      </ScreenWrapper>
    );
  }

  if (!isNew && isLoading && !template) {
    return (
      <ScreenWrapper>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!isNew && !isLoading && !template) {
    return (
      <ScreenWrapper>
        <Text style={styles.empty}>No se encontró el formulario.</Text>
        <Button title="Volver" variant="secondary" onPress={() => safeGoBack(router, '/tabs/profile')} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Pressable onPress={() => safeGoBack(router, '/profile/intake-forms')} style={styles.backRow}>
        <AppIcon name="chevronLeft" size={18} color={colors.textSecondary} />
        <Text style={styles.backText}>Volver</Text>
      </Pressable>

      <SectionHeader
        title={isNew ? 'Nuevo formulario' : 'Editar formulario'}
        subtitle="Define los campos que tus atletas deberán completar."
      />

      {!persistent ? (
        <Text style={styles.warning}>
          Los cambios se guardan solo en este dispositivo hasta aplicar supabase:intake-form-templates.
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <Input label="Nombre del formulario" value={name} onChangeText={setName} placeholder="Ej. Formulario inicial" />
      <Input
        label="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Breve explicación para el atleta"
        multiline
        style={styles.descriptionInput}
      />

      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setIsActive((current) => !current)}
          style={({ pressed }) => [styles.toggleChip, isActive && styles.toggleChipActive, pressed && styles.pressed]}
        >
          <Text style={[styles.toggleText, isActive && styles.toggleTextActive]}>
            {isActive ? 'Activo para atletas' : 'Inactivo'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setIsDefault((current) => !current)}
          style={({ pressed }) => [
            styles.toggleChip,
            isDefault && styles.toggleChipActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.toggleText, isDefault && styles.toggleTextActive]}>
            {isDefault ? 'Formulario por defecto' : 'Marcar como por defecto'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.fieldsTitle}>Campos del formulario</Text>
      <IntakeFormTemplateFieldEditor fields={fields} onChange={setFields} />

      <View style={styles.actions}>
        <Button title="Guardar" onPress={() => void handleSave()} loading={saving} />
        {template && !template.isDefault ? (
          <Button title="Eliminar" variant="secondary" onPress={handleDelete} />
        ) : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  descriptionInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggleChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '22'),
  },
  toggleText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.accent,
  },
  fieldsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.xl,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
});
