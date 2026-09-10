import { BLOCK, block, qtyItem, setsItem } from './workoutBlockHelpers.mjs';

const MODALITY_ACTIVATION = {
  Calistenia: {
    timing: '10 min',
    title: 'Movilidad · Tren superior y core',
    note: '2 rondas sin prisa. Prioriza rango de hombro y escápulas antes del trabajo gimnástico.',
    items: [
      qtyItem('Cat camel', '8 reps'),
      qtyItem('Quadruped thoracic rotation', '6 reps por lado'),
      qtyItem('Scapular pull-up', '8 reps'),
      qtyItem('Band pull-apart', '12 reps'),
      qtyItem('Hollow hold', '20 s'),
      qtyItem('Arch hold', '20 s'),
    ],
  },
  ATHX: {
    timing: '12 min',
    title: 'Hybrid · Turf y movilidad',
    note: '2 rondas fluidas. Mezcla agilidad, potencia y técnica antes del bloque principal.',
    items: [
      qtyItem('Lateral shuffle', '20 m'),
      qtyItem('High knees', '20 m'),
      qtyItem('KB goblet squat', '10 reps', '16 kg'),
      qtyItem('Inchworm', '5 reps'),
      qtyItem('Band pull-apart', '12 reps'),
      qtyItem('Jump rope', '40 s'),
      qtyItem("World's greatest stretch", '4 reps por lado'),
    ],
  },
  Crosstraining: {
    timing: '10 min',
    title: 'Engine · Movimiento general',
    note: '3 rondas a RPE 4. Calienta lo que vas a usar en el WOD.',
    items: [
      qtyItem('Row', '30 s'),
      qtyItem('Air squat', '10 reps'),
      qtyItem('Good morning', '10 reps'),
      qtyItem('Push-up', '8 reps'),
      qtyItem('Glute bridge', '10 reps'),
      qtyItem('Bird dog', '6 reps por lado'),
    ],
  },
  Hype: {
    timing: '10 min',
    title: 'Alta intensidad · Entrada en calor',
    note: '2 rondas progresivas. La segunda un poco más rápida que la primera.',
    items: [
      qtyItem('Jumping jack', '20 reps'),
      qtyItem('Mountain climber', '20 reps'),
      qtyItem('Slam ball', '8 reps', '9 kg'),
      qtyItem('KB swing', '12 reps', '16 kg'),
      qtyItem('Burpee', '5 reps'),
      qtyItem('Hollow rocks', '20 s'),
    ],
  },
  Hyrox: {
    timing: '12 min',
    title: 'Carrera y estaciones',
    note: '2 rondas. Simula transiciones cortas entre máquina y movimiento.',
    items: [
      qtyItem('Run', '200 m'),
      qtyItem('SkiErg', '30 s'),
      qtyItem('Walking lunge', '10 reps por pierna'),
      qtyItem('Wall ball', '8 reps', '6 kg'),
      qtyItem('Row', '30 s'),
      qtyItem('Bear crawl', '20 m'),
    ],
  },
};

