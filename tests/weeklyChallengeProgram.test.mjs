import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { HERO_WODS, WEEKLY_CHALLENGE_MODALITIES } from '../scripts/lib/heroWodCatalog.mjs';
import {
  WEEKLY_CHALLENGE_PROGRAM_NAME,
  buildWeeklyChallenge,
  buildWeeklyChallengeYear,
  countHeroesInCatalog,
  firstMondayOnOrAfter,
  isMonday,
  lastMondayOnOrBefore,
  listMondaysInRange,
  listMondaysInYear,
  pickWeeklyHero,
  summarizeWeeklyChallengeYear,
  weekSeed,
} from '../scripts/lib/weeklyChallengeProgram.mjs';

const MONDAY = '2026-08-31';

describe('desafío semanal', () => {
  it('exige que la semana empiece en lunes', () => {
    assert.equal(isMonday(MONDAY), true);
    assert.throws(() => buildWeeklyChallenge('2026-09-01'), /lunes/);
  });

  it('elige un solo hero con su modalidad', () => {
    const entry = pickWeeklyHero(MONDAY);
    assert.ok(WEEKLY_CHALLENGE_MODALITIES.includes(entry.modality));
    assert.ok(entry.hero?.name);
    assert.ok(entry.main.includes('• '));
  });

  it('la selección es estable para la misma semana', () => {
    const first = pickWeeklyHero(MONDAY);
    const second = pickWeeklyHero(MONDAY);
    assert.equal(first.hero.id, second.hero.id);
    assert.equal(first.modality, second.modality);
  });

  it('varía la selección a lo largo de varias semanas', () => {
    const picks = ['2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21'].map((monday) => {
      const entry = pickWeeklyHero(monday);
      return `${entry.modality}:${entry.hero.id}`;
    });
    assert.ok(new Set(picks).size > 1);
  });

  it('ATHX del 31 de agosto incluye activación, primer y metcon mejorado', () => {
    const challenge = buildWeeklyChallenge(MONDAY);
    assert.equal(challenge.hero.modality, 'ATHX');
    assert.equal(challenge.hero.hero.id, 'the-seven');
    const [activation, prep, metcon] = challenge.sessions;
    assert.match(activation.mainPart, /Hybrid.*Turf/i);
    assert.match(prep.mainPart, /Primer.*Empuje invertido/i);
    assert.match(metcon.mainPart, /Cap 35 min/i);
    assert.equal(metcon.corePart, '');
    assert.equal(metcon.cooldown, '');
  });

  it('genera activación, preparación y metcon por semana', () => {
    const challenge = buildWeeklyChallenge(MONDAY);
    assert.equal(challenge.sessions.length, 3);
    const [activation, prep, metcon] = challenge.sessions;
    assert.equal(activation.scheduleConfig.kind, 'activation');
    assert.equal(activation.scheduleConfig.dayOrder, 0);
    assert.equal(prep.scheduleConfig.kind, 'session');
    assert.equal(prep.scheduleConfig.dayOrder, 1);
    assert.equal(metcon.scheduleConfig.kind, 'metcon');
    assert.equal(metcon.scheduleConfig.dayOrder, 2);
    assert.equal(metcon.scheduleConfig.modality, challenge.hero.modality);
    assert.equal(metcon.scheduleConfig.startDate, MONDAY);
    assert.equal(metcon.scheduleConfig.recurrence, 'once');
    assert.ok(metcon.scheduleConfig.heroId);
    assert.ok(activation.mainPart.includes('• '));
    assert.ok(prep.mainPart.includes('• '));
  });

  it('tiene heroes en todas las modalidades del catálogo', () => {
    for (const modality of WEEKLY_CHALLENGE_MODALITIES) {
      assert.ok(HERO_WODS[modality]?.length >= 10, `faltan heroes para ${modality}`);
    }
    assert.ok(countHeroesInCatalog() >= 52);
  });

  it('usa el nombre del programa de desafío semanal', () => {
    assert.equal(WEEKLY_CHALLENGE_PROGRAM_NAME, 'Desafío de la semana');
  });

  it('la semilla depende del lunes', () => {
    assert.notEqual(weekSeed(MONDAY), weekSeed('2026-09-07'));
  });

  it('lista los lunes de un año natural', () => {
    assert.equal(firstMondayOnOrAfter('2026-01-01'), '2026-01-05');
    assert.equal(lastMondayOnOrBefore('2026-12-31'), '2026-12-28');
    const mondays = listMondaysInYear(2026);
    assert.equal(mondays.length, 52);
    assert.equal(mondays[0], '2026-01-05');
    assert.equal(mondays.at(-1), '2026-12-28');
  });

  it('genera un desafío por semana en el año', () => {
    const challenges = buildWeeklyChallengeYear({ year: 2026 });
    assert.equal(challenges.length, 52);
    assert.equal(challenges.every((challenge) => challenge.sessions.length === 3), true);
    const summary = summarizeWeeklyChallengeYear(challenges);
    assert.equal(summary.weeks, 52);
    assert.ok(Object.values(summary.byModality).every((count) => count > 0));
    const heroIds = challenges.map((challenge) => challenge.hero.hero.id);
    assert.equal(new Set(heroIds).size, 52);
  });
});
