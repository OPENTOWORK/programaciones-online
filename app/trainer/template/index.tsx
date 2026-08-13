import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ActionSheetModal } from '@/components/ui/ActionSheetModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PromptModal } from '@/components/ui/PromptModal';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useSessionTemplates } from '@/hooks/useSessionTemplates';
import { safeGoBack } from '@/lib/navigation';
import type { SessionTemplate } from '@/lib/sessionTemplateService';
import { describeSessionTemplate } from '@/lib/sessionTemplates';

function confirmDelete(name: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`¿Eliminar la plantilla "${name}"?`)) onConfirm();
    return;
  }
  Alert.alert('Eliminar plantilla', `Se eliminará "${name}".`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}

function TemplateListItem({
  template,
  onEdit,
  onOptions,
}: {
  template: SessionTemplate;
  onEdit: () => void;
  onOptions: () => void;
}) {
  const summary = describeSessionTemplate(template.content);
  const details = [
    `${summary.blockCount} bloque${summary.blockCount === 1 ? '' : 's'}`,
    summary.duration,
    summary.schedule,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
      >
        <Text style={styles.rowName} numberOfLines={1}>
          {template.name}
        </Text>
        <Text style={styles.rowDetails} numberOfLines={1}>
          {details}
        </Text>
        {summary.blockLabels.length > 0 ? (
          <Text style={styles.rowBlocks} numberOfLines={1}>
            {summary.blockLabels.join(' · ')}
          </Text>
        ) : null}
      </Pressable>
      <Pressable
        onPress={onOptions}
        hitSlop={8}
        accessibilityLabel={`Opciones de ${template.name}`}
        style={({ pressed }) => [styles.rowOptions, pressed && styles.pressed]}
      >
        <AppIcon name="menuDots" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

export default function TrainerSessionTemplatesScreen() {
  const router = useRouter();
  const { templates, isLoading, saving, persistent, error, isTrainer, update, remove } =
    useSessionTemplates();
  const [optionsFor, setOptionsFor] = useState<SessionTemplate | null>(null);
  const [renaming, setRenaming] = useState<SessionTemplate | null>(null);

  if (!isTrainer) {
    return (
      <ScreenWrapper>
        <Text style={styles.empty}>Solo el entrenador puede gestionar plantillas.</Text>
      </ScreenWrapper>
    );
  }

  const openEditor = (templateId = 'new') => {
    router.push(`/trainer/template/${templateId}`);
  };

  const handleRename = async (name: string) => {
    const template = renaming;
    setRenaming(null);
    if (!template) return;
    await update(template, { name });
  };

  const handleDelete = (template: SessionTemplate) => {
    setOptionsFor(null);
    confirmDelete(template.name, () => {
      void remove(template);
    });
  };

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Plantillas de sesión"
        subtitle="Crea y edita sesiones reutilizables para aplicarlas en cualquier programación"
      />

      {!persistent ? (
        <Text style={styles.warning}>
          Las plantillas se guardan solo en este dispositivo. Ejecuta npm run
          supabase:session-templates para guardarlas en Supabase.
        </Text>
      ) : null}

      <Button
        title="Crear plantilla nueva"
        onPress={() => openEditor()}
        loading={saving}
        style={styles.createButton}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : templates.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sin plantillas todavía</Text>
          <Text style={styles.emptyText}>
            Crea tu primera plantilla para reutilizar bloques, duración y días en cualquier
            programación.
          </Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {templates.map((template) => (
            <TemplateListItem
              key={template.id}
              template={template}
              onEdit={() => openEditor(template.id)}
              onOptions={() => setOptionsFor(template)}
            />
          ))}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title="Volver"
        variant="secondary"
        onPress={() => safeGoBack(router, '/tabs/trainer')}
        style={styles.backButton}
      />

      <ActionSheetModal
        visible={optionsFor != null}
        title={optionsFor?.name}
        subtitle="Qué quieres hacer con esta plantilla"
        onClose={() => setOptionsFor(null)}
        actions={[
          {
            key: 'edit',
            label: 'Editar la plantilla',
            onPress: () => optionsFor && openEditor(optionsFor.id),
          },
          {
            key: 'rename',
            label: 'Renombrar',
            onPress: () => {
              const template = optionsFor;
              setOptionsFor(null);
              setRenaming(template);
            },
          },
          {
            key: 'delete',
            label: 'Eliminar',
            destructive: true,
            onPress: () => optionsFor && handleDelete(optionsFor),
          },
        ]}
      />

      <PromptModal
        visible={renaming != null}
        title="Renombrar plantilla"
        initialValue={renaming?.name ?? ''}
        confirmLabel="Guardar nombre"
        onCancel={() => setRenaming(null)}
        onConfirm={(value) => void handleRename(value)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  createButton: {
    marginBottom: spacing.lg,
  },
  loader: {
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowMain: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  rowName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  rowDetails: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowBlocks: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowOptions: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
  emptyCard: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  backButton: {
    marginTop: spacing.sm,
  },
});
