import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  CHINA_CITIES,
  calcCitySolarTimeOffset,
  calcEquationOfTime,
  adjustBirthTime,
  resolveCivilTimeOffset,
  searchCities,
} from '../../src/lib/cities.js';

test('pins every runtime city to a unique sourced geoname and IANA time zone', () => {
  assert.equal(CHINA_CITIES.length, 374);
  assert.equal(new Set(CHINA_CITIES.map(city => `${city.name}|${city.province}`)).size, 374);
  assert.equal(new Set(CHINA_CITIES.map(city => city.geonameId)).size, 374);

  for (const city of CHINA_CITIES) {
    assert.equal(Number.isInteger(city.geonameId) && city.geonameId > 0, true, city.name);
    assert.equal(Number.isFinite(city.lat) && city.lat >= -90 && city.lat <= 90, true, city.name);
    assert.equal(Number.isFinite(city.lng) && city.lng >= -180 && city.lng <= 180, true, city.name);
    assert.match(city.countryCode, /^[A-Z]{2}$/, city.name);
    assert.equal(typeof city.timeZone, 'string', city.name);
    assert.doesNotThrow(() => new Intl.DateTimeFormat('en', { timeZone: city.timeZone }), city.name);
    assert.equal(Object.hasOwn(city, 'stdMeridian'), false, city.name);
  }
});

test('fixes known city identity and time-zone mismatches', () => {
  const beijing = searchCities('北京')[0];
  const newYork = searchCities('New York')[0];
  const lasVegas = searchCities('Las Vegas')[0];
  const urumqi = searchCities('乌鲁木齐')[0];

  assert.equal(beijing.geonameId, 1816670);
  assert.equal(beijing.timeZone, 'Asia/Shanghai');
  assert.equal(newYork.geonameId, 5128581);
  assert.equal(newYork.timeZone, 'America/New_York');
  assert.equal(lasVegas.timeZone, 'America/Los_Angeles');
  assert.equal(urumqi.timeZone, 'Asia/Shanghai');
  assert.equal(urumqi.sourceTimeZone, 'Asia/Urumqi');
});

test('uses NOAA leap-year denominator for the equation of time', () => {
  assert.ok(Math.abs(calcEquationOfTime({
    year: 2024,
    month: 12,
    day: 31,
    hour: 12,
  }) - (-2.4546940762)) < 0.0001);
});

test('resolves exact historical civil offsets from IANA rules', () => {
  assert.deepEqual(
    resolveCivilTimeOffset('America/New_York', { year: 2025, month: 7, day: 15, hour: 12, minute: 0 }),
    { status: 'exact', offsets: [-240], selectedOffset: -240 },
  );
  assert.deepEqual(
    resolveCivilTimeOffset('America/New_York', { year: 2025, month: 1, day: 15, hour: 12, minute: 0 }),
    { status: 'exact', offsets: [-300], selectedOffset: -300 },
  );
  assert.deepEqual(
    resolveCivilTimeOffset('Asia/Shanghai', { year: 1990, month: 7, day: 1, hour: 12, minute: 0 }),
    { status: 'exact', offsets: [540], selectedOffset: 540 },
  );
  assert.deepEqual(
    resolveCivilTimeOffset('UTC', { year: 99, month: 7, day: 1, hour: 12, minute: 0 }),
    { status: 'exact', offsets: [0], selectedOffset: 0 },
  );
});

test('does not silently choose an occurrence for ambiguous or nonexistent wall time', () => {
  const repeated = { year: 2025, month: 11, day: 2, hour: 1, minute: 30 };
  const skipped = { year: 2025, month: 3, day: 9, hour: 2, minute: 30 };

  assert.deepEqual(
    resolveCivilTimeOffset('America/New_York', repeated),
    { status: 'ambiguous', offsets: [-300, -240], selectedOffset: null },
  );
  assert.deepEqual(
    resolveCivilTimeOffset('America/New_York', skipped),
    { status: 'nonexistent', offsets: [], selectedOffset: null },
  );
});

test('rejects invalid civil dates before applying a solar correction', () => {
  assert.throws(() => adjustBirthTime(2025, 2, 29, 12, 0, 0), /invalid civil date/i);
});

test('calculates apparent solar correction from the actual civil UTC offset', () => {
  const newYork = searchCities('New York')[0];
  const summer = calcCitySolarTimeOffset(newYork, { year: 2025, month: 7, day: 15, hour: 12, minute: 0 });
  const winter = calcCitySolarTimeOffset(newYork, { year: 2025, month: 1, day: 15, hour: 12, minute: 0 });

  assert.equal(summer.utcOffsetMinutes, -240);
  assert.equal(winter.utcOffsetMinutes, -300);
  assert.equal(summer.timeZone, 'America/New_York');
  assert.equal(summer.offsetMinutes, Math.round(-240 - newYork.lng * 4 - summer.equationOfTimeMinutes));

  const repeated = { year: 2025, month: 11, day: 2, hour: 1, minute: 30 };
  assert.throws(() => calcCitySolarTimeOffset(newYork, repeated), /ambiguous/i);
  assert.equal(calcCitySolarTimeOffset(newYork, repeated, { disambiguation: 'earlier' }).utcOffsetMinutes, -240);
  assert.equal(calcCitySolarTimeOffset(newYork, repeated, { disambiguation: 'later' }).utcOffsetMinutes, -300);
});

test('routes every active city consumer through the IANA-aware API', async () => {
  const paths = [
    '../../src/components/BirthCityPicker.jsx',
    '../../src/modules/bazi/BaziModule.jsx',
    '../../src/modules/bazihealth/BaziHealthModule.jsx',
    '../../src/modules/ziwei/ZiweiModule.jsx',
    '../../src/modules/qimen/QimenModule.jsx',
  ];
  for (const relativePath of paths) {
    const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');
    assert.match(source, /calcCitySolarTimeOffset/, relativePath);
    assert.doesNotMatch(source, /calcTrueSolarTimeOffset/, relativePath);
  }
});
