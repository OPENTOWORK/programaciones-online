/**
 * Programación anual de Básico: fuerza fundamental con barra y peso corporal.
 *
 * 13 mesociclos de 4 semanas (intro · carga · pico · descarga), 5 fases progresivas.
 * Entreno lunes, martes, jueves y viernes. Miércoles, sábado y domingo: descanso.
 *
 * Movimientos base: back squat, deadlift, bench press, strict press, push-up, pull-up y carries.
 * Cargas por RPE; el volumen y la intensidad suben con el mesociclo y bajan en descarga.
 */

import { BLOCK, block, qtyItem, setsItem } from './workoutBlockHelpers.mjs';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const DEFAULT_YEAR = 2026;
export const PROGRAM_NAME = 'Básico';
export const LEGACY_PROGRAM_NAME = 'Styrkur';
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

/** Lunes, martes, jueves y viernes. */
export const TRAINING_WEEKDAYS = [0, 1, 3, 4];
export const REST_WEEKDAYS = [2, 5, 6];

export const WEEK_ROLES = ['intro', 'carga', 'pico', 'descarga'];

export const WEEK_ROLE_LABELS = {
  intro: 'Introducción',
  carga: 'Carga',
  pico: 'Pico',
  descarga: 'Descarga',
};

const WEEK_ROLE_NOTES = {
  intro: 'Semana de introducción: prioriza técnica y deja 3 repeticiones en reserva.',
  carga: 'Semana de carga: sube una repetición o la carga respecto a la semana anterior.',
  pico: 'Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.',
  descarga: 'Semana de descarga: menos series y sin acercarte al fallo.',
};

export const PHASES = [
  {
    key: 'fundamentos',
    name: 'Fundamentos',
    mesocycles: [1, 2],
    goal: 'Patrones de sentadilla, bisagra, empuje y tracción. RPE moderado y mucha técnica.',
  },
  {
    key: 'acumulacion',
    name: 'Acumulación',
    mesocycles: [3, 4, 5],
    goal: 'Más volumen en los básicos de barra y progresión en dominadas y flexiones.',
  },
  {
    key: 'intensificacion',
    name: 'Intensificación',
    mesocycles: [6, 7, 8],
    goal: 'Menos repeticiones, más carga. Carries más largos y tempo controlado.',
  },
  {
    key: 'fuerza',
    name: 'Fuerza',
    mesocycles: [9, 10, 11],
    goal: 'Series pesadas en squat, deadlift, press y bench. Dominadas y flexiones más exigentes.',
  },
  {
    key: 'realizacion',
    name: 'Realización',
    mesocycles: [12, 13],
    goal: 'Semanas de test controlado y cierre del año en descarga.',
  },
];

const PHASE_BY_MESOCYCLE = new Map(
  PHASES.flatMap((phase) => phase.mesocycles.map((mesocycle) => [mesocycle, phase])),
);

const SQUAT_SCHEME = {
  fundamentos: { intro: '3 × 8', carga: '4 × 8', pico: '4 × 10', descarga: '2 × 8' },
  acumulacion: { intro: '4 × 8', carga: '4 × 10', pico: '5 × 8', descarga: '3 × 8' },
  intensificacion: { intro: '4 × 6', carga: '5 × 5', pico: '5 × 4', descarga: '3 × 5' },
  fuerza: { intro: '4 × 5', carga: '5 × 4', pico: '5 × 3', descarga: '3 × 4' },
  realizacion: { intro: '4 × 4', carga: '3 × 3', pico: '1 × 3RM', descarga: '2 × 5' },
};

const DEADLIFT_SCHEME = {
  fundamentos: { intro: '3 × 8', carga: '4 × 8', pico: '4 × 8', descarga: '2 × 8' },
  acumulacion: { intro: '4 × 6', carga: '4 × 6', pico: '5 × 5', descarga: '3 × 6' },
  intensificacion: { intro: '4 × 5', carga: '5 × 4', pico: '5 × 3', descarga: '3 × 4' },
  fuerza: { intro: '4 × 4', carga: '5 × 3', pico: '3 × 3', descarga: '2 × 4' },
  realizacion: { intro: '3 × 3', carga: '2 × 3', pico: '1 × 3RM', descarga: '2 × 5' },
};

