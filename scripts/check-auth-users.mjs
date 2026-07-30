import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const emails = ['carlosgarciacano@gmail.com', 'direccion@opentowork.com'];

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', url);
console.log('Anon key configured:', Boolean(anonKey));

const supabase = createClient(url, anonKey);

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const users = await client.query(
  `select id, email, email_confirmed_at, created_at, last_sign_in_at, confirmed_at
   from auth.users
   where lower(email) = any($1::text[])`,
  [emails.map((email) => email.toLowerCase())],
);

console.log('\n=== auth.users ===');
for (const row of users.rows) {
  console.log(row);
}

const perfil = await client.query(
  `select p.id, p.email, p.name, r.slug as role
   from "Perfil" p
   left join roles r on r.id = p.id_roles
   where lower(p.email) = any($1::text[])`,
  [emails.map((email) => email.toLowerCase())],
);

console.log('\n=== Perfil ===');
for (const row of perfil.rows) {
  console.log(row);
}

console.log('\n=== RPC is_email_registered ===');
for (const email of emails) {
  const { data, error } = await supabase.rpc('is_email_registered', { check_email: email });
  console.log(email, '=>', data, error?.message ?? 'ok');
}

await client.end();