const MODALITY_PREP = {
  Calistenia: {
    timing: '15 min',
    title: 'Primer · Dominadas y empuje',
    note: 'Trabaja en fresco. Corta la serie si pierdes técnica.',
    items: [
      setsItem('Ring row', 2, 8),
      setsItem('Push-up', 2, 10),
      qtyItem('Hanging knee raise', '2 × 8'),
    ],
  },
  ATHX: {
    timing: '18 min',
    title: 'Primer · Híbrido',
    note: 'Barra ligera y movimientos del WOD. No acumules fatiga.',
    items: [
      setsItem('Thruster', 2, 5, 'barra vacía'),
      setsItem('Deadlift', 2, 5, '60 kg'),
      setsItem('Strict pull-up', 2, 5),
      qtyItem('KB swing', '2 × 10', '16 kg'),
    ],
  },
  Crosstraining: {
    timing: '15 min',
    title: 'Primer · Barra y gimnástico',
    note: 'Aproximación al patrón del hero. Escala si hace falta.',
    items: [
      setsItem('Front squat', 2, 5, 'barra vacía'),
      setsItem('Push-up', 2, 10),
      qtyItem('Air squat', '2 × 10'),
    ],
  },
  Hype: {
    timing: '12 min',
    title: 'Primer · Potencia',
    note: 'Series cortas y explosivas. Descansa lo que necesites.',
    items: [
      qtyItem('Box jump', '3 × 5'),
      setsItem('KB swing', 2, 10, '16 kg'),
      qtyItem('Burpee', '2 × 5'),
    ],
  },
  Hyrox: {
    timing: '15 min',
    title: 'Primer · Ritmo de carrera',
    note: 'Encuentra un ritmo cómodo antes del bloque principal.',
    items: [
      qtyItem('Run', '400 m'),
      qtyItem('SkiErg', '2 × 250 m'),
      qtyItem('Walking lunge', '2 × 10 por pierna'),
    ],
  },
};

const HERO_PREP = {
  'the-seven': () =>
    [
      block(BLOCK.technique, {
        title: 'Primer · Empuje invertido',
        timing: '8 min',
        note: 'No llegues al fallo. Escala HSPU con pike push-up, cajón o mancuernas.',
        items: [
          setsItem('Pike push-up', 2, 8),
          qtyItem('Wall walk', '2 intentos'),
          qtyItem('Shoulder taps en pared', '2 × 6'),
        ],
      }),
      block(BLOCK.technique, {
        title: 'Primer · Barra y bisagra',
        timing: '10 min',
        note: 'Toca el suelo en cada deadlift. Thruster con barra vacía y 2 series ligeras.',
        items: [
          setsItem('Thruster', 2, 5, 'barra vacía'),
          setsItem('Thruster', 1, 5, '40 kg'),
          setsItem('Deadlift', 2, 5, '70 kg'),
          qtyItem('Knees-to-elbow', '2 × 5'),
        ],
      }),
      block(BLOCK.technique, {
        title: 'Primer · Dominadas y potencia',
        timing: '8 min',
        note: 'Mantén el kipping fuera. Si rompes técnica, usa banda.',
        items: [
          setsItem('Strict pull-up', 2, 5),
          qtyItem('KB swing', '2 × 10', '16 kg'),
          qtyItem('Burpee', '2 × 5'),
        ],
      }),
    ].join('\n\n'),
};

function modalityActivation(modality) {
  const template = MODALITY_ACTIVATION[modality] ?? MODALITY_ACTIVATION.ATHX;
  return block(BLOCK.activation, {
    title: template.title,
    timing: template.timing,
    note: template.note,
    items: template.items,
  });
}

function modalityPrep(modality) {
  const template = MODALITY_PREP[modality] ?? MODALITY_PREP.ATHX;
  return block(BLOCK.technique, {
    title: template.title,
    timing: template.timing,
    note: template.note,
    items: template.items,
  });
}

export function buildWeeklyChallengeActivation(modality, hero) {
  if (typeof hero?.activation === 'function') return hero.activation();
  return modalityActivation(modality);
}

export function buildWeeklyChallengePrep(modality, hero) {
  if (typeof hero?.prep === 'function') return hero.prep();
  const byId = HERO_PREP[hero?.id];
  if (typeof byId === 'function') return byId();
  return modalityPrep(modality);
}

export function activationDuration(modality) {
  return (MODALITY_ACTIVATION[modality] ?? MODALITY_ACTIVATION.ATHX).timing;
}

export function prepDuration(modality, hero) {
  if (hero?.prepDuration) return hero.prepDuration;
  if (HERO_PREP[hero?.id]) return '25 min';
  return (MODALITY_PREP[modality] ?? MODALITY_PREP.ATHX).timing;
}
