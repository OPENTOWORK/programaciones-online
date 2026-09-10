import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { AppIcon } from '@/components/ui/AppIcon';
import { colors, spacing, typography } from '@/constants/theme';
import type { FeedbackAttachmentDraft } from '@/lib/trainerFeedbackMediaService';
import {
  TELESTRATOR_COLORS,
  TELESTRATOR_PLAYBACK_RATES,
  TELESTRATOR_WIDTH_SCALES,
  drawStrokes,
  drawTrainerPip,
  extensionForRecorderMime,
  formatPlaybackRate,
  formatPlayerClock,
  pickRecorderMimeType,
  pointerToCanvas,
  scaleRecordingSize,
  strokeWidthForTool,
  type TelestratorStroke,
  type TelestratorTool,
  type TelestratorWidthId,
} from '@/lib/videoTelestrator';

type StudioPhase = 'edit' | 'preview';

const TOOLS: { id: TelestratorTool; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { id: 'pen', icon: 'pencil', label: 'Lápiz' },
  { id: 'highlighter', icon: 'brush', label: 'Resaltar' },
  { id: 'arrow', icon: 'arrow-forward', label: 'Flecha' },
  { id: 'circle', icon: 'ellipse-outline', label: 'Círculo' },
  { id: 'line', icon: 'remove-outline', label: 'Línea' },
  { id: 'eraser', icon: 'backspace-outline', label: 'Borrar' },
];

function isShapeTool(tool: TelestratorTool) {
  return tool === 'arrow' || tool === 'circle' || tool === 'line';
}

interface VideoTelestratorModalProps {
  visible: boolean;
  videoUrl: string;
  title?: string;
  onClose: () => void;
  onComplete: (draft: FeedbackAttachmentDraft) => void;
}

