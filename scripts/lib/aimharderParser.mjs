const REST_EXERCISE_IDS = new Set([165]);

const WOD_TYPES = {
  FOR_TIME: 1,
  AMRAP: 2,
  EMOM: 3,
  LIBRE: 6,
  RFT: 10,
  TEXTO: 11,
};

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/\u00b4/g, "'")
    .replace(/\u2019/g, "'")
    .trim();
}

function formatLoad(exercise) {
  return exercise.valor2 ? `@ ${exercise.valor2}` : '';
}

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function parseTimeCapMinutes(notes) {
  if (!notes) return null;
  const match = notes.match(/(?:T\.?\s*C\.?|TC|t\.c\.?)\s*(\d+)\s*['´']/i);
  return match ? Number(match[1]) : null;
}

function getBlockTitle(block) {
  if (block.freeEditNameVal) return block.freeEditNameVal;
  if (block.wodName) return block.wodName;
  if (block.nom === 'Libre') return 'Fuerza';
  return block.nom;
}

function getEmomRounds(block, exercises) {
  return (
    block.rondasRepeat ??
    block.rondas ??
    exercises.find((exercise) => exercise.roundrepeat)?.roundrepeat ??
    null
  );
}

function getRftRounds(block) {
  const notes = stripHtml(block.notes || '');
  const match = notes.match(/(\d+)\s*rondas?/i);
  if (match) return Number(match[1]);
  return block.timecap || block.rondas || null;
}

function formatBlockHeader(block, exercises) {
  const title = getBlockTitle(block);
  const notes = stripHtml(block.notes || '');

  switch (block.type) {
    case WOD_TYPES.TEXTO:
      return notes || title;

    case WOD_TYPES.AMRAP: {
      const label = title !== 'Fuerza' && title !== 'AMRAP' ? title : 'AMRAP';
      const time = block.timecap ? ` · ${block.timecap}'` : '';
      return [ `${label}${time}`, notes ].filter(Boolean).join('\n');
    }

    case WOD_TYPES.EMOM: {
      const rounds = getEmomRounds(block, exercises);
      const time = rounds ? ` · ${rounds} rondas` : '';
      return [ `EMOM${time}`, notes ].filter(Boolean).join('\n');
    }

    case WOD_TYPES.FOR_TIME: {
      const tc = parseTimeCapMinutes(notes);
      const time = tc ? ` · TC ${tc}'` : '';
      return [ `For Time${time}`, notes ].filter(Boolean).join('\n');
    }

    case WOD_TYPES.RFT: {
      const rounds = getRftRounds(block);
      const tc = parseTimeCapMinutes(notes);
      const roundLabel = rounds ? `${rounds} rondas · ` : '';
      const time = tc ? ` · TC ${tc}'` : '';
      return [ `${roundLabel}For Time${time}`, notes ].filter(Boolean).join('\n');
    }

    default:
      return [ title, notes ].filter(Boolean).join('\n');
  }
}

function formatStrengthPrescription(exercise) {
  const values = (exercise.valor1 || []).filter((value) => value !== '' && value != null);
  const load = formatLoad(exercise);

  if (values.length === 0) {
    return load || '—';
  }

  if (values.every((value) => value === values[0])) {
    const base = `${values.length} × ${values[0]}`;
    return load ? `${base} ${load}` : base;
  }

  return values.map((value) => (load ? `${value} ${load}` : value)).join(' / ');
}

function formatQuantity(exercise, value) {
  if (value == null || value === '') return 'Máx reps';

  const name = exercise.ejerName.toUpperCase();

  if (exercise.formaReg === 2 || name.includes('METROS') || name.includes(' RUN')) {
    return `${value} m`;
  }

  if (exercise.formaReg === 5 || name.includes('CAL')) {
    return `${value} cal`;
  }

  if (exercise.formaReg === 6) {
    return `${value} m`;
  }

  if (/^\d+$/.test(String(value))) {
    return `${value} reps`;
  }

  return String(value);
}

function formatWodPrescription(exercise, block, exercises) {
  const values = (exercise.valor1 || []).filter((value) => value !== '' && value != null);
  const load = formatLoad(exercise);
  const value = values[0];

  if (block.type === WOD_TYPES.EMOM) {
    const rounds = getEmomRounds(block, exercises);
    if (!value) return rounds ? `Máx reps × ${rounds} rondas` : 'Máx reps';
    const quantity = load ? `${value} ${load}` : formatQuantity(exercise, value);
    return rounds ? `${quantity} × ${rounds} rondas` : quantity;
  }

  if (value == null || value === '') {
    return block.type === WOD_TYPES.AMRAP ? 'Máx reps' : '—';
  }

  const quantity = formatQuantity(exercise, value);
  return load ? `${quantity} ${load}` : quantity;
}

function formatExercisePrescription(exercise, block, exercises) {
  if (block.type === WOD_TYPES.LIBRE) {
    return formatStrengthPrescription(exercise);
  }

  return formatWodPrescription(exercise, block, exercises);
}

