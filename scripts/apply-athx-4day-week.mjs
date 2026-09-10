/**
 * ATHX: semana del 31 de agosto de 2026.
 * Entreno lun, mié, jue y sáb. Descanso mar, vie y dom (nunca 3 seguidos).
 */
import 'dotenv/config';
import pg from 'pg';
import { BLOCK, block, qtyItem, setsItem } from './lib/workoutBlockHelpers.mjs';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const PROGRAM_ID = '9b9d3120-adca-4227-aa0d-22fd5f617e61';
const WEEK_START = '2026-08-31';
const WEEK_LABEL = `ATHX · Semana del ${WEEK_START}`;

function scheduleFor(weekday, dayOrder, kind) {
  return {
    weekdays: [weekday],
    recurrence: 'weekly',
    startDate: WEEK_START,
    dayOrder,
    kind,
  };
}

function activationBlock(title, note, items) {
  return block(BLOCK.activation, {
    title,
    timing: '12 min',
    note,
    items,
  });
}

const ACTIVATIONS = {
  hybrid: activationBlock(
    'Hybrid ATHX',
    '2 rondas fluidas. Mezcla agilidad, potencia y técnica antes del bloque principal.',
    [
      qtyItem('Lateral shuffle', '20 m ida y vuelta'),
      qtyItem('High knees', '20 m'),
      qtyItem('Band pull-apart', '12 reps'),
      qtyItem('KB goblet squat', '10 reps', '16 kg'),
      qtyItem('Inchworm', '5 reps'),
      qtyItem('Jump rope', '40 s'),
      qtyItem("World's greatest stretch", '4 reps por lado'),
    ],
  ),
  lower: activationBlock(
    'Tren inferior',
    '2 rondas. Movilidad de cadera y activación de glúteo antes de sentadilla.',
    [
      qtyItem('90/90 stretch', '30 s por lado'),
      qtyItem('Glute bridge', '12 reps'),
      qtyItem('Goblet squat', '10 reps', '16 kg'),
      qtyItem('Walking lunge', '8 reps por pierna'),
      qtyItem('Banded lateral walk', '10 pasos por lado'),
      qtyItem('Jump rope', '40 s'),
    ],
  ),
  engine: activationBlock(
    'Motor e intervales',
    '2 rondas. Prepara cardiaco y técnica de kettlebell sin fatiga muscular.',
    [
      qtyItem('Row', '30 s'),
      qtyItem('Air squat', '10 reps'),
      qtyItem('Russian KB swing', '12 reps', '16 kg'),
      qtyItem('High knees', '20 m'),
      qtyItem('Dead bug', '8 reps por lado'),
      qtyItem('Jump rope', '40 s'),
    ],
  ),
  pull: activationBlock(
    'Tracción y core',
    '2 rondas. Despierta escápulas y cadera antes del bloque de tirón.',
    [
      qtyItem('Cat camel', '8 reps'),
      qtyItem('Band pull-apart', '12 reps'),
      qtyItem('Scapular pull-up', '8 reps'),
      qtyItem('Inchworm', '5 reps'),
      qtyItem('KB deadlift', '10 reps', '16 kg'),
      qtyItem('Dead bug', '8 reps por lado'),
    ],
  ),
};

function restBlock({ title, note, items }) {
  return block(BLOCK.mobility, {
    title,
    timing: '20 min',
    note,
    items,
  });
}

