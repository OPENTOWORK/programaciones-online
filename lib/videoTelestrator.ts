export type TelestratorTool = 'pen' | 'highlighter' | 'arrow' | 'circle' | 'line' | 'eraser';

export interface TelestratorPoint {
  x: number;
  y: number;
}

export interface TelestratorStroke {
  tool: TelestratorTool;
  color: string;
  width: number;
  points: TelestratorPoint[];
}

export const TELESTRATOR_COLORS = ['#FF3B30', '#FFD60A', '#32D74B', '#FFFFFF', '#0A84FF'] as const;

export const TELESTRATOR_TOOL_WIDTH: Record<TelestratorTool, number> = {
  pen: 3.5,
  highlighter: 22,
  arrow: 4,
  circle: 3.5,
  line: 3.5,
  eraser: 28,
};

export const TELESTRATOR_WIDTH_SCALES = [
  { id: 'thin', label: 'Fino', scale: 0.55, bar: 2 },
  { id: 'medium', label: 'Medio', scale: 1, bar: 4 },
  { id: 'thick', label: 'Grueso', scale: 1.9, bar: 7 },
] as const;

export type TelestratorWidthId = (typeof TELESTRATOR_WIDTH_SCALES)[number]['id'];

export function strokeWidthForTool(tool: TelestratorTool, scale: number) {
  return Math.max(1, TELESTRATOR_TOOL_WIDTH[tool] * scale);
}

export function pointerToCanvas(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): TelestratorPoint {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 1;
  const height = rect.height || 1;
  return {
    x: ((clientX - rect.left) / width) * canvas.width,
    y: ((clientY - rect.top) / height) * canvas.height,
  };
}

function lastTwo(points: TelestratorPoint[]) {
  const start = points[0];
  const end = points[points.length - 1] ?? start;
  return { start, end };
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  from: TelestratorPoint,
  to: TelestratorPoint,
  color: string,
  width: number,
) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const head = Math.max(14, width * 4);
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - head * Math.cos(angle - 0.4), to.y - head * Math.sin(angle - 0.4));
  ctx.lineTo(to.x - head * Math.cos(angle + 0.4), to.y - head * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: TelestratorStroke) {
  if (stroke.points.length === 0) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.width;

  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  }

  if (stroke.tool === 'highlighter') {
    ctx.globalAlpha = 0.38;
    ctx.globalCompositeOperation = 'source-over';
  }

  if (stroke.tool === 'arrow' || stroke.tool === 'line') {
    const { start, end } = lastTwo(stroke.points);
    if (!start || !end) {
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    if (stroke.tool === 'arrow') {
      drawArrowHead(ctx, start, end, stroke.color, stroke.width);
    }
    ctx.restore();
    return;
  }

  if (stroke.tool === 'circle') {
    const { start, end } = lastTwo(stroke.points);
    if (!start || !end) {
      ctx.restore();
      return;
    }
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;
    if (radiusX < 1 && radiusY < 1) {
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.ellipse(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2,
      Math.max(radiusX, 1),
      Math.max(radiusY, 1),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  if (stroke.points.length === 1) {
    ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    stroke.points.forEach((point, index) => {
      if (index === 0) return;
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }

  ctx.restore();
}

export function drawStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: TelestratorStroke[],
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);
  strokes.forEach((stroke) => drawStroke(ctx, stroke));
}

export function scaleRecordingSize(videoWidth: number, videoHeight: number, maxEdge = 1080) {
  const longEdge = Math.max(videoWidth, videoHeight);
  if (longEdge <= maxEdge) {
    return { width: videoWidth, height: videoHeight };
  }
  const scale = maxEdge / longEdge;
  return {
    width: Math.max(2, Math.round(videoWidth * scale)),
    height: Math.max(2, Math.round(videoHeight * scale)),
  };
}

export function pickRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';

  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm',
    'video/mp4',
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

export function extensionForRecorderMime(mimeType: string) {
  if (mimeType.includes('mp4')) return 'mp4';
  return 'webm';
}

export const TELESTRATOR_PLAYBACK_RATES = [0.1, 0.25, 0.5, 0.75, 1] as const;

export function formatPlaybackRate(rate: number) {
  if (rate === 1) return '1x';
  return `${rate.toString().replace('.', ',')}x`;
}

export function drawTrainerPip(
  ctx: CanvasRenderingContext2D,
  camera: HTMLVideoElement,
  canvasWidth: number,
  canvasHeight: number,
) {
  if (camera.readyState < 2 || camera.videoWidth < 2 || camera.videoHeight < 2) return;

  const pipW = Math.round(canvasWidth * 0.28);
  const pipH = Math.round(pipW * (camera.videoHeight / camera.videoWidth));
  const margin = Math.round(Math.min(canvasWidth, canvasHeight) * 0.045);
  const x = canvasWidth - pipW - margin;
  const y = canvasHeight - pipH - margin;
  const radius = Math.max(12, pipW * 0.08);

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, pipW, pipH, radius);
  } else {
    ctx.rect(x, y, pipW, pipH);
  }
  ctx.clip();
  ctx.translate(x + pipW, y);
  ctx.scale(-1, 1);
  ctx.drawImage(camera, 0, 0, pipW, pipH);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, pipW, pipH, radius);
  } else {
    ctx.rect(x, y, pipW, pipH);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.lineWidth = Math.max(3, canvasWidth * 0.007);
  ctx.stroke();
  ctx.restore();
}

export function formatPlayerClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
