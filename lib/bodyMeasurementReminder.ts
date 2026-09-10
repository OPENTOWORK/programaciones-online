/** Intervalo entre mediciones corporales para mantener el gráfico de evolución al día. */
export const BODY_MEASUREMENT_REMINDER_DAYS = 30;

const REMINDER_INTERVAL_MS = BODY_MEASUREMENT_REMINDER_DAYS * 24 * 60 * 60 * 1000;

/** Solo para la fase de prueba: usuarios que pueden ver la alerta. */
const REMINDER_TEST_USERS = [
  { name: 'max power', email: 'carlosgarciacano87@gmail.com' },
] as const;

export function isBodyMeasurementReminderTestUser(user: {
  name?: string;
  email?: string;
}): boolean {
  const name = user.name?.trim().toLowerCase() ?? '';
  const email = user.email?.trim().toLowerCase() ?? '';
  return REMINDER_TEST_USERS.some(
    (candidate) => candidate.name === name || candidate.email === email,
  );
}

export function daysSinceBodyMeasurement(lastMeasuredAt?: string): number | undefined {
  if (!lastMeasuredAt) return undefined;
  const elapsedMs = Date.now() - new Date(lastMeasuredAt).getTime();
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return undefined;
  return Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
}

export function isBodyMeasurementReminderDue(lastMeasuredAt?: string): boolean {
  if (!lastMeasuredAt) return true;
  const elapsedMs = Date.now() - new Date(lastMeasuredAt).getTime();
  if (!Number.isFinite(elapsedMs)) return true;
  return elapsedMs >= REMINDER_INTERVAL_MS;
}

/**
 * Muestra el aviso si toca actualizar mediciones (cada 30 días desde la última).
 * Por ahora limitado a usuarios de prueba; quitar el filtro cuando se active para todos.
 */
export function shouldShowBodyMeasurementReminder(
  user: { name?: string; email?: string },
  lastMeasuredAt?: string,
): boolean {
  if (!isBodyMeasurementReminderTestUser(user)) return false;
  return isBodyMeasurementReminderDue(lastMeasuredAt);
}

export function bodyMeasurementReminderMessage(lastMeasuredAt?: string): string {
  const days = daysSinceBodyMeasurement(lastMeasuredAt);
  if (days === undefined) {
    return 'Registra tus medidas corporales para empezar a ver tu evolución en el gráfico de progreso.';
  }
  if (days >= BODY_MEASUREMENT_REMINDER_DAYS) {
    return `Han pasado ${days} días desde tu última medición. Actualiza peso, grasa y composición corporal para que el gráfico de evolución siga siendo útil.`;
  }
  return '';
}
