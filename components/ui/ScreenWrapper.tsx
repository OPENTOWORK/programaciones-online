import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, type RefObject } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackgroundScaffold } from '@/components/ui/AppBackgroundLogo';
import { colors, spacing } from '@/constants/theme';
import { ATHLETE_TAB_BAR_HEIGHT, useBottomSafeInset } from '@/lib/mobileInsets';
import { isWebPlatform } from '@/lib/platformAccess';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  padded?: boolean;
  scrollRef?: RefObject<ScrollView | null>;
  /** Si es false, no vuelve arriba al enfocar la pantalla. */
  resetScrollOnFocus?: boolean;
}

export function ScreenWrapper({
  children,
  scrollable = true,
  style,
  padded = true,
  scrollRef: externalScrollRef,
  resetScrollOnFocus = true,
}: ScreenWrapperProps) {
  const internalScrollRef = useRef<ScrollView>(null);
  const scrollRef = externalScrollRef ?? internalScrollRef;
  const bottomInset = useBottomSafeInset();
  const scrollBottomPadding = isWebPlatform()
    ? spacing.xxl
    : spacing.xxl + ATHLETE_TAB_BAR_HEIGHT + bottomInset;

  useFocusEffect(
    useCallback(() => {
      if (!scrollable || !resetScrollOnFocus) return;

      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [resetScrollOnFocus, scrollable]),
  );

  const content = scrollable ? (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[
        styles.scrollContent,
        padded && styles.padded,
        !isWebPlatform() && { paddingBottom: scrollBottomPadding },
        style,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppBackgroundScaffold style={styles.scaffold}>{content}</AppBackgroundScaffold>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scaffold: {
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
