import 'dotenv/config';
import pg from 'pg';
import { BLOCK, block, qtyItem, setsItem } from './lib/workoutBlockHelpers.mjs';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const PROGRAM_ID = '9b9d3120-adca-4227-aa0d-22fd5f617e61';
const MONDAY_WORKOUT_ID = 'f578ddb1-94fb-4bb9-a87c-7850c478ba5d';
const MONDAY_START = '2026-06-29';

const activationMain = block(BLOCK.activation, {
  title: 'Hybrid ATHX',
  timing: '12 min',
  note: '2 rondas fluidas. Prepara hombro, cadera y cardiaco antes del bloque de fuerza.',
  items: [
    qtyItem('Lateral shuffle', '20 m ida y vuelta'),
    qtyItem('High knees', '20 m'),
    qtyItem('Band pull-apart', '12 reps'),
    qtyItem('KB goblet squat', '10 reps', '16 kg'),
    qtyItem('Inchworm', '5 reps'),
    qtyItem('Jump rope', '40 s'),
    qtyItem("World's greatest stretch", '4 reps por lado'),
  ],
});

const mondayMain = [
  block(BLOCK.strength, {
    title: 'Hombro',
    timing: "cada 2'30\"",
    note: 'Descansa lo que marque el reloj. Últimas 2 series con RIR 1.',
    items: [
      setsItem('LATERAL RAISES DB', 4, 12, '8 kg'),
      setsItem('Elevaciones frontales con disco', 4, 12, '10 kg'),
    ],
  }),
  block(BLOCK.strength, {
    title: 'Press militar',
    timing: "cada 2'30\"",
    note: 'Barra desde rack. Sube solo si mantienes la línea de empuje.',
    items: [setsItem('Shoulder Press', 5, 5, '40/30 kg')],
  }),
  block(BLOCK.technique, {
    title: 'Peso muerto',
    timing: '8 min',
    note: 'Aproximación antes del EMOM. Toca el suelo en cada rep.',
    items: [setsItem('DEADLIFT BARBELL', 3, 3, '70 kg')],
  }),
  block(BLOCK.amrap, {
    title: 'Engine mix',
    timing: "14'",
    note: 'Ritmo sostenible 14 min. Parte las flexiones en series de 6 si hace falta.',
    items: [
      qtyItem('Run', '500 m'),
      qtyItem('PUSH-UP', '18 reps'),
      qtyItem('ANY CARDIO MACH-METROS', '300 m'),
    ],
  }),
  block(BLOCK.emom, {
    title: 'Deadlift + burpee',
    timing: '14 rondas',
    note: 'Alterna deadlift y burpee over the bar. Escala a 80/60 kg si pierdes técnica.',
    items: [
      qtyItem('DEADLIFT BARBELL', '5 reps', '100/70 kg'),
      qtyItem('Burpee Over the Barbell', '10 reps'),
    ],
  }),
].join('\n\n');

const mondayCore = block(BLOCK.strength, {
  title: 'Core anti-rotación',
  timing: '6 min',
  note: 'Cierra sin llegar al fallo.',
  items: [
    setsItem('Pallof press', 2, 12, 'banda'),
    qtyItem('Hollow hold', '2 × 30 s'),
  ],
});

const mondayCooldown =
  'Camina 3 min. Estira hombros y glúteos 30 s por lado. Termina con 2 min de respiración nasal 4-6.';

const mondaySchedule = {
  weekdays: [0],
  recurrence: 'weekly',
  startDate: MONDAY_START,
  dayOrder: 1,
  kind: 'session',
};

const activationSchedule = {
  weekdays: [0],
  recurrence: 'weekly',
  startDate: MONDAY_START,
  dayOrder: 0,
  kind: 'activation',
};

async function main() {
  const url = resolveDatabaseUrl('nsdurlikkuoxqobabixr');
  if (!url) throw new Error('Falta DATABASE_URL');

  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query('begin');

    const existingActivation = await client.query(
      `select id from public.entrenos_diarios
       where program_id = $1
         and name = 'Activación'
         and schedule_config->>'kind' = 'activation'
         and schedule_config->>'startDate' = $2
       limit 1`,
      [PROGRAM_ID, MONDAY_START],
    );

    if (existingActivation.rows[0]) {
      await client.query(
        `update public.entrenos_diarios
         set main_part = $1,
             estimated_duration = $2,
             day_label = 'Lunes',
             schedule_config = $3::jsonb,
             synced_at = now()
         where id = $4`,
        [activationMain, '12 min', JSON.stringify(activationSchedule), existingActivation.rows[0].id],
      );
    } else {
      await client.query(
        `insert into public.entrenos_diarios (
           program_id, workout_date, aimharder_rate_id, name, day_label,
           estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
         ) values (
           $1, $2, $3, 'Activación', 'Lunes', '12 min', '', $4, '', '', $5::jsonb, now()
         )`,
        [PROGRAM_ID, MONDAY_START, -9300629, activationMain, JSON.stringify(activationSchedule)],
      );
    }

    await client.query(
      `update public.entrenos_diarios
       set name = 'Lunes · ATHX',
           estimated_duration = '75 min',
           warmup = '',
           main_part = $1,
           core_part = $2,
           cooldown = $3,
           schedule_config = $4::jsonb,
           synced_at = now()
       where id = $5`,
      [mondayMain, mondayCore, mondayCooldown, JSON.stringify(mondaySchedule), MONDAY_WORKOUT_ID],
    );

    await client.query('commit');
    console.log('✓ ATHX lunes actualizado: activación + sesión mejorada (visible el 31 de agosto y cada lunes)');
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
