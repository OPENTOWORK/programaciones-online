/**
 * Programación anual de Crosstraining en formato BEAST MODE
 * (misma estructura que la semana del 7-13 sept 2026).
 *
 * Entreno lun, mar, mié, vie y sáb. Descanso jue y dom.
 * Cada día de entreno: activación + fuerza/haltero + biserie + skills + WOD en dos piezas + movilidad.
 * 13 mesociclos × 4 semanas (intro · carga · pico · descarga).
 */

import { BLOCK, block, qtyItem, setsItem } from './workoutBlockHelpers.mjs';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const DEFAULT_YEAR = 2026;
export const PROGRAM_NAME = 'Crosstraining';
export const MESOCYCLE_WEEKS = 52;

export const WEEKDAY_LABELS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

/** Lun, mar, mié, vie y sáb. */
export const TRAINING_WEEKDAYS = [0, 1, 2, 4, 5];
/** Jueves con recuperación opcional; domingo de descanso vacío. */
export const REST_WEEKDAYS = [3, 6];

export const WEEK_ROLES = ['intro', 'carga', 'pico', 'descarga'];

export const WEEK_ROLE_LABELS = {
  intro: 'Introducción',
  carga: 'Carga',
  pico: 'Pico',
  descarga: 'Descarga',
};

export const PHASES = [
  {
    key: 'acumulacion',
    name: 'Acumulación',
    mesocycles: [1, 2, 3],
    goal: 'Volumen y patrón técnico con cargas moderadas. Motor constante.',
  },
  {
    key: 'intensificacion',
    name: 'Intensificación',
    mesocycles: [4, 5, 6],
    goal: 'Subir intensidad recortando repeticiones sin perder velocidad de barra.',
  },
  {
    key: 'fuerza',
    name: 'Fuerza máxima',
    mesocycles: [7, 8, 9],
    goal: 'Cargas altas, series cortas y máxima calidad técnica.',
  },
  {
    key: 'engine',
    name: 'Engine',
    mesocycles: [10, 11],
    goal: 'Capacidad de trabajo: WODs más largos y haltero a % sostenibles.',
  },
  {
    key: 'realizacion',
    name: 'Realización',
    mesocycles: [12, 13],
    goal: 'Benchmarks controlados y cierre del año en descarga.',
  },
];

const PHASE_BY_MESOCYCLE = new Map(
  PHASES.flatMap((phase) => phase.mesocycles.map((mesocycle) => [mesocycle, phase])),
);

const PERCENT = {
  acumulacion: { intro: 65, carga: 70, pico: 75, descarga: 60 },
  intensificacion: { intro: 75, carga: 80, pico: 85, descarga: 65 },
  fuerza: { intro: 80, carga: 85, pico: 90, descarga: 70 },
  engine: { intro: 75, carga: 80, pico: 85, descarga: 65 },
  realizacion: { intro: 70, carga: 80, pico: 85, descarga: 60 },
};

const SETS = {
  acumulacion: { intro: 5, carga: 5, pico: 5, descarga: 3 },
  intensificacion: { intro: 5, carga: 5, pico: 5, descarga: 3 },
  fuerza: { intro: 6, carga: 6, pico: 5, descarga: 3 },
  engine: { intro: 5, carga: 5, pico: 4, descarga: 3 },
  realizacion: { intro: 4, carga: 4, pico: 3, descarga: 3 },
};

const REPS = {
  acumulacion: { intro: 5, carga: 5, pico: 4, descarga: 5 },
  intensificacion: { intro: 4, carga: 3, pico: 3, descarga: 5 },
  fuerza: { intro: 3, carga: 2, pico: 2, descarga: 3 },
  engine: { intro: 4, carga: 3, pico: 3, descarga: 5 },
  realizacion: { intro: 4, carga: 3, pico: 2, descarga: 5 },
};

function pick(pool, index) {
  return pool[((index % pool.length) + pool.length) % pool.length];
}

function pyramidPercents(peakPercent) {
  if (peakPercent <= 60) {
    return [
      { sets: 2, reps: 5, percent: peakPercent - 5 },
      { sets: 2, reps: 4, percent: peakPercent - 2 },
      { sets: 1, reps: 3, percent: peakPercent },
    ];
  }

  return [
    { sets: 2, reps: 5, percent: peakPercent - 10 },
    { sets: 2, reps: 4, percent: peakPercent - 6 },
    { sets: 2, reps: 3, percent: peakPercent - 2 },
  ];
}

function techPercent(peakPercent, offset = 10) {
  return Math.max(45, peakPercent - offset);
}

function pct(percent) {
  return `${percent}% RM`;
}

function pyramidItems(name, steps) {
  return steps.map((step) => setsItem(name, step.sets, step.reps, pct(step.percent)));
}

function activationBlock(kind, variantIndex) {
  const templates = ACTIVATIONS[kind];
  const template = pick(templates, variantIndex);
  return block(BLOCK.activation, {
    title: 'A) ACTIVACIÓN',
    timing: '10 min',
    note: template.note,
    items: template.items,
  });
}

function cooldownBlock(title, note, items) {
  return block(BLOCK.mobility, { title, timing: '5 min', note, items });
}

