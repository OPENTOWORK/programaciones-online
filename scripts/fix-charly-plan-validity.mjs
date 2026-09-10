import pg from 'pg';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const groupId = '54af1752-51b8-4fe9-acbc-252f7f01f7a1';
const client = new pg.Client({
  connectionString: resolveDatabaseUrl('nsdurlikkuoxqobabixr'),
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const { rows } = await client.query(
  'select id, content from public.athlete_plans where plan_group_id = $1',
  [groupId],
);

let updated = 0;
for (const row of rows) {
  const next = row.content.replaceAll('planValidFrom=2026-09-06', 'planValidFrom=2026-08-31');
  if (next !== row.content) {
    await client.query('update public.athlete_plans set content = $1 where id = $2', [next, row.id]);
    updated += 1;
  }
}

console.log(`✓ Actualizadas ${updated} sesiones: planValidFrom=2026-08-31`);
await client.end();
