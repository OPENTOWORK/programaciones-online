import 'dotenv/config';
import pg from 'pg';

const PROGRAM_NAME = 'Abdomen de hierro';
const START_LXV = '2026-08-17';
const START_MJ = '2026-08-18';

function templateWorkoutDate(sortIndex) {
  const date = new Date(Date.UTC(2000, 0, 3 + sortIndex));
  return date.toISOString().slice(0, 10);
}

const SESSIONS = [
  {
    name: 'Activación',
    duration: '12 min',
    dayLabel: 'Lunes, Miércoles, Viernes · Cada semana',
    schedule: {
      kind: 'activation',
      dayOrder: 0,
      weekdays: [0, 2, 4],
      startDate: START_LXV,
      recurrence: 'weekly',
    },
    main: [
      'Activación',
      '3 series · sin descanso entre ejercicios · 40 s entre series',
      '• Cat cow: 8 reps',
      '• Dead bug lento: 6/lado',
      '• Bird dog: 6/lado',
      '• Respiración diafragmática en suelo: 5 reps',
      '• Hollow hold corto: 15 s',
    ].join('\n'),
  },
  {
    name: 'Sesión 1',
    duration: '40 min',
    dayLabel: 'Lunes, Miércoles, Viernes · Cada semana',
    schedule: {
      dayOrder: 1,
      weekdays: [0, 2, 4],
      startDate: START_LXV,
      recurrence: 'weekly',
    },
    main: [
      'Fuerza · Descanso de 45-60 s entre series',
      '• Hollow hold: 4 × 20-30 s',
      '• Crunch controlado: 3 × 12',
      '',
      'Fuerza · Descanso de 60 s',
      '• Elevación de piernas tumbado: 4 × 8-12',
      '• Plancha frontal: 3 × 30 s',
      '',
      'Fuerza · Descanso de 45 s',
      '• Dead bug: 3 × 8/lado',
      '• Plancha lateral: 3 × 20 s/lado',
    ].join('\n'),
    cooldown: 'Estiramiento de flexores de cadera y zona lumbar, 3 min.',
  },
  {
    name: 'Activación',
    duration: '12 min',
    dayLabel: 'Martes, Jueves · Cada semana',
    schedule: {
      kind: 'activation',
      dayOrder: 0,
      weekdays: [1, 3],
      startDate: START_MJ,
      recurrence: 'weekly',
    },
    main: [
      'Activación',
      '3 series · sin descanso entre ejercicios · 40 s entre series',
      '• Pelvic tilt: 10 reps',
      '• Glute bridge: 10 reps',
      '• Superman corto: 8 reps',
      '• Side bend de pie: 8/lado',
      '• Plancha sobre rodillas: 20 s',
    ].join('\n'),
  },
  {
    name: 'Sesión 2',
    duration: '40 min',
    dayLabel: 'Martes, Jueves · Cada semana',
    schedule: {
      dayOrder: 1,
      weekdays: [1, 3],
      startDate: START_MJ,
      recurrence: 'weekly',
    },
    main: [
      'Fuerza · Descanso de 45-60 s entre series',
      '• Hollow rock: 4 × 10-15',
      '• Toe touch tumbado: 3 × 12',
      '',
      'Fuerza · Descanso de 60-75 s',
      '• Elevación de rodillas colgado o en suelo: 4 × 8-10',
      '• Plancha con toque de hombro: 3 × 8/lado',
      '',
      'Fuerza · Descanso de 45 s',
      '• Russian twist (sin peso o ligero): 3 × 12/lado',
      '• Reverse crunch: 3 × 10',
    ].join('\n'),
    cooldown: 'Movilidad de cadera y respiración profunda, 3 min.',
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
       where name = $1 and coalesce(descripcion, '') ilike '%@venue:calisthenics%'
       limit 1`,
      [PROGRAM_NAME],
    );
    const row = program.rows[0];
    if (!row) throw new Error(`No se encontró el programa ${PROGRAM_NAME}`);

    const existing = await client.query(
      'select count(*)::int as n from public.entrenos_diarios where program_id = $1',
      [row.id],
    );
    if ((existing.rows[0]?.n ?? 0) > 0) {
      console.log(`· ${row.name} ya tiene ${existing.rows[0].n} sesiones. No se duplican.`);
      return;
    }

    console.log(`→ ${row.name} (${row.id})`);

    for (let index = 0; index < SESSIONS.length; index += 1) {
      const session = SESSIONS[index];
      const inserted = await client.query(
        `insert into public.entrenos_diarios (
           program_id, workout_date, aimharder_rate_id, name, day_label,
           estimated_duration, warmup, main_part, core_part, cooldown, schedule_config
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
         returning id`,
        [
          row.id,
          templateWorkoutDate(index),
          -Math.abs(Date.now() + index + Math.floor(Math.random() * 1000)),
          session.name,
          session.dayLabel,
          session.duration,
          '',
          session.main,
          '',
          session.cooldown ?? '',
          JSON.stringify(session.schedule),
        ],
      );
      console.log(`  ✓ ${session.name} (${session.dayLabel}) → ${inserted.rows[0].id}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