const ACTIVATIONS = {
  squat: [
    {
      note: '3 rondas a RPE 4. El air squat va con tempo 3-1-1.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Cat Cow', '10 reps'),
        qtyItem('Hip Up-Hip Down', '10 reps'),
        qtyItem('Shoulder to Floor', '5 + 5 reps'),
        qtyItem('Best Stretch in the World', '5 + 5 reps'),
        qtyItem('Air Squat', '10 reps'),
        qtyItem('Hollow Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Abre cadera antes de cargar la sentadilla.',
      items: [
        qtyItem('Row', '40 s'),
        qtyItem('Worlds Greatest Stretch', '6 + 6 reps'),
        qtyItem('Glute Bridge', '12 reps'),
        qtyItem('Goblet Squat', '8 reps', '16 kg'),
        qtyItem('Cossack Squat', '6 + 6 reps'),
        qtyItem('Air Squat', '10 reps'),
        qtyItem('Dead Bug', '10 reps'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Tempo 3-1-1 en el goblet squat.',
      items: [
        qtyItem('SkiErg', '30 s'),
        qtyItem('Cat Cow', '10 reps'),
        qtyItem('Pigeon Stretch', '20 s'),
        qtyItem('Good Morning', '8 reps'),
        qtyItem('Goblet Squat', '8 reps', '16 kg'),
        qtyItem('Jump Squat', '6 reps'),
        qtyItem('Hollow Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas fluidas. Calienta tobillo y cadera.',
      items: [
        qtyItem('Bike', '45 s'),
        qtyItem('Ankle Rock', '10 + 10 reps'),
        qtyItem('Hip Up-Hip Down', '10 reps'),
        qtyItem('Walking Lunge', '10 reps'),
        qtyItem('Air Squat', '12 reps'),
        qtyItem('Pause Air Squat', '6 reps'),
        qtyItem('Plank', '30 s'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Sentadilla con barra vacía al final.',
      items: [
        qtyItem('Row', '30 s'),
        qtyItem('Best Stretch in the World', '5 + 5 reps'),
        qtyItem('Glute Bridge', '10 reps'),
        qtyItem('Back Squat', '8 reps', 'barra vacía'),
        qtyItem('Lateral Lunge', '6 + 6 reps'),
        qtyItem('Hollow Rocks', '20 s'),
        qtyItem('Bird Dog', '8 reps'),
      ],
    },
    {
      note: '3 rondas. Prioriza rango y control, no velocidad.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Cat Cow', '8 reps'),
        qtyItem('Couch Stretch', '20 s'),
        qtyItem('KB Deadlift', '8 reps', '16 kg'),
        qtyItem('Air Squat', '10 reps'),
        qtyItem('Box Step-up', '6 + 6 reps'),
        qtyItem('Dead Bug', '8 reps'),
      ],
    },
  ],
  press: [
    {
      note: '3 rondas a RPE 4. El strict press se hace con barra vacía.',
      items: [
        qtyItem('Row', '30 s'),
        qtyItem('Pass Through', '10 reps'),
        qtyItem('Scapular Push-up', '10 reps'),
        qtyItem('Band Pull-apart', '10 reps'),
        qtyItem('Strict Press', '8 reps'),
        qtyItem('Dead Bug', '10 reps'),
        qtyItem('Arch Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Abre hombro y muñeca antes de empujar.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Arm Circle', '10 reps'),
        qtyItem('Scapular Push-up', '8 reps'),
        qtyItem('Band Pull-apart', '12 reps'),
        qtyItem('Push Press', '6 reps', 'barra vacía'),
        qtyItem('Shoulder Tap', '10 reps'),
        qtyItem('Hollow Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas. Strict press ligero y control escapular.',
      items: [
        qtyItem('SkiErg', '30 s'),
        qtyItem('Pass Through', '12 reps'),
        qtyItem('Wall Slide', '8 reps'),
        qtyItem('Strict Press', '8 reps', 'barra vacía'),
        qtyItem('Face Pull', '10 reps'),
        qtyItem('Dead Bug', '8 reps'),
        qtyItem('Superman Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Calienta el split antes del jerk.',
      items: [
        qtyItem('Row', '40 s'),
        qtyItem('Pass Through', '10 reps'),
        qtyItem('Split Stance Hold', '20 s'),
        qtyItem('Jerk Dip', '6 reps', 'barra vacía'),
        qtyItem('Band Pull-apart', '10 reps'),
        qtyItem('Strict Press', '6 reps'),
        qtyItem('Arch Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas. Empuje ligero y movilidad de hombro.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Scapular Push-up', '10 reps'),
        qtyItem('Inchworm', '6 reps'),
        qtyItem('DB Strict Press', '8 reps', '8 kg'),
        qtyItem('Band Pull-apart', '12 reps'),
        qtyItem('Hollow Rocks', '20 s'),
        qtyItem('Bird Dog', '8 reps'),
      ],
    },
    {
      note: '3 rondas fluidas. Sin fatigar el hombro.',
      items: [
        qtyItem('Row', '30 s'),
        qtyItem('Pass Through', '8 reps'),
        qtyItem('Push-up', '6 reps'),
        qtyItem('Strict Press', '8 reps', 'barra vacía'),
        qtyItem('Lateral Raise DB', '8 reps', '4 kg'),
        qtyItem('Dead Bug', '10 reps'),
        qtyItem('Plank', '25 s'),
      ],
    },
  ],
  hinge: [
    {
      note: '3 rondas a RPE 4. El good morning se hace con barra vacía.',
      items: [
        qtyItem('SkiErg', '30 s'),
        qtyItem('Good Morning', '10 reps'),
        qtyItem('Glute Bridge', '10 reps'),
        qtyItem('Scapular Pull-up', '8 reps'),
        qtyItem('KB Deadlift', '10 reps'),
        qtyItem('Bird Dog', '8 reps'),
        qtyItem('Superman Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas. Bisagra de cadera antes del peso muerto.',
      items: [
        qtyItem('Row', '40 s'),
        qtyItem('Cat Cow', '10 reps'),
        qtyItem('Good Morning', '8 reps'),
        qtyItem('Single-leg Glute Bridge', '6 + 6 reps'),
        qtyItem('KB Deadlift', '8 reps', '24 kg'),
        qtyItem('Bird Dog', '8 reps'),
        qtyItem('Hollow Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Barra pegada desde el primer calentamiento.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Hip Up-Hip Down', '10 reps'),
        qtyItem('Romanian Deadlift', '8 reps', 'barra vacía'),
        qtyItem('Glute Bridge', '12 reps'),
        qtyItem('Scapular Pull-up', '6 reps'),
        qtyItem('Dead Bug', '10 reps'),
        qtyItem('Superman Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas. Posterior y dorsal sin fatigar.',
      items: [
        qtyItem('SkiErg', '40 s'),
        qtyItem('Good Morning', '8 reps'),
        qtyItem('KB Swing', '10 reps', '16 kg'),
        qtyItem('Worlds Greatest Stretch', '5 + 5 reps'),
        qtyItem('KB Deadlift', '8 reps'),
        qtyItem('Bird Dog', '8 reps'),
        qtyItem('Plank', '25 s'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Pausa en la bisagra.',
      items: [
        qtyItem('Row', '30 s'),
        qtyItem('Cat Cow', '8 reps'),
        qtyItem('Pause Good Morning', '6 reps'),
        qtyItem('Glute Bridge', '10 reps'),
        qtyItem('Hang from Bar', '20 s'),
        qtyItem('KB Deadlift', '10 reps', '16 kg'),
        qtyItem('Hollow Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas fluidas. Calienta isquios y lumbar.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Inchworm', '6 reps'),
        qtyItem('Good Morning', '10 reps'),
        qtyItem('Single-leg RDL', '6 + 6 reps'),
        qtyItem('Scapular Pull-up', '8 reps'),
        qtyItem('Superman Extension', '10 reps'),
        qtyItem('Dead Bug', '8 reps'),
      ],
    },
  ],
  olympic: [
    {
      note: '3 rondas a RPE 4. Toda la parte de barra va con barra vacía.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Muscle Snatch', '8 reps'),
        qtyItem('Front Squat', '8 reps'),
        qtyItem('Tall Clean', '8 reps'),
        qtyItem('Front Rack Stretch', '30 s'),
        qtyItem('Overhead Squat', '8 reps'),
        qtyItem('Pass Through', '10 reps'),
      ],
    },
    {
      note: '3 rondas. Recibes altas y pies consistentes.',
      items: [
        qtyItem('Row', '30 s'),
        qtyItem('Muscle Clean', '6 reps'),
        qtyItem('Front Squat', '6 reps', 'barra vacía'),
        qtyItem('Tall Snatch', '6 reps'),
        qtyItem('Pass Through', '10 reps'),
        qtyItem('Overhead Squat', '6 reps'),
        qtyItem('Hollow Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Snatch balance ligero.',
      items: [
        qtyItem('SkiErg', '30 s'),
        qtyItem('Muscle Snatch', '6 reps'),
        qtyItem('Snatch Balance', '5 reps', 'barra vacía'),
        qtyItem('Overhead Squat', '6 reps'),
        qtyItem('Front Rack Stretch', '20 s'),
        qtyItem('Pass Through', '10 reps'),
        qtyItem('Dead Bug', '8 reps'),
      ],
    },
    {
      note: '3 rondas. Clean y rack frontal antes de cargar.',
      items: [
        qtyItem('Bike', '40 s'),
        qtyItem('Tall Clean', '6 reps'),
        qtyItem('Front Squat', '8 reps', 'barra vacía'),
        qtyItem('Muscle Snatch', '6 reps'),
        qtyItem('Wrist Mobility', '20 s'),
        qtyItem('Overhead Squat', '5 reps'),
        qtyItem('Plank', '25 s'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Codos rápidos y barra pegada.',
      items: [
        qtyItem('Row', '30 s'),
        qtyItem('Hang Muscle Clean', '6 reps'),
        qtyItem('Front Squat', '6 reps'),
        qtyItem('High Hang Snatch', '5 reps', 'barra vacía'),
        qtyItem('Pass Through', '12 reps'),
        qtyItem('Overhead Squat', '6 reps'),
        qtyItem('Hollow Rocks', '20 s'),
      ],
    },
    {
      note: '3 rondas fluidas. Técnica vacía, sin prisa.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Muscle Snatch', '8 reps'),
        qtyItem('Drop Snatch', '5 reps'),
        qtyItem('Front Squat', '6 reps', 'barra vacía'),
        qtyItem('Front Rack Stretch', '25 s'),
        qtyItem('Pass Through', '10 reps'),
        qtyItem('Arch Hold', '20 s'),
      ],
    },
  ],
  general: [
    {
      note: '3 rondas a RPE 4. Calienta lo que vas a usar hoy.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Row', '30 s'),
        qtyItem('SkiErg', '30 s'),
        qtyItem('Cat Cow', '10 reps'),
        qtyItem('Hip Up-Hip Down', '10 reps'),
        qtyItem('Shoulder to Floor', '5 + 5 reps'),
        qtyItem('Superman Extension', '10 reps'),
        qtyItem('Hollow Rocks', '20 s'),
      ],
    },
    {
      note: '3 rondas. Cardio suave y movilidad general.',
      items: [
        qtyItem('Row', '40 s'),
        qtyItem('Bike', '30 s'),
        qtyItem('Worlds Greatest Stretch', '5 + 5 reps'),
        qtyItem('Scapular Push-up', '8 reps'),
        qtyItem('Air Squat', '10 reps'),
        qtyItem('Good Morning', '8 reps'),
        qtyItem('Dead Bug', '10 reps'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Prepara empujes y tracciones.',
      items: [
        qtyItem('SkiErg', '30 s'),
        qtyItem('Pass Through', '10 reps'),
        qtyItem('Band Pull-apart', '12 reps'),
        qtyItem('Push-up', '8 reps'),
        qtyItem('Scapular Pull-up', '6 reps'),
        qtyItem('Air Squat', '8 reps'),
        qtyItem('Hollow Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas. Movilidad de cadera y hombro.',
      items: [
        qtyItem('Bike', '40 s'),
        qtyItem('Cat Cow', '10 reps'),
        qtyItem('Hip Up-Hip Down', '8 reps'),
        qtyItem('Inchworm', '6 reps'),
        qtyItem('Goblet Squat', '8 reps', '12 kg'),
        qtyItem('Band Pull-apart', '10 reps'),
        qtyItem('Plank', '25 s'),
      ],
    },
    {
      note: '3 rondas fluidas. Sin fatigar antes del partner WOD.',
      items: [
        qtyItem('Row', '30 s'),
        qtyItem('SkiErg', '30 s'),
        qtyItem('Best Stretch in the World', '5 + 5 reps'),
        qtyItem('Glute Bridge', '10 reps'),
        qtyItem('Strict Press', '6 reps', 'barra vacía'),
        qtyItem('Air Squat', '10 reps'),
        qtyItem('Superman Hold', '20 s'),
      ],
    },
    {
      note: '3 rondas a RPE 4. Calienta máquina, barra y core.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Row', '30 s'),
        qtyItem('Shoulder to Floor', '5 + 5 reps'),
        qtyItem('KB Deadlift', '8 reps', '16 kg'),
        qtyItem('Push-up', '6 reps'),
        qtyItem('Hollow Rocks', '16 s'),
        qtyItem('Bird Dog', '8 reps'),
      ],
    },
  ],
};

const MONDAY_BISERIE = [
  [setsItem('Pendlay Row', 4, 8, pct(55)), setsItem('Strict Pull-up', 4, 6)],
  [setsItem('Barbell Row', 4, 8, pct(50)), setsItem('Chest-to-bar Pull-up', 4, 5)],
  [setsItem('Pendlay Row', 4, 6, pct(60)), setsItem('Ring Row', 4, 10)],
  [setsItem('Seal Row', 4, 8, '40 kg'), setsItem('Strict Pull-up', 4, 5)],
  [setsItem('Meadows Row', 4, 8, '30 kg'), setsItem('Banded Pull-up', 4, 8)],
  [setsItem('Pendlay Row', 4, 10, pct(50)), setsItem('Chin-up', 4, 6)],
];

const TUESDAY_BISERIE = [
  [setsItem('Bench Row Barbell', 4, 8, '40 kg'), setsItem('Lateral Raise DB', 4, 8, '9 kg')],
  [setsItem('Chest-supported Row', 4, 10, '35 kg'), setsItem('DB Strict Press', 4, 8, '12 kg')],
  [setsItem('Bench Row Barbell', 4, 8, '45 kg'), setsItem('Face Pull', 4, 12)],
  [setsItem('Single-arm DB Row', 4, 8, '22.5 kg'), setsItem('Lateral Raise DB', 4, 10, '8 kg')],
  [setsItem('Barbell Row', 4, 8, pct(50)), setsItem('Rear Delt Fly', 4, 12, '6 kg')],
  [setsItem('Bench Row Barbell', 4, 10, '35 kg'), setsItem('Arnold Press', 4, 8, '10 kg')],
];

const WEDNESDAY_BISERIE = [
  [setsItem('Barbell Hip Thrust', 4, 8, '65 kg'), setsItem('Good Morning Barbell', 4, 8, '35 kg')],
  [setsItem('Romanian Deadlift', 4, 8, pct(55)), setsItem('Glute Bridge', 4, 12)],
  [setsItem('Barbell Hip Thrust', 4, 10, '60 kg'), setsItem('Back Extension', 4, 10)],
  [setsItem('KB Swing', 4, 12, '24 kg'), setsItem('Good Morning Barbell', 4, 8, '30 kg')],
  [setsItem('Single-leg RDL', 4, 8, '16 kg'), setsItem('Hip Thrust', 4, 8, '50 kg')],
  [setsItem('Barbell Hip Thrust', 4, 8, '70 kg'), setsItem('Nordic Curl', 4, 5)],
];

const FRIDAY_BISERIE = [
  [setsItem('Goblet Squat', 4, 10, '24 kg'), setsItem('Box Jump', 4, 5)],
  [setsItem('Front Squat', 4, 6, pct(50)), setsItem('Box Jump Over', 4, 6)],
  [setsItem('Goblet Squat', 4, 8, '28 kg'), setsItem('Broad Jump', 4, 4)],
  [setsItem('Pause Goblet Squat', 4, 8, '24 kg'), setsItem('Box Jump', 4, 6)],
  [setsItem('Bulgarian Split Squat', 4, 8, '16 kg'), setsItem('Box Step-up', 4, 8)],
  [setsItem('Goblet Squat', 4, 10, '20 kg'), setsItem('Jump Squat', 4, 6)],
];

const SATURDAY_SUPER = [
  [setsItem('Ring Dip', 4, 10), setsItem('Weighted Strict Pull-up', 4, 6, '12 kg')],
  [setsItem('Bench Dip', 4, 12), setsItem('Strict Pull-up', 4, 6)],
  [setsItem('Ring Dip', 4, 8), setsItem('Chest-to-bar Pull-up', 4, 5)],
  [setsItem('Push-up', 4, 12), setsItem('Chin-up', 4, 6)],
  [setsItem('Deficit Push-up', 4, 10), setsItem('Weighted Strict Pull-up', 4, 5, '8 kg')],
  [setsItem('Ring Dip', 4, 8), setsItem('Banded Pull-up', 4, 8)],
];

const SATURDAY_ACCESSORY = [
  [setsItem('DB Bench Press', 3, 10, '15 kg'), setsItem('Band Pull-apart', 3, 12)],
  [setsItem('Larsen Press', 3, 8, pct(55)), setsItem('Face Pull', 3, 12)],
  [setsItem('DB Bench Press', 3, 8, '18 kg'), setsItem('Band Pull-apart', 3, 15)],
  [setsItem('Close-grip Bench Press', 3, 8, pct(55)), setsItem('Rear Delt Fly', 3, 12, '6 kg')],
  [setsItem('DB Floor Press', 3, 10, '16 kg'), setsItem('Band Pull-apart', 3, 12)],
  [setsItem('DB Bench Press', 3, 12, '12 kg'), setsItem('YTW Raise', 3, 8)],
];

function wodBlock(def) {
  return block(def.type, {
    title: def.title,
    timing: def.timing,
    rounds: def.rounds,
    note: def.note,
    items: def.items,
  });
}

const MONDAY_WOD1 = [
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '14 min',
    note: 'Rx kettlebell 24/16 kg y cajón 60/50 cm. Ritmo constante, sin romper las series largas.',
    items: [
      qtyItem('ANY CARDIO MACH-CAL', '12/10 cal'),
      qtyItem('RUSSIAN KTB SWING', '15 reps', '24 kg'),
      qtyItem('BOX JUMP OVER', '12 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '12 min',
    note: 'Rx kettlebell 24/16 kg. No sprints la primera vuelta.',
    items: [
      qtyItem('Row', '12/10 cal'),
      qtyItem('KB Deadlift', '12 reps', '32 kg'),
      qtyItem('Box Jump', '10 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 1',
    timing: '16 min',
    rounds: '5 rondas',
    note: 'Time cap 16 min. Bike suave si hace falta bajar calorías.',
    items: [
      qtyItem('Bike', '10/8 cal'),
      qtyItem('RUSSIAN KTB SWING', '20 reps', '24 kg'),
      qtyItem('Burpee Over the Line', '8 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '10 min',
    note: 'Ritmo de conversación. Escala el cajón si pierdes el bounce.',
    items: [
      qtyItem('SkiErg', '12/10 cal'),
      qtyItem('Goblet Squat', '15 reps', '24 kg'),
      qtyItem('BOX JUMP OVER', '10 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '14 min',
    note: 'Rx wall ball 9/6 kg. Parte series antes de fallar.',
    items: [
      qtyItem('ANY CARDIO MACH-CAL', '10/8 cal'),
      qtyItem('Wall Ball', '20 reps', '9 kg'),
      qtyItem('Box Step-up', '12 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 1',
    timing: '15 min',
    rounds: '4 rondas',
    note: 'Time cap 15 min. Swing ruso, cadera explosiva.',
    items: [
      qtyItem('Run', '200 m'),
      qtyItem('RUSSIAN KTB SWING', '20 reps', '24 kg'),
      qtyItem('Air Squat', '20 reps'),
    ],
  },
];

const MONDAY_WOD2 = [
  {
    type: BLOCK.forTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '16 min',
    note: 'Descansa 5 min antes de empezar. Time cap 16 min y wall ball a 6/4 kg si necesitas partir series.',
    items: [
      qtyItem('Run', '400 m'),
      qtyItem('Wall Ball', '40 reps', '9 kg'),
      qtyItem('RUSSIAN KTB SWING', '40 reps', '24 kg'),
      qtyItem('Run', '300 m'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '14 min',
    note: 'Descansa 4 min. Time cap 14 min.',
    items: [
      qtyItem('Row', '500 m'),
      qtyItem('Wall Ball', '30 reps', '9 kg'),
      qtyItem('KB Deadlift', '30 reps', '32 kg'),
      qtyItem('Row', '400 m'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'G) WODCITO PIEZA 2',
    timing: '12 min',
    note: 'Descansa 5 min. Ritmo estable en la máquina.',
    items: [
      qtyItem('ANY CARDIO MACH-CAL', '15/12 cal'),
      qtyItem('Thruster Barbell', '10 reps', '35 kg'),
      qtyItem('Toes to Bar', '8 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '18 min',
    note: 'Descansa 5 min. Chipper: completa y escala si hace falta.',
    items: [
      qtyItem('Run', '400 m'),
      qtyItem('Wall Ball', '50 reps', '9 kg'),
      qtyItem('Box Jump Over', '40 reps'),
      qtyItem('Run', '400 m'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '16 min',
    rounds: '4 rondas',
    note: 'Descansa 4 min. Time cap 16 min.',
    items: [
      qtyItem('Bike', '12/10 cal'),
      qtyItem('Wall Ball', '15 reps', '9 kg'),
      qtyItem('Burpee', '10 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '15 min',
    note: 'Descansa 5 min. Time cap 15 min.',
    items: [
      qtyItem('SkiErg', '400 m'),
      qtyItem('RUSSIAN KTB SWING', '50 reps', '24 kg'),
      qtyItem('Air Squat', '50 reps'),
      qtyItem('SkiErg', '300 m'),
    ],
  },
];

const TUESDAY_WOD1 = [
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 1',
    timing: '18 min',
    rounds: '4 rondas',
    note: 'Time cap 18 min. Rx thruster 43/30 kg.',
    items: [
      qtyItem('ANY CARDIO MACH-CAL', '12/10 cal'),
      qtyItem('THRUSTER BARBELL', '10 reps', '43 kg'),
      qtyItem('Strict Pull-up', '8 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '15 min',
    note: 'Rx thruster 40/25 kg. Parte pull-ups con banda si hace falta.',
    items: [
      qtyItem('Row', '12/10 cal'),
      qtyItem('Push Press', '12 reps', '35 kg'),
      qtyItem('Toes to Bar', '10 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 1',
    timing: '16 min',
    rounds: '5 rondas',
    note: 'Time cap 16 min.',
    items: [
      qtyItem('Bike', '10/8 cal'),
      qtyItem('THRUSTER BARBELL', '8 reps', '40 kg'),
      qtyItem('Chest-to-bar Pull-up', '6 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '12 min',
    note: 'Devil press 15/10 kg. No rompas el ritmo de la máquina.',
    items: [
      qtyItem('SkiErg', '10/8 cal'),
      qtyItem('DEVILPRESS', '8 reps', '15 kg'),
      qtyItem('Strict Pull-up', '6 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 1',
    timing: '20 min',
    rounds: '4 rondas',
    note: 'Time cap 20 min. Thruster más ligero si el jerk ya fatigó hombro.',
    items: [
      qtyItem('Run', '200 m'),
      qtyItem('THRUSTER BARBELL', '12 reps', '35 kg'),
      qtyItem('Ring Row', '12 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '14 min',
    note: 'Rx 43/30 kg. Series cortas y limpias.',
    items: [
      qtyItem('ANY CARDIO MACH-CAL', '10/8 cal'),
      qtyItem('Hang Power Clean', '8 reps', '40 kg'),
      qtyItem('Push-up', '12 reps'),
    ],
  },
];

const TUESDAY_WOD2 = [
  {
    type: BLOCK.emom,
    title: 'G) WODCITO PIEZA 2',
    timing: '12 min',
    note: 'Descansa 5 min antes de empezar. Objetivo: cerrar cada minuto con 15 s libres.',
    items: [
      qtyItem('Bike', '10/8 cal'),
      qtyItem('KB Deadlift', '12 reps', '24 kg'),
      qtyItem('Burpee Over the Line', '8 reps'),
      'Descanso',
    ],
  },
  {
    type: BLOCK.emom,
    title: 'G) WODCITO PIEZA 2',
    timing: '16 min',
    note: 'Descansa 4 min. Un movimiento por minuto.',
    items: [
      qtyItem('Row', '12/10 cal'),
      qtyItem('DB Push Press', '10 reps', '15 kg'),
      qtyItem('Toes to Bar', '8 reps'),
      'Descanso',
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '12 min',
    note: 'Descansa 5 min. Time cap 12 min.',
    items: [
      qtyItem('ANY CARDIO MACH-CAL', '30 cal'),
      qtyItem('THRUSTER BARBELL', '30 reps', '35 kg'),
      qtyItem('ANY CARDIO MACH-CAL', '20 cal'),
    ],
  },
  {
    type: BLOCK.emom,
    title: 'G) WODCITO PIEZA 2',
    timing: '12 min',
    note: 'Descansa 5 min. Escala calories si no quedan 10 s.',
    items: [
      qtyItem('SkiErg', '10/8 cal'),
      qtyItem('Hang Power Clean', '8 reps', '40 kg'),
      qtyItem('Push-up', '10 reps'),
      'Descanso',
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'G) WODCITO PIEZA 2',
    timing: '10 min',
    note: 'Descansa 4 min. Sprint controlado.',
    items: [
      qtyItem('Bike', '8/6 cal'),
      qtyItem('DEVILPRESS', '6 reps', '15 kg'),
      qtyItem('Burpee', '6 reps'),
    ],
  },
  {
    type: BLOCK.emom,
    title: 'G) WODCITO PIEZA 2',
    timing: '12 min',
    note: 'Descansa 5 min. Cierra el minuto con margen.',
    items: [
      qtyItem('Row', '10/8 cal'),
      qtyItem('KB Deadlift', '10 reps', '32 kg'),
      qtyItem('Box Jump Over', '8 reps'),
      'Descanso',
    ],
  },
];

const WEDNESDAY_WOD1 = [
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 1',
    timing: '20 min',
    rounds: '4 rondas',
    note: 'Time cap 20 min. Rx mancuerna 22.5/15 kg y ritmo de conversación en la carrera.',
    items: [
      qtyItem('Run', '400 m'),
      qtyItem('ALTERNATIVE HANG DB SNATCH', '20 reps', '22.5 kg'),
      qtyItem('PUSH-UP', '20 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '16 min',
    note: 'DB snatch 22.5/15 kg. Cambia de mano en el suelo.',
    items: [
      qtyItem('Row', '250 m'),
      qtyItem('ALTERNATIVE HANG DB SNATCH', '16 reps', '22.5 kg'),
      qtyItem('Walking Lunge', '16 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 1',
    timing: '18 min',
    rounds: '5 rondas',
    note: 'Time cap 18 min.',
    items: [
      qtyItem('Run', '300 m'),
      qtyItem('KB Deadlift', '16 reps', '32 kg'),
      qtyItem('PUSH-UP', '16 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '14 min',
    note: 'No sprints el run. Push-up en rodillas si rompes la serie.',
    items: [
      qtyItem('SkiErg', '300 m'),
      qtyItem('Hang Power Clean', '10 reps', '50 kg'),
      qtyItem('PUSH-UP', '15 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 1',
    timing: '16 min',
    rounds: '4 rondas',
    note: 'Time cap 16 min.',
    items: [
      qtyItem('Bike', '15/12 cal'),
      qtyItem('ALTERNATIVE HANG DB SNATCH', '16 reps', '20 kg'),
      qtyItem('Box Jump', '12 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '12 min',
    note: 'Ritmo constante. Escala el snatch a 15/10 kg.',
    items: [
      qtyItem('Run', '200 m'),
      qtyItem('ALTERNATIVE HANG DB SNATCH', '12 reps', '22.5 kg'),
      qtyItem('Burpee', '8 reps'),
    ],
  },
];

const WEDNESDAY_WOD2 = [
  {
    type: BLOCK.forTime,
    title: 'G) WODCITO PIEZA 2',
    note: 'Descansa 5 min antes de empezar. Sin time cap: escala el handstand walk con 20 shoulder taps y prioriza completar.',
    items: [
      qtyItem('ANY CARDIO MACH-CAL', '50 cal'),
      qtyItem('Handstand Walk', '10 m'),
      qtyItem('ANY CARDIO MACH-CAL', '40 cal'),
      qtyItem('Handstand Walk', '10 m'),
      qtyItem('ANY CARDIO MACH-CAL', '30 cal'),
      qtyItem('Handstand Walk', '10 m'),
      qtyItem('ANY CARDIO MACH-CAL', '20 cal'),
      qtyItem('Handstand Walk', '10 m'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '20 min',
    note: 'Descansa 5 min. Time cap 20 min. Escala HSW con pike walk.',
    items: [
      qtyItem('Row', '40 cal'),
      qtyItem('Handstand Walk', '8 m'),
      qtyItem('Row', '30 cal'),
      qtyItem('Handstand Walk', '8 m'),
      qtyItem('Row', '20 cal'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'G) WODCITO PIEZA 2',
    timing: '15 min',
    note: 'Descansa 4 min. Shoulder taps si no hay espacio para walk.',
    items: [
      qtyItem('Bike', '15/12 cal'),
      qtyItem('Shoulder Tap', '20 reps'),
      qtyItem('Sit-up', '20 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '18 min',
    note: 'Descansa 5 min. Chipper de máquina y core.',
    items: [
      qtyItem('SkiErg', '40 cal'),
      qtyItem('Toes to Bar', '30 reps'),
      qtyItem('SkiErg', '30 cal'),
      qtyItem('Toes to Bar', '20 reps'),
      qtyItem('SkiErg', '20 cal'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '16 min',
    rounds: '4 rondas',
    note: 'Descansa 4 min. Time cap 16 min.',
    items: [
      qtyItem('ANY CARDIO MACH-CAL', '15/12 cal'),
      qtyItem('Handstand Walk', '6 m'),
      qtyItem('GHD Sit-up', '12 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '14 min',
    note: 'Descansa 5 min. Time cap 14 min.',
    items: [
      qtyItem('Run', '400 m'),
      qtyItem('Handstand Push-up', '20 reps'),
      qtyItem('Run', '400 m'),
      qtyItem('PUSH-UP', '30 reps'),
    ],
  },
];

const FRIDAY_WOD1 = [
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '12 min',
    note: 'Rx wall ball 9/6 kg.',
    items: [
      qtyItem('ANY CARDIO MACH-METROS', '200 m'),
      qtyItem('Wall Ball', '15 reps', '9 kg'),
      qtyItem('Burpee Over the Barbell', '10 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '10 min',
    note: 'Ritmo alto pero sostenible.',
    items: [
      qtyItem('Row', '150 m'),
      qtyItem('Overhead Squat', '8 reps', '35 kg'),
      qtyItem('Burpee', '8 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 1',
    timing: '14 min',
    rounds: '4 rondas',
    note: 'Time cap 14 min.',
    items: [
      qtyItem('SkiErg', '200 m'),
      qtyItem('Wall Ball', '20 reps', '9 kg'),
      qtyItem('Box Jump Over', '12 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '12 min',
    note: 'Power snatch ligero. Técnica por encima de carga.',
    items: [
      qtyItem('Bike', '12/10 cal'),
      qtyItem('Power Snatch', '8 reps', '35 kg'),
      qtyItem('Lateral Burpee', '8 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 1',
    timing: '14 min',
    note: 'Rx 9/6 kg. Parte wall balls de 8-8.',
    items: [
      qtyItem('ANY CARDIO MACH-METROS', '250 m'),
      qtyItem('Wall Ball', '18 reps', '9 kg'),
      qtyItem('Toes to Bar', '8 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 1',
    timing: '12 min',
    rounds: '3 rondas',
    note: 'Time cap 12 min.',
    items: [
      qtyItem('Run', '200 m'),
      qtyItem('Wall Ball', '20 reps', '9 kg'),
      qtyItem('Burpee Over the Barbell', '12 reps'),
    ],
  },
];

const FRIDAY_WOD2 = [
  {
    type: BLOCK.roundsForTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '16 min',
    rounds: '4 rondas',
    note: 'Descansa 4 min antes de empezar. Time cap 16 min y rondas parejas: no sprintes la primera.',
    items: [
      qtyItem('Bike', '10/8 cal'),
      qtyItem('DB Front Rack Reverse Lunge', '8 reps', '22.5 kg'),
      qtyItem('Burpee Box Jump-over', '6 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'G) WODCITO PIEZA 2',
    timing: '14 min',
    note: 'Descansa 4 min. Lunges con mancuernas 20/12 kg.',
    items: [
      qtyItem('Row', '12/10 cal'),
      qtyItem('DB Front Rack Reverse Lunge', '12 reps', '20 kg'),
      qtyItem('Box Jump Over', '8 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '15 min',
    note: 'Descansa 5 min. Time cap 15 min.',
    items: [
      qtyItem('ANY CARDIO MACH-CAL', '40 cal'),
      qtyItem('Front Squat', '30 reps', '50 kg'),
      qtyItem('ANY CARDIO MACH-CAL', '30 cal'),
      qtyItem('Burpee', '20 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '16 min',
    rounds: '5 rondas',
    note: 'Descansa 4 min. Time cap 16 min.',
    items: [
      qtyItem('SkiErg', '8/6 cal'),
      qtyItem('Hang Power Snatch', '6 reps', '35 kg'),
      qtyItem('Burpee Box Jump-over', '6 reps'),
    ],
  },
  {
    type: BLOCK.emom,
    title: 'G) WODCITO PIEZA 2',
    timing: '12 min',
    note: 'Descansa 4 min. Cierra el minuto con 10 s libres.',
    items: [
      qtyItem('Bike', '10/8 cal'),
      qtyItem('Goblet Squat', '12 reps', '24 kg'),
      qtyItem('Lateral Burpee', '8 reps'),
      'Descanso',
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'G) WODCITO PIEZA 2',
    timing: '14 min',
    rounds: '4 rondas',
    note: 'Descansa 4 min. Time cap 14 min.',
    items: [
      qtyItem('Run', '200 m'),
      qtyItem('DB Front Rack Reverse Lunge', '10 reps', '22.5 kg'),
      qtyItem('Wall Ball', '12 reps', '9 kg'),
    ],
  },
];

const SATURDAY_WOD1 = [
  {
    type: BLOCK.amrap,
    title: 'E) WODCITO PIEZA 1',
    timing: '30 min',
    note: 'En parejas, you go I go. Rx power clean 50/35 kg.',
    items: [
      qtyItem('Run Synchro', '400 m'),
      qtyItem('POWER CLEAN BARBELL', '20 reps', '50 kg'),
      qtyItem('Synchro Lunge', '20 reps'),
      qtyItem('PUSH-UP', '30 reps'),
      qtyItem('Synchro Burpee', '10 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'E) WODCITO PIEZA 1',
    timing: '24 min',
    note: 'En parejas, you go I go. Rx 45/30 kg.',
    items: [
      qtyItem('Row Synchro', '300 m'),
      qtyItem('Hang Power Clean', '16 reps', '50 kg'),
      qtyItem('Synchro Squat', '20 reps'),
      qtyItem('Ring Dip', '16 reps'),
      qtyItem('Synchro Burpee', '8 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'E) WODCITO PIEZA 1',
    timing: '28 min',
    rounds: '5 rondas',
    note: 'En parejas. Time cap 28 min. Reparto libre en barra.',
    items: [
      qtyItem('Run', '200 m'),
      qtyItem('POWER CLEAN BARBELL', '12 reps', '50 kg'),
      qtyItem('Box Jump Over', '12 reps'),
      qtyItem('PUSH-UP', '16 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'E) WODCITO PIEZA 1',
    timing: '20 min',
    note: 'En parejas, you go I go.',
    items: [
      qtyItem('ANY CARDIO MACH-METROS', '250 m'),
      qtyItem('Deadlift', '16 reps', '70 kg'),
      qtyItem('Synchro Lunge', '16 reps'),
      qtyItem('PUSH-UP', '20 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'E) WODCITO PIEZA 1',
    timing: '30 min',
    note: 'En parejas. Power clean 50/35 kg y ritmo de conversación.',
    items: [
      qtyItem('Run Synchro', '300 m'),
      qtyItem('POWER CLEAN BARBELL', '16 reps', '50 kg'),
      qtyItem('Wall Ball', '20 reps', '9 kg'),
      qtyItem('Synchro Burpee', '10 reps'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'E) WODCITO PIEZA 1',
    timing: '26 min',
    rounds: '4 rondas',
    note: 'En parejas. Time cap 26 min.',
    items: [
      qtyItem('SkiErg', '250 m'),
      qtyItem('Hang Power Clean', '14 reps', '50 kg'),
      qtyItem('Synchro Lunge', '20 reps'),
      qtyItem('Toes to Bar', '12 reps'),
    ],
  },
];

const SATURDAY_WOD2 = [
  {
    type: BLOCK.forTime,
    title: 'F) WODCITO PIEZA 2',
    timing: '32 min',
    note: 'Descansa 5 min antes de empezar. En parejas con reparto libre y time cap 32 min.',
    items: [
      qtyItem('ANY CARDIO MACH-METROS', '800 m'),
      qtyItem('DEADLIFT BARBELL', '60 reps', '70 kg'),
      qtyItem('ANY CARDIO MACH-METROS', '800 m'),
      qtyItem('HANG POWER CLEAN BARBELL', '50 reps', '50 kg'),
      qtyItem('ANY CARDIO MACH-METROS', '800 m'),
      qtyItem('Wall Ball', '40 reps', '9 kg'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'F) WODCITO PIEZA 2',
    timing: '28 min',
    note: 'Descansa 5 min. En parejas, time cap 28 min.',
    items: [
      qtyItem('Row', '600 m'),
      qtyItem('DEADLIFT BARBELL', '50 reps', '80 kg'),
      qtyItem('Row', '600 m'),
      qtyItem('Front Squat', '40 reps', '50 kg'),
      qtyItem('Row', '600 m'),
      qtyItem('PUSH-UP', '40 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'F) WODCITO PIEZA 2',
    timing: '24 min',
    note: 'Descansa 4 min. En parejas, you go I go.',
    items: [
      qtyItem('Bike', '15/12 cal'),
      qtyItem('Hang Power Clean', '10 reps', '50 kg'),
      qtyItem('Box Jump Over', '10 reps'),
      qtyItem('Wall Ball', '15 reps', '9 kg'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'F) WODCITO PIEZA 2',
    timing: '30 min',
    note: 'Descansa 5 min. Chipper en parejas, time cap 30 min.',
    items: [
      qtyItem('Run', '800 m'),
      qtyItem('DEADLIFT BARBELL', '40 reps', '90 kg'),
      qtyItem('Run', '600 m'),
      qtyItem('POWER CLEAN BARBELL', '40 reps', '50 kg'),
      qtyItem('Run', '400 m'),
      qtyItem('Burpee', '30 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'F) WODCITO PIEZA 2',
    timing: '26 min',
    note: 'Descansa 5 min. Reparto libre. Time cap 26 min.',
    items: [
      qtyItem('SkiErg', '700 m'),
      qtyItem('DEADLIFT BARBELL', '50 reps', '70 kg'),
      qtyItem('SkiErg', '700 m'),
      qtyItem('THRUSTER BARBELL', '40 reps', '40 kg'),
      qtyItem('SkiErg', '500 m'),
    ],
  },
  {
    type: BLOCK.roundsForTime,
    title: 'F) WODCITO PIEZA 2',
    timing: '24 min',
    rounds: '4 rondas',
    note: 'Descansa 4 min. En parejas. Time cap 24 min.',
    items: [
      qtyItem('ANY CARDIO MACH-METROS', '400 m'),
      qtyItem('Hang Power Clean', '12 reps', '50 kg'),
      qtyItem('Synchro Burpee', '8 reps'),
      qtyItem('Wall Ball', '16 reps', '9 kg'),
    ],
  },
];

const MONDAY_CORE = [
  [
    qtyItem('GHD Sit-up', '10 reps'),
    qtyItem('Plank', '30 s'),
    qtyItem('ISO Squat', '40 s'),
    'Descanso',
  ],
  [
    qtyItem('Toes to Bar', '8 reps'),
    qtyItem('Hollow Hold', '25 s'),
    qtyItem('Pause Air Squat', '10 reps'),
    'Descanso',
  ],
  [
    qtyItem('GHD Sit-up', '8 reps'),
    qtyItem('Side Plank', '20 s'),
    qtyItem('ISO Squat', '30 s'),
    'Descanso',
  ],
  [
    qtyItem('Sit-up', '15 reps'),
    qtyItem('Plank', '40 s'),
    qtyItem('Goblet Squat Hold', '30 s'),
    'Descanso',
  ],
  [
    qtyItem('GHD Sit-up', '12 reps'),
    qtyItem('Dead Bug', '10 reps'),
    qtyItem('ISO Squat', '35 s'),
    'Descanso',
  ],
  [
    qtyItem('Toes to Bar', '10 reps'),
    qtyItem('Hollow Rocks', '16 s'),
    qtyItem('Wall Sit', '30 s'),
    'Descanso',
  ],
];

const TUESDAY_SKILLS = [
  [
    qtyItem('Toes to Bar', '10 reps'),
    qtyItem('DEVILPRESS', '6 reps', '15 kg'),
    qtyItem('ANY CARDIO MACH-CAL', '12/10 cal'),
    'Descanso',
  ],
  [
    qtyItem('Knee Raise', '12 reps'),
    qtyItem('DEVILPRESS', '5 reps', '15 kg'),
    qtyItem('Row', '10/8 cal'),
    'Descanso',
  ],
  [
    qtyItem('Toes to Bar', '8 reps'),
    qtyItem('DB Snatch', '6 reps', '20 kg'),
    qtyItem('Bike', '10/8 cal'),
    'Descanso',
  ],
  [
    qtyItem('Chest-to-bar Pull-up', '6 reps'),
    qtyItem('DEVILPRESS', '6 reps', '12 kg'),
    qtyItem('SkiErg', '10/8 cal'),
    'Descanso',
  ],
  [
    qtyItem('Toes to Bar', '12 reps'),
    qtyItem('Hang DB Snatch', '8 reps', '15 kg'),
    qtyItem('ANY CARDIO MACH-CAL', '10/8 cal'),
    'Descanso',
  ],
  [
    qtyItem('Strict T2B', '6 reps'),
    qtyItem('DEVILPRESS', '4 reps', '17.5 kg'),
    qtyItem('Row', '12/10 cal'),
    'Descanso',
  ],
];

const WEDNESDAY_CORE = [
  [
    qtyItem('Hollow Hold', '20 s'),
    qtyItem('Arch Hold', '20 s'),
    qtyItem('Scapular Pull-up', '8 reps'),
    'Descanso',
  ],
  [
    qtyItem('Hollow Rocks', '16 s'),
    qtyItem('Superman Hold', '20 s'),
    qtyItem('Dead Hang', '20 s'),
    'Descanso',
  ],
  [
    qtyItem('Hollow Hold', '25 s'),
    qtyItem('Arch Hold', '20 s'),
    qtyItem('Scapular Pull-up', '6 reps'),
    'Descanso',
  ],
  [
    qtyItem('Sit-up', '15 reps'),
    qtyItem('Arch Hold', '25 s'),
    qtyItem('Band Pull-apart', '12 reps'),
    'Descanso',
  ],
  [
    qtyItem('Hollow Hold', '20 s'),
    qtyItem('Bird Dog', '8 reps'),
    qtyItem('Scapular Pull-up', '8 reps'),
    'Descanso',
  ],
  [
    qtyItem('Dead Bug', '10 reps'),
    qtyItem('Arch Hold', '20 s'),
    qtyItem('Hang from Bar', '25 s'),
    'Descanso',
  ],
];

const FRIDAY_SKILLS = [
  [
    qtyItem('Handstand Push-up', '6 reps'),
    qtyItem('Beat Swing', '8 reps'),
    qtyItem('ANY CARDIO MACH-CAL', '10/8 cal'),
    'Descanso',
  ],
  [
    qtyItem('Pike Push-up', '8 reps'),
    qtyItem('Beat Swing', '10 reps'),
    qtyItem('Bike', '8/6 cal'),
    'Descanso',
  ],
  [
    qtyItem('Handstand Push-up', '5 reps'),
    qtyItem('Kipping Swing', '8 reps'),
    qtyItem('Row', '10/8 cal'),
    'Descanso',
  ],
  [
    qtyItem('Box HSPU', '6 reps'),
    qtyItem('Beat Swing', '8 reps'),
    qtyItem('SkiErg', '10/8 cal'),
    'Descanso',
  ],
  [
    qtyItem('Handstand Push-up', '8 reps'),
    qtyItem('Toes to Bar', '6 reps'),
    qtyItem('ANY CARDIO MACH-CAL', '8/6 cal'),
    'Descanso',
  ],
  [
    qtyItem('Deficit HSPU', '4 reps'),
    qtyItem('Beat Swing', '10 reps'),
    qtyItem('Bike', '10/8 cal'),
    'Descanso',
  ],
];

const REST_VARIANTS = [
  [
    qtyItem('Bike', '3 min'),
    qtyItem('Row', '3 min'),
    qtyItem('SkiErg', '3 min'),
    qtyItem('Estiramiento de cadera', '5 min'),
    qtyItem('Estiramiento de espalda', '5 min'),
  ],
  [
    qtyItem('Caminar', '10 min'),
    qtyItem('Cat Cow', '10 reps'),
    qtyItem('Worlds Greatest Stretch', '5 + 5 reps'),
    qtyItem('Couch Stretch', '45 s'),
    qtyItem('Respiración nasal 4-6', '3 min'),
  ],
  [
    qtyItem('Row', '5 min'),
    qtyItem('Foam roll isquios', '3 min'),
    qtyItem('Estiramiento de pectoral', '2 min'),
    qtyItem('Estiramiento de cadera', '3 min'),
    qtyItem('Hollow Hold suave', '20 s'),
  ],
];

function biserieRounds(role) {
  return role === 'descarga' ? '3 rondas' : '4 rondas';
}

function mondaySession(ctx) {
  const squatPyramid = pyramidPercents(ctx.percent);
  const cleanPyramid = [
    { sets: 1, reps: 5, percent: techPercent(ctx.percent, 15) },
    { sets: 1, reps: 5, percent: techPercent(ctx.percent, 10) },
    { sets: 1, reps: 4, percent: techPercent(ctx.percent, 6) },
    { sets: 1, reps: 3, percent: techPercent(ctx.percent, 2) },
  ];

  return {
    name: 'BEAST MODE · Back Squat + Engine',
    duration: ctx.role === 'descarga' ? '75 min' : '85 min',
    blocks: [
      activationBlock('squat', ctx.variantIndex),
      block(BLOCK.strength, {
        title: 'B) HALTERO-HIPERTRO BACK SQUAT TEMPO',
        timing: '20 min',
        note: 'Bajada 3 s, pausa 2 s abajo y subida explosiva. Entra cada 2 min y descansa 90 s entre series.',
        items: pyramidItems('Back Squat', squatPyramid),
      }),
      block(BLOCK.strength, {
        title: 'C) BISERIE WORK',
        rounds: biserieRounds(ctx.role),
        note: 'Biserie seguida sin descanso y 90 s al cerrar la ronda. Escala los strict pull-ups con banda o ring row.',
        items: pick(MONDAY_BISERIE, ctx.variantIndex),
      }),
      block(BLOCK.technique, {
        title: 'D) HALTERO POWER CLEAN',
        timing: '15 min',
        note: 'Sin touch and go: recoloca cada repetición. Entra cada 2 min y descansa 90 s.',
        items: pyramidItems('Power Clean', cleanPyramid),
      }),
      block(BLOCK.emom, {
        title: 'E) CORE Y CONTROL',
        timing: '12 min',
        note: 'Un movimiento por minuto; el cuarto minuto es descanso.',
        items: pick(MONDAY_CORE, ctx.variantIndex),
      }),
      wodBlock(pick(MONDAY_WOD1, ctx.variantIndex)),
      wodBlock(pick(MONDAY_WOD2, ctx.variantIndex)),
      cooldownBlock('H) VUELTA A LA CALMA', 'Bike muy suave y estiramientos sin forzar.', [
        qtyItem('Bike', '3 min'),
        qtyItem('Estiramiento de cuádriceps', '60 s'),
        qtyItem('Estiramiento de dorsal', '60 s'),
      ]),
    ],
  };
}

function tuesdaySession(ctx) {
  const pressPyramid = pyramidPercents(ctx.percent);
  const jerkPercent = techPercent(ctx.percent, 8);

  return {
    name: 'BEAST MODE · Strict Press + Gimnásticos',
    duration: ctx.role === 'descarga' ? '75 min' : '85 min',
    blocks: [
      activationBlock('press', ctx.variantIndex),
      block(BLOCK.strength, {
        title: 'B) HALTERO-HIPERTRO STRICT PRESS',
        timing: '20 min',
        note: 'Bajada controlada 3 s y subida explosiva. Entra cada 2 min y descansa 90 s entre series.',
        items: pyramidItems('Strict Press', pressPyramid),
      }),
      block(BLOCK.strength, {
        title: 'C) BISERIE WORK',
        rounds: biserieRounds(ctx.role),
        note: 'Biserie seguida sin descanso y 90 s al cerrar la ronda. Las elevaciones laterales son 8 por lado.',
        items: pick(TUESDAY_BISERIE, ctx.variantIndex),
      }),
      block(BLOCK.technique, {
        title: 'D) HALTERO JERK COMPLEX',
        timing: '15 min',
        note: 'Complex de 3 jerk drive + 1 split jerk por serie. Pausa 2 s en recepción y pies consistentes. Entra cada 2 min.',
        items: [
          setsItem('Jerk Drive', 5, 3, pct(jerkPercent)),
          setsItem('Split Jerk', 5, 1, pct(jerkPercent)),
        ],
      }),
      block(BLOCK.emom, {
        title: 'E) SKILLS GIMNÁSTICOS',
        timing: '12 min',
        note: 'Escala los toes to bar con knee raises si rompes la serie.',
        items: pick(TUESDAY_SKILLS, ctx.variantIndex),
      }),
      wodBlock(pick(TUESDAY_WOD1, ctx.variantIndex)),
      wodBlock(pick(TUESDAY_WOD2, ctx.variantIndex)),
      cooldownBlock('H) VUELTA A LA CALMA', 'Movilidad sin forzar el rango.', [
        qtyItem('Movilidad de hombro', '90 s'),
        qtyItem('Movilidad de muñeca', '90 s'),
      ]),
    ],
  };
}

function wednesdaySession(ctx) {
  const dlPyramid = [
    { sets: 1, reps: 5, percent: ctx.percent - 4 },
    { sets: 1, reps: 4, percent: ctx.percent - 1 },
    { sets: 1, reps: 3, percent: ctx.percent + 2 },
    { sets: 1, reps: 2, percent: ctx.percent + 5 },
  ];

  return {
    name: 'BEAST MODE · Deadlift + Chipper',
    duration: ctx.role === 'descarga' ? '80 min' : '90 min',
    blocks: [
      activationBlock('hinge', ctx.variantIndex),
      block(BLOCK.strength, {
        title: 'B) HALTERO-HIPERTRO DEADLIFT PAUSE',
        timing: '20 min',
        note: 'Pausa bajo rodilla y sobre rodilla, sin touch and go y barra pegada al cuerpo. Descansa 2 min entre series.',
        items: pyramidItems('Deadlift', dlPyramid),
      }),
      block(BLOCK.strength, {
        title: 'C) BISERIE WORK',
        rounds: biserieRounds(ctx.role),
        note: 'Biserie seguida sin descanso y 90 s al cerrar la ronda.',
        items: pick(WEDNESDAY_BISERIE, ctx.variantIndex),
      }),
      block(BLOCK.technique, {
        title: 'D) HALTERO CLEAN COMPLEX',
        timing: '15 min',
        note: `Complex de 2 hang power clean + 1 front squat por serie al ${techPercent(ctx.percent)}%. Recepción alta y codos rápidos. Entra cada 2 min.`,
        items: [
          setsItem('Hang Power Clean', 6, 2, pct(techPercent(ctx.percent))),
          setsItem('Front Squat', 6, 1, pct(techPercent(ctx.percent))),
        ],
      }),
      block(BLOCK.emom, {
        title: 'E) CORE',
        timing: '10 min',
        note: 'Un movimiento por minuto; el cuarto minuto es descanso.',
        items: pick(WEDNESDAY_CORE, ctx.variantIndex),
      }),
      wodBlock(pick(WEDNESDAY_WOD1, ctx.variantIndex)),
      wodBlock(pick(WEDNESDAY_WOD2, ctx.variantIndex)),
      cooldownBlock('H) VUELTA A LA CALMA', 'Descarga lumbar y cardio muy suave.', [
        qtyItem('Foam roll lumbar', '2 min'),
        qtyItem('Row', '3 min'),
      ]),
    ],
  };
}

function fridaySession(ctx) {
  const fsPercent = Math.max(50, ctx.percent - 10);
  const snatchPercent = techPercent(ctx.percent, 12);

  return {
    name: 'BEAST MODE · Front Squat + Halterofilia',
    duration: ctx.role === 'descarga' ? '75 min' : '85 min',
    blocks: [
      activationBlock('olympic', ctx.variantIndex),
      block(BLOCK.strength, {
        title: 'B) HALTERO-HIPERTRO FRONT SQUAT',
        timing: '20 min',
        note: 'Codos altos y tronco vertical. Descansa 90 s entre series.',
        items: [setsItem('Front Squat', ctx.sets, ctx.reps, pct(fsPercent))],
      }),
      block(BLOCK.strength, {
        title: 'C) BISERIE WORK',
        rounds: biserieRounds(ctx.role),
        note: 'Biserie seguida sin descanso y 2 min al cerrar la ronda. Goblet squat con bajada de 3 s y cajón de 60 cm.',
        items: pick(FRIDAY_BISERIE, ctx.variantIndex),
      }),
      block(BLOCK.technique, {
        title: 'D) HALTERO POWER SNATCH COMPLEX',
        timing: '15 min',
        note: `Complex de 2 high-hang power snatch + 1 overhead squat por serie al ${snatchPercent}%. Bloqueo activo y sin fallos técnicos. Entra cada 2 min.`,
        items: [
          setsItem('High-Hang Power Snatch', 6, 2, pct(snatchPercent)),
          setsItem('Overhead Squat', 6, 1, pct(snatchPercent)),
        ],
      }),
      block(BLOCK.emom, {
        title: 'E) SKILLS',
        timing: '12 min',
        note: 'Escala los handstand push-ups con pike o cajón.',
        items: pick(FRIDAY_SKILLS, ctx.variantIndex),
      }),
      wodBlock(pick(FRIDAY_WOD1, ctx.variantIndex)),
      wodBlock(pick(FRIDAY_WOD2, ctx.variantIndex)),
      cooldownBlock('H) VUELTA A LA CALMA', 'Abre rack frontal y tobillo sin forzar.', [
        qtyItem('Estiramiento de rack frontal', '90 s'),
        qtyItem('Movilidad de tobillo', '90 s'),
      ]),
    ],
  };
}

function saturdaySession(ctx) {
  const benchPyramid = pyramidPercents(ctx.percent);

  return {
    name: 'BEAST MODE · Sábado de fuerza + Partner WOD',
    duration: ctx.role === 'descarga' ? '80 min' : '90 min',
    blocks: [
      activationBlock('general', ctx.variantIndex),
      block(BLOCK.strength, {
        title: 'B) FUERZA LARSEN PRESS',
        timing: '20 min',
        note: 'Piernas totalmente extendidas en el banco. Las dos primeras series entran cada 3 min y el resto cada 2:30.',
        items: [
          setsItem('Larsen Press', 1, 10, pct(benchPyramid[0].percent)),
          setsItem('Larsen Press', 2, 6, pct(benchPyramid[1].percent)),
          setsItem('Larsen Press', 4, 3, pct(benchPyramid[2].percent)),
        ],
      }),
      block(BLOCK.strength, {
        title: 'C) SUPERSERIE',
        rounds: biserieRounds(ctx.role),
        note: 'Superserie seguida sin descanso y 2:30 al cerrar la ronda. Escala los ring dips con fondos en caja y las dominadas sin lastre.',
        items: pick(SATURDAY_SUPER, ctx.variantIndex),
      }),
      block(BLOCK.strength, {
        title: 'D) ACCESORIO BISERIE WORK',
        rounds: '3 rondas',
        note: 'Descansa 90 s al cerrar la biserie.',
        items: pick(SATURDAY_ACCESSORY, ctx.variantIndex),
      }),
      wodBlock(pick(SATURDAY_WOD1, ctx.variantIndex)),
      wodBlock(pick(SATURDAY_WOD2, ctx.variantIndex)),
      cooldownBlock('G) VUELTA A LA CALMA', 'Cardio muy suave y estiramientos de tren superior.', [
        qtyItem('Bike', '3 min'),
        qtyItem('Estiramiento de pecho', '60 s'),
        qtyItem('Estiramiento de dorsal', '60 s'),
      ]),
    ],
  };
}

const SESSION_BUILDERS = new Map([
  [0, mondaySession],
  [1, tuesdaySession],
  [2, wednesdaySession],
  [4, fridaySession],
  [5, saturdaySession],
]);

function emptyRestSession() {
  return {
    kind: 'rest',
    dayOrder: 0,
    name: 'Día de descanso',
    estimatedDuration: 'Descanso',
    main: '',
  };
}

function restSession(variantIndex) {
  return {
    kind: 'rest',
    dayOrder: 0,
    name: 'REST DAY',
    estimatedDuration: 'Descanso',
    main: block(BLOCK.mobility, {
      title: 'A) RECUPERACIÓN',
      timing: '25 min',
      note: 'Movilidad o cardio suave opcional. Sin cargas ni metcon.',
      items: pick(REST_VARIANTS, variantIndex),
    }),
  };
}

function trainingSession(builder, ctx) {
  const session = builder(ctx);
  return {
    kind: 'session',
    dayOrder: 1,
    name: session.name,
    estimatedDuration: session.duration,
    main: session.blocks.join('\n\n'),
  };
}

export function phaseForMesocycle(mesocycle) {
  return PHASE_BY_MESOCYCLE.get(mesocycle) ?? PHASES[PHASES.length - 1];
}

export function describeWeek(week) {
  if (week > MESOCYCLE_WEEKS) {
    const mesocycle = MESOCYCLE_WEEKS / 4;
    return {
      week,
      mesocycle,
      weekInMesocycle: 4 + (week - MESOCYCLE_WEEKS),
      role: 'descarga',
      phase: phaseForMesocycle(mesocycle),
      isExtraWeek: true,
    };
  }

  const mesocycle = Math.floor((week - 1) / 4) + 1;
  const weekInMesocycle = ((week - 1) % 4) + 1;

  return {
    week,
    mesocycle,
    weekInMesocycle,
    role: WEEK_ROLES[weekInMesocycle - 1],
    phase: phaseForMesocycle(mesocycle),
    isExtraWeek: false,
  };
}

function buildContext(week, role, phase) {
  return {
    week,
    role,
    phase,
    percent: PERCENT[phase.key][role],
    sets: SETS[phase.key][role],
    reps: REPS[phase.key][role],
    variantIndex: week - 1,
  };
}

export function mondayOf(reference = new Date()) {
  const date = new Date(
    Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate()),
  );
  const weekday = (date.getUTCDay() + 6) % 7;
  return new Date(date.getTime() - weekday * MS_PER_DAY).toISOString().slice(0, 10);
}

export function buildCrosstrainingYear({ year = DEFAULT_YEAR, restDays = true } = {}) {
  const days = [];
  const firstMonday = Date.parse(`${mondayOf(new Date(Date.UTC(year, 0, 1)))}T00:00:00Z`);
  const yearStart = Date.UTC(year, 0, 1);
  const yearEnd = Date.UTC(year, 11, 31);

  for (let time = firstMonday; time <= yearEnd; time += MS_PER_DAY) {
    if (time < yearStart) continue;

    const dayOffset = Math.round((time - firstMonday) / MS_PER_DAY);
    const week = Math.floor(dayOffset / 7) + 1;
    const weekdayIndex = dayOffset % 7;
    const { mesocycle, weekInMesocycle, role, phase, isExtraWeek } = describeWeek(week);
    const builder = SESSION_BUILDERS.get(weekdayIndex);
    const isRest = builder == null;
    if (isRest && !restDays) continue;

    const base = {
      date: new Date(time).toISOString().slice(0, 10),
      weekdayIndex,
      weekdayLabel: WEEKDAY_LABELS[weekdayIndex],
      week,
      mesocycle,
      weekInMesocycle,
      role,
      isExtraWeek,
      phaseKey: phase.key,
      phaseName: phase.name,
      percent: PERCENT[phase.key][role],
    };

    if (isRest) {
      days.push({
        ...base,
        isRest: true,
        sessions: [weekdayIndex === 6 ? emptyRestSession() : restSession(week - 1)],
      });
      continue;
    }

    days.push({
      ...base,
      isRest: false,
      sessions: [trainingSession(builder, buildContext(week, role, phase))],
    });
  }

  return days;
}

const RATE_ID_BASE = 8_000_000;
const RATE_ID_SLOT_STEP = 100_000;

export function generatedRateId(workoutDate, dayOrder) {
  const [, month, day] = workoutDate.split('-');
  return -(RATE_ID_BASE + dayOrder * RATE_ID_SLOT_STEP + Number(`${month}${day}`));
}

export const GENERATED_RATE_ID_RANGE = {
  from: -(RATE_ID_BASE + 4 * RATE_ID_SLOT_STEP),
  to: -RATE_ID_BASE,
};

export function toWorkoutRows(days) {
  const rows = [];

  for (const day of days) {
    for (const session of day.sessions) {
      rows.push({
        workoutDate: day.date,
        aimharderRateId: generatedRateId(day.date, session.dayOrder),
        name: session.name,
        dayLabel: `Semana ${day.week} · Mesociclo ${day.mesocycle} · ${day.phaseName} · ${WEEK_ROLE_LABELS[day.role]} · ${day.percent}%`,
        estimatedDuration: session.estimatedDuration,
        warmup: '',
        mainPart: session.main,
        corePart: '',
        cooldown: '',
        scheduleConfig: {
          weekdays: [day.weekdayIndex],
          recurrence: 'once',
          startDate: day.date,
          dayOrder: session.dayOrder,
          kind: session.kind,
        },
      });
    }
  }

  return rows;
}

export function summarizeYear(days) {
  const byPhase = new Map();

  for (const day of days) {
    const entry = byPhase.get(day.phaseKey) ?? {
      phase: day.phaseName,
      weeks: new Set(),
      mesocycles: new Set(),
      days: 0,
      restDays: 0,
      sessions: 0,
    };
    entry.weeks.add(day.week);
    entry.mesocycles.add(day.mesocycle);
    if (day.isRest) {
      entry.restDays += 1;
    } else {
      entry.days += 1;
      entry.sessions += day.sessions.length;
    }
    byPhase.set(day.phaseKey, entry);
  }

  return [...byPhase.values()].map((entry) => ({
    phase: entry.phase,
    mesocycles: [...entry.mesocycles].sort((a, b) => a - b).join(', '),
    weeks: entry.weeks.size,
    days: entry.days,
    restDays: entry.restDays,
    sessions: entry.sessions,
  }));
}
