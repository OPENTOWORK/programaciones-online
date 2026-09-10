import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

interface AuthWebShellProps {
  children: React.ReactNode;
}

export function AuthWebShell({ children }: AuthWebShellProps) {
  return (
    <View style={styles.outer}>
      <View style={styles.frame}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    minHeight: '100vh' as unknown as number,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  frame: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 'min(100vh, 900px)' as unknown as number,
  },
});
