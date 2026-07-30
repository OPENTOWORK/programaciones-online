import 'dotenv/config';
import pg from 'pg';

import { upsertExerciseVideos } from './lib/aimharderVideoUpsert.mjs';

const DATABASE_URL = process.env.DATABASE_URL;

const CARDIO_EXERCISE_VIDEO_ENTRIES = [
  { name: 'ANY CARDIO MACH-METROS', youtubeVideoId: '7wIUgbLxkDo' },
  { name: 'ANY CARDIO MACH-CAL', youtubeVideoId: '7wIUgbLxkDo' },
  { name: 'Any Cardio Mach', youtubeVideoId: '7wIUgbLxkDo' },
  { name: 'Ergo Row', youtubeVideoId: '1bj10fNADVA' },
  { name: 'Ergo Bike', youtubeVideoId: 'RWHR0ctQG7Y' },
  { name: 'Ergo Ski', youtubeVideoId: 'l5qMpwsIagw' },
];

async function main() {
  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const count = await upsertExerciseVideos(client, CARDIO_EXERCISE_VIDEO_ENTRIES);
    console.log(`✓ ${count} vídeos de cardio guardados`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
