import 'dotenv/config';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function readOption(name) {
  const prefix = `--${name}=`;
  const withEquals = process.argv.find((arg) => arg.startsWith(prefix));
  if (withEquals) return withEquals.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];
  return undefined;
}

const athleteEmail = readOption('athlete-email')?.trim().toLowerCase();
const trainerEmail = readOption('trainer-email')?.trim().toLowerCase();
const pdfPath = readOption('pdf');
const title = readOption('title')?.trim() || 'Plan Javi Cano';
const weekStart = readOption('week-start') ?? toLocalDateString(new Date());
const weekdaysOption = readOption('weekdays');
const targetWeekdays = weekdaysOption
  ? weekdaysOption.split(',').map((value) => Number(value.trim()))
  : [];

if (!athleteEmail || !trainerEmail || !pdfPath) {
  console.error(
    'Uso: node scripts/import-athlete-plan-for-email.mjs --athlete-email atleta@mail.com --trainer-email entrenador@mail.com --pdf ruta.pdf [--title "Plan"] [--week-start 2026-09-15] [--weekdays 0,1,3,4]',
  );
  process.exit(1);
}

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
    recurrence: 'weekly',
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

const dbUrl = resolveDatabaseUrl(PROJECT_REF);
if (!dbUrl || !serviceRoleKey) {
  throw new Error('Faltan credenciales de base de datos o SUPABASE_SERVICE_ROLE_KEY');
}

const admin = createClient(SUPABASE_URL, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  const athleteRes = await client.query(
    `select u.id, p.name from auth.users u join public."Perfil" p on p.id = u.id where lower(u.email) = $1`,
    [athleteEmail],
  );
  const trainerRes = await client.query(
    `select u.id from auth.users u where lower(u.email) = $1`,
    [trainerEmail],
  );
  const athlete = athleteRes.rows[0];
  const trainer = trainerRes.rows[0];
  if (!athlete) throw new Error(`No existe atleta: ${athleteEmail}`);
  if (!trainer) throw new Error(`No existe entrenador: ${trainerEmail}`);

  const pdfBuffer = readFileSync(pdfPath);
  const extracted = await extractPdfTextFromBuffer(pdfBuffer);
  const parsedDays = parseWeeklyPdfText(extracted.text, {
    pageTexts: extracted.pageTexts,
    targetWeekdays,
  });
  if (parsedDays.length === 0) {
    throw new Error('No se detectaron días en el PDF.');
  }

  const existing = await client.query(`select id, pdf_storage_path from athlete_plans where athlete_id = $1`, [
    athlete.id,
  ]);
  for (const row of existing.rows) {
    if (row.pdf_storage_path) {
      await admin.storage.from('athlete-plan-pdfs').remove([row.pdf_storage_path]);
    }
  }
  if (existing.rows.length > 0) {
    await client.query(`delete from athlete_plans where athlete_id = $1`, [athlete.id]);
    console.log(`· Eliminadas ${existing.rows.length} sesiones previas`);
  }

  const weekMonday = getMonday(weekStart);
  const planGroupId = randomUUID();
  const pdfFileName = pdfPath.split(/[\\/]/).pop() ?? 'plan.pdf';
  const pdfStoragePath = `${athlete.id}/${planGroupId}/${pdfFileName}`;
  let storedPdfPath = null;
  const upload = await admin.storage.from('athlete-plan-pdfs').upload(pdfStoragePath, pdfBuffer, {
    upsert: true,
    contentType: 'application/pdf',
  });
  if (upload.error) {
    console.warn(`· PDF no subido a storage (${upload.error.message}); se importa solo el contenido textual`);
  } else {
    storedPdfPath = pdfStoragePath;
  }

  const created = [];
  for (const [index, day] of parsedDays.entries()) {
    const sessionNumber = index + 1;
    const draft = buildDraftForDay(day, weekMonday, sessionNumber);
    const content = serializePersonalizedPlanContent(draft, sessionNumber);
    const inserted = await client.query(
      `insert into athlete_plans (
         athlete_id, trainer_id, plan_type, title, content, plan_group_id, session_number,
         pdf_storage_path, pdf_file_name
       ) values ($1,$2,'personalized',$3,$4,$5,$6,$7,$8)
       returning id`,
      [
        athlete.id,
        trainer.id,
        title,
        content,
        planGroupId,
        sessionNumber,
        sessionNumber === 1 ? storedPdfPath : null,
        sessionNumber === 1 && storedPdfPath ? pdfFileName : null,
      ],
    );
    created.push({ id: inserted.rows[0].id, label: day.label, sessionNumber });
  }

  console.log(`✓ Plan "${title}" importado para ${athlete.name} (${athleteEmail})`);
  console.log(`  Entrenador: ${trainerEmail}`);
  console.log(`  Grupo: ${planGroupId}`);
  for (const row of created) {
    console.log(`  · sesión ${row.sessionNumber}: ${row.label} → ${row.id}`);
  }
} finally {
  await client.end();
}
