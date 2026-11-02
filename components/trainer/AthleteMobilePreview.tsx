import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import HomeScreen from '@/app/tabs/home';
import ProfileScreen from '@/app/tabs/profile';
import ProgramsScreen from '@/app/tabs/programs';
import ProgressScreen from '@/app/tabs/progress';
import TrainerScreen from '@/app/tabs/trainer';
import { AppIcon } from '@/components/ui/AppIcon';
import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { MobileShell } from '@/components/ui/MobileShell';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { AthletePreviewProvider, useAthletePreviewMode, type AthletePreviewTab } from '@/hooks/useAthletePreviewMode';
import { CEDED_ATHLETE_MOBILE_PREVIEW_EMAIL } from '@/lib/athleteMobilePreview';
import { useAthleteTabBarHeight } from '@/lib/mobileInsets';

type PreviewTabItem = {
  id: AthletePreviewTab;
  label: string;
  icon: AppIconName;
};

const PREVIEW_TABS: PreviewTabItem[] = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'programs', label: 'Programas', icon: 'programs' },
  { id: 'progress', label: 'Progreso', icon: 'progress' },
  { id: 'trainer', label: 'Entrenador', icon: 'trainer' },
  { id: 'profile', label: 'Perfil', icon: 'profile' },
];

function PreviewTabBar() {
  const { activeTab, setActiveTab } = useAthletePreviewMode();

  return (
    <View style={styles.tabBar}>
      {PREVIEW_TABS.map((tab) => {
        const focused = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
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

function PreviewTabContent() {
  const { activeTab, simulateCededAthlete, previewSubjectLoading, previewSubject } =
    useAthletePreviewMode();
  const tabBarHeight = useAthleteTabBarHeight();
  const waitingForCededSubject = simulateCededAthlete && previewSubjectLoading;
  const cededSubjectMissing = simulateCededAthlete && !previewSubjectLoading && !previewSubject;

  const screen = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'programs':
        return <ProgramsScreen />;
      case 'progress':
        return <ProgressScreen />;
      case 'trainer':
        return <TrainerScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  }, [activeTab]);

  return (
    <View style={styles.phoneBody}>
      <View style={[styles.phoneContent, { paddingBottom: tabBarHeight }]}>
        {waitingForCededSubject ? (
          <View style={styles.previewLoader}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        ) : cededSubjectMissing ? (
          <View style={styles.previewLoader}>
            <Text style={styles.previewLoaderText}>
              No se encontró el atleta {CEDED_ATHLETE_MOBILE_PREVIEW_EMAIL}.
            </Text>
          </View>
        ) : (
          screen
        )}
      </View>
      <View style={styles.tabBarWrap}>
        <PreviewTabBar />
      </View>
    </View>
  );
}

function PreviewModeToggle({ onOpenTrainer }: { onOpenTrainer?: () => void }) {
  const { simulateCededAthlete, setSimulateCededAthlete } = useAthletePreviewMode();

  return (
    <View style={styles.modeRow}>
      <Pressable
        onPress={() => setSimulateCededAthlete(false)}
        style={({ pressed }) => [
          styles.modeChip,
          !simulateCededAthlete && styles.modeChipActive,
          pressed && styles.modeChipPressed,
        ]}
      >
        <Text style={[styles.modeChipText, !simulateCededAthlete && styles.modeChipTextActive]}>
          Atleta normal
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setSimulateCededAthlete(true)}
        style={({ pressed }) => [
          styles.modeChip,
          simulateCededAthlete && styles.modeChipActive,
          pressed && styles.modeChipPressed,
        ]}
      >
        <Text style={[styles.modeChipText, simulateCededAthlete && styles.modeChipTextActive]}>
          Atleta cedido
        </Text>
      </Pressable>
      {onOpenTrainer ? (
        <Pressable
          onPress={onOpenTrainer}
          style={({ pressed }) => [styles.modeChip, styles.modeChipTrainer, pressed && styles.modeChipPressed]}
          accessibilityRole="button"
          accessibilityLabel="Ver vista móvil del entrenador"
        >
          <Text style={styles.modeChipTrainerText}>Entrenador</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function AthleteMobilePreviewIntro({ onOpenTrainer }: { onOpenTrainer?: () => void }) {
  return (
    <View style={styles.intro}>
      <View style={styles.backRow}>
        <HeaderBackButton />
      </View>
      <Text style={styles.title}>Vista móvil del atleta</Text>
      <Text style={styles.subtitle}>
        Así ven la app los atletas en el móvil, siempre en modo noche. Los atletas cedidos a un
        entrenador no ven gimnasios y en programas solo tienen nutrición; el resto ve la app completa.
        En «Atleta cedido» se muestra la programación de {CEDED_ATHLETE_MOBILE_PREVIEW_EMAIL}.
      </Text>
      <PreviewModeToggle onOpenTrainer={onOpenTrainer} />
    </View>
  );
}

export function AthleteMobilePreview({ onOpenTrainer }: { onOpenTrainer?: () => void }) {
  return (
    <View style={styles.page}>
      <AthletePreviewProvider>
        <AthleteMobilePreviewIntro onOpenTrainer={onOpenTrainer} />
        <View style={styles.previewArea}>
          <View style={styles.phoneFrame}>
            <MobileShell>
              <PreviewTabContent />
            </MobileShell>
          </View>
        </View>
      </AthletePreviewProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: 0,
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  intro: {
    gap: spacing.xs,
    maxWidth: 720,
  },
  backRow: {
    alignSelf: 'flex-start',
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  modeChipPressed: {
    opacity: 0.9,
  },
  modeChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  modeChipTextActive: {
    color: colors.black,
  },
  modeChipTrainer: {
    borderColor: colors.accentBlue,
    backgroundColor: colors.surface,
  },
  modeChipTrainerText: {
    ...typography.bodySmall,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  previewArea: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },
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
  previewLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  previewLoaderText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
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
    cursor: 'pointer',
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