const BENCH_SCHEME = {
  fundamentos: { intro: '3 × 8', carga: '4 × 8', pico: '4 × 10', descarga: '2 × 8' },
  acumulacion: { intro: '4 × 8', carga: '4 × 6', pico: '5 × 5', descarga: '3 × 8' },
  intensificacion: { intro: '4 × 6', carga: '5 × 5', pico: '5 × 4', descarga: '3 × 5' },
  fuerza: { intro: '4 × 5', carga: '5 × 4', pico: '5 × 3', descarga: '3 × 4' },
  realizacion: { intro: '4 × 4', carga: '3 × 3', pico: '1 × 3RM', descarga: '2 × 5' },
};

const PRESS_SCHEME = {
  fundamentos: { intro: '3 × 8', carga: '3 × 8', pico: '4 × 8', descarga: '2 × 8' },
  acumulacion: { intro: '4 × 6', carga: '4 × 6', pico: '4 × 5', descarga: '3 × 6' },
  intensificacion: { intro: '4 × 5', carga: '5 × 5', pico: '5 × 4', descarga: '3 × 5' },
  fuerza: { intro: '4 × 4', carga: '5 × 3', pico: '4 × 3', descarga: '2 × 4' },
  realizacion: { intro: '3 × 4', carga: '3 × 3', pico: '1 × 3RM', descarga: '2 × 5' },
};

const PULLUP_SCHEME = {
  fundamentos: { intro: '3 × 5', carga: '4 × 5', pico: '4 × 6', descarga: '2 × 5' },
  acumulacion: { intro: '4 × 5', carga: '4 × 6', pico: '5 × 5', descarga: '3 × 5' },
  intensificacion: { intro: '4 × 4', carga: '5 × 4', pico: '5 × 3', descarga: '3 × 4' },
  fuerza: { intro: '5 × 3', carga: '5 × 3', pico: '6 × 2', descarga: '3 × 3' },
  realizacion: { intro: '4 × 3', carga: '3 × 3', pico: 'máx estrictas', descarga: '2 × 5' },
};

const PUSHUP_SCHEME = {
  fundamentos: { intro: '3 × 10', carga: '4 × 10', pico: '4 × 12', descarga: '2 × 10' },
  acumulacion: { intro: '4 × 10', carga: '4 × 12', pico: '5 × 10', descarga: '3 × 10' },
  intensificacion: { intro: '4 × 8', carga: '4 × 10', pico: '5 × 8', descarga: '3 × 8' },
  fuerza: { intro: '4 × 8', carga: '5 × 6', pico: '5 × 5', descarga: '3 × 8' },
  realizacion: { intro: '3 × 8', carga: '3 × 6', pico: 'máx limpias', descarga: '2 × 10' },
};

const ROW_SCHEME = {
  fundamentos: { intro: '3 × 10', carga: '4 × 10', pico: '4 × 12', descarga: '2 × 10' },
  acumulacion: { intro: '4 × 8', carga: '4 × 10', pico: '5 × 8', descarga: '3 × 8' },
  intensificacion: { intro: '4 × 6', carga: '5 × 6', pico: '5 × 5', descarga: '3 × 6' },
  fuerza: { intro: '4 × 5', carga: '5 × 5', pico: '5 × 4', descarga: '3 × 5' },
  realizacion: { intro: '3 × 6', carga: '3 × 5', pico: '4 × 4', descarga: '2 × 8' },
};

const CARRY_ROUNDS = {
  fundamentos: { intro: 3, carga: 3, pico: 4, descarga: 2 },
  acumulacion: { intro: 3, carga: 4, pico: 4, descarga: 2 },
  intensificacion: { intro: 4, carga: 4, pico: 5, descarga: 2 },
  fuerza: { intro: 4, carga: 4, pico: 5, descarga: 3 },
  realizacion: { intro: 3, carga: 3, pico: 3, descarga: 2 },
};

const CARRY_DISTANCE = {
  fundamentos: 25,
  acumulacion: 30,
  intensificacion: 35,
  fuerza: 40,
  realizacion: 30,
};

