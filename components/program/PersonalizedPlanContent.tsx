import { StyleSheet, Text, View } from 'react-native';

import { WorkoutSection } from '@/components/workout/WorkoutSection';
import { colors, spacing, typography } from '@/constants/theme';
import { combineMainPartsForSave } from '@/lib/sessionBlockSections';
import {
  formatSessionSectionTitle,
  isStructuredPersonalizedPlanContent,
  parsePersonalizedPlanContent,
  parseSessionNumberFromPlanContent,
} from '@/lib/personalizedPlanContent';
import { formatScheduleSummary } from '@/lib/sessionSchedule';

interface PersonalizedPlanContentProps {
  content: string;
  sessionNumber?: number;
}

export function PersonalizedPlanContent({ content, sessionNumber }: PersonalizedPlanContentProps) {
  if (!isStructuredPersonalizedPlanContent(content)) {
    return <Text style={styles.plainText}>{content}</Text>;
  }

  const draft = parsePersonalizedPlanContent(content);
  const main = combineMainPartsForSave(draft.main, draft.metcon);
  const scheduleSummary = formatScheduleSummary(draft.schedule);
  const mainSectionTitle = formatSessionSectionTitle(
    sessionNumber ?? parseSessionNumberFromPlanContent(content),
    draft.name,
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.meta}>
        {[scheduleSummary, draft.estimatedDuration].filter(Boolean).join(' · ')}
      </Text>

      {draft.warmup.trim() ? (
        <WorkoutSection title="Calentamiento" content={draft.warmup} icon="warmup" />
      ) : null}

      {main.trim() ? (
        <WorkoutSection title={mainSectionTitle} content={main} icon="main" variant="featured" />
      ) : null}

      {draft.core.trim() ? (
        <WorkoutSection title="Core / Accesorio" content={draft.core} icon="core" />
      ) : null}

      {draft.cooldown.trim() ? (
        <WorkoutSection title="Vuelta a la calma" content={draft.cooldown} icon="cooldown" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  plainText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
