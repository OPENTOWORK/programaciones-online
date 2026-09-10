/**
 * Programación de Calistenia para un año natural completo (del 1 de enero al 31 de diciembre),
 * repartida en 13 mesociclos de 4 semanas (3 de carga + 1 de descarga) agrupados en 5 fases.
 *
 * Se entrena lunes, martes, jueves, viernes y sábado. Miércoles y domingo son descanso.
 *
 * Cada día de entreno genera tres sesiones independientes en el calendario:
 *   1. Activación  → uno o dos bloques (movilidad y activación específica del patrón del día).
 *   2. Sesión      → técnica/skills + fuerza + accesorio y core.
 *   3. Metcon      → un bloque de acondicionamiento con formato rotativo.
 *
 * El contenido no se repite: cada día del año lleva una combinación distinta y ninguna semana
 * coincide con otra, aunque todas respetan el mesociclo y el rol de carga que les toca.
 *
 * Los nombres de ejercicio van en inglés; las explicaciones, cabeceras y notas, en español.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const DEFAULT_YEAR = 2026;

/** Semanas completas de mesociclo: 13 × 4. Un año natural deja 1 o 2 semanas parciales fuera. */
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

/** Lunes, martes, jueves, viernes y sábado. El índice 0 es lunes. */
export const TRAINING_WEEKDAYS = [0, 1, 3, 4, 5];

/** Miércoles y domingo. */
export const REST_WEEKDAYS = [2, 6];

export const REST_DAY_SESSION_NAME = 'Día de descanso';

export const WEEK_ROLES = ['intro', 'carga', 'pico', 'descarga'];

export const WEEK_ROLE_LABELS = {
  intro: 'Introducción',
  carga: 'Carga',
  pico: 'Pico',
  descarga: 'Descarga',
};

const WEEK_ROLE_NOTES = {
  intro: 'Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.',
  carga: 'Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.',
  pico: 'Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.',
  descarga: 'Semana de descarga: la mitad del volumen y sin acercarte al fallo.',
};

export const PHASES = [
  {
    key: 'basicos',
    name: 'Básicos',
    mesocycles: [1, 2],
    goal: 'Patrones fundamentales, control escapular y hollow/arch. Pull up y dip estrictos.',
  },
  {
    key: 'acumulacion',
    name: 'Acumulación',
    mesocycles: [3, 4, 5],
    goal: 'Volumen de fuerza con progresiones asistidas y trabajo de densidad.',
  },
  {
    key: 'intensificacion',
    name: 'Intensificación',
    mesocycles: [6, 7, 8],
    goal: 'Menos repeticiones y más intensidad: lastre, tempo e isometrías largas.',
  },
  {
    key: 'skills',
    name: 'Skills',
    mesocycles: [9, 10, 11],
    goal: 'Muscle-up, front lever, handstand push up y planche sobre la base construida.',
  },
  {
    key: 'realizacion',
    name: 'Realización y test',
    mesocycles: [12, 13],
    goal: 'Expresión de máximos, test de skills y cierre del año en descarga.',
  },
];

const PHASE_INDEX = new Map(PHASES.map((phase, index) => [phase.key, index]));
const PHASE_BY_MESOCYCLE = new Map(
  PHASES.flatMap((phase) => phase.mesocycles.map((mesocycle) => [mesocycle, phase])),
);

/** Series × repeticiones del movimiento principal de fuerza. */
const STRENGTH_SCHEME = {
  basicos: { intro: '3 × 8', carga: '4 × 8', pico: '4 × 10', descarga: '2 × 8' },
  acumulacion: { intro: '4 × 8', carga: '4 × 10', pico: '5 × 10', descarga: '3 × 8' },
  intensificacion: { intro: '4 × 6', carga: '5 × 5', pico: '5 × 4', descarga: '3 × 5' },
  skills: { intro: '4 × 5', carga: '5 × 4', pico: '6 × 3', descarga: '3 × 4' },
  realizacion: { intro: '4 × 4', carga: '5 × 3', pico: '5 × 2', descarga: '3 × 3' },
};

/** Movimiento secundario: algo más de volumen y menos exigencia técnica. */
const SECONDARY_SCHEME = {
  basicos: { intro: '3 × 10', carga: '3 × 12', pico: '4 × 12', descarga: '2 × 10' },
  acumulacion: { intro: '3 × 12', carga: '4 × 12', pico: '4 × 15', descarga: '2 × 12' },
  intensificacion: { intro: '3 × 10', carga: '4 × 10', pico: '4 × 8', descarga: '2 × 10' },
  skills: { intro: '3 × 8', carga: '4 × 8', pico: '4 × 6', descarga: '2 × 8' },
  realizacion: { intro: '3 × 6', carga: '4 × 6', pico: '4 × 5', descarga: '2 × 6' },
};

/** Isometrías de skill: series × segundos. */
const SKILL_HOLD_SCHEME = {
  basicos: { intro: '3 × 15 s', carga: '3 × 20 s', pico: '4 × 20 s', descarga: '2 × 15 s' },
  acumulacion: { intro: '4 × 20 s', carga: '4 × 25 s', pico: '5 × 25 s', descarga: '3 × 20 s' },
  intensificacion: { intro: '4 × 25 s', carga: '5 × 25 s', pico: '5 × 30 s', descarga: '3 × 20 s' },
  skills: { intro: '5 × 20 s', carga: '5 × 25 s', pico: '6 × 25 s', descarga: '3 × 20 s' },
  realizacion: { intro: '4 × 25 s', carga: '4 × 30 s', pico: '3 × 35 s', descarga: '3 × 20 s' },
};

/** Repeticiones de skill: pocas y siempre limpias. */
const SKILL_REPS_SCHEME = {
  basicos: { intro: '3 × 5', carga: '3 × 6', pico: '4 × 6', descarga: '2 × 5' },
  acumulacion: { intro: '4 × 5', carga: '4 × 6', pico: '5 × 6', descarga: '3 × 5' },
  intensificacion: { intro: '4 × 4', carga: '5 × 4', pico: '5 × 5', descarga: '3 × 4' },
  skills: { intro: '5 × 3', carga: '5 × 4', pico: '6 × 4', descarga: '3 × 3' },
  realizacion: { intro: '4 × 3', carga: '5 × 2', pico: '5 × 2', descarga: '3 × 2' },
};

/** Skills que todavía no salen: se cuentan intentos, no series. */
const SKILL_ATTEMPT_SCHEME = {
  basicos: { intro: '4 intentos', carga: '5 intentos', pico: '6 intentos', descarga: '3 intentos' },
  acumulacion: { intro: '5 intentos', carga: '6 intentos', pico: '8 intentos', descarga: '4 intentos' },
  intensificacion: { intro: '6 intentos', carga: '8 intentos', pico: '10 intentos', descarga: '4 intentos' },
  skills: { intro: '8 intentos', carga: '10 intentos', pico: '12 intentos', descarga: '5 intentos' },
  realizacion: { intro: '6 intentos', carga: '8 intentos', pico: '10 intentos', descarga: '4 intentos' },
};

