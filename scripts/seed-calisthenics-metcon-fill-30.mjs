import 'dotenv/config';
import pg from 'pg';

const PROGRAM_NAME = 'Metcon';
const VENUE = 'calisthenics';

function templateWorkoutDate(sortIndex) {
  const date = new Date(Date.UTC(2000, 0, 3 + sortIndex));
  return date.toISOString().slice(0, 10);
}

/** Casillas 5–30 (slots 4–29). Todas distintas, enfoque parque/calistenia. */
const METCONS = [
  {
    slot: 4,
    duration: '20 min',
    main: [
      'Buy-in',
      '• 400 m run o 2 min de jumping jacks',
      '',
      'Then AMRAP · 12 min',
      '• Pull up: 5 reps',
      '• Push up: 10 reps',
      '• Air squat: 15 reps',
    ].join('\n'),
  },
  {
    slot: 5,
    duration: '18 min',
    main: [
      'AMRAP · 4 min',
      '• Burpee: max reps',
      '',
      'Rest 1 min',
      '',
      'AMRAP · 4 min',
      '• Australian pull up: max reps',
      '',
      'Rest 1 min',
      '',
      'AMRAP · 4 min',
      '• Jump squat: max reps',
    ].join('\n'),
  },
  {
    slot: 6,
    duration: '25 min',
    main: [
      'For Time',
      '• 21-15-9',
      '• Thruster con mochila o goblet squat: reps',
      '• Pull up: reps',
      '',
      'Buy-out',
      '• 50 hollow rocks',
    ].join('\n'),
  },
  {
    slot: 7,
    duration: '16 min',
    main: [
      'Chipper · For Time',
      '• 40 air squat',
      '• 30 push up',
      '• 20 australian pull up',
      '• 10 pike push up',
      '• 20 australian pull up',
      '• 30 push up',
      '• 40 air squat',
    ].join('\n'),
  },
  {
    slot: 8,
    duration: '20 min',
    main: [
      'EMOM · 20 min · 5 bloques',
      'Min 1: Pull up × 5',
      'Min 2: Dip en banco × 10',
      'Min 3: Lunge walking × 12/lado',
      'Min 4: Sit-up × 15',
      'Min 5: Rest',
    ].join('\n'),
  },
  {
    slot: 9,
    duration: '14 min',
    main: [
      'Buy-in',
      '• 3 min de plancha (puedes romper)',
      '',
      'Then AMRAP · 10 min',
      '• Muscle-up transition asistida o chest-to-bar jump: 3 reps',
      '• Push up: 8 reps',
      '• Tuck jump: 8 reps',
    ].join('\n'),
  },
  {
    slot: 10,
    duration: '22 min',
    main: [
      'Every 2 min × 10 (20 min)',
      '• 8 burpee',
      '• 8 australian pull up',
      '• 8 air squat',
      '',
      'Si no cierras en 2 min, reduce 1 rep el siguiente intervalo.',
    ].join('\n'),
  },
  {
    slot: 11,
    duration: '15 min',
    main: [
      'Tabata · 8 rondas (20 s work / 10 s rest) × 3 bloques',
      '',
      'Bloque A: Push up',
      'Bloque B: Jump squat',
      'Bloque C: Hollow hold (isométrico en los 20 s)',
      '',
      '1 min rest entre bloques.',
    ].join('\n'),
  },
  {
    slot: 12,
    duration: '24 min',
    main: [
      'AMRAP · 8 min',
      '• Pull up: 3 reps',
      '• Dip: 6 reps',
      '• Pistol asistido o shrimp squat: 3/lado',
      '',
      'Rest 2 min',
      '',
      'AMRAP · 8 min',
      '• Toes to bar o rodillas a pecho: 6 reps',
      '• Push up: 10 reps',
      '• Broad jump: 6 reps',
    ].join('\n'),
  },
  {
    slot: 13,
    duration: '18 min',
    main: [
      'For Time · 4 rondas',
      '• 12 ring row o australian pull up',
      '• 9 hand-release push up',
      '• 6 jump squat',
      '• 200 m run o 45 s high knees',
      '',
      'Buy-out',
      '• 30 s support hold en anillas o paralelas',
    ].join('\n'),
  },
  {
    slot: 14,
    duration: '12 min',
    main: [
      'Death by burpee',
      'Min 1: 1 burpee',
      'Min 2: 2 burpees',
      'Min 3: 3 burpees…',
      '',
      'Continúa hasta que no completes el minuto.',
      'Anota el último minuto completado.',
    ].join('\n'),
  },
  {
    slot: 15,
    duration: '21 min',
    main: [
      'Buy-in',
      '• 25 pull up (rompe como quieras)',
      '',
      'Then 3 rondas',
      '• 20 push up',
      '• 15 air squat',
      '• 10 pike push up',
      '',
      'For Time. Cap 21 min.',
    ].join('\n'),
  },
  {
    slot: 16,
    duration: '16 min',
    main: [
      'AMRAP · 4 min',
      '• Complex: 1 pull up + 2 push up + 3 air squat',
      '',
      'Rest 1 min · Repite el AMRAP 3 veces (4+1+4+1+4).',
      'Suma el total de complexes.',
    ].join('\n'),
  },
  {
    slot: 17,
    duration: '25 min',
    main: [
      'Ladder · For Time',
      '• 1-2-3-4-5-6-7-8-9-10',
      '• Pull up',
      '• Push up',
      '',
      'Tras cada ronda de pull + push: 5 air squat.',
      'Cap 25 min.',
    ].join('\n'),
  },
  {
    slot: 18,
    duration: '19 min',
    main: [
      'EMOM · 18 min · 6 bloques',
      'Min 1: Australian pull up × 10',
      'Min 2: Diamond push up × 8',
      'Min 3: Jump lunge × 8/lado',
      '',
      'Repite el ciclo 6 veces.',
    ].join('\n'),
  },
  {
    slot: 19,
    duration: '14 min',
    main: [
      'Partner style (solo): “I go / You go” simulado',
      'AMRAP · 12 min',
      '• Set A: 6 pull up',
      '• Set B: 12 push up',
      '• Set C: 18 air squat',
      '',
      'Alterna A-B-C sin parar. Cuenta rondas completas ABC.',
    ].join('\n'),
  },
  {
    slot: 20,
    duration: '20 min',
    main: [
      'Buy-in',
      '• 100 air squat',
      '',
      'Then AMRAP · 10 min',
      '• Chin-over-bar hold o active hang: 15 s',
      '• Push up: 10 reps',
      '• Hollow rock: 15 reps',
      '',
      'Buy-out',
      '• 50 jumping jacks',
    ].join('\n'),
  },
  {
    slot: 21,
    duration: '17 min',
    main: [
      'AMRAP · 5 min',
      '• Burpee pull-up (o burpee + jump to bar): max',
      '',
      'Rest 2 min',
      '',
      'AMRAP · 5 min',
      '• Handstand hold contra muro o pike hold: max segundos acumulados',
      '',
      'Rest 2 min',
      '',
      'AMRAP · 3 min',
      '• Max toe-to-bar o V-up',
    ].join('\n'),
  },
  {
    slot: 22,
    duration: '23 min',
    main: [
      'For Time · 5-4-3-2-1',
      '• Muscle-up asistido o 3 pull up + 3 dip por rep',
      '• 10-8-6-4-2 burpee sincronizados con cada escalón',
      '',
      'Ej.: 5 MU asistidos + 10 burpees, luego 4 + 8…',
    ].join('\n'),
  },
  {
    slot: 23,
    duration: '15 min',
    main: [
      'Grin & bear · AMRAP 15 min',
      '• 5 strict pull up (banda ok)',
      '• 10 ring or bench dip',
      '• 15 walking lunge (total)',
      '• 20 sit-up',
      '',
      'Ritmo sostenible; no spickeas el minuto 1.',
    ].join('\n'),
  },
  {
    slot: 24,
    duration: '18 min',
    main: [
      'Buy-in',
      '• 2 min double-unders o 100 single-unders / jumping jacks',
      '',
      'Then 6 rondas',
      '• 8 push up',
      '• 8 australian pull up',
      '• 8 jump squat',
      '',
      'For Time. Cap 18 min.',
    ].join('\n'),
  },
  {
    slot: 25,
    duration: '12 min',
    main: [
      'AMRAP · 3 min',
      '• Max pull up',
      'Rest 1 min',
      '',
      'AMRAP · 3 min',
      '• Max push up',
      'Rest 1 min',
      '',
      'AMRAP · 3 min',
      '• Max air squat',
      '',
      'Anota las 3 marcas por separado.',
    ].join('\n'),
  },
  {
    slot: 26,
    duration: '26 min',
    main: [
      'Long chipper · For Time',
      '• 30 pull up (rompe)',
      '• 40 push up',
      '• 50 air squat',
      '• 40 sit-up',
      '• 30 lunges/lado',
      '• 20 pike push up',
      '• 10 burpee',
      '',
      'Cap 26 min. Anota tiempo o reps restantes.',
    ].join('\n'),
  },
  {
    slot: 27,
    duration: '16 min',
    main: [
      'EMOM · 16 min',
      'Odd min: 12 australian pull up + 8 push up',
      'Even min: 16 air squat + 12 hollow rock',
      '',
      'Si no cierras el minuto, reduce 2 reps la siguiente vez.',
    ].join('\n'),
  },
  {
    slot: 28,
    duration: '20 min',
    main: [
      'AMRAP · 20 min · “Park Engine”',
      '• 200 m run o 1 min shuttle',
      '• 10 pull up',
      '• 15 push up',
      '• 20 air squat',
      '',
      'Buy-out opcional si acabas con gas:',
      '• 1 min plancha final',
    ].join('\n'),
  },
  {
    slot: 29,
    duration: '15 min',
    main: [
      'Buy-in',
      '• 15 calorie effort: 45 s burpee + 45 s high knees + 45 s mountain climber',
      '',
      'Then AMRAP · 10 min',
      '• 4 pull up',
      '• 8 hand-release push up',
      '• 12 jump squat',
      '',
      'Buy-then (buy-out)',
      '• 25 scapular pull up lentas',
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

    console.log(`→ ${row.name} (${row.id}) — ${existing.rows.length} existentes, ${taken.size} slots`);

    let created = 0;
    for (const metcon of METCONS) {
      if (taken.has(metcon.slot)) {
        console.log(`  · Casilla ${metcon.slot + 1} ya ocupada`);
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
          -Math.abs(Date.now() + metcon.slot * 97 + Math.floor(Math.random() * 1000)),
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

      created += 1;
      console.log(`  ✓ Casilla ${metcon.slot + 1} → ${inserted.rows[0].id}`);
    }

    console.log(`\n✓ Creadas ${created}. Total teórico casillas 1–30.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
