import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { parseAimHarderCalendar } from './aimharderParser.mjs';
import { AIMHARDER_TRACKS } from './aimharderTracks.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ANNUAL_YEAR = 2000;

export function resolveDatabaseUrl(projectRef) {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) return null;

  const host = process.env.SUPABASE_DB_HOST?.trim() || `db.${projectRef}.supabase.co`;
  const user = process.env.SUPABASE_DB_USER?.trim() || 'postgres';
  const database = process.env.SUPABASE_DB_NAME?.trim() || 'postgres';
  const port = process.env.SUPABASE_DB_PORT?.trim() || '5432';

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

export function isWeekdayDateString(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

export function toAnnualTemplateDate(dateStr) {
  const value =
    dateStr instanceof Date
      ? dateStr.toISOString().slice(0, 10)
      : String(dateStr).slice(0, 10);
  const [, month, day] = value.split('-');
  return `${ANNUAL_YEAR}-${month}-${day}`;
}

export function resolveTrackKey(programName) {
  return AIMHARDER_TRACKS.find((track) => track.programName === programName)?.key ?? null;
}

export function annualRateId(templateDate, trackKey) {
  const trackIndex = AIMHARDER_TRACKS.findIndex((track) => track.key === trackKey);
  const slot = trackIndex >= 0 ? trackIndex + 1 : 9;
  const [, month, day] = templateDate.split('-');
  const mmdd = Number(`${month}${day}`);
  return -(slot * 100000 + mmdd);
}

export function normalizeWorkoutToAnnual(workout, trackKey) {
  if (!trackKey || !isWeekdayDateString(workout.workoutDate)) {
    return null;
  }

  const templateDate = toAnnualTemplateDate(workout.workoutDate);
  const scheduleConfig = buildAnnualSchedule(templateDate);

  return {
    ...workout,
    workoutDate: templateDate,
    aimharderRateId: annualRateId(templateDate, trackKey),
    scheduleConfig,
  };
}

export function buildAnnualSchedule(templateDate) {
  const date = new Date(`${templateDate}T12:00:00`);
  const weekday = date.getDay() === 0 ? 6 : date.getDay() - 1;
  return {
    weekdays: [weekday],
    recurrence: 'yearly',
    startDate: templateDate,
  };
}

export function groupAnnualWorkouts(workouts, { programName, skipWeekends = true } = {}) {
  const grouped = new Map();

  for (const workout of workouts) {
    if (programName && workout.programName !== programName) continue;
    if (skipWeekends && !isWeekdayDateString(workout.workoutDate)) continue;

    const templateDate = toAnnualTemplateDate(workout.workoutDate);
    const trackKey = resolveTrackKey(workout.programName);
    const existing = grouped.get(templateDate);
    if (!existing || workout.workoutDate > existing.sourceDate) {
      grouped.set(templateDate, {
        ...workout,
        sourceDate: workout.workoutDate,
        workoutDate: templateDate,
        aimharderRateId: annualRateId(templateDate, trackKey),
        scheduleConfig: buildAnnualSchedule(templateDate),
      });
    }
  }

  return [...grouped.values()].sort((left, right) => left.workoutDate.localeCompare(right.workoutDate));
}

export function parseCalendarFiles(files) {
  const workouts = [];

  for (const file of files) {
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    workouts.push(...parseAimHarderCalendar(raw));
  }

  return workouts;
}

export function fetchCalendarChunks({ from, to, outDir, rootDir }) {
  const files = [];
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  let cursor = new Date(start);

  while (cursor <= end) {
    const chunkStart = cursor.toISOString().slice(0, 10);
    const chunkEndDate = new Date(cursor);
    chunkEndDate.setMonth(chunkEndDate.getMonth() + 1);
    chunkEndDate.setDate(0);
    const chunkEnd = chunkEndDate > end ? end.toISOString().slice(0, 10) : chunkEndDate.toISOString().slice(0, 10);
    const out = join(outDir, `aimharder-${chunkStart}-${chunkEnd}.json`);

    const result = spawnSync(
      process.execPath,
      ['scripts/fetch-aimharder-calendar.mjs', '--from', chunkStart, '--to', chunkEnd, '--out', out],
      { stdio: 'inherit', cwd: rootDir, env: process.env },
    );

    if (result.status !== 0) {
      throw new Error(`No se pudo descargar el calendario ${chunkStart} → ${chunkEnd}`);
    }

    files.push(out);
    cursor = new Date(chunkEndDate);
    cursor.setDate(cursor.getDate() + 1);
  }

  return files;
}

export async function loadExistingProgramWorkouts(client, programId, programName) {
  const entrenos = await client.query(
    `select id, workout_date, aimharder_rate_id, name, day_label, estimated_duration,
            warmup, main_part, core_part, cooldown
     from public.entrenos_diarios
     where program_id = $1
     order by workout_date`,
    [programId],
  );

  const workouts = [];

  for (const row of entrenos.rows) {
    const exercises = await client.query(
      `select sort_order, name, sets, reps, rest, notes, aimharder_ejer_id
       from public.entrenos_ejercicios
       where entreno_id = $1
       order by sort_order`,
      [row.id],
    );

    workouts.push({
      workoutDate:
        row.workout_date instanceof Date
          ? row.workout_date.toISOString().slice(0, 10)
          : String(row.workout_date).slice(0, 10),
      aimharderRateId: Number(row.aimharder_rate_id),
      programName,
      name: row.name,
      dayLabel: row.day_label,
      estimatedDuration: row.estimated_duration,
      warmup: row.warmup ?? '',
      mainPart: row.main_part ?? '',
      corePart: row.core_part ?? '',
      cooldown: row.cooldown ?? '',
      exercises: exercises.rows.map((exercise) => ({
        sortOrder: exercise.sort_order,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        notes: exercise.notes,
        aimharderEjerId:
          exercise.aimharder_ejer_id != null ? Number(exercise.aimharder_ejer_id) : undefined,
      })),
    });
  }

  return workouts;
}

export async function upsertAnnualWorkout(client, programId, workout) {
  const entrenoResult = await client.query(
    `insert into public.entrenos_diarios (
       program_id, workout_date, aimharder_rate_id, name, day_label,
       estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, now())
     on conflict (workout_date, aimharder_rate_id)
     do update set
       program_id = excluded.program_id,
       name = excluded.name,
       day_label = excluded.day_label,
       estimated_duration = excluded.estimated_duration,
       warmup = excluded.warmup,
       main_part = excluded.main_part,
       core_part = excluded.core_part,
       cooldown = excluded.cooldown,
       schedule_config = excluded.schedule_config,
       synced_at = now()
     returning id`,
    [
      programId,
      workout.workoutDate,
      workout.aimharderRateId,
      workout.name,
      workout.dayLabel,
      workout.estimatedDuration,
      workout.warmup,
      workout.mainPart,
      workout.corePart,
      workout.cooldown,
      JSON.stringify(workout.scheduleConfig),
    ],
  );

  const entrenoId = entrenoResult.rows[0].id;
  await client.query(`delete from public.entrenos_ejercicios where entreno_id = $1`, [entrenoId]);

  for (const exercise of workout.exercises) {
    await client.query(
      `insert into public.entrenos_ejercicios (
         entreno_id, sort_order, name, sets, reps, rest, notes, aimharder_ejer_id
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        entrenoId,
        exercise.sortOrder,
        exercise.name,
        exercise.sets,
        exercise.reps,
        exercise.rest,
        exercise.notes ?? null,
        exercise.aimharderEjerId ?? null,
      ],
    );
  }

  return entrenoId;
}

export async function replaceProgramWithAnnualWorkouts(client, programId, annualWorkouts, { replace = false } = {}) {
  if (replace) {
    await client.query(`delete from public.entrenos_diarios where program_id = $1`, [programId]);
  }

  for (const workout of annualWorkouts) {
    await upsertAnnualWorkout(client, programId, workout);
  }
}

export async function resolveProgramId(client, programName) {
  const result = await client.query(
    `select p.id
     from public.programas p
     where lower(trim(p.name)) = lower(trim($1))
        or lower(trim(p.name)) = lower(trim(translate($1, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')))
        or lower(trim(translate(p.name, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU'))) = lower(trim(translate($1, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')))
     order by case when lower(trim(p.name)) = lower(trim($1)) then 0 else 1 end
     limit 1`,
    [programName],
  );

  return result.rows[0]?.id ?? null;
}