const ACCESSORY_REPS_SCHEME = {
  basicos: { intro: '3 × 12', carga: '3 × 15', pico: '4 × 15', descarga: '2 × 12' },
  acumulacion: { intro: '3 × 15', carga: '4 × 15', pico: '4 × 20', descarga: '2 × 15' },
  intensificacion: { intro: '3 × 12', carga: '4 × 12', pico: '4 × 15', descarga: '2 × 12' },
  skills: { intro: '3 × 10', carga: '4 × 10', pico: '4 × 12', descarga: '2 × 10' },
  realizacion: { intro: '3 × 10', carga: '3 × 12', pico: '4 × 12', descarga: '2 × 10' },
};

const ACCESSORY_HOLD_SCHEME = {
  basicos: { intro: '3 × 20 s', carga: '3 × 30 s', pico: '4 × 30 s', descarga: '2 × 20 s' },
  acumulacion: { intro: '3 × 30 s', carga: '4 × 30 s', pico: '4 × 40 s', descarga: '2 × 30 s' },
  intensificacion: { intro: '3 × 30 s', carga: '4 × 35 s', pico: '4 × 40 s', descarga: '2 × 30 s' },
  skills: { intro: '4 × 30 s', carga: '4 × 35 s', pico: '5 × 35 s', descarga: '2 × 30 s' },
  realizacion: { intro: '3 × 35 s', carga: '4 × 40 s', pico: '4 × 45 s', descarga: '2 × 30 s' },
};

const SKILL_BLOCK_MINUTES = {
  basicos: 10,
  acumulacion: 12,
  intensificacion: 14,
  skills: 16,
  realizacion: 14,
};

const STRENGTH_BLOCK_MINUTES = {
  basicos: 20,
  acumulacion: 24,
  intensificacion: 26,
  skills: 24,
  realizacion: 22,
};

/** Marcadores de dosificación: isometría, repeticiones o intentos. */
const hold = (name) => ({ name, mode: 'hold' });
const reps = (name) => ({ name, mode: 'reps' });
const attempts = (name) => ({ name, mode: 'attempts' });

function greatestCommonDivisor(left, right) {
  return right === 0 ? left : greatestCommonDivisor(right, left % right);
}

function pick(pool, index) {
  return pool[((index % pool.length) + pool.length) % pool.length];
}

/**
 * Toma `count` elementos distintos del pool. El paso cambia cada vuelta completa, así que las
 * combinaciones no se repiten semana tras semana pero siguen siendo deterministas.
 */
function pickMany(pool, index, count) {
  const size = pool.length;
  const offset = ((index % size) + size) % size;
  const strides = [1, 3, 5, 7].filter((stride) => greatestCommonDivisor(stride, size) === 1);
  const stride = strides[Math.floor(index / size) % strides.length] ?? 1;

  return Array.from({ length: Math.min(count, size) }, (_, position) =>
    pool[(offset + position * stride) % size],
  );
}

function schemeFor(mode, phaseKey, role, { accessory = false } = {}) {
  if (mode === 'hold') {
    return (accessory ? ACCESSORY_HOLD_SCHEME : SKILL_HOLD_SCHEME)[phaseKey][role];
  }
  if (mode === 'attempts') return SKILL_ATTEMPT_SCHEME[phaseKey][role];
  return (accessory ? ACCESSORY_REPS_SCHEME : SKILL_REPS_SCHEME)[phaseKey][role];
}

