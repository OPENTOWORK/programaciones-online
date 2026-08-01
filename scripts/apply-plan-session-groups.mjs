import 'dotenv/config';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

/** Número de sesión escrito por el editor dentro del contenido del plan. */
function sessionNumberFromContent(content, fallback) {
  const byName = content.match(/sessionName=.*?(\d+)/i);
  if (byName) return Number(byName[1]);

  const byMeta = content.match(/session=(\d+)/);
  if (byMeta) return Number(byMeta[1]);

  return fallback;
}

async function main() {
  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query(`
    alter table public.athlete_plans
      add column if not exists plan_group_id uuid,
      add column if not exists session_number int;

    create index if not exists athlete_plans_plan_group_id_idx
      on public.athlete_plans (plan_group_id);
  `);

  console.log('✓ Columnas plan_group_id y session_number disponibles');

  const { rows } = await client.query(`
    select id, athlete_id, trainer_id, title, content, created_at, plan_group_id, session_number
    from public.athlete_plans
    where plan_type = 'personalized'
    order by created_at asc
  `);

  // Los planes antiguos se agrupaban solo por título: se respeta ese criterio al rellenar.
  const groups = new Map();
  for (const row of rows) {
    const key = `${row.athlete_id}:${row.trainer_id}:${row.title.trim().toLowerCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  let updated = 0;

  for (const sessions of groups.values()) {
    const groupId = sessions.find((session) => session.plan_group_id)?.plan_group_id ?? sessions[0].id;

    const numbered = sessions
      .map((session, index) => ({
        session,
        number: session.session_number ?? sessionNumberFromContent(session.content, index + 1),
      }))
      .sort((left, right) => left.number - right.number);

    const usedNumbers = new Set();
    for (const entry of numbered) {
      let number = entry.number;
      while (usedNumbers.has(number)) number += 1;
      usedNumbers.add(number);
      entry.number = number;
    }

    for (const { session, number } of numbered) {
      const needsGroup = session.plan_group_id !== groupId;
      const needsNumber = session.session_number !== number;
      // El editor lee `session=` del contenido, así que debe coincidir con la columna.
      const nextContent = session.content.replace(/session=\d+/, `session=${number}`);
      const needsContent = nextContent !== session.content;

      if (!needsGroup && !needsNumber && !needsContent) continue;

      await client.query(
        `update public.athlete_plans
         set plan_group_id = $2, session_number = $3, content = $4
         where id = $1`,
        [session.id, groupId, number, nextContent],
      );
      updated += 1;
      console.log(`  · ${session.title} → sesión ${number} (grupo ${groupId.slice(0, 8)})`);
    }
  }

  await client.end();
  console.log(`✓ ${updated} sesión(es) actualizadas`);
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
