import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';

interface MotivationBannerProps {
  message: string;
  dense?: boolean;
}

export function MotivationBanner({ message, dense = false }: MotivationBannerProps) {
  return (
    <LinearGradient
      colors={[withAlpha(colors.accent, '33'), `${colors.accentBlue}22`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.banner, dense && styles.bannerDense]}
    >
      <View style={[styles.iconWrap, dense && styles.iconWrapDense]}>
        <AppIcon name="trophy" size={dense ? 20 : 28} color={colors.accent} />
      </View>
      <Text style={[styles.text, dense && styles.textDense]}>{message}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '44'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: withAlpha(colors.accent, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  bannerDense: {
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  iconWrapDense: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  textDense: {
    ...typography.bodySmall,
    lineHeight: 18,
  },
});
