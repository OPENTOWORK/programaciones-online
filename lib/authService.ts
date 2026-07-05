import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type EmailCheckResult =
  | { status: 'registered' }
  | { status: 'not_registered' }
  | { status: 'unavailable' };

export async function checkEmailRegistered(email: string): Promise<EmailCheckResult> {
  if (!isSupabaseConfigured) {
    return { status: 'unavailable' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { status: 'unavailable' };
  }

  const { data, error } = await supabase.rpc('is_email_registered', {
    check_email: email.trim(),
  });

  if (!error) {
    return data ? { status: 'registered' } : { status: 'not_registered' };
  }

  const message = error.message.toLowerCase();
  const rpcMissing =
    error.code === 'PGRST202' ||
    message.includes('is_email_registered') ||
    message.includes('could not find the function');

  if (rpcMissing) {
    return { status: 'unavailable' };
  }

  return { status: 'unavailable' };
}
