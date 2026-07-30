import 'dotenv/config';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

const PROGRAM_NAMES = {
  fuerza: 'Fuerza fundamental',
  hipertrofia: 'Hypertrofia clásica',
  movilidad: 'Movilidad & Estabilidad',
  pliometria: 'Pliometría',
};

function templateWorkoutDate(sortIndex) {
  const date = new Date(Date.UTC(2000, 0, 3 + sortIndex));
  return date.toISOString().slice(0, 10);
}

function formatScheduleSummary(weekdayLabels) {
  return `${weekdayLabels.join(', ')} · Cada semana`;
}

const WEEKDAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function scheduleFor(weekdayIndex) {
  return {
    weekdays: [weekdayIndex],
    recurrence: 'weekly',
    startDate: '2026-07-06',
  };
}

// sessions definition: { name, weekday, duration, warmup, main, cooldown }
const SESSIONS = {
  fuerza: [
    {
      name: 'Fuerza de piernas',
      weekday: 0,
      duration: '55 min',
      warmup: '5 min de movilidad de cadera y tobillo + series de aproximación con barra vacía.',
      main: [
        [
          'Entrenamiento de Técnica · Bloque A · 5 series',
          '• Back Squat: 5 × 5 · 60 kg',
          '• Front Squat: 3 × 5 · 40 kg',
        ],
        [
          'Entrenamiento de Técnica · Bloque B · 4 series',
          '• Deadlift: 4 × 6 · 70 kg',
          '• Farmer Carry K: 4 × 40 m · 24 kg',
        ],
      ],
      cooldown: 'Estiramientos de cuádriceps, isquios y zona lumbar.',
    },
    {
      name: 'Fuerza de empuje y tracción',
      weekday: 2,
      duration: '55 min',
      warmup: 'Movilidad de hombro + 2 series ligeras de press banca.',
      main: [
        [
          'Entrenamiento de Técnica · Bloque A · 5 series',
          '• press banca: 5 × 5 · 50 kg',
          '• Pendlay Row: 5 × 5 · 45 kg',
        ],
        [
          'Entrenamiento de Técnica · Bloque B · 4 series',
          '• push press: 4 × 6 · 35 kg',
          '• Shoulder Press: 4 × 8 · 20 kg',
        ],
      ],
      cooldown: 'Estiramiento de pecho, dorsales y hombros.',
    },
    {
      name: 'Fuerza de bisagra y core',
      weekday: 4,
      duration: '55 min',
      warmup: 'Activación de glúteo y core, 8 min.',
      main: [
        [
          'Entrenamiento de Técnica · Bloque A · 4 series',
          '• Romanian Deadlift Barbell: 4 × 8 · 50 kg',
          '• Floor Press Barbell: 4 × 8 · 40 kg',
        ],
        [
          'Entrenamiento de Técnica · Bloque B · 4 series',
          '• Farmer Carry Rack: 4 × 30 m · 30 kg',
          '• Plate Shoulder Press: 4 × 10 · 15 kg',
        ],
      ],
      cooldown: 'Movilidad de cadera y respiración diafragmática.',
    },
  ],
  hipertrofia: [
    {
      name: 'Hipertrofia de pecho y brazos',
      weekday: 0,
      duration: '55 min',
      warmup: 'Activación de hombro y calentamiento con series ligeras de press banca.',
      main: [
        [
          'Entrenamiento de Técnica · Bloque A · 4 series',
          '• press banca: 4 × 10 · 40 kg',
          '• Floor Press Barbell: 4 × 10 · 30 kg',
        ],
        [
          'Entrenamiento de Técnica · Bloque B · 3 series',
          '• CURL-BICEPS: 3 × 12 · 12 kg',
          '• Skull Crushers Lying on Floor: 3 × 12 · 15 kg',
        ],
      ],
      cooldown: 'Estiramiento de pecho, tríceps y bíceps.',
    },
    {
      name: 'Hipertrofia de espalda y hombro',
      weekday: 2,
      duration: '55 min',
      warmup: 'Movilidad de escápula y series ligeras de remo.',
      main: [
        [
          'Entrenamiento de Técnica · Bloque A · 4 series',
          '• Pendlay Row: 4 × 10 · 40 kg',
          '• RING-ROW: 4 × 12',
        ],
        [
          'Entrenamiento de Técnica · Bloque B · 3 series',
          '• LATERAL RAISES DB: 3 × 15 · 8 kg',
          '• Elevaciones frontales con disco: 3 × 12 · 10 kg',
          '• PLATE SHOULDER PRESS: 3 × 10 · 15 kg',
        ],
      ],
      cooldown: 'Estiramiento de dorsales, trapecio y hombros.',
    },
    {
      name: 'Hipertrofia de pierna y glúteo',
      weekday: 4,
      duration: '55 min',
      warmup: 'Movilidad de cadera y series ligeras de sentadilla.',
      main: [
        [
          'Entrenamiento de Técnica · Bloque A · 4 series',
          '• Back Squat: 4 × 10 · 50 kg',
          '• Front Squat: 3 × 10 · 35 kg',
        ],
        [
          'Entrenamiento de Técnica · Bloque B · 3 series',
          '• ROMANIAN DEADLIFT BARBELL: 3 × 12 · 45 kg',
          '• GOBLET SQUATS: 3 × 15 · 20 kg',
        ],
      ],
      cooldown: 'Estiramiento de cuádriceps, glúteo e isquios.',
    },
  ],
  movilidad: [
    {
      name: 'Movilidad de cadera y tobillo',
      weekday: 0,
      duration: '40 min',
      warmup: '5 min de respiración diafragmática y activación general.',
      main: [
        [
          'Movilidad · Bloque A · 10 min',
          '• COSSACKS SQUATS: 3 × 10',
          '• AIR LUNGE: 3 × 10',
        ],
        [
          'Movilidad · Bloque B · 8 min',
          '• Frog to L-sit: 3 × 30 s',
          '• ASSISTED PISTOL SQUAT: 3 × 6',
        ],
      ],
      cooldown: 'Estiramiento estático de cadera y tobillo, 5 min.',
    },
    {
      name: 'Estabilidad de core',
      weekday: 2,
      duration: '40 min',
      warmup: 'Activación de core con plancha y respiración, 5 min.',
      main: [
        [
          'Movilidad · Bloque A · 3 rondas',
          '• LEG RAISE: 3 × 12',
          '• v-up: 3 × 12',
        ],
        [
          'Movilidad · Bloque B · 3 rondas',
          '• Knees to elbows: 3 × 10',
          '• COMPRESSION DRILLS: 3 × 30 s',
        ],
      ],
      cooldown: 'Estiramiento de zona lumbar y cadera.',
    },
    {
      name: 'Control y equilibrio unilateral',
      weekday: 4,
      duration: '40 min',
      warmup: 'Movilidad de tobillo y cadera con apoyo unilateral, 6 min.',
      main: [
        [
          'Movilidad · Bloque A · 3 rondas',
          '• single arm DB OH lunge: 3 × 8 · 10 kg',
          '• Synchro Lunge: 3 × 10',
        ],
        [
          'Movilidad · Bloque B · 3 rondas',
          '• One DB OH Reverse Lunges: 3 × 8 · 10 kg',
          '• Wall Walk: 3 × 3',
        ],
      ],
      cooldown: 'Estiramiento de cadera, hombro y equilibrio postural.',
    },
  ],
  pliometria: [
    {
      name: 'Explosividad de salto',
      weekday: 0,
      duration: '35 min',
      warmup: 'Movilidad de tobillo y rodilla + saltos suaves de activación, 6 min.',
      main: [
        [
          'AMRAP · 12 min',
          '• BOX JUMP OVER: 10 reps',
          '• SQUAT AIR: 15 reps',
          '• Wall Ball: 12 reps · 9 kg',
        ],
        [
          'For Time · Cap 10 min',
          '• Burpee over the dumbbell: 15 reps',
        ],
      ],
      cooldown: 'Estiramiento de cuádriceps, pantorrillas y cadera.',
    },
    {
      name: 'Potencia de tren superior',
      weekday: 2,
      duration: '35 min',
      warmup: 'Movilidad de hombro y muñeca + series ligeras de push press, 6 min.',
      main: [
        [
          'EMOM · 16 min',
          '• Devil press: 8 reps · 20 kg',
          '• PUSH JERK DB: 8 reps · 15 kg',
        ],
        [
          'For Time · Cap 8 min',
          '• Hang Power Clean: 10 reps · 30 kg',
          '• MOUNTAIN SHOULDERS: 15 reps',
        ],
      ],
      cooldown: 'Estiramiento de hombro, pecho y espalda alta.',
    },
    {
      name: 'Circuito pliométrico total body',
      weekday: 4,
      duration: '35 min',
      warmup: 'Activación cardiovascular ligera + movilidad dinámica, 6 min.',
      main: [
        [
          'Rounds For Time · 5 rondas',
          '• Sincro Burpees: 10 reps',
          '• Burpee Over the Barbell: 8 reps',
          '• Run: 200 m',
        ],
        [
          'AMRAP · 8 min',
          '• Wall Ball: 15 reps · 9 kg',
        ],
      ],
      cooldown: 'Estiramiento general y respiración de recuperación.',
    },
  ],
};

