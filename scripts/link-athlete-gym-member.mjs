import 'dotenv/config';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const ATHLETE_EMAIL = (process.argv[2] ?? 'carlosgarciacano87@gmail.com').trim().toLowerCase();
const GYM_SLUG = process.argv[3] ?? 'hype';
const FIRST_NAME = process.argv[4] ?? 'Max';
const LAST_NAME = process.argv[5] ?? 'Power';

async function main() {
  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD en .env');
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    await client.query('begin');

    const gymRes = await client.query(
      `select id, name, slug, email
       from public.gyms
       where slug = $1 or lower(email) = 'info@trainwithhype.com'
       order by case when slug = $1 then 0 else 1 end
       limit 1`,
      [GYM_SLUG],
    );
    const gym = gymRes.rows[0];
    if (!gym) throw new Error(`No existe el gimnasio (${GYM_SLUG}).`);

    const userRes = await client.query(
      `select id, name, email
       from public."Perfil"
       where lower(email) = $1
       limit 1`,
      [ATHLETE_EMAIL],
    );
    const user = userRes.rows[0];
    if (!user) throw new Error(`No existe usuario con email ${ATHLETE_EMAIL}.`);

    const memberRes = await client.query(
      `select id, user_id, first_name, last_name, email, status
       from public.gym_members
       where gym_id = $1
         and (
           user_id = $2
           or lower(coalesce(email, '')) = $3
           or (lower(first_name) = lower($4) and lower(last_name) = lower($5))
         )
       order by
         case when user_id = $2 then 0 when lower(coalesce(email, '')) = $3 then 1 else 2 end,
         created_at desc
       limit 1`,
      [gym.id, user.id, ATHLETE_EMAIL, FIRST_NAME, LAST_NAME],
    );

    let member = memberRes.rows[0];

    if (member) {
      const updated = await client.query(
        `update public.gym_members
         set
           user_id = $2,
           email = $3,
           first_name = coalesce(nullif(trim(first_name), ''), $4),
           last_name = coalesce(nullif(trim(last_name), ''), $5),
           status = 'active',
           pipeline_stage = 'activo',
           updated_at = now()
         where id = $1
         returning id, user_id, first_name, last_name, email, status`,
        [member.id, user.id, ATHLETE_EMAIL, FIRST_NAME, LAST_NAME],
      );
      member = updated.rows[0];
    } else {
      const inserted = await client.query(
        `insert into public.gym_members (
           gym_id, user_id, first_name, last_name, email, status, pipeline_stage
         ) values ($1, $2, $3, $4, $5, 'active', 'activo')
         returning id, user_id, first_name, last_name, email, status`,
        [gym.id, user.id, FIRST_NAME, LAST_NAME, ATHLETE_EMAIL],
      );
      member = inserted.rows[0];
    }

    await client.query('commit');

    console.log('✓ Atleta vinculado al gimnasio');
    console.log(`  Gimnasio: ${gym.name} (${gym.id})`);
    console.log(`  Atleta: ${user.name ?? `${FIRST_NAME} ${LAST_NAME}`} (${user.id})`);
    console.log(`  Miembro CRM: ${member.first_name} ${member.last_name} (${member.id})`);
    console.log(`  Email: ${member.email}`);
    console.log(`  Estado: ${member.status}`);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
