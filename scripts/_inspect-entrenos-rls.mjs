import 'dotenv/config';
import pg from 'pg';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const client = new pg.Client({
  connectionString: resolveDatabaseUrl('nsdurlikkuoxqobabixr'),
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const rls = await client.query(`
  select relrowsecurity from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'entrenos_diarios'
`);
console.log('rls', rls.rows[0]);

const policies = await client.query(`
  select policyname, cmd, qual, with_check
  from pg_policies
  where schemaname = 'public' and tablename = 'entrenos_diarios'
`);
console.log('policies', policies.rows);

const dtype = await client.query(`
  select data_type from information_schema.columns
  where table_schema = 'public' and table_name = 'entrenos_diarios' and column_name = 'workout_date'
`);
console.log('workout_date type', dtype.rows[0]);

await client.end();
