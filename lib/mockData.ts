import type {
  ActiveProgramSummary,
  AthletePlan,
  AthleteSummary,
  Program,
  ProgressData,
  TrainerMessage,
  UserProfile,
  Workout,
} from './types';

export const DEMO_USER = {
  email: 'demo@programaciones.online',
  password: 'demo1234',
};

export const DEMO_TRAINER = {
  email: 'entrenador@programaciones.online',
  password: 'demo1234',
};

export const mockUser: UserProfile = {
  id: 'user-demo-1',
  name: 'Carlos Mendoza',
  email: DEMO_USER.email,
  fitnessLevel: 'intermedio',
  mainGoal: 'hipertrofia',
  height: 178,
  weight: 78.5,
  injuries: 'Molestia leve en hombro derecho',
  currentProgramId: 'prog-hype-1',
  avatarInitials: 'CM',
};

export const mockTrainerUser: UserProfile = {
  id: 'trainer-demo-1',
  name: 'Laura Vega',
  email: DEMO_TRAINER.email,
  role: 'administrador',
  avatarInitials: 'LV',
};

export const mockAthletes: AthleteSummary[] = [
  {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    fitnessLevel: mockUser.fitnessLevel,
    mainGoal: mockUser.mainGoal,
    height: mockUser.height,
    weight: mockUser.weight,
    injuries: mockUser.injuries,
    avatarInitials: mockUser.avatarInitials,
    currentProgramName: 'HY-PE Intensivo',
  },
];

