import 'dotenv/config';
import pg from 'pg';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const client = new pg.Client({
  connectionString: resolveDatabaseUrl('nsdurlikkuoxqobabixr'),
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const result = await client.query(
  `update public.entrenos_diarios e
   set core_part = '', cooldown = '', synced_at = now()
   from public.programas p
   where e.program_id = p.id
     and lower(trim(p.name)) = lower(trim('Desafío de la semana'))
     and e.schedule_config->>'kind' = 'metcon'`,
);

console.log(`✓ Limpiados core y cooldown en ${result.rowCount} desafíos`);
await client.end();
