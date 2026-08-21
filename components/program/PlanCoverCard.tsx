import type { ReactNode } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';

interface PlanCoverCardProps {
  source: ImageSourcePropType;
  icon: AppIconName;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
}

function splitPremiumTitle(title: string) {
  const [lead, tag] = title.split(' · ');
  return { lead: lead?.trim() ?? title, tag: tag?.trim() };
}

export function PlanCoverCard({
  source,
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  accessibilityLabel,
}: PlanCoverCardProps) {
  const { lead, tag } = splitPremiumTitle(title);

  return (
    <View style={styles.card}>
      <ImageBackground source={source} style={styles.cover} imageStyle={styles.coverImage} resizeMode="cover">
        <LinearGradient
          colors={['rgba(15,20,25,0.22)', 'rgba(15,20,25,0.68)', 'rgba(15,20,25,0.90)']}
          locations={[0, 0.45, 1]}
          style={styles.overlay}
        >
          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? title}
            style={({ pressed }) => [styles.mainPress, pressed && styles.mainPressPressed]}
          >
            <View style={styles.iconWrap}>
              <AppIcon name={icon} size={18} color={colors.text} outlined />
            </View>
            <View style={styles.copy}>
              <View style={styles.titleRow}>
                <Text style={styles.lead}>{lead}</Text>
                {tag ? <Text style={styles.tag}>{tag}</Text> : null}
              </View>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </Pressable>
          {trailing}
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    ...shadows.card,
  },
  mainPress: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mainPressPressed: {
    opacity: 0.88,
  },
  cover: {
    minHeight: 118,
  },
  coverImage: {
    opacity: 0.94,
  },
  overlay: {
    minHeight: 118,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15,20,25,0.62)',
    borderWidth: 1,
    borderColor: `${colors.white}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  lead: {
    ...typography.h3,
    color: colors.text,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tag: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(15,20,25,0.62)',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
