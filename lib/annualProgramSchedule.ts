import type { SessionSchedule } from '@/lib/sessionSchedule';
import { toWeekdayIndex } from '@/lib/sessionSchedule';

export const ANNUAL_TEMPLATE_YEAR = 2000;

export function isAnnualTemplateDate(dateStr?: string | null) {
  return Boolean(dateStr?.startsWith(`${ANNUAL_TEMPLATE_YEAR}-`));
}

export function toAnnualTemplateDate(date: Date | string) {
  const value = typeof date === 'string' ? new Date(`${date}T12:00:00`) : date;
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${ANNUAL_TEMPLATE_YEAR}-${month}-${day}`;
}

export function isWeekdayDate(date: Date | string) {
  const value = typeof date === 'string' ? new Date(`${date}T12:00:00`) : date;
  const day = value.getDay();
  return day !== 0 && day !== 6;
}

export function annualScheduleForTemplateDate(templateDate: string): SessionSchedule {
  const anchor = new Date(`${templateDate}T12:00:00`);
  return {
    weekdays: [toWeekdayIndex(anchor)],
    recurrence: 'yearly',
    startDate: templateDate,
  };
}

export function annualWorkoutOccursOnDate(templateDate: string | undefined, date: Date) {
  if (!templateDate || !isAnnualTemplateDate(templateDate)) return false;
  if (!isWeekdayDate(date)) return false;

  const anchor = new Date(`${templateDate}T12:00:00`);
  return date.getMonth() === anchor.getMonth() && date.getDate() === anchor.getDate();
}
