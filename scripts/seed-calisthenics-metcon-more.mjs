import 'dotenv/config';
import pg from 'pg';

const PROGRAM_NAME = 'Metcon';
const VENUE = 'calisthenics';

function templateWorkoutDate(sortIndex) {
  const date = new Date(Date.UTC(2000, 0, 3 + sortIndex));
  return date.toISOString().slice(0, 10);
}

const METCONS = [
  {
    slot: 1,
    duration: '18 min',
    main: [
      'AMRAP · 15 min',
      '• Australian pull up: 8 reps',
      '• Push up: 12 reps',
      '• Walking lunge: 10/lado',
      '• Hollow rock: 12 reps',
    ].join('\n'),
  },
  {
    slot: 2,
    duration: '22 min',
    main: [
      'For Time · 5 rondas',
      '• Jump squat: 15 reps',
      '• Pike push up: 8 reps',
      '• Toe to bar o elevación de rodillas: 10 reps',
      '• Burpee: 8 reps',
      '',
      'Descanso 1 min entre rondas si lo necesitas.',
    ].join('\n'),
  },
  {
    slot: 3,
    duration: '16 min',
    main: [
      'EMOM · 16 min · 4 bloques',
      'Min 1: Pull up (banda ok) × 6',
      'Min 2: Dips en banco o paralelas × 10',
      'Min 3: Air squat × 20',
      'Min 4: Plancha frontal × 40 s',
    ].join('\n'),
  },
];

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
      `select id, schedule_config from public.entrenos_diarios where program_id = $1`,
      [row.id],
    );
    const taken = new Set(
      existing.rows
        .map((workout) => workout.schedule_config?.dayOrder)
        .filter((order) => typeof order === 'number'),
    );

    console.log(`→ ${row.name} (${row.id}) — ${existing.rows.length} existentes`);

    for (const metcon of METCONS) {
      if (taken.has(metcon.slot)) {
        console.log(`  · Casilla ${metcon.slot + 1} ya ocupada, se omite`);
        continue;
      }

      const schedule = {
        kind: 'metcon',
        dayOrder: metcon.slot,
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
          templateWorkoutDate(metcon.slot),
          -Math.abs(Date.now() + metcon.slot + Math.floor(Math.random() * 1000)),
          'Metcon',
          'Sesión libre',
          metcon.duration,
          '',
          metcon.main,
          '',
          '',
          JSON.stringify(schedule),
        ],
      );

      console.log(`  ✓ Casilla ${metcon.slot + 1} → ${inserted.rows[0].id}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
