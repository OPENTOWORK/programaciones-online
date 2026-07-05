import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface MotivationBannerProps {
  message: string;
}

export function MotivationBanner({ message }: MotivationBannerProps) {
  return (
    <LinearGradient
      colors={[`${colors.accent}33`, `${colors.accentBlue}22`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.iconWrap}>
        <AppIcon name="trophy" size={28} color={colors.accent} />
      </View>
      <Text style={styles.text}>{message}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.accent}44`,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.accent}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
});
