import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { DynamicIntakeFormFields } from '@/components/intake/DynamicIntakeFormFields';
import { LegacyAthleteIntakeForm } from '@/components/profile/LegacyAthleteIntakeForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useAthleteIntakeFormEntry } from '@/hooks/useAthleteIntakeForms';
import { safeGoBack } from '@/lib/navigation';
import { validateIntakeAnswers } from '@/lib/intakeFormTypes';

export default function AthleteIntakeFormScreen() {
  const router = useRouter();
  const { returnTo, templateId: templateIdParam } = useLocalSearchParams<{
    returnTo?: string;
    templateId?: string;
  }>();
  const {
    isLoading: legacyLoading,
    usesCustomForms,
    defaultTemplateId,
  } = useAthleteIntakeForm();

  const resolvedTemplateId = templateIdParam ?? defaultTemplateId ?? undefined;
  const useDynamicForm = Boolean(usesCustomForms && resolvedTemplateId);

  const {
    template,
    answers,
    isLoading: dynamicLoading,
    saving,
    save,
  } = useAthleteIntakeFormEntry(useDynamicForm ? resolvedTemplateId : undefined);

  const [localAnswers, setLocalAnswers] = useState<Record<string, unknown>>({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!useDynamicForm || dynamicLoading || hydrated) return;
    setLocalAnswers(answers);
    setHydrated(true);
  }, [useDynamicForm, dynamicLoading, hydrated, answers]);

  if (!useDynamicForm) {
    if (legacyLoading) {
      return (
        <ScreenWrapper scrollable={false}>
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        </ScreenWrapper>
      );
    }
    return <LegacyAthleteIntakeForm returnTo={returnTo} />;
  }

  if (dynamicLoading || !template) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  const handleSave = async () => {
    const validationError = validateIntakeAnswers(template.schema, localAnswers);
    if (validationError) {
      setError(validationError);
      setSuccessMessage('');
      return;
    }

    setError('');
    const result = await save(localAnswers);
    if (result.error) {
      setError(result.error);
      return;
    }

    if (returnTo === 'trainer') {
      router.replace('/tabs/trainer');
      return;
    }

    setSuccessMessage('Formulario guardado correctamente.');
    setTimeout(() => safeGoBack(router, '/tabs/profile'), 800);
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>{template.name}</Text>
      <Text style={styles.subtitle}>
        {template.description ??
          'Completa este formulario para que tu entrenador pueda conocerte mejor.'}
      </Text>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <Card style={styles.section}>
        <DynamicIntakeFormFields
          schema={template.schema}
          answers={localAnswers}
          onChange={setLocalAnswers}
        />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Guardar formulario" onPress={() => void handleSave()} loading={saving} />
      <Button
        title="Cancelar"
        onPress={() => safeGoBack(router, '/tabs/profile')}
        variant="ghost"
        style={styles.cancelBtn}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
  successBanner: {
    backgroundColor: `${colors.success}22`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successText: { ...typography.bodySmall, color: colors.success, lineHeight: 20 },
  section: { marginBottom: spacing.md },
  error: { ...typography.bodySmall, color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  cancelBtn: { marginTop: spacing.sm },
});
