import type { AthletePlanType } from '@/lib/types';

export type { AthletePlanType };

export const PERSONALIZED_PLAN_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar un plan de entrenamiento personalizado adaptado a mis objetivos y nivel. ¿Podemos empezar?';

export const PERSONALIZED_GYM_PLAN_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar un plan de entrenamiento personalizado para entrenar en el gimnasio, adaptado a mi objetivo, nivel y disponibilidad. ¿Podemos empezar?';

export const PERSONALIZED_NUTRITION_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar un plan nutricional personalizado adaptado a mis objetivos y hábitos. ¿Podemos empezar?';

export const HOME_TRAINING_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar entrenamiento personal en mi domicilio adaptado a mi objetivo, nivel y disponibilidad. ¿Podemos empezar?';

export const GYM_TRAINING_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar una programación para entrenar en mi gimnasio, adaptada a mi objetivo, nivel y equipamiento disponible. ¿Podemos empezar?';

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
    title: 'Aún no tienes entrenamiento personal en tu domicilio',
    text: 'Solicita entrenamiento personal a domicilio, adaptado a tu objetivo, nivel y disponibilidad.',
    button: 'Pide entrenamiento personal a domicilio',
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

export function isServicePlanCategory(category?: string): category is ServicePlanCategory {
  return (
    category === 'personalized' ||
    category === 'nutrition' ||
    category === 'home_training' ||
    category === 'gym_training'
  );
}

export const ATHLETE_PLAN_TYPE_LABELS: Record<AthletePlanType, string> = {
  personalized: 'Plan personalizado',
  nutrition: 'Plan nutricional',
  home_training: 'Entrenamiento a domicilio',
  gym_training: 'Programación para gimnasio',
};

export const CREATE_ATHLETE_PLAN_LABELS: Record<AthletePlanType, string> = {
  personalized: 'Crear plan personalizado',
  nutrition: 'Crear plan nutricional',
  home_training: 'Crear entrenamiento a domicilio',
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
