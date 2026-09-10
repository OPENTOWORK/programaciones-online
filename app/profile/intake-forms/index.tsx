import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useIntakeFormTemplates } from '@/hooks/useIntakeFormTemplates';
import { safeGoBack } from '@/lib/navigation';
import type { IntakeFormTemplate } from '@/lib/intakeFormTypes';

function confirmDelete(name: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`¿Eliminar el formulario "${name}"?`)) onConfirm();
    return;
  }
}

export default function TrainerIntakeFormsScreen() {
  const router = useRouter();
  const { templates, isLoading, saving, persistent, error, isTrainer, remove } = useIntakeFormTemplates();

  if (!isTrainer) {
    return (
      <ScreenWrapper>
        <Text style={styles.empty}>Solo el entrenador puede gestionar formularios.</Text>
      </ScreenWrapper>
    );
  }

  const openEditor = (templateId = 'new') => {
    router.push(`/profile/intake-forms/${templateId}` as Href);
  };

  const handleDelete = (template: IntakeFormTemplate) => {
    if (template.isDefault) return;
    confirmDelete(template.name, () => {
      void remove(template);
    });
  };

  return (
    <ScreenWrapper>
      <Pressable onPress={() => safeGoBack(router, '/tabs/profile')} style={styles.backRow}>
        <AppIcon name="chevronLeft" size={18} color={colors.textSecondary} />
        <Text style={styles.backText}>Volver al perfil</Text>
      </Pressable>

      <SectionHeader
        title="Formularios para atletas"
        subtitle="Crea cuestionarios personalizados para que tus atletas completen antes o durante el entrenamiento."
      />

      {!persistent ? (
        <Text style={styles.warning}>
          Los formularios se guardan solo en este dispositivo. Ejecuta npm run supabase:intake-form-templates
          para guardarlos en Supabase.
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title="Crear formulario"
        onPress={() => openEditor('new')}
        loading={saving}
        style={styles.createButton}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : templates.length === 0 ? (
        <Text style={styles.empty}>Todavía no hay formularios. Crea el primero para tus atletas.</Text>
      ) : (
        <View style={styles.list}>
          {templates.map((template) => (
            <Card key={template.id} style={styles.card}>
              <Pressable onPress={() => openEditor(template.id)} style={styles.cardPress}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{template.name}</Text>
                  <View style={styles.badges}>
                    {template.isDefault ? <Text style={styles.badgeDefault}>Por defecto</Text> : null}
                    {!template.isActive ? <Text style={styles.badgeInactive}>Inactivo</Text> : null}
                  </View>
                </View>
                {template.description ? (
                  <Text style={styles.cardDescription}>{template.description}</Text>
                ) : null}
                <Text style={styles.cardMeta}>
                  {template.schema.fields.length} campo{template.schema.fields.length === 1 ? '' : 's'}
                </Text>
              </Pressable>
              {!template.isDefault ? (
                <Pressable
                  onPress={() => handleDelete(template)}
                  style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                  accessibilityLabel="Eliminar formulario"
                >
                  <AppIcon name="trash" size={18} color={colors.danger} />
                </Pressable>
              ) : null}
            </Card>
          ))}
        </View>
      )}
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
  createButton: {
    marginBottom: spacing.md,
  },
  loader: {
    marginTop: spacing.xl,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardPress: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badgeDefault: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    backgroundColor: withAlpha(colors.accent, '22'),
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeInactive: {
    ...typography.caption,
    color: colors.textMuted,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  deleteBtn: {
    alignSelf: 'flex-end',
    padding: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