function estimateBlockMinutes(block, exercises) {
  if (block.type === WOD_TYPES.TEXTO) return 0;

  if (block.type === WOD_TYPES.AMRAP && block.timecap) {
    return Number(block.timecap);
  }

  if (block.type === WOD_TYPES.EMOM) {
    const rounds = getEmomRounds(block, exercises);
    if (rounds) return rounds;
  }

  if (block.type === WOD_TYPES.FOR_TIME || block.type === WOD_TYPES.RFT) {
    const tc = parseTimeCapMinutes(block.notes || '');
    if (tc) return tc;
  }

  if (block.type === WOD_TYPES.LIBRE) {
    return 15;
  }

  return 0;
}

function estimateWorkoutDuration(blocks, exerciseGroups) {
  const total = blocks.reduce((sum, block) => {
    const exercises = exerciseGroups.get(block.id) || [];
    return sum + estimateBlockMinutes(block, exercises);
  }, 0);

  if (total <= 0) return '60 min';
  if (total >= 120) return `${Math.round(total / 60)} h`;
  return `${total} min`;
}

function buildWorkoutName(dateStr, blocks, trackName) {
  const date = new Date(`${dateStr}T12:00:00`);
  const dayLabel = capitalize(date.toLocaleDateString('es-ES', { weekday: 'long' }));
  const genericTitles = new Set([
    'Fuerza',
    'Libre',
    'Texto libre',
    'AMRAP',
    'EMOM',
    'For Time',
    'For time',
    'Rounds For Time',
  ]);
  const headline = blocks
    .map((block) => getBlockTitle(block))
    .find((title) => title && !genericTitles.has(title));

  return headline ? `${dayLabel} · ${headline}` : `${dayLabel} · ${trackName}`;
}

function parseDayWorkout(dateStr, rateId, dayData, track) {
  const rateKey = String(rateId);
  const exercises = dayData.rates?.[rateKey] || [];
  const blocks = (dayData.TIPOWODs?.[rateKey] || []).filter((block) => !block.deleted);

  const groups = new Map();
  for (const exercise of exercises) {
    if (REST_EXERCISE_IDS.has(exercise.ejerId)) continue;
    const key = exercise.tWODSSid;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(exercise);
  }

  const sections = [];
  const parsedExercises = [];
  let order = 0;

  for (const block of blocks) {
    const blockExercises = groups.get(block.id) || [];
    const header = formatBlockHeader(block, blockExercises);

    if (block.type === WOD_TYPES.TEXTO) {
      sections.push(header);
      continue;
    }

    let sectionText = header;

    for (const exercise of blockExercises) {
      if (REST_EXERCISE_IDS.has(exercise.ejerId)) continue;

      const prescription = formatExercisePrescription(exercise, block, blockExercises);
      const values = (exercise.valor1 || []).filter((value) => value !== '' && value != null);
      const sets = block.type === WOD_TYPES.LIBRE ? Math.max(1, values.length) : 1;

      parsedExercises.push({
        sortOrder: order,
        name: exercise.ejerName,
        aimharderEjerId: exercise.ejerId != null ? Number(exercise.ejerId) : undefined,
        sets,
        reps: prescription,
        rest: '—',
        notes: block.type === WOD_TYPES.LIBRE ? stripHtml(block.notes || '') || undefined : undefined,
      });
      order += 1;

      sectionText += `\n• ${exercise.ejerName}: ${prescription}`;
    }

    if (sectionText.trim()) {
      sections.push(sectionText);
    }
  }

  const date = new Date(`${dateStr}T12:00:00`);
  const dayLabel = capitalize(date.toLocaleDateString('es-ES', { weekday: 'long' }));

  return {
    workoutDate: dateStr,
    aimharderRateId: Number(rateId),
    aimharderColor: track.color,
    trackKey: track.key,
    programName: track.programName,
    name: buildWorkoutName(dateStr, blocks, track.programName),
    dayLabel,
    estimatedDuration: estimateWorkoutDuration(blocks, groups),
    warmup: '',
    mainPart: sections.join('\n\n'),
    corePart: '',
    cooldown: '',
    exercises: parsedExercises,
  };
}

import { resolveTrackRates } from './aimharderTracks.mjs';

export function parseAimHarderCalendar(calendar) {
  const workoutsByDate = calendar.workouts ?? calendar;
  const parsed = [];

  for (const [dateStr, dayData] of Object.entries(workoutsByDate)) {
    if (!dayData?.rates) continue;

    for (const { rateId, track } of resolveTrackRates(dayData)) {
      const workout = parseDayWorkout(dateStr, rateId, dayData, track);
      if (workout.exercises.length === 0 && !workout.mainPart.trim()) continue;
      parsed.push(workout);
    }
  }

  return parsed.sort((a, b) => {
    const byDate = a.workoutDate.localeCompare(b.workoutDate);
    if (byDate !== 0) return byDate;
    return a.programName.localeCompare(b.programName);
  });
}
