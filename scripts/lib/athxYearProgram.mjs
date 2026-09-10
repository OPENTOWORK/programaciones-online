/**
 * Programación anual ATHX: híbrido fuerza + engine + turf.
 *
 * 13 mesociclos × 4 semanas (intro · carga · pico · descarga).
 * Entreno lun, mié, jue y sáb. Descanso mar, vie y dom.
 *
 * Metodología: docs/HYPE_ATHX_PROGRAMMING_PROMPT.md
 */

import { BLOCK, block, qtyItem, setsItem } from './workoutBlockHelpers.mjs';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const DEFAULT_YEAR = 2026;
export const PROGRAM_NAME = 'ATHX';
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

/** Lun, mié, jue y sáb. */
export const TRAINING_WEEKDAYS = [0, 2, 3, 5];
export const REST_WEEKDAYS = [1, 4, 6];

export const WEEK_ROLES = ['intro', 'carga', 'pico', 'descarga'];

export const WEEK_ROLE_LABELS = {
  intro: 'Introducción',
  carga: 'Carga',
  pico: 'Pico',
  descarga: 'Descarga',
};

const WEEK_ROLE_NOTES = {
  intro: 'Semana de introducción: técnica limpia y ritmo conversacional en metcon.',
  carga: 'Semana de carga: sube carga o una repetición respecto a la semana anterior.',
  pico: 'Semana pico: máximo esfuerzo controlado en fuerza y engine.',
  descarga: 'Semana de descarga: menos series, metcon más corto y sin llegar al fallo.',
};