const DAY_TYPES = [
  {
    key: 'push-vertical',
    name: 'Empuje vertical',
    sessionName: 'Empuje vertical y handstand',
    metconTags: ['pull', 'legs', 'engine', 'fullbody'],
    mobility: [
      'Band dislocates: 15 reps',
      'Wall slides: 12 reps',
      'Wrist mobility on floor: 45 s',
      'Quadruped thoracic rotation: 8 reps por lado',
      'Doorway chest opener: 30 s por lado',
      'Cat camel: 10 reps',
      'Plank shoulder circles: 8 reps por lado',
      'Seated shoulder bridge: 10 reps',
    ],
    activation: [
      'Scapular push up: 12 reps',
      'Band pull apart: 15 reps',
      'Band face pull: 15 reps',
      'Wall pike hold: 30 s',
      'Push up plus: 10 reps',
      'Band Y raise: 12 reps',
      'Hollow hold: 30 s',
      'Slow wall walk: 3 reps',
    ],
    skills: {
      basicos: [
        { title: 'Base de handstand', items: [hold('Feet-elevated pike hold'), hold('Active shoulder plank')] },
        { title: 'Handstand en pared', items: [hold('Back-to-wall handstand'), hold('Hollow hold')] },
        { title: 'Control de muñeca y línea', items: [hold('Frogstand'), hold('Back-to-wall handstand')] },
      ],
      acumulacion: [
        { title: 'Handstand de barriga a pared', items: [hold('Chest-to-wall handstand'), reps('Hollow to arch')] },
        { title: 'Entradas controladas', items: [reps('Wall walk'), hold('Feet-elevated pike hold')] },
        { title: 'Line drills', items: [hold('Chest-to-wall handstand'), reps('Handstand toe pulls')] },
      ],
      intensificacion: [
        { title: 'Equilibrio activo', items: [reps('Wall handstand shoulder taps'), attempts('Freestanding handstand hold')] },
        { title: 'Fuerza en invertido', items: [reps('Wall HSPU negative'), hold('Chest-to-wall handstand')] },
        { title: 'Kick up y parada', items: [attempts('Freestanding kick up'), hold('Chest-to-wall handstand')] },
      ],
      skills: [
        { title: 'Handstand libre', items: [hold('Freestanding handstand hold'), reps('Freestanding handstand shoulder taps')] },
        { title: 'Handstand push up', items: [reps('Wall HSPU'), hold('Freestanding handstand hold')] },
        { title: 'Desplazamiento invertido', items: [attempts('Handstand walk'), reps('Wall handstand shoulder taps')] },
      ],
      realizacion: [
        { title: 'Test de handstand', items: [hold('Max freestanding handstand hold'), reps('Strict HSPU')] },
        { title: 'HSPU libre', items: [attempts('Freestanding HSPU'), hold('Freestanding handstand hold')] },
        { title: 'Handstand walk', items: [attempts('Handstand walk'), hold('Max freestanding handstand hold')] },
      ],
    },
    strength: {
      basicos: [
        ['Pike push up', 'Bench dips'],
        ['Feet-elevated push up', 'Band shoulder press'],
        ['Bent-knee pike push up', 'Band-assisted parallel bar dips'],
      ],
      acumulacion: [
        ['Feet-elevated pike push up', 'Parallel bar dips'],
        ['Box pike push up', 'Assisted ring dips'],
        ['Feet-elevated pike push up', 'Ring shoulder press'],
      ],
      intensificacion: [
        ['Wall HSPU negative', 'Weighted parallel bar dips'],
        ['Deficit pike push up', 'Ring dips'],
        ['Wall HSPU to pads', 'Weighted parallel bar dips'],
      ],
      skills: [
        ['Wall HSPU', 'Weighted ring dips'],
        ['Wall deficit HSPU', 'Weighted parallel bar dips'],
        ['Pseudo planche push up', 'Wall HSPU'],
      ],
      realizacion: [
        ['Strict HSPU', 'Weighted ring dips'],
        ['Deficit HSPU', 'Weighted parallel bar dips'],
        ['Strict HSPU', 'Pseudo planche push up'],
      ],
    },
    accessory: [
      [hold('Hollow hold'), reps('Ring triceps extension')],
      [reps('Alternating hollow and arch'), reps('Feet-elevated bench dips')],
      [reps('Side plank hip raise'), reps('Band face pull')],
      [reps('Slow dead bug'), reps('Band Y raise')],
    ],
    cooldown: [
      'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.',
      'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.',
      'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.',
    ],
  },
  {
    key: 'pull-vertical',
    name: 'Tracción vertical',
    sessionName: 'Tracción vertical y muscle-up',
    metconTags: ['push', 'legs', 'engine', 'fullbody'],
    mobility: [
      'Passive bar hang: 30 s',
      'Band dislocates: 15 reps',
      'Supine thoracic rotation: 8 reps por lado',
      'Elbow and wrist mobility: 45 s',
      'Cat camel: 10 reps',
      'Scapular slides on bar: 10 reps',
      'Wall chest opener: 30 s por lado',
      'Seated shoulder bridge: 10 reps',
    ],
    activation: [
      'Scapular pull up: 10 reps',
      'Band pull apart: 15 reps',
      'Band row: 15 reps',
      'Active hang: 30 s',
      'Hollow hold: 30 s',
      'Band face pull: 15 reps',
      'Band external rotation: 12 reps por lado',
      'Arch hold: 20 s',
    ],
    skills: {
      basicos: [
        { title: 'Control escapular en barra', items: [reps('Slow scapular pull up'), hold('Active hang')] },
        { title: 'Dominada asistida', items: [reps('Band-assisted pull up'), hold('Chin over bar hold')] },
        { title: 'Negativas de dominada', items: [reps('5 s pull up negative'), reps('Slow scapular pull up')] },
      ],
      acumulacion: [
        { title: 'Dominada estricta', items: [reps('Strict pull up'), hold('Alternating one-arm active hang')] },
        { title: 'Camino al muscle-up', items: [reps('Chest-to-bar pull up'), reps('Band muscle-up transition')] },
        { title: 'Tracción explosiva', items: [reps('Explosive pull up'), reps('Slow scapular pull up')] },
      ],
      intensificacion: [
        { title: 'Transición de muscle-up', items: [reps('Low ring muscle-up transition'), reps('Sternum pull up')] },
        { title: 'Dominada lastrada', items: [reps('Weighted pull up'), reps('5 s pull up negative')] },
        { title: 'Muscle-up asistido', items: [reps('Band-assisted muscle-up'), reps('Explosive pull up')] },
      ],
      skills: [
        { title: 'Muscle-up en barra', items: [attempts('Strict muscle-up'), reps('Sternum pull up')] },
        { title: 'Muscle-up en anillas', items: [reps('Band-assisted ring muscle-up'), reps('Low ring muscle-up transition')] },
        { title: 'Fuerza en el punto muerto', items: [reps('5 s muscle-up negative'), reps('Weighted pull up')] },
      ],
      realizacion: [
        { title: 'Test de muscle-up', items: [reps('Strict muscle-up'), reps('Weighted pull up')] },
        { title: 'Test de dominadas', items: [attempts('Max strict pull up'), reps('Strict muscle-up')] },
        { title: 'Muscle-up en anillas', items: [attempts('Ring muscle-up'), reps('5 s muscle-up negative')] },
      ],
    },
    strength: {
      basicos: [
        ['Band-assisted pull up', 'Australian pull up'],
        ['Assisted chin up', 'Ring row'],
        ['4 s pull up negative', 'Feet-elevated Australian pull up'],
      ],
      acumulacion: [
        ['Strict pull up', 'Feet-elevated ring row'],
        ['Chin up', 'Feet-elevated Australian pull up'],
        ['Tempo 3-1-1 strict pull up', 'Ring row'],
      ],
      intensificacion: [
        ['Weighted pull up', 'Weighted ring row'],
        ['Weighted close-grip pull up', 'Weighted Australian pull up'],
        ['Strict pull up with top pause', 'Feet-elevated ring row'],
      ],
      skills: [
        ['Weighted pull up', 'Sternum ring row'],
        ['Sternum pull up', 'Weighted ring row'],
        ['Explosive pull up to high bar', 'Weighted pull up'],
      ],
      realizacion: [
        ['Max weighted pull up', 'Weighted ring row'],
        ['Strict pull up to technical failure', 'Weighted pull up'],
        ['Weighted sternum pull up', 'Sternum ring row'],
      ],
    },
    accessory: [
      [reps('Ring biceps curl'), hold('Hollow hold')],
      [reps('Band face pull'), reps('Hanging knee raise')],
      [reps('Band external rotation'), hold('Arch hold')],
      [reps('One-arm band row'), reps('Plank shoulder tap')],
    ],
    cooldown: [
      'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.',
      'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.',
      'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.',
    ],
  },
  {
    key: 'legs-core',
    name: 'Piernas y core',
    sessionName: 'Piernas, salto y core',
    metconTags: ['push', 'pull', 'engine', 'fullbody'],
    mobility: [
      'Wall ankle mobility: 10 reps por lado',
      'Deep squat hold: 45 s',
      'Cossack squat: 8 reps por lado',
      '90/90 hip mobility: 8 reps por lado',
      'Quadruped hip circles: 8 reps por lado',
      'Active hamstring stretch: 10 reps por lado',
      'Cat camel: 10 reps',
      'Single-leg glute bridge: 10 reps por lado',
    ],
    activation: [
      'Band monster walk: 12 pasos por lado',
      'Glute bridge: 15 reps',
      'Single-leg calf raise: 15 reps por lado',
      'Slow dead bug: 10 reps por lado',
      'Hollow hold: 30 s',
      'Wall sit: 30 s',
      'Light jump lunge: 8 reps por lado',
      'Side plank: 30 s por lado',
    ],
    skills: {
      basicos: [
        { title: 'Control de sentadilla', items: [hold('Deep squat hold'), reps('Single-leg box squat')] },
        { title: 'Base de pistol', items: [reps('Ring-assisted pistol squat'), reps('Bulgarian split squat')] },
        { title: 'Tobillo y rodilla', items: [reps('Heels-elevated squat'), reps('Single-leg calf raise')] },
      ],
      acumulacion: [
        { title: 'Pistol progresivo', items: [reps('Box pistol squat'), reps('Assisted shrimp squat')] },
        { title: 'Unilateral con control', items: [reps('Tempo Bulgarian split squat'), reps('Ring-assisted pistol squat')] },
        { title: 'Cadena posterior', items: [reps('Assisted Nordic curl'), reps('Single-leg glute bridge')] },
      ],
      intensificacion: [
        { title: 'Pistol completo', items: [reps('Pistol squat'), reps('Shrimp squat')] },
        { title: 'Nordic curl', items: [reps('Nordic curl negative'), reps('Weighted Bulgarian split squat')] },
        { title: 'Salto y aterrizaje', items: [reps('Box jump'), reps('Pistol squat')] },
      ],
      skills: [
        { title: 'Pistol lastrado', items: [reps('Weighted pistol squat'), reps('Shrimp squat')] },
        { title: 'Nordic curl completo', items: [reps('Nordic curl'), reps('Pistol squat')] },
        { title: 'Potencia de salto', items: [reps('Max vertical jump'), reps('Single-leg box jump')] },
      ],
      realizacion: [
        { title: 'Test unilateral', items: [attempts('Max pistol squat'), reps('Nordic curl')] },
        { title: 'Test de salto', items: [reps('Max vertical jump'), reps('Max broad jump')] },
        { title: 'Fuerza a una pierna', items: [reps('Weighted pistol squat'), reps('Weighted shrimp squat')] },
      ],
    },
    strength: {
      basicos: [
        ['Tempo 3-1-1 air squat', 'Reverse lunge'],
        ['Box squat', 'Single-leg glute bridge'],
        ['Box step up', 'Bulgarian split squat'],
      ],
      acumulacion: [
        ['Bulgarian split squat', 'Assisted Nordic hamstring curl'],
        ['Walking lunge', 'Band hamstring curl'],
        ['Single-leg box squat', 'Single-leg Romanian deadlift'],
      ],
      intensificacion: [
        ['Pistol squat', 'Nordic curl negative'],
        ['Weighted Bulgarian split squat', 'Weighted single-leg glute bridge'],
        ['Shrimp squat', 'Weighted single-leg Romanian deadlift'],
      ],
      skills: [
        ['Weighted pistol squat', 'Nordic curl'],
        ['Shrimp squat', 'Nordic hamstring curl'],
        ['Single-leg jump squat', 'Nordic curl negative'],
      ],
      realizacion: [
        ['Max weighted pistol squat', 'Nordic curl'],
        ['Weighted shrimp squat', 'Single-leg box jump'],
        ['Pistol squat', 'Weighted single-leg Romanian deadlift'],
      ],
    },
    accessory: [
      [hold('Hollow hold'), reps('Single-leg calf raise')],
      [reps('Side plank hip raise'), reps('Slow dead bug')],
      [reps('Hanging knee raise'), hold('Copenhagen plank')],
      [reps('V-up'), reps('Single-leg glute bridge')],
    ],
    cooldown: [
      'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.',
      'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.',
      'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.',
    ],
  },
  {
    key: 'push-horizontal',
    name: 'Empuje horizontal',
    sessionName: 'Empuje horizontal y planche',
    metconTags: ['pull', 'legs', 'core', 'engine'],
    mobility: [
      'Wall chest opener: 30 s por lado',
      'Wrist mobility on floor: 45 s',
      'Quadruped thoracic rotation: 8 reps por lado',
      'Band dislocates: 15 reps',
      'Cat camel: 10 reps',
      'Plank scapular slide: 10 reps',
      'Seated shoulder bridge: 10 reps',
      'Band elbow mobility: 12 reps',
    ],
    activation: [
      'Scapular push up: 12 reps',
      'Push up plus: 10 reps',
      'Hollow hold: 30 s',
      'Plank shoulder tap: 10 reps por lado',
      'Band pull apart: 15 reps',
      'Planche lean: 20 s',
      'Band face pull: 15 reps',
      'Slow dead bug: 10 reps por lado',
    ],
    skills: {
      basicos: [
        { title: 'Base de planche', items: [hold('Forward-leaning plank'), reps('Slow scapular push up')] },
        { title: 'Tensión de línea', items: [hold('Hollow hold'), hold('Forward-leaning plank')] },
        { title: 'Muñeca y protracción', items: [reps('Paused push up plus'), hold('Frogstand')] },
      ],
      acumulacion: [
        { title: 'Planche lean', items: [hold('Floor planche lean'), hold('Frogstand')] },
        { title: 'Tuck planche asistido', items: [hold('Band-assisted tuck planche'), hold('Floor planche lean')] },
        { title: 'Pseudo push up', items: [reps('Knee pseudo planche push up'), hold('Floor planche lean')] },
      ],
      intensificacion: [
        { title: 'Tuck planche', items: [hold('Tuck planche'), hold('Parallette planche lean')] },
        { title: 'Pseudo planche push up', items: [reps('Pseudo planche push up'), hold('Band-assisted tuck planche')] },
        { title: 'Planche en anillas', items: [hold('Ring tuck planche'), hold('Floor planche lean')] },
      ],
      skills: [
        { title: 'Advanced tuck planche', items: [hold('Advanced tuck planche'), reps('Pseudo planche push up')] },
        { title: 'Straddle planche asistido', items: [hold('Band-assisted straddle planche'), hold('Tuck planche')] },
        { title: 'Fuerza de planche', items: [reps('Deficit pseudo planche push up'), hold('Advanced tuck planche')] },
      ],
      realizacion: [
        { title: 'Test de planche', items: [hold('Max advanced tuck planche'), hold('Tuck planche')] },
        { title: 'Straddle planche', items: [attempts('Straddle planche'), hold('Advanced tuck planche')] },
        { title: 'Planche push up', items: [reps('Tuck planche push up'), reps('Deficit pseudo planche push up')] },
      ],
    },
    strength: {
      basicos: [
        ['Strict push up', 'Bench dips'],
        ['Tempo 3-1-1 knee push up', 'Incline push up'],
        ['Close-grip push up', 'Band-assisted parallel bar dips'],
      ],
      acumulacion: [
        ['Feet-elevated push up', 'Parallel bar dips'],
        ['Ring push up', 'Close-grip push up'],
        ['Archer push up', 'Assisted ring dips'],
      ],
      intensificacion: [
        ['Weighted push up', 'Ring dips'],
        ['Ring push up with turnout', 'Weighted parallel bar dips'],
        ['Tempo archer push up', 'Weighted push up'],
      ],
      skills: [
        ['Pseudo planche push up', 'Weighted ring dips'],
        ['Weighted push up', 'Ring push up with turnout'],
        ['Assisted one-arm push up', 'Pseudo planche push up'],
      ],
      realizacion: [
        ['Max weighted push up', 'Weighted ring dips'],
        ['One-arm push up', 'Deficit pseudo planche push up'],
        ['Pseudo planche push up', 'Weighted push up'],
      ],
    },
    accessory: [
      [reps('Ring triceps extension'), hold('Hollow hold')],
      [reps('Plank shoulder tap'), reps('Band face pull')],
      [reps('Ab wheel rollout'), reps('Band Y raise')],
      [reps('Side plank hip raise'), reps('Paused push up plus')],
    ],
    cooldown: [
      'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.',
      'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.',
      'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.',
    ],
  },
  {
    key: 'pull-horizontal',
    name: 'Tracción horizontal',
    sessionName: 'Tracción horizontal y front lever',
    metconTags: ['push', 'legs', 'core', 'engine'],
    mobility: [
      'Passive bar hang: 30 s',
      'Supine thoracic rotation: 8 reps por lado',
      'Cat camel: 10 reps',
      'Band dislocates: 15 reps',
      '90/90 hip mobility: 8 reps por lado',
      'Scapular slides on bar: 10 reps',
      'Wall chest opener: 30 s por lado',
      'Active hamstring stretch: 10 reps por lado',
    ],
    activation: [
      'Scapular pull up: 10 reps',
      'Hollow hold: 30 s',
      'Arch hold: 20 s',
      'Band row: 15 reps',
      'Hanging knee raise: 10 reps',
      'Band face pull: 15 reps',
      'Slow dead bug: 10 reps por lado',
      'Active hang: 30 s',
    ],
    skills: {
      basicos: [
        { title: 'Base de front lever', items: [hold('Bar tuck hang'), hold('Hollow hold')] },
        { title: 'Compresión y tensión', items: [hold('Seated straight-leg compression'), hold('Bar tuck hang')] },
        { title: 'Control escapular colgado', items: [reps('Slow scapular pull up'), hold('Arch hold')] },
      ],
      acumulacion: [
        { title: 'Tuck front lever', items: [hold('Tuck front lever'), reps('Tuck front lever negative')] },
        { title: 'Raises en tuck', items: [reps('Tuck front lever raise'), hold('Tuck front lever')] },
        { title: 'Compresión avanzada', items: [hold('Parallette L-sit'), hold('Tuck front lever')] },
      ],
      intensificacion: [
        { title: 'Advanced tuck front lever', items: [hold('Advanced tuck front lever'), reps('Advanced tuck front lever raise')] },
        { title: 'Negativas de front lever', items: [reps('5 s front lever negative'), hold('Advanced tuck front lever')] },
        { title: 'Front lever a una pierna', items: [hold('One-leg front lever'), reps('Tuck front lever raise')] },
      ],
      skills: [
        { title: 'Straddle front lever', items: [hold('Straddle front lever'), reps('5 s front lever negative')] },
        { title: 'Front lever completo', items: [attempts('Front lever'), hold('One-leg front lever')] },
        { title: 'Fuerza dinámica', items: [reps('Tuck front lever pull up'), hold('Straddle front lever')] },
      ],
      realizacion: [
        { title: 'Test de front lever', items: [hold('Max front lever hold'), hold('Straddle front lever')] },
        { title: 'Front lever pull up', items: [reps('Straddle front lever pull up'), attempts('Front lever')] },
        { title: 'Test de L-sit', items: [hold('Max L-sit'), hold('Max front lever hold')] },
      ],
    },
    strength: {
      basicos: [
        ['Australian pull up', 'One-arm band row'],
        ['Ring row', 'Supine-grip Australian pull up'],
        ['Feet-elevated Australian pull up', 'Bent-knee inverted row'],
      ],
      acumulacion: [
        ['Feet-elevated ring row', 'Tempo 3-1-1 Australian pull up'],
        ['Sternum ring row', 'Feet-elevated Australian pull up'],
        ['Archer ring row', 'Feet-elevated ring row'],
      ],
      intensificacion: [
        ['Weighted ring row', 'Weighted Australian pull up'],
        ['Assisted one-arm ring row', 'Sternum ring row'],
        ['2 s paused ring row', 'Weighted ring row'],
      ],
      skills: [
        ['Tuck front lever row', 'Weighted ring row'],
        ['One-arm ring row', 'Tuck front lever row'],
        ['Weighted ring row', 'Tuck ice cream maker'],
      ],
      realizacion: [
        ['Straddle front lever row', 'Max weighted ring row'],
        ['One-arm ring row', 'Tuck front lever row'],
        ['Ice cream maker', 'Straddle front lever row'],
      ],
    },
    accessory: [
      [hold('Parallette L-sit'), reps('Ring biceps curl')],
      [reps('Hanging knee raise'), hold('Arch hold')],
      [reps('Strict toes to bar'), reps('Band face pull')],
      [reps('Ab wheel rollout'), reps('Band external rotation')],
    ],
    cooldown: [
      'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.',
      'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.',
      'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.',
    ],
  },
];

