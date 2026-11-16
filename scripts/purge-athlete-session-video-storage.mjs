/**
 * Borra ficheros del bucket session-videos usando la sesión del atleta (RLS).
 * Útil cuando la clave sb_secret no sirve como JWT en la Storage API.
 *
 * Uso:
 *   node scripts/purge-athlete-session-video-storage.mjs --email atleta@mail.com --from 2026-08-01 --to 2026-09-01 --by-scheduled-date [--apply]
 */
import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? `https://${PROJECT_REF}.supabase.co`;
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const BUCKET = 'session-videos';

function readOption(name) {
  const prefix = `--${name}=`;
  const withEquals = process.argv.find((arg) => arg.startsWith(prefix));
  if (withEquals) return withEquals.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];
  return undefined;
}

const email = readOption('email')?.trim().toLowerCase();
const from = readOption('from')?.trim();
const to = readOption('to')?.trim();
const apply = process.argv.includes('--apply');
const byScheduledDate = process.argv.includes('--by-scheduled-date');
const allForUser = process.argv.includes('--all');
const deleteDbRows = process.argv.includes('--delete-db-rows');

if (!email || (!allForUser && (!from || !to))) {
  console.error(
    'Uso: node scripts/purge-athlete-session-video-storage.mjs --email atleta@mail.com [--all | --from 2026-08-01 --to 2026-09-01 --by-scheduled-date] [--delete-db-rows] [--apply]',
  );
  process.exit(1);
}

if (!PUBLISHABLE_KEY) {
  console.error('Falta EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const dbUrl = resolveDatabaseUrl(PROJECT_REF);
if (!dbUrl) {
  console.error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD');
  process.exit(1);
}

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  const userRes = await client.query(
    `select id, encrypted_password from auth.users where lower(email) = $1`,
    [email],
  );
  const user = userRes.rows[0];
  if (!user?.encrypted_password) {
    console.error('Usuario sin contraseña (no se puede impersonar para Storage RLS).');
    process.exit(1);
  }

  let paths = [];
  if (allForUser) {
    const r = await client.query(
      `select name from storage.objects where bucket_id = $1 and name like $2 order by name`,
      [BUCKET, `${user.id}/%`],
    );
    paths = r.rows.map((row) => row.name);
  } else if (byScheduledDate) {
    const r = await client.query(
      `select distinct o.name
       from storage.objects o
       join session_log_videos v on v.storage_path = o.name
       join workout_logs wl on wl.id = v.workout_log_id
       where v.user_id = $1
         and o.bucket_id = $2
         and (timezone('Europe/Madrid', wl.scheduled_date))::date >= $3::date
         and (timezone('Europe/Madrid', wl.scheduled_date))::date < $4::date`,
      [user.id, BUCKET, from, to],
    );
    paths = r.rows.map((row) => row.name);

    const orphanRes = await client.query(
      `select o.name
       from storage.objects o
       left join session_log_videos v on v.storage_path = o.name
       join workout_logs wl on wl.id::text = split_part(o.name, '/', 2)
       where o.bucket_id = $1
         and o.name like $2
         and v.id is null
         and (timezone('Europe/Madrid', wl.scheduled_date))::date >= $3::date
         and (timezone('Europe/Madrid', wl.scheduled_date))::date < $4::date`,
      [BUCKET, `${user.id}/%`, from, to],
    );
    paths = [...new Set([...paths, ...orphanRes.rows.map((row) => row.name)])];
  } else {
    const r = await client.query(
      `select distinct storage_path as name from session_log_videos
       where user_id = $1 and created_at >= $2::timestamptz and created_at < $3::timestamptz`,
      [user.id, from, to],
    );
    paths = r.rows.map((row) => row.name);
  }

  console.log(`Atleta: ${email}`);
  console.log(`Ficheros en Storage a borrar: ${paths.length}`);
  for (const path of paths) console.log(`  - ${path}`);

  if (paths.length === 0) {
    process.exit(0);
  }

  if (!apply) {
    console.log('\nVista previa. Añade --apply para borrar en Supabase Storage.');
    process.exit(0);
  }

  const tempPassword = `tmp-${randomBytes(18).toString('base64url')}`;
  const savedHash = user.encrypted_password;

  await client.query(`update auth.users set encrypted_password = crypt($2, gen_salt('bf')) where id = $1`, [
    user.id,
    tempPassword,
  ]);

  const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: tempPassword,
  });

  if (signInError || !signIn.session) {
    await client.query(`update auth.users set encrypted_password = $2 where id = $1`, [user.id, savedHash]);
    console.error('No se pudo iniciar sesión como atleta:', signInError?.message ?? 'sin sesión');
    process.exit(1);
  }

  let removed = 0;
  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100);
    const { data, error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) {
      await client.query(`update auth.users set encrypted_password = $2 where id = $1`, [user.id, savedHash]);
      await supabase.auth.signOut();
      console.error('Error borrando en Storage:', error.message);
      process.exit(1);
    }
    removed += data?.length ?? batch.length;
  }

  await supabase.auth.signOut();
  await client.query(`update auth.users set encrypted_password = $2 where id = $1`, [user.id, savedHash]);

  const left = await client.query(
    `select count(*)::int c, coalesce(sum((metadata->>'size')::bigint),0)::bigint bytes
     from storage.objects where bucket_id=$1 and name like $2`,
    [BUCKET, `${user.id}/%`],
  );
  console.log(`\nHecho: ${removed} objeto(s) eliminado(s) de Supabase Storage.`);
  console.log(
    `Quedan ${left.rows[0].c} ficheros (${(Number(left.rows[0].bytes) / 1024 / 1024).toFixed(1)} MB) en session-videos para este atleta.`,
  );

  if (deleteDbRows) {
    let deletedRows = 0;
    if (allForUser) {
      const del = await client.query(`delete from session_log_videos where user_id = $1`, [user.id]);
      deletedRows = del.rowCount ?? 0;
    } else if (byScheduledDate) {
      const del = await client.query(
        `delete from session_log_videos v
         using workout_logs wl
         where v.workout_log_id = wl.id
           and v.user_id = $1
           and (timezone('Europe/Madrid', wl.scheduled_date))::date >= $2::date
           and (timezone('Europe/Madrid', wl.scheduled_date))::date < $3::date`,
        [user.id, from, to],
      );
      deletedRows = del.rowCount ?? 0;
    } else {
      const del = await client.query(
        `delete from session_log_videos
         where user_id = $1 and created_at >= $2::timestamptz and created_at < $3::timestamptz`,
        [user.id, from, to],
      );
      deletedRows = del.rowCount ?? 0;
    }
    console.log(`Filas session_log_videos borradas: ${deletedRows} (workout_logs intactos).`);
  }
} finally {
  await client.end();
}
