import { Platform, StyleSheet, View } from 'react-native';

import { colors, withAlpha } from '@/constants/theme';

const MOBILE_MAX_WIDTH = 430;

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={styles.frame}>{children}</View>
    </View>
  );
}

export const mobileShellStyles = {
  maxWidth: MOBILE_MAX_WIDTH,
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    minHeight: '100vh' as unknown as number,
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: MOBILE_MAX_WIDTH,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: '100vh' as unknown as number,
    position: 'relative',
    flexDirection: 'column',
    ...(Platform.OS === 'web'
      ? { boxShadow: `0 0 40px ${withAlpha(colors.accent, '14')}` as unknown as undefined }
      : {}),
  },
});