const REST_DAYS = [
  {
    weekday: 1,
    label: 'Martes',
    rateId: -9408325,
    name: 'Día de descanso',
    duration: 'Descanso',
    main: restBlock({
      title: 'Recuperación activa',
      note: 'Tras el lunes de tren superior. Sin barra ni metcon. Camina y moviliza hombros y cadera.',
      items: [
        qtyItem('Caminar o bici suave', '10 min'),
        qtyItem('Foam roll', '2 min espalda alta + 2 min glúteo'),
        qtyItem("World's greatest stretch", '4 reps por lado'),
        qtyItem('Banded shoulder dislocate', '10 reps'),
        qtyItem('Respiración nasal 4-6', '2 min'),
      ],
    }),
  },
  {
    weekday: 4,
    label: 'Viernes',
    rateId: -9408350,
    name: 'Día de descanso',
    duration: 'Descanso',
    main: restBlock({
      title: 'Recuperación media semana',
      note: 'Entre jueves y sábado. Piernas ligeras, sin cargar la zona lumbar.',
      items: [
        qtyItem('Caminar al aire libre', '12 min'),
        qtyItem('Couch stretch', '45 s por lado'),
        qtyItem('Cat camel', '10 reps'),
        qtyItem('Foam roll isquios', '2 min'),
        qtyItem('Hidratación', '—'),
      ],
    }),
  },
  {
    weekday: 6,
    label: 'Domingo',
    rateId: -9408370,
    name: 'Día de descanso',
    duration: 'Descanso',
    main: restBlock({
      title: 'Descanso completo',
      note: 'Prioriza dormir y comer bien. Solo movilidad muy suave si te ayuda.',
      items: [
        qtyItem('Caminar', '10 min'),
        qtyItem('Respiración diafragmática', '3 min'),
        qtyItem('Estiramiento de cadera 90/90', '45 s por lado'),
        qtyItem('Foam roll espalda alta', '2 min'),
        qtyItem('Prepara la semana', 'revisa horarios y material'),
      ],
    }),
  },
];

