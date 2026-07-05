import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';
import pg from 'pg';
import { parseAimHarderCalendar } from './lib/aimharderParser.mjs';
import { AIMHARDER_TRACKS } from './lib/aimharderTracks.mjs';
import {
  collectExerciseCatalog,
  extractVideosFromAimHarderData,
  fetchExerciseVideosForCatalog,
} from './lib/aimharderVideoExtract.mjs';
import { upsertExerciseVideos } from './lib/aimharderVideoUpsert.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = process.env.DATABASE_URL;
const BOX = process.env.AIMHARDER_BOX || 'opentowork';

function parseArgs(argv) {
  const fileIndex = argv.indexOf('--file');
  const dateIndex = argv.indexOf('--date');
  const fromIndex = argv.indexOf('--from');
  const toIndex = argv.indexOf('--to');

  return {
    file: fileIndex >= 0 ? argv[fileIndex + 1] : 'aimharder-calendar.json',
    date: dateIndex >= 0 ? argv[dateIndex + 1] : null,
    fetch: argv.includes('--fetch'),
    videos: argv.includes('--videos'),
    from: fromIndex >= 0 ? argv[fromIndex + 1] : null,
    to: toIndex >= 0 ? argv[toIndex + 1] : null,
  };
}

function buildCookieHeader() {
  const session = process.env.AIMHARDER_SESSION || process.env.AIMHARDER_PHPSESSID || '';
  if (!session) return '';
  return session.includes('=') ? session : `PHPSESSID=${session}`;
}

function fetchCalendar({ file, from, to }) {
  const args = ['scripts/fetch-aimharder-calendar.mjs', '--out', file];
  if (from) args.push('--from', from);
  if (to) args.push('--to', to);

  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: join(__dirname, '..'),
  });

  if (result.status !== 0) {
    throw new Error('No se pudo descargar el calendario de AimHarder.');
  }
}

async function applySql(client, filename) {
  const sql = readFileSync(join(__dirname, '..', 'supabase', filename), 'utf8');
  await client.query(sql);
}

async function loadTrackPrograms(client) {
  const planResult = await client.query(
    `select id
     from public.planes
     where lower(descripcion) like '%hype%' or lower(descripcion) like '%intensiv%'
     order by descripcion
     limit 1`,
  );

  let planId = planResult.rows[0]?.id;

  if (!planId) {
    const insertedPlan = await client.query(
      `insert into public.planes (descripcion)
       values ('Hype / Intensivas')
       returning id`,
    );
    planId = insertedPlan.rows[0].id;
    console.log('✓ Plan Hype / Intensivas creado');
  }

  const programResult = await client.query(
    `select id, name
     from public.programas
     where id_planes = $1`,
    [planId],
  );

  const programIds = new Map(
    programResult.rows.map((row) => [row.name.trim().toLowerCase(), row.id]),
  );

  for (const track of AIMHARDER_TRACKS) {
    const key = track.programName.toLowerCase();
    if (programIds.has(key)) continue;

    const insertedProgram = await client.query(
      `insert into public.programas (name, id_planes)
       values ($1, $2)
       returning id, name`,
      [track.programName, planId],
    );

    programIds.set(key, insertedProgram.rows[0].id);
    console.log(`✓ Programa ${track.programName} creado`);
  }

  const missing = AIMHARDER_TRACKS.filter((track) => !programIds.has(track.programName.toLowerCase()));
  if (missing.length > 0) {
    throw new Error(`Faltan programas en Supabase: ${missing.map((track) => track.programName).join(', ')}`);
  }

  return programIds;
}

