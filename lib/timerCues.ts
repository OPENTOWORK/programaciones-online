/** `tick`: cada uno de los 3 últimos segundos · `phase`: se acabó el tiempo, toca lo siguiente · `finish`: crono terminado. */
export type TimerCue = 'tick' | 'phase' | 'finish';

export type TimerCueHandler = (cue: TimerCue) => void;

export const TIMER_CUES: readonly TimerCue[] = ['tick', 'phase', 'finish'];

/** Segundo de aviso (3, 2 o 1) en el que está una cuenta atrás, o null si aún no toca avisar. */
export function timerCueTickSecond(remainingSeconds: number): number | null {
  const second = Math.ceil(remainingSeconds);
  return second >= 1 && second <= 3 ? second : null;
}
