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

  const sql = readFileSync(join(__dirname, '..', 'supabase', 'home-training-slots.sql'), 'utf8');
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(sql);
  await client.query("notify pgrst, 'reload schema'");
  const { rows } = await client.query(
    `select to_regclass('public.home_training_slots') as table_name`,
  );
  await client.end();

  console.log('✓ Huecos a domicilio aplicados', rows[0]?.table_name);
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
