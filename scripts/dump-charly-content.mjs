import 'dotenv/config';
import pg from 'pg';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const client = new pg.Client({
  connectionString: resolveDatabaseUrl('nsdurlikkuoxqobabixr'),
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const r = await client.query(
  `select id, session_number, content from athlete_plans
   where athlete_id = '8597540c-4bd3-4864-ad79-1d72084949fd'
   order by session_number`,
);
for (const row of r.rows) {
  const main = row.content.split('@@MAIN@@')[1]?.trim() ?? '';
  console.log('--- session', row.session_number, row.id);
  console.log(main);
  console.log('');
}
await client.end();
