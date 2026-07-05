import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '..', 'supabase', 'link-perfil-roles.sql'), 'utf8');

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);

const fk = await client.query(`
  SELECT conname
  FROM pg_constraint
  WHERE conname = 'Perfil_id_roles_fkey'
`);
console.log('✓ Perfil.id_roles enlazada con roles.id');

await client.end();
