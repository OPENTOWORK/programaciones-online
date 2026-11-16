/**
 * Borra videos de sesión (storage + filas session_log_videos) sin tocar workout_logs.
 *
 * Uso:
 *   node scripts/delete-athlete-session-videos.mjs --email atleta@mail.com --from 2026-08-01 --to 2026-09-01
 *   node scripts/delete-athlete-session-videos.mjs --email atleta@mail.com --from 2026-08-01 --to 2026-09-01 --apply
 */
import 'dotenv/config';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const BUCKET = 'session-videos';
const TABLE = 'session_log_videos';

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

if (!email || !from || !to) {
  console.error(
    'Uso: node scripts/delete-athlete-session-videos.mjs --email atleta@mail.com --from 2026-08-01 --to 2026-09-01 [--by-scheduled-date] [--apply]',
  );
  process.exit(1);
}

const dbUrl = resolveDatabaseUrl(PROJECT_REF);
if (!dbUrl) {
  console.error('No se pudo resolver la URL de la base de datos');
  process.exit(1);
}

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

await client.connect();

try {
  const userRes = await client.query(`select id, email from auth.users where lower(email) = $1`, [email]);
  const user = userRes.rows[0];
  if (!user) {
    console.error(`No hay usuario con email ${email}`);
    process.exit(1);
  }

  const videosRes = byScheduledDate
    ? await client.query(
        `select v.id, v.storage_path, v.file_name, v.workout_log_id, v.created_at, wl.scheduled_date
         from public.${TABLE} v
         join public.workout_logs wl on wl.id = v.workout_log_id
         where v.user_id = $1
           and (timezone('Europe/Madrid', wl.scheduled_date))::date >= $2::date
           and (timezone('Europe/Madrid', wl.scheduled_date))::date < $3::date
         order by wl.scheduled_date, v.created_at`,
        [user.id, from, to],
      )
    : await client.query(
        `select id, storage_path, file_name, workout_log_id, created_at
         from public.${TABLE}
         where user_id = $1
           and created_at >= $2::timestamptz
           and created_at < $3::timestamptz
         order by created_at`,
        [user.id, from, to],
      );

  const videos = videosRes.rows;
  console.log(`Usuario: ${user.email} (${user.id})`);
  console.log(
    `Rango: ${from} → ${to} (exclusivo fin)${byScheduledDate ? ' · por fecha de sesión (Europe/Madrid)' : ' · por fecha de subida'}`,
  );
  console.log(`Videos encontrados: ${videos.length}`);

  if (videos.length === 0) {
    process.exit(0);
  }

  for (const row of videos) {
    const session = row.scheduled_date ? ` sesión=${row.scheduled_date.toISOString?.() ?? row.scheduled_date}` : '';
    console.log(
      `  - ${row.created_at.toISOString?.() ?? row.created_at}${session}  log=${row.workout_log_id}  ${row.file_name}`,
    );
  }

  const logIds = [...new Set(videos.map((v) => v.workout_log_id))];
  const logsRes = await client.query(
    `select count(*)::int as c from public.workout_logs where user_id = $1 and id = any($2::uuid[])`,
    [user.id, logIds],
  );
  console.log(`Registros de sesión (workout_logs) afectados: ${logsRes.rows[0].c} — no se borrarán`);

  if (!apply) {
    console.log('\nModo vista previa. Añade --apply para borrar storage + filas de video.');
    process.exit(0);
  }

  const paths = videos.map((v) => v.storage_path).filter(Boolean);
  const ids = videos.map((v) => v.id);

  const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  let storageRemoved = 0;
  for (const batch of chunk(paths, 50)) {
    const { rowCount: removed } = await client.query(
      `delete from storage.objects where bucket_id = $1 and name = any($2::text[])`,
      [BUCKET, batch],
    );
    storageRemoved += removed ?? 0;
  }

  const { rowCount } = await client.query(`delete from public.${TABLE} where id = any($1::uuid[])`, [ids]);

  console.log(`\nHecho: ${storageRemoved} fichero(s) en storage, ${rowCount} fila(s) en ${TABLE}.`);
  console.log('workout_logs intactos.');
} finally {
  await client.end();
}
