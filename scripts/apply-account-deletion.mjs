import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROJECT_REF = 'nsdurlikkuoxqobabixr';

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) return null;

  const host = process.env.SUPABASE_DB_HOST?.trim() || `db.${PROJECT_REF}.supabase.co`;
  const user = process.env.SUPABASE_DB_USER?.trim() || 'postgres';
  const database = process.env.SUPABASE_DB_NAME?.trim() || 'postgres';
  const port = process.env.SUPABASE_DB_PORT?.trim() || '5432';

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

async function main() {
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL (o SUPABASE_DB_PASSWORD) en .env');
  }

  const sql = readFileSync(join(__dirname, '..', 'supabase', 'account-deletion.sql'), 'utf8');
  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  await client.connect();
  await client.query(sql);

  const { rows } = await client.query(`
    select
      p.prosecdef as security_definer,
      pg_get_function_identity_arguments(p.oid) as args,
      has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can,
      has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'delete_own_account'
  `);

  const policies = await client.query(`
    select policyname
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and cmd = 'DELETE'
    order by policyname
  `);

  await client.end();

  if (rows.length === 0) {
    throw new Error('La función delete_own_account no se creó');
  }

  const fn = rows[0];
  console.log('✓ Borrado de cuenta aplicado');
  console.log(`  public.delete_own_account(${fn.args}) · security definer: ${fn.security_definer}`);
  console.log(`  authenticated puede ejecutarla: ${fn.authenticated_can}`);
  console.log(`  anon puede ejecutarla: ${fn.anon_can}`);
  console.log('\n  Políticas de borrado en storage.objects:');
  for (const row of policies.rows) console.log(`    - ${row.policyname}`);

  if (fn.anon_can) throw new Error('El rol anon puede ejecutar la función: revisa los grants');
  if (!fn.authenticated_can) throw new Error('El rol authenticated no puede ejecutar la función');
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
