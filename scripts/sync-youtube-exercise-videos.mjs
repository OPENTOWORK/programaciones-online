import 'dotenv/config';
import pg from 'pg';
import {
  fetchChannelVideos,
  fetchChannelVideosViaApi,
  searchYoutubeVideosViaApi,
  searchYoutubeVideosViaHtml,
} from './lib/youtubeClient.mjs';
import {
  buildSearchQuery,
  findBestVideoMatch,
  shouldSkipExercise,
} from './lib/youtubeExerciseMatch.mjs';
import { normalizeExerciseName } from './lib/aimharderVideoExtract.mjs';
import { upsertExerciseVideos } from './lib/aimharderVideoUpsert.mjs';

const DATABASE_URL = process.env.DATABASE_URL;
const PRIMARY_CHANNEL_ID =
  process.env.YOUTUBE_PRIMARY_CHANNEL_ID || 'UCG8mx9hKMAP1FwFmnzW5rKA';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    force: argv.includes('--force'),
    limit: argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : null,
  };
}

async function loadExercises(client) {
  const result = await client.query(
    `select distinct name, max(aimharder_ejer_id) as aimharder_ejer_id
     from public.entrenos_ejercicios
     group by name
     order by name`,
  );

  const byKey = new Map();
  for (const row of result.rows) {
    const nameKey = normalizeExerciseName(row.name);
    if (!nameKey || byKey.has(nameKey)) continue;
    byKey.set(nameKey, {
      name: row.name,
      aimharderEjerId:
        row.aimharder_ejer_id != null ? Number(row.aimharder_ejer_id) : undefined,
      nameKey,
    });
  }

  return [...byKey.values()];
}

async function loadExistingVideoKeys(client) {
  const result = await client.query('select name_key from public.ejercicios_videos');
  return new Set(result.rows.map((row) => row.name_key));
}

async function loadPrimaryChannelVideos() {
  if (YOUTUBE_API_KEY) {
    console.log('Cargando vídeos del canal HY-PE (YouTube Data API)...');
    return fetchChannelVideosViaApi(YOUTUBE_API_KEY, PRIMARY_CHANNEL_ID);
  }

  console.log('Cargando vídeos del canal HY-PE (Train with HY-PE)...');
  return fetchChannelVideos(PRIMARY_CHANNEL_ID);
}

async function searchFallbackVideo(exerciseName) {
  const query = buildSearchQuery(exerciseName);

  if (YOUTUBE_API_KEY) {
    const apiResults = await searchYoutubeVideosViaApi(YOUTUBE_API_KEY, query, { limit: 6 });
    const apiMatch = findBestVideoMatch(exerciseName, apiResults, { minScore: 50 });
    if (apiMatch) return { ...apiMatch, source: 'youtube-api' };
  }

  const htmlResults = await searchYoutubeVideosViaHtml(query);
  const htmlMatch = findBestVideoMatch(exerciseName, htmlResults, { minScore: 50 });
  if (htmlMatch) return { ...htmlMatch, source: 'youtube-search' };

  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { dryRun, force, limit } = parseArgs(process.argv.slice(2));

  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const exercises = await loadExercises(client);
    const existingKeys = force ? new Set() : await loadExistingVideoKeys(client);
    const channelVideos = await loadPrimaryChannelVideos();

    console.log(`Canal HY-PE: ${channelVideos.length} vídeos`);
    console.log(`Ejercicios en BD: ${exercises.length}`);

    const targets = exercises.filter((exercise) => {
      if (shouldSkipExercise(exercise.name)) return false;
      if (!force && existingKeys.has(exercise.nameKey)) return false;
      return true;
    });

    const worklist = limit ? targets.slice(0, limit) : targets;
    console.log(`A emparejar: ${worklist.length}`);

    const entries = [];
    let fromChannel = 0;
    let fromSearch = 0;
    let unmatched = 0;

    for (const exercise of worklist) {
      const channelMatch = findBestVideoMatch(exercise.name, channelVideos, { minScore: 55 });
      let match = channelMatch;
      let source = 'hy-pe-channel';

      if (!match) {
        match = await searchFallbackVideo(exercise.name);
        source = match?.source ?? 'none';
        await sleep(250);
      }

      if (!match) {
        unmatched += 1;
        console.log(`  · sin vídeo: ${exercise.name}`);
        continue;
      }

      if (source === 'hy-pe-channel') fromChannel += 1;
      else fromSearch += 1;

      entries.push({
        ejerId: exercise.aimharderEjerId,
        name: exercise.name,
        nameKey: exercise.nameKey,
        youtubeVideoId: match.videoId,
      });

      console.log(
        `  ✓ ${exercise.name} → ${match.title} [${source}, score ${match.score}]`,
      );
    }

    console.log(`\nResumen:`);
    console.log(`  HY-PE: ${fromChannel}`);
    console.log(`  Otros canales: ${fromSearch}`);
    console.log(`  Sin match: ${unmatched}`);

    if (dryRun) {
      console.log('\n(dry-run: no se guardó nada en Supabase)');
      return;
    }

    const upserted = await upsertExerciseVideos(client, entries);
    console.log(`\n✓ ${upserted} vídeos guardados en ejercicios_videos`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