async function upsertWorkout(client, programId, workout) {
  const entrenoResult = await client.query(
    `insert into public.entrenos_diarios (
       program_id, workout_date, aimharder_rate_id, name, day_label,
       estimated_duration, warmup, main_part, core_part, cooldown, synced_at
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
     on conflict (workout_date, aimharder_rate_id)
     do update set
       program_id = excluded.program_id,
       name = excluded.name,
       day_label = excluded.day_label,
       estimated_duration = excluded.estimated_duration,
       warmup = excluded.warmup,
       main_part = excluded.main_part,
       core_part = excluded.core_part,
       cooldown = excluded.cooldown,
       synced_at = now()
     returning id`,
    [
      programId,
      workout.workoutDate,
      workout.aimharderRateId,
      workout.name,
      workout.dayLabel,
      workout.estimatedDuration,
      workout.warmup,
      workout.mainPart,
      workout.corePart,
      workout.cooldown,
    ],
  );

  const entrenoId = entrenoResult.rows[0].id;

  await client.query(`delete from public.entrenos_ejercicios where entreno_id = $1`, [entrenoId]);

  for (const exercise of workout.exercises) {
    await client.query(
      `insert into public.entrenos_ejercicios (
         entreno_id, sort_order, name, sets, reps, rest, notes, aimharder_ejer_id
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        entrenoId,
        exercise.sortOrder,
        exercise.name,
        exercise.sets,
        exercise.reps,
        exercise.rest,
        exercise.notes ?? null,
        exercise.aimharderEjerId ?? null,
      ],
    );
  }

  return entrenoId;
}

async function syncExerciseVideos(client, raw, { videos }) {
  const videoEntries = extractVideosFromAimHarderData(raw);
  let entries = videoEntries;

  const cookie = buildCookieHeader();
  if (videos) {
    if (!cookie) {
      console.log(
        '⚠ Sin AIMHARDER_SESSION: el calendario no incluye vídeos de YouTube (videoId viene vacío).',
      );
      console.log('  Añade PHPSESSID al .env y vuelve a ejecutar con --videos.');
    } else {
      const catalog = collectExerciseCatalog(raw);
      console.log(`Consultando vídeos de AimHarder (${catalog.size} ejercicios del calendario)...`);
      entries = await fetchExerciseVideosForCatalog({
        box: BOX,
        cookie,
        catalog,
        onProgress: ({ phase, endpoint, count, name }) => {
          if (phase === 'catalog') {
            console.log(`  ✓ Catálogo ${endpoint}: ${count} vídeos`);
          } else if (name) {
            console.log(`  ✓ ${name}`);
          }
        },
      });
    }
  }

  const videoCount = await upsertExerciseVideos(client, entries);
  if (videoCount > 0) {
    console.log(`✓ ${videoCount} videos de ejercicios sincronizados`);
  } else if (videos) {
    console.log('⚠ No se importaron vídeos. Comprueba que la sesión siga activa en AimHarder.');
  }

  return videoCount;
}

async function main() {
  const { file, date, fetch, videos, from, to } = parseArgs(process.argv.slice(2));

  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  if (fetch) {
    fetchCalendar({ file, from, to });
  }

  if (!file) {
    throw new Error(
      'Uso: node scripts/sync-aimharder.mjs --file ruta/al/aimharder-calendar.json [--date YYYY-MM-DD]\n' +
        '     node scripts/sync-aimharder.mjs --fetch [--from YYYY-MM-DD] [--to YYYY-MM-DD]',
    );
  }

  const raw = JSON.parse(readFileSync(file, 'utf8'));
  let workouts = parseAimHarderCalendar(raw);

  if (date) {
    workouts = workouts.filter((workout) => workout.workoutDate === date);
  }

  if (workouts.length === 0) {
    console.log('No se encontraron entrenos de AimHarder en el archivo.');
    return;
  }

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await applySql(client, 'aimharder-sync.sql');
    await applySql(client, 'exercise-videos.sql');
    const programIds = await loadTrackPrograms(client);
    const totals = new Map();
    await syncExerciseVideos(client, raw, { videos: videos || fetch });

    for (const workout of workouts) {
      const programId = programIds.get(workout.programName.toLowerCase());
      if (!programId) {
        throw new Error(`No hay programa configurado para ${workout.programName}`);
      }

      await upsertWorkout(client, programId, workout);
      totals.set(workout.programName, (totals.get(workout.programName) ?? 0) + 1);
      console.log(
        `✓ [${workout.programName}] ${workout.workoutDate} · ${workout.name} (${workout.exercises.length} ejercicios)`,
      );
    }

    console.log(`\nSincronizados ${workouts.length} entrenos:`);
    for (const track of AIMHARDER_TRACKS) {
      const count = totals.get(track.programName) ?? 0;
      if (count > 0) {
        console.log(`  · ${track.programName}: ${count}`);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
