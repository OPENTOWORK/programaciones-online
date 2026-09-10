import 'dotenv/config';
import pg from 'pg';

import { resolveDatabaseUrl, resolveProgramId } from './lib/annualWorkoutImport.mjs';
import { WEEKLY_CHALLENGE_PROGRAM_NAME } from './lib/weeklyChallengeProgram.mjs';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';

async function main() {
  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const programId = await resolveProgramId(client, WEEKLY_CHALLENGE_PROGRAM_NAME);
    if (!programId) {
      throw new Error(`No se encontró el programa "${WEEKLY_CHALLENGE_PROGRAM_NAME}"`);
    }

    const deleted = await client.query(
      `delete from public.entrenos_diarios
       where program_id = $1
         and (
           schedule_config->>'heroId' is null
           or coalesce(schedule_config->>'kind', '') <> 'metcon'
         )`,
      [programId],
    );

    const remaining = await client.query(
      `select count(*)::int as heroes
       from public.entrenos_diarios
       where program_id = $1
         and schedule_config->>'heroId' is not null`,
      [programId],
    );

    console.log(`✓ Eliminadas ${deleted.rowCount} sesiones que no eran heroes`);
    console.log(`✓ Quedan ${remaining.rows[0].heroes} desafíos hero en el programa`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
