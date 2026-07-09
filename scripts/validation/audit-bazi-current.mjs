import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import { paiBazi } from '../../src/modules/bazi/engine.js';
import {
  approxJieqiDate,
  JIEQI_NAMES,
  JIEQI_PRECISE,
} from '../../src/modules/bazi/data.js';
import {
  adjustBirthTime,
  calcTrueSolarTimeOffset,
} from '../../src/lib/cities.js';

const require = createRequire(import.meta.url);
const { Solar } = require('lunar-javascript');
const lunarPackage = require('lunar-javascript/package.json');

const auditDate = '2026-07-09';
const outputPath = path.resolve(
  'docs/validation/artifacts/bazi-audit-2026-07-09.json',
);

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
    group: 'mean_solar_adjustment',
    input: [2005, 12, 23, 0, 30],
    gender: 'male',
    location: { name: 'Kashgar', longitude: 75.99, standardMeridian: 120 },
  },
  {
    id: 'BZ-SOLAR-02',
    group: 'mean_solar_adjustment',
    input: [2024, 5, 20, 0, 58],
    gender: 'female',
    location: { name: 'New York', longitude: -74.01, standardMeridian: -75 },
  },
  {
    id: 'BZ-SOLAR-03',
    group: 'mean_solar_adjustment',
    input: [2025, 2, 4, 0, 30],
    gender: 'male',
    location: { name: 'Singapore', longitude: 103.82, standardMeridian: 120 },
  },

  { id: 'BZ-DY-01', group: 'dayun_january', input: [2025, 1, 1, 12, 0], gender: 'male' },
  { id: 'BZ-DY-02', group: 'dayun_january', input: [2025, 1, 1, 12, 0], gender: 'female' },
  { id: 'BZ-DY-03', group: 'dayun_january', input: [2025, 1, 7, 12, 0], gender: 'male' },
  { id: 'BZ-DY-04', group: 'dayun_january', input: [2025, 1, 7, 12, 0], gender: 'female' },
];

function prepareInput(testCase) {
  const [year, month, day, hour, minute] = testCase.input;
  if (!testCase.location) {
    return { effectiveInput: testCase.input, adjustment: null };
  }

  const offsetMinutes = calcTrueSolarTimeOffset(
    testCase.location.longitude,
    testCase.location.standardMeridian,
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
      limitation: 'Longitude correction only; equation of time is not applied.',
    },
  };
}

function pillarStrings(result) {
  return ['year', 'month', 'day', 'hour'].map(
    (key) => result.pillars[key].stem + result.pillars[key].branch,
  );
}

function independentResult(input, gender) {
  const [year, month, day, hour, minute] = input;
  const eightChar = Solar.fromYmdHms(
    year,
    month,
    day,
    hour,
    minute,
    0,
  ).getLunar().getEightChar();

  // Sect 1 matches the current engine's declared 23:00 day boundary.
  eightChar.setSect(1);
  const pillars = [
    eightChar.getYear(),
    eightChar.getMonth(),
    eightChar.getDay(),
    eightChar.getTime(),
  ];

  // lunar-javascript uses 1 for male and 0 for female.
  const yun = eightChar.getYun(gender === 'male' ? 1 : 0);
  const firstDayun = yun.getDaYun()[1];
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
    pillars,
    dayun: {
      exactStart,
      roundedStartAge: Math.max(1, Math.round(decimalYears)),
      firstPillar: firstDayun.getGanZhi(),
    },
  };
}

function toBeijingParts(timestamp) {
  const date = new Date(timestamp + 8 * 60 * 60 * 1000);
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  ];
}

function yearMonthPair(input, source) {
  const [year, month, day, hour, minute] = input;
  if (source === 'current') {
    const result = paiBazi(year, month, day, hour, minute, 'male');
    return [
      result.pillars.year.stem + result.pillars.year.branch,
      result.pillars.month.stem + result.pillars.month.branch,
    ];
  }

  const eightChar = Solar.fromYmdHms(
    year,
    month,
    day,
    hour,
    minute,
    0,
  ).getLunar().getEightChar();
  eightChar.setSect(1);
  return [eightChar.getYear(), eightChar.getMonth()];
}

