import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';
import pg from 'pg';
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
  return {
    file: fileIndex >= 0 ? argv[fileIndex + 1] : 'aimharder-calendar.json',
    fetch: argv.includes('--fetch'),
    from: argv.includes('--from') ? argv[argv.indexOf('--from') + 1] : null,
    to: argv.includes('--to') ? argv[argv.indexOf('--to') + 1] : null,
    probeApi: argv.includes('--probe-api'),
    probeAll: argv.includes('--probe-all'),
    probeLimit: argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : 25,
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

async function main() {
  const { file, fetch, from, to, probeApi, probeAll, probeLimit } = parseArgs(process.argv.slice(2));

  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  if (fetch) {
    fetchCalendar({ file, from, to });
  }

  if (!existsSync(file)) {
    throw new Error(`No existe ${file}. Ejecuta con --fetch o pasa --file ruta/al/calendario.json`);
  }

  const calendar = JSON.parse(readFileSync(file, 'utf8'));
  const catalog = collectExerciseCatalog(calendar);
  let entries = extractVideosFromAimHarderData(calendar);

  console.log(`Ejercicios en calendario: ${catalog.size}`);
  console.log(`Vídeos embebidos en calendario: ${entries.length}`);

  const cookie = buildCookieHeader();

  if (probeApi || entries.length === 0) {
    if (!cookie) {
      throw new Error(
        'Falta AIMHARDER_SESSION en .env. El calendario trae ejerId pero no YouTube; hace falta la misma cookie con la que exportaste getRatesCalendar.',
      );
    }

    entries = await fetchExerciseVideosForCatalog({
      box: BOX,
      cookie,
      catalog,
      limit: probeAll ? null : probeLimit,
      onProgress: ({ phase, endpoint, count, name }) => {
        if (phase === 'catalog') {
          console.log(`✓ Catálogo ${endpoint}: ${count} vídeos`);
        } else if (name) {
          console.log(`  ✓ ${name}`);
        }
      },
    });
  }

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const sql = readFileSync(join(__dirname, '..', 'supabase', 'exercise-videos.sql'), 'utf8');
    await client.query(sql);

    const upserted = await upsertExerciseVideos(client, entries);
    console.log(`✓ ${upserted} videos guardados en ejercicios_videos`);

    if (upserted === 0) {
      console.log(
        '\nEl JSON del calendario no incluye vídeos (videoId=null en todos los ejercicios).\n' +
          'AimHarder los sirve con otra petición autenticada. Añade AIMHARDER_SESSION al .env y ejecuta:\n' +
          '  npm run aimharder:videos -- --file "ruta/al/calendario.json" --probe-api --probe-all',
      );
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
