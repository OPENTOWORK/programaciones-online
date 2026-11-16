import { useEffect, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { colors } from '@/constants/theme';
import {
  isTimerSoundEnabled,
  loadTimerSoundSetting,
  setTimerSoundEnabled,
  subscribeTimerSoundSetting,
} from '@/lib/timerSoundSetting';

/** Silencia o activa los pitidos del crono. La vibración sigue y el dispositivo lo recuerda. */
export function TimerSoundToggle({ style }: { style: StyleProp<ViewStyle> }) {
  const enabled = useSyncExternalStore(
    subscribeTimerSoundSetting,
    isTimerSoundEnabled,
    isTimerSoundEnabled,
  );

  useEffect(() => {
    void loadTimerSoundSetting();
  }, []);

  return (
    <Pressable
      onPress={() => setTimerSoundEnabled(!enabled)}
      accessibilityRole="button"
      accessibilityLabel={enabled ? 'Silenciar pitidos' : 'Activar pitidos'}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      <AppIcon
        name={enabled ? 'soundOn' : 'soundOff'}
        size={20}
        color={colors.textSecondary}
        outlined
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
});
