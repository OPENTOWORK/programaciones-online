import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { SessionEditorForm } from '@/components/trainer/SessionEditorForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useSessionTemplates } from '@/hooks/useSessionTemplates';
import { safeGoBack } from '@/lib/navigation';
import { parsePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import {
  canSaveSessionAsTemplate,
  sessionDraftToTemplateContent,
} from '@/lib/sessionTemplates';
import { createEmptySessionDraft, type SessionDraft } from '@/lib/trainerSessionDraft';

export default function TrainerSessionTemplateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNew = !rawId || rawId === 'new';

  const { templates, isLoading, saving, persistent, error, isTrainer, create, update, remove } =
    useSessionTemplates();
  const template = isNew ? undefined : templates.find((entry) => entry.id === rawId);

  const [name, setName] = useState('');
  const [draft, setDraft] = useState<SessionDraft>(() => createEmptySessionDraft(0));
  const [hasPendingBlocks, setHasPendingBlocks] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isNew || !template || hydratedRef.current) return;
    hydratedRef.current = true;
    setName(template.name);
    setDraft(parsePersonalizedPlanContent(template.content));
  }, [isNew, template]);

  const handleSave = async () => {
    setFormError(null);

    if (!name.trim()) {
      setFormError('Ponle un nombre a la plantilla.');
      return;
    }
    if (hasPendingBlocks) {
      setFormError('Confirma los bloques pendientes con el botón verde antes de guardar.');
      return;
    }
    if (!canSaveSessionAsTemplate(draft)) {
      setFormError('Añade al menos un bloque de entrenamiento a la plantilla.');
      return;
    }

    const content = sessionDraftToTemplateContent({ ...draft, name: name.trim() });
    const result = template
      ? await update(template, { name: name.trim(), content })
      : await create(name.trim(), content);

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
        title={isNew ? 'Nueva plantilla de sesión' : 'Editar plantilla'}
        subtitle="Monta los bloques una vez y reutilízalos en los planes de cualquier atleta"
      />

      {!persistent ? (
        <Text style={styles.warning}>
          Las plantillas se guardan solo en este dispositivo. Ejecuta npm run
          supabase:session-templates para guardarlas en Supabase.
        </Text>
      ) : null}

      <Card style={styles.nameCard}>
        <Input
          label="Nombre de la plantilla"
          value={name}
          onChangeText={setName}
          placeholder="Ej. Fuerza tren superior"
        />
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