const SQUAT_ACCESSORIES = ['Goblet squat', 'Pause back squat', 'Tempo back squat', 'Front squat'];
const DEADLIFT_ACCESSORIES = ['Romanian deadlift', 'Trap bar deadlift', 'KB deadlift', 'Good morning'];
const ROW_VARIANTS = ['Pendlay row', 'Barbell row', 'Ring row', 'Chest-supported row'];
const CARRY_VARIANTS = [
  ['Farmer carry', 'Suitcase carry'],
  ['Farmer carry', 'Front rack carry'],
  ['Farmer carry', 'Zercher carry'],
  ['Farmer carry', 'Sandbag carry'],
];

const FINISHERS = [
  {
    type: BLOCK.emom,
    title: 'Empuje y carry',
    note: 'Minutos impares push-up, pares farmer carry. Ritmo conversacional.',
    items: (ctx) => [
      qtyItem('Push-up', ctx.role === 'descarga' ? '8 reps' : '10 reps'),
      qtyItem('Farmer carry', `${ctx.carryDistance} m`),
    ],
  },
  {
    type: BLOCK.emom,
    title: 'Dominada y flexión',
    note: 'Minutos impares pull-up (o ring row), pares push-up.',
    items: (ctx) => [
      qtyItem('Strict pull-up', ctx.role === 'descarga' ? '3 reps' : '4 reps'),
      qtyItem('Push-up', ctx.role === 'descarga' ? '6 reps' : '8 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'Básicos en circuito',
    note: 'Ritmo conversacional. Un movimiento detrás de otro.',
    items: (ctx) => [
      qtyItem('KB deadlift', '10 reps', '16 kg'),
      qtyItem('Push-up', '10 reps'),
      qtyItem('Farmer carry', `${ctx.carryDistance} m`),
      qtyItem('Air squat', ctx.role === 'descarga' ? '10 reps' : '12 reps'),
    ],
  },
];

function pick(pool, index) {
  return pool[((index % pool.length) + pool.length) % pool.length];
}

function scheme(table, phaseKey, role) {
  const phase = table[phaseKey] ?? table.fundamentos;
  const value = phase[role] ?? phase.intro;
  if (role !== 'descarga') return value;
  const match = value.match(/^(\d+) × (.+)$/);
  if (!match) return value;
  const sets = Math.max(1, Math.floor(Number(match[1]) / 2));
  return `${sets} × ${match[2]}`;
}

function rpe(phaseKey, role) {
  if (role === 'descarga') return 'RPE 5-6';
  if (role === 'pico') {
    return phaseKey === 'realizacion' ? 'RPE 8-9' : 'RPE 7-8';
  }
  if (role === 'carga') return 'RPE 6-7';
  return 'RPE 6';
}

function parseSetsReps(schemeStr) {
  const match = schemeStr.match(/^(\d+) × (.+)$/);
  if (!match) return { sets: 1, reps: schemeStr };
  return { sets: Number(match[1]), reps: match[2] };
}

function schemeItem(name, schemeStr, load) {
  const { sets, reps } = parseSetsReps(schemeStr);
  return setsItem(name, sets, reps, load);
}

function carryRounds(phaseKey, role) {
  const phase = CARRY_ROUNDS[phaseKey] ?? CARRY_ROUNDS.fundamentos;
  const rounds = phase[role] ?? phase.intro;
  return role === 'descarga' ? Math.max(2, Math.floor(rounds / 2)) : rounds;
}

function carryDistance(phaseKey, role) {
  const base = CARRY_DISTANCE[phaseKey] ?? 25;
  return role === 'descarga' ? Math.max(20, base - 10) : base;
}

function buildContext(week, role, phase) {
  return {
    week,
    role,
    phase,
    phaseKey: phase.key,
    variantIndex: week - 1,
    carryDistance: carryDistance(phase.key, role),
    carryRounds: carryRounds(phase.key, role),
    roleNote: WEEK_ROLE_NOTES[role],
    load: rpe(phase.key, role),
  };
}

function activationSession({ title, note, items, duration = '10 min' }) {
  return {
    kind: 'activation',
    dayOrder: 0,
    name: 'Activación',
    estimatedDuration: duration,
    main: block(BLOCK.activation, { title, timing: duration, note, items }),
    cooldown: '',
  };
}

function strengthSession({ name, duration, blocks }) {
  return {
    kind: 'session',
    dayOrder: 1,
    name,
    estimatedDuration: duration,
    main: blocks.join('\n\n'),
    cooldown: '',
  };
}

function extraSession({ name, duration, blocks, cooldown = '' }) {
  return {
    kind: 'metcon',
    dayOrder: 2,
    name,
    estimatedDuration: duration,
    main: blocks.join('\n\n'),
    cooldown,
  };
}

function restSession() {
  return {
    kind: 'rest',
    dayOrder: 0,
    name: 'Día de descanso',
    estimatedDuration: 'Descanso',
    main: block(BLOCK.mobility, {
      title: 'Recuperación opcional',
      timing: '20 min',
      note: 'Solo si te apetece. Caminar, movilidad suave y sin cargas.',
      items: [
        qtyItem('Caminar', '10 min'),
        qtyItem("World's greatest stretch", '4 reps por lado'),
        qtyItem('Cat cow', '10 reps'),
        qtyItem('Couch stretch', '45 s por lado'),
        qtyItem('Respiración nasal 4-6', '2 min'),
      ],
    }),
    cooldown: '',
  };
}

function mondaySessions(ctx) {
  const squatScheme = scheme(SQUAT_SCHEME, ctx.phaseKey, ctx.role);
  const deadliftScheme = scheme(DEADLIFT_SCHEME, ctx.phaseKey, ctx.role);
  const accessorySquat = pick(SQUAT_ACCESSORIES, ctx.variantIndex);
  const accessoryHinge = pick(DEADLIFT_ACCESSORIES, ctx.variantIndex);
  const [carryA, carryB] = pick(CARRY_VARIANTS, ctx.variantIndex);

  return [
    activationSession({
      title: 'Cadera y sentadilla',
      note: '2 rondas fluidas a RPE 4. Air squat con tempo 3-1-1 antes de cargar la barra.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Cat cow', '10 reps'),
        qtyItem("World's greatest stretch", '5 reps por lado'),
        qtyItem('Glute bridge', '10 reps'),
        qtyItem('Air squat', '10 reps'),
        qtyItem('Good morning', '8 reps', 'barra vacía'),
        qtyItem('Hollow hold', '20 s'),
      ],
    }),
    strengthSession({
      name: 'Sentadilla y peso muerto',
      duration: ctx.role === 'descarga' ? '40 min' : '50 min',
      blocks: [
        block(BLOCK.technique, {
          title: 'Aproximación',
          timing: '10 min',
          note: ctx.roleNote,
          items: [
            schemeItem(accessorySquat, ctx.role === 'descarga' ? '2 × 8' : '3 × 8', 'ligero'),
            schemeItem('Back squat', '2 × 5', 'aproximación'),
          ],
        }),
        block(BLOCK.strength, {
          title: 'Back squat',
          timing: '18 min',
          note: 'Entra cada 2-3 min. Bajada controlada de 3 s en las fases de volumen.',
          items: [schemeItem('Back squat', squatScheme, ctx.load)],
        }),
        block(BLOCK.strength, {
          title: 'Deadlift',
          timing: '16 min',
          note: 'Barra desde el suelo. Si la técnica se rompe, baja carga o usa trap bar.',
          items: [schemeItem('Deadlift', deadliftScheme, ctx.load)],
        }),
        block(BLOCK.strength, {
          title: 'Accesorio y carry',
          rounds: `${ctx.carryRounds} rondas`,
          note: `${accessoryHinge} seguido de carry. 90 s al cerrar la ronda.`,
          items: [
            schemeItem(accessoryHinge, ctx.role === 'descarga' ? '2 × 8' : '3 × 8', ctx.load),
            qtyItem(carryA, `${ctx.carryRounds} × ${ctx.carryDistance} m`, ctx.load),
          ],
        }),
      ],
    }),
    extraSession({
      name: 'Core',
      duration: '10 min',
      cooldown: 'Estira cuádriceps e isquios 45 s por lado. Respiración nasal 1 min.',
      blocks: [
        block(BLOCK.strength, {
          title: 'Core anti-extensión',
          timing: '8 min',
          note: 'Series tranquilas.',
          items: [
            setsItem('Dead bug', ctx.role === 'descarga' ? 2 : 3, 10),
            setsItem('Side plank', ctx.role === 'descarga' ? 2 : 3, '30 s por lado'),
          ],
        }),
      ],
    }),
  ];
}

