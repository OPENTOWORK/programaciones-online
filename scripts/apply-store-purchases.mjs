import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const TABLES = [
  'store_products',
  'store_product_programs',
  'store_purchases',
  'user_entitlements',
  'store_notifications',
  'store_testers',
];
const PRIVATE_TABLES = ['store_purchases', 'user_entitlements', 'store_notifications', 'store_testers'];

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

  const sql = readFileSync(join(__dirname, '..', 'supabase', 'store-purchases.sql'), 'utf8');
  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  await client.connect();
  try {
    const { rows: prerequisites } = await client.query(`
      select
        to_regclass('public.programas') is not null as has_programas,
        to_regclass('public.user_programs') is not null as has_user_programs,
        to_regprocedure('public.is_administrador()') is not null as has_is_administrador
    `);
    const missing = Object.entries(prerequisites[0]).filter(([, present]) => !present).map(([name]) => name);
    if (missing.length) throw new Error(`Faltan requisitos en la base de datos: ${missing.join(', ')}`);

    await client.query('begin');
    await client.query(sql);
    await client.query('commit');

    const { rows: tables } = await client.query(
      `
      select
        c.relname as table_name,
        c.relrowsecurity as rls,
        has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_select,
        has_table_privilege('authenticated', c.oid, 'INSERT') as authenticated_insert,
        has_table_privilege('anon', c.oid, 'SELECT') as anon_select
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = any($1)
      order by c.relname
      `,
      [TABLES],
    );

    const { rows: functions } = await client.query(`
      select
        p.proname as name,
        has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can,
        has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in (
          'program_requires_purchase',
          'user_has_program_entitlement',
          'my_program_entitlements',
          'my_store_purchases',
          'is_store_tester'
        )
      order by p.proname
    `);

    const { rows: products } = await client.query(
      'select count(*)::int as total, count(*) filter (where active)::int as active from public.store_products',
    );

    console.log('✓ Compras integradas aplicadas');
    for (const table of tables) {
      console.log(
        `  ${table.table_name}: RLS ${table.rls ? 'sí' : 'NO'} · authenticated select ${table.authenticated_select} · insert ${table.authenticated_insert} · anon select ${table.anon_select}`,
      );
    }
    for (const fn of functions) {
      console.log(`  ${fn.name}(): authenticated ${fn.authenticated_can} · anon ${fn.anon_can}`);
    }
    console.log(`  Productos: ${products[0].total} (${products[0].active} a la venta)`);

    if (tables.length !== TABLES.length) throw new Error('No se crearon todas las tablas');
    for (const table of tables) {
      if (!table.rls) throw new Error(`${table.table_name} no tiene RLS`);
      if (table.anon_select || table.authenticated_insert) {
        throw new Error(`${table.table_name} admite accesos que no debería: revisa los grants`);
      }
      if (PRIVATE_TABLES.includes(table.table_name) && table.authenticated_select) {
        throw new Error(`${table.table_name} es legible por la app: revisa los grants`);
      }
    }
    const internal = functions.find((fn) => fn.name === 'user_has_program_entitlement');
    if (internal?.authenticated_can || internal?.anon_can) {
      throw new Error('user_has_program_entitlement no debe ser ejecutable desde la app');
    }
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
