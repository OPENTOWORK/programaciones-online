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

  const sqlFiles = ['gym-shop.sql', 'gym-shop-movements-edit.sql', 'gym-shop-service-stock.sql'];
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  for (const file of sqlFiles) {
    const sql = readFileSync(join(__dirname, '..', 'supabase', file), 'utf8');
    await client.query(sql);
    console.log(`✓ ${file}`);
  }
  await client.end();

  console.log('✓ Tienda del gimnasio (productos, movimientos y edición)');
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
