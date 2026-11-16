import type { TimerCue } from '@/lib/timerCues';

/** Generados con scripts/generate-timer-sounds.mjs. */
export const TIMER_CUE_SOUNDS: Record<TimerCue, number> = {
  tick: require('@/assets/sounds/timer-tick.wav'),
  phase: require('@/assets/sounds/timer-phase.wav'),
  finish: require('@/assets/sounds/timer-finish.wav'),
};
