import { usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { TrainerMobileTabBar } from '@/components/ui/TrainerMobileTabBar';
import { colors } from '@/constants/theme';
import { useAthleteTabBarHeight } from '@/lib/mobileInsets';
import { shouldShowTrainerMobileTabBar } from '@/lib/platformAccess';

interface TrainerMobileShellProps {
  children: ReactNode;
}

export function TrainerMobileShell({ children }: TrainerMobileShellProps) {
  const pathname = usePathname();
  const showTabs = shouldShowTrainerMobileTabBar(pathname);
  const tabBarHeight = useAthleteTabBarHeight();

  return (
    <View style={styles.shell}>
      <View style={[styles.content, showTabs && { paddingBottom: tabBarHeight }]}>{children}</View>
      {showTabs ? (
        <View style={styles.tabBarWrap}>
          <TrainerMobileTabBar />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.background,
    position: 'relative',
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
