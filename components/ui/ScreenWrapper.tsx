import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, type RefObject } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackgroundScaffold } from '@/components/ui/AppBackgroundLogo';
import { colors, spacing } from '@/constants/theme';
import { useBottomSafeInset } from '@/lib/mobileInsets';
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
  const isWeb = isWebPlatform();
  const scrollBottomPadding = isWeb ? spacing.xxl : spacing.lg + bottomInset;

  useFocusEffect(
    useCallback(() => {
      if (!scrollable || !resetScrollOnFocus) return;

      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [resetScrollOnFocus, scrollable]),
  );

  const content = scrollable ? (
    <ScrollView
      ref={scrollRef}
      {...(isWeb ? ({ dataSet: { hideScrollbar: 'true' } } as object) : null)}
      style={[styles.scrollView, isWeb && styles.scrollViewWeb]}
      contentContainerStyle={[
        styles.scrollContent,
        padded && styles.padded,
        padded && !isWeb && styles.paddedNative,
        !isWeb && { paddingBottom: scrollBottomPadding },
        style,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppBackgroundScaffold style={styles.scaffold}>
        <View style={styles.scrollViewport}>{content}</View>
      </AppBackgroundScaffold>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? ({ height: '100%' } as ViewStyle) : null),
  },
  scaffold: {
    zIndex: 1,
    flex: 1,
    minHeight: 0,
  },
  scrollViewport: {
    flex: 1,
    minHeight: 0,
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
  scrollViewWeb: Platform.select({
    web: {
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch',
    } as ViewStyle,
    default: {},
  }),
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
  paddedNative: {
    paddingTop: spacing.sm,
  },
});
