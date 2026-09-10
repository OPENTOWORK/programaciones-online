import { isTrainerRole } from '@/lib/athleteService';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { TrainerMessage, UserRole } from '@/lib/types';

const TABLE = 'program_chat_messages';
const PERFIL_TABLE = 'Perfil';

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes(TABLE) ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function mapRow(
  row: Record<string, unknown>,
  profileNameById: Map<string, string>,
  currentUserId?: string,
): TrainerMessage {
  const authorId = row.author_id as string;
  const sender = row.sender as TrainerMessage['sender'];
  const authorName = profileNameById.get(authorId) ?? 'Usuario';
  const isStaffMessage = sender === 'trainer';

  return {
    id: row.id as string,
    sender,
    text: row.text as string,
    timestamp: row.created_at as string,
    authorId,
    authorLabel: authorId === currentUserId ? undefined : isStaffMessage ? `Equipo · ${authorName}` : authorName,
  };
}

async function fetchProfileNames(authorIds: string[]) {
  const names = new Map<string, string>();
  if (authorIds.length === 0 || !isSupabaseConfigured) return names;

  const supabase = getSupabase();
  if (!supabase) return names;

  const { data } = await supabase.from(PERFIL_TABLE).select('id, name').in('id', authorIds);
  for (const row of data ?? []) {
    names.set(row.id as string, (row.name as string) ?? 'Usuario');
  }

  return names;
}

export async function fetchProgramChatMessages(
  programId: string,
  currentUserId?: string,
): Promise<{ messages: TrainerMessage[]; persistent: boolean }> {
  if (!programId || !isSupabaseConfigured) {
    return { messages: [], persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) return { messages: [], persistent: false };

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, program_id, author_id, sender, text, created_at')
    .eq('program_id', programId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    return { messages: [], persistent: !isMissingTableError(error) };
  }

  const authorIds = [...new Set(data.map((row) => row.author_id as string))];
  const profileNames = await fetchProfileNames(authorIds);

  return {
    messages: data.map((row) => mapRow(row as Record<string, unknown>, profileNames, currentUserId)),
    persistent: true,
  };
}

export async function sendProgramChatMessage(input: {
  programId: string;
  text: string;
  role?: UserRole;
}): Promise<{ message?: TrainerMessage; error?: string; persistent?: boolean }> {
  const trimmed = input.text.trim();
  if (!trimmed) return { error: 'Escribe un mensaje.' };
  if (!input.programId || !isSupabaseConfigured) {
    return { error: 'El chat grupal no está disponible todavía.', persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data: sessionData } = await supabase.auth.getSession();
  const authorId = sessionData.session?.user.id;
  if (!authorId) return { error: 'Debes iniciar sesión.' };

  const sender: TrainerMessage['sender'] = isTrainerRole(input.role) ? 'trainer' : 'user';

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      program_id: input.programId,
      author_id: authorId,
      sender,
      text: trimmed,
    })
    .select('id, program_id, author_id, sender, text, created_at')
    .single();

  if (error || !data) {
    if (isMissingTableError(error)) {
      return {
        error: 'El chat grupal no está disponible. Ejecuta: npm run supabase:program-group-chat',
        persistent: false,
      };
    }
    return { error: error?.message ?? 'No se pudo enviar el mensaje.', persistent: true };
  }

  const profileNames = await fetchProfileNames([authorId]);

  return {
    message: mapRow(data as Record<string, unknown>, profileNames, authorId),
    persistent: true,
  };
}

export async function isUserEnrolledInProgram(programId: string, userId: string): Promise<boolean> {
  if (!programId || !userId || !isSupabaseConfigured) return false;

  const supabase = getSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('user_programs')
    .select('id')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .eq('status', 'activa')
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}
