import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  fetchAthleteIntakeFormStatuses,
  fetchAthleteIntakeSubmission,
  saveAthleteIntakeSubmission,
} from '@/lib/athleteIntakeSubmissionService';
import { fetchIntakeFormTemplateById } from '@/lib/intakeFormTemplateService';
import type { AthleteIntakeFormStatus, IntakeFormAnswers, IntakeFormTemplate } from '@/lib/intakeFormTypes';
import { isIntakeFormComplete, fetchIntakeForm } from '@/lib/athleteIntakeService';
import { isIntakeSubmissionComplete } from '@/lib/intakeFormTypes';

export function useAthleteIntakeForms(targetUserId?: string, trainerId?: string) {
  const { user, isDemoMode } = useAuth();
  const athleteId = targetUserId ?? user?.id;

  const [statuses, setStatuses] = useState<AthleteIntakeFormStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [persistent, setPersistent] = useState(true);

  const load = useCallback(async () => {
    if (!athleteId) {
      setStatuses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchAthleteIntakeFormStatuses(athleteId, isDemoMode, {
        trainerId,
      });
      if (result.statuses.length > 0) {
        setStatuses(result.statuses);
        setPersistent(result.persistent);
        return;
      }

      const legacy = await fetchIntakeForm(athleteId, isDemoMode);
      if (legacy.form && isIntakeFormComplete(legacy.form)) {
        setStatuses([]);
        setPersistent(legacy.persistent);
        return;
      }

      setStatuses(result.statuses);
      setPersistent(result.persistent);
    } finally {
      setIsLoading(false);
    }
  }, [athleteId, isDemoMode, trainerId]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  const defaultStatus = statuses.find((status) => status.template.isDefault);
  const defaultComplete = defaultStatus?.isComplete ?? false;

  return {
    statuses,
    isLoading,
    persistent,
    defaultStatus,
    isDefaultComplete: defaultComplete,
    refresh: load,
  };
}

export function useAthleteIntakeFormEntry(templateId?: string, targetUserId?: string) {
  const { user, isDemoMode } = useAuth();
  const athleteId = targetUserId ?? user?.id;

  const [template, setTemplate] = useState<IntakeFormTemplate | null>(null);
  const [answers, setAnswers] = useState<IntakeFormAnswers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [persistent, setPersistent] = useState(true);

  const load = useCallback(async () => {
    if (!athleteId || !templateId) {
      setTemplate(null);
      setAnswers({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const templateResult = await fetchIntakeFormTemplateById(templateId, isDemoMode);
      const submissionResult = await fetchAthleteIntakeSubmission(
        athleteId,
        templateId,
        isDemoMode || !templateResult.persistent,
      );

      setTemplate(templateResult.template);
      setAnswers(submissionResult.submission?.answers ?? {});
      setPersistent(templateResult.persistent && submissionResult.persistent);
    } finally {
      setIsLoading(false);
    }
  }, [athleteId, templateId, isDemoMode]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusRefresh(() => load());

  const save = useCallback(
    async (nextAnswers: IntakeFormAnswers) => {
      if (!athleteId || !template) return { error: 'No hay formulario activo.' };

      setSaving(true);
      const result = await saveAthleteIntakeSubmission({
        athleteId,
        template,
        answers: nextAnswers,
        useLocalStore: isDemoMode || !persistent,
      });
      setSaving(false);

      if (result.error) return { error: result.error };
      if (result.submission) setAnswers(result.submission.answers);
      return {};
    },
    [athleteId, template, isDemoMode, persistent],
  );

  const isComplete = template ? isIntakeSubmissionComplete(template.schema, answers) : false;

  return {
    template,
    answers,
    isLoading,
    saving,
    isComplete,
    save,
    refresh: load,
  };
}
