import { Asset } from 'expo-asset';
import { useCallback, useEffect } from 'react';

import { TIMER_CUE_SOUNDS } from '@/lib/timerCueSounds';
import { TIMER_CUES, type TimerCue, type TimerCueHandler } from '@/lib/timerCues';
import { isTimerSoundEnabled, loadTimerSoundSetting } from '@/lib/timerSoundSetting';

type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext };

const FINISH_VIBRATION = [400, 200, 400];

let context: AudioContext | null = null;
const buffers = new Map<TimerCue, Promise<AudioBuffer | null>>();

function loadBuffer(audio: AudioContext, cue: TimerCue) {
  let buffer = buffers.get(cue);
  if (!buffer) {
    buffer = fetch(Asset.fromModule(TIMER_CUE_SOUNDS[cue]).uri)
      .then((response) => response.arrayBuffer())
      .then((data) => audio.decodeAudioData(data))
      .catch(() => null);
    buffers.set(cue, buffer);
  }
  return buffer;
}

/**
 * Los navegadores (Safari sobre todo) solo dejan sonar una página si el audio se activó durante un
 * toque, así que se llama desde los botones que abren el crono.
 */
export function primeTimerCues() {
  if (typeof window === 'undefined') return;
  void loadTimerSoundSetting();
  if (!context) {
    const AudioContextClass =
      window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioContextClass) return;
    context = new AudioContextClass();
  }
  if (context.state !== 'running') context.resume().catch(() => undefined);
  const audio = context;
  TIMER_CUES.forEach((cue) => void loadBuffer(audio, cue));
}

export function useTimerCues(): TimerCueHandler {
  useEffect(() => {
    // Si el navegador suspende el audio (pestaña en segundo plano), cualquier toque lo reactiva.
    window.addEventListener('pointerdown', primeTimerCues, true);
    window.addEventListener('keydown', primeTimerCues, true);
    return () => {
      window.removeEventListener('pointerdown', primeTimerCues, true);
      window.removeEventListener('keydown', primeTimerCues, true);
    };
  }, []);

  return useCallback((cue: TimerCue) => {
    const audio = context;
    // Silenciar quita el pitido, no la vibración.
    if (audio?.state === 'running') {
      void Promise.all([loadBuffer(audio, cue), loadTimerSoundSetting()]).then(([buffer]) => {
        if (!buffer || !isTimerSoundEnabled()) return;
        const source = audio.createBufferSource();
        source.buffer = buffer;
        source.connect(audio.destination);
        source.start();
      });
    }

    if (cue !== 'tick' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(cue === 'finish' ? FINISH_VIBRATION : 400);
    }
  }, []);
}