function tuesdaySessions(ctx) {
  const benchScheme = scheme(BENCH_SCHEME, ctx.phaseKey, ctx.role);
  const pressScheme = scheme(PRESS_SCHEME, ctx.phaseKey, ctx.role);
  const pushupScheme = scheme(PUSHUP_SCHEME, ctx.phaseKey, ctx.role);
  const finisher = pick(FINISHERS, ctx.variantIndex);

  return [
    activationSession({
      title: 'Hombro y empuje',
      note: '2 rondas a RPE 4. Press con barra vacía o mancuernas ligeras.',
      items: [
        qtyItem('Row', '30 s'),
        qtyItem('Pass through', '10 reps'),
        qtyItem('Scapular push-up', '8 reps'),
        qtyItem('Band pull-apart', '12 reps'),
        qtyItem('Strict press', '8 reps', 'barra vacía'),
        qtyItem('Push-up', '8 reps'),
        qtyItem('Arch hold', '20 s'),
      ],
    }),
    strengthSession({
      name: 'Presses y flexiones',
      duration: ctx.role === 'descarga' ? '40 min' : '50 min',
      blocks: [
        block(BLOCK.technique, {
          title: 'Press de pie',
          timing: '8 min',
          note: ctx.roleNote,
          items: [
            setsItem('Strict press', 2, 8, 'barra vacía'),
            schemeItem('Push-up', ctx.role === 'descarga' ? '2 × 8' : '2 × 10', 'rodillas si hace falta'),
          ],
        }),
        block(BLOCK.strength, {
          title: 'Press banca',
          timing: '14 min',
          note: 'Toca el pecho sin rebotar. Escala a mancuernas si hace falta.',
          items: [schemeItem('Bench press', benchScheme, ctx.load)],
        }),
        block(BLOCK.strength, {
          title: 'Press militar',
          timing: '12 min',
          note: 'Barra o dos mancuernas. Abdomen apretado en cada repetición.',
          items: [schemeItem('Strict press', pressScheme, ctx.load)],
        }),
        block(BLOCK.strength, {
          title: 'Flexiones',
          rounds: `${ctx.role === 'descarga' ? 2 : 4} rondas`,
          note: 'Calidad antes que cantidad. 60 s al cerrar la ronda.',
          items: [
            schemeItem('Push-up', pushupScheme, 'sin fallo'),
            setsItem('Dip en banco', ctx.role === 'descarga' ? 2 : 4, 12),
          ],
        }),
      ],
    }),
    extraSession({
      name: 'Finisher',
      duration: ctx.role === 'descarga' ? '6 min' : '8 min',
      cooldown: 'Estira pecho y hombros 30 s por lado. Camina 2 min.',
      blocks: [
        block(finisher.type, {
          title: finisher.title,
          timing: ctx.role === 'descarga' ? '6 min' : '8 min',
          note: finisher.note,
          items: finisher.items(ctx),
        }),
      ],
    }),
  ];
}