/**
 * Metcons de calistenia: solo peso corporal, barra, anillas o paralelas. `minutes` es el reloj de
 * referencia en semana de carga y `fromPhase` la primera fase en la que aparece.
 */
const METCONS = [
  {
    name: 'Park engine',
    type: 'amrap',
    minutes: 14,
    tags: ['fullbody', 'engine'],
    note: 'Ritmo constante: elige la progresión que te deje seguir sin parar.',
    items: ['Australian pull up: 8 reps', 'Push up: 10 reps', 'Air squat: 15 reps'],
  },
  {
    name: 'Death by burpee',
    type: 'emom',
    minutes: 12,
    tags: ['fullbody', 'engine'],
    note: 'Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.',
    items: ['Burpee: 1 rep acumulativa por minuto'],
  },
  {
    name: 'Grin and bear',
    type: 'rft',
    rounds: 5,
    minutes: 18,
    tags: ['pull', 'core'],
    note: 'Fragmenta las dominadas antes de llegar al fallo. Usa banda si hace falta y cambia el toes to bar por elevación de rodillas.',
    items: ['Pull up: 5 reps', 'Toes to bar: 8 reps', 'Reverse lunge: 10 reps por lado'],
  },
  {
    name: 'Hollow to bar',
    type: 'amrap',
    minutes: 12,
    tags: ['core', 'pull'],
    note: 'Mantén la pelvis retrovertida en todo el trabajo de core.',
    items: ['Hollow rock: 20 reps', 'Australian pull up: 10 reps', 'Plank shoulder tap: 20 reps'],
  },
  {
    name: 'Push ladder',
    type: 'ladder',
    scheme: '21-15-9',
    minutes: 14,
    tags: ['push', 'legs'],
    note: 'Si las flexiones se rompen, sube las manos a un cajón.',
    items: ['Push up: reps del esquema', 'Air squat: reps del esquema'],
  },
  {
    name: 'Pull ladder',
    type: 'ladder',
    scheme: '15-12-9-6-3',
    minutes: 15,
    tags: ['pull', 'core'],
    note: 'Baja de progresión antes que romper la técnica.',
    items: ['Australian pull up: reps del esquema', 'Hollow rock: reps del esquema'],
  },
  {
    name: 'Park chipper',
    type: 'for_time',
    minutes: 20,
    tags: ['fullbody'],
    note: 'Trabajo continuo de arriba abajo, sin repetir estación.',
    items: [
      'Australian pull up: 40 reps',
      'Push up: 60 reps',
      'Air squat: 80 reps',
      'Hollow rock: 40 reps',
    ],
  },
  {
    name: 'Core tabata',
    type: 'tabata',
    rounds: 8,
    minutes: 8,
    tags: ['core'],
    note: 'Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa, cambiando de lado en la plancha.',
    items: ['Hollow hold: 20 s', 'Side plank: 20 s'],
  },
  {
    name: 'Push tabata',
    type: 'tabata',
    rounds: 8,
    minutes: 8,
    tags: ['push'],
    note: 'Mismo número de repeticiones en las ocho rondas: elige un ritmo sostenible.',
    items: ['Push up: 20 s', 'Bench dips: 20 s'],
  },
  {
    name: 'Park stations',
    type: 'stations',
    minutes: 16,
    stations: 4,
    tags: ['fullbody', 'engine'],
    note: 'Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.',
    items: ['Australian pull up: 1 min', 'Push up: 1 min', 'Air squat: 1 min', 'Front plank: 1 min'],
  },
  {
    name: 'Pull EMOM',
    type: 'emom',
    minutes: 16,
    tags: ['pull', 'core'],
    note: 'Un movimiento por minuto, rotando siempre en el mismo orden. Usa banda en las dominadas si hace falta.',
    items: [
      'Pull up: 4 reps',
      'Australian pull up: 8 reps',
      'Hanging knee raise: 10 reps',
      'Active hang: 30 s',
    ],
  },
  {
    name: 'Push EMOM',
    type: 'emom',
    minutes: 16,
    tags: ['push', 'core'],
    note: 'Un movimiento por minuto, rotando siempre en el mismo orden.',
    items: ['Pike push up: 6 reps', 'Push up: 12 reps', 'Bench dips: 10 reps', 'Hollow hold: 30 s'],
  },
  {
    name: 'Bar unbroken',
    type: 'unbroken',
    minutes: 10,
    fromPhase: 'acumulacion',
    tags: ['pull'],
    note: 'Cada serie tiene que salir sin soltar la barra: si la rompes, bajas de progresión.',
    items: ['Strict pull up: 5 series sin soltar', 'Australian pull up: 5 series de 10 reps sin soltar'],
  },
  {
    name: 'Floor unbroken',
    type: 'unbroken',
    minutes: 10,
    tags: ['push', 'core'],
    note: 'Series sin pausa: para en cuanto pierdas la línea del cuerpo.',
    items: ['Push up: 5 series de 12 reps sin parar', 'Hollow hold: 5 series de 30 s'],
  },
  {
    name: 'Bodyweight legs',
    type: 'amrap',
    minutes: 12,
    tags: ['legs', 'engine'],
    note: 'Aterriza suave en los saltos y mantén el pecho alto en las zancadas.',
    items: ['Air squat: 20 reps', 'Jump lunge: 10 reps por lado', 'Box jump: 10 reps'],
  },
  {
    name: 'Pistol partner',
    type: 'rft',
    rounds: 4,
    minutes: 16,
    tags: ['legs', 'core'],
    note: 'Alterna piernas en cada repetición y usa anillas si necesitas asistencia.',
    items: ['Assisted pistol squat: 6 reps por lado', 'Hollow rock: 20 reps', 'Jump squat: 15 reps'],
  },
  {
    name: 'Bodyweight complex',
    type: 'rft',
    rounds: 6,
    minutes: 16,
    tags: ['fullbody'],
    note: 'La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.',
    items: ['Pull up: 1 rep', 'Push up: 2 reps', 'Air squat: 3 reps'],
  },
  {
    name: 'Burpee pull up',
    type: 'amrap',
    minutes: 10,
    tags: ['pull', 'engine'],
    note: 'Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.',
    items: ['Burpee pull up: 5 reps', 'Air squat: 10 reps'],
  },
  {
    name: 'Handstand engine',
    type: 'emom',
    minutes: 12,
    fromPhase: 'acumulacion',
    tags: ['push', 'core'],
    note: 'Sube al invertido con control; si no llegas, sostén pike contra la pared.',
    items: ['Wall handstand hold: 30 s', 'Push up: 12 reps', 'Hollow hold: 30 s'],
  },
  {
    name: 'Buy in and buy out',
    type: 'for_time',
    minutes: 18,
    tags: ['fullbody', 'engine'],
    note: 'Entras y sales con la misma tarea: administra el ritmo del bloque central. Sin sitio para correr, cambia los 400 m por 60 mountain climber.',
    items: [
      'Buy in run: 400 m',
      'Australian pull up: 30 reps',
      'Push up: 40 reps',
      'Buy out run: 400 m',
    ],
  },
  {
    name: 'Pull up ladder',
    type: 'ladder',
    scheme: '1-2-3-4-5-6-7',
    minutes: 14,
    fromPhase: 'acumulacion',
    tags: ['pull'],
    note: 'Sube de una en una y baja de progresión cuando pierdas el rango completo.',
    items: ['Pull up: reps del esquema', 'Push up: el doble de reps del esquema'],
  },
  {
    name: 'Core cluster',
    type: 'rft',
    rounds: 5,
    minutes: 14,
    tags: ['core'],
    note: 'Sin balanceos: si no controlas el movimiento, reduce el rango o pasa a elevación de rodillas.',
    items: ['Toes to bar: 8 reps', 'Hollow rock: 15 reps', 'Side plank: 30 s por lado'],
  },
  {
    name: 'Ring engine',
    type: 'amrap',
    minutes: 15,
    tags: ['pull', 'push'],
    note: 'Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.',
    items: ['Ring row: 10 reps', 'Assisted ring dips: 8 reps', 'Ring support hold: 20 s'],
  },
  {
    name: 'Reverse ladder',
    type: 'ladder',
    scheme: '10-9-8-7-6-5-4-3-2-1',
    minutes: 18,
    fromPhase: 'acumulacion',
    tags: ['fullbody'],
    note: 'Bajas repeticiones en un movimiento mientras subes en el otro.',
    items: ['Pull up: reps descendentes del esquema', 'Bench dips: reps ascendentes del esquema'],
  },
  {
    name: 'Lunge and bar',
    type: 'rft',
    rounds: 4,
    minutes: 16,
    tags: ['legs', 'pull'],
    note: 'Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.',
    items: ['Walking lunge: 20 reps', 'Pull up: 6 reps', 'Hollow hold: 30 s'],
  },
  {
    name: 'Core stations',
    type: 'stations',
    minutes: 12,
    stations: 3,
    tags: ['core'],
    note: 'Un minuto por estación y cuatro vueltas, cambiando sin pausa.',
    items: ['Hollow hold: 1 min', 'Plank shoulder tap: 1 min', 'Hanging knee raise: 1 min'],
  },
  {
    name: 'I go you go',
    type: 'amrap',
    minutes: 16,
    tags: ['fullbody', 'engine'],
    note: 'En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.',
    items: ['Australian pull up: 40 s', 'Push up: 40 s', 'Jump squat: 40 s', 'Hollow hold: 40 s'],
  },
  {
    name: 'Muscle-up practice',
    type: 'emom',
    minutes: 14,
    fromPhase: 'intensificacion',
    tags: ['pull', 'push'],
    note: 'Calidad por encima de cantidad: salta el minuto si la transición se rompe.',
    items: ['Assisted muscle-up transition: 3 reps', 'Explosive pull up: 4 reps', 'Parallel bar dips: 8 reps'],
  },
  {
    name: 'Floor sprint',
    type: 'for_time',
    minutes: 10,
    tags: ['push', 'core'],
    note: 'Es corto: entra fuerte y aguanta el ritmo hasta el final.',
    items: ['Push up: 50 reps', 'Hollow rock: 50 reps', 'Plank shoulder tap: 50 reps'],
  },
  {
    name: 'Leg engine',
    type: 'stations',
    minutes: 15,
    stations: 3,
    tags: ['legs', 'engine'],
    note: 'Un minuto por estación y cinco vueltas, sin descanso entre estaciones.',
    items: ['Air squat: 1 min', 'Box step up: 1 min', 'Single-leg glute bridge: 1 min'],
  },
  {
    name: 'Front lever engine',
    type: 'emom',
    minutes: 14,
    fromPhase: 'intensificacion',
    tags: ['pull', 'core'],
    note: 'Elige la progresión de lever que puedas sostener 10 s limpios.',
    items: ['Tuck front lever: 15 s', 'Australian pull up: 10 reps', 'Hollow rock: 20 reps'],
  },
  {
    name: 'Dips and squats',
    type: 'ladder',
    scheme: '21-15-9',
    minutes: 13,
    tags: ['push', 'legs'],
    note: 'Fondos en paralelas o en banco según tu nivel.',
    items: ['Parallel bar dips: reps del esquema', 'Jump squat: reps del esquema'],
  },
  {
    name: 'Bar hang challenge',
    type: 'unbroken',
    minutes: 10,
    fromPhase: 'acumulacion',
    tags: ['pull', 'core'],
    note: 'Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.',
    items: ['Active hang: 5 series de 45 s', 'Hanging knee raise: 5 series de 10 reps'],
  },
  {
    name: 'Park sunrise',
    type: 'amrap',
    minutes: 18,
    tags: ['fullbody', 'engine'],
    note: 'Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas. Vale carrera o comba.',
    items: ['Run: 200 m', 'Australian pull up: 10 reps', 'Push up: 15 reps', 'Air squat: 20 reps'],
  },
  {
    name: 'Pike and pistol',
    type: 'rft',
    rounds: 5,
    minutes: 17,
    tags: ['push', 'legs'],
    note: 'Alterna piernas en el pistol y controla la bajada del pike.',
    items: ['Pike push up: 8 reps', 'Assisted pistol squat: 5 reps por lado', 'Hollow hold: 30 s'],
  },
  {
    name: 'Core ladder',
    type: 'ladder',
    scheme: '5-10-15-20',
    minutes: 12,
    tags: ['core'],
    note: 'Sube el número de repeticiones en cada bloque sin perder la posición lumbar.',
    items: ['Hollow rock: reps del esquema', 'V-up: reps del esquema', 'Side plank: 15 s por lado entre bloques'],
  },
  {
    name: 'Rings and floor',
    type: 'rft',
    rounds: 4,
    minutes: 15,
    tags: ['push', 'pull'],
    note: 'Alterna anillas y suelo para repartir la fatiga del hombro.',
    items: ['Ring row: 12 reps', 'Push up: 15 reps', 'Ring support hold: 30 s'],
  },
  {
    name: 'Endurance test',
    type: 'for_time',
    minutes: 16,
    fromPhase: 'intensificacion',
    tags: ['fullbody', 'engine'],
    note: 'Anota el tiempo: este metcon se repite al final de cada fase para comparar.',
    items: ['Pull up: 25 reps', 'Push up: 50 reps', 'Air squat: 75 reps', 'Hollow rock: 100 reps'],
  },
  {
    name: 'Jump and bar',
    type: 'emom',
    minutes: 12,
    tags: ['legs', 'pull'],
    note: 'Un movimiento por minuto: mantén la calidad del salto en las últimas rondas.',
    items: ['Box jump: 10 reps', 'Pull up: 5 reps', 'Jump squat: 15 reps'],
  },
  {
    name: 'Active recovery',
    type: 'amrap',
    minutes: 10,
    tags: ['core', 'engine'],
    note: 'Ritmo suave, respirando por la nariz de principio a fin.',
    items: ['Active hang: 30 s', 'Push up: 8 reps', 'Air squat: 12 reps', 'Slow dead bug: 10 reps por lado'],
  },
  {
    name: 'Leg tabata',
    type: 'tabata',
    rounds: 8,
    minutes: 8,
    tags: ['legs'],
    note: 'Alterna movimiento en cada ronda: 20 s de trabajo y 10 s de pausa.',
    items: ['Jump squat: 20 s', 'Jump lunge: 20 s'],
  },
  {
    name: 'Pull stations',
    type: 'stations',
    minutes: 16,
    stations: 4,
    tags: ['pull', 'core'],
    note: 'Un minuto por estación y cuatro vueltas, cambiando sin pausa.',
    items: ['Pull up: 1 min', 'Australian pull up: 1 min', 'Hanging knee raise: 1 min', 'Active hang: 1 min'],
  },
  {
    name: 'Push unbroken',
    type: 'unbroken',
    minutes: 12,
    fromPhase: 'intensificacion',
    tags: ['push'],
    note: 'Cada serie sin pausa: si rompes, subes las manos a un cajón y sigues.',
    items: ['Pike push up: 4 series de 8 reps sin parar', 'Parallel bar dips: 4 series de 8 reps sin parar'],
  },
  {
    name: 'Mesocycle finisher',
    type: 'for_time',
    minutes: 14,
    tags: ['fullbody'],
    note: 'Última sesión del bloque: registra el tiempo para comparar con el siguiente mesociclo.',
    items: [
      'Australian pull up: 30 reps',
      'Push up: 45 reps',
      'Reverse lunge: 30 reps por lado',
      'Hollow rock: 60 reps',
    ],
  },
];

