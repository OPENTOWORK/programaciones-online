import type { AppIconName } from '@/constants/icons';

export type FitnessLevel = 'principiante' | 'intermedio' | 'avanzado';
export type ProgramGoal = 'fuerza' | 'hipertrofia' | 'pérdida de grasa' | 'rendimiento' | 'movilidad';
export type ProgramDuration = '4 semanas' | '8 semanas' | '12 semanas';
export type ProgramStatus = 'disponible' | 'activa' | 'bloqueada' | 'personalizada';
export type ProgramCategory = 'standard' | 'hype' | 'personalized' | 'nutrition' | 'home_training';
export type UserRole = 'atleta' | 'entrenador';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
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
  unansweredCount?: number;
}

export type AthletePlanType = 'personalized' | 'nutrition';

export interface AthletePlan {
  id: string;
  athleteId: string;
  athleteName?: string;
  trainerId: string;
  planType: AthletePlanType;
  title: string;
  content: string;
  createdAt: string;
  pdfFileName?: string;
  pdfUrl?: string;
}

export interface ActiveProgramSummary {
  program: Program;
  nextWorkout: Workout;
  completedSessions: number;
  totalSessions: number;
}
