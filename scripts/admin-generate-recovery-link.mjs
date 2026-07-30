import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ||
  'https://nsdurlikkuoxqobabixr.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const email = (process.argv[2] || '').trim().toLowerCase();
if (!email) {
  console.error('Uso: node scripts/admin-generate-recovery-link.mjs email@dominio.com');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('Falta SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const redirectTo = 'programaciones-online:///auth/update-password';

const admin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin.auth.admin.generateLink({
  type: 'recovery',
  email,
  options: { redirectTo },
});

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

console.log('Usuario:', data.user?.email);
console.log('Email confirmado:', Boolean(data.user?.email_confirmed_at));
console.log('\nEnlace de recuperación (ábrelo en el móvil con la app instalada):');
console.log(data.properties?.action_link ?? '(sin enlace)');
