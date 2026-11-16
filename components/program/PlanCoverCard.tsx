import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import {
  PlanBrandSilverIcon,
  planBrandStyles,
  splitPlanBrandTitle,
} from '@/components/program/planBrandUi';
import { fontSportBold, fontUiRegular, fontUiSemibold } from '@/constants/fonts';
import { brandColor, brandColors, spacing } from '@/constants/theme';
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
  /** Una tarjeta ocupa toda la página y el resto se ve al deslizar. */
  layout?: 'compact' | 'page';
}

export function PlanCoverCard({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  accessibilityLabel,
  layout = 'compact',
}: PlanCoverCardProps) {
  const { lead, tag } = splitPlanBrandTitle(title);
  const page = layout === 'page';

  return (
    <View style={[planBrandStyles.card, page && styles.cardPage]}>
      <View style={[planBrandStyles.inner, page ? styles.pageInner : styles.innerRow]}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? title}
          style={({ pressed }) => [
            page ? styles.pagePress : styles.mainPress,
            pressed && styles.mainPressPressed,
          ]}
        >
          {page ? <View style={styles.pageShift} /> : null}
          {page ? null : <PlanBrandSilverIcon name={icon} size={48} iconSize={20} />}
          <View style={[styles.copy, page && styles.copyPage]}>
            <Text style={[styles.lead, page && styles.leadPage]}>{lead}</Text>
            {tag ? <Text style={[styles.tag, page && styles.tagPage]}>{tag}</Text> : null}
            {subtitle ? (
              <Text style={[styles.subtitle, page && styles.subtitlePage]} numberOfLines={page ? 4 : 2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {page ? <View style={styles.pageRest} /> : null}
        </Pressable>
        {trailing ? <View style={page ? styles.pageAction : undefined}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardPage: {
    flex: 1,
    height: '100%',
  },
  innerRow: {
    minHeight: 118,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pageInner: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  pagePress: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.sm,
  },
  pageShift: {
    flex: 0.62,
  },
  pageRest: {
    flex: 1,
  },
  pageAction: {
    marginTop: 'auto',
    alignSelf: 'stretch',
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
    gap: 2,
  },
  copyPage: {
    flex: 0,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  lead: {
    fontFamily: fontSportBold,
    fontWeight: 'normal',
    color: brandColor('title', brandColors.orangeHighlight),
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  leadPage: {
    color: brandColor('title', '#FF6A40'),
    fontSize: 40,
    lineHeight: 46,
    textAlign: 'center',
  },
  tag: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: brandColor('tag', brandColors.orangeSecondary),
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tagPage: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: brandColor('body', '#C5CAD3'),
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  subtitlePage: {
    width: '100%',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 6,
    textAlign: 'center',
  },
});
