import { readPersistedRecord, writePersistedRecord } from '@/lib/localUserDataStorage';

const STORAGE_KEY = 'workout-timer-preferences';

let soundEnabled = true;
let changedThisSession = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

/** Lee una sola vez por sesión si el atleta silenció los pitidos del crono en este dispositivo. */
export function loadTimerSoundSetting(): Promise<void> {
  loading ??= readPersistedRecord<boolean>(STORAGE_KEY).then((preferences) => {
    if (changedThisSession || preferences.sound !== false) return;
    soundEnabled = false;
    notify();
  });
  return loading;
}

export function isTimerSoundEnabled() {
  return soundEnabled;
}

export function setTimerSoundEnabled(enabled: boolean) {
  changedThisSession = true;
  soundEnabled = enabled;
  notify();
  void writePersistedRecord(STORAGE_KEY, { sound: enabled });
}

export function subscribeTimerSoundSetting(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
