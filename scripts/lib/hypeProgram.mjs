/**
 * Semanas del programa HY-PE (Hype) cargadas con el generador program:hype-week.
 * Formato de bloques compatible con lib/workoutContentParser.ts
 *
 * Metodología: docs/HYPE_ATHX_PROGRAMMING_PROMPT.md
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const PROGRAM_NAME = 'Hype';
export const WEEK_MONDAY = '2026-09-07';
export const HYPE_BLOCK_LABEL = 'Bloque HY-PE · 7-20 sep 2026';

export const WEEKDAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const BLOCK = {
  activation: 'Activación',
  prep: 'Preparación',
  strength: 'Fuerza',
  technique: 'Técnica/skills',
  emom: 'EMOM',
  amrap: 'AMRAP',
  forTime: 'For Time',
  accessory: 'Accesorios',
  core: 'Core',
  partner: 'Partner',
  stations: 'Estaciones',
  mobility: 'Movilidad',
};

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T12:00:00Z`);
  return new Date(date.getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);
}

export function isMonday(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay() === 1;
}

function headerPart(value) {
  return String(value).replace(/\s*·\s*/g, ' - ').replace(/\s+/g, ' ').trim();
}

function block(label, { title, timing, rounds, note, items = [] } = {}) {
  const header = [label, title, timing, rounds].filter(Boolean).map(headerPart).join(' · ');
  const lines = [header];
  if (note) lines.push(headerPart(note));
  for (const item of items) lines.push(`• ${item}`);
  return lines.join('\n');
}

function setsItem(name, sets, reps, load) {
  return `${name}: ${sets} × ${reps}${load ? ` · ${load}` : ''}`;
}

function qtyItem(name, quantity, load) {
  return `${name}: ${quantity}${load ? ` · ${load}` : ''}`;
}

