import 'dotenv/config';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';
import {
  isCalisthenicsPlanText,
  serializeCalisthenicsPlanMain,
} from './lib/calisthenicsPlanTextParser.mjs';
import {
  createEmptySessionDraft,
  formatScheduleSummary,
  serializePersonalizedPlanContent,
  toLocalDateString,
} from './lib/personalizedPlanImport.mjs';
import { extractPdfTextFromBuffer, parseWeeklyPdfText } from './lib/planPdfParser.mjs';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? `https://${PROJECT_REF}.supabase.co`;

const PLAN_ID = process.argv[2] ?? '54af1752-51b8-4fe9-acbc-252f7f01f7a1';
const WEEK_START = process.argv[3] ?? '2026-08-31';
const TARGET_WEEKDAYS = (process.argv[4] ?? '0,1,3,4').split(',').map((value) => Number(value.trim()));

function getMonday(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function dateForWeekday(weekMonday, weekday) {
  const date = new Date(weekMonday);
  date.setDate(date.getDate() + weekday);
  return date;
}

function buildDraftForDay(day, weekMonday, sessionNumber) {
  const scheduleDate = dateForWeekday(weekMonday, day.weekday);
  const schedule = {
    weekdays: [day.weekday],
    recurrence: 'once',
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
      : day.text.trim(),
  };
}

async function downloadPdfBuffer(client, storagePath) {
  await client.query(`update storage.buckets set public = true where id = 'athlete-plan-pdfs'`);
  try {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/athlete-plan-pdfs/${storagePath
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/')}`;
    const response = await fetch(publicUrl);
    if (!response.ok) {
      throw new Error(`No se pudo descargar el PDF (${response.status})`);
    }
    return Buffer.from(await response.arrayBuffer());
  } finally {
    await client.query(`update storage.buckets set public = false where id = 'athlete-plan-pdfs'`);
  }
}

async function main() {
  const dbUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!dbUrl) throw new Error('Falta SUPABASE_DB_PASSWORD o DATABASE_URL');

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const planResult = await client.query(
      `select id, athlete_id, trainer_id, title, plan_group_id, pdf_storage_path, pdf_file_name
       from public.athlete_plans where id = $1`,
      [PLAN_ID],
    );
    const plan = planResult.rows[0];
    if (!plan?.pdf_storage_path) {
      throw new Error('El plan no tiene PDF adjunto');
    }

    console.log(`Importando ${plan.pdf_file_name} para la semana del ${WEEK_START}…`);

    const pdfBuffer = await downloadPdfBuffer(client, plan.pdf_storage_path);
    const extracted = await extractPdfTextFromBuffer(pdfBuffer);
    const parsedDays = parseWeeklyPdfText(extracted.text, {
      pageTexts: extracted.pageTexts,
      targetWeekdays: TARGET_WEEKDAYS,
    });

    if (parsedDays.length === 0) {
      throw new Error('No se encontraron días en el PDF.');
    }

    console.log(`· ${parsedDays.length} días detectados`);
    for (const day of parsedDays) {
      console.log(`  ${day.label}: ${day.text.slice(0, 80).replace(/\s+/g, ' ')}…`);
    }

    const groupResult = await client.query(
      `select id from public.athlete_plans
       where athlete_id = $1 and coalesce(plan_group_id, id) = coalesce($2::uuid, $3::uuid)`,
      [plan.athlete_id, plan.plan_group_id, plan.id],
    );
    const replaceIds = groupResult.rows.map((row) => row.id);

    if (replaceIds.length > 0) {
      const deleted = await client.query(`delete from public.athlete_plans where id = any($1::uuid[])`, [replaceIds]);
      console.log(`· Eliminadas ${deleted.rowCount} sesiones previas del grupo`);
    }

    const weekMonday = getMonday(WEEK_START);
    const planGroupId = plan.plan_group_id ?? plan.id;
    const created = [];

    for (const [index, day] of parsedDays.entries()) {
      const sessionNumber = index + 1;
      const draft = buildDraftForDay(day, weekMonday, sessionNumber);
      const content = serializePersonalizedPlanContent(draft, sessionNumber);
      const scheduleDate = dateForWeekday(weekMonday, day.weekday);

      const inserted = await client.query(
        `insert into public.athlete_plans (
           athlete_id, trainer_id, plan_type, title, content, plan_group_id, session_number,
           pdf_storage_path, pdf_file_name
         ) values ($1, $2, 'personalized', $3, $4, $5, $6, $7, $8)
         returning id`,
        [
          plan.athlete_id,
          plan.trainer_id,
          plan.title,
          content,
          planGroupId,
          sessionNumber,
          sessionNumber === 1 ? plan.pdf_storage_path : null,
          sessionNumber === 1 ? plan.pdf_file_name : null,
        ],
      );

      created.push({ id: inserted.rows[0].id, date: toLocalDateString(scheduleDate), label: day.label });
    }

    console.log('✓ Sesiones creadas:');
    for (const row of created) {
      console.log(`  ${row.date} · ${row.label} · ${row.id}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
