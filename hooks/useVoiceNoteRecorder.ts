import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import type { FeedbackAttachmentDraft } from '@/lib/trainerFeedbackMediaService';

const RECORDING_OPTIONS =
  Platform.OS === 'web'
    ? RecordingPresets.HIGH_QUALITY
    : { ...RecordingPresets.HIGH_QUALITY, directory: 'document' as const };

function audioExtension(mimeType: string) {
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  return 'm4a';
}

export function useVoiceNoteRecorder() {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);

    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError('Necesitamos permiso para usar el micrófono.');
      return false;
    }

    setIsPreparing(true);
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      return true;
    } catch (recordError) {
      setError(
        recordError instanceof Error ? recordError.message : 'No se pudo iniciar la grabación.',
      );
      return false;
    } finally {
      setIsPreparing(false);
    }
  }, [recorder]);

  const stop = useCallback(async (): Promise<FeedbackAttachmentDraft | null> => {
    const durationSeconds = Math.round((recorderState.durationMillis ?? 0) / 1000);

    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
    } catch (stopError) {
      setError(stopError instanceof Error ? stopError.message : 'No se pudo guardar la grabación.');
      return null;
    }

    const uri = recorder.uri;
    if (!uri) {
      setError('No se pudo guardar la nota de voz.');
      return null;
    }

    // El navegador decide el contenedor real (webm en Chrome/Firefox, mp4 en Safari).
    let mimeType = Platform.OS === 'web' ? 'audio/webm' : 'audio/m4a';
    if (Platform.OS === 'web') {
      try {
        const blob = await (await fetch(uri)).blob();
        if (blob.type) mimeType = blob.type.split(';')[0];
      } catch {
        // Si no se puede inspeccionar el blob, se mantiene el tipo por defecto.
      }
    }

    return {
      kind: 'audio',
      uri,
      mimeType,
      fileName: `nota-de-voz-${Date.now()}.${audioExtension(mimeType)}`,
      durationSeconds: durationSeconds > 0 ? durationSeconds : undefined,
    };
  }, [recorder, recorderState.durationMillis]);

  const cancel = useCallback(async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
      }
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // Cancelar nunca debe romper el flujo de la pantalla.
    }
  }, [recorder, recorderState.isRecording]);

  return {
    isRecording: recorderState.isRecording,
    isPreparing,
    durationMillis: recorderState.durationMillis ?? 0,
    error,
    start,
    stop,
    cancel,
    clearError: () => setError(null),
  };
}
