import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ActionSheetModal } from '@/components/ui/ActionSheetModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PromptModal } from '@/components/ui/PromptModal';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useSessionTemplates } from '@/hooks/useSessionTemplates';
import type { SessionTemplate } from '@/lib/sessionTemplateService';
import { CreateSessionTemplateModal } from '@/components/trainer/CreateSessionTemplateModal';
import {
  canSaveSessionAsTemplate,
  describeSessionTemplate,
  mergeTemplateIntoDraft,
  sessionDraftToTemplateContent,
} from '@/lib/sessionTemplates';
import type { SessionDraft } from '@/lib/trainerSessionDraft';

interface SessionTemplatesCardProps {
  draft: SessionDraft;
  onChange: (draft: SessionDraft) => void;
}

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

function TemplateRow({
  template,
  onApply,
  onOptions,
}: {
  template: SessionTemplate;
  onApply: () => void;
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
        onPress={onApply}
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

export function SessionTemplatesCard({ draft, onChange }: SessionTemplatesCardProps) {
  const router = useRouter();
  const { templates, isLoading, saving, persistent, error, isTrainer, create, update, remove } =
    useSessionTemplates();
  const [listOpen, setListOpen] = useState(false);
  const [optionsFor, setOptionsFor] = useState<SessionTemplate | null>(null);
  const [renaming, setRenaming] = useState<SessionTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isTrainer) return null;

  const canSave = canSaveSessionAsTemplate(draft);

  const openTemplateEditor = (templateId = 'new') => {
    setListOpen(false);
    setOptionsFor(null);
    router.push(`/trainer/template/${templateId}`);
  };

  const applyTemplate = (template: SessionTemplate) => {
    onChange(mergeTemplateIntoDraft(draft, template.content));
    setListOpen(false);
    setOptionsFor(null);
    setNotice(
      `Plantilla "${template.name}" añadida a esta sesión. Ajusta lo que necesites antes de guardar.`,
    );
  };

  const handleRename = async (name: string) => {
    const template = renaming;
    setRenaming(null);
    if (!template) return;
    const result = await update(template, { name });
    if (!result.error) setNotice('Plantilla renombrada.');
  };

  const handleOverwrite = async (template: SessionTemplate) => {
    setOptionsFor(null);
    if (!canSave) {
      setNotice('Confirma al menos un bloque antes de actualizar la plantilla.');
      return;
    }
    const result = await update(template, { content: sessionDraftToTemplateContent(draft) });
    if (!result.error) setNotice(`Plantilla "${template.name}" actualizada con esta sesión.`);
  };

  const handleDelete = (template: SessionTemplate) => {
    setOptionsFor(null);
    confirmDelete(template.name, () => {
      void remove(template).then((result) => {
        if (!result.error) setNotice(`Plantilla "${template.name}" eliminada.`);
      });
    });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Plantillas</Text>
          <Text style={styles.subtitle}>
            Guarda bloques o ejercicios sueltos y reutilízalos en cualquier sesión. Al usar una
            plantilla, su contenido se añade a la sesión actual.
          </Text>
        </View>
        {templates.length > 0 ? <Text style={styles.count}>{templates.length}</Text> : null}
      </View>

      {!persistent ? (
        <Text style={styles.warning}>
          Las plantillas se guardan solo en este dispositivo. Ejecuta npm run
          supabase:session-templates para guardarlas en Supabase.
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          title={isLoading ? 'Cargando plantillas…' : 'Usar plantilla'}
          variant="outline"
          onPress={() => setListOpen(true)}
          disabled={isLoading || templates.length === 0}
          style={styles.actionButton}
        />
        <Button
          title="Guardar bloques/ejercicios como plantilla"
          variant="outline"
          onPress={() => setCreateOpen(true)}
          loading={saving || createSaving}
          disabled={!canSave || saving || createSaving}
          style={styles.actionButton}
        />
        <Button
          title="Crear plantilla nueva"
          variant="outline"
          onPress={() => openTemplateEditor()}
          style={styles.actionButton}
        />
      </View>

      {templates.length === 0 && !isLoading ? (
        <Text style={styles.hint}>
          Todavía no tienes plantillas. Elige bloques o ejercicios de esta sesión y guárdalos, o
          créala desde cero.
        </Text>
      ) : null}

      {!canSave && templates.length > 0 ? (
        <Text style={styles.hint}>
          Confirma algún bloque para poder guardar ejercicios o bloques como plantilla.
        </Text>
      ) : null}

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={listOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setListOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setListOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>Tus plantillas</Text>
            <Text style={styles.sheetSubtitle}>
              Toca una plantilla para añadir sus bloques o ejercicios a esta sesión.
            </Text>
            <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetListContent}>
              {templates.map((template) => (
                <TemplateRow
                  key={template.id}
                  template={template}
                  onApply={() => applyTemplate(template)}
                  onOptions={() => {
                    setListOpen(false);
                    setOptionsFor(template);
                  }}
                />
              ))}
            </ScrollView>
            <Button
              title="Crear plantilla nueva"
              variant="outline"
              onPress={() => openTemplateEditor()}
              style={styles.sheetClose}
            />
            <Button
              title="Cerrar"
              variant="secondary"
              onPress={() => setListOpen(false)}
              style={styles.sheetClose}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <ActionSheetModal
        visible={optionsFor != null}
        title={optionsFor?.name}
        subtitle="Qué quieres hacer con esta plantilla"
        onClose={() => setOptionsFor(null)}
        actions={[
          {
            key: 'apply',
            label: 'Añadir a esta sesión',
            onPress: () => optionsFor && applyTemplate(optionsFor),
          },
          {
            key: 'edit',
            label: 'Editar la plantilla',
            onPress: () => optionsFor && openTemplateEditor(optionsFor.id),
          },
          {
            key: 'overwrite',
            label: 'Sobrescribir con el contenido actual',
            disabled: !canSave,
            onPress: () => optionsFor && void handleOverwrite(optionsFor),
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

      <CreateSessionTemplateModal
        visible={createOpen}
        draft={draft}
        saving={createSaving}
        onClose={() => {
          if (createSaving) return;
          setCreateOpen(false);
        }}
        onConfirm={(input) => {
          void (async () => {
            setCreateSaving(true);
            const result = await create(input.name, input.content);
            setCreateSaving(false);
            if (result.error) {
              setNotice(result.error);
              return;
            }
            setCreateOpen(false);
            setNotice(`Plantilla "${input.name}" guardada.`);
          })();
        }}
      />

      <PromptModal
        visible={renaming != null}
        title="Renombrar plantilla"
        initialValue={renaming?.name ?? ''}
        confirmLabel="Guardar nombre"
        onCancel={() => setRenaming(null)}
        onConfirm={(value) => void handleRename(value)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  count: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: 200,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 17,
  },
  notice: {
    ...typography.caption,
    color: colors.accent,
    lineHeight: 17,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sheetSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sheetList: {
    flexGrow: 0,
  },
  sheetListContent: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  sheetClose: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
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
});