async function main() {
  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    for (const [key, programName] of Object.entries(PROGRAM_NAMES)) {
      const { rows } = await client.query(
        `select pr.id
         from public.programas pr
         join public.planes pl on pl.id = pr.id_planes
         where pr.name = $1 and pl.descripcion = 'Estandar'
         limit 1`,
        [programName],
      );

      const program = rows[0];
      if (!program) {
        console.warn(`⚠️  Programa no encontrado: ${programName} (plan Estandar). Se omite.`);
        continue;
      }

      const { rows: countRows } = await client.query(
        'select count(*)::int as n from public.entrenos_diarios where program_id = $1',
        [program.id],
      );
      const existingCount = countRows[0]?.n ?? 0;

      const sessions = SESSIONS[key];
      console.log(`\n→ ${programName} (${program.id}) — ${existingCount} sesiones existentes, añadiendo ${sessions.length}`);

      for (let i = 0; i < sessions.length; i += 1) {
        const sortIndex = existingCount + i;
        const session = sessions[i];
        const workoutDate = templateWorkoutDate(sortIndex);
        const syntheticRateId = -Math.abs(Date.now() + sortIndex + Math.floor(Math.random() * 1000));
        const dayLabel = formatScheduleSummary([WEEKDAY_LABELS[session.weekday]]);
        const mainPart = session.main.map((block) => block.join('\n')).join('\n\n');
        const scheduleConfig = scheduleFor(session.weekday);

        const insertResult = await client.query(
          `insert into public.entrenos_diarios (
             program_id, workout_date, aimharder_rate_id, name, day_label,
             estimated_duration, warmup, main_part, core_part, cooldown, schedule_config
           ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           returning id`,
          [
            program.id,
            workoutDate,
            syntheticRateId,
            session.name,
            dayLabel,
            session.duration,
            session.warmup,
            mainPart,
            '',
            session.cooldown,
            JSON.stringify(scheduleConfig),
          ],
        );

        console.log(`  ✓ ${session.name} (${dayLabel}) → ${insertResult.rows[0].id}`);
      }
    }

    console.log('\n✓ Sesiones del plan Estándar creadas correctamente.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
