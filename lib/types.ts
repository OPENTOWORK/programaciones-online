import type { AppIconName } from '@/constants/icons';
import type { SessionSchedule } from '@/lib/sessionSchedule';

export type FitnessLevel = 'principiante' | 'intermedio' | 'avanzado';
export type ProgramGoal = 'fuerza' | 'hipertrofia' | 'pérdida de grasa' | 'rendimiento' | 'movilidad';
export type ProgramDuration = '4 semanas' | '8 semanas' | '12 semanas';
export type ProgramStatus = 'disponible' | 'activa' | 'bloqueada' | 'personalizada';
export type ProgramCategory =
  | 'standard'
  | 'hype'
  | 'personalized'
  | 'nutrition'
  | 'home_training'
  | 'gym_training';
export type UserRole = 'atleta' | 'entrenador';

export type ExerciseMetricType = 'reps' | 'rir' | 'cal' | 'lbs';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  metricType?: ExerciseMetricType;
  maleTarget?: string;
  femaleTarget?: string;
  aimharderEjerId?: number;
  youtubeVideoId?: string;
}

export interface Workout {
  id: string;
  programId: string;
  weekNumber: number;
  dayLabel: string;
  name: string;
  estimatedDuration: string;
  warmup: string;
  main: string;
  core?: string;
  cooldown: string;
  exercises: Exercise[];
  workoutDate?: string;
  schedule?: SessionSchedule;
}

export interface ProgramWeek {
  id: string;
  number: number;
  title: string;
  sessionIds: string[];
}

export interface Program {
  id: string;
  name: string;
  planId?: string;
  category: ProgramCategory;
  level: FitnessLevel;
  duration: ProgramDuration;
  goal: ProgramGoal;
  sessionsPerWeek: number;
  status: ProgramStatus;
  icon: AppIconName;
  description: string;
  equipment: string[];
  trainingDays: string[];
  weeks: ProgramWeek[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  fitnessLevel?: FitnessLevel;
  mainGoal?: ProgramGoal;
  height?: number;
  weight?: number;
  injuries?: string;
  currentProgramId?: string;
  currentProgram?: UserActiveProgram;
  currentPrograms?: UserActiveProgram[];
  avatarInitials: string;
}

export interface UserActiveProgram {
  id: string;
  name: string;
  duration: string;
  sessionsPerWeek: number;
  icon?: string;
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  workoutName: string;
  completedAt: string;
  duration: string;
}

export interface ProgressData {
  weeklyCompleted: number;
  weeklyTarget: number;
  monthlyCompleted: number;
  monthlyTarget: number;
  streak: number;
  totalSessions: number;
  history: WorkoutLog[];
  motivationalStatus: string;
}

export interface TrainerMessage {
  id: string;
  sender: 'user' | 'trainer';
  text: string;
  timestamp: string;
  /** Los mensajes originados en un feedback del entrenador se marcan para diferenciarlos en el chat. */
  origin?: 'chat' | 'feedback';
  attachments?: TrainerFeedbackAttachment[];
}

export interface AthleteAlertSummary {
  chatCount: number;
  sessionCount: number;
  intakeChanged: boolean;
  total: number;
}

export type TrainerFeedbackAttachmentKind = 'video' | 'audio';

export interface TrainerFeedbackAttachment {
  id: string;
  feedbackId: string;
  kind: TrainerFeedbackAttachmentKind;
  fileName: string;
  mimeType: string;
  url: string;
  durationSeconds?: number;
  createdAt: string;
}

export interface TrainerAthleteFeedback {
  id: string;
  trainerId: string;
  /** Entrenador que lo envió. El feedback es común a todo el equipo. */
  trainerName?: string;
  athleteId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  attachments: TrainerFeedbackAttachment[];
}

export interface AthleteSummary {
  id: string;
  name: string;
  email: string;
  fitnessLevel?: FitnessLevel;
  mainGoal?: ProgramGoal;
  height?: number;
  weight?: number;
  injuries?: string;
  avatarInitials: string;
  currentProgramName?: string;
  alerts?: AthleteAlertSummary;
  /** Rol actual en la app. Solo se rellena donde puede diferir de 'atleta' (tablero CRM). */
  role?: UserRole;
  /** @deprecated Use alerts instead. */
  unansweredCount?: number;
}

export type AthletePlanType = 'personalized' | 'nutrition';

export type NutritionWeekDay =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export interface NutritionFoodItem {
  id: string;
  name: string;
  quantity: string;
  notes?: string;
}

export interface NutritionMeal {
  id: string;
  name: string;
  time?: string;
  day?: NutritionWeekDay;
  items: NutritionFoodItem[];
}

export interface NutritionMacros {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}

export interface NutritionPlanData {
  macros?: NutritionMacros;
  meals: NutritionMeal[];
  hydration?: string;
  supplements?: string;
  notes?: string;
}

export interface AthletePlan {
  id: string;
  athleteId: string;
  athleteName?: string;
  trainerId: string;
  planType: AthletePlanType;
  title: string;
  content: string;
  planGroupId?: string;
  sessionNumber?: number;
  nutritionData?: NutritionPlanData;
  createdAt: string;
  pdfFileName?: string;
  pdfUrl?: string;
}

export interface CrmStage {
  id: string;
  name: string;
  position: number;
  /** Si está definido, mover un lead a esta columna le asigna ese rol en la app. */
  roleSlug?: UserRole;
}

export interface CrmLeadPosition {
  stageId: string;
  position: number;
}

export type CrmActivityKind = 'note' | 'stage_change' | 'plan_assigned' | 'message_sent';

export interface CrmActivityEntry {
  id: string;
  kind: CrmActivityKind;
  message: string;
  createdAt: string;
  /** Entrenador que la registró. El historial es común a todo el equipo. */
  trainerName?: string;
}

export type IntakeTrainingPlace = 'gimnasio' | 'casa' | 'ambas';

export const INTAKE_GOAL_OPTIONS = [
  'Pérdida de peso',
  'Ganancia de masa muscular',
  'Mejorar resistencia cardiovascular',
  'Tonificar',
  'Aumentar flexibilidad',
  'Aumento de fuerza',
  'Rehabilitación o prevención de lesiones',
] as const;

export type IntakeGoal = (typeof INTAKE_GOAL_OPTIONS)[number];

export interface AthleteIntakeForm {
  goals: string[];
  goalsOther?: string;
  experience?: string;
  trainingPlace?: IntakeTrainingPlace;
  equipment?: string;
  availability?: string;
  pushupsReps?: number;
  squatsReps?: number;
  pullupsReps?: number;
  hasInjuries?: boolean;
  injuriesDetail?: string;
  takesMedication?: boolean;
  hadSurgery?: boolean;
  hasMedicalCondition?: boolean;
  completedAt?: string;
  updatedAt?: string;
}

export interface ActiveProgramSummary {
  program: Program;
  nextWorkout: Workout;
  completedSessions: number;
  totalSessions: number;
}
