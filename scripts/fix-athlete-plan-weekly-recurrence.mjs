import 'dotenv/config';
import pg from 'pg';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const athleteEmail = process.argv.find((arg, index) => process.argv[index - 1] === '--athlete-email');

if (!athleteEmail) {
  console.error('Uso: node scripts/fix-athlete-plan-weekly-recurrence.mjs --athlete-email atleta@mail.com');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: resolveDatabaseUrl('nsdurlikkuoxqobabixr'),
  ssl: { rejectUnauthorized: false },
});
await client.connect();

try {
  const athlete = await client.query(
    `select u.id, p.name from auth.users u join public."Perfil" p on p.id = u.id where lower(u.email) = $1`,
    [athleteEmail.trim().toLowerCase()],
  );
  if (!athlete.rows[0]) throw new Error(`No existe atleta: ${athleteEmail}`);

  const plans = await client.query(
    `select id, session_number, content from athlete_plans where athlete_id = $1 order by session_number`,
    [athlete.rows[0].id],
  );

  let updated = 0;
  for (const plan of plans.rows) {
    if (!plan.content.includes('Una sola vez')) continue;

    const nextContent = plan.content
      .replace(/schedule=([^·\n]+) · Una sola vez/g, 'schedule=$1 · Cada semana')
      .replace(
        /@@\/plan-meta/,
        `planValidFrom=${plan.content.match(/scheduleStart=(\d{4}-\d{2}-\d{2})/)?.[1] ?? '2026-09-01'}\nplanValidUntil=indefinite\n@@/plan-meta`,
      );

    await client.query(`update athlete_plans set content = $1 where id = $2`, [nextContent, plan.id]);
    updated += 1;
    console.log(`· sesión ${plan.session_number} → semanal`);
  }

  console.log(`✓ ${updated} sesiones actualizadas para ${athlete.rows[0].name}`);
} finally {
  await client.end();
}