function scanPreciseBoundaryTable() {
  return Object.entries(JIEQI_PRECISE).flatMap(([tableYear, times]) => (
    times.map((declaredTimestamp, index) => {
      const baselineInput = toBeijingParts(declaredTimestamp - 60 * 60 * 1000);
      const baseline = yearMonthPair(baselineInput, 'independent');
      let independentDeltaMinutes = null;

      for (let delta = -60; delta <= 60; delta += 1) {
        const input = toBeijingParts(declaredTimestamp + delta * 60 * 1000);
        const pair = yearMonthPair(input, 'independent');
        if (pair[0] !== baseline[0] || pair[1] !== baseline[1]) {
          independentDeltaMinutes = delta;
          break;
        }
      }

      const declaredInput = toBeijingParts(declaredTimestamp);
      const independentTransitionInput = independentDeltaMinutes === null
        ? null
        : toBeijingParts(
          declaredTimestamp + independentDeltaMinutes * 60 * 1000,
        );
      const deltaMagnitude = independentDeltaMinutes === null
        ? null
        : Math.abs(independentDeltaMinutes);

      return {
        tableYear: Number(tableYear),
        jie: JIEQI_NAMES[index],
        declaredInput,
        independentTransitionInput,
        deltaMinutes: independentDeltaMinutes,
        verdict: independentDeltaMinutes === null
          ? 'blocked'
          : deltaMagnitude <= 1
            ? 'same_minute_or_seconds_resolution'
            : 'material_mismatch',
      };
    })
  ));
}

function solarToUtcTimestamp(solar) {
  return Date.UTC(
    solar.getYear(),
    solar.getMonth() - 1,
    solar.getDay(),
    solar.getHour() - 8,
    solar.getMinute(),
    solar.getSecond(),
  );
}

function scanSupportedYearRange() {
  const rows = [];
  for (let year = 1920; year <= 2027; year += 1) {
    const independentTable = Solar.fromYmd(year, 7, 1)
      .getLunar()
      .getJieQiTable();
    const independentBoundaries = [
      ...JIEQI_NAMES.slice(0, 11).map((name) => independentTable[name]),
      independentTable.XIAO_HAN,
    ];

    for (let index = 0; index < JIEQI_NAMES.length; index += 1) {
      const name = JIEQI_NAMES[index];
      const currentTimestamp = JIEQI_PRECISE[year]?.[index]
        ?? approxJieqiDate(index === 11 ? year + 1 : year, name);
      const independentTimestamp = solarToUtcTimestamp(
        independentBoundaries[index],
      );
      const deltaMinutes = (currentTimestamp - independentTimestamp) / 60000;
      rows.push({
        year,
        jie: name,
        currentInput: toBeijingParts(currentTimestamp),
        independentInput: [
          independentBoundaries[index].getYear(),
          independentBoundaries[index].getMonth(),
          independentBoundaries[index].getDay(),
          independentBoundaries[index].getHour(),
          independentBoundaries[index].getMinute(),
          independentBoundaries[index].getSecond(),
        ],
        deltaMinutes: Number(deltaMinutes.toFixed(3)),
        absoluteDeltaMinutes: Number(Math.abs(deltaMinutes).toFixed(3)),
        currentSource: JIEQI_PRECISE[year] ? 'handwritten_precise_table' : 'approx_formula',
      });
    }
  }

  const absoluteDeltas = rows.map((item) => item.absoluteDeltaMinutes);
  const totalMismatchHours = absoluteDeltas.reduce(
    (sum, value) => sum + value,
    0,
  ) / 60;
  const supportedRangeHours = 108 * 365.2422 * 24;
  const largest = [...rows]
    .sort((a, b) => b.absoluteDeltaMinutes - a.absoluteDeltaMinutes)
    .slice(0, 20);

  return {
    summary: {
      years: '1920-2027',
      totalBoundaries: rows.length,
      withinOneMinute: absoluteDeltas.filter((value) => value <= 1).length,
      overOneMinute: absoluteDeltas.filter((value) => value > 1).length,
      overOneHour: absoluteDeltas.filter((value) => value > 60).length,
      overTwelveHours: absoluteDeltas.filter((value) => value > 720).length,
      overTwentyFourHours: absoluteDeltas.filter((value) => value > 1440).length,
      maximumDeltaMinutes: Math.max(...absoluteDeltas),
      aggregateMismatchWindowHours: Number(totalMismatchHours.toFixed(3)),
      approximateShareOfSupportedTime: Number(
        (totalMismatchHours / supportedRangeHours).toFixed(5),
      ),
      interpretation: 'Potential year/month mismatch exists only inside each boundary delta window, not across the entire year.',
    },
    largest,
    results: rows,
  };
}

