import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  CHINA_CITIES,
  CITY_DATA_MODEL,
  calcCitySolarTimeOffset,
  calcEquationOfTime,
  resolveCivilTimeOffset,
} from '../../src/lib/cities.js';

const ROOT = process.cwd();
const CORE_PATH = path.join(ROOT, 'database/shared/cities-core.json');
const LEGACY_PATH = path.join(ROOT, 'database/shared/legacy-city-baseline.json');
const SOURCE_PATH = path.join(ROOT, 'database/shared/geonames-selected-2026-07-10.tsv');
const RUNTIME_PATH = path.join(ROOT, 'src/lib/cities.runtime.json');
const ARTIFACT_PATH = path.join(ROOT, 'docs/validation/artifacts/shared-time-cities-audit-2026-07-10.json');

const checks = [];

const CHINA_ADMIN1_BY_REGION = {
  安徽: '01', 浙江: '02', 江西: '03', 江苏: '04', 吉林: '05', 青海: '06', 福建: '07', 黑龙江: '08',
  河南: '09', 河北: '10', 湖南: '11', 湖北: '12', 新疆: '13', 西藏: '14', 甘肃: '15', 广西: '16',
  贵州: '18', 辽宁: '19', 内蒙古: '20', 宁夏: '21', 北京: '22', 上海: '23', 山西: '24', 山东: '25',
  陕西: '26', 天津: '28', 云南: '29', 广东: '30', 海南: '31', 四川: '32', 重庆: '33',
};

function record(category, name, actual, expected) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({ category, name, passed, actual, expected });
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function equationOfTimeOracle({ year, month, day, hour = 12, minute = 0 }) {
  const current = new Date(0);
  current.setUTCFullYear(year, month - 1, day);
  current.setUTCHours(0, 0, 0, 0);
  const start = new Date(0);
  start.setUTCFullYear(year, 0, 1);
  start.setUTCHours(0, 0, 0, 0);
  const dayOfYear = (current - start) / 86400000 + 1;
  const denominator = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
  const gamma = (2 * Math.PI / denominator) * (dayOfYear - 1 + (hour + minute / 60 - 12) / 24);
  return 229.18 * (
    0.000075
    + 0.001868 * Math.cos(gamma)
    - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma)
    - 0.040849 * Math.sin(2 * gamma)
  );
}

function parseSourceRows(text) {
  return text.trim().split('\n').map((line) => {
    const [collection, ...fields] = line.split('\t');
    return {
      collection,
      geonameId: Number(fields[0]),
      sourceName: fields[1],
      latitude: Number(fields[4]),
      longitude: Number(fields[5]),
      featureCode: fields[7],
      countryCode: fields[8],
      admin1Code: fields[10],
      population: Number(fields[14]) || 0,
      timeZone: fields[17],
      modifiedDate: fields[18],
      rawRecordSha256: sha256(fields.join('\t')),
    };
  });
}

const [coreText, legacyText, sourceText, runtimeText] = await Promise.all([
  readFile(CORE_PATH, 'utf8'),
  readFile(LEGACY_PATH, 'utf8'),
  readFile(SOURCE_PATH, 'utf8'),
  readFile(RUNTIME_PATH, 'utf8'),
]);
const core = JSON.parse(coreText);
const legacy = JSON.parse(legacyText);
const sourceRows = parseSourceRows(sourceText);
const runtimeSnapshot = JSON.parse(runtimeText);
const sourceById = new Map(sourceRows.map(row => [row.geonameId, row]));
const runtimeById = new Map(CHINA_CITIES.map(city => [city.geonameId, city]));

record('contract', 'schema_version', core.schemaVersion, 1);
record('contract', 'status', core.status, 'source_pinned_full_runtime_city_domain');
record('contract', 'runtime_status', CITY_DATA_MODEL.status, core.status);
record('contract', 'source_license', core.sourceLicense, 'GeoNames CC BY 4.0');
record('contract', 'city_count', core.cities.length, 374);
record('contract', 'runtime_count', CHINA_CITIES.length, 374);
record('contract', 'runtime_snapshot_count', runtimeSnapshot.cities.length, 374);
record('contract', 'runtime_core_hash', runtimeSnapshot.sourceCoreSha256, sha256(coreText));
record('contract', 'source_row_count', sourceRows.length, 374);
record('contract', 'selected_source_hash', sha256(sourceText), core.selectedSourceSnapshot.sha256);
record('contract', 'legacy_count', legacy.cities.length, 374);

