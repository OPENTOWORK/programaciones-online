import 'dotenv/config';
import pg from 'pg';

const PROGRAM_NAME = 'Metcon';
const VENUE = 'calisthenics';
const SLOT = 0;

function templateWorkoutDate(sortIndex) {
  const date = new Date(Date.UTC(2000, 0, 3 + sortIndex));
  return date.toISOString().slice(0, 10);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en .env');

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const program = await client.query(
      `select id, name from public.programas
       where name = $1 and coalesce(descripcion, '') ilike ('%@venue:' || $2 || '%')
       limit 1`,
      [PROGRAM_NAME, VENUE],
    );
    const row = program.rows[0];
    if (!row) throw new Error(`No se encontró Metcon @venue:${VENUE}`);

    const existing = await client.query(
      `select id, name, schedule_config
       from public.entrenos_diarios
       where program_id = $1
       order by workout_date`,
      [row.id],
    );

    const slotTaken = existing.rows.some((workout) => {
      const order = workout.schedule_config?.dayOrder;
      return order === SLOT || (order == null && existing.rows.indexOf(workout) === SLOT);
    });
    if (slotTaken || existing.rows.length > 0) {
      console.log(`· ${row.name} ya tiene ${existing.rows.length} sesión(es). No se duplican.`);
      for (const workout of existing.rows) {
        console.log('  -', workout.name, JSON.stringify(workout.schedule_config));
      }
      return;
    }

    const main = [
      'EMOM · 12 min · 4 rondas',
      '• Pull up (banda si hace falta): 5 reps',
      '• Push up: 10 reps',
      '• Air squat: 15 reps',
    ].join('\n');

    const schedule = {
      kind: 'metcon',
      dayOrder: SLOT,
      weekdays: [0],
      startDate: '2026-08-17',
      recurrence: 'once',
    };

    const inserted = await client.query(
      `insert into public.entrenos_diarios (
         program_id, workout_date, aimharder_rate_id, name, day_label,
         estimated_duration, warmup, main_part, core_part, cooldown, schedule_config
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
       returning id`,
      [
        row.id,
        templateWorkoutDate(SLOT),
        -Math.abs(Date.now() + SLOT),
        'Metcon',
        'Sesión libre',
        '20 min',
        '',
        main,
        '',
        '',
        JSON.stringify(schedule),
      ],
    );

    console.log(`→ ${row.name} (${row.id})`);
    console.log(`  ✓ Metcon casilla ${SLOT + 1} → ${inserted.rows[0].id}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
