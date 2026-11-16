import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DEFAULT_WORKOUT_TIMER_SETTINGS,
  getWorkoutTimerDisplay,
  workoutTimerCue,
  type WorkoutTimerDisplay,
  type WorkoutTimerSettings,
  type WorkoutTimerStatus,
} from '@/lib/athleteWorkoutTimer';
import type { TimerCueHandler } from '@/lib/timerCues';

/** Solo pita lo que pasa con el reloj en marcha: Repetir, Reiniciar o Pausar no suenan. */
export function useWorkoutTimer(
  initialSettings: WorkoutTimerSettings = DEFAULT_WORKOUT_TIMER_SETTINGS,
  onCue?: TimerCueHandler,
) {
  const [settings, setSettings] = useState<WorkoutTimerSettings>(initialSettings);
  const [status, setStatus] = useState<WorkoutTimerStatus>('idle');
  const [display, setDisplay] = useState<WorkoutTimerDisplay>(() =>
    getWorkoutTimerDisplay(initialSettings, 0),
  );

  const startedAtRef = useRef<number | null>(null);
  const pausedAccumRef = useRef(0);
  const pauseStartedRef = useRef<number | null>(null);
  const displayRef = useRef(display);
  const onCueRef = useRef(onCue);

  useEffect(() => {
    onCueRef.current = onCue;
  }, [onCue]);

  const showDisplay = useCallback((next: WorkoutTimerDisplay) => {
    displayRef.current = next;
    setDisplay(next);
  }, []);

  const getElapsedMs = useCallback(() => {
    if (!startedAtRef.current) return 0;

    const now = Date.now();
    let elapsed = now - startedAtRef.current - pausedAccumRef.current;
    if (pauseStartedRef.current) {
      elapsed -= now - pauseStartedRef.current;
    }
    return Math.max(0, elapsed);
  }, []);

  const syncDisplay = useCallback(() => {
    const next = getWorkoutTimerDisplay(settings, getElapsedMs());
    showDisplay(next);
    return next;
  }, [getElapsedMs, settings, showDisplay]);

  useEffect(() => {
    if (status !== 'running') return undefined;

    const tick = () => {
      const previous = displayRef.current;
      const next = syncDisplay();
      const cue = workoutTimerCue(previous, next);
      if (cue) onCueRef.current?.(cue);

      if (next.finished) {
        setStatus('finished');
        pauseStartedRef.current = null;
      }
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [status, syncDisplay]);

  const start = useCallback(() => {
    if (status === 'running') return;

    if (status === 'idle' || status === 'finished') {
      startedAtRef.current = Date.now();
      pausedAccumRef.current = 0;
      pauseStartedRef.current = null;
    } else if (status === 'paused' && pauseStartedRef.current) {
      pausedAccumRef.current += Date.now() - pauseStartedRef.current;
      pauseStartedRef.current = null;
    }

    setStatus('running');
    syncDisplay();
  }, [status, syncDisplay]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    pauseStartedRef.current = Date.now();
    setStatus('paused');
    syncDisplay();
  }, [status, syncDisplay]);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    pausedAccumRef.current = 0;
    pauseStartedRef.current = null;
    setStatus('idle');
    showDisplay(getWorkoutTimerDisplay(settings, 0));
  }, [settings, showDisplay]);

  const patchSettings = useCallback((patch: Partial<WorkoutTimerSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      showDisplay(getWorkoutTimerDisplay(next, getElapsedMs()));
      return next;
    });
  }, [getElapsedMs, showDisplay]);

  const isLocked = status === 'running' || status === 'paused';

  return {
    settings,
    status,
    display,
    isLocked,
    start,
    pause,
    reset,
    patchSettings,
  };
}
