import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { paiBazi } from '../../src/modules/bazi/engine.js';
import {
  adjustBirthTime,
  calcTrueSolarTimeOffset,
} from '../../src/lib/cities.js';

const require = createRequire(import.meta.url);
const { Solar } = require('lunar-javascript');
const lunarPackage = require('lunar-javascript/package.json');

const auditDate = '2026-07-09';
const outputPath = path.resolve(
  'docs/validation/artifacts/bazi-audit-2026-07-09-after-fix.json',
);
const jieNames = [
  '立春', '惊蛰', '清明', '立夏', '芒种', '小暑',
  '立秋', '白露', '寒露', '立冬', '大雪', '小寒',
];

const cases = [
  { id: 'BZ-ORD-01', group: 'ordinary', input: [2005, 12, 23, 8, 37], gender: 'male' },
  { id: 'BZ-ORD-02', group: 'ordinary', input: [1988, 2, 15, 22, 30], gender: 'female' },
  { id: 'BZ-ORD-03', group: 'ordinary', input: [1990, 7, 15, 12, 0], gender: 'male' },
  { id: 'BZ-ORD-04', group: 'ordinary', input: [2000, 1, 15, 10, 0], gender: 'female' },
  { id: 'BZ-ORD-05', group: 'ordinary', input: [2010, 10, 10, 14, 30], gender: 'male' },
  { id: 'BZ-ORD-06', group: 'ordinary', input: [2024, 5, 20, 8, 0], gender: 'female' },
  { id: 'BZ-LC-01', group: 'lichun_boundary', input: [2024, 2, 4, 16, 26], gender: 'male' },
  { id: 'BZ-LC-02', group: 'lichun_boundary', input: [2024, 2, 4, 16, 28], gender: 'female' },
  { id: 'BZ-LC-03', group: 'lichun_boundary', input: [2025, 2, 3, 22, 9], gender: 'male' },
  { id: 'BZ-LC-04', group: 'lichun_boundary', input: [2025, 2, 3, 22, 11], gender: 'female' },
  {
    id: 'BZ-JIE-01',
    group: 'jie_boundary',
    input: [1999, 6, 6, 12, 0],
    gender: 'male',
    note: 'HKO calendar places Corn on Ear on 1999-06-06.',
  },
  {
    id: 'BZ-JIE-02',
    group: 'jie_boundary',
    input: [1999, 6, 7, 9, 11],
    gender: 'female',
    note: 'More than one calendar day after the HKO Corn on Ear date.',
  },
  { id: 'BZ-JIE-03', group: 'jie_boundary', input: [2025, 6, 5, 17, 55], gender: 'male' },
  { id: 'BZ-JIE-04', group: 'jie_boundary', input: [2025, 6, 5, 17, 57], gender: 'female' },
  { id: 'BZ-JIE-05', group: 'jie_boundary', input: [2026, 3, 5, 21, 58], gender: 'male' },
  { id: 'BZ-JIE-06', group: 'jie_boundary', input: [2026, 3, 5, 22, 0], gender: 'female' },
  { id: 'BZ-ZI-01', group: 'zi_boundary', input: [1988, 2, 15, 22, 59], gender: 'male' },
  { id: 'BZ-ZI-02', group: 'zi_boundary', input: [1988, 2, 15, 23, 0], gender: 'male' },
  { id: 'BZ-ZI-03', group: 'zi_boundary', input: [1988, 2, 15, 23, 59], gender: 'female' },
  { id: 'BZ-ZI-04', group: 'zi_boundary', input: [1988, 2, 16, 0, 0], gender: 'female' },
  { id: 'BZ-CAL-01', group: 'calendar_edge', input: [2000, 2, 29, 12, 0], gender: 'male' },
  { id: 'BZ-CAL-02', group: 'calendar_edge', input: [2024, 2, 29, 12, 0], gender: 'female' },
  { id: 'BZ-CAL-03', group: 'calendar_edge', input: [2024, 12, 31, 23, 0], gender: 'male' },
  {
    id: 'BZ-SOLAR-01',
    group: 'standard_time_solar_adjustment',
    input: [2005, 12, 23, 0, 30],
    gender: 'male',
    location: { name: 'Kashgar', longitude: 75.99, standardMeridian: 120 },
  },
  {
    id: 'BZ-SOLAR-02',
    group: 'standard_time_solar_adjustment',
    input: [2024, 5, 20, 0, 58],
    gender: 'female',
    location: { name: 'New York', longitude: -74.01, standardMeridian: -75 },
  },
  {
    id: 'BZ-SOLAR-03',
    group: 'standard_time_solar_adjustment',
    input: [2025, 2, 4, 0, 30],
    gender: 'male',
    location: { name: 'Singapore', longitude: 103.82, standardMeridian: 120 },
  },
  { id: 'BZ-DY-01', group: 'dayun_january', input: [2025, 1, 1, 12, 0], gender: 'male' },
  { id: 'BZ-DY-02', group: 'dayun_january', input: [2025, 1, 1, 12, 0], gender: 'female' },
  { id: 'BZ-DY-03', group: 'dayun_january', input: [2025, 1, 7, 12, 0], gender: 'male' },
  { id: 'BZ-DY-04', group: 'dayun_january', input: [2025, 1, 7, 12, 0], gender: 'female' },
];

