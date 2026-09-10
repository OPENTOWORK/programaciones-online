import { createAthletePlan, deleteAthletePlan } from '@/lib/athletePlanService';
import type { PickedPlanPdf } from '@/lib/planPdfPicker';
import { serializePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import { applyPlanValidityToContent } from '@/lib/planValidity';
import { extractPdfTextFromUri, parseWeeklyPdfText } from '@/lib/planPdfParser';
import {
  formatScheduleSummary,
  toLocalDateString,
  type WeekdayIndex,
} from '@/lib/sessionSchedule';
import {
  isCalisthenicsPlanText,
  serializeCalisthenicsPlanMain,
} from '@/lib/calisthenicsPlanTextParser';
import { createEmptyBlock, serializeWorkoutBlocks } from '@/lib/workoutBlockBuilder';
import { createEmptySessionDraft, type SessionDraft } from '@/lib/trainerSessionDraft';
import type { AthletePlan } from '@/lib/types';

const DEFAULT_PDF_WEEKDAYS: WeekdayIndex[] = [0, 1, 3, 4];

export function resolvePlanPdfWeekStartDate(scheduleStartDate?: string, fallback = new Date()) {
  const base = scheduleStartDate ? new Date(`${scheduleStartDate}T12:00:00`) : fallback;
  return getMonday(base);
}

function getMonday(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(monday.getDate() + diff);
  monday.setHours(12, 0, 0, 0);
  return monday;
}

function dateForWeekday(weekMonday: Date, weekday: WeekdayIndex) {
  const date = new Date(weekMonday);
  date.setDate(date.getDate() + weekday);
  return date;
}

function buildDraftForDay(
  day: { weekday: WeekdayIndex; label: string; text: string },
  weekMonday: Date,
  sessionNumber: number,
) {
  const scheduleDate = dateForWeekday(weekMonday, day.weekday);
  const schedule = {
    weekdays: [day.weekday] as WeekdayIndex[],
    recurrence: 'once' as const,
    startDate: toLocalDateString(scheduleDate),
  };

  return {
    ...createEmptySessionDraft(sessionNumber - 1),
    name: day.label,
    estimatedDuration: '60 min',
    dayLabel: formatScheduleSummary(schedule),
    schedule,
    main: isCalisthenicsPlanText(day.text)
      ? serializeCalisthenicsPlanMain(day.text)
      : serializeWorkoutBlocks([
          {
            ...createEmptyBlock('free_text'),
            timing: day.text.trim(),
            items: [],
          },
        ]),
  };
}

export async function previewPlanPdfSessions(input: {
  pdf: PickedPlanPdf;
  weekStartDate?: Date;
  targetWeekdays?: WeekdayIndex[];
}): Promise<{ sessions: SessionDraft[]; error?: string }> {
  try {
    const extracted = await extractPdfTextFromUri(input.pdf.uri);
    const targetWeekdays = input.targetWeekdays ?? DEFAULT_PDF_WEEKDAYS;
    const parsedDays = parseWeeklyPdfText(extracted.text, {
      pageTexts: extracted.pageTexts,
      targetWeekdays,
    });

    if (parsedDays.length === 0) {
      return {
        sessions: [],
        error:
          'No se encontraron días en el PDF. Usa títulos como Lunes/Martes, Día 1/Día 2 o un día por página.',
      };
    }

    const weekMonday = getMonday(input.weekStartDate ?? new Date());
    const sessions = parsedDays.map((day, index) =>
      buildDraftForDay(day, weekMonday, index + 1),
    );

    return { sessions };
  } catch (error) {
    return {
      sessions: [],
      error: error instanceof Error ? error.message : 'No se pudo leer el PDF',
    };
  }
}

export async function importAthletePlanPdfToCalendar(input: {
  athleteId: string;
  trainerId: string;
  title: string;
  pdf: PickedPlanPdf;
  athleteName?: string;
  planGroupId?: string;
  weekStartDate?: Date;
  replacePlanIds?: string[];
  targetWeekdays?: WeekdayIndex[];
}): Promise<{ plans: AthletePlan[]; error?: string }> {
  try {
    const preview = await previewPlanPdfSessions({
      pdf: input.pdf,
      weekStartDate: input.weekStartDate,
      targetWeekdays: input.targetWeekdays,
    });

    if (preview.error) {
      return { plans: [], error: preview.error };
    }

    const created: AthletePlan[] = [];
    let planGroupId = input.planGroupId;

    for (const planId of input.replacePlanIds ?? []) {
      await deleteAthletePlan(planId);
    }

    const weekMonday = getMonday(input.weekStartDate ?? new Date());
    const planValidity = {
      validFrom: toLocalDateString(weekMonday),
      validUntil: null as const,
    };

    for (const [index, draft] of preview.sessions.entries()) {
      const sessionNumber = index + 1;
      const serialized = serializePersonalizedPlanContent(draft, sessionNumber);
      const plan = await createAthletePlan({
        athleteId: input.athleteId,
        trainerId: input.trainerId,
        planType: 'personalized',
        title: input.title,
        content: applyPlanValidityToContent(serialized, planValidity),
        planGroupId,
        sessionNumber,
        athleteName: input.athleteName,
        pdf: index === 0 ? input.pdf : undefined,
      });

      if (!planGroupId) {
        planGroupId = plan.planGroupId ?? plan.id;
      }

      created.push(plan);
    }

    return { plans: created };
  } catch (error) {
    return {
      plans: [],
      error: error instanceof Error ? error.message : 'No se pudo importar el PDF al calendario',
    };
  }
}
