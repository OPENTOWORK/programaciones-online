import 'dotenv/config';
import pg from 'pg';

const PROGRAM_NAME = 'Consigue tu primera flexión';
const PROGRAM_ID = '83fb98b4-23d8-4649-9c6e-464195177166';
const START_DATE = '2026-08-17';

function templateWorkoutDate(sortIndex) {
  const date = new Date(Date.UTC(2000, 0, 3 + sortIndex));
  return date.toISOString().slice(0, 10);
}

const SESSIONS = [
  {
    name: 'Activación',
    duration: '15 min',
    dayLabel: 'Lunes, Miércoles, Viernes · Cada semana',
    schedule: {
      kind: 'activation',
      dayOrder: 0,
      weekdays: [0, 2, 4],
      startDate: START_DATE,
      recurrence: 'weekly',
    },
    warmup: '',
    main: [
      'Activación',
      '3 series · sin descanso entre ejercicios · 45 s entre series',
      '• Círculos de hombros: 10 reps',
      '• Scapular push up: 10 reps',
      '• Plancha frontal: 20 s',
      '• Wrist rocks: 10 reps',
      '• Inchworm a posición de flexión: 5 reps',
    ].join('\n'),
    cooldown: '',
  },
  {
    name: 'Activación',
    duration: '15 min',
    dayLabel: 'Martes, Jueves · Cada semana',
    schedule: {
      kind: 'activation',
      dayOrder: 0,
      weekdays: [1, 3],
      startDate: '2026-08-18',
      recurrence: 'weekly',
    },
    warmup: '',
    main: [
      'Activación',
      '3 series · sin descanso entre ejercicios · 45 s entre series',
      '• Rotaciones de hombros: 10 reps',
      '• Scapular push up: 8 reps',
      '• Plancha a perro abajo: 6 reps',
      '• Aperturas de pecho con banda: 12 reps',
      '• Hold en posición de flexión (rodillas): 20 s',
    ].join('\n'),
    cooldown: '',
  },
  {
    name: 'Sesión 1',
    duration: '45 min',
    dayLabel: 'Lunes, Miércoles, Viernes · Cada semana',
    schedule: {
      dayOrder: 1,
      weekdays: [0, 2, 4],
      startDate: START_DATE,
      recurrence: 'weekly',
    },
    warmup: '',
    main: [
      'Fuerza · Descanso de 1 min entre series y ejercicios',
      '• Scapular push up: 3 × 12',
      '• Flexión inclinada (manos en banco o muro): 4 × 8',
      '',
      'Fuerza · Descanso de 90 s entre series',
      '• Flexión de rodillas: 4 × 6-10',
      '• Flexión negativa (bajar en 3-4 s): 3 × 5',
      '',
      'Fuerza · Descanso de 1 min',
      '• Plancha frontal: 3 × 25 s',
      '• Fondos de tríceps en banco: 3 × 10',
    ].join('\n'),
    cooldown: 'Estiramiento de pecho, hombros y tríceps, 4 min.',
  },
  {
    name: 'Sesión 2',
    duration: '45 min',
    dayLabel: 'Martes, Jueves · Cada semana',
    schedule: {
      dayOrder: 1,
      weekdays: [1, 3],
      startDate: '2026-08-18',
      recurrence: 'weekly',
    },
    warmup: '',
    main: [
      'Fuerza · Descanso de 1 min entre series y ejercicios',
      '• Scapular push up: 3 × 10',
      '• Flexión inclinada alta: 3 × 10',
      '',
      'Fuerza · Descanso de 2 min entre series',
      '• Flexión de rodillas con pausa abajo 1 s: 5 × 5',
      '• Flexión negativa lenta: 4 × 4',
      '',
      'Fuerza · Descanso de 1 min',
      '• Pike push up (rodillas al suelo si hace falta): 3 × 6',
      '• Dead bug: 3 × 8/lado',
    ].join('\n'),
    cooldown: 'Movilidad de muñeca y estiramiento de pecho, 4 min.',
  },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Falta DATABASE_URL en .env');

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const program = await client.query(
      `select id, name from public.programas
       where id = $1 or (name = $2 and coalesce(descripcion, '') ilike '%@venue:calisthenics%')
       order by case when id = $1 then 0 else 1 end
       limit 1`,
      [PROGRAM_ID, PROGRAM_NAME],
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
      const workoutDate = templateWorkoutDate(index);
      const syntheticRateId = -Math.abs(Date.now() + index + Math.floor(Math.random() * 1000));

      const inserted = await client.query(
        `insert into public.entrenos_diarios (
           program_id, workout_date, aimharder_rate_id, name, day_label,
           estimated_duration, warmup, main_part, core_part, cooldown, schedule_config
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
         returning id`,
        [
          row.id,
          workoutDate,
          syntheticRateId,
          session.name,
          session.dayLabel,
          session.duration,
          session.warmup,
          session.main,
          '',
          session.cooldown,
          JSON.stringify(session.schedule),
        ],
      );

      console.log(`  ✓ ${session.name} → ${inserted.rows[0].id}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