const METCON_LABELS = {
  amrap: 'AMRAP',
  emom: 'EMOM',
  for_time: 'For Time',
  rft: 'Rounds For Time',
  tabata: 'Tabata',
  ladder: 'Ladder',
  stations: 'Estaciones de tiempo',
  unbroken: 'Unbroken',
};

/** La descarga recorta el reloj y la semana pico lo estira un poco. */
const METCON_TIME_FACTOR = { intro: 0.9, carga: 1, pico: 1.1, descarga: 0.6 };
const METCON_ROUND_FACTOR = { intro: 1, carga: 1, pico: 1, descarga: 0.6 };

function scaleMinutes(minutes, role) {
  return Math.max(6, Math.round(minutes * METCON_TIME_FACTOR[role]));
}

function scaleRounds(rounds, role) {
  return Math.max(3, Math.round(rounds * METCON_ROUND_FACTOR[role]));
}

function buildMetconHeader(metcon, role) {
  const label = METCON_LABELS[metcon.type];
  const minutes = scaleMinutes(metcon.minutes, role);

  if (metcon.type === 'rft') {
    return `${label} · ${metcon.name} · ${scaleRounds(metcon.rounds, role)} rondas · Cap ${minutes} min`;
  }
  if (metcon.type === 'tabata') {
    return `${label} · ${metcon.name} · ${scaleRounds(metcon.rounds, role)} rondas`;
  }
  if (metcon.type === 'for_time') {
    return `${label} · ${metcon.name} · Cap ${minutes} min`;
  }
  if (metcon.type === 'ladder') {
    return `${label} · ${metcon.name} · ${metcon.scheme} · Cap ${minutes} min`;
  }
  if (metcon.type === 'stations') {
    return `${label} · ${metcon.name} · ${minutes} min · ${metcon.stations} estaciones`;
  }
  return `${label} · ${metcon.name} · ${minutes} min`;
}