// Semana 1 · 7-13 sep 2026 — sin repetición de ejercicio en bloques principales.
// Auditoría: rodilla MOD-ALTA (mié/jue/vie), bisagra MOD (mar/vie/dom), burpee BAJA (mié/vie).
const HYPE_WEEK_1_SESSIONS = [
  {
    key: 'monday',
    weekdayIndex: 0,
    name: 'Empuje',
    duration: '75 min',
    theme: 'EMPUJE',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'General',
        timing: "8'",
        items: [
          qtyItem('Bike / Row', "3' suave"),
          qtyItem('12 Band Pull Apart', ''),
          qtyItem('10 Band External Rotation', 'por lado'),
          qtyItem('10 Scapular Push-up', ''),
          qtyItem('8 Tempo Push-up', '3-1-1'),
        ],
        note: 'Después: 2-3 aproximaciones progresivas de Floor Press.',
      }),
    ],
    blocks: [
      block(BLOCK.strength, {
        title: 'Barbell Floor Press',
        timing: "Descanso: 2'",
        note: 'RPE 7-8.',
        items: [setsItem('Barbell Floor Press', 5, 6, 'RPE 7-8')],
      }),
      block(BLOCK.emom, {
        title: 'Metabólico',
        timing: "20'",
        rounds: '×4',
        note: 'Objetivo: mantener rendimiento estable durante las 4 vueltas.',
        items: [
          qtyItem('Min 1', '12/10 cal Row / Ski / Bike'),
          qtyItem('Min 2', '12 DB Front Rack Reverse Lunge'),
          qtyItem('Min 3', '10-12 Hand Release Push-up'),
          qtyItem('Min 4', '14 KB Russian Swing'),
          qtyItem('Min 5', 'Rest'),
        ],
      }),
    ],
  },
  {
    key: 'tuesday',
    weekdayIndex: 1,
    name: 'Tracción',
    duration: '70 min',
    theme: 'TRACCIÓN',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'Locomoción + escápula',
        timing: "8'",
        rounds: '2 rondas',
        items: [
          qtyItem('200 m Run', 'por ronda'),
          qtyItem('8 Scapular Pull-up', 'por ronda'),
          qtyItem('10 Band Straight Arm Pulldown', 'por ronda'),
          qtyItem('12 Band Face Pull', 'por ronda'),
          qtyItem('20" Hollow Hold', 'por ronda'),
        ],
        note: 'Después: 1-2 aproximaciones fáciles de dominada.',
      }),
    ],
    blocks: [
      block(BLOCK.strength, {
        title: 'Strict Pull-up',
        note: 'RPE 7-8.',
        items: [setsItem('Strict Pull-up', 5, '5-8', 'RPE 7-8')],
      }),
      block(BLOCK.technique, {
        title: 'Progresiones',
        items: [
          qtyItem('Weighted Pull-up', ''),
          qtyItem('Strict Pull-up', ''),
          qtyItem('Band Assisted Pull-up', ''),
          qtyItem('Jumping Pull-up', ''),
        ],
      }),
      block(BLOCK.forTime, {
        title: 'Metabólico',
        timing: "20'",
        rounds: "4 rondas · 4' WORK / 1' REST",
        note:
          'Registrar repeticiones de Chest-to-Bar en cada ronda e intentar minimizar la caída de rendimiento.',
        items: [
          qtyItem('300 m Run', 'por ronda'),
          qtyItem('10 DB Hang Power Snatch', 'por ronda'),
          qtyItem('12 Box Jump Over', 'por ronda'),
          qtyItem('Max Chest-to-Bar / Pull-up', 'tiempo restante'),
        ],
      }),
    ],
  },
  {
    key: 'wednesday',
    weekdayIndex: 2,
    name: 'Partner',
    duration: '55 min',
    theme: 'PARTNER',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'Partner flow',
        timing: "8'",
        rounds: '2 rondas',
        items: [
          qtyItem('200 m Run', 'juntos · por ronda'),
          qtyItem('8 Squat-to-Stand', 'por ronda'),
          qtyItem('10 KB Romanian Deadlift', 'ligero · por ronda'),
          qtyItem('8 Inchworm', 'por ronda'),
          qtyItem('10 Med Ball Pass', 'por ronda'),
        ],
      }),
    ],
    blocks: [
      block(BLOCK.partner, {
        title: 'AMRAP en pareja',
        timing: "36'",
        note:
          'I GO / YOU GO excepto carrera Synchro. Si completan todo, volver a empezar.',
        items: [
          qtyItem('800 m Run', 'Synchro'),
          qtyItem('40 DB Thruster', 'reparto libre'),
          qtyItem('40 Barbell Bent Over Row', 'reparto libre'),
          qtyItem('60 Sandbag Walking Lunge', 'reparto libre'),
          qtyItem('40 Burpee Box Jump Over', 'reparto libre'),
          qtyItem('1000 m Row / Ski / Bike', 'reparto libre'),
          qtyItem('40 KB American Swing', 'reparto libre'),
          qtyItem('40 Pike Push-up / HSPU', 'reparto libre'),
          qtyItem('40 Front Rack Walking Lunge', 'reparto libre'),
          qtyItem('800 m Run', 'Synchro'),
        ],
      }),
    ],
  },
  {
    key: 'thursday',
    weekdayIndex: 3,
    name: 'Rodilla',
    duration: '80 min',
    theme: 'RODILLA',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'Movilidad',
        timing: "8-10'",
        items: [
          qtyItem('Ankle Mobilization', '10 por lado'),
          qtyItem('Adductor Rock Back', '10 por lado'),
          qtyItem('90/90 Hip Switch', '10 totales'),
          qtyItem('Deep Squat Hold', '30"'),
          qtyItem('Cossack Squat', '6 por lado'),
          qtyItem('Tempo Air Squat 3-1-1', '8 reps'),
        ],
      }),
      block(BLOCK.prep, {
        title: 'Back Squat',
        items: [
          qtyItem('Barra vacía', '× 10'),
          qtyItem('Carga ligera', '× 6'),
          qtyItem('Carga media', '× 3'),
        ],
      }),
    ],
    blocks: [
      block(BLOCK.strength, {
        title: 'Back Squat',
        timing: "Descanso: 2'-2'30\"",
        note: 'RPE 7-8.',
        items: [setsItem('Back Squat', 5, 6, 'RPE 7-8')],
      }),
      block(BLOCK.amrap, {
        title: 'Metabólico',
        timing: "20'",
        note: 'Ritmo sostenible durante 20\'. Wall Ball solo en esta sesión de la semana.',
        items: [
          qtyItem('12 Wall Ball', 'por ronda'),
          qtyItem('10 Alternating DB Hang Snatch', 'por ronda'),
          qtyItem('12/10 cal Row / Ski / Bike', 'por ronda'),
          qtyItem('10 Toes-to-Bar / Knees-to-Elbow', 'por ronda'),
        ],
      }),
    ],
  },
  {
    key: 'friday',
    weekdayIndex: 4,
    name: 'ATHX Day',
    duration: '80 min',
    theme: 'ATHX DAY',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'Bisagra + core',
        timing: "8'",
        items: [
          qtyItem('Ski / Bike', "3' progresivo"),
          qtyItem('10 Glute Bridge', ''),
          qtyItem('8 Single Leg RDL', 'sin carga · por lado'),
          qtyItem('10 Good Morning', 'barra vacía'),
          qtyItem('8 Bird Dog', 'por lado'),
        ],
        note: 'Después: 2-3 aproximaciones de Deadlift. Menos volumen de rodilla que el jueves.',
      }),
    ],
    blocks: [
      block(BLOCK.strength, {
        title: 'Bloque 1 — Strength',
        timing: "Descanso: 2'-2'30\"",
        note: 'RPE 7-8.',
        items: [setsItem('Deadlift', 5, 5, 'RPE 7-8')],
      }),
      block(BLOCK.forTime, {
        title: 'Bloque 2 — Endurance',
        timing: "10' continuous",
        note:
          'Alternar 250 m Row / Ski y 200 m Run durante 10 min. Ritmo cardiovascular alto pero sostenible; no interpretarlo como sprint. Con 20 atletas y 10 ergómetros: 10 pueden comenzar en el ergómetro y 10 en carrera.',
        items: [
          qtyItem('250 m Row / Ski', 'alternar con'),
          qtyItem('200 m Run', 'durante 10 min continuos'),
        ],
      }),
      block(BLOCK.amrap, {
        title: 'Bloque 3 — MetCon',
        timing: "10'",
        note: 'Empuje + bisagra ligera. Sin goblet squat ni burpee estándar (ya en miércoles).',
        items: [
          qtyItem('10 DB Push Press', 'por ronda'),
          qtyItem('12 Box Step Over', 'por ronda'),
          qtyItem('8 Burpee Over DB', 'por ronda'),
          qtyItem('12 Sandbag Ground-to-Shoulder', 'por ronda'),
        ],
      }),
    ],
  },
  {
    key: 'saturday',
    weekdayIndex: 5,
    name: 'Partner Stations',
    duration: '55 min',
    theme: 'PARTNER STATIONS',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'Estaciones preview',
        timing: "8'",
        items: [
          qtyItem('Row / Ski', "2' suave"),
          qtyItem("8 World's Greatest Stretch", 'por lado'),
          qtyItem('8 Cossack Squat', 'por lado'),
          qtyItem('10 Scapular Push-up', ''),
          qtyItem('8 KB Romanian Deadlift', 'ligero'),
        ],
        note: 'Después: 2\' para probar cargas de sled y sandbag.',
      }),
    ],
    blocks: [
      block(BLOCK.stations, {
        title: '5 estaciones en parejas',
        timing: "30' trabajo + transiciones",
        rounds: "6' WORK · 1' CHANGE",
        note:
          '20 atletas · 10 parejas · 2 parejas por estación. Existen 2 carriles de sled; la distribución debe permitir exactamente 2 parejas en esa estación.',
        items: [
          qtyItem('Estación 1 — Sled', '12,5 m Sled Push atleta A + 12,5 m atleta B · relay continuo'),
          qtyItem('Estación 2 — Engine', '250 m Row + 250 m Ski · I GO / YOU GO'),
          qtyItem('Estación 3 — Sandbag', '20 m Sandbag Carry + 10 Reverse Lunge · alternando'),
          qtyItem('Estación 4 — Upper Body', '8 Ring Dip + 8 DB Devil Press + 8 DB Renegade Row · I GO / YOU GO'),
          qtyItem('Estación 5 — Power', '200 m Run + 12 Med Ball Slam · relay'),
        ],
      }),
    ],
  },
  {
    key: 'sunday',
    weekdayIndex: 6,
    name: 'Strength',
    duration: '85 min',
    theme: 'STRENGTH',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'Recuperación activa',
        timing: "8'",
        items: [
          qtyItem('500 m Row', 'suave'),
          qtyItem('10 Cat-Cow', ''),
          qtyItem('10 Hip Airplane asistido', 'por lado'),
          qtyItem('10 Glute Bridge', ''),
          qtyItem('10 Band Face Pull', ''),
          qtyItem('8 Reverse Lunge', 'por lado'),
        ],
      }),
    ],
    blocks: [
      block(BLOCK.strength, {
        title: 'Bloque A',
        timing: 'Descanso: 90-120"',
        items: [
          setsItem('Romanian Deadlift', 4, 8, 'RPE aprox. 7'),
          setsItem('DB Incline Bench Press', 4, 10, 'RPE 7-8'),
        ],
      }),
      block(BLOCK.strength, {
        title: 'Bloque B',
        timing: 'Descanso: 90"',
        items: [
          setsItem('DB Step-up', 3, '10 por lado'),
          setsItem('Single Arm DB Row', 3, '10-12 por lado'),
        ],
      }),
      block(BLOCK.accessory, {
        title: 'Bloque C',
        items: [
          setsItem('KB Sumo Deadlift', 3, 12),
          setsItem('DB Lateral Raise', 3, '12-15'),
          setsItem('DB Hammer Curl', 3, '10-12'),
        ],
      }),
      block(BLOCK.core, {
        title: 'Core',
        rounds: '3 rondas',
        note: 'Sin MetCon.',
        items: [
          qtyItem('30" Hollow Hold', 'por ronda'),
          qtyItem('10 Dead Bug', 'por lado y ronda'),
          qtyItem('30" Side Plank', 'por lado y ronda'),
        ],
      }),
    ],
  },
];