export const mockAthletePlans: AthletePlan[] = [
  {
    id: 'plan-demo-personalized',
    athleteId: mockUser.id,
    athleteName: mockUser.name,
    trainerId: mockTrainerUser.id,
    planType: 'personalized',
    title: 'Fuerza hombro-friendly',
    content:
      'Semana 1\n\nLunes: Press banca con mancuernas 4x8-10, Press militar 3x10, Fondos asistidos 3x8.\n\nMiércoles: Remo con mancuernas 4x10, Jalón al pecho 3x12, Curl 3x12.\n\nViernes: Sentadilla 4x6-8, Peso muerto rumano 3x10, Core 3x12.',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
];

export const mockWorkouts: Workout[] = [
  {
    id: 'workout-1',
    programId: 'prog-hype-1',
    weekNumber: 1,
    dayLabel: 'Lunes',
    name: 'Push Power',
    estimatedDuration: '55 min',
    warmup: '5 min de movilidad de hombros + 2 series ligeras de press.',
    main: 'Foco en empuje horizontal y vertical con cargas moderadas-altas.',
    core: '3 series de plancha con extensión.',
    cooldown: 'Estiramientos de pecho, tríceps y dorsal.',
    exercises: [
      { id: 'ex-1', name: 'Press banca con mancuernas', sets: 4, reps: '8-10', rest: '90s', notes: 'Control en la bajada' },
      { id: 'ex-2', name: 'Press militar', sets: 3, reps: '10-12', rest: '75s' },
      { id: 'ex-3', name: 'Fondos en paralelas', sets: 3, reps: '8-12', rest: '90s' },
      { id: 'ex-4', name: 'Elevaciones laterales', sets: 3, reps: '15', rest: '60s' },
      { id: 'ex-5', name: 'Tríceps en polea', sets: 3, reps: '12-15', rest: '60s' },
    ],
  },
  {
    id: 'workout-2',
    programId: 'prog-hype-1',
    weekNumber: 1,
    dayLabel: 'Miércoles',
    name: 'Pull Density',
    estimatedDuration: '50 min',
    warmup: 'Remo ligero + activación de escápulas.',
    main: 'Tracción vertical y horizontal con enfoque en densidad.',
    cooldown: 'Foam rolling de espalda.',
    exercises: [
      { id: 'ex-6', name: 'Dominadas asistidas', sets: 4, reps: '6-8', rest: '120s' },
      { id: 'ex-7', name: 'Remo con barra', sets: 4, reps: '8-10', rest: '90s' },
      { id: 'ex-8', name: 'Jalón al pecho', sets: 3, reps: '12', rest: '75s' },
      { id: 'ex-9', name: 'Curl con mancuernas', sets: 3, reps: '12', rest: '60s' },
    ],
  },
  {
    id: 'workout-3',
    programId: 'prog-hype-1',
    weekNumber: 1,
    dayLabel: 'Viernes',
    name: 'Legs & Engine',
    estimatedDuration: '60 min',
    warmup: 'Bici estática 5 min + sentadillas sin carga.',
    main: 'Pierna + acondicionamiento metabólico.',
    core: 'Pallof press 3x12 por lado.',
    cooldown: 'Estiramientos de cuádriceps e isquios.',
    exercises: [
      { id: 'ex-10', name: 'Sentadilla trasera', sets: 4, reps: '6-8', rest: '120s' },
      { id: 'ex-11', name: 'Peso muerto rumano', sets: 3, reps: '10', rest: '90s' },
      { id: 'ex-12', name: 'Zancadas caminando', sets: 3, reps: '12 por pierna', rest: '75s' },
      { id: 'ex-13', name: 'Farmer carry', sets: 3, reps: '40m', rest: '90s' },
    ],
  },
  {
    id: 'workout-4',
    programId: 'prog-std-1',
    weekNumber: 1,
    dayLabel: 'Martes',
    name: 'Full Body Base',
    estimatedDuration: '45 min',
    warmup: 'Movilidad articular general.',
    main: 'Circuito full body para base de fuerza.',
    cooldown: 'Respiración diafragmática 3 min.',
    exercises: [
      { id: 'ex-14', name: 'Goblet squat', sets: 3, reps: '12', rest: '60s' },
      { id: 'ex-15', name: 'Press con mancuernas', sets: 3, reps: '10', rest: '75s' },
      { id: 'ex-16', name: 'Remo en máquina', sets: 3, reps: '12', rest: '60s' },
      { id: 'ex-17', name: 'Plancha', sets: 3, reps: '45s', rest: '45s' },
    ],
  },
  {
    id: 'workout-5',
    programId: 'prog-std-2',
    weekNumber: 1,
    dayLabel: 'Jueves',
    name: 'Upper Hypertrophy',
    estimatedDuration: '50 min',
    warmup: 'Band pull-aparts + rotaciones.',
    main: 'Volumen moderado tren superior.',
    cooldown: 'Estiramientos guiados.',
    exercises: [
      { id: 'ex-18', name: 'Press inclinado', sets: 4, reps: '10', rest: '75s' },
      { id: 'ex-19', name: 'Remo unilateral', sets: 3, reps: '12', rest: '60s' },
      { id: 'ex-20', name: 'Face pull', sets: 3, reps: '15', rest: '45s' },
    ],
  },
  {
    id: 'workout-6',
    programId: 'prog-pers-1',
    weekNumber: 1,
    dayLabel: 'Sábado',
    name: 'Sesión Personalizada A',
    estimatedDuration: '40 min',
    warmup: 'Activación específica según evaluación.',
    main: 'Bloque adaptado a limitaciones de hombro.',
    cooldown: 'Movilidad escapular.',
    exercises: [
      { id: 'ex-21', name: 'Press landmine', sets: 3, reps: '10', rest: '75s', notes: 'Sin dolor en hombro' },
      { id: 'ex-22', name: 'Remo en polea baja', sets: 3, reps: '12', rest: '60s' },
      { id: 'ex-23', name: 'Curl martillo', sets: 3, reps: '12', rest: '60s' },
    ],
  },
];

const createWeeks = (programId: string, sessionIds: string[], count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${programId}-week-${i + 1}`,
    number: i + 1,
    title: `Semana ${i + 1}`,
    sessionIds: i === 0 ? sessionIds : sessionIds.map((id) => `${id}-w${i + 1}`),
  }));

export const mockPrograms: Program[] = [
  {
    id: 'prog-std-1',
    name: 'Fuerza Fundamental',
    category: 'standard',
    level: 'principiante',
    duration: '8 semanas',
    goal: 'fuerza',
    sessionsPerWeek: 3,
    status: 'disponible',
    icon: 'strength',
    description: 'Programa base para construir fuerza con técnica sólida y progresión controlada.',
    equipment: ['Mancuernas', 'Barra', 'Banco'],
    trainingDays: ['Martes', 'Jueves', 'Sábado'],
    weeks: createWeeks('prog-std-1', ['workout-4'], 8),
  },
  {
    id: 'prog-std-2',
    name: 'Hipertrofia Clásica',
    category: 'standard',
    level: 'principiante',
    duration: '12 semanas',
    goal: 'hipertrofia',
    sessionsPerWeek: 4,
    status: 'disponible',
    icon: 'hypertrophy',
    description: 'Rutina clásica de hipertrofia con división upper/lower y volumen progresivo.',
    equipment: ['Mancuernas', 'Poleas', 'Máquinas'],
    trainingDays: ['Lunes', 'Martes', 'Jueves', 'Viernes'],
    weeks: createWeeks('prog-std-2', ['workout-5'], 12),
  },
  {
    id: 'prog-std-3',
    name: 'Movilidad & Estabilidad',
    category: 'standard',
    level: 'principiante',
    duration: '4 semanas',
    goal: 'movilidad',
    sessionsPerWeek: 3,
    status: 'disponible',
    icon: 'mobility',
    description: 'Mejora tu rango de movimiento y control corporal con sesiones accesibles.',
    equipment: ['Banda elástica', 'Foam roller'],
    trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
    weeks: createWeeks('prog-std-3', ['workout-4'], 4),
  },
  {
    id: 'prog-hype-1',
    name: 'HYPE Beast Mode',
    category: 'hype',
    level: 'avanzado',
    duration: '8 semanas',
    goal: 'rendimiento',
    sessionsPerWeek: 5,
    status: 'activa',
    icon: 'intense',
    description: 'Programación intensiva para atletas con experiencia. Alta demanda y poca concesión.',
    equipment: ['Barra', 'Discos', 'Rack', 'Kettlebell'],
    trainingDays: ['Lunes', 'Martes', 'Miércoles', 'Viernes', 'Sábado'],
    weeks: createWeeks('prog-hype-1', ['workout-1', 'workout-2', 'workout-3'], 8),
  },
  {
    id: 'prog-hype-2',
    name: 'Shred Protocol',
    category: 'hype',
    level: 'intermedio',
    duration: '4 semanas',
    goal: 'pérdida de grasa',
    sessionsPerWeek: 4,
    status: 'disponible',
    icon: 'shred',
    description: 'Circuitos metabólicos y fuerza para maximizar quema de grasa sin perder músculo.',
    equipment: ['Mancuernas', 'Cuerda', 'Banco'],
    trainingDays: ['Lunes', 'Martes', 'Jueves', 'Sábado'],
    weeks: createWeeks('prog-hype-2', ['workout-1', 'workout-3'], 4),
  },
  {
    id: 'prog-hype-3',
    name: 'Power Surge',
    category: 'hype',
    level: 'avanzado',
    duration: '12 semanas',
    goal: 'fuerza',
    sessionsPerWeek: 4,
    status: 'bloqueada',
    icon: 'power',
    description: 'Desbloquea al completar HYPE Beast Mode. Fuerza explosiva y potencia.',
    equipment: ['Barra', 'Discos', 'Cajón pliométrico'],
    trainingDays: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'],
    weeks: createWeeks('prog-hype-3', ['workout-1'], 12),
  },
  {
    id: 'prog-pers-1',
    name: 'Plan Carlos — Hombro Safe',
    category: 'personalized',
    level: 'intermedio',
    duration: '8 semanas',
    goal: 'hipertrofia',
    sessionsPerWeek: 3,
    status: 'personalizada',
    icon: 'personal',
    description: 'Programación diseñada por tu entrenador adaptada a tu limitación de hombro.',
    equipment: ['Mancuernas', 'Poleas', 'Landmine'],
    trainingDays: ['Martes', 'Jueves', 'Sábado'],
    weeks: createWeeks('prog-pers-1', ['workout-6'], 8),
  },
  {
    id: 'prog-pers-2',
    name: 'Plan Carlos — Fase 2',
    category: 'personalized',
    level: 'intermedio',
    duration: '8 semanas',
    goal: 'rendimiento',
    sessionsPerWeek: 4,
    status: 'bloqueada',
    icon: 'phase',
    description: 'Siguiente fase personalizada. Se desbloquea tras completar la fase actual.',
    equipment: ['Barra', 'Mancuernas', 'Poleas'],
    trainingDays: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'],
    weeks: createWeeks('prog-pers-2', ['workout-6'], 8),
  },
];

export const mockProgress: ProgressData = {
  weeklyCompleted: 3,
  weeklyTarget: 5,
  monthlyCompleted: 11,
  monthlyTarget: 20,
  streak: 5,
  totalSessions: 5,
  history: [
    { id: 'log-1', workoutId: 'workout-1', workoutName: 'Push Power', completedAt: '2026-06-05', duration: '52 min' },
    { id: 'log-2', workoutId: 'workout-2', workoutName: 'Pull Density', completedAt: '2026-06-03', duration: '48 min' },
    { id: 'log-3', workoutId: 'workout-3', workoutName: 'Legs & Engine', completedAt: '2026-06-01', duration: '58 min' },
    { id: 'log-4', workoutId: 'workout-1', workoutName: 'Push Power', completedAt: '2026-05-29', duration: '55 min' },
    { id: 'log-5', workoutId: 'workout-2', workoutName: 'Pull Density', completedAt: '2026-05-27', duration: '50 min' },
  ],
  motivationalStatus: 'Vas muy bien — mantén el ritmo esta semana',
};

export const mockTrainerMessages: TrainerMessage[] = [
  {
    id: 'msg-1',
    sender: 'trainer',
    text: '¡Hola Carlos! He revisado tu adherencia y vas genial. Recuerda calentar bien el hombro antes del press.',
    timestamp: '2026-06-04T10:30:00',
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Gracias! En el press landmine no siento molestia. ¿Puedo subir carga la próxima semana?',
    timestamp: '2026-06-04T11:15:00',
  },
  {
    id: 'msg-3',
    sender: 'trainer',
    text: 'Perfecto. Sube 2.5kg solo si mantienes la técnica. Te veo el viernes para revisar la sesión de pierna.',
    timestamp: '2026-06-04T14:00:00',
  },
];

export function getActiveProgramSummary(): ActiveProgramSummary | null {
  const program = mockPrograms.find((p) => p.id === mockUser.currentProgramId);
  if (!program) return null;

  const nextWorkout = mockWorkouts.find((w) => w.programId === program.id) ?? mockWorkouts[0];

  return {
    program,
    nextWorkout,
    completedSessions: 7,
    totalSessions: program.weeks.length * program.sessionsPerWeek,
  };
}

export function getProgramById(id: string): Program | undefined {
  return mockPrograms.find((p) => p.id === id);
}

export function getWorkoutById(id: string): Workout | undefined {
  return mockWorkouts.find((w) => w.id === id);
}

export function getProgramsByCategory(
  category: Program['category'],
  source: Program[] = mockPrograms,
): Program[] {
  return source.filter((program) => program.category === category);
}
