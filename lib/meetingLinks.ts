import { openExternalUrl } from '@/lib/openExternalUrl';

/**
 * Sala pública de Jitsi: no hace falta cuenta ni configurar nada, así que sirve para generar el
 * enlace desde la app. Quien prefiera Google Meet, Zoom o Teams puede pegar el suyo.
 */
const ROOM_HOST = 'https://meet.jit.si';

/** Acepta host con puerto y ruta, y deja fuera esquemas como `javascript:` que en web sí se ejecutarían. */
const MEETING_URL_PATTERN = /^(?:(https?):\/\/)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)(:\d{2,5})?(\/[^\s]*)?$/i;

export type MeetingProvider = 'room' | 'meet' | 'zoom' | 'teams' | 'whereby' | 'other';

const PROVIDER_LABELS: Record<MeetingProvider, string> = {
  room: 'Sala de vídeo',
  meet: 'Google Meet',
  zoom: 'Zoom',
  teams: 'Microsoft Teams',
  whereby: 'Whereby',
  other: 'Videollamada',
};

/** Nombre de sala difícil de adivinar: en Jitsi, quien tiene el enlace entra. */
function randomRoomToken() {
  const chunk = () => Math.random().toString(36).slice(2, 10);
  return `${chunk()}${chunk()}`;
}

export function generateMeetingRoomUrl() {
  return `${ROOM_HOST}/cita-${randomRoomToken()}`;
}

/**
 * Deja el enlace pegado listo para guardar. Devuelve el error a mostrar si no parece una dirección
 * web, para no acabar con un enlace que no abre nada.
 */
export function normalizeMeetingUrl(value: string): { url?: string; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return {};

  const match = MEETING_URL_PATTERN.exec(trimmed);
  if (!match) {
    return { error: 'Ese enlace no parece una dirección web. Pega la dirección completa de la videollamada.' };
  }

  const [, scheme] = match;
  return { url: scheme ? trimmed : `https://${trimmed}` };
}

export function meetingProviderOf(url: string): MeetingProvider {
  const host = MEETING_URL_PATTERN.exec(url.trim())?.[2]?.toLowerCase() ?? '';

  if (host.endsWith('meet.jit.si')) return 'room';
  if (host.endsWith('meet.google.com')) return 'meet';
  if (host.endsWith('zoom.us') || host.endsWith('zoom.com')) return 'zoom';
  if (host.endsWith('teams.microsoft.com') || host.endsWith('teams.live.com')) return 'teams';
  if (host.endsWith('whereby.com')) return 'whereby';
  return 'other';
}

export function meetingProviderLabel(url: string) {
  return PROVIDER_LABELS[meetingProviderOf(url)];
}

export async function openMeetingUrl(url: string) {
  const { url: safeUrl } = normalizeMeetingUrl(url);
  if (!safeUrl) return;
  await openExternalUrl(safeUrl);
}