const HYPE_WEEK_2_SESSIONS = [
  {
    key: 'monday-w2',
    weekdayIndex: 0,
    name: 'Empuje',
    duration: '70 min',
    theme: 'EMPUJE',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'General',
        timing: "8'",
        items: [
          qtyItem('Ski / Bike', "3' suave"),
          qtyItem('10 Band External Rotation', 'por lado'),
          qtyItem('12 Band Pull Apart', ''),
          qtyItem('10 Scapular Wall Slide', ''),
          qtyItem('8 Tempo Push-up', ''),
          qtyItem('10 DB Strict Press', 'muy ligero'),
        ],
      }),
    ],
    blocks: [
      block(BLOCK.strength, {
        title: 'DB Bench Press',
        timing: 'Descanso: 90-120"',
        note: 'RPE 8. Progresión: semana 1 Barbell Floor Press 5×6 → semana 2 DB Bench Press 4×8-10.',
        items: [setsItem('DB Bench Press', 4, '8-10', 'RPE 8')],
      }),
      block(BLOCK.amrap, {
        title: 'Metabólico',
        timing: "20'",
        note: 'Flujo continuo y ritmo sostenible.',
        items: [
          qtyItem('10 DB Front Rack Walking Lunge', 'por ronda'),
          qtyItem('12/10 cal Bike / Row', 'por ronda'),
          qtyItem('10 Hand Release Push-up', 'por ronda'),
          qtyItem('12 KB Swing', 'por ronda'),
          qtyItem('200 m Run', 'por ronda'),
        ],
      }),
    ],
  },
  {
    key: 'tuesday-w2',
    weekdayIndex: 1,
    name: 'Tracción',
    duration: '70 min',
    theme: 'TRACCIÓN',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'General',
        timing: "8'",
        items: [
          qtyItem('500 m Row', 'suave'),
        ],
      }),
      block(BLOCK.activation, {
        title: 'Movimiento',
        rounds: '2 rondas',
        items: [
          qtyItem('8 Scapular Pull-up', 'por ronda'),
          qtyItem('10 Band Straight Arm Pulldown', 'por ronda'),
          qtyItem('10 Ring Row', 'por ronda'),
          qtyItem('15" Active Hang', 'por ronda'),
        ],
      }),
    ],
    blocks: [
      block(BLOCK.strength, {
        title: 'Strict Pull-up',
        note: 'RPE 8. Progresión: semana 1 5×5-8 → semana 2 5×6-8.',
        items: [setsItem('Strict Pull-up', 5, '6-8', 'RPE 8')],
      }),
      block(BLOCK.technique, {
        title: 'Progresión',
        note:
          'Si completaste 5×8 la semana anterior con margen: añadir lastre. Si todavía no completaste el rango: mantener variante y progresar repeticiones.',
        items: [],
      }),
      block(BLOCK.emom, {
        title: 'Metabólico',
        timing: "20'",
        rounds: '×4',
        items: [
          qtyItem('Min 1', '12/10 cal Ski'),
          qtyItem('Min 2', '10 DB Romanian Deadlift'),
          qtyItem('Min 3', '12 Wall Ball'),
          qtyItem('Min 4', '8-10 Burpee Over DB'),
          qtyItem('Min 5', 'Rest'),
        ],
      }),
    ],
  },
  {
    key: 'wednesday-w2',
    weekdayIndex: 2,
    name: 'Partner',
    duration: '55 min',
    theme: 'PARTNER',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'General',
        timing: "8'",
        rounds: '2 rondas',
        items: [
          qtyItem('200 m Run', 'juntos'),
          qtyItem('8 Squat-to-Stand', 'por ronda'),
          qtyItem('10 KB Deadlift', 'por ronda'),
          qtyItem('8 Push-up', 'por ronda'),
          qtyItem('10 Alternating Lunge', 'por ronda'),
          qtyItem('20" Plank', 'por ronda'),
        ],
      }),
    ],
    blocks: [
      block(BLOCK.partner, {
        title: 'For Time',
        timing: "TIME CAP: 38'",
        rounds: '4 rondas',
        note:
          'I GO / YOU GO salvo carrera. Reparto libre. Después de completar las 4 rondas: 2000 m Any Erg.',
        items: [
          qtyItem('600 m Run', 'Synchro · por ronda'),
          qtyItem('40 DB Hang Power Clean', 'por ronda'),
          qtyItem('30 Box Step Over', 'por ronda'),
          qtyItem('40 Push-up', 'por ronda'),
          qtyItem('30 Sandbag Front Rack Lunge', 'por ronda'),
          qtyItem('40 Sit-up', 'por ronda'),
          qtyItem('2000 m Any Erg', 'al terminar las 4 rondas'),
        ],
      }),
    ],
  },
  {
    key: 'thursday-w2',
    weekdayIndex: 3,
    name: 'Rodilla',
    duration: '70 min',
    theme: 'RODILLA',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'Movilidad',
        timing: "9'",
        items: [
          qtyItem('Ankle Rock', '10 por lado'),
          qtyItem('90/90 Switch', '8 por lado'),
          qtyItem('Adductor Rock Back', '8 por lado'),
          qtyItem('Cossack Squat', '8 por lado'),
          qtyItem('10 Reverse Lunge', ''),
          qtyItem('20" Split Squat Iso Hold', 'por lado'),
        ],
      }),
    ],
    blocks: [
      block(BLOCK.strength, {
        title: 'DB Front Rack Bulgarian Split Squat',
        timing: 'Descanso: 90-120"',
        note: 'RPE 7-8. Progresión: semana 1 Back Squat 5×6 → semana 2 DB Front Rack Bulgarian Split Squat 4×8/lado.',
        items: [setsItem('DB Front Rack Bulgarian Split Squat', 4, '8 por lado', 'RPE 7-8')],
      }),
      block(BLOCK.forTime, {
        title: 'Metabólico',
        timing: "TIME CAP: 20'",
        rounds: '5 rondas',
        note: 'Objetivo: rondas consistentes.',
        items: [
          qtyItem('400 m Run', 'por ronda'),
          qtyItem('12 DB Alternating Snatch', 'por ronda'),
          qtyItem('10 Toes-to-Bar', 'por ronda'),
          qtyItem('12 Wall Ball', 'por ronda'),
        ],
      }),
    ],
  },
  {
    key: 'friday-w2',
    weekdayIndex: 4,
    name: 'ATHX Day',
    duration: '85 min',
    theme: 'ATHX DAY',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'General',
        timing: "8'",
        items: [
          qtyItem('Row', "3' progresivo"),
          qtyItem('10 Glute Bridge', ''),
          qtyItem('8 Single Leg RDL', 'sin carga · por lado'),
          qtyItem('10 Band Pull Apart', ''),
          qtyItem('8 Good Morning', ''),
          qtyItem('8 Push-up', ''),
        ],
      }),
    ],
    blocks: [
      block(BLOCK.strength, {
        title: 'Bloque 1 — Strength',
        timing: 'Descanso: 90-120"',
        note: 'RPE 7-8. Progresión: semana 1 Deadlift 5×5 → semana 2 Barbell RDL 4×8.',
        items: [setsItem('Barbell Romanian Deadlift', 4, 8, 'RPE 7-8')],
      }),
      block(BLOCK.forTime, {
        title: 'Bloque 2 — Endurance',
        timing: "12' continuous",
        note: 'Alternar durante 12 min. Ritmo estable desde el inicio.',
        items: [
          qtyItem('300 m Run', 'alternar con'),
          qtyItem('12/10 cal Row / Ski / Bike', 'durante 12 min'),
        ],
      }),
      block(BLOCK.amrap, {
        title: 'Bloque 3 — MetCon',
        timing: "12'",
        items: [
          qtyItem('8 DB Push Press', 'por ronda'),
          qtyItem('10 Burpee Box Step Over', 'por ronda'),
          qtyItem('12 Sandbag Front Squat', 'por ronda'),
          qtyItem('40 m Farmer Carry', 'por ronda'),
        ],
      }),
    ],
  },
  {
    key: 'saturday-w2',
    weekdayIndex: 5,
    name: 'Partner',
    duration: '55 min',
    theme: 'PARTNER',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'General',
        timing: "8'",
        items: [
          qtyItem('400 m Run', 'suave'),
          qtyItem('10 Air Squat', ''),
          qtyItem('10 Ring Row', ''),
          qtyItem('8 Push-up', ''),
          qtyItem('10 Alternating Lunge', ''),
          qtyItem('10 KB Deadlift', ''),
        ],
      }),
    ],
    blocks: [
      block(BLOCK.partner, {
        title: 'AMRAP en pareja',
        timing: "35'",
        note:
          'I GO / YOU GO. BUY IN: 1000 m Run Synchro. Cada vez que completen una vuelta: 400 m Run Synchro.',
        items: [
          qtyItem('1000 m Run', 'Synchro · BUY IN'),
          qtyItem('30 cal Any Erg', 'por vuelta'),
          qtyItem('40 KB Goblet Squat', 'por vuelta'),
          qtyItem('30 Ring Row', 'por vuelta'),
          qtyItem('40 Sandbag Carry', '20 m · por vuelta'),
          qtyItem('30 Burpee', 'por vuelta'),
          qtyItem('40 DB Shoulder-to-Overhead', 'por vuelta'),
          qtyItem('30 Sit-up', 'por vuelta'),
          qtyItem('400 m Run', 'Synchro · al completar cada vuelta'),
        ],
      }),
    ],
  },
  {
    key: 'sunday-w2',
    weekdayIndex: 6,
    name: 'Strength / Bodybuilding',
    duration: '85 min',
    theme: 'STRENGTH / BODYBUILDING',
    warmupBlocks: [
      block(BLOCK.activation, {
        title: 'General',
        timing: "8'",
        items: [
          qtyItem('Bike', "3'"),
          qtyItem('10 Hip Airplane asistido', 'por lado'),
          qtyItem('10 Glute Bridge', ''),
          qtyItem('10 Band Face Pull', ''),
          qtyItem('8 Reverse Lunge', 'por lado'),
          qtyItem('8 Scapular Push-up', ''),
        ],
      }),
    ],
    blocks: [
      block(BLOCK.strength, {
        title: 'Bloque A',
        items: [
          setsItem('Barbell Hip Thrust', 4, '8-10'),
          setsItem('DB Incline Bench Press', 4, '8-10'),
        ],
      }),
      block(BLOCK.strength, {
        title: 'Bloque B',
        items: [
          setsItem('DB Step-up', 3, '10 por lado'),
          setsItem('Single Arm DB Row', 3, '10-12 por lado'),
        ],
      }),
      block(BLOCK.accessory, {
        title: 'Bloque C',
        items: [
          setsItem('Ring Push-up', 3, '10-15'),
          setsItem('DB Hammer Curl', 3, '10-12'),
          setsItem('Standing Calf Raise', 3, '15-20'),
        ],
      }),
      block(BLOCK.core, {
        title: 'Core',
        rounds: '3 rondas',
        note: 'Sin MetCon.',
        items: [
          qtyItem('10-12 Hanging Knee Raise', 'por ronda'),
          qtyItem('12 Pallof Press', 'por lado y ronda'),
          qtyItem('30" Front Plank', 'por ronda'),
        ],
      }),
    ],
  },
];

