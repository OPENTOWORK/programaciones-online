import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = 'nsdurlikkuoxqobabixr';

async function main() {
  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD en .env');
  }

  const sql = readFileSync(
    join(__dirname, '..', 'supabase', 'trainer-athlete-feedback.sql'),
    'utf8',
  );
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(sql);
  await client.end();

  console.log('✓ Tablas trainer_athlete_feedback y trainer_feedback_media aplicadas');
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
