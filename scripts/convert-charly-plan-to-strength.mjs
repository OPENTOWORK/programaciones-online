import 'dotenv/config';
import pg from 'pg';

import { serializeCalisthenicsPlanMain } from './lib/calisthenicsPlanTextParser.mjs';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const ATHLETE_ID = process.argv[2] ?? '8597540c-4bd3-4864-ad79-1d72084949fd';

const client = new pg.Client({
  connectionString: resolveDatabaseUrl('nsdurlikkuoxqobabixr'),
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const result = await client.query(
  `select id, session_number, content
   from athlete_plans
   where athlete_id = $1
   order by session_number`,
  [ATHLETE_ID],
);

for (const row of result.rows) {
  const marker = '@@MAIN@@';
  const markerIndex = row.content.indexOf(marker);
  if (markerIndex < 0) continue;

  const before = row.content.slice(0, markerIndex + marker.length);
  const main = row.content.slice(markerIndex + marker.length).trim();
  const converted = serializeCalisthenicsPlanMain(main);
  const nextContent = `${before}\n\n${converted}`;

  await client.query(`update athlete_plans set content = $1 where id = $2`, [nextContent, row.id]);
  console.log(`Updated session ${row.session_number} (${row.id})`);
}

await client.end();
console.log('Done.');
