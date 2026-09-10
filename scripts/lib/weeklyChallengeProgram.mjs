import { HERO_WODS, WEEKLY_CHALLENGE_MODALITIES } from './heroWodCatalog.mjs';
import {
  activationDuration,
  buildWeeklyChallengeActivation,
  buildWeeklyChallengePrep,
  prepDuration,
} from './weeklyChallengeSessionExtras.mjs';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RATE_ID_BASE = 9_000_000;
const RATE_ID_SLOT_STEP = 100_000;

export const WEEKLY_CHALLENGE_PROGRAM_NAME = 'Desafío de la semana';

export function isMonday(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay() === 1;
}

export function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T12:00:00Z`);
  return new Date(date.getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Primer lunes en o después de la fecha indicada. */
export function firstMondayOnOrAfter(dateStr) {
  const date = new Date(`${dateStr}T12:00:00Z`);
  let day = date.getUTCDay();
  if (day === 0) day = 7;
  const daysToAdd = day === 1 ? 0 : 8 - day;
  return addDays(dateStr, daysToAdd);
}

/** Último lunes en o antes de la fecha indicada. */
export function lastMondayOnOrBefore(dateStr) {
  const date = new Date(`${dateStr}T12:00:00Z`);
  let day = date.getUTCDay();
  if (day === 0) day = 7;
  const daysToSubtract = day === 1 ? 0 : day - 1;
  return addDays(dateStr, -daysToSubtract);
}

/** Lunes de cada semana cuyo lunes cae entre `from` y `to` (inclusive). */
export function listMondaysInRange(from, to) {
  const mondays = [];
  let current = firstMondayOnOrAfter(from);
  const last = lastMondayOnOrBefore(to);
  while (current <= last) {
    mondays.push(current);
    current = addDays(current, 7);
  }
  return mondays;
}

export function listMondaysInYear(year) {
  return listMondaysInRange(`${year}-01-01`, `${year}-12-31`);
}

export function countHeroesInCatalog({ modalities = WEEKLY_CHALLENGE_MODALITIES } = {}) {
  return modalities.reduce((total, modality) => total + (HERO_WODS[modality]?.length ?? 0), 0);
}

export function listAllHeroes({ modalities = WEEKLY_CHALLENGE_MODALITIES } = {}) {
  return modalities.flatMap((modality) =>
    (HERO_WODS[modality] ?? []).map((hero) => ({ modality, hero })),
  );
}

/**
 * Asigna un hero distinto a cada semana del rango. Reparte modalidades de forma equilibrada
 * y dentro de cada modalidad no repite heroes.
 */
export function buildUniqueHeroScheduleForMondays(mondays, { seed = 0, modalities = WEEKLY_CHALLENGE_MODALITIES } = {}) {
  if (mondays.length > countHeroesInCatalog({ modalities })) {
    throw new Error(
      `Hay ${mondays.length} semanas pero solo ${countHeroesInCatalog({ modalities })} heroes únicos en el catálogo.`,
    );
  }

  const modalityByMonday = buildBalancedModalitySchedule(mondays, { modalities, seed });
  const counts = Object.fromEntries(modalities.map((modality) => [modality, 0]));
  for (const monday of mondays) {
    counts[modalityByMonday.get(monday)] += 1;
  }

  for (const modality of modalities) {
    const available = HERO_WODS[modality]?.length ?? 0;
    if (counts[modality] > available) {
      throw new Error(
        `Faltan heroes en ${modality}: se necesitan ${counts[modality]} pero solo hay ${available}.`,
      );
    }
  }

  const heroesByModality = {};
  for (const [index, modality] of modalities.entries()) {
    heroesByModality[modality] = shuffleInPlace(
      [...HERO_WODS[modality]],
      createRng(seed + index + 1),
    ).slice(0, counts[modality]);
  }

  const queues = Object.fromEntries(modalities.map((modality) => [modality, [...heroesByModality[modality]]]));
  const schedule = new Map();

  for (const monday of mondays) {
    const modality = modalityByMonday.get(monday);
    const hero = queues[modality].shift();
    if (!hero) {
      throw new Error(`No quedan heroes sin usar en ${modality} para la semana del ${monday}.`);
    }
    schedule.set(monday, { modality, hero });
  }

  return schedule;
}

export function buildWeeklyChallengeYear({ year, from, to } = {}) {
  const rangeFrom = from ?? `${year}-01-01`;
  const rangeTo = to ?? `${year}-12-31`;
  const mondays = listMondaysInRange(rangeFrom, rangeTo);
  const scheduleSeed = (year ?? Number(rangeFrom.slice(0, 4))) * 100 + Number(rangeTo.slice(5, 7));
  const heroByMonday = buildUniqueHeroScheduleForMondays(mondays, { seed: scheduleSeed });
  return mondays.map((monday) => buildWeeklyChallenge(monday, heroByMonday.get(monday)));
}

export function summarizeWeeklyChallengeYear(challenges) {
  const byModality = Object.fromEntries(WEEKLY_CHALLENGE_MODALITIES.map((modality) => [modality, 0]));
  for (const challenge of challenges) {
    byModality[challenge.hero.modality] += 1;
  }
  return {
    weeks: challenges.length,
    from: challenges[0]?.monday ?? null,
    to: challenges.at(-1)?.sunday ?? null,
    byModality,
  };
}

/** Semilla estable a partir del lunes de la semana. */
export function weekSeed(monday) {
  const [year, month, day] = monday.split('-').map(Number);
  return year * 10_000 + month * 100 + day;
}

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function shuffleInPlace(items, rng) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

/** Reparte las modalidades de forma equilibrada y las mezcla para todo un rango de semanas. */
export function buildBalancedModalitySchedule(mondays, { modalities = WEEKLY_CHALLENGE_MODALITIES, seed = 0 } = {}) {
  const rng = createRng(seed);
  const bag = [];
  const base = Math.floor(mondays.length / modalities.length);
  let remainder = mondays.length % modalities.length;
  const modalityOrder = shuffleInPlace([...modalities], rng);

  for (const modality of modalityOrder) {
    const count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    for (let index = 0; index < count; index += 1) bag.push(modality);
  }

  shuffleInPlace(bag, rng);
  return new Map(mondays.map((monday, index) => [monday, bag[index]]));
}

/** Elige una modalidad y un hero al azar para la semana (determinista por lunes). */
export function pickWeeklyHero(
  monday,
  { modalities = WEEKLY_CHALLENGE_MODALITIES, modality: fixedModality, hero: fixedHero } = {},
) {
  const rng = createRng(weekSeed(monday));
  const modality = fixedModality ?? modalities[Math.floor(rng() * modalities.length)];
  const modalityIndex = modalities.indexOf(modality);
  const pool = HERO_WODS[modality];

  if (!pool?.length) {
    throw new Error(`No hay heroes definidos para ${modality}.`);
  }

  const hero = fixedHero ?? pool[Math.floor(rng() * pool.length)];

  return {
    modality,
    modalityIndex,
    hero,
    main: hero.build(),
    estimatedDuration: hero.duration,
    dayLabel: `${modality} · Hero WOD · Una sola vez`,
    subtitle: `En honor a ${hero.honor}`,
  };
}

/** @deprecated Usa pickWeeklyHero. */
export function pickWeeklyHeroes(monday, options = {}) {
  return [pickWeeklyHero(monday, options)];
}

export function generatedRateId(monday, slotIndex = 0) {
  const [, month, day] = monday.split('-');
  return -(RATE_ID_BASE + slotIndex * RATE_ID_SLOT_STEP + Number(`${month}${day}`));
}

export const GENERATED_RATE_ID_RANGE = {
  from: -(RATE_ID_BASE + RATE_ID_SLOT_STEP + 1231),
  to: -RATE_ID_BASE,
};

export function buildWeeklyChallenge(monday, options = {}) {
  if (!isMonday(monday)) {
    throw new Error(`La semana del desafío debe empezar en lunes; ${monday} no lo es.`);
  }

  const entry = pickWeeklyHero(monday, options);
  const sunday = addDays(monday, 6);
  const sharedConfig = {
    weekdays: [0],
    recurrence: 'once',
    startDate: monday,
    modality: entry.modality,
    heroId: entry.hero.id,
    honor: entry.hero.honor,
  };

  const activation = buildWeeklyChallengeActivation(entry.modality, entry.hero);
  const prep = buildWeeklyChallengePrep(entry.modality, entry.hero);

  return {
    monday,
    sunday,
    hero: entry,
    sessions: [
      {
        workoutDate: monday,
        aimharderRateId: generatedRateId(monday, 0),
        name: 'Activación',
        dayLabel: `${entry.modality} · Activación · Desafío semanal`,
        estimatedDuration: activationDuration(entry.modality),
        warmup: '',
        mainPart: activation,
        corePart: '',
        cooldown: '',
        scheduleConfig: {
          ...sharedConfig,
          dayOrder: 0,
          kind: 'activation',
        },
      },
      {
        workoutDate: monday,
        aimharderRateId: generatedRateId(monday, 1),
        name: 'Preparación',
        dayLabel: `${entry.modality} · Primer técnico · ${entry.hero.name}`,
        estimatedDuration: prepDuration(entry.modality, entry.hero),
        warmup: '',
        mainPart: prep,
        corePart: '',
        cooldown: '',
        scheduleConfig: {
          ...sharedConfig,
          dayOrder: 1,
          kind: 'session',
        },
      },
      {
        workoutDate: monday,
        aimharderRateId: generatedRateId(monday, 2),
        name: entry.hero.name,
        dayLabel: entry.dayLabel,
        estimatedDuration: entry.estimatedDuration,
        warmup: '',
        mainPart: entry.main,
        corePart: '',
        cooldown: '',
        scheduleConfig: {
          ...sharedConfig,
          dayOrder: 2,
          kind: 'metcon',
        },
      },
    ],
  };
}

export function toWorkoutRows(challenge) {
  return challenge.sessions;
}
