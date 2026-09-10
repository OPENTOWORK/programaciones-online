/**
 * Generador de semanas de Crosstraining en estilo BEAST MODE (modelo TrueCoach adaptado a grupo).
 *
 * Cada sesión combina bloques A–G: activación, haltero-hipertro con pirámide de %, biseries,
 * técnica/skills y WOD en dos piezas. Sin notas de atleta individual; solo Rx y escalas de grupo.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Lunes de la primera semana del bloque. */
export const PROGRAM_START_MONDAY = '2026-09-07';

export const MESOCYCLES = [
  {
    id: 1,
    name: 'Acumulación',
    goal: 'Construir volumen y afinar el patrón técnico con cargas moderadas',
    weeks: [
      { percent: 65, sets: 5, reps: 5, role: 'carga' },
      { percent: 70, sets: 5, reps: 5, role: 'carga' },
      { percent: 75, sets: 5, reps: 4, role: 'pico' },
      { percent: 60, sets: 3, reps: 5, role: 'descarga' },
    ],
  },
  {
    id: 2,
    name: 'Intensificación',
    goal: 'Subir intensidad recortando repeticiones sin perder velocidad de barra',
    weeks: [
      { percent: 75, sets: 5, reps: 4, role: 'carga' },
      { percent: 80, sets: 5, reps: 3, role: 'carga' },
      { percent: 85, sets: 5, reps: 3, role: 'pico' },
      { percent: 65, sets: 3, reps: 5, role: 'descarga' },
    ],
  },
  {
    id: 3,
    name: 'Fuerza máxima',
    goal: 'Cargas altas, series cortas y máxima calidad técnica',
    weeks: [
      { percent: 80, sets: 6, reps: 3, role: 'carga' },
      { percent: 85, sets: 6, reps: 2, role: 'carga' },
      { percent: 90, sets: 5, reps: 2, role: 'pico' },
      { percent: 70, sets: 3, reps: 3, role: 'descarga' },
    ],
  },
];

export const WEEKS_PER_MESOCYCLE = 4;
export const TOTAL_WEEKS = MESOCYCLES.length * WEEKS_PER_MESOCYCLE;

export const ROLE_LABELS = {
  carga: 'Carga',
  pico: 'Semana pico',
  descarga: 'Descarga',
};

const WEEKDAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Descanso jueves y domingo (domingo vacío). */
const REST_WEEKDAYS = new Set([3, 6]);

