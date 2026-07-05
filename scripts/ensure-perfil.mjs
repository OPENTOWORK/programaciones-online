import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const sqlPath = join(__dirname, '..', 'supabase', 'ensure-perfil.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  await client.end();

  console.log('✓ Tabla Perfil vinculada, profiles eliminada y usuarios sincronizados');
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
