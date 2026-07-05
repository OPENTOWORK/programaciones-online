import type { TrainerMessage } from '@/lib/types';

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

export async function fetchTrainerMessages(userId: string): Promise<TrainerMessage[]> {
  const { getSupabase } = await import('@/lib/supabase');
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('trainer_messages')
    .select('id, sender, text, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map(mapMessage);
}

export async function sendAthleteMessage(userId: string, text: string): Promise<TrainerMessage | null> {
  const { getSupabase } = await import('@/lib/supabase');
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('trainer_messages')
    .insert({ user_id: userId, sender: 'user', text })
    .select('id, sender, text, created_at')
    .single();

  if (error || !data) return null;

  return mapMessage(data);
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

export async function sendTrainerReply(athleteUserId: string, text: string): Promise<TrainerMessage | null> {
  const { getSupabase } = await import('@/lib/supabase');
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('trainer_messages')
    .insert({ user_id: athleteUserId, sender: 'trainer', text })
    .select('id, sender, text, created_at')
    .single();

  if (error || !data) return null;

  return mapMessage(data);
}

export const sendTrainerMessage = sendAthleteMessage;
