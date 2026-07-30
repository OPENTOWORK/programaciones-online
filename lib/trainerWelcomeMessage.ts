import type { TrainerMessage } from '@/lib/types';

const demoMessagesByUserId = new Map<string, TrainerMessage[]>();

export function buildSignupWelcomeMessage(name: string) {
  const displayName = name.trim() || 'Usuario';

  return `¡Hola, ${displayName}! Te doy la bienvenida a Training Progline 😊 Soy Carlos, tu entrenador. Para empezar, cuéntame cuál es tu objetivo principal: mejorar tu salud, perder grasa, ganar fuerza o masa muscular, preparar alguna prueba o simplemente sentirte mejor. También puedes indicarme si tienes alguna lesión, limitación o preferencia que deba tener en cuenta.`;
}

export function setDemoWelcomeMessage(userId: string, name: string) {
  demoMessagesByUserId.set(userId, [
    {
      id: `welcome-${userId}`,
      sender: 'trainer',
      text: buildSignupWelcomeMessage(name),
      timestamp: new Date().toISOString(),
    },
  ]);
}

export function getDemoTrainerMessages(userId: string, fallback: TrainerMessage[]) {
  return demoMessagesByUserId.get(userId) ?? fallback;
}
