import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, type RefObject } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';

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

  useFocusEffect(
    useCallback(() => {
      if (!scrollable || !resetScrollOnFocus) return;

      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [resetScrollOnFocus, scrollable]),
  );

  const content = scrollable ? (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[styles.scrollContent, padded && styles.padded, style]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'web' ? spacing.xl : spacing.xxl,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