record('identity', 'unique_labels', new Set(core.cities.map(city => `${city.name}|${city.province}`)).size, 374);
record('identity', 'unique_geoname_ids', new Set(core.cities.map(city => city.geonameId)).size, 374);
record('identity', 'legacy_labels_preserved',
  [...new Set(core.cities.map(city => `${city.name}|${city.province}`))].sort(),
  [...new Set(legacy.cities.map(city => `${city.name}|${city.province}`))].sort());

for (const city of core.cities) {
  const source = sourceById.get(city.geonameId);
  const runtime = runtimeById.get(city.geonameId);
  record('source_rows', `${city.name}_source_present`, Boolean(source), true);
  if (!source) continue;
  record('source_rows', `${city.name}_source_name`, city.sourceName, source.sourceName);
  record('source_rows', `${city.name}_latitude`, city.lat, source.latitude);
  record('source_rows', `${city.name}_longitude`, city.lng, source.longitude);
  record('source_rows', `${city.name}_country`, city.countryCode, source.countryCode);
  record('source_rows', `${city.name}_admin1_source`, city.sourceAdmin1Code, source.admin1Code);
  if (city.countryCode === 'CN') {
    record('source_rows', `${city.name}_admin1_contract`, city.sourceAdmin1Code, CHINA_ADMIN1_BY_REGION[city.province]);
  }
  record('source_rows', `${city.name}_feature`, city.featureCode, source.featureCode);
  record('source_rows', `${city.name}_population`, city.population, source.population);
  record('source_rows', `${city.name}_modified`, city.sourceModifiedDate, source.modifiedDate);
  record('source_rows', `${city.name}_collection`, city.sourceCollection, source.collection);
  record('source_rows', `${city.name}_raw_hash`, city.rawRecordSha256, source.rawRecordSha256);
  record('source_rows', `${city.name}_source_timezone`, city.sourceTimeZone ?? city.timeZone, source.timeZone);
  const expectedRuntime = {
    id: city.id,
    name: city.name,
    province: city.province,
    ...(city.en ? { en: city.en } : {}),
    geonameId: city.geonameId,
    lat: city.lat,
    lng: city.lng,
    countryCode: city.countryCode,
    timeZone: city.timeZone,
    ...(city.sourceTimeZone ? { sourceTimeZone: city.sourceTimeZone } : {}),
  };
  record('runtime_parity', `${city.name}_runtime`, runtime, expectedRuntime);
  record('runtime_parity', `${city.name}_iana_supported`, (() => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: city.timeZone });
      return true;
    } catch {
      return false;
    }
  })(), true);
}

