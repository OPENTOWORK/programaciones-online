import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ||
  'https://nsdurlikkuoxqobabixr.supabase.co';
const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  'sb_publishable_GZfJfr6RdAgbu9W9fy1O1Q_8DAgtf0k';

const email = (process.argv[2] || '').trim().toLowerCase();
if (!email) {
  console.error('Uso: node scripts/send-password-reset.mjs email@dominio.com');
  process.exit(1);
}

const redirectTo = 'programaciones-online:///auth/update-password';

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log('Enviando email de recuperación a:', email);
console.log('Redirect:', redirectTo);

const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

console.log('OK — Supabase ha aceptado el envío. Revisa bandeja de entrada y spam.');
