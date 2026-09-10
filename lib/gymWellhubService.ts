import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isWellhubPlanName } from '@/lib/gymWellhub';

const MIGRATION_HINT = 'Falta aplicar Wellhub en Supabase: ejecuta npm run supabase:gym-wellhub';

type PgError = { message?: string } | null | undefined;

function friendlyError(error: PgError, fallback: string) {
  const message = error?.message ?? '';
  if (/wellhub|signup_source|does not exist|schema cache/i.test(message)) {
    return MIGRATION_HINT;
  }
  return message || fallback;
}

export async function fetchWellhubPlanMemberIds(gymId: string): Promise<Set<string>> {
  const supabase = getSupabase();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from('gym_member_memberships')
    .select('member_id, status, gym_membership_plans(name)')
    .eq('gym_id', gymId)
    .eq('status', 'active');

  if (error || !data) return new Set();

  const ids = new Set<string>();
  for (const row of data as Array<{
    member_id?: string;
    gym_membership_plans?: { name?: string } | Array<{ name?: string }> | null;
  }>) {
    if (!row.member_id) continue;
    const planRow = Array.isArray(row.gym_membership_plans)
      ? row.gym_membership_plans[0]
      : row.gym_membership_plans;
    if (isWellhubPlanName(planRow?.name)) ids.add(row.member_id);
  }

  return ids;
}

export async function fetchWellhubWebhookConfig(
  gymId: string,
): Promise<{ secret?: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.rpc('get_wellhub_webhook_config', {
    target_gym: gymId,
  });

  if (error) return { error: friendlyError(error, 'No se pudo cargar la configuración de Wellhub.') };

  const row = Array.isArray(data) ? data[0] : data;
  const secret =
    row && typeof row === 'object' && 'webhook_secret' in row
      ? String((row as { webhook_secret?: string }).webhook_secret ?? '')
      : '';

  return { secret: secret || undefined };
}

export async function rotateWellhubWebhookSecret(
  gymId: string,
): Promise<{ secret?: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.rpc('rotate_wellhub_webhook_secret', {
    target_gym: gymId,
  });

  if (error) return { error: friendlyError(error, 'No se pudo generar la clave de Wellhub.') };
  return { secret: typeof data === 'string' ? data : undefined };
}

export function buildWellhubWebhookUrl() {
  if (!isSupabaseConfigured) return '';
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!base) return '';
  return `${base}/functions/v1/wellhub-member`;
}
