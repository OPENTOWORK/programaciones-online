import type { AthletePlanType } from '@/lib/types';

export type { AthletePlanType };

export const PERSONALIZED_PLAN_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar un plan de entrenamiento personalizado adaptado a mis objetivos y nivel. ¿Podemos empezar?';

export const PERSONALIZED_NUTRITION_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar un plan nutricional personalizado adaptado a mis objetivos y hábitos. ¿Podemos empezar?';

export const HOME_TRAINING_REQUEST_MESSAGE =
  'Hola, me gustaría solicitar entrenamiento personal en gimnasio o a domicilio adaptado a mi objetivo, nivel y disponibilidad. ¿Podemos empezar?';

export type ServicePlanCategory = 'personalized' | 'nutrition' | 'home_training';

export const SERVICE_PLAN_CONTENT: Record<
  ServicePlanCategory,
  { title: string; text: string; button: string; prefill: string }
> = {
  personalized: {
    title: 'Aún no tienes un plan personalizado',
    text: 'Cuéntale a tu entrenador qué buscas y te preparará una programación hecha a tu medida.',
    button: 'Pide tu plan de entrenamiento personalizado',
    prefill: PERSONALIZED_PLAN_REQUEST_MESSAGE,
  },
  nutrition: {
    title: 'Aún no tienes un plan nutricional',
    text: 'Tu entrenador puede diseñarte una pauta nutricional adaptada a tu objetivo, rutina y preferencias.',
    button: 'Pide tu plan nutricional personalizado',
    prefill: PERSONALIZED_NUTRITION_REQUEST_MESSAGE,
  },
  home_training: {
    title: 'Aún no tienes entrenamiento personal',
    text: 'Solicita entrenamiento personal en gimnasios o a domicilio, adaptado a tu objetivo, nivel y disponibilidad.',
    button: 'Pide entrenamiento personal',
    prefill: HOME_TRAINING_REQUEST_MESSAGE,
  },
};

export function isServicePlanCategory(category?: string): category is ServicePlanCategory {
  return category === 'personalized' || category === 'nutrition' || category === 'home_training';
}

export const ATHLETE_PLAN_TYPE_LABELS: Record<AthletePlanType, string> = {
  personalized: 'Plan personalizado',
  nutrition: 'Plan nutricional',
};
