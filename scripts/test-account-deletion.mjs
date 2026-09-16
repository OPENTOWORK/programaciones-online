/**
 * Prueba de punta a punta del borrado de cuenta.
 *
 * Crea un usuario desechable por SQL, le siembra datos, inicia sesión como él
 * con la clave pública y llama a `delete_own_account()`. Después comprueba que
 * no queda nada y que la función no es accesible sin sesión.
 *
 *   node scripts/test-account-deletion.mjs
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

const TEST_EMAIL = `borrado-test-${Date.now()}@trainingprogline.test`;
const TEST_PASSWORD = `Test-${Math.random().toString(36).slice(2)}-${Date.now()}`;

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) return null;
  const host = process.env.SUPABASE_DB_HOST?.trim() || `db.${PROJECT_REF}.supabase.co`;
  const user = process.env.SUPABASE_DB_USER?.trim() || 'postgres';
  const database = process.env.SUPABASE_DB_NAME?.trim() || 'postgres';
  const port = process.env.SUPABASE_DB_PORT?.trim() || '5432';
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

const checks = [];
function check(label, passed, detail = '') {
  checks.push({ label, passed });
  console.log(`  ${passed ? 'OK   ' : 'FALLA'} ${label}${detail ? ` — ${detail}` : ''}`);
}

async function countRows(db, sql, params) {
  const { rowCount } = await db.query(sql, params);
  return rowCount;
}

async function main() {
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en .env');
  }

  const db = new pg.Client({
    connectionString: resolveDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
  });
  await db.connect();
  await db.query('create extension if not exists pgcrypto with schema extensions');

  // Restos de ejecuciones anteriores que fallaron a mitad.
  const { rowCount: stale } = await db.query(
    `delete from auth.users where email like 'borrado-test-%@trainingprogline.test'`,
  );
  if (stale > 0) console.log(`\n0. Limpiando ${stale} usuario(s) de pruebas anteriores`);

  console.log(`\n1. Creando usuario de prueba ${TEST_EMAIL}`);
  // GoTrue falla con "Database error querying schema" si las columnas de token
  // son NULL, así que van como cadena vacía.
  const { rows: inserted } = await db.query(
    `insert into auth.users (
       instance_id, id, aud, role, email, encrypted_password,
       email_confirmed_at, created_at, updated_at,
       raw_app_meta_data, raw_user_meta_data,
       confirmation_token, recovery_token, email_change,
       email_change_token_new, email_change_token_current,
       phone_change, phone_change_token, reauthentication_token
     ) values (
       '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       $1, extensions.crypt($2, extensions.gen_salt('bf')),
       now(), now(), now(),
       '{"provider":"email","providers":["email"]}'::jsonb,
       jsonb_build_object('name', 'Borrado Test'),
       '', '', '', '', '', '', '', ''
     )
     returning id`,
    [TEST_EMAIL, TEST_PASSWORD],
  );
  const userId = inserted[0].id;
  console.log(`   id: ${userId}`);

  await db.query(
    `insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
     values ($1::text, $2::uuid, jsonb_build_object('sub', $3::text, 'email', $4::text), 'email', now(), now(), now())`,
    [userId, userId, userId, TEST_EMAIL],
  );

  console.log('\n2. Sembrando datos del usuario');
  const { rows: roleRows } = await db.query(`select id from public.roles where slug = 'atleta' limit 1`);
  await db.query(
    `insert into public."Perfil" (id, name, email, id_roles) values ($1, $2, $3, $4)
     on conflict (id) do update set name = excluded.name`,
    [userId, 'Borrado Test', TEST_EMAIL, roleRows[0]?.id ?? null],
  );
  await db.query(
    `insert into public.workout_logs (user_id, workout_name, completed_at)
     values ($1, 'Sesión de prueba', now())`,
    [userId],
  );
  await db.query(
    `insert into public.fotos (user_id, tipo, storage_path) values ($1, 'antes', $2)`,
    [userId, `${userId}/antes.jpg`],
  );

  console.log('\n3. Iniciando sesión como el usuario');
  const asUser = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: signIn, error: signInError } = await asUser.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (!signIn?.session) {
    // El SDK a veces devuelve un error vacío; la respuesta cruda sí lo explica.
    const raw = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    console.log(`   respuesta cruda ${raw.status}: ${(await raw.text()).slice(0, 300)}`);
  }

  check('el usuario puede iniciar sesión', Boolean(signIn?.session), signInError?.message ?? '');
  if (!signIn?.session) throw new Error('Sin sesión no se puede seguir con la prueba');

  // Sube un fichero real como el usuario, para probar el borrado de Storage
  // por la misma vía que usa la app.
  const photoPath = `${userId}/antes.jpg`;
  const { error: uploadError } = await asUser.storage
    .from('fotos')
    .upload(photoPath, new Uint8Array([1, 2, 3, 4]), { contentType: 'image/jpeg', upsert: true });
  check('el usuario puede subir una foto', !uploadError, uploadError?.message ?? '');
  console.log(
    `   Perfil: ${await countRows(db, 'select 1 from public."Perfil" where id = $1', [userId])}` +
      ` · workout_logs: ${await countRows(db, 'select 1 from public.workout_logs where user_id = $1', [userId])}` +
      ` · fotos: ${await countRows(db, 'select 1 from public.fotos where user_id = $1', [userId])}` +
      ` · storage.objects: ${await countRows(db, 'select 1 from storage.objects where name like $1', [`${userId}/%`])}`,
  );

  console.log('\n4. Borrando ficheros por la Storage API y llamando a delete_own_account()');
  const { error: removeError } = await asUser.storage.from('fotos').remove([photoPath]);
  check('el usuario puede borrar su propia foto', !removeError, removeError?.message ?? '');

  const { error: rpcError } = await asUser.rpc('delete_own_account');
  check('delete_own_account() se ejecuta sin error', !rpcError, rpcError?.message ?? '');

  console.log('\n5. Comprobando que no queda nada');
  const remaining = {
    'auth.users': await countRows(db, 'select 1 from auth.users where id = $1', [userId]),
    'Perfil (cascada)': await countRows(db, 'select 1 from public."Perfil" where id = $1', [userId]),
    'workout_logs (cascada)': await countRows(db, 'select 1 from public.workout_logs where user_id = $1', [userId]),
    'fotos (cascada)': await countRows(db, 'select 1 from public.fotos where user_id = $1', [userId]),
    'storage.objects': await countRows(db, 'select 1 from storage.objects where name like $1', [`${userId}/%`]),
    'auth.identities (cascada)': await countRows(db, 'select 1 from auth.identities where user_id = $1', [userId]),
    'auth.sessions (cascada)': await countRows(db, 'select 1 from auth.sessions where user_id = $1', [userId]),
  };
  for (const [label, count] of Object.entries(remaining)) {
    check(`${label} vacío`, count === 0, count === 0 ? '' : `quedan ${count} filas`);
  }

  console.log('\n6. Comprobando que el token antiguo ya no sirve');
  const { error: reuseError } = await asUser.auth.getUser(signIn.session.access_token);
  check('el token antiguo es rechazado', Boolean(reuseError), reuseError?.message ?? 'seguía siendo válido');

  console.log('\n7. Comprobando que sin sesión no se puede llamar');
  const asAnon = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: anonError } = await asAnon.rpc('delete_own_account');
  check('anon no puede ejecutarla', Boolean(anonError), anonError?.message ?? 'la ejecutó sin sesión');

  // Limpieza por si alguna comprobación falló y quedaron restos.
  await db.query('delete from auth.users where id = $1', [userId]);
  await db.end();

  const failed = checks.filter((item) => !item.passed);
  console.log(
    `\n${failed.length === 0 ? 'TODO OK' : `${failed.length} COMPROBACIONES FALLIDAS`}` +
      ` (${checks.length - failed.length}/${checks.length})`,
  );
  if (failed.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error('\nError:', error.message ?? error);
  process.exit(1);
});