function thursdaySessions(ctx) {
  const pullupScheme = scheme(PULLUP_SCHEME, ctx.phaseKey, ctx.role);
  const rowScheme = scheme(ROW_SCHEME, ctx.phaseKey, ctx.role);
  const rowVariant = pick(ROW_VARIANTS, ctx.variantIndex);
  const [carryA, carryB] = pick(CARRY_VARIANTS, ctx.variantIndex + 1);
  const finisher = pick(FINISHERS, ctx.variantIndex + 2);

  const pullupLoad =
    ctx.role === 'pico' && ctx.phaseKey === 'realizacion'
      ? 'máximo estricto'
      : 'banda si hace falta';

  return [
    activationSession({
      title: 'Tracción y agarre',
      note: '2 rondas a RPE 4. Scapular pull-up sin kipping.',
      items: [
        qtyItem('Row', '30 s'),
        qtyItem('Cat cow', '8 reps'),
        qtyItem('Scapular pull-up', '8 reps'),
        qtyItem('Band pull-apart', '12 reps'),
        qtyItem('Hanging hollow', '20 s'),
        qtyItem('Farmer hold', '20 s', 'mancuernas ligeras'),
        qtyItem('Bird dog', '6 reps por lado'),
      ],
    }),
    strengthSession({
      name: 'Dominadas y carries',
      duration: ctx.role === 'descarga' ? '40 min' : '50 min',
      blocks: [
        block(BLOCK.technique, {
          title: 'Dominada estricta',
          timing: '10 min',
          note: ctx.roleNote,
          items: [
            setsItem('Ring row', 2, 10),
            setsItem('Scapular pull-up', 2, 8),
            setsItem('Strict pull-up', 2, 5, 'banda si hace falta'),
          ],
        }),
        block(BLOCK.strength, {
          title: 'Dominadas',
          timing: '16 min',
          note: 'Repeticiones estrictas, barbilla sobre la barra. Sin balanceo.',
          items: [schemeItem('Strict pull-up', pullupScheme, pullupLoad)],
        }),
        block(BLOCK.strength, {
          title: 'Tracción horizontal',
          timing: '12 min',
          note: 'Pecho a la barra, pausa 1 s arriba.',
          items: [schemeItem(rowVariant, rowScheme, ctx.load)],
        }),
        block(BLOCK.strength, {
          title: 'Carries',
          rounds: `${ctx.carryRounds} rondas`,
          note: 'Torso erguido, pasos controlados. 90 s al cerrar la ronda.',
          items: [
            qtyItem(carryA, `${ctx.carryRounds} × ${ctx.carryDistance} m`, ctx.load),
            qtyItem(carryB, `${ctx.carryRounds} × ${Math.max(20, ctx.carryDistance - 10)} m por lado`, ctx.load),
          ],
        }),
      ],
    }),
    extraSession({
      name: 'Densidad',
      duration: ctx.role === 'descarga' ? '6 min' : '10 min',
      cooldown: 'Cuelga de la barra 20 s y estira dorsal 45 s por lado.',
      blocks: [
        block(finisher.type, {
          title: finisher.title,
          timing: ctx.role === 'descarga' ? '6 min' : '8 min',
          note: finisher.note,
          items: finisher.items(ctx),
        }),
      ],
    }),
  ];
}