export const HYPE_WEEK_TEMPLATES = [HYPE_WEEK_1_SESSIONS, HYPE_WEEK_2_SESSIONS];

function buildDaysFromTemplates(startMonday, weekTemplates, blockLabel) {
  const days = [];

  for (let weekIndex = 0; weekIndex < weekTemplates.length; weekIndex += 1) {
    const monday = addDays(startMonday, weekIndex * 7);
    const templates = weekTemplates[weekIndex];

    for (const template of templates) {
      const date = addDays(monday, template.weekdayIndex);
      days.push({
        date,
        weekIndex,
        weekdayIndex: template.weekdayIndex,
        weekdayLabel: WEEKDAY_LABELS[template.weekdayIndex],
        theme: template.theme,
        sessions: [
          {
            kind: 'session',
            dayOrder: 1,
            name: template.name,
            estimatedDuration: template.duration,
            warmup: (template.warmupBlocks ?? []).join('\n\n'),
            main: template.blocks.join('\n\n'),
          },
        ],
      });
    }
  }

  return {
    monday: startMonday,
    sunday: days.at(-1)?.date,
    label: blockLabel,
    days,
  };
}

export function buildHypeWeek(monday = WEEK_MONDAY, weekTemplates = [HYPE_WEEK_1_SESSIONS]) {
  if (!isMonday(monday)) {
    throw new Error(`La semana debe empezar en lunes; ${monday} no lo es.`);
  }

  return buildDaysFromTemplates(monday, weekTemplates, HYPE_BLOCK_LABEL);
}

