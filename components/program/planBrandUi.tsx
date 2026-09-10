import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, brandColors, colors, shadows, spacing, typography, withAlpha } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';

export const PLAN_BRAND_ICON_GRADIENT = [
  brandColors.silverLight,
  '#E4E9EF',
  brandColors.silver,
  brandColors.silverMid,
  brandColors.silverDark,
] as const;

export function splitPlanBrandTitle(title: string) {
  const [lead, tag] = title.split(' · ');
  return { lead: lead?.trim() ?? title, tag: tag?.trim() };
}

export function PlanBrandSilverIcon({
  name,
  iconSize = 20,
  size = 48,
}: {
  name: AppIconName;
  iconSize?: number;
  size?: number;
}) {
  return (
    <View style={[planBrandStyles.iconShell, { borderRadius: Math.round(size * 0.29) }]}>
      <LinearGradient
        colors={[...PLAN_BRAND_ICON_GRADIENT]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          planBrandStyles.iconWrap,
          {
            width: size,
            height: size,
            borderRadius: Math.round(size * 0.27),
          },
        ]}
      >
        <AppIcon name={name} size={iconSize} color={brandColors.silverDeep} outlined />
      </LinearGradient>
    </View>
  );
}

export const planBrandActionButtonStyle: ViewStyle = {
  backgroundColor: withAlpha(brandColors.orangeAction, '22'),
  borderColor: brandColors.orangeAction,
  borderWidth: 1.5,
  shadowOpacity: 0,
  elevation: 0,
};

export const planBrandActionButtonTextStyle: TextStyle = {
  color: brandColors.orangeAction,
  fontWeight: '800',
  letterSpacing: 0.3,
};

export const planBrandStyles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withAlpha(brandColors.silverMid, '70'),
    backgroundColor: colors.black,
    ...shadows.card,
  },
  inner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.black,
  },
  iconShell: {
    padding: 1,
    backgroundColor: withAlpha(brandColors.silverLight, '55'),
    shadowColor: brandColors.silverLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  iconWrap: {
    borderWidth: 1,
    borderColor: withAlpha(brandColors.silverLight, 'CC'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  lead: {
    ...typography.h3,
    color: brandColors.orangeHighlight,
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: 0.35,
    textShadowColor: withAlpha(brandColors.orangeHighlight, '55'),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tag: {
    ...typography.caption,
    color: brandColors.orangeSecondary,
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  subtitle: {
    ...typography.caption,
    color: withAlpha(brandColors.orangeSecondary, 'CC'),
    marginTop: 4,
    lineHeight: 17,
    fontSize: 12,
  },
  metaText: {
    ...typography.bodySmall,
    color: withAlpha(brandColors.orangeSecondary, 'CC'),
    lineHeight: 20,
  },
});
