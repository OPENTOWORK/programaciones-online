import 'dotenv/config';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';

const email = (process.argv[2] || '').trim().toLowerCase();
const password = process.argv[3] || '';
const roleSlug = (process.argv[4] || 'entrenador').trim().toLowerCase();
const name = (process.argv[5] || '').trim();

if (!email || !password) {
  console.error('Uso: node scripts/create-auth-user.mjs email@dominio.com contraseña [atleta|entrenador|administrador] [nombre]');
  process.exit(1);
}

const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
if (!databaseUrl) {
  console.error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD en .env');
  process.exit(1);
}

const displayName = name || email.split('@')[0];

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const existing = await client.query(
  `select id, email, email_confirmed_at
   from auth.users
   where lower(email) = lower($1)
   limit 1`,
  [email],
);

let userId = existing.rows[0]?.id;

if (!userId) {
  const insert = await client.query(
    `insert into auth.users (
       instance_id, id, aud, role, email, encrypted_password,
       email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
       created_at, updated_at, confirmation_token, recovery_token,
       email_change_token_new, email_change
     )
     values (
       '00000000-0000-0000-0000-000000000000',
       gen_random_uuid(),
       'authenticated',
       'authenticated',
       $1,
       crypt($2, gen_salt('bf')),
       now(),
       '{"provider":"email","providers":["email"]}'::jsonb,
       $3::jsonb,
       now(),
       now(),
       '', '', '', ''
     )
     returning id`,
    [email, password, JSON.stringify({ name: displayName })],
  );
  userId = insert.rows[0].id;
  console.log(`✓ Usuario creado: ${email}`);
} else {
  await client.query(
    `update auth.users
     set encrypted_password = crypt($2, gen_salt('bf')),
         email_confirmed_at = coalesce(email_confirmed_at, now()),
         raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || $3::jsonb
     where id = $1`,
    [userId, password, JSON.stringify({ name: displayName })],
  );
  console.log(`✓ Usuario actualizado: ${email}`);
}

const roleRes = await client.query('select id from roles where slug = $1 limit 1', [roleSlug]);
if (roleRes.rows.length === 0) {
  throw new Error(`Rol no encontrado: ${roleSlug}`);
}

await client.query(
  `insert into public."Perfil" (id, email, name, id_roles)
   values ($1, $2, $3, $4)
   on conflict (id) do update set
     email = excluded.email,
     name = excluded.name,
     id_roles = excluded.id_roles`,
  [userId, email, displayName, roleRes.rows[0].id],
);

const verify = await client.query(
  `select p.email, p.name, r.slug as role, u.email_confirmed_at is not null as email_confirmado
   from public."Perfil" p
   join auth.users u on u.id = p.id
   left join roles r on r.id = p.id_roles
   where p.id = $1`,
  [userId],
);

console.log('✓ Perfil listo:', verify.rows[0]);

await client.end();