function metconPool(dayType, phaseKey) {
  const phaseIndex = PHASE_INDEX.get(phaseKey) ?? 0;

  return METCONS.filter((metcon) => {
    if (!metcon.tags.some((tag) => dayType.metconTags.includes(tag))) return false;
    const minIndex = metcon.fromPhase ? PHASE_INDEX.get(metcon.fromPhase) ?? 0 : 0;
    return phaseIndex >= minIndex;
  });
}

function blockText(header, note, items) {
  return [header, ...(note ? [note] : []), ...items.map((item) => `• ${item}`)].join('\n');
}

export function phaseForMesocycle(mesocycle) {
  return PHASE_BY_MESOCYCLE.get(mesocycle) ?? PHASES[PHASES.length - 1];
}

/**
 * Un año natural no cabe en 52 semanas exactas: según en qué día caiga el 1 de enero sobran una o
 * dos semanas al final. Esas semanas de más cierran el último mesociclo como descarga extra, para
 * no partir un bloque de carga a mitad de diciembre.
 */
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

function activationSession(dayType, context) {
  const { role, variantIndex } = context;

  // La descarga se queda en un único bloque de movilidad; el resto del año lleva dos.
  const singleBlock = role === 'descarga';
  const blocks = [
    blockText(
      `Movilidad · ${dayType.name} · ${singleBlock ? 10 : 6} min`,
      null,
      pickMany(dayType.mobility, variantIndex, singleBlock ? 4 : 3),
    ),
  ];

  if (!singleBlock) {
    blocks.push(
      blockText(
        'Activación · Preparación específica · 8 min',
        null,
        pickMany(dayType.activation, variantIndex, 3),
      ),
    );
  }

  return {
    kind: 'activation',
    dayOrder: 0,
    name: 'Activación',
    estimatedDuration: singleBlock ? '10 min' : '14 min',
    warmup: '',
    main: blocks.join('\n\n'),
    core: '',
    cooldown: '',
  };
}

