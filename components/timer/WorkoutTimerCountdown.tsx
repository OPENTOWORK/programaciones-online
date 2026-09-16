import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackgroundLogo } from '@/components/ui/AppBackgroundLogo';
import { colors, typography } from '@/constants/theme';

export function WorkoutTimerCountdown({
  label: blockLabel,
  onComplete,
}: {
  /** Bloque del entreno que se va a cronometrar, si el crono viene de una sesión. */
  label?: string;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(3);
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return undefined;

    if (step < 0) {
      completedRef.current = true;
      onComplete();
      return undefined;
    }

    const delay = step === 0 ? 700 : 1000;
    const timer = setTimeout(() => setStep((current) => current - 1), delay);
    return () => clearTimeout(timer);
  }, [onComplete, step]);

  const label = step > 0 ? String(step) : 'GO';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.backdrop}>
        <AppBackgroundLogo />
        <View style={styles.center}>
          <Text style={styles.caption}>{blockLabel?.trim() || 'Prepárate'}</Text>
          <Text style={styles.value} accessibilityLiveRegion="assertive">
            {label}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdrop: {
    flex: 1,
    position: 'relative',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    gap: 12,
  },
  caption: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  value: {
    fontSize: 120,
    lineHeight: 128,
    fontWeight: '800',
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
});