const results = cases.map((testCase) => {
  const { effectiveInput, adjustment } = prepareInput(testCase);
  const current = paiBazi(...effectiveInput, testCase.gender);
  const independent = independentResult(effectiveInput, testCase.gender);
  const currentPillars = pillarStrings(current);
  const pillarMismatches = currentPillars.flatMap((value, index) => (
    value === independent.pillars[index]
      ? []
      : [{ pillar: ['year', 'month', 'day', 'hour'][index], current: value, independent: independent.pillars[index] }]
  ));
  const currentDayun = {
    roundedStartAge: current.dayun[0].startAge,
    firstPillar: current.dayun[0].stem + current.dayun[0].branch,
  };
  const dayunMismatch = currentDayun.roundedStartAge
      !== independent.dayun.roundedStartAge
    || currentDayun.firstPillar !== independent.dayun.firstPillar;

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
    },
    independent: {
      ...independent,
      dayun: independent.dayun,
    },
    verdict: {
      pillars: pillarMismatches.length === 0 ? 'match' : 'mismatch',
      pillarMismatches,
      dayun: dayunMismatch ? 'mismatch' : 'match_at_integer_precision',
    },
  };
});

const historicalRegressionInput = [2000, 10, 17, 14, 0];
const historicalRegressionCurrent = paiBazi(
  ...historicalRegressionInput,
  'male',
);
const historicalRegressionIndependent = independentResult(
  historicalRegressionInput,
  'male',
);
const historicalRegression = {
  commit: 'd47165b',
  reason: 'Regression for the former 2024-02-04 day-pillar base error.',
  input: historicalRegressionInput,
  current: pillarStrings(historicalRegressionCurrent),
  independent: historicalRegressionIndependent.pillars,
  verdict: pillarStrings(historicalRegressionCurrent).every(
    (value, index) => value === historicalRegressionIndependent.pillars[index],
  ) ? 'match' : 'mismatch',
};

const preciseBoundaryScan = scanPreciseBoundaryTable();
const materialBoundaryMismatches = preciseBoundaryScan.filter(
  (item) => item.verdict === 'material_mismatch',
);
const supportedYearBoundaryAudit = scanSupportedYearRange();

const report = {
  auditDate,
  scope: 'Current BaZi engine: 30 stratified cases',
  currentPolicy: {
    civilTimeAssumption: 'Effective input treated as UTC+8 Beijing time',
    yearBoundary: 'Spring Commences / Lichun',
    monthBoundary: '12 minor solar terms / Jie',
    dayBoundary: '23:00, Sect 1 comparator',
    solarAdjustment: 'Longitude correction only, not complete apparent solar time',
  },
  comparator: {
    name: 'lunar-javascript',
    version: lunarPackage.version,
    role: 'Independent implementation, not sole authority',
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
    preciseBoundaryWindows: preciseBoundaryScan.length,
    materialPreciseBoundaryMismatches: materialBoundaryMismatches.length,
    supportedYearBoundaryAudit: supportedYearBoundaryAudit.summary,
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
    'A match with lunar-javascript is V3 candidate evidence, not proof of universal correctness.',
    'Dayun comparison reduces exact years/months/days to the current engine integer-age precision.',
    'School-dependent policies require an explicit policy decision before a pass can be assigned.',
    'Solar-adjusted cases validate only the current longitude-adjusted path; equation of time and historical timezone remain unimplemented.',
    'The exact-table scan compares minute-level transitions; differences of one minute or less are retained as seconds-resolution cases, not classified as material errors.',
  ],
  historicalRegression,
  preciseBoundaryScan,
  supportedYearBoundaryAudit,
  results,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
console.log(`Wrote ${outputPath}`);