function strengthSession(dayType, context) {
  const { phase, role, variantIndex } = context;
  const skill = pick(dayType.skills[phase.key], variantIndex);
  const strength = pick(dayType.strength[phase.key], variantIndex);
  const accessory = pick(dayType.accessory, variantIndex);

  const skillItems = skill.items.map(
    (item) => `${item.name}: ${schemeFor(item.mode, phase.key, role)}`,
  );

  const strengthItems = [
    `${strength[0]}: ${STRENGTH_SCHEME[phase.key][role]}`,
    `${strength[1]}: ${SECONDARY_SCHEME[phase.key][role]}`,
  ];

  const accessoryItems = accessory.map(
    (item) => `${item.name}: ${schemeFor(item.mode, phase.key, role, { accessory: true })}`,
  );

  return {
    kind: 'session',
    dayOrder: 1,
    name: dayType.sessionName,
    estimatedDuration: role === 'descarga' ? '40 min' : '55 min',
    warmup: '',
    main: [
      blockText(
        `Entrenamiento de Técnica · ${skill.title} · ${SKILL_BLOCK_MINUTES[phase.key]} min`,
        'Trabaja en fresco y corta la serie en cuanto pierdas la posición.',
        skillItems,
      ),
      blockText(
        `Fuerza · ${dayType.name} · ${STRENGTH_BLOCK_MINUTES[phase.key]} min`,
        WEEK_ROLE_NOTES[role],
        strengthItems,
      ),
    ].join('\n\n'),
    core: blockText('Fuerza · Accesorio y core · 10 min', null, accessoryItems),
    cooldown: pick(dayType.cooldown, variantIndex),
  };
}

