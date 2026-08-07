import { addCrmActivity, buildMessageSentActivity } from '@/lib/trainerCrmActivity';
import type { ChatAttachmentDraft } from '@/lib/chatAttachments';
import {
  fetchChatAttachments,
  uploadChatAttachment,
} from '@/lib/trainerChatMediaService';
import type { TrainerChatAttachment, TrainerMessage } from '@/lib/types';

function mapMessage(row: {
  id: string;
  sender: string;
  text: string;
  created_at: string;
}): TrainerMessage {
  return {
    id: row.id,
    sender: row.sender as TrainerMessage['sender'],
    text: row.text,
    timestamp: row.created_at,
  };
}

async function attachMediaToMessages(
  messages: TrainerMessage[],
  useLocalStore: boolean,
): Promise<TrainerMessage[]> {
  if (messages.length === 0) return messages;

  const chatMessageIds = messages.filter((message) => message.origin !== 'feedback').map((message) => message.id);
  const attachmentsByMessage = await fetchChatAttachments(chatMessageIds, useLocalStore);

  return messages.map((message) => {
    if (message.origin === 'feedback') return message;
    const attachments = attachmentsByMessage[message.id];
    return attachments?.length ? { ...message, attachments } : message;
  });
}

export async function fetchTrainerMessages(userId: string): Promise<TrainerMessage[]> {
  const { getSupabase, isSupabaseConfigured } = await import('@/lib/supabase');
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('trainer_messages')
    .select('id, sender, text, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  const messages = data.map(mapMessage);
  return attachMediaToMessages(messages, !isSupabaseConfigured);
}

export async function sendAthleteMessage(
  userId: string,
  text: string,
  drafts: ChatAttachmentDraft[] = [],
): Promise<TrainerMessage | null> {
  const { getSupabase, isSupabaseConfigured } = await import('@/lib/supabase');
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const uploaderId = sessionData.session?.user.id;
  if (!uploaderId) return null;

  const messageText = text.trim();

  const { data, error } = await supabase
    .from('trainer_messages')
    .insert({ user_id: userId, sender: 'user', text: messageText })
    .select('id, sender, text, created_at')
    .single();

  if (error || !data) return null;

  const uploaded = await uploadMessageAttachments({
    athleteUserId: userId,
    messageId: data.id,
    uploaderId,
    drafts,
    useLocalStore: !isSupabaseConfigured,
  });

  return {
    ...mapMessage(data),
    attachments: uploaded.attachments,
  };
}

export async function fetchUnansweredMessageCounts(athleteIds: string[]): Promise<Record<string, number>> {
  if (athleteIds.length === 0) return {};

  const { getSupabase } = await import('@/lib/supabase');
  const supabase = getSupabase();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from('trainer_messages')
    .select('user_id, sender, created_at')
    .in('user_id', athleteIds)
    .order('created_at', { ascending: true });

  if (error || !data) return {};

  const counts = Object.fromEntries(athleteIds.map((id) => [id, 0]));

  const messagesByAthlete = new Map<string, Array<{ sender: string }>>();
  for (const row of data) {
    const existing = messagesByAthlete.get(row.user_id) ?? [];
    existing.push({ sender: row.sender });
    messagesByAthlete.set(row.user_id, existing);
  }

  for (const [athleteId, messages] of messagesByAthlete) {
    let unanswered = 0;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].sender === 'user') {
        unanswered += 1;
      } else {
        break;
      }
    }
    counts[athleteId] = unanswered;
  }

  return counts;
}

async function uploadMessageAttachments(input: {
  athleteUserId: string;
  messageId: string;
  uploaderId: string;
  drafts: ChatAttachmentDraft[];
  useLocalStore: boolean;
}): Promise<{ attachments: TrainerChatAttachment[]; error?: string }> {
  const attachments: TrainerChatAttachment[] = [];
  let error: string | undefined;

  for (const draft of input.drafts) {
    const upload = await uploadChatAttachment({
      athleteUserId: input.athleteUserId,
      messageId: input.messageId,
      uploaderId: input.uploaderId,
      draft,
      useLocalStore: input.useLocalStore,
    });
    if (upload.attachment) attachments.push(upload.attachment);
    if (upload.error) error = upload.error;
  }

  return { attachments, error };
}

export async function sendTrainerReply(
  athleteUserId: string,
  text: string,
  drafts: ChatAttachmentDraft[] = [],
): Promise<TrainerMessage | null> {
  const { getSupabase, isSupabaseConfigured } = await import('@/lib/supabase');
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const trainerId = sessionData.session?.user.id;
  if (!trainerId) return null;

  const messageText = text.trim();

  const { data, error } = await supabase
    .from('trainer_messages')
    .insert({ user_id: athleteUserId, sender: 'trainer', text: messageText })
    .select('id, sender, text, created_at')
    .single();

  if (error || !data) return null;

  const uploaded = await uploadMessageAttachments({
    athleteUserId: athleteUserId,
    messageId: data.id,
    uploaderId: trainerId,
    drafts,
    useLocalStore: !isSupabaseConfigured,
  });

  void addCrmActivity(
    trainerId,
    athleteUserId,
    buildMessageSentActivity(messageText || 'Adjunto'),
    'message_sent',
    !isSupabaseConfigured,
  );

  return {
    ...mapMessage(data),
    attachments: uploaded.attachments,
  };
}

export async function sendSignupWelcomeMessage(
  userId: string,
  name: string,
): Promise<{ ok: boolean; error?: string }> {
  const { getSupabase, isSupabaseConfigured } = await import('@/lib/supabase');
  if (!isSupabaseConfigured) {
    return { ok: true };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: 'Supabase no está disponible.' };
  }

  const { error } = await supabase.rpc('send_signup_welcome_message', {
    target_user_id: userId,
    athlete_name: name.trim() || null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export const sendTrainerMessage = sendAthleteMessage;
