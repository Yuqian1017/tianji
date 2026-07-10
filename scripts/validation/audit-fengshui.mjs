import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import { ERSHISI_SHAN, FLY_ORDER, GUA_TO_GONG, JIUGONG } from '../../src/modules/fengshui/data.js';
import {
  FENGSHUI_CALCULATION_MODEL,
  flyStars,
  getBenMingGua,
  paiFengshui,
} from '../../src/modules/fengshui/engine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const paths = {
  data: 'src/modules/fengshui/data.js',
  engine: 'src/modules/fengshui/engine.js',
  overview: 'database/xuanxue/compendium-new/07-fengshui/01-xuankong-feixing.md',
  compass: 'database/xuanxue/compendium-new/07-fengshui/03-luopan-data.md',
  core: 'database/fengshui/fengshui-core.json',
  artifact: 'docs/validation/artifacts/fengshui-core-audit-2026-07-10.json',
};
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');
const GUA_BY_GONG = Object.fromEntries(Object.entries(GUA_TO_GONG).map(([gua, gong]) => [gong, gua]));
const OPPOSITE_GUA = {
  坎: '离', 离: '坎', 艮: '坤', 坤: '艮', 震: '兑', 兑: '震', 巽: '乾', 乾: '巽',
};
const EXPECTED_MOUNTAINS = [
  ['壬', '坎', '地', '阳'], ['子', '坎', '天', '阴'], ['癸', '坎', '人', '阴'],
  ['丑', '艮', '地', '阴'], ['艮', '艮', '天', '阳'], ['寅', '艮', '人', '阳'],
  ['甲', '震', '地', '阳'], ['卯', '震', '天', '阴'], ['乙', '震', '人', '阴'],
  ['辰', '巽', '地', '阴'], ['巽', '巽', '天', '阳'], ['巳', '巽', '人', '阳'],
  ['丙', '离', '地', '阳'], ['午', '离', '天', '阴'], ['丁', '离', '人', '阴'],
  ['未', '坤', '地', '阴'], ['坤', '坤', '天', '阳'], ['申', '坤', '人', '阳'],
  ['庚', '兑', '地', '阳'], ['酉', '兑', '天', '阴'], ['辛', '兑', '人', '阴'],
  ['戌', '乾', '地', '阴'], ['乾', '乾', '天', '阳'], ['亥', '乾', '人', '阳'],
];
const EXPECTED_BY_NAME = Object.fromEntries(EXPECTED_MOUNTAINS.map(row => [row[0], {
  name: row[0], gua: row[1], sanyuan: row[2], yinyang: row[3],
}]));

const categories = {};
const failures = [];
let checks = 0;

function check(category, id, actual, expected) {
  checks += 1;
  const summary = categories[category] ?? { checks: 0, passed: 0, failed: 0 };
  summary.checks += 1;
  if (isDeepStrictEqual(actual, expected)) {
    summary.passed += 1;
  } else {
    summary.failed += 1;
    if (failures.length < 100) failures.push({ category, id, actual, expected });
  }
  categories[category] = summary;
}

function expectedFly(center, forward) {
  return Object.fromEntries(FLY_ORDER.map((palace, index) => [
    palace,
    ((center - 1 + (forward ? index : -index) + 18) % 9) + 1,
  ]));
}

function expectedDirection(center, source) {
  if (center === 5) return source.yinyang === '阳';
  const substitute = Object.values(EXPECTED_BY_NAME).find(item => (
    item.gua === GUA_BY_GONG[center] && item.sanyuan === source.sanyuan
  ));
  return substitute.yinyang === '阳';
}

function expectedChart(period, sittingName) {
  const sitting = EXPECTED_BY_NAME[sittingName];
  const facing = Object.values(EXPECTED_BY_NAME).find(item => (
    item.gua === OPPOSITE_GUA[sitting.gua] && item.sanyuan === sitting.sanyuan
  ));
  const periodChart = expectedFly(period, true);
  const mountainCenter = periodChart[GUA_TO_GONG[sitting.gua]];
  const waterCenter = periodChart[GUA_TO_GONG[facing.gua]];
  return {
    period: periodChart,
    mountain: expectedFly(mountainCenter, expectedDirection(mountainCenter, sitting)),
    water: expectedFly(waterCenter, expectedDirection(waterCenter, facing)),
  };
}

function centerDegree(mountain) {
  return mountain.start < mountain.end ? (mountain.start + mountain.end) / 2 : 0;
}

check('inventory', 'palaces', JIUGONG.map(({ num, name, dir }) => [num, name, dir]), [
  [1, '坎', '北'], [2, '坤', '西南'], [3, '震', '东'], [4, '巽', '东南'], [5, '中', '中'],
  [6, '乾', '西北'], [7, '兑', '西'], [8, '艮', '东北'], [9, '离', '南'],
]);
check('inventory', 'fly_order', FLY_ORDER, [5, 6, 7, 8, 9, 1, 2, 3, 4]);
check(
  'finite_tables',
  'mountains',
  ERSHISI_SHAN.map(({ name, gua, sanyuan, yinyang }) => [name, gua, sanyuan, yinyang]),
  EXPECTED_MOUNTAINS,
);

