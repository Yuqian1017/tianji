import assert from 'node:assert/strict';
import test from 'node:test';

import * as cities from '../../src/lib/cities.js';

test('calculates NOAA equation of time from a civil date', () => {
  assert.equal(typeof cities.calcEquationOfTime, 'function');
  assert.ok(
    Math.abs(cities.calcEquationOfTime({
      year: 2025,
      month: 2,
      day: 11,
      hour: 12,
    }) - (-14.1997)) < 0.01,
  );
  assert.ok(
    Math.abs(cities.calcEquationOfTime({
      year: 2025,
      month: 11,
      day: 3,
      hour: 12,
    }) - 16.3653) < 0.01,
  );
  assert.ok(
    Math.abs(cities.calcEquationOfTime({
      year: 2024,
      month: 12,
      day: 31,
      hour: 12,
    }) - (-2.4547)) < 0.01,
  );
});

test('includes equation of time in the standard-time solar offset', () => {
  assert.equal(
    cities.calcTrueSolarTimeOffset(104.07, 120, {
      year: 2025,
      month: 2,
      day: 11,
      hour: 0,
      minute: 30,
    }),
    78,
  );
});

test('applies the complete offset across the previous date', () => {
  const offset = cities.calcTrueSolarTimeOffset(104.07, 120, {
    year: 2025,
    month: 2,
    day: 11,
    hour: 0,
    minute: 30,
  });
  assert.deepEqual(
    cities.adjustBirthTime(2025, 2, 11, 0, 30, offset),
    { year: 2025, month: 2, day: 10, hour: 23, minute: 12 },
  );
});

test('labels the result as a civil-time-zone true solar calculation', () => {
  assert.equal(
    cities.formatTrueSolarTime(
      { year: 2025, month: 2, day: 10, hour: 23, minute: 12 },
      78,
    ),
    '真太阳时（民用时区口径） 23:12 (校正 -78分)',
  );
});
