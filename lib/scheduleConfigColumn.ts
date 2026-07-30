export function isMissingScheduleConfigError(message?: string | null) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes('schedule_config') && normalized.includes('schema cache');
}