function fridaySessions(ctx) {
  const squatScheme = scheme(SQUAT_SCHEME, ctx.phaseKey, ctx.role);
  const deadliftScheme = scheme(DEADLIFT_SCHEME, ctx.phaseKey, ctx.role);
  const pressScheme = scheme(PRESS_SCHEME, ctx.phaseKey, ctx.role);
  const pushupScheme = scheme(PUSHUP_SCHEME, ctx.phaseKey, ctx.role);
  const pullupScheme = scheme(PULLUP_SCHEME, ctx.phaseKey, ctx.role);
  const [carryA, carryB] = pick(CARRY_VARIANTS, ctx.variantIndex + 3);

  const integratedSquat =
    ctx.role === 'descarga'
      ? parseSetsReps(squatScheme)
      : { sets: Math.max(2, parseSetsReps(squatScheme).sets - 1), reps: '8' };
  const integratedDeadlift =
    ctx.role === 'descarga'
      ? parseSetsReps(deadliftScheme)
      : { sets: Math.max(2, parseSetsReps(deadliftScheme).sets - 1), reps: '8' };

  return [
    activationSession({
      title: 'Básicos de cuerpo completo',
      note: '2 rondas a RPE 4. Repasa sentadilla, bisagra, empuje y tracción.',
      items: [
        qtyItem('Bike', '30 s'),
        qtyItem('Air squat', '10 reps'),
        qtyItem('Good morning', '8 reps', 'barra vacía'),
        qtyItem('Push-up', '8 reps'),
        qtyItem('Ring row', '8 reps'),
        qtyItem('KB deadlift', '8 reps', '16 kg'),
        qtyItem('Farmer hold', '20 s'),
      ],
    }),
    strengthSession({
      name: 'Básicos integrados',
      duration: ctx.role === 'descarga' ? '35 min' : '45 min',
      blocks: [
        block(BLOCK.strength, {
          title: 'Sentadilla y peso muerto',
          timing: '20 min',
          note: 'Alterna ejercicios con 90 s de descanso. Carga media, técnica perfecta.',
          items: [
            setsItem('Back squat', integratedSquat.sets, integratedSquat.reps, 'RPE 6'),
            setsItem('Deadlift', integratedDeadlift.sets, integratedDeadlift.reps, 'RPE 6'),
          ],
        }),
        block(BLOCK.strength, {
          title: 'Empuje y tracción',
          rounds: `${ctx.role === 'descarga' ? 2 : 4} rondas`,
          note: 'Superserie flexiones y dominadas. 60 s al cerrar la ronda.',
          items: [
            schemeItem('Push-up', pushupScheme, 'sin fallo'),
            schemeItem('Strict pull-up', pullupScheme, 'banda si hace falta'),
          ],
        }),
        block(BLOCK.strength, {
          title: 'Press y carry',
          rounds: `${ctx.role === 'descarga' ? 2 : 3} rondas`,
          note: 'Press de pie seguido de carries. Termina cada ronda erguido.',
          items: [
            schemeItem('Strict press', pressScheme, ctx.load),
            qtyItem(carryA, `${ctx.carryRounds} × ${ctx.carryDistance} m`),
            qtyItem(carryB, `${ctx.carryRounds} × ${Math.max(20, ctx.carryDistance - 10)} m`, 'barra o KB'),
          ],
        }),
      ],
    }),
    extraSession({
      name: 'Engine',
      duration: ctx.role === 'descarga' ? '8 min' : '12 min',
      cooldown: 'Camina 3 min. Estira cuádriceps e isquios 30 s por lado.',
      blocks: [
        block(BLOCK.amrap, {
          title: 'Básicos en circuito',
          timing: ctx.role === 'descarga' ? '6 min' : '10 min',
          note: 'Ritmo conversacional.',
          items: [
            qtyItem('KB deadlift', '10 reps', '16 kg'),
            qtyItem('Push-up', '10 reps'),
            qtyItem('Farmer carry', `${ctx.carryDistance} m`),
            qtyItem('Air squat', '12 reps'),
          ],
        }),
      ],
    }),
  ];
}