let enumeratedDays = 0;
for (let year = 1900; year <= 2100; year += 1) {
  const cursor = new Date(Date.UTC(year, 0, 1, 12));
  while (cursor.getUTCFullYear() === year) {
    const dateParts = {
      year,
      month: cursor.getUTCMonth() + 1,
      day: cursor.getUTCDate(),
      hour: 12,
      minute: 0,
    };
    record('equation_of_time', `${year}-${dateParts.month}-${dateParts.day}`,
      Number(calcEquationOfTime(dateParts).toFixed(12)),
      Number(equationOfTimeOracle(dateParts).toFixed(12)));
    enumeratedDays += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

const sampleDates = [];
for (const year of [1900, 1950, 1990, 2025]) {
  for (let month = 1; month <= 12; month += 1) sampleDates.push({ year, month, day: 15, hour: 12, minute: 0 });
}
for (const city of core.cities) {
  for (const dateParts of sampleDates) {
    const label = `${city.name}_${dateParts.year}_${dateParts.month}`;
    const resolution = resolveCivilTimeOffset(city.timeZone, dateParts);
    record('city_time_samples', `${label}_status`, resolution.status, 'exact');
    if (resolution.status !== 'exact') continue;
    const correction = calcCitySolarTimeOffset(city, dateParts);
    const expected = Math.round(
      resolution.selectedOffset - city.lng * 4 - equationOfTimeOracle(dateParts),
    );
    record('city_time_samples', `${label}_utc_offset`, correction.utcOffsetMinutes, resolution.selectedOffset);
    record('city_time_samples', `${label}_solar_offset`, correction.offsetMinutes, expected);
  }
}

const transitionFixtures = [
  ['ny_summer', 'America/New_York', { year: 2025, month: 7, day: 15, hour: 12, minute: 0 }, 'exact', [-240]],
  ['ny_repeat', 'America/New_York', { year: 2025, month: 11, day: 2, hour: 1, minute: 30 }, 'ambiguous', [-300, -240]],
  ['ny_gap', 'America/New_York', { year: 2025, month: 3, day: 9, hour: 2, minute: 30 }, 'nonexistent', []],
  ['london_repeat', 'Europe/London', { year: 2025, month: 10, day: 26, hour: 1, minute: 30 }, 'ambiguous', [0, 60]],
  ['london_gap', 'Europe/London', { year: 2025, month: 3, day: 30, hour: 1, minute: 30 }, 'nonexistent', []],
  ['sydney_repeat', 'Australia/Sydney', { year: 2025, month: 4, day: 6, hour: 2, minute: 30 }, 'ambiguous', [600, 660]],
  ['sydney_gap', 'Australia/Sydney', { year: 2025, month: 10, day: 5, hour: 2, minute: 30 }, 'nonexistent', []],
  ['shanghai_historic_dst', 'Asia/Shanghai', { year: 1990, month: 7, day: 1, hour: 12, minute: 0 }, 'exact', [540]],
  ['shanghai_current', 'Asia/Shanghai', { year: 2025, month: 7, day: 1, hour: 12, minute: 0 }, 'exact', [480]],
  ['india_half_hour', 'Asia/Kolkata', { year: 2025, month: 7, day: 1, hour: 12, minute: 0 }, 'exact', [330]],
];
for (const [name, timeZone, dateParts, status, offsets] of transitionFixtures) {
  const result = resolveCivilTimeOffset(timeZone, dateParts);
  record('transition_fixtures', `${name}_status`, result.status, status);
  record('transition_fixtures', `${name}_offsets`, result.offsets, offsets);
}

const lasVegas = core.cities.find(city => city.name === '拉斯维加斯');
const urumqi = core.cities.find(city => city.name === '乌鲁木齐');
const legacyLasVegas = legacy.cities.find(city => city.name === '拉斯维加斯');
record('adjudications', 'las_vegas_legacy_fixed_meridian', legacyLasVegas.stdMeridian, -105);
record('adjudications', 'las_vegas_iana_zone', lasVegas.timeZone, 'America/Los_Angeles');
record('adjudications', 'urumqi_product_civil_zone', urumqi.timeZone, 'Asia/Shanghai');
record('adjudications', 'urumqi_geonames_source_zone', urumqi.sourceTimeZone, 'Asia/Urumqi');
record('adjudications', 'legacy_fixed_meridian_count', legacy.cities.filter(city => city.stdMeridian !== undefined).length, 92);

const activeConsumerPaths = [
  'src/components/BirthCityPicker.jsx',
  'src/modules/bazi/BaziModule.jsx',
  'src/modules/bazihealth/BaziHealthModule.jsx',
  'src/modules/ziwei/ZiweiModule.jsx',
  'src/modules/qimen/QimenModule.jsx',
];
for (const relativePath of activeConsumerPaths) {
  const source = await readFile(path.join(ROOT, relativePath), 'utf8');
  record('consumer_paths', `${relativePath}_iana_api`, source.includes('calcCitySolarTimeOffset'), true);
  record('consumer_paths', `${relativePath}_no_fixed_api`, source.includes('calcTrueSolarTimeOffset'), false);
  record('consumer_paths', `${relativePath}_no_std_meridian`, source.includes('stdMeridian'), false);
}

const categorySummary = {};
for (const check of checks) {
  categorySummary[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categorySummary[check.category].checks += 1;
  categorySummary[check.category][check.passed ? 'passed' : 'failed'] += 1;
}
const failures = checks.filter(check => !check.passed);
const artifact = {
  audit: 'shared-time-cities',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass_source_pinned_city_and_civil_time_core' : 'fail',
  summary: {
    checks: checks.length,
    failures: failures.length,
    cities: core.cities.length,
    sourceRows: sourceRows.length,
    equationOfTimeDays: enumeratedDays,
    cityTimeSamples: core.cities.length * sampleDates.length,
    transitionFixtures: transitionFixtures.length,
  },
  categories: categorySummary,
  scope: core.scope,
  civilTimePolicy: core.civilTimePolicy,
  sourceRefs: core.sourceArchives,
  relevantSha256: {
    normalizedCore: sha256(coreText),
    selectedGeoNamesSource: sha256(sourceText),
    runtimeSnapshot: sha256(runtimeText),
    legacyBaseline: sha256(legacyText),
  },
  failures: failures.slice(0, 100),
};

await mkdir(path.dirname(ARTIFACT_PATH), { recursive: true });
await writeFile(ARTIFACT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ result: artifact.result, ...artifact.summary, categories: categorySummary }, null, 2));
if (failures.length > 0) process.exitCode = 1;