const TRAINING_WEEKDAYS = [
  { weekdayIndex: 0, key: 'monday' },
  { weekdayIndex: 1, key: 'tuesday' },
  { weekdayIndex: 2, key: 'wednesday' },
  { weekdayIndex: 4, key: 'friday' },
  { weekdayIndex: 5, key: 'saturday' },
];

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T12:00:00Z`);
  return new Date(date.getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);
}

export function isMonday(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay() === 1;
}

export function weekNumberForMonday(monday, startMonday = PROGRAM_START_MONDAY) {
  const diff = new Date(`${monday}T12:00:00Z`) - new Date(`${startMonday}T12:00:00Z`);
  return Math.round(diff / (7 * MS_PER_DAY)) + 1;
}

export function mondayForWeekNumber(week, startMonday = PROGRAM_START_MONDAY) {
  return addDays(startMonday, (week - 1) * 7);
}

export function describeWeek(week) {
  const index = week - 1;
  const mesocycle = MESOCYCLES[Math.floor(index / WEEKS_PER_MESOCYCLE)];
  if (!mesocycle) {
    throw new Error(
      `La semana ${week} queda fuera del bloque: hay ${TOTAL_WEEKS} semanas definidas en MESOCYCLES.`,
    );
  }

  const weekInMesocycle = (index % WEEKS_PER_MESOCYCLE) + 1;
  const dose = mesocycle.weeks[weekInMesocycle - 1];

  return { week, mesocycle, weekInMesocycle, ...dose };
}

/** Pirámide de % dentro del día: empieza por debajo del % de la semana y termina en el techo. */
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

/**
 * Etiquetas de bloque que reconoce el parser de la app (lib/workoutContentParser.ts).
 * Al usarlas, cada ejercicio se guarda como movimiento y admite vídeo de técnica.
 */
const BLOCK = {
  activation: 'Activación',
  strength: 'Fuerza',
  technique: 'Técnica/skills',
  mobility: 'Movilidad',
  emom: 'EMOM',
  amrap: 'AMRAP',
  forTime: 'For Time',
  roundsForTime: 'Rounds For Time',
};

/** El punto medio separa las partes de la cabecera, así que no puede aparecer dentro de ellas. */
function headerPart(value) {
  return String(value).replace(/\s*·\s*/g, ' - ').replace(/\s+/g, ' ').trim();
}

/**
 * Serializa un bloque como `Etiqueta · título · tiempo · rondas`, una línea de instrucciones
 * y las viñetas de ejercicios. Las instrucciones van en una sola línea: el parser trata como
 * ejercicio cualquier otra línea del cuerpo.
 */
function block(label, { title, timing, rounds, note, items = [] } = {}) {
  const header = [label, title, timing, rounds].filter(Boolean).map(headerPart).join(' · ');
  const lines = [header];
  if (note) lines.push(headerPart(note));
  for (const item of items) lines.push(`• ${item}`);
  return lines.join('\n');
}

/** Ejercicio de un bloque con series: Fuerza, Técnica/skills y Entrenamiento libre. */
function setsItem(name, sets, reps, load) {
  return `${name}: ${sets} × ${reps}${load ? ` · ${load}` : ''}`;
}

/** Ejercicio de un bloque por cantidad: AMRAP, EMOM, For Time, Activación y Movilidad. */
function qtyItem(name, quantity, load) {
  return `${name}: ${quantity}${load ? ` · ${load}` : ''}`;
}

function pct(percent) {
  return `${percent}% RM`;
}

function pyramidItems(name, steps) {
  return steps.map((step) => setsItem(name, step.sets, step.reps, pct(step.percent)));
}

const ACTIVATION_TEMPLATES = {
  squat: {
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
  press: {
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
  hinge: {
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
  olympic: {
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
  general: {
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
};

function activationBlock(kind) {
  const template = ACTIVATION_TEMPLATES[kind] ?? ACTIVATION_TEMPLATES.general;
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

function buildMondaySession(plan) {
  const squatPyramid = pyramidPercents(plan.percent);
  const cleanPyramid = [
    { sets: 1, reps: 5, percent: techPercent(plan.percent, 15) },
    { sets: 1, reps: 5, percent: techPercent(plan.percent, 10) },
    { sets: 1, reps: 4, percent: techPercent(plan.percent, 6) },
    { sets: 1, reps: 3, percent: techPercent(plan.percent, 2) },
  ];

  return {
    name: 'BEAST MODE · Back Squat + Engine',
    duration: '85 min',
    blocks: [
      activationBlock('squat'),
      block(BLOCK.strength, {
        title: 'B) HALTERO-HIPERTRO BACK SQUAT TEMPO',
        timing: '20 min',
        note: 'Bajada 3 s, pausa 2 s abajo y subida explosiva. Entra cada 2 min y descansa 90 s entre series.',
        items: pyramidItems('Back Squat', squatPyramid),
      }),
      block(BLOCK.strength, {
        title: 'C) BISERIE WORK',
        rounds: '4 rondas',
        note: 'Biserie seguida sin descanso y 90 s al cerrar la ronda. Escala los strict pull-ups con banda o ring row.',
        items: [
          setsItem('Pendlay Row', 4, 8, pct(55)),
          setsItem('Strict Pull-up', 4, 6),
        ],
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
        items: [
          qtyItem('GHD Sit-up', '10 reps'),
          qtyItem('Plank', '30 s'),
          qtyItem('ISO Squat', '40 s'),
          'Descanso',
        ],
      }),
      block(BLOCK.amrap, {
        title: 'F) WODCITO PIEZA 1',
        timing: '14 min',
        note: 'Rx kettlebell 24/16 kg y cajón 60/50 cm. Ritmo constante, sin romper las series largas.',
        items: [
          qtyItem('ANY CARDIO MACH-CAL', '12/10 cal'),
          qtyItem('RUSSIAN KTB SWING', '15 reps', '24 kg'),
          qtyItem('BOX JUMP OVER', '12 reps'),
        ],
      }),
      block(BLOCK.forTime, {
        title: 'G) WODCITO PIEZA 2',
        timing: '16 min',
        note: 'Descansa 5 min antes de empezar. Time cap 16 min y wall ball a 6/4 kg si necesitas partir series.',
        items: [
          qtyItem('Run', '400 m'),
          qtyItem('Wall Ball', '40 reps', '9 kg'),
          qtyItem('RUSSIAN KTB SWING', '40 reps', '24 kg'),
          qtyItem('Run', '300 m'),
        ],
      }),
      cooldownBlock('H) VUELTA A LA CALMA', 'Bike muy suave y estiramientos sin forzar.', [
        qtyItem('Bike', '3 min'),
        qtyItem('Estiramiento de cuádriceps', '60 s'),
        qtyItem('Estiramiento de dorsal', '60 s'),
      ]),
    ],
  };
}

function buildTuesdaySession(plan) {
  const pressPyramid = pyramidPercents(plan.percent);
  const jerkPercent = techPercent(plan.percent, 8);

  return {
    name: 'BEAST MODE · Strict Press + Gimnásticos',
    duration: '85 min',
    blocks: [
      activationBlock('press'),
      block(BLOCK.strength, {
        title: 'B) HALTERO-HIPERTRO STRICT PRESS',
        timing: '20 min',
        note: 'Bajada controlada 3 s y subida explosiva. Entra cada 2 min y descansa 90 s entre series.',
        items: pyramidItems('Strict Press', pressPyramid),
      }),
      block(BLOCK.strength, {
        title: 'C) BISERIE WORK',
        rounds: '4 rondas',
        note: 'Biserie seguida sin descanso y 90 s al cerrar la ronda. Las elevaciones laterales son 8 por lado.',
        items: [
          setsItem('Bench Row Barbell', 4, 8, '40 kg'),
          setsItem('Lateral Raise DB', 4, 8, '9 kg'),
        ],
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
        items: [
          qtyItem('Toes to Bar', '10 reps'),
          qtyItem('DEVILPRESS', '6 reps', '15 kg'),
          qtyItem('ANY CARDIO MACH-CAL', '12/10 cal'),
          'Descanso',
        ],
      }),
      block(BLOCK.roundsForTime, {
        title: 'F) WODCITO PIEZA 1',
        timing: '18 min',
        rounds: '4 rondas',
        note: 'Time cap 18 min. Rx thruster 43/30 kg.',
        items: [
          qtyItem('ANY CARDIO MACH-CAL', '12/10 cal'),
          qtyItem('THRUSTER BARBELL', '10 reps', '43 kg'),
          qtyItem('Strict Pull-up', '8 reps'),
        ],
      }),
      block(BLOCK.emom, {
        title: 'G) WODCITO PIEZA 2',
        timing: '12 min',
        note: 'Descansa 5 min antes de empezar. Objetivo: cerrar cada minuto con 15 s libres.',
        items: [
          qtyItem('Bike', '10/8 cal'),
          qtyItem('KB Deadlift', '12 reps', '24 kg'),
          qtyItem('Burpee Over the Line', '8 reps'),
          'Descanso',
        ],
      }),
      cooldownBlock('H) VUELTA A LA CALMA', 'Movilidad sin forzar el rango.', [
        qtyItem('Movilidad de hombro', '90 s'),
        qtyItem('Movilidad de muñeca', '90 s'),
      ]),
    ],
  };
}

function buildWednesdaySession(plan) {
  const dlPyramid = [
    { sets: 1, reps: 5, percent: plan.percent - 4 },
    { sets: 1, reps: 4, percent: plan.percent - 1 },
    { sets: 1, reps: 3, percent: plan.percent + 2 },
    { sets: 1, reps: 2, percent: plan.percent + 5 },
  ];

  return {
    name: 'BEAST MODE · Deadlift + Chipper',
    duration: '90 min',
    blocks: [
      activationBlock('hinge'),
      block(BLOCK.strength, {
        title: 'B) HALTERO-HIPERTRO DEADLIFT PAUSE',
        timing: '20 min',
        note: 'Pausa bajo rodilla y sobre rodilla, sin touch and go y barra pegada al cuerpo. Descansa 2 min entre series.',
        items: pyramidItems('Deadlift', dlPyramid),
      }),
      block(BLOCK.strength, {
        title: 'C) BISERIE WORK',
        rounds: '4 rondas',
        note: 'Biserie seguida sin descanso y 90 s al cerrar la ronda.',
        items: [
          setsItem('Barbell Hip Thrust', 4, 8, '65 kg'),
          setsItem('Good Morning Barbell', 4, 8, '35 kg'),
        ],
      }),
      block(BLOCK.technique, {
        title: 'D) HALTERO CLEAN COMPLEX',
        timing: '15 min',
        note: `Complex de 2 hang power clean + 1 front squat por serie al ${techPercent(plan.percent)}%. Recepción alta y codos rápidos. Entra cada 2 min.`,
        items: [
          setsItem('Hang Power Clean', 6, 2, pct(techPercent(plan.percent))),
          setsItem('Front Squat', 6, 1, pct(techPercent(plan.percent))),
        ],
      }),
      block(BLOCK.emom, {
        title: 'E) CORE',
        timing: '10 min',
        note: 'Un movimiento por minuto; el cuarto minuto es descanso.',
        items: [
          qtyItem('Hollow Hold', '20 s'),
          qtyItem('Arch Hold', '20 s'),
          qtyItem('Scapular Pull-up', '8 reps'),
          'Descanso',
        ],
      }),
      block(BLOCK.roundsForTime, {
        title: 'F) WODCITO PIEZA 1',
        timing: '20 min',
        rounds: '4 rondas',
        note: 'Time cap 20 min. Rx mancuerna 22.5/15 kg y ritmo de conversación en la carrera.',
        items: [
          qtyItem('Run', '400 m'),
          qtyItem('ALTERNATIVE HANG DB SNATCH', '20 reps', '22.5 kg'),
          qtyItem('PUSH-UP', '20 reps'),
        ],
      }),
      block(BLOCK.forTime, {
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
      }),
      cooldownBlock('H) VUELTA A LA CALMA', 'Descarga lumbar y cardio muy suave.', [
        qtyItem('Foam roll lumbar', '2 min'),
        qtyItem('Row', '3 min'),
      ]),
    ],
  };
}

function buildFridaySession(plan) {
  const fsPercent = Math.max(50, plan.percent - 10);
  const snatchPercent = techPercent(plan.percent, 12);

  return {
    name: 'BEAST MODE · Front Squat + Halterofilia',
    duration: '85 min',
    blocks: [
      activationBlock('olympic'),
      block(BLOCK.strength, {
        title: 'B) HALTERO-HIPERTRO FRONT SQUAT',
        timing: '20 min',
        note: 'Codos altos y tronco vertical. Descansa 90 s entre series.',
        items: [setsItem('Front Squat', 5, plan.reps, pct(fsPercent))],
      }),
      block(BLOCK.strength, {
        title: 'C) BISERIE WORK',
        rounds: '4 rondas',
        note: 'Biserie seguida sin descanso y 2 min al cerrar la ronda. Goblet squat con bajada de 3 s y cajón de 60 cm.',
        items: [
          setsItem('Goblet Squat', 4, 10, '24 kg'),
          setsItem('Box Jump', 4, 5),
        ],
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
        items: [
          qtyItem('Handstand Push-up', '6 reps'),
          qtyItem('Beat Swing', '8 reps'),
          qtyItem('ANY CARDIO MACH-CAL', '10/8 cal'),
          'Descanso',
        ],
      }),
      block(BLOCK.amrap, {
        title: 'F) WODCITO PIEZA 1',
        timing: '12 min',
        note: 'Rx wall ball 9/6 kg.',
        items: [
          qtyItem('ANY CARDIO MACH-METROS', '200 m'),
          qtyItem('Wall Ball', '15 reps', '9 kg'),
          qtyItem('Burpee Over the Barbell', '10 reps'),
        ],
      }),
      block(BLOCK.roundsForTime, {
        title: 'G) WODCITO PIEZA 2',
        timing: '16 min',
        rounds: '4 rondas',
        note: 'Descansa 4 min antes de empezar. Time cap 16 min y rondas parejas: no sprintes la primera.',
        items: [
          qtyItem('Bike', '10/8 cal'),
          qtyItem('DB Front Rack Reverse Lunge', '8 reps', '22.5 kg'),
          qtyItem('Burpee Box Jump-over', '6 reps'),
        ],
      }),
      cooldownBlock('H) VUELTA A LA CALMA', 'Abre rack frontal y tobillo sin forzar.', [
        qtyItem('Estiramiento de rack frontal', '90 s'),
        qtyItem('Movilidad de tobillo', '90 s'),
      ]),
    ],
  };
}

function buildSaturdaySession(plan) {
  const benchPyramid = pyramidPercents(plan.percent);

  return {
    name: 'BEAST MODE · Sábado de fuerza + Partner WOD',
    duration: '90 min',
    blocks: [
      activationBlock('general'),
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
        rounds: '4 rondas',
        note: 'Superserie seguida sin descanso y 2:30 al cerrar la ronda. Escala los ring dips con fondos en caja y las dominadas sin lastre.',
        items: [
          setsItem('Ring Dip', 4, 10),
          setsItem('Weighted Strict Pull-up', 4, 6, '12 kg'),
        ],
      }),
      block(BLOCK.strength, {
        title: 'D) ACCESORIO BISERIE WORK',
        rounds: '3 rondas',
        note: 'Descansa 90 s al cerrar la biserie.',
        items: [
          setsItem('DB Bench Press', 3, 10, '15 kg'),
          setsItem('Band Pull-apart', 3, 12),
        ],
      }),
      block(BLOCK.amrap, {
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
      }),
      block(BLOCK.forTime, {
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
      }),
      cooldownBlock('G) VUELTA A LA CALMA', 'Cardio muy suave y estiramientos de tren superior.', [
        qtyItem('Bike', '3 min'),
        qtyItem('Estiramiento de pecho', '60 s'),
        qtyItem('Estiramiento de dorsal', '60 s'),
      ]),
    ],
  };
}

const SESSION_BUILDERS = {
  monday: buildMondaySession,
  tuesday: buildTuesdaySession,
  wednesday: buildWednesdaySession,
  friday: buildFridaySession,
  saturday: buildSaturdaySession,
};

function buildTrainingSession(dayKey, plan) {
  const builder = SESSION_BUILDERS[dayKey];
  if (!builder) throw new Error(`No hay plantilla BEAST MODE para ${dayKey}`);

  const session = builder(plan);
  return {
    kind: 'session',
    dayOrder: 1,
    name: session.name,
    estimatedDuration: session.duration,
    main: session.blocks.join('\n\n'),
  };
}

function emptyRestSession() {
  return {
    kind: 'rest',
    dayOrder: 0,
    name: 'Día de descanso',
    estimatedDuration: 'Descanso',
    main: '',
  };
}

function restSession() {
  return {
    kind: 'rest',
    dayOrder: 0,
    name: 'REST DAY',
    estimatedDuration: 'Descanso',
    main: block(BLOCK.mobility, {
      title: 'A) RECUPERACIÓN',
      timing: '25 min',
      note: 'Movilidad o cardio suave opcional. Sin cargas ni metcon.',
      items: [
        qtyItem('Bike', '3 min'),
        qtyItem('Row', '3 min'),
        qtyItem('SkiErg', '3 min'),
        qtyItem('Estiramiento de cadera', '5 min'),
        qtyItem('Estiramiento de espalda', '5 min'),
      ],
    }),
  };
}

export function buildCrosstrainingWeek(monday, { startMonday = PROGRAM_START_MONDAY } = {}) {
  if (!isMonday(monday)) {
    throw new Error(`La semana debe empezar en lunes; ${monday} no lo es.`);
  }

  const week = weekNumberForMonday(monday, startMonday);
  if (week < 1) {
    throw new Error(`${monday} es anterior al arranque del bloque (${startMonday}).`);
  }

  const plan = describeWeek(week);
  const buildersByWeekday = new Map(TRAINING_WEEKDAYS.map((entry) => [entry.weekdayIndex, entry.key]));
  const days = [];

  for (let weekdayIndex = 0; weekdayIndex < 7; weekdayIndex += 1) {
    const date = addDays(monday, weekdayIndex);
    const dayKey = buildersByWeekday.get(weekdayIndex);
    const isRest = REST_WEEKDAYS.has(weekdayIndex) || !dayKey;

    days.push({
      date,
      weekdayIndex,
      weekdayLabel: WEEKDAY_LABELS[weekdayIndex],
      week,
      isRest,
      sessions: [
        isRest
          ? weekdayIndex === 6
            ? emptyRestSession()
            : restSession()
          : buildTrainingSession(dayKey, plan),
      ],
    });
  }

  return { monday, plan, days };
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

export function toWorkoutRows({ plan, days }) {
  const rows = [];

  for (const day of days) {
    for (const session of day.sessions) {
      rows.push({
        workoutDate: day.date,
        aimharderRateId: generatedRateId(day.date, session.dayOrder),
        name: session.name,
        dayLabel: `Mesociclo ${plan.mesocycle.id} · ${plan.mesocycle.name} · Semana ${plan.weekInMesocycle}/${WEEKS_PER_MESOCYCLE} · ${ROLE_LABELS[plan.role]} · ${plan.percent}%`,
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
