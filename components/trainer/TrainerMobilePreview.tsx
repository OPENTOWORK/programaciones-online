import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import HomeScreen from '@/app/tabs/home';
import ProfileScreen from '@/app/tabs/profile';
import ProgramsScreen from '@/app/tabs/programs';
import TrainerChatsScreen from '@/app/trainer/chats/index';
import TrainerScreen from '@/app/tabs/trainer';
import { AppIcon } from '@/components/ui/AppIcon';
import { MobileShell } from '@/components/ui/MobileShell';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { TrainerMobilePreviewStack } from '@/components/trainer/TrainerMobilePreviewStack';
import {
  TrainerMobilePreviewProvider,
  useTrainerMobilePreviewMode,
  useTrainerMobilePreviewNavigation,
  type TrainerPreviewTab,
} from '@/hooks/useTrainerMobilePreview';
import { useAthleteTabBarHeight } from '@/lib/mobileInsets';

const PREVIEW_TABS: Array<{ id: TrainerPreviewTab; label: string; icon: AppIconName }> = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'programs', label: 'Planes', icon: 'programs' },
  { id: 'trainer', label: 'Atletas', icon: 'trainer' },
  { id: 'chats', label: 'Chats', icon: 'chat' },
  { id: 'profile', label: 'Perfil', icon: 'profile' },
];

function PreviewTabBar({
  activeTab,
  onChange,
}: {
  activeTab: TrainerPreviewTab;
  onChange: (tab: TrainerPreviewTab) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {PREVIEW_TABS.map((tab) => {
        const focused = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            style={styles.tabItem}
          >
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <AppIcon
                name={tab.icon}
                size={22}
                color={focused ? colors.accent : colors.textMuted}
                outlined={!focused}
              />
            </View>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PreviewTabContent({ activeTab }: { activeTab: TrainerPreviewTab }) {
  return useMemo(() => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'programs':
        return <ProgramsScreen />;
      case 'trainer':
        return <TrainerScreen />;
      case 'chats':
        return <TrainerChatsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  }, [activeTab]);
}

function PreviewPhoneContent() {
  const { activeTab, setActiveTab } = useTrainerMobilePreviewMode();
  const previewNav = useTrainerMobilePreviewNavigation();
  const tabBarHeight = useAthleteTabBarHeight();
  const stackRoute = previewNav?.stack[previewNav.stack.length - 1];

  return (
    <View style={styles.phoneBody}>
      <View style={[styles.phoneContent, { paddingBottom: tabBarHeight }]}>
        {stackRoute ? (
          <TrainerMobilePreviewStack route={stackRoute} onBack={() => previewNav?.pop()} />
        ) : (
          <PreviewTabContent activeTab={activeTab} />
        )}
      </View>
      <View style={styles.tabBarWrap}>
        <PreviewTabBar activeTab={activeTab} onChange={setActiveTab} />
      </View>
    </View>
  );
}

export function TrainerMobilePreviewFrame() {
  return (
    <TrainerMobilePreviewProvider>
      <View style={styles.phoneFrame}>
        <MobileShell>
          <PreviewPhoneContent />
        </MobileShell>
      </View>
    </TrainerMobilePreviewProvider>
  );
}

const styles = StyleSheet.create({
  phoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    maxHeight: 'min(88vh, 920px)' as unknown as number,
    minHeight: 560,
  },
  phoneBody: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    position: 'relative',
    backgroundColor: colors.background,
  },
  phoneContent: {
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.accent,
  },
});
