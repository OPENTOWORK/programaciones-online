import 'dotenv/config';
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  update auth.users
  set encrypted_password = crypt('5191996Ca', gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"name":"Carlos García"}'::jsonb
  where email = 'direccion@opentowork.com'
`);

await client.query(`
  insert into public."Perfil" (id, name, email, nivel, objetivo, altura, peso)
  select id, 'Carlos García', email, 'intermedio', 'hipertrofia', 178, 79
  from auth.users where email = 'direccion@opentowork.com'
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email
`);

console.log('✓ direccion@opentowork.com confirmado con contraseña 5191996Ca');
await client.end();
