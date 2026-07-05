import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

const CARLOS = {
  email: 'carlos.garcia@hotmail.com',
  password: '5191996Ca',
  name: 'Carlos García',
};

async function applySchema(client) {
  const schemaPath = join(__dirname, '..', 'supabase', 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf8');
  try {
    await client.query(sql);
    console.log('✓ Esquema SQL aplicado');
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
    if (code === '42710' || code === '42P07') {
      console.log('· Parte del esquema ya existía, aplicando Perfil...');
      const ensurePath = join(__dirname, '..', 'supabase', 'ensure-perfil.sql');
      await client.query(readFileSync(ensurePath, 'utf8'));
      console.log('✓ Perfil asegurado');
      return;
    }
    throw error;
  }
}

async function ensureCarlos(client) {
  const { rows } = await client.query(`select id from auth.users where email = $1 limit 1`, [CARLOS.email]);
  let userId = rows[0]?.id;

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
      [CARLOS.email, CARLOS.password, JSON.stringify({ name: CARLOS.name })],
    );
    userId = insert.rows[0].id;
    console.log(`✓ Usuario creado: ${CARLOS.email}`);
  } else {
    await client.query(
      `update auth.users
       set encrypted_password = crypt($2, gen_salt('bf')),
           raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || $3::jsonb,
           email_confirmed_at = coalesce(email_confirmed_at, now())
       where id = $1`,
      [userId, CARLOS.password, JSON.stringify({ name: CARLOS.name })],
    );
    console.log(`· Usuario actualizado: ${CARLOS.email}`);
  }

  await client.query(`
    insert into public."Perfil" (id, name, email, nivel, objetivo, altura, peso, lesiones)
    select id, $2, email, 'intermedio', 'hipertrofia', 178, 79, 'Molestia leve en hombro derecho'
    from auth.users where email = $1
    on conflict (id) do update set
      name = excluded.name,
      email = excluded.email,
      nivel = excluded.nivel,
      objetivo = excluded.objetivo,
      altura = excluded.altura,
      peso = excluded.peso,
      lesiones = excluded.lesiones
  `, [CARLOS.email, CARLOS.name]);

  console.log(`✓ Perfil guardado en public."Perfil"`);
}

async function main() {
  if (!SUPABASE_URL || !PUBLISHABLE_KEY || !DATABASE_URL) {
    throw new Error('Faltan variables en .env');
  }

  const pgClient = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();
  console.log('Conectado a PostgreSQL (pooler)');

  await applySchema(pgClient);
  await ensureCarlos(pgClient);
  await pgClient.end();

  console.log('\nListo. Login en la app:');
  console.log(`  Email: ${CARLOS.email}`);
  console.log(`  Contraseña: ${CARLOS.password}`);
}

main().catch((error) => {
  console.error('Error en setup:', error);
  process.exit(1);
});
