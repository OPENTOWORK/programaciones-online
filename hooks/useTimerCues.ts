import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect } from 'react';
import { Platform, Vibration } from 'react-native';

import { TIMER_CUE_SOUNDS } from '@/lib/timerCueSounds';
import type { TimerCue, TimerCueHandler } from '@/lib/timerCues';
import { isTimerSoundEnabled, loadTimerSoundSetting } from '@/lib/timerSoundSetting';

// iOS no deja elegir cuánto dura la vibración (unos 400 ms): el patrón solo marca las pausas.
const FINISH_VIBRATION = Platform.OS === 'ios' ? [0, 600] : [0, 400, 200, 400];
const PLAYER_OPTIONS = { keepAudioSessionActive: true };

/** En el móvil el audio no necesita que un toque lo desbloquee: solo se adelanta leer si está silenciado. */
export function primeTimerCues() {
  void loadTimerSoundSetting();
}

/**
 * Pitidos y vibración del crono. Va en la pantalla del crono, no en cada fase, para que el último
 * pitido no se corte cuando la cuenta atrás de 3 da paso al crono.
 */
export function useTimerCues(): TimerCueHandler {
  const tick = useAudioPlayer(TIMER_CUE_SOUNDS.tick, PLAYER_OPTIONS);
  const phase = useAudioPlayer(TIMER_CUE_SOUNDS.phase, PLAYER_OPTIONS);
  const finish = useAudioPlayer(TIMER_CUE_SOUNDS.finish, PLAYER_OPTIONS);

  useEffect(() => {
    // Suena aunque el móvil esté en silencio y encima de la música del atleta, sin pararla.
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(
      () => undefined,
    );
  }, []);

  return useCallback(
    (cue: TimerCue) => {
      const player = cue === 'tick' ? tick : cue === 'phase' ? phase : finish;
      // Silenciar quita el pitido, no la vibración.
      void loadTimerSoundSetting().then(() => {
        if (!isTimerSoundEnabled()) return;
        player.seekTo(0).catch(() => undefined);
        player.play();
      });

      if (cue === 'phase') Vibration.vibrate();
      if (cue === 'finish') Vibration.vibrate(FINISH_VIBRATION);
    },
    [finish, phase, tick],
  );
}