const TRAINING_DAYS = [
  {
    weekday: 0,
    label: 'Lunes',
    rateActivation: -9408310,
    rateSession: -9408311,
    activation: ACTIVATIONS.hybrid,
    sessionName: 'Lunes · ATHX',
    duration: '75 min',
    main: [
      block(BLOCK.strength, {
        title: 'Hombro y estabilidad',
        timing: "cada 2'30\"",
        note: 'Últimas 2 series con RIR 1. Sin balanceo en laterales.',
        items: [
          setsItem('Lateral raises DB', 4, 12, '8 kg'),
          setsItem('Elevaciones frontales con disco', 4, 12, '10 kg'),
        ],
      }),
      block(BLOCK.strength, {
        title: 'Press militar',
        timing: "cada 2'30\"",
        note: 'Barra desde rack. Abdomen apretado en cada repetición.',
        items: [setsItem('Shoulder press', 5, 5, '40/30 kg')],
      }),
      block(BLOCK.technique, {
        title: 'Peso muerto',
        timing: '8 min',
        note: 'Aproximación progresiva antes del EMOM. Bisagra limpia.',
        items: [setsItem('Deadlift barbell', 3, 3, '70 kg')],
      }),
      block(BLOCK.amrap, {
        title: 'Engine mix',
        timing: "14'",
        note: 'Ritmo sostenible. Parte flexiones en series de 6 si hace falta.',
        items: [
          qtyItem('Run', '500 m'),
          qtyItem('Push-up', '18 reps'),
          qtyItem('Any cardio machine', '300 m'),
        ],
      }),
      block(BLOCK.emom, {
        title: 'Deadlift + burpee',
        timing: '14 rondas',
        note: 'Min 1: 5 deadlifts · Min 2: 10 burpees over bar. Escala deadlift a 70/50 kg.',
        items: [
          qtyItem('Deadlift barbell', '5 reps', '100/70 kg'),
          qtyItem('Burpee over the barbell', '10 reps'),
        ],
      }),
    ].join('\n\n'),
    core: block(BLOCK.strength, {
      title: 'Core anti-rotación',
      timing: '6 min',
      items: [
        setsItem('Pallof press', 2, 12, 'banda'),
        qtyItem('Hollow hold', '2 × 30 s'),
      ],
    }),
    cooldown:
      'Camina 3 min. Estira hombros y glúteos 30 s por lado. Respiración nasal 4-6 durante 2 min.',
  },
  {
    weekday: 2,
    label: 'Miércoles',
    rateActivation: -9408320,
    rateSession: -9408321,
    activation: ACTIVATIONS.lower,
    sessionName: 'Miércoles · ATHX',
    duration: '68 min',
    main: [
      block(BLOCK.strength, {
        title: 'Sentadilla trasera',
        timing: "cada 2'30\"",
        note: 'Profundidad completa. Sube carga solo si mantienes velocidad en la subida.',
        items: [setsItem('Back squat', 5, 5, '80/55 kg')],
      }),
      block(BLOCK.strength, {
        title: 'Bisagra',
        timing: "cada 2'",
        note: 'RDL con pausa 1 s abajo. Barra pegada a las piernas.',
        items: [setsItem('Romanian deadlift', 4, 8, '60/40 kg')],
      }),
      block(BLOCK.forTime, {
        title: 'Turf sprint',
        timing: "TC 12'",
        note: 'For time. Alterna carrera y potencia. Escala swings a 16/12 kg.',
        items: [
          qtyItem('Run', '400 m'),
          qtyItem('KB swing', '30 reps', '24/16 kg'),
          qtyItem('Run', '200 m'),
          qtyItem('Box jump over', '20 reps'),
        ],
      }),
      block(BLOCK.amrap, {
        title: 'Finisher pierna',
        timing: "10'",
        note: 'Ritmo medio-alto. Zancada completa en cada paso.',
        items: [
          qtyItem('Walking lunge', '12 reps por pierna'),
          qtyItem('Air squat', '15 reps'),
          qtyItem('Burpee', '8 reps'),
        ],
      }),
    ].join('\n\n'),
    core: block(BLOCK.strength, {
      title: 'Core',
      timing: '5 min',
      items: [
        setsItem('Side plank', 2, '30 s por lado'),
        qtyItem('Superman hold', '2 × 20 s'),
      ],
    }),
    cooldown: 'Foam roll cuádriceps e isquios 2 min. Camina 3 min.',
  },
  {
    weekday: 3,
    label: 'Jueves',
    rateActivation: -9408330,
    rateSession: -9408331,
    activation: ACTIVATIONS.engine,
    sessionName: 'Jueves · ATHX',
    duration: '70 min',
    main: [
      block(BLOCK.strength, {
        title: 'Potencia de cadera',
        timing: "cada 2'",
        note: 'Sin llegar al fallo. Explosividad en swing y clean.',
        items: [
          setsItem('Russian KB swing', 4, 12, '24/16 kg'),
          setsItem('KB clean', 4, 6, '20/12 kg'),
        ],
      }),
      block(BLOCK.forTime, {
        title: 'Chipper hybrid',
        timing: "TC 16'",
        note: 'For time. Mantén técnica en remo y burpees.',
        items: [
          qtyItem('Row', '500 m'),
          qtyItem('Burpee over rower', '20 reps'),
          qtyItem('Russian KB swing', '30 reps', '24/16 kg'),
          qtyItem('Run', '400 m'),
        ],
      }),
      block(BLOCK.emom, {
        title: 'Turf intervals',
        timing: '12 rondas',
        note: 'Min 1: shuttle · Min 2: thruster ligero + box step.',
        items: [
          qtyItem('Shuttle run', '4 × 20 m'),
          qtyItem('Thruster barbell', '8 reps', '20/12 kg'),
          qtyItem('Box step-up', '10 reps por pierna'),
        ],
      }),
      block(BLOCK.amrap, {
        title: 'Gimnástico + barra',
        timing: "12'",
        note: 'Escala dominadas con banda. Thrusters con mancuernas si hace falta.',
        items: [
          qtyItem('Strict pull-up', '6 reps'),
          qtyItem('Push-up', '12 reps'),
          qtyItem('KB deadlift', '15 reps', '24/16 kg'),
        ],
      }),
    ].join('\n\n'),
    core: block(BLOCK.strength, {
      title: 'Accesorio',
      timing: '8 min',
      items: [
        setsItem('Banded face pull', 3, 15),
        setsItem('Hollow rocks', 2, 20),
      ],
    }),
    cooldown: 'Estira flexores de cadera y dorsal 1 min cada uno. Respiración 2 min.',
  },
  {
    weekday: 5,
    label: 'Sábado',
    rateActivation: -9408340,
    rateSession: -9408341,
    activation: ACTIVATIONS.pull,
    sessionName: 'Sábado · ATHX',
    duration: '72 min',
    main: [
      block(BLOCK.strength, {
        title: 'Dominadas y remo',
        timing: "cada 2'30\"",
        note: 'Dominadas estrictas. Escala con banda o ring row.',
        items: [
          setsItem('Strict pull-up', 4, 6),
          setsItem('Pendlay row', 4, 8, '50/35 kg'),
        ],
      }),
      block(BLOCK.strength, {
        title: 'Empuje horizontal',
        timing: "cada 2'",
        note: 'Toca el pecho sin rebotar. Escápulas estabilizadas.',
        items: [setsItem('Bench press', 4, 8, '50/35 kg')],
      }),
      block(BLOCK.emom, {
        title: 'Hybrid engine',
        timing: '16 rondas',
        note: 'Min 1: ski/row · Min 2: burpee + KB clean.',
        items: [
          qtyItem('SkiErg', '12 cal'),
          qtyItem('Burpee', '8 reps'),
          qtyItem('KB clean', '10 reps', '16/12 kg'),
        ],
      }),
      block(BLOCK.amrap, {
        title: 'Turf finisher',
        timing: "8'",
        note: 'Cierra la semana con intensidad controlada.',
        items: [
          qtyItem('Shuttle run', '4 × 20 m'),
          qtyItem('Slam ball', '12 reps', '9 kg'),
          qtyItem('Mountain climber', '20 reps'),
        ],
      }),
    ].join('\n\n'),
    core: block(BLOCK.strength, {
      title: 'Core y carry',
      timing: '6 min',
      items: [
        setsItem('Dead bug', 2, 10),
        setsItem('Farmer carry', 2, '40 m', '24/16 kg'),
      ],
    }),
    cooldown: 'Estira dorsales y pectorales 30 s por lado. Camina 3 min.',
  },
];

