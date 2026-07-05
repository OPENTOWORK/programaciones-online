import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, IconBadge } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import type { ServicePlanCategory } from '@/lib/trainerConstants';

const SERVICE_PLAN_ICONS: Record<ServicePlanCategory, AppIconName> = {
  personalized: 'personal',
  nutrition: 'measure',
  home_training: 'home',
};

interface ServicePlanEmptyCardProps {
  category: ServicePlanCategory;
  title: string;
  text: string;
  button: string;
  onRequest: () => void;
}

function MetaItem({ icon, text }: { icon: AppIconName; text: string }) {
  return (
    <View style={styles.metaRow}>
      <AppIcon name={icon} size={16} color={colors.textMuted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

export function ServicePlanEmptyCard({
  category,
  title,
  text,
  button,
  onRequest,
}: ServicePlanEmptyCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconBadge name={SERVICE_PLAN_ICONS[category]} containerSize={48} size={24} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{title}</Text>
        </View>
      </View>

      <View style={styles.meta}>
        <MetaItem icon="goal" text={text} />
      </View>

      <Button title={button} onPress={onRequest} style={styles.button} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  meta: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.xs,
  },
});