export function VideoTelestratorModal({
  visible,
  videoUrl,
  title,
  onClose,
  onComplete,
}: VideoTelestratorModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const trainerVideoRef = useRef<HTMLVideoElement | null>(null);
  const trainerStreamRef = useRef<MediaStream | null>(null);
  const strokesRef = useRef<TelestratorStroke[]>([]);
  const currentStrokeRef = useRef<TelestratorStroke | null>(null);
  const drawingRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const previewBlobRef = useRef<Blob | null>(null);
  const recordStartedAtRef = useRef(0);
  const previewUrlRef = useRef<string | null>(null);

  const [phase, setPhase] = useState<StudioPhase>('edit');
  const [tool, setTool] = useState<TelestratorTool>('pen');
  const [color, setColor] = useState<string>(TELESTRATOR_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState<TelestratorWidthId>('medium');
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [aspect, setAspect] = useState(9 / 16);
  const [strokeCount, setStrokeCount] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState('video/webm');
  const [previewDuration, setPreviewDuration] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const toolRef = useRef(tool);
  const colorRef = useRef(color);
  const strokeWidthRef = useRef(strokeWidth);
  const phaseRef = useRef(phase);
  toolRef.current = tool;
  colorRef.current = color;
  strokeWidthRef.current = strokeWidth;
  phaseRef.current = phase;

  const redrawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const live = currentStrokeRef.current;
    const strokes = live ? [...strokesRef.current, live] : strokesRef.current;
    drawStrokes(ctx, strokes, canvas.width, canvas.height);
  }, []);

  const stopCompositeLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stopTrainerMedia = useCallback(() => {
    trainerStreamRef.current?.getTracks().forEach((track) => track.stop());
    trainerStreamRef.current = null;
    const camera = trainerVideoRef.current;
    if (camera) camera.srcObject = null;
    setMicReady(false);
    setCameraReady(false);
  }, []);

  const clearPreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  const resetStudio = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    drawingRef.current = false;
    setStrokeCount(0);
    setPhase('edit');
    setPlaying(false);
    setPlaybackRate(1);
    setCurrentTime(0);
    setRecording(false);
    setRecordSeconds(0);
    setError(null);
    setBusy(false);
    clearPreviewUrl();
    setPreviewDuration(undefined);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.playbackRate = 1;
    }
  }, [clearPreviewUrl]);

  useEffect(() => {
    if (!visible) {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      stopCompositeLoop();
      stopTrainerMedia();
      resetStudio();
    }
  }, [resetStudio, stopCompositeLoop, stopTrainerMedia, visible]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return undefined;

    let cancelled = false;

    async function enableTrainerMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 360 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        trainerStreamRef.current = stream;
        setCameraReady(stream.getVideoTracks().some((track) => track.readyState === 'live'));
        setMicReady(stream.getAudioTracks().some((track) => track.readyState === 'live'));
        const camera = trainerVideoRef.current;
        if (camera) {
          camera.srcObject = stream;
          camera.muted = true;
          await camera.play().catch(() => undefined);
        }
      } catch {
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          if (cancelled) {
            audioOnly.getTracks().forEach((track) => track.stop());
            return;
          }
          trainerStreamRef.current = audioOnly;
          setCameraReady(false);
          setMicReady(true);
          setError('Cámara no disponible. Se grabará tu voz sobre el vídeo.');
        } catch {
          if (!cancelled) {
            setCameraReady(false);
            setMicReady(false);
            setError('Activa el micrófono para explicar al atleta mientras grabas.');
          }
        }
      }
    }

    void enableTrainerMedia();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    const camera = trainerVideoRef.current;
    const stream = trainerStreamRef.current;
    if (!camera || !stream) return;
    if (camera.srcObject !== stream) {
      camera.srcObject = stream;
      camera.muted = true;
      void camera.play().catch(() => undefined);
    }
  }, [cameraReady, visible]);

  useEffect(() => {
    if (!visible || phase !== 'edit') return undefined;
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video) return;
      setCurrentTime(video.currentTime);
      setPlaying(!video.paused && !video.ended);
    }, 200);
    return () => window.clearInterval(timer);
  }, [phase, visible]);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setInterval(() => {
      setRecordSeconds(Math.max(0, (Date.now() - recordStartedAtRef.current) / 1000));
    }, 200);
    return () => window.clearInterval(timer);
  }, [recording]);

  const syncCanvasSize = useCallback(() => {
    const video = videoRef.current;
    const canvas = overlayRef.current;
    if (!video || !canvas || video.videoWidth < 2 || video.videoHeight < 2) return;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    setAspect(video.videoWidth / video.videoHeight);
    setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    redrawOverlay();
  }, [redrawOverlay]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return undefined;
    const canvas = overlayRef.current;
    if (!canvas) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      if (phaseRef.current !== 'edit') return;
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      drawingRef.current = true;
      const point = pointerToCanvas(canvas, event.clientX, event.clientY);
      const activeTool = toolRef.current;
      const widthPreset =
        TELESTRATOR_WIDTH_SCALES.find((item) => item.id === strokeWidthRef.current) ??
        TELESTRATOR_WIDTH_SCALES[1];
      currentStrokeRef.current = {
        tool: activeTool,
        color: colorRef.current,
        width: strokeWidthForTool(activeTool, widthPreset.scale),
        points: [point],
      };
      redrawOverlay();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drawingRef.current || !currentStrokeRef.current) return;
      const point = pointerToCanvas(canvas, event.clientX, event.clientY);
      const stroke = currentStrokeRef.current;
      if (isShapeTool(stroke.tool)) {
        stroke.points = [stroke.points[0], point];
      } else {
        stroke.points.push(point);
      }
      redrawOverlay();
    };

    const finishStroke = () => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      const stroke = currentStrokeRef.current;
      currentStrokeRef.current = null;
      if (stroke && stroke.points.length > 0) {
        strokesRef.current = [...strokesRef.current, stroke];
        setStrokeCount(strokesRef.current.length);
      }
      redrawOverlay();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', finishStroke);
    canvas.addEventListener('pointercancel', finishStroke);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', finishStroke);
      canvas.removeEventListener('pointercancel', finishStroke);
    };
  }, [redrawOverlay, visible]);

  const handleClose = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    stopCompositeLoop();
    onClose();
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      try {
        video.playbackRate = playbackRate;
        await video.play();
        setPlaying(true);
      } catch {
        setError('No se pudo reproducir el vídeo.');
      }
      return;
    }
    video.pause();
    setPlaying(false);
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const applyPlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    const video = videoRef.current;
    if (video) video.playbackRate = rate;
  };

  const handleUndo = () => {
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    redrawOverlay();
  };

  const handleClear = () => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    setStrokeCount(0);
    redrawOverlay();
  };

  const startRecording = async () => {
    if (Platform.OS !== 'web' || typeof MediaRecorder === 'undefined') {
      setError('La grabación está disponible en el navegador del panel web.');
      return;
    }

    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay || video.videoWidth < 2) {
      setError('Espera a que cargue el vídeo para grabar.');
      return;
    }

    const mimeType = pickRecorderMimeType();
    if (!mimeType) {
      setError('Este navegador no puede grabar el vídeo anotado. Prueba con Chrome o Edge.');
      return;
    }

    setError(null);
    setBusy(true);

    try {
      if (video.paused) {
        video.playbackRate = playbackRate;
        await video.play();
        setPlaying(true);
      } else {
        video.playbackRate = playbackRate;
      }

      const size = scaleRecordingSize(video.videoWidth, video.videoHeight);
      const recCanvas = document.createElement('canvas');
      recCanvas.width = size.width;
      recCanvas.height = size.height;
      const recCtx = recCanvas.getContext('2d');
      if (!recCtx) throw new Error('No se pudo preparar la grabación');

      const athleteWasMuted = video.muted;
      video.muted = true;

      try {
        recCtx.drawImage(video, 0, 0, recCanvas.width, recCanvas.height);
      } catch {
        video.muted = athleteWasMuted;
        throw new Error('No se pudo copiar el vídeo para grabar. Recarga la página e inténtalo de nuevo.');
      }

      const paintFrame = () => {
        try {
          recCtx.drawImage(video, 0, 0, recCanvas.width, recCanvas.height);
          recCtx.drawImage(overlay, 0, 0, recCanvas.width, recCanvas.height);
          const camera = trainerVideoRef.current;
          if (camera) {
            drawTrainerPip(recCtx, camera, recCanvas.width, recCanvas.height);
          }
        } catch {
          setError('No se pudo copiar el vídeo para grabar. Recarga la página e inténtalo de nuevo.');
          return;
        }
        rafRef.current = requestAnimationFrame(paintFrame);
      };
      paintFrame();

      const canvasStream = recCanvas.captureStream(30);
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
      const trainerAudio = trainerStreamRef.current?.getAudioTracks() ?? [];
      if (trainerAudio.length > 0) {
        trainerAudio.forEach((track) => {
          track.enabled = true;
        });
        tracks.push(...trainerAudio);
        setMicReady(true);
      } else {
        setMicReady(false);
        setError('Sin micrófono: se grabará el vídeo anotado sin tu voz.');
      }

      const mixed = new MediaStream(tracks);
      const recorder = new MediaRecorder(mixed, { mimeType, videoBitsPerSecond: 2_500_000 });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setError('No se pudo grabar. Recarga e inténtalo de nuevo.');
        setRecording(false);
        setBusy(false);
        video.muted = athleteWasMuted;
        stopCompositeLoop();
      };
      recorder.onstop = () => {
        stopCompositeLoop();
        video.muted = athleteWasMuted;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        if (blob.size < 8) {
          setError('La grabación quedó vacía. Vuelve a intentarlo.');
          setRecording(false);
          setBusy(false);
          return;
        }
        clearPreviewUrl();
        previewBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;
        setPreviewUrl(url);
        setPreviewMime(mimeType);
        setPreviewDuration(Math.max(1, Math.round((Date.now() - recordStartedAtRef.current) / 1000)));
        setPhase('preview');
        setRecording(false);
        setBusy(false);
        video.pause();
        setPlaying(false);
      };

      recorderRef.current = recorder;
      recordStartedAtRef.current = Date.now();
      recorder.start(200);
      setRecording(true);
      setRecordSeconds(0);
      setBusy(false);
    } catch (recordError) {
      stopCompositeLoop();
      setBusy(false);
      setRecording(false);
      setError(
        recordError instanceof Error
          ? recordError.message
          : 'No se pudo iniciar la grabación. Comprueba el permiso de cámara y micrófono.',
      );
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    setBusy(true);
    recorder.stop();
  };

  const discardPreview = () => {
    clearPreviewUrl();
    setPhase('edit');
    setRecordSeconds(0);
  };

  const confirmPreview = () => {
    if (!previewUrl) return;
    const ext = extensionForRecorderMime(previewMime);
    const mimeType = previewMime || 'video/webm';
    const safeTitle = (title ?? 'correccion').replace(/[^\w.\-() ]+/g, '_').trim() || 'correccion';
    const fileName = `Correccion-${safeTitle}.${ext}`;
    const blob = previewBlobRef.current;
    previewUrlRef.current = null;
    previewBlobRef.current = null;
    onComplete({
      kind: 'video',
      uri: previewUrl,
      mimeType,
      fileName,
      durationSeconds: previewDuration,
      file: blob ?? undefined,
    });
    setPreviewUrl(null);
    onClose();
  };

  if (Platform.OS !== 'web' || !videoUrl) return null;

  const portrait = aspect <= 0.92;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={handleClose}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>Corrección en vídeo</Text>
            <Text style={styles.title} numberOfLines={1}>
              {title?.trim() || 'Vídeo del atleta'}
            </Text>
          </View>
          <Pressable onPress={handleClose} hitSlop={8} accessibilityLabel="Cerrar">
            <AppIcon name="close" size={22} color={colors.white} />
          </Pressable>
        </View>

        {phase === 'edit' ? (
          <>
            <View style={styles.stageWrap}>
              <View
                style={[
                  styles.stage,
                  portrait ? styles.stagePortrait : styles.stageLandscape,
                  { aspectRatio: aspect },
                ]}
              >
                <video
                  ref={videoRef}
                  src={videoUrl}
                  playsInline
                  preload="auto"
                  crossOrigin="anonymous"
                  onLoadedMetadata={syncCanvasSize}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#05070A',
                    pointerEvents: 'none',
                  }}
                >
                  <track kind="captions" />
                </video>
                <canvas
                  ref={overlayRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    touchAction: 'none',
                    cursor: 'crosshair',
                  }}
                />
                {recording ? (
                  <View style={styles.recBadge} pointerEvents="none">
                    <View style={styles.recDot} />
                    <Text style={styles.recText}>REC {formatPlayerClock(recordSeconds)}</Text>
                  </View>
                ) : null}
                <video
                  ref={trainerVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    position: 'absolute',
                    right: 12,
                    bottom: 12,
                    width: '28%',
                    maxWidth: 140,
                    borderRadius: 12,
                    border: '2px solid rgba(255,255,255,0.88)',
                    backgroundColor: '#111',
                    objectFit: 'cover',
                    aspectRatio: '4 / 3',
                    display: cameraReady ? 'block' : 'none',
                    zIndex: 2,
                    transform: 'scaleX(-1)',
                    pointerEvents: 'none',
                  }}
                >
                  <track kind="captions" />
                </video>
                {!cameraReady ? (
                  <View style={styles.pipPlaceholder} pointerEvents="none">
                    <Ionicons name="videocam-off-outline" size={16} color="#C5CDD6" />
                    <Text style={styles.pipPlaceholderText}>Tu cámara</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.transport}>
              <Pressable
                onPress={() => void togglePlay()}
                style={styles.iconBtn}
                accessibilityLabel={playing ? 'Pausar' : 'Reproducir'}
              >
                <Ionicons name={playing ? 'pause' : 'play'} size={18} color={colors.white} />
              </Pressable>
              <Text style={styles.clock}>
                {formatPlayerClock(currentTime)} / {formatPlayerClock(duration)}
              </Text>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 0.1)}
                step={0.05}
                value={currentTime}
                onChange={(event) => handleSeek(Number(event.currentTarget.value))}
                style={{ flex: 1, accentColor: colors.accent }}
              />
              {TELESTRATOR_PLAYBACK_RATES.map((rate) => {
                const active = playbackRate === rate;
                return (
                  <Pressable
                    key={rate}
                    onPress={() => applyPlaybackRate(rate)}
                    style={[styles.chipBtn, active && styles.chipBtnOn]}
                    accessibilityLabel={`Velocidad ${formatPlaybackRate(rate)}`}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextOn]}>
                      {formatPlaybackRate(rate)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.tools}>
              {TOOLS.map((item) => {
                const active = tool === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setTool(item.id)}
                    accessibilityLabel={item.label}
                    style={[styles.toolBtn, active && styles.toolBtnOn]}
                  >
                    <Ionicons name={item.icon} size={16} color={active ? colors.white : '#C5CDD6'} />
                  </Pressable>
                );
              })}
              <View style={styles.toolDivider} />
              {TELESTRATOR_WIDTH_SCALES.map((item) => {
                const active = strokeWidth === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setStrokeWidth(item.id)}
                    accessibilityLabel={`Grosor ${item.label}`}
                    style={[styles.toolBtn, active && styles.toolBtnOn]}
                  >
                    <View
                      style={[
                        styles.widthBar,
                        { height: item.bar },
                        active && styles.widthBarOn,
                      ]}
                    />
                  </Pressable>
                );
              })}
              <View style={styles.toolDivider} />
              {TELESTRATOR_COLORS.map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setColor(value)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: value },
                    color === value && styles.colorDotOn,
                  ]}
                />
              ))}
              <Pressable onPress={handleUndo} disabled={strokeCount === 0} style={styles.toolBtn}>
                <Ionicons
                  name="arrow-undo-outline"
                  size={16}
                  color={strokeCount === 0 ? '#66707A' : '#C5CDD6'}
                />
              </Pressable>
              <Pressable onPress={handleClear} disabled={strokeCount === 0} style={styles.toolBtn}>
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={strokeCount === 0 ? '#66707A' : '#C5CDD6'}
                />
              </Pressable>
            </View>

            <View style={styles.statusRow}>
              <View style={[styles.statusChip, micReady ? styles.statusChipOn : styles.statusChipOff]}>
                <Ionicons
                  name={micReady ? 'mic' : 'mic-off-outline'}
                  size={13}
                  color={micReady ? '#32D74B' : '#FF6961'}
                />
                <Text style={[styles.statusText, micReady ? styles.statusTextOn : styles.statusTextOff]}>
                  {micReady ? 'Micrófono listo' : 'Sin micrófono'}
                </Text>
              </View>
              <View style={[styles.statusChip, cameraReady ? styles.statusChipOn : styles.statusChipOff]}>
                <Ionicons
                  name={cameraReady ? 'videocam' : 'videocam-off-outline'}
                  size={13}
                  color={cameraReady ? '#32D74B' : '#FF6961'}
                />
                <Text style={[styles.statusText, cameraReady ? styles.statusTextOn : styles.statusTextOff]}>
                  {cameraReady ? 'Cámara lista' : 'Sin cámara'}
                </Text>
              </View>
            </View>

            <Text style={styles.hint}>
              Elige una velocidad lenta, pinta y pulsa Grabar. Tu cámara y tu voz se mezclan en el
              mismo vídeo que recibe el atleta. Usa auriculares para evitar eco.
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.footer}>
              <Button title="Cancelar" variant="ghost" onPress={handleClose} style={styles.footerBtn} />
              {recording ? (
                <Button
                  title="Parar y usar"
                  onPress={stopRecording}
                  loading={busy}
                  style={styles.footerBtn}
                />
              ) : (
                <Button
                  title={micReady ? 'Grabar corrección' : 'Grabar sin voz'}
                  onPress={() => void startRecording()}
                  loading={busy}
                  style={styles.footerBtn}
                />
              )}
            </View>
          </>
        ) : (
          <View style={styles.previewWrap}>
            <Text style={styles.previewTitle}>Así lo verá el atleta</Text>
            {previewUrl ? (
              <video
                src={previewUrl}
                controls
                playsInline
                style={{
                  width: '100%',
                  maxHeight: 480,
                  borderRadius: 16,
                  backgroundColor: '#05070A',
                }}
              >
                <track kind="captions" />
              </video>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.footer}>
              <Button
                title="Grabar de nuevo"
                variant="outline"
                onPress={discardPreview}
                style={styles.footerBtn}
              />
              <Button title="Añadir al feedback" onPress={confirmPreview} style={styles.footerBtn} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#0B1016',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    ...typography.caption,
    color: '#8B95A1',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    ...typography.h3,
    color: colors.white,
    marginTop: 2,
  },
  stageWrap: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    position: 'relative',
    width: '100%',
    maxHeight: '100%',
    backgroundColor: '#05070A',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stagePortrait: {
    maxWidth: 420,
  },
  stageLandscape: {
    maxWidth: 960,
  },
  recBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  recText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  pipPlaceholder: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 112,
    height: 84,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pipPlaceholderText: {
    ...typography.caption,
    color: '#C5CDD6',
  },
  transport: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  clock: {
    ...typography.caption,
    color: '#C5CDD6',
    fontVariant: ['tabular-nums'],
    minWidth: 78,
  },
  chipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  chipBtnOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    ...typography.caption,
    color: '#C5CDD6',
    fontWeight: '700',
  },
  chipTextOn: {
    color: colors.white,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusChipOn: {
    backgroundColor: 'rgba(50, 215, 75, 0.12)',
    borderColor: 'rgba(50, 215, 75, 0.35)',
  },
  statusChipOff: {
    backgroundColor: 'rgba(255, 105, 97, 0.1)',
    borderColor: 'rgba(255, 105, 97, 0.3)',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  statusTextOn: {
    color: '#32D74B',
  },
  statusTextOff: {
    color: '#FF6961',
  },
  tools: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  toolBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  toolBtnOn: {
    backgroundColor: colors.accent,
  },
  toolDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginHorizontal: 4,
  },
  widthBar: {
    width: 16,
    borderRadius: 4,
    backgroundColor: '#C5CDD6',
  },
  widthBarOn: {
    backgroundColor: colors.white,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotOn: {
    borderColor: colors.white,
  },
  hint: {
    ...typography.caption,
    color: '#8B95A1',
    lineHeight: 18,
  },
  error: {
    ...typography.caption,
    color: '#FF6961',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerBtn: {
    flex: 1,
    marginTop: 0,
  },
  previewWrap: {
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  previewTitle: {
    ...typography.h3,
    color: colors.white,
    textAlign: 'center',
  },
});
