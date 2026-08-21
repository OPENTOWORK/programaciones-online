import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { SessionEditorForm } from '@/components/trainer/SessionEditorForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useSessionTemplates } from '@/hooks/useSessionTemplates';
import { safeGoBack } from '@/lib/navigation';
import { parsePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import {
  canSaveSessionAsTemplate,
  describeSessionTemplate,
  sessionDraftToTemplateContent,
} from '@/lib/sessionTemplates';
import {
  buildSessionTemplateName,
  SESSION_TEMPLATE_FORMAT_TAGS,
  SESSION_TEMPLATE_ZONE_TAGS,
  type SessionTemplateFormatTag,
  type SessionTemplateTag,
} from '@/lib/sessionTemplateTags';
import { createEmptySessionDraft, type SessionDraft } from '@/lib/trainerSessionDraft';

export default function TrainerSessionTemplateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNew = !rawId || rawId === 'new';

  const { templates, isLoading, saving, persistent, error, isTrainer, create, update, remove } =
    useSessionTemplates();
  const template = isNew ? undefined : templates.find((entry) => entry.id === rawId);

  const [tag, setTag] = useState<SessionTemplateTag | null>(null);
  const [formatTag, setFormatTag] = useState<SessionTemplateFormatTag | null>(null);
  const [draft, setDraft] = useState<SessionDraft>(() => createEmptySessionDraft(0));
  const [hasPendingBlocks, setHasPendingBlocks] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isNew || !template || hydratedRef.current) return;
    hydratedRef.current = true;
    setTag(template.tag);
    setFormatTag(template.formatTag);
    setDraft(parsePersonalizedPlanContent(template.content));
  }, [isNew, template]);

  const handleSave = async () => {
    setFormError(null);

    if (!tag) {
      setFormError('Elige una etiqueta de zona para la plantilla.');
      return;
    }
    if (hasPendingBlocks) {
      setFormError('Completa o elimina el bloque que estás editando antes de guardar.');
      return;
    }
    if (!canSaveSessionAsTemplate(draft)) {
      setFormError('Añade al menos un bloque de entrenamiento a la plantilla.');
      return;
    }

    const content = sessionDraftToTemplateContent({
      ...draft,
      name: formatTag === 'Activación' ? 'Activación' : tag,
      ...(formatTag === 'Activación'
        ? { kind: 'activation' as const }
        : draft.kind === 'activation'
          ? { kind: undefined }
          : {}),
    });
    const exerciseHint = describeSessionTemplate(content).exerciseLines[0] ?? null;
    const name = buildSessionTemplateName({ tag, formatTag, exerciseHint });
    const result = template
      ? await update(template, { name, content, tag, formatTag })
      : await create(name, content, tag, formatTag);

    if (!result.error) {
      safeGoBack(router, '/tabs/trainer');
    }
  };

  const handleDelete = () => {
    if (!template) return;

    const execute = () => {
      void remove(template).then((result) => {
        if (!result.error) safeGoBack(router, '/tabs/trainer');
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar la plantilla "${template.name}"?`)) execute();
      return;
    }
    Alert.alert('Eliminar plantilla', `Se eliminará "${template.name}".`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: execute },
    ]);
  };

  if (!isTrainer) {
    return (
      <ScreenWrapper>
        <Text style={styles.empty}>Solo el entrenador puede gestionar plantillas.</Text>
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
        <Text style={styles.empty}>Esta plantilla ya no existe.</Text>
        <Button title="Volver" variant="outline" onPress={() => safeGoBack(router, '/tabs/trainer')} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <SectionHeader
        title={isNew ? 'Nueva plantilla' : 'Editar plantilla'}
        subtitle="Elige zona y formato; el nombre se genera solo"
      />

      {!persistent ? (
        <Text style={styles.warning}>
          Las plantillas se guardan solo en este dispositivo. Ejecuta npm run
          supabase:session-templates-format-tags para guardarlas en Supabase.
        </Text>
      ) : null}

      <Card style={styles.nameCard}>
        <Text style={styles.tagLabel}>Zona</Text>
        <View style={styles.tagRow}>
          {SESSION_TEMPLATE_ZONE_TAGS.map((option) => {
            const selected = tag === option;
            return (
              <Pressable
                key={option}
                onPress={() => setTag(option)}
                style={({ pressed }) => [
                  styles.tagChip,
                  selected && styles.tagChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.tagLabel}>Formato</Text>
        <View style={styles.tagRow}>
          {SESSION_TEMPLATE_FORMAT_TAGS.map((option) => {
            const selected = formatTag === option;
            return (
              <Pressable
                key={option}
                onPress={() => setFormatTag(selected ? null : option)}
                style={({ pressed }) => [
                  styles.tagChip,
                  selected && styles.tagChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <SessionEditorForm
        draft={draft}
        onChange={setDraft}
        showSessionName={false}
        showTemplates={false}
        onPendingBlocksChange={setHasPendingBlocks}
      />

      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Button
          title={isNew ? 'Guardar plantilla' : 'Guardar cambios'}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.footerButton}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => safeGoBack(router, '/tabs/trainer')}
          style={styles.footerButton}
        />
      </View>

      {template ? (
        <Button
          title="Eliminar plantilla"
          variant="ghost"
          onPress={handleDelete}
          style={styles.deleteButton}
        />
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  nameCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  tagLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  tagChipSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}18`,
  },
  tagChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tagChipTextSelected: {
    color: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  footerButton: {
    flexGrow: 1,
    flexBasis: 200,
  },
  deleteButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