export const PHASES = [
  {
    key: 'base',
    name: 'Base híbrida',
    mesocycles: [1, 2],
    goal: 'Patrones de fuerza y movilidad ATHX. Cargas moderadas y mucho turf técnico.',
  },
  {
    key: 'acumulacion',
    name: 'Acumulación',
    mesocycles: [3, 4, 5],
    goal: 'Más volumen en sentadilla, peso muerto, empuje y dominadas. Engine progresivo.',
  },
  {
    key: 'intensificacion',
    name: 'Intensificación',
    mesocycles: [6, 7, 8],
    goal: 'Series más pesadas y metcon más exigente. Menos reps, más intención.',
  },
  {
    key: 'engine',
    name: 'Engine',
    mesocycles: [9, 10, 11],
    goal: 'Capacidad de trabajo: intervals, chippers y carries largos.',
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

const SQUAT_SCHEME = {
  base: { intro: '4 × 8', carga: '4 × 6', pico: '5 × 5', descarga: '3 × 8' },
  acumulacion: { intro: '4 × 6', carga: '5 × 5', pico: '5 × 4', descarga: '3 × 6' },
  intensificacion: { intro: '5 × 5', carga: '5 × 4', pico: '5 × 3', descarga: '3 × 5' },
  engine: { intro: '4 × 5', carga: '4 × 4', pico: '5 × 3', descarga: '3 × 5' },
  realizacion: { intro: '4 × 4', carga: '3 × 3', pico: '1 × 3RM', descarga: '2 × 5' },
};

const DEADLIFT_SCHEME = {
  base: { intro: '4 × 6', carga: '4 × 5', pico: '5 × 4', descarga: '3 × 6' },
  acumulacion: { intro: '4 × 5', carga: '5 × 4', pico: '5 × 3', descarga: '3 × 5' },
  intensificacion: { intro: '5 × 4', carga: '5 × 3', pico: '4 × 3', descarga: '3 × 4' },
  engine: { intro: '4 × 4', carga: '4 × 3', pico: '5 × 3', descarga: '3 × 4' },
  realizacion: { intro: '3 × 3', carga: '2 × 3', pico: '1 × 3RM', descarga: '2 × 5' },
};

const PRESS_SCHEME = {
  base: { intro: '4 × 8', carga: '4 × 6', pico: '5 × 5', descarga: '3 × 8' },
  acumulacion: { intro: '4 × 6', carga: '5 × 5', pico: '5 × 4', descarga: '3 × 6' },
  intensificacion: { intro: '5 × 5', carga: '5 × 4', pico: '5 × 3', descarga: '3 × 5' },
  engine: { intro: '4 × 5', carga: '5 × 4', pico: '4 × 3', descarga: '3 × 5' },
  realizacion: { intro: '4 × 4', carga: '3 × 3', pico: '1 × 3RM', descarga: '2 × 5' },
};

const BENCH_SCHEME = {
  base: { intro: '4 × 8', carga: '4 × 8', pico: '4 × 6', descarga: '3 × 8' },
  acumulacion: { intro: '4 × 6', carga: '4 × 6', pico: '5 × 5', descarga: '3 × 6' },
  intensificacion: { intro: '4 × 5', carga: '5 × 4', pico: '5 × 3', descarga: '3 × 5' },
  engine: { intro: '4 × 5', carga: '4 × 4', pico: '5 × 3', descarga: '3 × 5' },
  realizacion: { intro: '3 × 4', carga: '3 × 3', pico: '1 × 3RM', descarga: '2 × 5' },
};

const PULL_SCHEME = {
  base: { intro: '3 × 6', carga: '4 × 6', pico: '4 × 5', descarga: '2 × 6' },
  acumulacion: { intro: '4 × 5', carga: '4 × 5', pico: '5 × 4', descarga: '3 × 5' },
  intensificacion: { intro: '4 × 4', carga: '5 × 4', pico: '5 × 3', descarga: '3 × 4' },
  engine: { intro: '4 × 4', carga: '5 × 3', pico: '6 × 2', descarga: '3 × 4' },
  realizacion: { intro: '3 × 3', carga: '3 × 3', pico: 'máx estrictas', descarga: '2 × 5' },
};

const ROW_SCHEME = {
  base: { intro: '3 × 8', carga: '4 × 8', pico: '4 × 6', descarga: '2 × 8' },
  acumulacion: { intro: '4 × 8', carga: '4 × 6', pico: '5 × 5', descarga: '3 × 6' },
  intensificacion: { intro: '4 × 6', carga: '5 × 5', pico: '5 × 4', descarga: '3 × 5' },
  engine: { intro: '4 × 5', carga: '4 × 4', pico: '5 × 3', descarga: '3 × 5' },
  realizacion: { intro: '3 × 5', carga: '3 × 4', pico: '4 × 4', descarga: '2 × 6' },
};

const LOADS = {
  squat: {
    base: '60/45 kg',
    acumulacion: '75/55 kg',
    intensificacion: '85/60 kg',
    engine: '80/55 kg',
    realizacion: '85/60 kg',
  },
  deadlift: {
    base: '80/55 kg',
    acumulacion: '100/70 kg',
    intensificacion: '120/85 kg',
    engine: '100/70 kg',
    realizacion: '120/85 kg',
  },
  press: {
    base: '30/20 kg',
    acumulacion: '40/30 kg',
    intensificacion: '50/35 kg',
    engine: '45/30 kg',
    realizacion: '50/35 kg',
  },
  bench: {
    base: '40/30 kg',
    acumulacion: '55/40 kg',
    intensificacion: '65/45 kg',
    engine: '60/40 kg',
    realizacion: '65/45 kg',
  },
  row: {
    base: '40/30 kg',
    acumulacion: '50/35 kg',
    intensificacion: '60/40 kg',
    engine: '55/40 kg',
    realizacion: '60/40 kg',
  },
};

const METCON_AMRAP = {
  base: { intro: "10'", carga: "12'", pico: "14'", descarga: "8'" },
  acumulacion: { intro: "12'", carga: "14'", pico: "16'", descarga: "10'" },
  intensificacion: { intro: "12'", carga: "14'", pico: "16'", descarga: "10'" },
  engine: { intro: "14'", carga: "16'", pico: "18'", descarga: "10'" },
  realizacion: { intro: "12'", carga: "10'", pico: 'benchmark', descarga: "8'" },
};

const METCON_EMOM = {
  base: { intro: '12 rondas', carga: '14 rondas', pico: '16 rondas', descarga: '8 rondas' },
  acumulacion: { intro: '14 rondas', carga: '16 rondas', pico: '18 rondas', descarga: '10 rondas' },
  intensificacion: { intro: '14 rondas', carga: '16 rondas', pico: '18 rondas', descarga: '10 rondas' },
  engine: { intro: '16 rondas', carga: '18 rondas', pico: '20 rondas', descarga: '12 rondas' },
  realizacion: { intro: '14 rondas', carga: '12 rondas', pico: 'benchmark', descarga: '8 rondas' },
};

const ENGINE_FINISHERS = [
  {
    type: BLOCK.amrap,
    title: 'Engine mix',
    items: (ctx) => [
      qtyItem('Run', ctx.role === 'descarga' ? '400 m' : '500 m'),
      qtyItem('Push-up', ctx.role === 'descarga' ? '12 reps' : '18 reps'),
      qtyItem('Any cardio machine', ctx.role === 'descarga' ? '200 m' : '300 m'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'Turf sprint',
    timing: (ctx) => (ctx.role === 'descarga' ? "TC 10'" : "TC 12'"),
    items: () => [
      qtyItem('Run', '400 m'),
      qtyItem('KB swing', '30 reps', '24/16 kg'),
      qtyItem('Run', '200 m'),
      qtyItem('Box jump over', '20 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'Finisher pierna',
    items: (ctx) => [
      qtyItem('Walking lunge', ctx.role === 'descarga' ? '10 reps por pierna' : '12 reps por pierna'),
      qtyItem('Air squat', ctx.role === 'descarga' ? '12 reps' : '15 reps'),
      qtyItem('Burpee', ctx.role === 'descarga' ? '6 reps' : '8 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'Ski + carry',
    timing: (ctx) => (ctx.role === 'descarga' ? "TC 10'" : "TC 12'"),
    items: (ctx) => [
      qtyItem('SkiErg', ctx.role === 'descarga' ? '250 m' : '400 m'),
      qtyItem('Farmer carry', '40 m', '24/16 kg'),
      qtyItem('SkiErg', ctx.role === 'descarga' ? '250 m' : '400 m'),
      qtyItem('Farmer carry', '40 m', '24/16 kg'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'Bike + slam',
    items: (ctx) => [
      qtyItem('Assault bike', ctx.role === 'descarga' ? '8 cal' : '12 cal'),
      qtyItem('Slam ball', ctx.role === 'descarga' ? '8 reps' : '12 reps', '9 kg'),
      qtyItem('Sit-up', '15 reps'),
    ],
  },
  {
    type: BLOCK.emom,
    title: 'Shuttle engine',
    items: (ctx) => [
      qtyItem('Shuttle run', ctx.role === 'descarga' ? '3 × 20 m' : '4 × 20 m'),
      qtyItem('Devil press DB', ctx.role === 'descarga' ? '6 reps' : '8 reps', '16/10 kg'),
      qtyItem('Box step-over', '10 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'Row chipper',
    timing: (ctx) => (ctx.role === 'descarga' ? "TC 10'" : "TC 14'"),
    items: () => [
      qtyItem('Row', '500 m'),
      qtyItem('Russian KB swing', '40 reps', '24/16 kg'),
      qtyItem('Row', '300 m'),
      qtyItem('Burpee', '20 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'Prowler mix',
    items: (ctx) => [
      qtyItem('Prowler push', ctx.role === 'descarga' ? '20 m' : '25 m', '50/35 kg'),
      qtyItem('Push-up', ctx.role === 'descarga' ? '8 reps' : '12 reps'),
      qtyItem('Run', '100 m'),
    ],
  },
];

const HYBRID_METCONS = [
  {
    type: BLOCK.forTime,
    title: 'Chipper hybrid',
    timing: (ctx) => (ctx.role === 'descarga' ? "TC 12'" : "TC 16'"),
    items: () => [
      qtyItem('Row', '500 m'),
      qtyItem('Burpee over rower', '20 reps'),
      qtyItem('Russian KB swing', '30 reps', '24/16 kg'),
      qtyItem('Run', '400 m'),
    ],
  },
  {
    type: BLOCK.emom,
    title: 'Turf intervals',
    items: (ctx) => [
      qtyItem('Shuttle run', '4 × 20 m'),
      qtyItem('Thruster barbell', ctx.role === 'descarga' ? '6 reps' : '8 reps', '20/12 kg'),
      qtyItem('Box step-up', '10 reps por pierna'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'Gimnástico + barra',
    items: (ctx) => [
      qtyItem('Strict pull-up', ctx.role === 'descarga' ? '4 reps' : '6 reps'),
      qtyItem('Push-up', ctx.role === 'descarga' ? '10 reps' : '12 reps'),
      qtyItem('KB deadlift', '15 reps', '24/16 kg'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'Run + thruster',
    timing: (ctx) => (ctx.role === 'descarga' ? "TC 10'" : "TC 14'"),
    items: (ctx) => [
      qtyItem('Run', '400 m'),
      qtyItem('Thruster barbell', ctx.role === 'descarga' ? '15 reps' : '21 reps', '30/20 kg'),
      qtyItem('Run', '200 m'),
      qtyItem('Thruster barbell', ctx.role === 'descarga' ? '12 reps' : '15 reps', '30/20 kg'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'Wall ball engine',
    items: (ctx) => [
      qtyItem('Wall ball', ctx.role === 'descarga' ? '10 reps' : '15 reps', '9/6 kg'),
      qtyItem('Box jump', ctx.role === 'descarga' ? '8 reps' : '12 reps'),
      qtyItem('SkiErg', ctx.role === 'descarga' ? '8 cal' : '12 cal'),
    ],
  },
  {
    type: BLOCK.emom,
    title: 'Ski + box',
    items: (ctx) => [
      qtyItem('SkiErg', ctx.role === 'descarga' ? '10 cal' : '14 cal'),
      qtyItem('Box jump over', ctx.role === 'descarga' ? '8 reps' : '10 reps'),
      qtyItem('KB goblet squat', '10 reps', '16/12 kg'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'KB complex',
    items: (ctx) => [
      qtyItem('KB clean', ctx.role === 'descarga' ? '6 reps' : '8 reps', '20/12 kg'),
      qtyItem('KB front squat', '8 reps', '20/12 kg'),
      qtyItem('Russian KB swing', '12 reps', '24/16 kg'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'Prowler + burpee',
    timing: (ctx) => (ctx.role === 'descarga' ? "TC 10'" : "TC 14'"),
    items: () => [
      qtyItem('Prowler push', '4 × 25 m', '70/50 kg'),
      qtyItem('Burpee', '20 reps'),
      qtyItem('Prowler pull', '2 × 25 m', '50/35 kg'),
    ],
  },
];

const PULL_METCONS = [
  {
    type: BLOCK.emom,
    title: 'Hybrid engine',
    items: () => [
      qtyItem('SkiErg', '12 cal'),
      qtyItem('Burpee', '8 reps'),
      qtyItem('KB clean', '10 reps', '16/12 kg'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'Turf finisher',
    items: () => [
      qtyItem('Shuttle run', '4 × 20 m'),
      qtyItem('Slam ball', '12 reps', '9 kg'),
      qtyItem('Mountain climber', '20 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'Prowler push',
    timing: (ctx) => (ctx.role === 'descarga' ? "TC 10'" : "TC 14'"),
    items: () => [
      qtyItem('Prowler push', '4 × 25 m', '70/50 kg'),
      qtyItem('Run', '200 m'),
      qtyItem('Wall ball', '20 reps', '9/6 kg'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'Pull + bike',
    items: (ctx) => [
      qtyItem('Strict pull-up', ctx.role === 'descarga' ? '3 reps' : '5 reps'),
      qtyItem('Assault bike', ctx.role === 'descarga' ? '8 cal' : '12 cal'),
      qtyItem('Hanging knee raise', '10 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'Row + snatch',
    timing: (ctx) => (ctx.role === 'descarga' ? "TC 10'" : "TC 12'"),
    items: () => [
      qtyItem('Row', '400 m'),
      qtyItem('DB snatch', '20 reps', '20/12 kg'),
      qtyItem('Row', '300 m'),
      qtyItem('DB snatch', '16 reps', '20/12 kg'),
    ],
  },
  {
    type: BLOCK.emom,
    title: 'Pull + ski',
    items: (ctx) => [
      qtyItem('Chest-to-bar o pull-up', ctx.role === 'descarga' ? '4 reps' : '6 reps'),
      qtyItem('SkiErg', ctx.role === 'descarga' ? '10 cal' : '12 cal'),
      qtyItem('Sit-up', '15 reps'),
    ],
  },
  {
    type: BLOCK.amrap,
    title: 'Toes to bar engine',
    items: (ctx) => [
      qtyItem('Toes to bar o knee raise', ctx.role === 'descarga' ? '6 reps' : '8 reps'),
      qtyItem('Run', ctx.role === 'descarga' ? '150 m' : '200 m'),
      qtyItem('Push-up', ctx.role === 'descarga' ? '10 reps' : '12 reps'),
    ],
  },
  {
    type: BLOCK.forTime,
    title: 'Carry chipper',
    timing: (ctx) => (ctx.role === 'descarga' ? "TC 10'" : "TC 14'"),
    items: () => [
      qtyItem('Farmer carry', '4 × 40 m', '24/16 kg'),
      qtyItem('Hang power clean', '20 reps', '40/25 kg'),
      qtyItem('Run', '400 m'),
    ],
  },
];

const MONDAY_ACTIVATIONS = [
  {
    title: 'Hybrid ATHX',
    note: '2 rondas fluidas. Agilidad, potencia y técnica.',
    items: [
      qtyItem('Lateral shuffle', '20 m ida y vuelta'),
      qtyItem('High knees', '20 m'),
      qtyItem('Band pull-apart', '12 reps'),
      qtyItem('KB goblet squat', '10 reps', '16 kg'),
      qtyItem('Inchworm', '5 reps'),
      qtyItem('Jump rope', '40 s'),
      qtyItem("World's greatest stretch", '4 reps por lado'),
    ],
  },
  {
    title: 'Hombro y T-spine',
    note: '2 rondas. Prepara el press militar sin fatiga.',
    items: [
      qtyItem('Row', '45 s'),
      qtyItem('Cat camel', '8 reps'),
      qtyItem('Banded shoulder dislocate', '10 reps'),
      qtyItem('Scapular push-up', '8 reps'),
      qtyItem('Shoulder press barra vacía', '8 reps'),
      qtyItem('Dead bug', '6 reps por lado'),
      qtyItem('Jump rope', '30 s'),
    ],
  },
  {
    title: 'Bisagra y hombro',
    note: '2 rondas. Cadera y escápula antes de peso muerto y press.',
    items: [
      qtyItem('Bike', '45 s'),
      qtyItem('Good morning sin carga', '10 reps'),
      qtyItem('KB deadlift', '8 reps', '16 kg'),
      qtyItem('Band pull-apart', '12 reps'),
      qtyItem('Pass through', '10 reps'),
      qtyItem("World's greatest stretch", '3 reps por lado'),
    ],
  },
  {
    title: 'Agilidad turf',
    note: '2 rondas suaves. Pies rápidos y movilidad de cadera.',
    items: [
      qtyItem('Carioca', '20 m ida y vuelta'),
      qtyItem('A-skip', '20 m'),
      qtyItem('Bear crawl', '10 m'),
      qtyItem('KB goblet squat', '8 reps', '16 kg'),
      qtyItem('Banded face pull', '12 reps'),
      qtyItem('Jump rope', '40 s'),
    ],
  },
  {
    title: 'Máquina y KB',
    note: '2 rondas. Sube pulso y despierta el patrón de bisagra.',
    items: [
      qtyItem('SkiErg', '40 s'),
      qtyItem('Russian KB swing', '10 reps', '16 kg'),
      qtyItem('Walking lunge', '6 reps por pierna'),
      qtyItem('Scapular pull-up', '6 reps'),
      qtyItem('Inchworm', '4 reps'),
      qtyItem('Hollow hold', '20 s'),
    ],
  },
  {
    title: 'Prep press militar',
    note: '2 rondas. Estabilidad de hombro y core antes de barra.',
    items: [
      qtyItem('Assault bike', '40 s'),
      qtyItem('Arm circle', '10 reps adelante + 10 atrás'),
      qtyItem('YTW raise', '6 reps cada letra', '1-2 kg'),
      qtyItem('Bottoms-up KB press', '5 reps por lado', '8/6 kg'),
      qtyItem('Side plank', '20 s por lado'),
      qtyItem("World's greatest stretch", '3 reps por lado'),
    ],
  },
];

const WEDNESDAY_ACTIVATIONS = [
  {
    title: 'Tren inferior',
    note: '2 rondas. Cadera y glúteo antes de sentadilla.',
    items: [
      qtyItem('90/90 stretch', '30 s por lado'),
      qtyItem('Glute bridge', '12 reps'),
      qtyItem('Goblet squat', '10 reps', '16 kg'),
      qtyItem('Walking lunge', '8 reps por pierna'),
      qtyItem('Banded lateral walk', '10 pasos por lado'),
      qtyItem('Jump rope', '40 s'),
    ],
  },
  {
    title: 'Movilidad de cadera',
    note: '2 rondas. Abre adductores y activa glúteo.',
    items: [
      qtyItem('Bike', '50 s'),
      qtyItem('Pigeon stretch', '30 s por lado'),
      qtyItem('Cossack squat', '5 reps por lado'),
      qtyItem('Glute bridge march', '8 reps por pierna'),
      qtyItem('Ankle rock', '8 reps por lado'),
      qtyItem('Jump rope', '30 s'),
    ],
  },
  {
    title: 'Cadena posterior',
    note: '2 rondas. Isquios y glúteo antes de sentadilla y RDL.',
    items: [
      qtyItem('SkiErg', '40 s'),
      qtyItem('Good morning sin carga', '10 reps'),
      qtyItem('Single-leg RDL bodyweight', '6 reps por pierna'),
      qtyItem('Couch stretch', '30 s por lado'),
      qtyItem('Cat camel', '8 reps'),
      qtyItem('Glute bridge', '10 reps'),
    ],
  },
  {
    title: 'Prep sentadilla',
    note: '2 rondas. Profundidad y control antes de barra.',
    items: [
      qtyItem('Row', '40 s'),
      qtyItem('Goblet squat con pausa', '8 reps', '16 kg'),
      qtyItem('Wall sit', '20 s'),
      qtyItem('Adductor rock', '8 reps por lado'),
      qtyItem('Calf raise', '12 reps'),
      qtyItem('Jump rope', '40 s'),
    ],
  },
  {
    title: 'Agilidad de pierna',
    note: '2 rondas. Pies rápidos y zancada controlada.',
    items: [
      qtyItem('A-skip', '20 m'),
      qtyItem('Butt kick', '20 m'),
      qtyItem('Lateral lunge', '6 reps por lado'),
      qtyItem('Goblet squat', '8 reps', '16 kg'),
      qtyItem('Banded monster walk', '8 pasos por lado'),
      qtyItem('Jump rope', '40 s'),
    ],
  },
  {
    title: 'Turf + glúteo',
    note: '2 rondas. Shuttle suave y activación de cadera.',
    items: [
      qtyItem('Shuttle run suave', '3 × 15 m'),
      qtyItem('Walking lunge', '6 reps por pierna'),
      qtyItem('Single-leg glute bridge', '8 reps por lado'),
      qtyItem("World's greatest stretch", '3 reps por lado'),
      qtyItem('Hollow hold', '20 s'),
      qtyItem('Bike', '30 s'),
    ],
  },
];

const THURSDAY_ACTIVATIONS = [
  {
    title: 'Motor e intervales',
    note: '2 rondas. Cardiaco y kettlebell sin fatiga muscular.',
    items: [
      qtyItem('Row', '30 s'),
      qtyItem('Air squat', '10 reps'),
      qtyItem('Russian KB swing', '12 reps', '16 kg'),
      qtyItem('High knees', '20 m'),
      qtyItem('Dead bug', '8 reps por lado'),
      qtyItem('Jump rope', '40 s'),
    ],
  },
  {
    title: 'Ski y kettlebell',
    note: '2 rondas. Bisagra explosiva y pulso alto suave.',
    items: [
      qtyItem('SkiErg', '45 s'),
      qtyItem('Russian KB swing', '10 reps', '16 kg'),
      qtyItem('KB clean', '5 reps por lado', '12 kg'),
      qtyItem('Inchworm', '4 reps'),
      qtyItem('Bird dog', '6 reps por lado'),
      qtyItem('Jump rope', '30 s'),
    ],
  },
  {
    title: 'Carrera y skips',
    note: '2 rondas. Mecánica de carrera antes de turf.',
    items: [
      qtyItem('A-skip', '20 m'),
      qtyItem('High knees', '20 m'),
      qtyItem('Butt kick', '20 m'),
      qtyItem('Air squat', '10 reps'),
      qtyItem("World's greatest stretch", '3 reps por lado'),
      qtyItem('Jump rope', '45 s'),
    ],
  },
  {
    title: 'Máquinas mixtas',
    note: '2 rondas. Cambia de máquina y mueve cadera.',
    items: [
      qtyItem('Row', '30 s'),
      qtyItem('SkiErg', '30 s'),
      qtyItem('Bike', '30 s'),
      qtyItem('Walking lunge', '6 reps por pierna'),
      qtyItem('Slam ball suave', '6 reps', '6 kg'),
      qtyItem('Hollow rocks', '10 reps'),
    ],
  },
  {
    title: 'Agilidad + slam',
    note: '2 rondas. Cambios de dirección y potencia de cadera.',
    items: [
      qtyItem('Lateral shuffle', '15 m ida y vuelta'),
      qtyItem('Carioca', '15 m ida y vuelta'),
      qtyItem('Med ball slam', '8 reps', '6 kg'),
      qtyItem('Goblet squat', '8 reps', '16 kg'),
      qtyItem('Dead bug', '6 reps por lado'),
      qtyItem('Jump rope', '30 s'),
    ],
  },
  {
    title: 'Bike y core',
    note: '2 rondas. Sube pulso y cierra costillas.',
    items: [
      qtyItem('Assault bike', '45 s'),
      qtyItem('Mountain climber', '16 reps'),
      qtyItem('Air squat', '10 reps'),
      qtyItem('KB deadlift', '8 reps', '16 kg'),
      qtyItem('Side plank', '20 s por lado'),
      qtyItem('Cat camel', '6 reps'),
    ],
  },
];

const SATURDAY_ACTIVATIONS = [
  {
    title: 'Tracción y core',
    note: '2 rondas. Escápulas y cadera antes del tirón.',
    items: [
      qtyItem('Cat camel', '8 reps'),
      qtyItem('Band pull-apart', '12 reps'),
      qtyItem('Scapular pull-up', '8 reps'),
      qtyItem('Inchworm', '5 reps'),
      qtyItem('KB deadlift', '10 reps', '16 kg'),
      qtyItem('Dead bug', '8 reps por lado'),
    ],
  },
  {
    title: 'Escápula y colgado',
    note: '2 rondas. Prepara dominadas estrictas.',
    items: [
      qtyItem('Row', '40 s'),
      qtyItem('Dead hang', '20 s'),
      qtyItem('Scapular pull-up', '6 reps'),
      qtyItem('Banded face pull', '12 reps'),
      qtyItem('Hollow hold', '20 s'),
      qtyItem('Child pose', '30 s'),
    ],
  },
  {
    title: 'Push-pull suave',
    note: '2 rondas. Empuje y tracción ligera antes de banca y remo.',
    items: [
      qtyItem('Bike', '40 s'),
      qtyItem('Scapular push-up', '8 reps'),
      qtyItem('Band pull-apart', '12 reps'),
      qtyItem('DB row suave', '8 reps por lado', '10 kg'),
      qtyItem('Inchworm', '4 reps'),
      qtyItem('Arch hold', '20 s'),
    ],
  },
  {
    title: 'Hollow y arch',
    note: '2 rondas. Línea media antes de gimnástico y banca.',
    items: [
      qtyItem('SkiErg', '40 s'),
      qtyItem('Hollow rocks', '12 reps'),
      qtyItem('Arch rocks', '12 reps'),
      qtyItem('Kip swing suave', '6 reps'),
      qtyItem('Banded good morning', '10 reps'),
      qtyItem('Cat camel', '6 reps'),
    ],
  },
  {
    title: 'Posterior y carry',
    note: '2 rondas. Cadera y grip antes de remo y farmer.',
    items: [
      qtyItem('Assault bike', '40 s'),
      qtyItem('Glute bridge', '12 reps'),
      qtyItem('Farmer hold', '20 s', '16 kg'),
      qtyItem('Banded face pull', '12 reps'),
      qtyItem('Good morning sin carga', '8 reps'),
      qtyItem('Dead bug', '6 reps por lado'),
    ],
  },
  {
    title: 'Remo y banda',
    note: '2 rondas. Escápula retraída y dorsal despierto.',
    items: [
      qtyItem('Row', '45 s'),
      qtyItem('Band pull-apart', '15 reps'),
      qtyItem('Scapular pull-up', '6 reps'),
      qtyItem('KB deadlift', '8 reps', '16 kg'),
      qtyItem("World's greatest stretch", '3 reps por lado'),
      qtyItem('Jump rope', '30 s'),
    ],
  },
];

const MONDAY_SHOULDERS = [
  (ctx) => [
    schemeItem('Lateral raises DB', ctx.role === 'descarga' ? '2 × 12' : '4 × 12', '8 kg'),
    schemeItem('Elevaciones frontales con disco', ctx.role === 'descarga' ? '2 × 12' : '4 × 12', '10 kg'),
  ],
  (ctx) => [
    schemeItem('Banded face pull', ctx.role === 'descarga' ? '2 × 15' : '4 × 15'),
    schemeItem('Y raise DB', ctx.role === 'descarga' ? '2 × 10' : '3 × 10', '2 kg'),
  ],
  (ctx) => [
    schemeItem('Cuban rotation', ctx.role === 'descarga' ? '2 × 8' : '3 × 8', '5 kg'),
    schemeItem('Band pull-apart', ctx.role === 'descarga' ? '2 × 15' : '4 × 15'),
  ],
  (ctx) => [
    schemeItem('Rear delt fly DB', ctx.role === 'descarga' ? '2 × 12' : '3 × 12', '6 kg'),
    schemeItem('Landmine press', ctx.role === 'descarga' ? '2 × 8' : '3 × 8', '15/10 kg'),
  ],
];

const MONDAY_ENGINE_BLOCKS = [
  {
    title: 'Deadlift + burpee',
    note: 'Min 1: deadlifts · Min 2: burpees over bar.',
    items: (ctx) => [
      qtyItem('Deadlift barbell', ctx.role === 'descarga' ? '4 reps' : '5 reps', loadFor('deadlift', ctx.phaseKey, ctx.role)),
      qtyItem('Burpee over the barbell', ctx.role === 'descarga' ? '8 reps' : '10 reps'),
    ],
  },
  {
    title: 'Deadlift + box',
    note: 'Min 1: peso muerto · Min 2: box jump.',
    items: (ctx) => [
      qtyItem('Deadlift barbell', ctx.role === 'descarga' ? '3 reps' : '4 reps', loadFor('deadlift', ctx.phaseKey, ctx.role)),
      qtyItem('Box jump', ctx.role === 'descarga' ? '6 reps' : '8 reps'),
    ],
  },
  {
    title: 'Push press + row',
    note: 'Min 1: push press · Min 2: remo calorías.',
    items: (ctx) => [
      qtyItem('Push press', ctx.role === 'descarga' ? '6 reps' : '8 reps', loadFor('press', ctx.phaseKey, ctx.role)),
      qtyItem('Row', ctx.role === 'descarga' ? '8 cal' : '12 cal'),
    ],
  },
  {
    title: 'Hang clean + bike',
    note: 'Min 1: hang power clean · Min 2: air bike.',
    items: (ctx) => [
      qtyItem('Hang power clean', ctx.role === 'descarga' ? '5 reps' : '6 reps', '40/25 kg'),
      qtyItem('Assault bike', ctx.role === 'descarga' ? '8 cal' : '10 cal'),
    ],
  },
  {
    title: 'Swing + shuttle',
    note: 'Min 1: swings · Min 2: shuttle.',
    items: (ctx) => [
      qtyItem('Russian KB swing', ctx.role === 'descarga' ? '10 reps' : '14 reps', '24/16 kg'),
      qtyItem('Shuttle run', ctx.role === 'descarga' ? '3 × 20 m' : '4 × 20 m'),
    ],
  },
  {
    title: 'Devil press + ski',
    note: 'Min 1: devil press · Min 2: ski.',
    items: (ctx) => [
      qtyItem('Devil press DB', ctx.role === 'descarga' ? '6 reps' : '8 reps', '16/10 kg'),
      qtyItem('SkiErg', ctx.role === 'descarga' ? '8 cal' : '12 cal'),
    ],
  },
];

const WEDNESDAY_HINGES = [
  (ctx) => [
    schemeItem(
      'Romanian deadlift',
      ctx.role === 'descarga' ? '2 × 8' : '4 × 8',
      loadFor('deadlift', ctx.phaseKey, ctx.role),
    ),
  ],
  (ctx) => [
    schemeItem('Good morning barbell', ctx.role === 'descarga' ? '2 × 8' : '4 × 8', loadFor('squat', ctx.phaseKey, ctx.role)),
  ],
  (ctx) => [
    schemeItem('Hip thrust', ctx.role === 'descarga' ? '2 × 10' : '4 × 10', '60/40 kg'),
  ],
  (ctx) => [
    schemeItem('Single-leg RDL DB', ctx.role === 'descarga' ? '2 × 8 por pierna' : '3 × 8 por pierna', '20/12 kg'),
  ],
];

const WEDNESDAY_FINISHERS = [
  {
    title: 'Lunges + burpee',
    items: (ctx) => [
      qtyItem('Walking lunge', ctx.role === 'descarga' ? '10 reps por pierna' : '12 reps por pierna'),
      qtyItem('Air squat', ctx.role === 'descarga' ? '12 reps' : '15 reps'),
      qtyItem('Burpee', ctx.role === 'descarga' ? '6 reps' : '8 reps'),
    ],
  },
  {
    title: 'Box + swing',
    items: (ctx) => [
      qtyItem('Box jump', ctx.role === 'descarga' ? '8 reps' : '10 reps'),
      qtyItem('Russian KB swing', ctx.role === 'descarga' ? '10 reps' : '14 reps', '24/16 kg'),
      qtyItem('Sit-up', '15 reps'),
    ],
  },
  {
    title: 'Bike + goblet',
    items: (ctx) => [
      qtyItem('Assault bike', ctx.role === 'descarga' ? '8 cal' : '12 cal'),
      qtyItem('Goblet squat', ctx.role === 'descarga' ? '8 reps' : '12 reps', '16/12 kg'),
      qtyItem('Mountain climber', '16 reps'),
    ],
  },
  {
    title: 'Shuttle + slam',
    items: (ctx) => [
      qtyItem('Shuttle run', ctx.role === 'descarga' ? '3 × 20 m' : '4 × 20 m'),
      qtyItem('Walking lunge', ctx.role === 'descarga' ? '8 reps por pierna' : '10 reps por pierna'),
      qtyItem('Slam ball', ctx.role === 'descarga' ? '8 reps' : '12 reps', '9 kg'),
    ],
  },
  {
    title: 'Step-up + lunge',
    items: (ctx) => [
      qtyItem('Box step-up', ctx.role === 'descarga' ? '8 reps por pierna' : '10 reps por pierna'),
      qtyItem('Jumping lunge', ctx.role === 'descarga' ? '8 reps' : '12 reps'),
      qtyItem('Hollow rocks', '12 reps'),
    ],
  },
  {
    title: 'Row + wall sit',
    items: (ctx) => [
      qtyItem('Row', ctx.role === 'descarga' ? '150 m' : '200 m'),
      qtyItem('Wall sit', ctx.role === 'descarga' ? '20 s' : '30 s'),
      qtyItem('Air squat', ctx.role === 'descarga' ? '10 reps' : '15 reps'),
    ],
  },
];

const THURSDAY_POWER = [
  (ctx) => [
    schemeItem('Russian KB swing', ctx.role === 'descarga' ? '3 × 12' : '4 × 12', '24/16 kg'),
    schemeItem('KB clean', ctx.role === 'descarga' ? '3 × 6' : '4 × 6', '20/12 kg'),
  ],
  (ctx) => [
    schemeItem('KB snatch', ctx.role === 'descarga' ? '3 × 6 por lado' : '4 × 6 por lado', '16/12 kg'),
    schemeItem('Goblet squat', ctx.role === 'descarga' ? '3 × 8' : '4 × 8', '20/12 kg'),
  ],
  (ctx) => [
    schemeItem('Med ball slam', ctx.role === 'descarga' ? '3 × 10' : '4 × 10', '9 kg'),
    schemeItem('Rotational med ball throw', ctx.role === 'descarga' ? '3 × 6 por lado' : '4 × 6 por lado', '6 kg'),
  ],
  (ctx) => [
    schemeItem('Broad jump', ctx.role === 'descarga' ? '3 × 4' : '4 × 5'),
    schemeItem('Russian KB swing', ctx.role === 'descarga' ? '3 × 12' : '4 × 12', '24/16 kg'),
  ],
];

const SATURDAY_ROWS = [
  (ctx) => schemeItem('Pendlay row', scheme(ROW_SCHEME, ctx.phaseKey, ctx.role), loadFor('row', ctx.phaseKey, ctx.role)),
  (ctx) => schemeItem('Chest-supported DB row', scheme(ROW_SCHEME, ctx.phaseKey, ctx.role), loadFor('row', ctx.phaseKey, ctx.role)),
  (ctx) => schemeItem('One-arm DB row', ctx.role === 'descarga' ? '2 × 8 por lado' : scheme(ROW_SCHEME, ctx.phaseKey, ctx.role), '24/16 kg'),
  (ctx) => schemeItem('Inverted row', scheme(ROW_SCHEME, ctx.phaseKey, ctx.role)),
];

const MONDAY_CORES = [
  (ctx) => [
    setsItem('Pallof press', ctx.role === 'descarga' ? 2 : 3, 12, 'banda'),
    qtyItem('Hollow hold', ctx.role === 'descarga' ? '2 × 20 s' : '2 × 30 s'),
  ],
  (ctx) => [
    setsItem('Dead bug', ctx.role === 'descarga' ? 2 : 3, 8),
    qtyItem('Side plank', ctx.role === 'descarga' ? '2 × 20 s por lado' : '2 × 30 s por lado'),
  ],
  (ctx) => [
    setsItem('Cable chop', ctx.role === 'descarga' ? 2 : 3, 10, 'banda'),
    qtyItem('Hollow rocks', ctx.role === 'descarga' ? '2 × 12' : '2 × 16'),
  ],
];

const WEDNESDAY_CORES = [
  () => [setsItem('Side plank', 2, '30 s por lado'), qtyItem('Superman hold', '2 × 20 s')],
  () => [setsItem('Bird dog', 2, 8), qtyItem('Glute bridge hold', '2 × 25 s')],
  () => [setsItem('Dead bug', 2, 10), qtyItem('McGill crunch', '2 × 8 por lado')],
];

const THURSDAY_CORES = [
  (ctx) => [
    setsItem('Banded face pull', ctx.role === 'descarga' ? 2 : 3, 15),
    setsItem('Hollow rocks', 2, ctx.role === 'descarga' ? 15 : 20),
  ],
  (ctx) => [
    setsItem('Hanging knee raise', ctx.role === 'descarga' ? 2 : 3, 8),
    setsItem('Farmer hold', 2, ctx.role === 'descarga' ? '20 s' : '30 s', '24/16 kg'),
  ],
  (ctx) => [
    setsItem('Russian twist', 2, ctx.role === 'descarga' ? 16 : 20, '6 kg'),
    setsItem('Plank shoulder tap', 2, 12),
  ],
];

const SATURDAY_CORES = [
  (ctx) => [
    setsItem('Dead bug', 2, 10),
    setsItem('Farmer carry', 2, ctx.role === 'descarga' ? '30 m' : '40 m', '24/16 kg'),
  ],
  (ctx) => [
    setsItem('Toes to bar o knee raise', 2, ctx.role === 'descarga' ? 6 : 8),
    setsItem('Suitcase carry', 2, ctx.role === 'descarga' ? '20 m por lado' : '30 m por lado', '24/16 kg'),
  ],
  (ctx) => [
    setsItem('Hollow hold', 2, ctx.role === 'descarga' ? '20 s' : '30 s'),
    setsItem('Waiter carry', 2, '20 m por lado', '16/12 kg'),
  ],
];

const MONDAY_COOLDOWNS = [
  'Camina 3 min. Estira hombros y glúteos 30 s por lado. Respiración nasal 4-6 durante 2 min.',
  'Foam roll dorsal y pectoral 2 min. Estira trapecio 30 s por lado. Camina 2 min.',
  'Colgado pasivo 20 s × 2. Estira flexores de cadera 45 s por lado. Respiración 2 min.',
];

const WEDNESDAY_COOLDOWNS = [
  'Foam roll cuádriceps e isquios 2 min. Camina 3 min.',
  'Couch stretch 45 s por lado. Foam roll glúteo 1 min cada lado. Camina 2 min.',
  '90/90 stretch 40 s por lado. Elevación de pantorrilla suave 12 reps. Camina 3 min.',
];

const THURSDAY_COOLDOWNS = [
  'Estira flexores de cadera y dorsal 1 min cada uno. Respiración 2 min.',
  'Caminata nasal 4 min. Estira isquios 40 s por lado.',
  'Foam roll adductores 90 s por lado. Respiración 4-6 durante 2 min.',
];

const SATURDAY_COOLDOWNS = [
  'Estira dorsales y pectorales 30 s por lado. Camina 3 min.',
  'Dead hang 20 s. Child pose 45 s. Foam roll dorsal 2 min.',
  'Banded dislocate 10 reps. Estira pectoral en marco de puerta 30 s por lado. Camina 2 min.',
];

function pick(pool, index) {
  return pool[((index % pool.length) + pool.length) % pool.length];
}

function scheme(table, phaseKey, role) {
  const phase = table[phaseKey] ?? table.base;
  const value = phase[role] ?? phase.intro;
  if (role !== 'descarga') return value;
  const match = value.match(/^(\d+) × (.+)$/);
  if (!match) return value;
  const sets = Math.max(1, Math.floor(Number(match[1]) / 2));
  return `${sets} × ${match[2]}`;
}

function metconTiming(table, phaseKey, role) {
  const phase = table[phaseKey] ?? table.base;
  return phase[role] ?? phase.intro;
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

function loadFor(lift, phaseKey, role) {
  const base = LOADS[lift]?.[phaseKey] ?? LOADS[lift]?.base ?? '';
  return role === 'descarga' && base.includes('/')
    ? base.replace(/(\d+)\/(\d+)/, (_, rx, scale) => `${Math.round(Number(rx) * 0.85)}/${Math.round(Number(scale) * 0.85)}`)
    : base;
}

function buildContext(week, role, phase) {
  return {
    week,
    role,
    phase,
    phaseKey: phase.key,
    variantIndex: week - 1,
    roleNote: WEEK_ROLE_NOTES[role],
  };
}

function activationSession(variant, role) {
  const duration = role === 'descarga' ? '10 min' : '12 min';
  return {
    kind: 'activation',
    dayOrder: 0,
    name: 'Activación',
    estimatedDuration: duration,
    main: block(BLOCK.activation, {
      title: variant.title,
      timing: duration,
      note: variant.note,
      items: variant.items,
    }),
    core: '',
    cooldown: '',
  };
}

function trainingSession({ name, duration, main, core = '', cooldown = '' }) {
  return {
    kind: 'session',
    dayOrder: 1,
    name,
    estimatedDuration: duration,
    main,
    core,
    cooldown,
  };
}

function restSession(variant) {
  return {
    kind: 'rest',
    dayOrder: 0,
    name: 'Día de descanso',
    estimatedDuration: 'Descanso',
    main: block(BLOCK.mobility, {
      title: variant.title,
      timing: '20 min',
      note: variant.note,
      items: variant.items,
    }),
    core: '',
    cooldown: '',
  };
}

const REST_VARIANTS = {
  1: [
    {
      title: 'Recuperación activa',
      note: 'Tras el lunes de tren superior. Sin barra ni metcon.',
      items: [
        qtyItem('Caminar o bici suave', '10 min'),
        qtyItem('Foam roll', '2 min espalda alta + 2 min glúteo'),
        qtyItem("World's greatest stretch", '4 reps por lado'),
        qtyItem('Banded shoulder dislocate', '10 reps'),
        qtyItem('Respiración nasal 4-6', '2 min'),
      ],
    },
    {
      title: 'Movilidad de hombro',
      note: 'Suave. Recupera el press del lunes.',
      items: [
        qtyItem('Caminar', '8 min'),
        qtyItem('Foam roll pectoral', '90 s por lado'),
        qtyItem('Banded dislocate', '12 reps'),
        qtyItem('Doorway chest stretch', '30 s por lado'),
        qtyItem('Respiración diafragmática', '2 min'),
      ],
    },
    {
      title: 'Paseo y T-spine',
      note: 'Sin carga. Solo movilidad.',
      items: [
        qtyItem('Caminar al aire libre', '12 min'),
        qtyItem('Cat camel', '10 reps'),
        qtyItem('Open book', '6 reps por lado'),
        qtyItem('Foam roll dorsal', '2 min'),
        qtyItem('Hidratación', '—'),
      ],
    },
    {
      title: 'Reset nervioso',
      note: 'Baja el tono. Nada de intensidad.',
      items: [
        qtyItem('Caminar nasal', '10 min'),
        qtyItem('Child pose', '60 s'),
        qtyItem('90/90 stretch', '40 s por lado'),
        qtyItem('Foam roll trapecio', '1 min por lado'),
        qtyItem('Respiración 4-6', '3 min'),
      ],
    },
  ],
  4: [
    {
      title: 'Recuperación media semana',
      note: 'Entre jueves y sábado. Piernas ligeras.',
      items: [
        qtyItem('Caminar al aire libre', '12 min'),
        qtyItem('Couch stretch', '45 s por lado'),
        qtyItem('Cat camel', '10 reps'),
        qtyItem('Foam roll isquios', '2 min'),
        qtyItem('Hidratación', '—'),
      ],
    },
    {
      title: 'Cadera y adductores',
      note: 'Prepara el sábado de tracción sin fatigar.',
      items: [
        qtyItem('Caminar', '10 min'),
        qtyItem('Pigeon stretch', '40 s por lado'),
        qtyItem('Adductor rock', '8 reps por lado'),
        qtyItem('Foam roll glúteo', '90 s por lado'),
        qtyItem('Respiración nasal', '2 min'),
      ],
    },
    {
      title: 'Paseo largo',
      note: 'Prioriza aire libre si puedes.',
      items: [
        qtyItem('Caminar', '15 min'),
        qtyItem("World's greatest stretch", '4 reps por lado'),
        qtyItem('Calf stretch', '30 s por lado'),
        qtyItem('Foam roll cuádriceps', '90 s por lado'),
        qtyItem('Hidratación', '—'),
      ],
    },
    {
      title: 'Movilidad de tobillo',
      note: 'Suave. Nada de saltos ni barra.',
      items: [
        qtyItem('Bici suave', '8 min'),
        qtyItem('Ankle rock', '8 reps por lado'),
        qtyItem('Couch stretch', '30 s por lado'),
        qtyItem('Foam roll pantorrilla', '1 min por lado'),
        qtyItem('Respiración 4-6', '2 min'),
      ],
    },
  ],
  6: [
    {
      title: 'Descanso completo',
      note: 'Prioriza dormir y comer bien. Movilidad muy suave.',
      items: [
        qtyItem('Caminar', '10 min'),
        qtyItem('Respiración diafragmática', '3 min'),
        qtyItem('Estiramiento de cadera 90/90', '45 s por lado'),
        qtyItem('Foam roll espalda alta', '2 min'),
        qtyItem('Prepara la semana', 'revisa horarios y material'),
      ],
    },
    {
      title: 'Domingo suave',
      note: 'Sin fatiga. Solo reset.',
      items: [
        qtyItem('Caminar', '12 min'),
        qtyItem('Child pose', '45 s'),
        qtyItem('Cat camel', '8 reps'),
        qtyItem('Foam roll lumbar suave', '90 s'),
        qtyItem('Respiración nasal 4-6', '3 min'),
      ],
    },
    {
      title: 'Movilidad general',
      note: 'Cierra la semana sin carga.',
      items: [
        qtyItem('Caminar o nadar suave', '10 min'),
        qtyItem("World's greatest stretch", '3 reps por lado'),
        qtyItem('Banded dislocate', '8 reps'),
        qtyItem('90/90 stretch', '30 s por lado'),
        qtyItem('Hidratación y sueño', 'apunta 7-8 h'),
      ],
    },
    {
      title: 'Paseo y respiración',
      note: 'El trabajo de verdad es recuperar.',
      items: [
        qtyItem('Caminar al aire libre', '15 min'),
        qtyItem('Respiración diafragmática', '4 min'),
        qtyItem('Estiramiento de pectoral', '30 s por lado'),
        qtyItem('Foam roll dorsal', '2 min'),
        qtyItem('Prepara la semana', 'revisa 4 entrenos'),
      ],
    },
  ],
};

function mondaySessions(ctx) {
  const { phaseKey, role, roleNote, variantIndex } = ctx;
  const finisher = pick(ENGINE_FINISHERS, variantIndex);
  const shoulders = pick(MONDAY_SHOULDERS, variantIndex);
  const engine = pick(MONDAY_ENGINE_BLOCKS, variantIndex);
  const core = pick(MONDAY_CORES, variantIndex);
  const amrapTime = metconTiming(METCON_AMRAP, phaseKey, role);
  const emomTime = metconTiming(METCON_EMOM, phaseKey, role);

  const main = [
    block(BLOCK.strength, {
      title: 'Hombro y estabilidad',
      timing: "cada 2'30\"",
      note: roleNote,
      items: shoulders(ctx),
    }),
    block(BLOCK.strength, {
      title: 'Press militar',
      timing: "cada 2'30\"",
      items: [schemeItem('Shoulder press', scheme(PRESS_SCHEME, phaseKey, role), loadFor('press', phaseKey, role))],
    }),
    block(BLOCK.technique, {
      title: 'Peso muerto',
      timing: '8 min',
      note: 'Aproximación progresiva antes del metcon.',
      items: [schemeItem('Deadlift barbell', role === 'descarga' ? '2 × 3' : '3 × 3', loadFor('deadlift', phaseKey, role))],
    }),
    block(finisher.type, {
      title: finisher.title,
      timing: finisher.timing?.(ctx) ?? amrapTime,
      note: 'Ritmo sostenible. Escala si pierdes técnica.',
      items: finisher.items(ctx),
    }),
    block(BLOCK.emom, {
      title: engine.title,
      timing: emomTime,
      note: engine.note,
      items: engine.items(ctx),
    }),
  ].join('\n\n');

  return [
    activationSession(pick(MONDAY_ACTIVATIONS, variantIndex), role),
    trainingSession({
      name: 'Lunes · ATHX',
      duration: role === 'descarga' ? '60 min' : '75 min',
      main,
      core: block(BLOCK.strength, {
        title: 'Core anti-rotación',
        timing: '6 min',
        items: core(ctx),
      }),
      cooldown: pick(MONDAY_COOLDOWNS, variantIndex),
    }),
  ];
}

function wednesdaySessions(ctx) {
  const { phaseKey, role, roleNote, variantIndex } = ctx;
  const finisher = pick(ENGINE_FINISHERS, variantIndex + 1);
  const hinge = pick(WEDNESDAY_HINGES, variantIndex);
  const extra = pick(WEDNESDAY_FINISHERS, variantIndex);
  const core = pick(WEDNESDAY_CORES, variantIndex);
  const amrapTime = metconTiming(METCON_AMRAP, phaseKey, role);

  const main = [
    block(BLOCK.strength, {
      title: 'Sentadilla trasera',
      timing: "cada 2'30\"",
      note: roleNote,
      items: [schemeItem('Back squat', scheme(SQUAT_SCHEME, phaseKey, role), loadFor('squat', phaseKey, role))],
    }),
    block(BLOCK.strength, {
      title: 'Bisagra',
      timing: "cada 2'",
      items: hinge(ctx),
    }),
    block(finisher.type, {
      title: finisher.title,
      timing: finisher.timing?.(ctx) ?? amrapTime,
      note: 'For time o AMRAP según bloque. Escala swings a 16/12 kg.',
      items: finisher.items(ctx),
    }),
    block(BLOCK.amrap, {
      title: extra.title,
      timing: amrapTime,
      items: extra.items(ctx),
    }),
  ].join('\n\n');

  return [
    activationSession(pick(WEDNESDAY_ACTIVATIONS, variantIndex + 2), role),
    trainingSession({
      name: 'Miércoles · ATHX',
      duration: role === 'descarga' ? '55 min' : '68 min',
      main,
      core: block(BLOCK.strength, {
        title: 'Core',
        timing: '5 min',
        items: core(ctx),
      }),
      cooldown: pick(WEDNESDAY_COOLDOWNS, variantIndex),
    }),
  ];
}

function thursdaySessions(ctx) {
  const { phaseKey, role, roleNote, variantIndex } = ctx;
  const metconA = pick(HYBRID_METCONS, variantIndex);
  const metconB = pick(HYBRID_METCONS, variantIndex + 3);
  const power = pick(THURSDAY_POWER, variantIndex);
  const core = pick(THURSDAY_CORES, variantIndex);
  const emomTime = metconTiming(METCON_EMOM, phaseKey, role);
  const amrapTime = metconTiming(METCON_AMRAP, phaseKey, role);

  const main = [
    block(BLOCK.strength, {
      title: 'Potencia de cadera',
      timing: "cada 2'",
      note: roleNote,
      items: power(ctx),
    }),
    block(metconA.type, {
      title: metconA.title,
      timing: metconA.timing?.(ctx) ?? amrapTime,
      note: 'Mantén técnica en remo, burpees y carrera.',
      items: metconA.items(ctx),
    }),
    block(metconB.type, {
      title: metconB.title,
      timing: metconB.type === BLOCK.emom ? emomTime : amrapTime,
      note: 'Intervals en turf. Ritmo sostenible.',
      items: metconB.items(ctx),
    }),
  ].join('\n\n');

  return [
    activationSession(pick(THURSDAY_ACTIVATIONS, variantIndex + 1), role),
    trainingSession({
      name: 'Jueves · ATHX',
      duration: role === 'descarga' ? '55 min' : '70 min',
      main,
      core: block(BLOCK.strength, {
        title: 'Accesorio',
        timing: '8 min',
        items: core(ctx),
      }),
      cooldown: pick(THURSDAY_COOLDOWNS, variantIndex),
    }),
  ];
}

function saturdaySessions(ctx) {
  const { phaseKey, role, roleNote, variantIndex } = ctx;
  const metconA = pick(PULL_METCONS, variantIndex);
  const metconB = pick(PULL_METCONS, variantIndex + 3);
  const row = pick(SATURDAY_ROWS, variantIndex);
  const core = pick(SATURDAY_CORES, variantIndex);
  const emomTime = metconTiming(METCON_EMOM, phaseKey, role);
  const amrapTime = metconTiming(METCON_AMRAP, phaseKey, role);
  const pullLoad = role === 'pico' && phaseKey === 'realizacion' ? 'máximo estricto' : 'banda si hace falta';

  const main = [
    block(BLOCK.strength, {
      title: 'Dominadas y remo',
      timing: "cada 2'30\"",
      note: roleNote,
      items: [
        schemeItem('Strict pull-up', scheme(PULL_SCHEME, phaseKey, role), pullLoad),
        row(ctx),
      ],
    }),
    block(BLOCK.strength, {
      title: 'Empuje horizontal',
      timing: "cada 2'",
      items: [schemeItem('Bench press', scheme(BENCH_SCHEME, phaseKey, role), loadFor('bench', phaseKey, role))],
    }),
    block(metconA.type, {
      title: metconA.title,
      timing: metconA.type === BLOCK.emom ? emomTime : amrapTime,
      items: metconA.items(ctx),
    }),
    block(metconB.type, {
      title: metconB.title,
      timing: metconB.timing?.(ctx) ?? amrapTime,
      note: 'Cierra la semana con intensidad controlada.',
      items: metconB.items(ctx),
    }),
  ].join('\n\n');

  return [
    activationSession(pick(SATURDAY_ACTIVATIONS, variantIndex + 3), role),
    trainingSession({
      name: 'Sábado · ATHX',
      duration: role === 'descarga' ? '58 min' : '72 min',
      main,
      core: block(BLOCK.strength, {
        title: 'Core y carry',
        timing: '6 min',
        items: core(ctx),
      }),
      cooldown: pick(SATURDAY_COOLDOWNS, variantIndex),
    }),
  ];
}

const DAY_BUILDERS = new Map([
  [0, mondaySessions],
  [2, wednesdaySessions],
  [3, thursdaySessions],
  [5, saturdaySessions],
]);

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

export function buildAthxYear({ year = DEFAULT_YEAR, restDays = true } = {}) {
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

    const builder = DAY_BUILDERS.get(weekdayIndex);
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
    };

    if (isRest) {
      const variants = REST_VARIANTS[weekdayIndex];
      const variant = pick(variants, week - 1);
      days.push({
        ...base,
        isRest: true,
        sessions: [restSession(variant)],
      });
      continue;
    }

    const context = buildContext(week, role, phase);
    days.push({
      ...base,
      isRest: false,
      sessions: builder(context),
    });
  }

  return days;
}

const RATE_ID_BASE = 5_500_000;
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
        corePart: session.core ?? '',
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