export function buildHypeBlock(
  startMonday = WEEK_MONDAY,
  weekTemplates = HYPE_WEEK_TEMPLATES,
  blockLabel = HYPE_BLOCK_LABEL,
) {
  if (!isMonday(startMonday)) {
    throw new Error(`El bloque debe empezar en lunes; ${startMonday} no lo es.`);
  }

  return buildDaysFromTemplates(startMonday, weekTemplates, blockLabel);
}

const RATE_ID_BASE = 5_750_000;
const RATE_ID_SLOT_STEP = 100_000;

export function generatedRateId(workoutDate, dayOrder) {
  const [, month, day] = workoutDate.split('-');
  return -(RATE_ID_BASE + dayOrder * RATE_ID_SLOT_STEP + Number(`${month}${day}`));
}

export const GENERATED_RATE_ID_RANGE = {
  from: -(RATE_ID_BASE + 4 * RATE_ID_SLOT_STEP),
  to: -RATE_ID_BASE,
};

export function toWorkoutRows({ label, days }) {
  const rows = [];

  for (const day of days) {
    for (const session of day.sessions) {
      rows.push({
        workoutDate: day.date,
        aimharderRateId: generatedRateId(day.date, session.dayOrder),
        name: session.name,
        dayLabel: `${label} · ${day.theme}`,
        estimatedDuration: session.estimatedDuration,
        warmup: session.warmup ?? '',
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