function civilParts(timestamp) {
  const date = new Date(timestamp);
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  ];
}

function solarTimestamp(solar) {
  return Date.UTC(
    solar.getYear(),
    solar.getMonth() - 1,
    solar.getDay(),
    solar.getHour(),
    solar.getMinute(),
    solar.getSecond(),
  );
}

function prepareInput(testCase) {
  const [year, month, day, hour, minute] = testCase.input;
  if (!testCase.location) {
    return { effectiveInput: testCase.input, adjustment: null };
  }

  const offsetMinutes = calcTrueSolarTimeOffset(
    testCase.location.longitude,
    testCase.location.standardMeridian,
    { year, month, day, hour, minute },
  );
  const adjusted = adjustBirthTime(
    year,
    month,
    day,
    hour,
    minute,
    offsetMinutes,
  );

  return {
    effectiveInput: [
      adjusted.year,
      adjusted.month,
      adjusted.day,
      adjusted.hour,
      adjusted.minute,
    ],
    adjustment: {
      ...testCase.location,
      offsetMinutes,
      adjusted,
      equationOfTimeApplied: true,
      limitation: 'Uses the stated standard meridian; historical civil timezone and DST remain a separate validation unit.',
    },
  };
}

function pillarStrings(result) {
  return ['year', 'month', 'day', 'hour'].map(
    (key) => result.pillars[key].stem + result.pillars[key].branch,
  );
}

function libraryResult(input, gender) {
  const [year, month, day, hour, minute] = input;
  const eightChar = Solar.fromYmdHms(
    year,
    month,
    day,
    hour,
    minute,
    0,
  ).getLunar().getEightChar();
  eightChar.setSect(1);
  const yun = eightChar.getYun(gender === 'male' ? 1 : 0);
  const exactStart = {
    years: yun.getStartYear(),
    months: yun.getStartMonth(),
    days: yun.getStartDay(),
    solarDate: yun.getStartSolar().toYmd(),
  };
  const decimalYears = exactStart.years
    + exactStart.months / 12
    + exactStart.days / 360;

  return {
    pillars: [
      eightChar.getYear(),
      eightChar.getMonth(),
      eightChar.getDay(),
      eightChar.getTime(),
    ],
    dayun: {
      exactStart,
      roundedStartAge: Math.max(1, Math.round(decimalYears)),
      firstPillar: yun.getDaYun()[1].getGanZhi(),
    },
  };
}

function yearMonthPair(input, source) {
  if (source === 'runtime') {
    const result = paiBazi(...input, 'male');
    return [
      result.pillars.year.stem + result.pillars.year.branch,
      result.pillars.month.stem + result.pillars.month.branch,
    ];
  }
  return libraryResult(input, 'male').pillars.slice(0, 2);
}

function scanRuntimeBoundaryAdapter() {
  const rows = [];
  let mismatchChecks = 0;

  for (let year = 1920; year <= 2027; year += 1) {
    const table = Solar.fromYmd(year, 7, 1).getLunar().getJieQiTable();
    const boundaries = [
      ...jieNames.slice(0, 11).map((name) => table[name]),
      table['小寒'],
    ];

    assert.equal(
      boundaries.every((boundary) => boundary.getYear() === year),
      true,
      `JieQi table lookup escaped the audited civil year ${year}`,
    );

    boundaries.forEach((boundary, index) => {
      const exactTimestamp = solarTimestamp(boundary);
      const beforeTimestamp = boundary.getSecond() === 0
        ? exactTimestamp - 60000
        : exactTimestamp - boundary.getSecond() * 1000;
      const afterTimestamp = boundary.getSecond() === 0
        ? exactTimestamp
        : exactTimestamp + (60 - boundary.getSecond()) * 1000;
      const checks = [
        { side: 'before', input: civilParts(beforeTimestamp) },
        { side: 'after', input: civilParts(afterTimestamp) },
      ].map(({ side, input }) => {
        const runtime = yearMonthPair(input, 'runtime');
        const library = yearMonthPair(input, 'library');
        const match = runtime[0] === library[0] && runtime[1] === library[1];
        if (!match) mismatchChecks += 1;
        return { side, input, runtime, library, match };
      });

      rows.push({
        year,
        jie: jieNames[index],
        exact: [
          boundary.getYear(),
          boundary.getMonth(),
          boundary.getDay(),
          boundary.getHour(),
          boundary.getMinute(),
          boundary.getSecond(),
        ],
        checks,
      });
    });
  }

  return {
    summary: {
      years: '1920-2027',
      boundaries: rows.length,
      checks: rows.length * 2,
      mismatchChecks,
      interpretation: 'Checks current runtime wiring immediately before and after every supported Jie boundary.',
    },
    results: rows,
  };
}

