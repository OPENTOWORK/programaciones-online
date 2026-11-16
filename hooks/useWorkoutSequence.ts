import { useCallback, useEffect, useRef, useState } from 'react';

import { timerCueTickSecond, type TimerCueHandler } from '@/lib/timerCues';
import {
  advanceWorkoutSequence,
  describeWorkoutSequence,
  settleWorkoutSequence,
  startWorkoutSequence,
  type WorkoutSequence,
  type WorkoutSequenceState,
} from '@/lib/workoutSequence';

export type WorkoutSequenceStatus = 'running' | 'paused' | 'finished';

/**
 * Reloj del crono guiado: las pausas no cuentan y los pasos a la contra avanzan solos. Solo pita
 * lo que pasa sin tocar nada: los 3 últimos segundos y el final de cada paso a la contra.
 */
export function useWorkoutSequence(sequence: WorkoutSequence, onCue?: TimerCueHandler) {
  const pausedTotalRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);

  const activeNow = useCallback(() => {
    const now = Date.now();
    const pausedFor = pausedAtRef.current ? now - pausedAtRef.current : 0;
    return now - pausedTotalRef.current - pausedFor;
  }, []);

  const [state, setState] = useState<WorkoutSequenceState>(() =>
    startWorkoutSequence(sequence, activeNow()),
  );
  const [now, setNow] = useState(() => activeNow());
  const [paused, setPaused] = useState(false);
  const stateRef = useRef(state);
  const announcedTickRef = useRef<string | null>(null);
  const onCueRef = useRef(onCue);

  useEffect(() => {
    onCueRef.current = onCue;
  }, [onCue]);

  const commit = useCallback((next: WorkoutSequenceState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const finished = state.cursor.kind === 'done';
  const running = !paused && !finished;

  useEffect(() => {
    if (!running) return undefined;

    const tick = () => {
      const current = activeNow();
      const previous = stateRef.current;
      const settled = settleWorkoutSequence(sequence, previous, current);
      setNow(current);

      if (settled !== previous) {
        commit(settled);
        onCueRef.current?.(settled.cursor.kind === 'done' ? 'finish' : 'phase');
        return;
      }

      // En pasos de 3 s o menos el aviso se solaparía con el pitido de inicio.
      if (settled.phaseSeconds == null || settled.phaseSeconds <= 3) return;
      const second = timerCueTickSecond(
        settled.phaseSeconds - (current - settled.phaseStartedAt) / 1000,
      );
      const key = `${settled.phaseStartedAt}:${second}`;
      if (second != null && announcedTickRef.current !== key) {
        announcedTickRef.current = key;
        onCueRef.current?.('tick');
      }
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [activeNow, commit, running, sequence]);

  const next = useCallback(() => {
    const current = activeNow();
    setNow(current);
    commit(advanceWorkoutSequence(sequence, stateRef.current, current));
  }, [activeNow, commit, sequence]);

  const pause = useCallback(() => {
    if (pausedAtRef.current) return;
    pausedAtRef.current = Date.now();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!pausedAtRef.current) return;
    pausedTotalRef.current += Date.now() - pausedAtRef.current;
    pausedAtRef.current = null;
    setPaused(false);
  }, []);

  const restart = useCallback(() => {
    pausedTotalRef.current = 0;
    pausedAtRef.current = null;
    const current = activeNow();
    setPaused(false);
    setNow(current);
    commit(startWorkoutSequence(sequence, current));
  }, [activeNow, commit, sequence]);

  const status: WorkoutSequenceStatus = finished ? 'finished' : paused ? 'paused' : 'running';

  return {
    status,
    view: describeWorkoutSequence(sequence, state, now),
    next,
    pause,
    resume,
    restart,
  };
}