function metconSession(dayType, context) {
  const { phase, role, metconIndex, usedThisWeek } = context;
  const pool = metconPool(dayType, phase.key);

  // Los cinco días comparten pools parecidos, así que se avanza hasta no repetir metcon en la semana.
  let metcon = pick(pool, metconIndex);
  for (let attempt = 1; attempt < pool.length && usedThisWeek?.has(metcon.name); attempt += 1) {
    metcon = pick(pool, metconIndex + attempt);
  }
  usedThisWeek?.add(metcon.name);

  return {
    kind: 'metcon',
    dayOrder: 2,
    name: 'Metcon',
    estimatedDuration: `${scaleMinutes(metcon.minutes, role) + 5} min`,
    warmup: '',
    main: blockText(buildMetconHeader(metcon, role), metcon.note, metcon.items),
    core: '',
    cooldown:
      role === 'descarga'
        ? 'Camina 5 min y termina con 2 min de respiración nasal 4-6.'
        : 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.',
    metconName: metcon.name,
  };
}

/** Marca el día como descanso siguiendo el convenio del calendario de la app. */
function restSession() {
  return {
    kind: 'rest',
    dayOrder: 0,
    name: REST_DAY_SESSION_NAME,
    estimatedDuration: 'Descanso',
    warmup: '',
    main: '',
    core: '',
    cooldown: '',
  };
}

/**
 * Construye el año natural completo: del 1 de enero al 31 de diciembre. Las semanas se cuentan de
 * lunes a domingo desde el lunes de la semana en la que cae el 1 de enero, así que la primera y la
 * última pueden quedar incompletas. Se entrena lunes, martes, jueves, viernes y sábado con tres
 * sesiones por día; miércoles y domingo quedan marcados como día de descanso.
 */
export function buildCalisteniaYear({ year = DEFAULT_YEAR, restDays = true } = {}) {
  const days = [];
  const firstMonday = Date.parse(`${mondayOf(new Date(Date.UTC(year, 0, 1)))}T00:00:00Z`);
  const yearStart = Date.UTC(year, 0, 1);
  const yearEnd = Date.UTC(year, 11, 31);
  const weekMetcons = new Map();

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
      dayOffset,
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
      days.push({
        ...base,
        isRest: true,
        dayTypeKey: 'rest',
        dayTypeName: 'Descanso',
        sessions: [restSession()],
      });
      continue;
    }

    if (!weekMetcons.has(week)) weekMetcons.set(week, new Set());

    const dayType = DAY_TYPES[trainingSlot];
    const context = {
      week,
      role,
      phase,
      variantIndex: week - 1,
      metconIndex: (week - 1) * 2 + trainingSlot * 9,
      usedThisWeek: weekMetcons.get(week),
    };

    days.push({
      ...base,
      isRest: false,
      dayTypeKey: dayType.key,
      dayTypeName: dayType.name,
      sessions: [
        activationSession(dayType, context),
        strengthSession(dayType, context),
        metconSession(dayType, context),
      ],
    });
  }

  return days;
}

/**
 * Identificador estable por fecha y hueco del día, en un rango propio para no chocar con los
 * entrenos importados de AimHarder (que viven cerca de -500000).
 */
const RATE_ID_BASE = 7_000_000;
const RATE_ID_SLOT_STEP = 100_000;

export function generatedRateId(workoutDate, dayOrder) {
  const [, month, day] = workoutDate.split('-');
  return -(RATE_ID_BASE + dayOrder * RATE_ID_SLOT_STEP + Number(`${month}${day}`));
}

export const GENERATED_RATE_ID_RANGE = {
  from: -(RATE_ID_BASE + 4 * RATE_ID_SLOT_STEP),
  to: -RATE_ID_BASE,
};

/** Lunes de la semana que contiene la fecha de referencia. */
export function mondayOf(reference = new Date()) {
  const date = new Date(
    Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate()),
  );
  const weekday = (date.getUTCDay() + 6) % 7;
  return new Date(date.getTime() - weekday * MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * Convierte los días en filas de `entrenos_diarios`. Las fechas son reales y la recurrencia es
 * "una sola vez": con recurrencia anual el calendario solo compara mes y día, así que el día de
 * la semana se desplazaría cada año y el descanso dejaría de caer en miércoles y domingo.
 */
export function toWorkoutRows(days) {
  const rows = [];

  for (const day of days) {
    const workoutDate = day.date;

    for (const session of day.sessions) {
      rows.push({
        workoutDate,
        aimharderRateId: generatedRateId(workoutDate, session.dayOrder),
        name: session.name,
        dayLabel: `Semana ${day.week} · Mesociclo ${day.mesocycle} · ${day.phaseName} · ${WEEK_ROLE_LABELS[day.role]}`,
        estimatedDuration: session.estimatedDuration,
        warmup: session.warmup,
        mainPart: session.main,
        corePart: session.core,
        cooldown: session.cooldown,
        scheduleConfig: {
          weekdays: [day.weekdayIndex],
          recurrence: 'once',
          startDate: workoutDate,
          dayOrder: session.dayOrder,
          kind: session.kind,
        },
        meta: {
          week: day.week,
          mesocycle: day.mesocycle,
          phase: day.phaseName,
          role: day.role,
          dayType: day.dayTypeName,
          weekday: day.weekdayLabel,
          metcon: session.metconName,
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

export { DAY_TYPES, METCONS };