for (let center = 1; center <= 9; center += 1) {
  check('flying', `${center}/forward`, flyStars(center, true), expectedFly(center, true));
  check('flying', `${center}/reverse`, flyStars(center, false), expectedFly(center, false));
}

let charts = 0;
for (let period = 1; period <= 9; period += 1) {
  const year = 1864 + (period - 1) * 20;
  for (const mountain of ERSHISI_SHAN) {
    const actual = paiFengshui(year, centerDegree(mountain), 2024);
    const expected = expectedChart(period, mountain.name);
    charts += 1;
    for (let palace = 1; palace <= 9; palace += 1) {
      check('period_plate', `${period}/${mountain.name}/${palace}`, actual.yunPan[palace], expected.period[palace]);
      check('mountain_plate', `${period}/${mountain.name}/${palace}`, actual.shanPan[palace], expected.mountain[palace]);
      check('water_plate', `${period}/${mountain.name}/${palace}`, actual.xiangPan[palace], expected.water[palace]);
    }
    check('formation', `${period}/${mountain.name}`, actual.geju.validation, 'validated_structural_label');
  }
}

function expectedKua(year, gender) {
  const lastTwoDigits = year % 100;
  const raw = year < 2000
    ? (gender === 'male' ? 100 - lastTwoDigits : lastTwoDigits - 4)
    : (gender === 'male' ? 99 - lastTwoDigits : lastTwoDigits + 6);
  let number = ((raw % 9) + 9) % 9 || 9;
  if (number === 5) number = gender === 'male' ? 2 : 8;
  return number;
}

for (let year = 1900; year <= 2099; year += 1) {
  for (const gender of ['male', 'female']) {
    check('eight_mansions_kua', `${year}/${gender}`, getBenMingGua(year, gender).number, expectedKua(year, gender));
  }
}

const core = {
  schemaVersion: 1,
  domain: 'fengshui_xuankong_lower_trigram',
  generatedAt: '2026-07-10',
  model: FENGSHUI_CALCULATION_MODEL,
  palaces: JIUGONG.map(({ num, name, dir, wuxing }) => ({ num, name, dir, wuxing })),
  flyOrder: FLY_ORDER,
  periodCycle: {
    cycleStartYear: 1864,
    cycleYears: 180,
    periodYears: 20,
    yearBoundary: 'exact_lichun_when_date_is_available',
  },
  mountains: ERSHISI_SHAN.map(({ name, start, end, gua, sanyuan, yinyang }) => ({
    name, start, end, gua, sanyuan, yinyang,
  })),
  lowerTrigramRule: {
    validBearing: 'mountain center +/- 4.5 degrees',
    periodPlate: 'period star enters center and flies forward',
    mountainWaterDirection: 'same-yuan mountain in the entering star home palace; Yang forward, Yin reverse',
    centerFive: 'borrow actual sitting/facing mountain Yin-Yang',
  },
  annualMonthly: {
    annualBoundary: 'exact_lichun',
    annualSequence: '2000 solar year = 9 center; decrement one each year',
    monthlyBoundary: 'exact 12 Jie solar terms',
    monthlyFirstMonthCenters: { 子午卯酉: 8, 辰戌丑未: 5, 寅申巳亥: 2 },
  },
  exclusions: [
    'replacement charts, mixed bearings, and void lines',
    'star nature, combination interpretation, and formation auspiciousness',
    'shape-form catalogs, remedies, placement advice, and real-world prediction',
  ],
  validation: {
    status: 'validated_declared_school',
    chartMatrix: '9 periods x 24 mountains = 216 lower-trigram charts',
    interpretationStatus: 'not_validated',
  },
};

const sourceRefs = Object.fromEntries(['data', 'engine', 'overview', 'compass'].map(key => [
  paths[key], sha256(read(paths[key])),
]));
const passed = Object.values(categories).reduce((sum, item) => sum + item.passed, 0);
const artifact = {
  audit: 'fengshui_core',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass' : 'fail',
  scope: FENGSHUI_CALCULATION_MODEL,
  summary: { charts, checks, failures: checks - passed, categories },
  sourceRefs,
  boundaries: core.exclusions,
  examples: failures,
};

fs.mkdirSync(path.dirname(path.join(root, paths.core)), { recursive: true });
fs.mkdirSync(path.dirname(path.join(root, paths.artifact)), { recursive: true });
fs.writeFileSync(path.join(root, paths.core), `${JSON.stringify(core, null, 2)}\n`);
fs.writeFileSync(path.join(root, paths.artifact), `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify(artifact.summary, null, 2));
if (failures.length > 0) process.exitCode = 1;
