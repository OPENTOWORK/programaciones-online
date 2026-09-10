import type { TrainerMessage } from '@/lib/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const TABLE = 'gym_chat_messages';

const MIGRATION_HINT =
  'Falta aplicar el chat de gimnasio en Supabase: ejecuta npm run supabase:gym-member-chat';

type Row = {
  id: string;
  gym_id: string;
  member_id: string;
  author_id: string;
  sender: 'member' | 'staff';
  text: string;
  created_at: string;
};

type PgError = { message?: string; code?: string } | null | undefined;

function isMissingSchemaError(error: PgError) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('gym_chat_messages') ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST202' ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function friendlyError(error: PgError, fallback: string) {
  if (!error) return fallback;
  if (isMissingSchemaError(error)) return MIGRATION_HINT;
  return error.message ?? fallback;
}

function mapMessage(row: Row): TrainerMessage {
  return {
    id: row.id,
    sender: row.sender === 'staff' ? 'trainer' : 'user',
    text: row.text ?? '',
    timestamp: row.created_at,
    authorId: row.author_id,
  };
}

export type GymChatPreview = {
  memberId: string;
  lastText: string;
  lastAt: string;
  lastSender: 'member' | 'staff';
  unread: number;
};

function buildPreview(memberId: string, rows: Array<Pick<Row, 'sender' | 'text' | 'created_at'>>) {
  const last = rows[rows.length - 1];
  if (!last) return undefined;

  let unread = 0;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (rows[index].sender === 'member') unread += 1;
    else break;
  }

  return {
    memberId,
    lastText: last.text.trim(),
    lastAt: last.created_at,
    lastSender: last.sender,
    unread,
  } satisfies GymChatPreview;
}

export async function fetchGymMemberMessages(
  gymId: string,
  memberId: string,
): Promise<{ data: TrainerMessage[]; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, gym_id, member_id, author_id, sender, text, created_at')
    .eq('gym_id', gymId)
    .eq('member_id', memberId)
    .order('created_at', { ascending: true });

  if (error) return { data: [], error: friendlyError(error, 'No se pudieron cargar los mensajes.') };
  return { data: (data as Row[]).map(mapMessage) };
}

export async function fetchGymChatPreviews(
  gymId: string,
  memberIds: string[],
): Promise<Record<string, GymChatPreview>> {
  if (memberIds.length === 0) return {};

  const supabase = getSupabase();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from(TABLE)
    .select('member_id, sender, text, created_at')
    .eq('gym_id', gymId)
    .in('member_id', memberIds)
    .order('created_at', { ascending: true });

  if (error || !data) return {};

  const grouped = new Map<string, Array<Pick<Row, 'sender' | 'text' | 'created_at'>>>();
  for (const row of data as Array<Pick<Row, 'member_id' | 'sender' | 'text' | 'created_at'>>) {
    const bucket = grouped.get(row.member_id) ?? [];
    bucket.push(row);
    grouped.set(row.member_id, bucket);
  }

  const previews: Record<string, GymChatPreview> = {};
  for (const [memberId, rows] of grouped) {
    const preview = buildPreview(memberId, rows);
    if (preview) previews[memberId] = preview;
  }

  return previews;
}

export async function sendGymStaffMessage(
  gymId: string,
  memberId: string,
  text: string,
): Promise<{ data?: TrainerMessage; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data: sessionData } = await supabase.auth.getSession();
  const authorId = sessionData.session?.user.id;
  if (!authorId) return { error: 'Inicia sesión para enviar mensajes.' };

  const messageText = text.trim();
  if (!messageText) return { error: 'Escribe un mensaje.' };

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      gym_id: gymId,
      member_id: memberId,
      author_id: authorId,
      sender: 'staff',
      text: messageText,
    })
    .select('id, gym_id, member_id, author_id, sender, text, created_at')
    .single();

  if (error || !data) {
    return { error: friendlyError(error, 'No se pudo enviar el mensaje.') };
  }

  return { data: mapMessage(data as Row) };
}

export async function sendGymMemberMessage(
  gymId: string,
  memberId: string,
  text: string,
): Promise<{ data?: TrainerMessage; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data: sessionData } = await supabase.auth.getSession();
  const authorId = sessionData.session?.user.id;
  if (!authorId) return { error: 'Inicia sesión para enviar mensajes.' };

  const messageText = text.trim();
  if (!messageText) return { error: 'Escribe un mensaje.' };

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      gym_id: gymId,
      member_id: memberId,
      author_id: authorId,
      sender: 'member',
      text: messageText,
    })
    .select('id, gym_id, member_id, author_id, sender, text, created_at')
    .single();

  if (error || !data) {
    return { error: friendlyError(error, 'No se pudo enviar el mensaje.') };
  }

  return { data: mapMessage(data as Row) };
}

export function isGymChatConfigured() {
  return isSupabaseConfigured;
}
