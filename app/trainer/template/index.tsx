import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useSessionTemplates } from '@/hooks/useSessionTemplates';
import { safeGoBack } from '@/lib/navigation';
import type { SessionTemplate } from '@/lib/sessionTemplateService';
import { groupTemplatesByTag } from '@/lib/sessionTemplateTags';
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

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
      >
        <Text style={styles.rowName} numberOfLines={2}>
          {template.formatTag ?? template.tag ?? template.name}
        </Text>
        <Text style={styles.rowDetails} numberOfLines={1}>
          {[
            template.formatTag && template.tag ? template.tag : null,
            `${summary.blockCount} bloque${summary.blockCount === 1 ? '' : 's'}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        {summary.exerciseLines.length > 0 ? (
          <View style={styles.exerciseList}>
            {summary.exerciseLines.map((line, index) => (
              <Text key={`${template.id}-ex-${index}`} style={styles.exerciseLine} numberOfLines={2}>
                • {line}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.rowBlocks}>Sin ejercicios listados</Text>
        )}
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
  const { templates, isLoading, saving, persistent, error, isTrainer, remove } =
    useSessionTemplates();
  const [optionsFor, setOptionsFor] = useState<SessionTemplate | null>(null);
  const groups = useMemo(() => groupTemplatesByTag(templates), [templates]);

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

  const handleDelete = (template: SessionTemplate) => {
    setOptionsFor(null);
    confirmDelete(template.name, () => {
      void remove(template);
    });
  };

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Plantillas"
        subtitle="Organizadas por etiqueta. Despliega cada grupo para ver los ejercicios."
      />

      {!persistent ? (
        <Text style={styles.warning}>
          Las plantillas se guardan solo en este dispositivo. Ejecuta npm run
          supabase:session-templates-tags para guardarlas en Supabase.
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
            Crea plantillas desde el menú de una sesión y asígnales una etiqueta (Tren inferior,
            All, Tren superior, Core, Metcon o Descanso).
          </Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {groups.map((group) => (
            <CollapsibleSection
              key={group.label}
              title={group.label}
              subtitle={`${group.templates.length} plantilla${group.templates.length === 1 ? '' : 's'}`}
              defaultExpanded={false}
              style={styles.groupCard}
            >
              <View style={styles.groupList}>
                {group.templates.map((template) => (
                  <TemplateListItem
                    key={template.id}
                    template={template}
                    onEdit={() => openEditor(template.id)}
                    onOptions={() => setOptionsFor(template)}
                  />
                ))}
              </View>
            </CollapsibleSection>
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
            key: 'delete',
            label: 'Eliminar',
            destructive: true,
            onPress: () => optionsFor && handleDelete(optionsFor),
          },
        ]}
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
  groupCard: {
    marginBottom: 0,
  },
  groupList: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
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
  exerciseList: {
    marginTop: spacing.xs,
    gap: 2,
  },
  exerciseLine: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
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