async function upsertSession(client, {
  weekday,
  label,
  rateId,
  name,
  duration,
  mainPart,
  corePart = '',
  cooldown = '',
  kind,
  dayOrder,
}) {
  const schedule = scheduleFor(weekday, dayOrder, kind);

  await client.query(
    `insert into public.entrenos_diarios (
       program_id, workout_date, aimharder_rate_id, name, day_label,
       estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
     ) values ($1, $2, $3, $4, $5, $6, '', $7, $8, $9, $10::jsonb, now())
     on conflict (workout_date, aimharder_rate_id) do update set
       name = excluded.name,
       day_label = excluded.day_label,
       estimated_duration = excluded.estimated_duration,
       main_part = excluded.main_part,
       core_part = excluded.core_part,
       cooldown = excluded.cooldown,
       schedule_config = excluded.schedule_config,
       synced_at = now()`,
    [
      PROGRAM_ID,
      WEEK_START,
      rateId,
      name,
      `${WEEK_LABEL} · ${label}`,
      duration,
      mainPart,
      corePart,
      cooldown,
      JSON.stringify(schedule),
    ],
  );
}

async function main() {
  const url = resolveDatabaseUrl('nsdurlikkuoxqobabixr');
  if (!url) throw new Error('Falta DATABASE_URL');

  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query('begin');

    const deleted = await client.query(
      `delete from public.entrenos_diarios
       where program_id = $1
         and coalesce(schedule_config->>'startDate', '') = $2`,
      [PROGRAM_ID, WEEK_START],
    );
    console.log(`· Eliminadas ${deleted.rowCount} sesiones previas de la semana del ${WEEK_START}`);

    for (const day of TRAINING_DAYS) {
      await upsertSession(client, {
        weekday: day.weekday,
        label: day.label,
        rateId: day.rateActivation,
        name: 'Activación',
        duration: '12 min',
        mainPart: day.activation,
        kind: 'activation',
        dayOrder: 0,
      });

      await upsertSession(client, {
        weekday: day.weekday,
        label: day.label,
        rateId: day.rateSession,
        name: day.sessionName,
        duration: day.duration,
        mainPart: day.main,
        corePart: day.core,
        cooldown: day.cooldown,
        kind: 'session',
        dayOrder: 1,
      });
    }

    for (const day of REST_DAYS) {
      await upsertSession(client, {
        weekday: day.weekday,
        label: day.label,
        rateId: day.rateId,
        name: day.name,
        duration: day.duration,
        mainPart: day.main,
        kind: 'rest',
        dayOrder: 0,
      });
    }

    await client.query('commit');

    const check = await client.query(
      `select count(*)::int as total,
              count(*) filter (where schedule_config->>'kind' = 'rest')::int as rest,
              count(*) filter (where schedule_config->>'kind' = 'activation')::int as activation
       from public.entrenos_diarios
       where program_id = $1 and schedule_config->>'startDate' = $2`,
      [PROGRAM_ID, WEEK_START],
    );

    const { total, rest, activation } = check.rows[0];
    console.log(`✓ ATHX semana del ${WEEK_START}: ${total} sesiones (${activation} activaciones, ${rest} descansos)`);
    console.log('✓ Lun · Mié · Jue · Sáb entreno · Mar · Vie · Dom descanso');
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
