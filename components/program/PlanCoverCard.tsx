import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import {
  PlanBrandSilverIcon,
  planBrandStyles,
  splitPlanBrandTitle,
} from '@/components/program/planBrandUi';
import { spacing } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';

interface PlanCoverCardProps {
  /** Conservado por compatibilidad; el diseño actual usa fondo negro de marca. */
  source?: ImageSourcePropType;
  icon: AppIconName;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function PlanCoverCard({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  accessibilityLabel,
}: PlanCoverCardProps) {
  const { lead, tag } = splitPlanBrandTitle(title);

  return (
    <View style={planBrandStyles.card}>
      <View style={[planBrandStyles.inner, styles.innerRow]}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? title}
          style={({ pressed }) => [styles.mainPress, pressed && styles.mainPressPressed]}
        >
          <PlanBrandSilverIcon name={icon} />
          <View style={styles.copy}>
            <Text style={planBrandStyles.lead}>{lead}</Text>
            {tag ? <Text style={planBrandStyles.tag}>{tag}</Text> : null}
            {subtitle ? <Text style={planBrandStyles.subtitle}>{subtitle}</Text> : null}
          </View>
        </Pressable>
        {trailing}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  innerRow: {
    minHeight: 118,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mainPress: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mainPressPressed: {
    opacity: 0.9,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
});
