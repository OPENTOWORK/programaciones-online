import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ||
  'https://nsdurlikkuoxqobabixr.supabase.co';
const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  'sb_publishable_GZfJfr6RdAgbu9W9fy1O1Q_8DAgtf0k';

const email = process.argv[2] ?? 'carlosgarciacano87@gmail.com';
const password = process.argv[3] ?? '__wrong_password_test__';

console.log('URL:', url);
console.log('Key prefix:', anonKey.slice(0, 12) + '…');
console.log('Email:', email);
console.log('---');

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

try {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.log('signIn error:', error.message);
    console.log('status:', error.status);
    console.log('code:', error.code);
  } else {
    console.log('signIn OK, user:', data.user?.id);
    const userId = data.user.id;
    const { data: profile, error: profileError } = await supabase
      .from('Perfil')
      .select('*, roles(slug)')
      .eq('id', userId)
      .maybeSingle();
    if (profileError) {
      console.log('profile error:', profileError.message, profileError.code);
    } else {
      console.log('profile:', profile?.email, profile?.name, profile?.roles);
    }
  }
} catch (err) {
  console.error('EXCEPTION:', err?.name, err?.message);
}