const DAY_BUILDERS = [mondaySessions, tuesdaySessions, thursdaySessions, fridaySessions];

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

export function mondayOf(reference = new Date()) {
  const date = new Date(
    Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate()),
  );
  const weekday = (date.getUTCDay() + 6) % 7;
  return new Date(date.getTime() - weekday * MS_PER_DAY).toISOString().slice(0, 10);
}

export function buildBasicoYear({ year = DEFAULT_YEAR, restDays = true } = {}) {
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

    const trainingSlot = TRAINING_WEEKDAYS.indexOf(weekdayIndex);
    const isRest = trainingSlot === -1;
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
    };

    if (isRest) {
      days.push({ ...base, isRest: true, sessions: [restSession()] });
      continue;
    }

    const context = buildContext(week, role, phase);
    days.push({
      ...base,
      isRest: false,
      sessions: DAY_BUILDERS[trainingSlot](context),
    });
  }

  return days;
}

const RATE_ID_BASE = 6_000_000;
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
        dayLabel: `Semana ${day.week} · Mesociclo ${day.mesocycle} · ${day.phaseName} · ${WEEK_ROLE_LABELS[day.role]}`,
        estimatedDuration: session.estimatedDuration,
        warmup: '',
        mainPart: session.main,
        corePart: '',
        cooldown: session.cooldown ?? '',
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
    mesocycles: [...entry.mesocycles].join(', '),
    weeks: entry.weeks.size,
    days: entry.days,
    restDays: entry.restDays,
    sessions: entry.sessions,
  }));
}

export function extractWeek(days, monday) {
  const sunday = new Date(`${monday}T12:00:00Z`);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  const sundayStr = sunday.toISOString().slice(0, 10);
  const weekDays = days.filter((day) => day.date >= monday && day.date <= sundayStr);
  if (weekDays.length !== 7) {
    throw new Error(`No se encontraron 7 días para la semana del ${monday}`);
  }
  return { monday, sunday: sundayStr, days: weekDays };
}
