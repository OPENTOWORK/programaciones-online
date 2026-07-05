import type { SupabaseClient } from '@supabase/supabase-js';

export function hasRecoveryUrlParams() {
  if (typeof window === 'undefined') {
    return false;
  }

  const { hash, search, pathname } = window.location;
  return (
    pathname.includes('update-password') ||
    hash.includes('type=recovery') ||
    search.includes('type=recovery') ||
    search.includes('code=')
  );
}

export async function waitForRecoverySession(
  supabase: SupabaseClient,
  timeoutMs = 8000,
): Promise<boolean> {
  const { data: initial } = await supabase.auth.getSession();
  if (initial.session) {
    return true;
  }

  if (!hasRecoveryUrlParams()) {
    return false;
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription.unsubscribe();
      resolve(value);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
      ) {
        finish(true);
      }
    });

    const poll = async () => {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          finish(true);
          return;
        }

        await new Promise((r) => setTimeout(r, 250));
      }

      finish(false);
    };

    void poll();

    const timer = setTimeout(() => finish(false), timeoutMs);
  });
}
