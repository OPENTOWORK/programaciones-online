import { BLOCK, block, qtyItem, setsItem } from './workoutBlockHelpers.mjs';

/** Modalidades del desafío semanal (orden fijo en la UI). */
export const WEEKLY_CHALLENGE_MODALITIES = [
  'Calistenia',
  'ATHX',
  'Crosstraining',
  'Hype',
  'Hyrox',
];

/**
 * Heroes de CrossFit agrupados por modalidad. Cada entrada genera un bloque principal
 * estructurado para que el atleta pueda abrir vídeos de técnica.
 */
export const HERO_WODS = {
  Calistenia: [
    {
      id: 'angie',
      name: 'Angie',
      honor: 'Angie Proctor',
      duration: '25-40 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · ANGIE',
          note: 'For time. Escala pull-ups con banda o ring row y pistols con sentadilla a una pierna asistida.',
          items: [
            qtyItem('Strict Pull-up', '100 reps'),
            qtyItem('PUSH-UP', '100 reps'),
            qtyItem('Sit-up', '100 reps'),
            qtyItem('Air Squat', '100 reps'),
          ],
        }),
    },
    {
      id: 'cindy',
      name: 'Cindy',
      honor: 'Cindy Stowell',
      duration: '20 min',
      build: () =>
        block(BLOCK.amrap, {
          title: 'HERO · CINDY',
          timing: '20 min',
          note: 'AMRAP. Mantén series cortas desde el minuto 1.',
          items: [
            qtyItem('Strict Pull-up', '5 reps'),
            qtyItem('PUSH-UP', '10 reps'),
            qtyItem('Air Squat', '15 reps'),
          ],
        }),
    },
    {
      id: 'chelsea',
      name: 'Chelsea',
      honor: 'Chelsea King',
      duration: '30 min',
      build: () =>
        block(BLOCK.emom, {
          title: 'HERO · CHELSEA',
          timing: '30 min',
          note: 'EMOM: 5 pull-ups, 10 push-ups y 15 squats cada minuto. Si terminas antes, descansas el resto del minuto.',
          items: [
            qtyItem('Strict Pull-up', '5 reps'),
            qtyItem('PUSH-UP', '10 reps'),
            qtyItem('Air Squat', '15 reps'),
          ],
        }),
    },
    {
      id: 'mary',
      name: 'Mary',
      honor: 'Mary Stedman',
      duration: '20 min',
      build: () =>
        block(BLOCK.amrap, {
          title: 'HERO · MARY',
          timing: '20 min',
          note: 'AMRAP gimnástico. Escala HSPU con pike o cajón.',
          items: [
            qtyItem('Handstand Push-up', '5 reps'),
            qtyItem('Pistol Squat', '10 reps'),
            qtyItem('Strict Pull-up', '15 reps'),
          ],
        }),
    },
    {
      id: 'michael',
      name: 'Michael',
      honor: 'Michael Murphy',
      duration: '35-45 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · MICHAEL',
          rounds: '3 rondas',
          note: 'For time. Alterna carrera y core; escala back extension con superman si hace falta.',
          items: [
            qtyItem('Run', '800 m'),
            qtyItem('Back Extension', '50 reps'),
            qtyItem('Sit-up', '50 reps'),
          ],
        }),
    },
    {
      id: 'barbara',
      name: 'Barbara',
      honor: 'Barbara (benchmark)',
      duration: '25-40 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · BARBARA',
          rounds: '5 rondas',
          note: 'For time. Descansa 3 min entre rondas. Escala pull-ups con banda.',
          items: [
            qtyItem('Strict Pull-up', '20 reps'),
            qtyItem('PUSH-UP', '30 reps'),
            qtyItem('Sit-up', '40 reps'),
            qtyItem('Air Squat', '50 reps'),
          ],
        }),
    },
    {
      id: 'annie',
      name: 'Annie',
      honor: 'Annie (benchmark)',
      duration: '8-12 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · ANNIE',
          note: '50-40-30-20-10 double unders y sit-ups. Escala con single unders × 2.',
          items: [
            qtyItem('Double Under', '50-40-30-20-10 reps'),
            qtyItem('Sit-up', '50-40-30-20-10 reps'),
          ],
        }),
    },
    {
      id: 'mcghee',
      name: 'McGhee',
      honor: 'McGhee (benchmark)',
      duration: '30-40 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · MCGHEE',
          rounds: '5 rondas',
          note: 'For time. Mantén ritmo de carrera constante.',
          items: [
            qtyItem('Burpee', '5 reps'),
            qtyItem('PUSH-UP', '10 reps'),
            qtyItem('Air Squat', '15 reps'),
            qtyItem('Run', '400 m'),
          ],
        }),
    },
    {
      id: 'loredo',
      name: 'Loredo',
      honor: 'Sgt. Edwardo Loredo',
      duration: '30-40 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · LOREDO',
          rounds: '6 rondas',
          note: 'For time. Walking lunges cuentan por pierna o por paso según tu box.',
          items: [
            qtyItem('Air Squat', '24 reps'),
            qtyItem('PUSH-UP', '24 reps'),
            qtyItem('Walking Lunge', '24 reps'),
            qtyItem('Run', '400 m'),
          ],
        }),
    },
    {
      id: 'nicole',
      name: 'Nicole',
      honor: 'Nicole (benchmark)',
      duration: '20 min',
      build: () =>
        block(BLOCK.amrap, {
          title: 'HERO · NICOLE',
          timing: '20 min',
          note: 'AMRAP. Cada ronda: 400 m run + máximo de pull-ups en el tiempo restante.',
          items: [
            qtyItem('Run', '400 m'),
            qtyItem('Strict Pull-up', 'AMRAP'),
          ],
        }),
    },
    {
      id: 'eva',
      name: 'Eva',
      honor: 'Eva (benchmark)',
      duration: '25-35 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · EVA',
          note: 'For time. Rx kettlebell 32/24 kg. Alterna carrera y estaciones.',
          items: [
            qtyItem('Run', '800 m'),
            qtyItem('Russian KTB Swing', '30 reps', '32 kg'),
            qtyItem('Burpee', '30 reps'),
            qtyItem('Run', '800 m'),
            qtyItem('Russian KTB Swing', '30 reps', '32 kg'),
            qtyItem('Burpee', '30 reps'),
          ],
        }),
    },
  ],
  ATHX: [
    {
      id: 'dt',
      name: 'DT',
      honor: 'Timothy P. Davis',
      duration: '12-18 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · DT',
          rounds: '5 rondas',
          note: 'For time. Rx 70/47.5 kg. Toca el suelo en cada deadlift y recibe limpio cada rep.',
          items: [
            setsItem('Deadlift', 1, 12, '70 kg'),
            setsItem('Hang Power Clean', 1, 9, '70 kg'),
            setsItem('Push Jerk', 1, 6, '70 kg'),
          ],
        }),
    },
    {
      id: 'randy',
      name: 'Randy',
      honor: 'Randy Ross',
      duration: '8-15 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · RANDY',
          timing: 'Cap 20 min',
          note: '75 power snatch for time. Rx 35/25 kg. Singles si rompes técnica.',
          items: [qtyItem('Power Snatch', '75 reps', '35 kg')],
        }),
    },
    {
      id: 'nate',
      name: 'Nate',
      honor: 'Nate Hardy',
      duration: '20 min',
      build: () =>
        block(BLOCK.emom, {
          title: 'HERO · NATE',
          timing: '20 min',
          note: 'EMOM 2 min × 10. Mínimo 4 bar muscle-up por ronda; el resto del tiempo es AMRAP de muscle-up. Escala con pull-up + dip.',
          items: [
            qtyItem('Bar Muscle-up', 'AMRAP'),
            qtyItem('Mínimo por ronda', '4 reps'),
          ],
        }),
    },
    {
      id: 'josh',
      name: 'Josh',
      honor: 'Joshua Harris',
      duration: '25-35 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · JOSH',
          note: 'For time en parejas o individual. OH squat con barra y dominadas estrictas.',
          items: [
            setsItem('Overhead Squat', 1, 21, '43 kg'),
            qtyItem('Strict Pull-up', '42 reps'),
            setsItem('Overhead Squat', 1, 15, '43 kg'),
            qtyItem('Strict Pull-up', '30 reps'),
            setsItem('Overhead Squat', 1, 9, '43 kg'),
            qtyItem('Strict Pull-up', '18 reps'),
          ],
        }),
    },
    {
      id: 'holleyman',
      name: 'Holleyman',
      honor: '1st Lt. Joseph Holleyman',
      duration: '40-55 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · HOLLEYMAN',
          rounds: '10 rondas',
          note: 'For time con chaleco 9/6 kg si puedes. Escala wall ball y mancuernas.',
          items: [
            qtyItem('Wall Ball', '8 reps', '9 kg'),
            qtyItem('Sumo Deadlift High Pull', '8 reps', '35 kg'),
            qtyItem('Russian KTB Swing', '8 reps', '24 kg'),
            qtyItem('Burpee', '8 reps'),
          ],
        }),
    },
    {
      id: 'daniel',
      name: 'Daniel',
      honor: 'Sgt. Daniel Schoene',
      duration: '25-35 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · DANIEL',
          note: 'For time. Rx thruster 43/30 kg. Parte dominadas en series de 5-10.',
          items: [
            qtyItem('Strict Pull-up', '50 reps'),
            qtyItem('Run', '400 m'),
            qtyItem('THRUSTER BARBELL', '21 reps', '43 kg'),
            qtyItem('Run', '800 m'),
            qtyItem('THRUSTER BARBELL', '21 reps', '43 kg'),
            qtyItem('Run', '400 m'),
            qtyItem('Strict Pull-up', '50 reps'),
          ],
        }),
    },
    {
      id: 'severin',
      name: 'Severin',
      honor: 'Severin (benchmark)',
      duration: '25-35 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · SEVERIN',
          note: 'For time. Escala HSPU con pike y muscle-up con pull-up + dip.',
          items: [
            qtyItem('Handstand Push-up', '50 reps'),
            qtyItem('Bar Muscle-up', '25 reps'),
            qtyItem('Pistol Squat', '50 reps'),
          ],
        }),
    },
    {
      id: 'luke',
      name: 'Luke',
      honor: 'Luke (benchmark)',
      duration: '20-30 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · LUKE',
          note: 'For time. Rx clean and jerk 61/43 kg.',
          items: [
            qtyItem('Run', '400 m'),
            qtyItem('Clean and Jerk', '15 reps', '61 kg'),
            qtyItem('Run', '400 m'),
            qtyItem('Clean and Jerk', '15 reps', '61 kg'),
            qtyItem('Run', '400 m'),
            qtyItem('Clean and Jerk', '15 reps', '61 kg'),
          ],
        }),
    },
    {
      id: 'kalsu',
      name: 'Kalsu',
      honor: 'Nate Kalsu',
      duration: '15-25 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · KALSU',
          timing: 'Cap 30 min',
          note: '100 thrusters for time. Rx 61/43 kg. Al inicio de cada minuto: 5 burpees.',
          items: [
            qtyItem('THRUSTER BARBELL', '100 reps', '61 kg'),
            qtyItem('Burpee al inicio de cada minuto', '5 reps'),
          ],
        }),
    },
    {
      id: 'arnie',
      name: 'Arnie',
      honor: 'Arnie (benchmark)',
      duration: '35-45 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · ARNIE',
          note: 'For time. Turkish get-up por lado. Rx 32/24 kg.',
          items: [
            qtyItem('Turkish Get-up (derecho)', '21 reps', '32 kg'),
            qtyItem('Turkish Get-up (izquierdo)', '21 reps', '32 kg'),
            qtyItem('Air Squat', '50 reps'),
            qtyItem('Strict Pull-up', '50 reps'),
          ],
        }),
    },
    {
      id: 'the-seven',
      name: 'The Seven',
      honor: 'The Seven (benchmark)',
      duration: '30-40 min',
      prepDuration: '25 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · THE SEVEN',
          rounds: '7 rondas',
          timing: 'Cap 35 min',
          note:
            'For time. 7 reps de cada movimiento por ronda, en orden. Rx: thruster 61/43 kg, deadlift 112/75 kg, swing 32/24 kg. ' +
            'Ritmo objetivo: primera ronda ~4 min y mantener transiciones cortas. ' +
            'Escala HSPU con pike o cajón, K2E con elevación de rodillas y dominadas con banda.',
          items: [
            qtyItem('Handstand Push-up', '7 reps'),
            qtyItem('THRUSTER BARBELL', '7 reps', '61 kg'),
            qtyItem('Knees-to-Elbow', '7 reps'),
            qtyItem('Deadlift', '7 reps', '112 kg'),
            qtyItem('Burpee', '7 reps'),
            qtyItem('Kettlebell Swing', '7 reps', '32 kg'),
            qtyItem('Strict Pull-up', '7 reps'),
          ],
        }),
    },
  ],
  Crosstraining: [
    {
      id: 'murph',
      name: 'Murph',
      honor: 'Lt. Michael Murphy',
      duration: '45-60 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · MURPH',
          timing: 'Cap 60 min',
          note: '1 mi run + cuerpo + 1 mi run. Rx con chaleco 9/6 kg. Parte las dominadas y push-ups en series de 5-10-15.',
          items: [
            qtyItem('Run', '1 mi'),
            qtyItem('Strict Pull-up', '100 reps'),
            qtyItem('PUSH-UP', '200 reps'),
            qtyItem('Air Squat', '300 reps'),
            qtyItem('Run', '1 mi'),
          ],
        }),
    },
    {
      id: 'chad',
      name: 'Chad',
      honor: 'Chad Wilkinson',
      duration: '35-50 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · CHAD',
          timing: 'Cap 60 min',
          note: '1000 step-ups al cajón 20". Rx 34/15 kg. Alterna piernas cada rep.',
          items: [qtyItem('Weighted Step-up', '1000 reps', '34 kg')],
        }),
    },
    {
      id: 'griff',
      name: 'Griff',
      honor: 'Staff Sgt. Travis L. Griffin',
      duration: '20-30 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · GRIFF',
          note: 'For time. 30 snatches en cada bloque de carrera. Rx 60/42.5 kg.',
          items: [
            qtyItem('Run', '800 m'),
            qtyItem('Squat Snatch', '30 reps', '60 kg'),
            qtyItem('Run', '800 m'),
            qtyItem('Squat Snatch', '30 reps', '60 kg'),
          ],
        }),
    },
    {
      id: 'jerry',
      name: 'Jerry',
      honor: 'GSO1 Jerry D. Wilcox',
      duration: '35-45 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · JERRY',
          note: 'For time. Rx C&J 60/42.5 kg. Mantén ritmo de carrera controlado.',
          items: [
            qtyItem('Run', '1 mi'),
            qtyItem('Clean and Jerk', '50 reps', '60 kg'),
            qtyItem('Run', '250 m'),
            qtyItem('Strict Pull-up', '50 reps'),
          ],
        }),
    },
    {
      id: 'jt',
      name: 'JT',
      honor: 'Petty Officer Jeff Taylor',
      duration: '12-20 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · JT',
          note: '21-15-9. Rx push press 43/30 kg. Escala HSPU con pike o cajón.',
          items: [
            qtyItem('Handstand Push-up', '21-15-9 reps'),
            qtyItem('Push Press', '21-15-9 reps', '43 kg'),
            qtyItem('Ring Dip', '21-15-9 reps'),
          ],
        }),
    },
    {
      id: 'hero',
      name: 'Hero',
      honor: 'Hero (benchmark)',
      duration: '20-30 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · HERO',
          note: 'For time. 1-2-3-4-5-6-7-8-9-10 burpees y deadlift. Rx 95/65 kg.',
          items: [
            qtyItem('Burpee', '1-2-3-4-5-6-7-8-9-10 reps'),
            qtyItem('Deadlift', '1-2-3-4-5-6-7-8-9-10 reps', '95 kg'),
          ],
        }),
    },
    {
      id: 'jackie',
      name: 'Jackie',
      honor: 'Jackie (benchmark)',
      duration: '12-18 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · JACKIE',
          note: 'For time. Rx thruster 43/30 kg. Mantén ritmo de remo controlado.',
          items: [
            qtyItem('Row', '1000 m'),
            qtyItem('THRUSTER BARBELL', '50 reps', '43 kg'),
            qtyItem('Strict Pull-up', '30 reps'),
          ],
        }),
    },
    {
      id: 'coffland',
      name: 'Coffland',
      honor: 'Staff Sgt. Jason Coffland',
      duration: '25-35 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · COFFLAND',
          rounds: '6 rondas',
          note: 'For time. Escala double unders con single unders × 2.',
          items: [
            qtyItem('Double Under', '24 reps'),
            qtyItem('Air Squat', '24 reps'),
            qtyItem('PUSH-UP', '24 reps'),
            qtyItem('Walking Lunge', '24 reps'),
          ],
        }),
    },
    {
      id: 'manion',
      name: 'Manion',
      honor: '1st Lt. Travis Manion',
      duration: '20-28 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · MANION',
          rounds: '5 rondas',
          note: 'For time. Rx back squat 61/43 kg. Corre la primera vuelta a ritmo sostenible.',
          items: [
            qtyItem('Run', '400 m'),
            qtyItem('Back Squat', '29 reps', '61 kg'),
          ],
        }),
    },
    {
      id: 'ship',
      name: 'Ship',
      honor: 'Ship (benchmark)',
      duration: '25-35 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · SHIP',
          rounds: '7 rondas',
          note: 'For time. Rx squat clean 61/43 kg.',
          items: [
            qtyItem('Squat Clean', '7 reps', '61 kg'),
            qtyItem('Burpee', '7 reps'),
            qtyItem('Run', '200 m'),
          ],
        }),
    },
    {
      id: 'bull',
      name: 'Bull',
      honor: 'Bull (benchmark)',
      duration: '30-40 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · BULL',
          note: 'For time. Rx push press 61/43 kg. Alterna carrera y estaciones.',
          items: [
            qtyItem('Run', '400 m'),
            qtyItem('Push Press', '25 reps', '61 kg'),
            qtyItem('Run', '400 m'),
            qtyItem('Strict Pull-up', '25 reps'),
            qtyItem('Run', '400 m'),
            qtyItem('Air Squat', '25 reps'),
          ],
        }),
    },
  ],
  Hype: [
    {
      id: 'fran',
      name: 'Fran',
      honor: 'Fran (benchmark)',
      duration: '4-8 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · FRAN',
          timing: 'Cap 10 min',
          note: '21-15-9 thruster y pull-ups. Rx 43/30 kg. Series cortas desde el principio.',
          items: [
            qtyItem('THRUSTER BARBELL', '21-15-9 reps', '43 kg'),
            qtyItem('Strict Pull-up', '21-15-9 reps'),
          ],
        }),
    },
    {
      id: 'grace',
      name: 'Grace',
      honor: 'Grace (benchmark)',
      duration: '3-6 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · GRACE',
          timing: 'Cap 8 min',
          note: '30 clean and jerk for time. Rx 60/42.5 kg. Toca el suelo y recibe limpio cada rep.',
          items: [qtyItem('Clean and Jerk', '30 reps', '60 kg')],
        }),
    },
    {
      id: 'isabel',
      name: 'Isabel',
      honor: 'Isabel (benchmark)',
      duration: '3-7 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · ISABEL',
          timing: 'Cap 10 min',
          note: '30 snatches for time. Rx 60/42.5 kg. Power o squat según nivel.',
          items: [qtyItem('Squat Snatch', '30 reps', '60 kg')],
        }),
    },
    {
      id: 'helen',
      name: 'Helen',
      honor: 'Helen (benchmark)',
      duration: '10-15 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · HELEN',
          rounds: '3 rondas',
          note: 'For time. Rx kettlebell 24/16 kg. Corre la primera vuelta a ritmo de conversación.',
          items: [
            qtyItem('Run', '400 m'),
            qtyItem('RUSSIAN KTB SWING', '21 reps', '24 kg'),
            qtyItem('Strict Pull-up', '12 reps'),
          ],
        }),
    },
    {
      id: 'badger',
      name: 'Badger',
      honor: 'Mark Urban',
      duration: '25-35 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · BADGER',
          rounds: '3 rondas',
          note: 'For time. Rx back squat 61/43 kg. Burpees completos en cada ronda.',
          items: [
            qtyItem('Back Squat', '30 reps', '61 kg'),
            qtyItem('Burpee', '30 reps'),
            qtyItem('Run', '800 m'),
          ],
        }),
    },
    {
      id: 'diane',
      name: 'Diane',
      honor: 'Diane (benchmark)',
      duration: '6-10 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · DIANE',
          timing: 'Cap 12 min',
          note: '21-15-9 deadlift y HSPU. Rx 102.5/70 kg. Escala HSPU con pike.',
          items: [
            qtyItem('Deadlift', '21-15-9 reps', '102.5 kg'),
            qtyItem('Handstand Push-up', '21-15-9 reps'),
          ],
        }),
    },
    {
      id: 'elizabeth',
      name: 'Elizabeth',
      honor: 'Elizabeth (benchmark)',
      duration: '8-12 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · ELIZABETH',
          timing: 'Cap 15 min',
          note: '21-15-9 squat clean y ring dip. Rx 61/43 kg.',
          items: [
            qtyItem('Squat Clean', '21-15-9 reps', '61 kg'),
            qtyItem('Ring Dip', '21-15-9 reps'),
          ],
        }),
    },
    {
      id: 'amanda',
      name: 'Amanda',
      honor: 'Amanda (benchmark)',
      duration: '8-12 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · AMANDA',
          timing: 'Cap 15 min',
          note: '9-7-5 squat snatch y muscle-up. Rx 43/30 kg.',
          items: [
            qtyItem('Squat Snatch', '9-7-5 reps', '43 kg'),
            qtyItem('Bar Muscle-up', '9-7-5 reps'),
          ],
        }),
    },
    {
      id: 'karen',
      name: 'Karen',
      honor: 'Karen (benchmark)',
      duration: '8-12 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · KAREN',
          timing: 'Cap 15 min',
          note: '150 wall balls for time. Rx 9/6 kg. Series de 15-20 desde el inicio.',
          items: [qtyItem('Wall Ball', '150 reps', '9 kg')],
        }),
    },
    {
      id: 'nasty-girls',
      name: 'Nasty Girls',
      honor: 'Nasty Girls (benchmark)',
      duration: '12-18 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · NASTY GIRLS',
          rounds: '3 rondas',
          note: 'For time. Escala muscle-up con pull-up + dip.',
          items: [
            qtyItem('Air Squat', '50 reps'),
            qtyItem('Bar Muscle-up', '7 reps'),
            qtyItem('BOX JUMP OVER', '10 reps'),
          ],
        }),
    },
    {
      id: 'lynne',
      name: 'Lynne',
      honor: 'Lynne (benchmark)',
      duration: '20-25 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · LYNNE',
          rounds: '5 rondas',
          note: 'Máximo de bench press y pull-ups por ronda. Rx bench 61/43 kg.',
          items: [
            qtyItem('Bench Press', 'max reps', '61 kg'),
            qtyItem('Strict Pull-up', 'max reps'),
          ],
        }),
    },
  ],
  Hyrox: [
    {
      id: 'glen',
      name: 'Glen',
      honor: 'Glen Doherty',
      duration: '25-35 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · GLEN',
          rounds: '7 rondas',
          note: 'For time. Estilo estaciones: gimnástico + locomoción en cada vuelta.',
          items: [
            qtyItem('Chest-to-Bar Pull-up', '11 reps'),
            qtyItem('Walking Lunge', '100 m'),
            qtyItem('PUSH-UP', '11 reps'),
          ],
        }),
    },
    {
      id: 'bert',
      name: 'Bert',
      honor: 'Bertrand Russell',
      duration: '40-55 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · BERT',
          timing: 'Cap 60 min',
          note: 'Chipper con carrera entre bloques. Ritmo constante, no sprintes el primer 400 m.',
          items: [
            qtyItem('Burpee', '50 reps'),
            qtyItem('Run', '400 m'),
            qtyItem('PUSH-UP', '50 reps'),
            qtyItem('Run', '400 m'),
            qtyItem('Air Squat', '50 reps'),
            qtyItem('Run', '400 m'),
            qtyItem('Strict Pull-up', '50 reps'),
            qtyItem('Run', '400 m'),
          ],
        }),
    },
    {
      id: 'kelly',
      name: 'Kelly',
      honor: 'Kelly (benchmark)',
      duration: '20-28 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · KELLY',
          rounds: '5 rondas',
          note: 'For time. Rx wall ball 9/6 kg y cajón 60/50 cm.',
          items: [
            qtyItem('Run', '400 m'),
            qtyItem('BOX JUMP OVER', '30 reps'),
            qtyItem('Wall Ball', '30 reps', '9 kg'),
          ],
        }),
    },
    {
      id: 'whitten',
      name: 'Whitten',
      honor: 'Josh Whitten',
      duration: '35-45 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · WHITTEN',
          rounds: '5 rondas',
          note: 'For time. Rx back squat 112/77 kg y overhead squat 84/61 kg. Calienta bien antes del primer 400 m.',
          items: [
            qtyItem('Run', '400 m'),
            qtyItem('Back Squat', '5 reps', '112 kg'),
            setsItem('Overhead Squat', 1, 3, '84 kg'),
          ],
        }),
    },
    {
      id: 'tom',
      name: 'Tom',
      honor: 'Tom Simpson',
      duration: '30-40 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · TOM',
          note: 'For time. Alterna carrera, kettlebell y dominadas. Rx 2×32/24 kg.',
          items: [
            qtyItem('Run', '200 m'),
            qtyItem('Russian KTB SWING', '25 reps', '2×32 kg'),
            qtyItem('Strict Pull-up', '6 reps'),
            qtyItem('Run', '200 m'),
            qtyItem('Russian KTB SWING', '25 reps', '2×32 kg'),
            qtyItem('Strict Pull-up', '6 reps'),
            qtyItem('Run', '200 m'),
            qtyItem('Russian KTB SWING', '25 reps', '2×32 kg'),
            qtyItem('Strict Pull-up', '6 reps'),
          ],
        }),
    },
    {
      id: 'rhabdo',
      name: 'Rhabdo',
      honor: 'Rhabdo (benchmark)',
      duration: '20-28 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · RHABDO',
          rounds: '3 rondas',
          note: 'For time. Escala back extension con superman.',
          items: [
            qtyItem('Run', '800 m'),
            qtyItem('Back Extension', '50 reps'),
            qtyItem('Sit-up', '50 reps'),
          ],
        }),
    },
    {
      id: 'small',
      name: 'Small',
      honor: 'Small (benchmark)',
      duration: '25-35 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · SMALL',
          rounds: '5 rondas',
          note: 'For time. Alterna carrera y gimnástico.',
          items: [
            qtyItem('Run', '400 m'),
            qtyItem('Strict Pull-up', '10 reps'),
            qtyItem('PUSH-UP', '20 reps'),
          ],
        }),
    },
    {
      id: 'brian',
      name: 'Brian',
      honor: 'Brian (benchmark)',
      duration: '30-40 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · BRIAN',
          note: 'For time. Rx deadlift 112/77 kg. Alterna carrera y peso.',
          items: [
            qtyItem('Run', '400 m'),
            qtyItem('Deadlift', '25 reps', '112 kg'),
            qtyItem('Run', '400 m'),
            qtyItem('Deadlift', '25 reps', '112 kg'),
            qtyItem('Run', '400 m'),
            qtyItem('Deadlift', '25 reps', '112 kg'),
          ],
        }),
    },
    {
      id: 'eric',
      name: 'Eric',
      honor: 'Eric (benchmark)',
      duration: '15-22 min',
      build: () =>
        block(BLOCK.forTime, {
          title: 'HERO · ERIC',
          note: 'For time. Rx deadlift 95/65 kg. Burpees completos.',
          items: [
            qtyItem('Deadlift', '95 reps', '95 kg'),
            qtyItem('Burpee', '95 reps'),
          ],
        }),
    },
    {
      id: 'jag',
      name: 'JAG',
      honor: 'JAG (benchmark)',
      duration: '25-35 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · JAG',
          rounds: '4 rondas',
          note: 'For time. Estilo Hyrox: carrera + estaciones.',
          items: [
            qtyItem('Run', '800 m'),
            qtyItem('Air Squat', '30 reps'),
            qtyItem('PUSH-UP', '30 reps'),
            qtyItem('Walking Lunge', '30 reps'),
          ],
        }),
    },
    {
      id: 'wittman',
      name: 'Wittman',
      honor: 'Wittman (benchmark)',
      duration: '35-45 min',
      build: () =>
        block(BLOCK.roundsForTime, {
          title: 'HERO · WITTMAN',
          rounds: '7 rondas',
          note: 'For time. Rx kettlebell 24/16 kg y wall ball 9/6 kg.',
          items: [
            qtyItem('Russian KTB SWING', '15 reps', '24 kg'),
            qtyItem('Wall Ball', '15 reps', '9 kg'),
            qtyItem('Run', '400 m'),
          ],
        }),
    },
  ],
};
