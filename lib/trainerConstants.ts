import { isAdminRole, isGymRole, isTrainerOnlyRole } from '@/lib/athleteService';
import type { AthletePlanType, UserRole } from '@/lib/types';

export type { AthletePlanType };

export const PERSONALIZED_PLAN_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar un plan de entrenamiento personalizado adaptado a mis objetivos y nivel. ¿Podemos empezar?';

export const PERSONALIZED_GYM_PLAN_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar un plan de entrenamiento personalizado para entrenar en el gimnasio, adaptado a mi objetivo, nivel y disponibilidad. ¿Podemos empezar?';

export const PERSONALIZED_NUTRITION_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar un plan nutricional personalizado adaptado a mis objetivos y hábitos. ¿Podemos empezar?';

export const HOME_TRAINING_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar entrenamiento personal a domicilio en Madrid, adaptado a mi objetivo, nivel y disponibilidad. ¿Podemos empezar?';

export const HOME_TRAINING_STAFF_JOIN_MESSAGE =
  'Hola, me gustaría unirme al equipo para hacerme entrenador a domicilio en Madrid. ¿Podemos hablarlo?';

export const HOME_TRAINING_STAFF_JOIN = {
  title: 'Únete al equipo a domicilio en Madrid',
  text: 'Solicita unirte al equipo para dar entrenamiento personal a domicilio en Madrid.',
  button: 'Solicitar unirme al equipo para hacerme entrenador a domicilio en Madrid',
  prefill: HOME_TRAINING_STAFF_JOIN_MESSAGE,
};

export const GYM_TRAINING_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar una programación para entrenar en mi gimnasio, adaptada a mi objetivo, nivel y equipamiento disponible. ¿Podemos empezar?';

export const GYM_ATHLETE_PROGRAMMING_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar una programación personalizada para los atletas de mi gimnasio. ¿Podemos empezar?';

export const GYM_ATHLETE_NUTRITION_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar información nutricional para atletas de mi gimnasio. Nos gustaría conocer las condiciones y la comisión aplicable. ¿Podemos empezar?';

export type ServicePlanCategory = 'personalized' | 'nutrition' | 'home_training' | 'gym_training';

export const SERVICE_PLAN_CONTENT: Record<
  ServicePlanCategory,
  { title: string; text: string; button: string; prefill: string }
> = {
  personalized: {
    title: 'Aún no tienes un entrenamiento personalizado',
    text: 'Cuéntale a tu entrenador qué buscas y te preparará una programación hecha a tu medida.',
    button: 'Pide tu entrenamiento personalizado',
    prefill: PERSONALIZED_PLAN_REQUEST_MESSAGE,
  },
  nutrition: {
    title: 'Aún no tienes un plan nutricional',
    text: 'Tu entrenador puede diseñarte una pauta nutricional adaptada a tu objetivo, rutina y preferencias.',
    button: 'Pide tu plan nutricional personalizado',
    prefill: PERSONALIZED_NUTRITION_REQUEST_MESSAGE,
  },
  home_training: {
    title: 'Aún no tienes entrenamiento personal a domicilio en Madrid',
    text: 'Solicita entrenamiento personal a domicilio en Madrid, adaptado a tu objetivo, nivel y disponibilidad.',
    button: 'Pide entrenamiento personal a domicilio en Madrid',
    prefill: HOME_TRAINING_REQUEST_MESSAGE,
  },
  gym_training: {
    title: 'Aún no tienes una programación para tu gimnasio',
    text: 'Solicita una programación pensada para el equipamiento y las condiciones de tu gimnasio.',
    button: 'Pide tu programación para gimnasio',
    prefill: GYM_TRAINING_REQUEST_MESSAGE,
  },
};

export const PERSONALIZED_GYM_PLAN_CONTENT = {
  title: 'Plan personalizado para tu gimnasio',
  text: 'Te diseñamos una programación a medida para tu gimnasio.',
  button: 'Pide tu plan para gimnasio',
  prefill: PERSONALIZED_GYM_PLAN_REQUEST_MESSAGE,
};

const GYM_ROLE_SERVICE_PLAN_CONTENT: Partial<
  Record<ServicePlanCategory, { title: string; text: string; button: string; prefill: string }>
> = {
  personalized: {
    title: 'Programación para tus atletas',
    text: 'Crea y asigna planes personalizados a los miembros de tu gimnasio.',
    button: 'Asignar plan personalizado a un atleta',
    prefill: GYM_ATHLETE_PROGRAMMING_REQUEST_MESSAGE,
  },
  nutrition: {
    title: 'Nutrición para tus atletas',
    text: 'Solicita información nutricional para tus miembros. Nuestro equipo la preparará y te indicará la comisión correspondiente.',
    button: 'Solicitar información nutricional',
    prefill: GYM_ATHLETE_NUTRITION_REQUEST_MESSAGE,
  },
  gym_training: PERSONALIZED_GYM_PLAN_CONTENT,
};

export function getServicePlanContent(category: ServicePlanCategory, role?: UserRole) {
  if (isGymRole(role)) {
    const gymContent = GYM_ROLE_SERVICE_PLAN_CONTENT[category];
    if (gymContent) return gymContent;
  }
  return SERVICE_PLAN_CONTENT[category];
}

export function isServicePlanCategory(category?: string): category is ServicePlanCategory {
  return (
    category === 'personalized' ||
    category === 'nutrition' ||
    category === 'home_training' ||
    category === 'gym_training'
  );
}

/** Nutrición, domicilio y gimnasio: el entrenador las consume como atleta. */
export function isAthleteFacingServiceCategory(
  category?: string,
): category is Exclude<ServicePlanCategory, 'personalized'> {
  return category === 'nutrition' || category === 'home_training' || category === 'gym_training';
}

/** Categorías en las que el rol gimnasio crea y asigna planes a sus miembros vinculados. */
export function isGymAthletePlanStaffCategory(category?: string): boolean {
  return category === 'personalized';
}

/** El administrador sigue viendo herramientas de staff; el entrenador, la vista de atleta en esas categorías. */
export function usesAthleteServiceView(role?: UserRole, category?: string): boolean {
  if (isAdminRole(role)) return false;
  if (isGymRole(role) && isGymAthletePlanStaffCategory(category)) return false;
  if (isTrainerOnlyRole(role)) return isAthleteFacingServiceCategory(category);
  return true;
}

export const ATHLETE_PLAN_TYPE_LABELS: Record<AthletePlanType, string> = {
  personalized: 'Plan personalizado',
  nutrition: 'Plan nutricional',
  home_training: 'Entrenamiento a domicilio en Madrid',
  gym_training: 'Programación para gimnasio',
};

export const CREATE_ATHLETE_PLAN_LABELS: Record<AthletePlanType, string> = {
  personalized: 'Crear plan personalizado',
  nutrition: 'Crear plan nutricional',
  home_training: 'Crear entrenamiento a domicilio en Madrid',
  gym_training: 'Crear programación para gimnasio',
};

export function isAthletePlanType(value?: string | null): value is AthletePlanType {
  return (
    value === 'personalized' ||
    value === 'nutrition' ||
    value === 'home_training' ||
    value === 'gym_training'
  );
}

/** Planes con sesiones de entrenamiento (no nutrición ni calendario a domicilio). */
export function isSessionBasedAthletePlanType(planType?: AthletePlanType | null): boolean {
  return planType === 'personalized' || planType === 'gym_training';
}
