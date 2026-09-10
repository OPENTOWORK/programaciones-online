import 'dotenv/config';
import pg from 'pg';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const client = new pg.Client({
  connectionString: resolveDatabaseUrl('nsdurlikkuoxqobabixr'),
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const athleteId = process.argv[2] ?? '8597540c-4bd3-4864-ad79-1d72084949fd';

const athlete = await client.query(`select id, name, email from public."Perfil" where id = $1`, [athleteId]);
console.log('athlete', athlete.rows[0]);

const plans = await client.query(
  `select id, title, plan_type, session_number, plan_group_id, pdf_file_name, pdf_storage_path,
          left(content, 300) as content_preview, created_at
   from public.athlete_plans
   where athlete_id = $1
   order by created_at desc
   limit 30`,
  [athleteId],
);
console.log('plans', plans.rows);

const storage = await client.query(`
  select name, bucket_id, created_at
  from storage.objects
  where bucket_id = 'athlete-plan-pdfs'
    and name like '%8597540c%'
  order by created_at desc
  limit 10
`);
console.log('storage', storage.rows);
