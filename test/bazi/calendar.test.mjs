import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { paiBazi } from '../../src/modules/bazi/engine.js';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, '../..');

function pillarStrings(result) {
  return ['year', 'month', 'day', 'hour'].map((key) => (
    result.pillars[key].stem + result.pillars[key].branch
  ));
}

function dayPillarInTimezone(timezone, input) {
  const code = `
    import { getDayPillar } from './src/modules/bazi/engine.js';
    const pillar = getDayPillar(${input.join(',')});
    process.stdout.write(pillar.stem + pillar.branch);
  `;
  return execFileSync(
    process.execPath,
    ['--input-type=module', '--eval', code],
    {
      cwd: projectRoot,
      encoding: 'utf8',
      env: { ...process.env, TZ: timezone },
    },
  );
}

test('preserves the corrected historical day-pillar regression', () => {
  assert.deepEqual(
    pillarStrings(paiBazi(2000, 10, 17, 14, 0, 'male')),
    ['庚辰', '丙戌', '戊申', '己未'],
  );
});

test('uses the actual 1999 Corn on Ear boundary', () => {
  assert.deepEqual(
    pillarStrings(paiBazi(1999, 6, 7, 9, 11, 'male')),
    ['己卯', '庚午', '庚寅', '辛巳'],
  );
});

test('does not enter the 2026 Lichun pillars ten minutes early', () => {
  assert.deepEqual(
    pillarStrings(paiBazi(2026, 2, 4, 3, 53, 'male')).slice(0, 2),
    ['乙巳', '己丑'],
  );
  assert.deepEqual(
    pillarStrings(paiBazi(2026, 2, 4, 4, 3, 'male')).slice(0, 2),
    ['丙午', '庚寅'],
  );
});

test('finds January Dayun on both sides of the birth time', () => {
  const male = paiBazi(2025, 1, 1, 12, 0, 'male');
  const female = paiBazi(2025, 1, 1, 12, 0, 'female');

  assert.equal(male.dayun[0].startAge, 1);
  assert.deepEqual(male.dayunStart, {
    years: 1,
    months: 3,
    days: 20,
    solarDate: '2026-04-21',
    roundedAge: 1,
  });

  assert.equal(female.dayun[0].startAge, 9);
  assert.deepEqual(female.dayunStart, {
    years: 8,
    months: 6,
    days: 10,
    solarDate: '2033-07-11',
    roundedAge: 9,
  });
});

test('day pillar is independent of the browser runtime timezone', () => {
  const input = [2011, 12, 30, 12];
  assert.equal(
    dayPillarInTimezone('Pacific/Apia', input),
    dayPillarInTimezone('UTC', input),
  );
});
