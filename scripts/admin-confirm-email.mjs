#!/usr/bin/env node
/**
 * Confirma manualmente el email de un usuario en auth.users.
 * Uso: node scripts/admin-confirm-email.mjs tu@email.com
 */
import 'dotenv/config';
import pg from 'pg';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const email = (process.argv[2] || '').trim().toLowerCase();
if (!email) {
  console.error('Uso: node scripts/admin-confirm-email.mjs tu@email.com');
  process.exit(1);
}

const dbUrl = resolveDatabaseUrl('nsdurlikkuoxqobabixr');
if (!dbUrl) {
  console.error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD en .env');
  process.exit(1);
}

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

const before = await client.query(
  `select id, email, email_confirmed_at from auth.users where lower(email) = $1`,
  [email],
);

if (before.rows.length === 0) {
  console.error(`No existe en auth.users: ${email}`);
  process.exit(1);
}

if (before.rows[0].email_confirmed_at) {
  console.log(`✓ ${email} ya estaba confirmado (${before.rows[0].email_confirmed_at})`);
  await client.end();
  process.exit(0);
}

await client.query(
  `update auth.users
   set email_confirmed_at = now(),
       updated_at = now()
   where lower(email) = $1`,
  [email],
);

const after = await client.query(
  `select id, email, email_confirmed_at, confirmed_at from auth.users where lower(email) = $1`,
  [email],
);

console.log(`✓ Email confirmado: ${email}`);
console.log(after.rows[0]);
await client.end();