const results = cases.map((testCase) => {
  const { effectiveInput, adjustment } = prepareInput(testCase);
  const current = paiBazi(...effectiveInput, testCase.gender);
  const library = libraryResult(effectiveInput, testCase.gender);
  const currentPillars = pillarStrings(current);
  const pillarMismatches = currentPillars.flatMap((value, index) => (
    value === library.pillars[index]
      ? []
      : [{ pillar: ['year', 'month', 'day', 'hour'][index], current: value, library: library.pillars[index] }]
  ));
  const currentDayun = {
    exactStart: {
      years: current.dayunStart.years,
      months: current.dayunStart.months,
      days: current.dayunStart.days,
      solarDate: current.dayunStart.solarDate,
    },
    roundedStartAge: current.dayun[0].startAge,
    firstPillar: current.dayun[0].stem + current.dayun[0].branch,
  };
  const dayunMismatch = JSON.stringify(currentDayun)
    !== JSON.stringify(library.dayun);

  return {
    id: testCase.id,
    group: testCase.group,
    originalInput: testCase.input,
    effectiveInput,
    gender: testCase.gender,
    note: testCase.note ?? null,
    adjustment,
    current: {
      pillars: currentPillars,
      isApprox: current.isApprox,
      jieqiName: current.jieqiName,
      dayun: currentDayun,
      calendar: current.calendar,
    },
    library,
    verdict: {
      pillars: pillarMismatches.length === 0 ? 'match' : 'mismatch',
      pillarMismatches,
      dayun: dayunMismatch ? 'mismatch' : 'match_exact_start',
    },
  };
});

const boundaryAdapterAudit = scanRuntimeBoundaryAdapter();
const historicalRegressionInput = [2000, 10, 17, 14, 0];
const historicalRegressionCurrent = paiBazi(
  ...historicalRegressionInput,
  'male',
);
const historicalRegressionLibrary = libraryResult(
  historicalRegressionInput,
  'male',
);
const historicalRegression = {
  commit: 'd47165b',
  reason: 'Regression for the former 2024-02-04 day-pillar base error.',
  input: historicalRegressionInput,
  current: pillarStrings(historicalRegressionCurrent),
  library: historicalRegressionLibrary.pillars,
  verdict: pillarStrings(historicalRegressionCurrent).every(
    (value, index) => value === historicalRegressionLibrary.pillars[index],
  ) ? 'match' : 'mismatch',
};

const report = {
  auditDate,
  stage: 'after_fix',
  scope: 'Current BaZi runtime: 30 stratified cases plus 2,592 boundary-side adapter checks',
  currentPolicy: {
    calendarEngine: `lunar-javascript@${lunarPackage.version}`,
    yearBoundary: 'Spring Commences / Lichun',
    monthBoundary: '12 minor solar terms / Jie',
    dayBoundary: '23:00, Sect 1',
    solarAdjustment: 'Equation of time plus longitude under the stated standard meridian',
  },
  comparator: {
    name: 'lunar-javascript',
    version: lunarPackage.version,
    role: 'Runtime adapter parity oracle after remediation; no longer an independent implementation.',
  },
  officialAnchors: [
    {
      source: 'Hong Kong Observatory Gregorian-Lunar Calendar Conversion Table of 1999',
      url: 'https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/1999e.pdf',
      fact: 'Corn on Ear occurred on 1999-06-06.',
    },
    {
      source: 'NOAA General Solar Position Calculations',
      url: 'https://gml.noaa.gov/grad/solcalc/solareqns.PDF',
      fact: 'True solar time offset includes equation of time, longitude, and timezone.',
    },
  ],
  summary: {
    totalCases: results.length,
    pillarMismatchCases: results.filter((item) => item.verdict.pillars === 'mismatch').length,
    dayunMismatchCases: results.filter((item) => item.verdict.dayun === 'mismatch').length,
    approximateCases: results.filter((item) => item.current.isApprox).length,
    boundaryAdapterAudit: boundaryAdapterAudit.summary,
    groups: Object.fromEntries(
      [...new Set(results.map((item) => item.group))].map((group) => {
        const members = results.filter((item) => item.group === group);
        return [group, {
          cases: members.length,
          pillarMismatches: members.filter((item) => item.verdict.pillars === 'mismatch').length,
          dayunMismatches: members.filter((item) => item.verdict.dayun === 'mismatch').length,
        }];
      }),
    ),
  },
  limitations: [
    'The post-fix library comparison proves adapter parity, not independent calendar correctness.',
    'HKO and the historical calibrated chart remain external regression anchors; a second implementation is still required for a broader V3 claim.',
    'Sect 1 is an explicit school policy, not a universal day-boundary rule.',
    'Solar correction now includes equation of time but still assumes the stated standard meridian; historical civil timezone and DST remain unverified.',
  ],
  historicalRegression,
  boundaryAdapterAudit,
  results,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
console.log(`Wrote ${outputPath}`);
