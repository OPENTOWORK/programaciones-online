import 'dotenv/config';
import pg from 'pg';

const PROGRAM_NAME = 'Consigue tu primer muscle up';
const START_LXV = '2026-08-17';
const START_MJ = '2026-08-18';

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
      startDate: START_LXV,
      recurrence: 'weekly',
    },
    main: [
      'Activación',
      '3 series · sin descanso entre ejercicios · 45 s entre series',
      '• Círculos de hombros: 10 reps',
      '• Scapular pull up: 8 reps',
      '• Dead hang activo: 20 s',
      '• Extensión de dorsal con banda: 12 reps',
      '• Cat cow: 8 reps',
    ].join('\n'),
  },
  {
    name: 'Sesión 1',
    duration: '50 min',
    dayLabel: 'Lunes, Miércoles, Viernes · Cada semana',
    schedule: {
      dayOrder: 1,
      weekdays: [0, 2, 4],
      startDate: START_LXV,
      recurrence: 'weekly',
    },
    main: [
      'Fuerza · Descanso de 90 s entre series y ejercicios',
      '• Scapular pull up: 3 × 10',
      '• Australian pull up: 4 × 8',
      '',
      'Fuerza · Descanso de 2 min entre series',
      '• Pull up con banda (asistencia): 5 × 4-6',
      '• Chest to bar jump (explosivo a la barra): 4 × 5',
      '',
      'Fuerza · Descanso de 90 s',
      '• Transition con banda (cadera a barra): 4 × 4',
      '• Dip en anillas o paralelas: 3 × 6-8',
    ].join('\n'),
    cooldown: 'Estiramiento de dorsales, pecho y hombros, 4 min.',
  },
  {
    name: 'Activación',
    duration: '15 min',
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
      '3 series · sin descanso entre ejercicios · 45 s entre series',
      '• Rotaciones de hombros: 10 reps',
      '• Remo con banda: 12 reps',
      '• Hold bar (hombros activos): 20 s',
      '• Pull over con banda: 10 reps',
      '• Hollow hold: 20 s',
    ].join('\n'),
  },
  {
    name: 'Sesión 2',
    duration: '50 min',
    dayLabel: 'Martes, Jueves · Cada semana',
    schedule: {
      dayOrder: 1,
      weekdays: [1, 3],
      startDate: START_MJ,
      recurrence: 'weekly',
    },
    main: [
      'Fuerza · Descanso de 90 s entre series y ejercicios',
      '• Scapular pull up: 3 × 8',
      '• Remo australiano pies elevados: 3 × 10',
      '',
      'Fuerza · Descanso de 2-3 min entre series',
      '• Pull up estricto con banda: 5 × 3-5',
      '• High pull a la barra (salto + tirón): 4 × 4',
      '',
      'Fuerza · Descanso de 2 min',
      '• Muscle up negativo asistido (bajar lento): 4 × 3',
      '• Support hold en anillas/paralelas: 3 × 20 s',
      '• Hollow rock: 3 × 12',
    ].join('\n'),
    cooldown: 'Movilidad de hombro y estiramiento de pecho, 4 min.',
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
