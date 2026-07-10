import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import { Solar } from 'lunar-javascript';
import {
  BAMEN,
  DIZHI,
  GATE_BASE,
  JIA_DUN,
  JIEQI_JU,
  JIEQI_ORDER,
  JIUGONG,
  JIUXING,
  QIMEN_DEITY_SEQUENCE,
  QIMEN_GATE_SEQUENCE,
  QIMEN_PALACE_CLOCKWISE,
  QIMEN_PALACE_COUNTER_CLOCKWISE,
  SANQI_LIUYI_ORDER,
  STAR_BASE,
  TIANGAN,
  YUAN_BY_FUTOU_BRANCH,
} from '../../src/modules/qimen/data.js';
import {
  QIMEN_CALCULATION_MODEL,
  getSanyuan,
  getXunInfo,
  layoutDipan,
  paiQimen,
} from '../../src/modules/qimen/engine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const paths = {
  data: 'src/modules/qimen/data.js',
  engine: 'src/modules/qimen/engine.js',
  algorithm: 'database/xuanxue/compendium-new/reference/qimen-algorithm.md',
  overview: 'database/xuanxue/compendium-new/06-qimen/01-qimen.md',
  cases: 'database/xuanxue/compendium-new/06-qimen/02-zhifu-zhishi-cases.md',
  core: 'database/qimen/qimen-core.json',
  artifact: 'docs/validation/artifacts/qimen-core-audit-2026-07-10.json',
};
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');

const JIAZI = Array.from({ length: 60 }, (_, index) => (
  TIANGAN[index % 10] + DIZHI[index % 12]
));
const HOURS = [...Array.from({ length: 12 }, (_, index) => index * 2), 23];
const EXPECTED_JIEQI_JU = {
  yang: {
    冬至: [1, 7, 4], 小寒: [2, 8, 5], 大寒: [3, 9, 6],
    立春: [8, 5, 2], 雨水: [9, 6, 3], 惊蛰: [1, 7, 4],
    春分: [3, 9, 6], 清明: [4, 1, 7], 谷雨: [5, 2, 8],
    立夏: [4, 1, 7], 小满: [5, 2, 8], 芒种: [6, 3, 9],
  },
  yin: {
    夏至: [9, 3, 6], 小暑: [8, 2, 5], 大暑: [7, 1, 4],
    立秋: [2, 5, 8], 处暑: [1, 4, 7], 白露: [9, 3, 6],
    秋分: [7, 1, 4], 寒露: [6, 9, 3], 霜降: [5, 8, 2],
    立冬: [6, 9, 3], 小雪: [5, 8, 2], 大雪: [4, 7, 1],
  },
};

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

function expectedEarthPlate(juNum, dunType) {
  return Object.fromEntries(SANQI_LIUYI_ORDER.map((stem, offset) => {
    const delta = dunType === 'yang' ? offset : -offset;
    return [((juNum - 1 + delta + 18) % 9) + 1, stem];
  }));
}

function expectedXun(ganzhi) {
  const index = JIAZI.indexOf(ganzhi);
  const xunIndex = Math.floor(index / 10);
  const xunHead = JIAZI[xunIndex * 10];
  return { index, xunIndex, xunHead, hiddenStem: JIA_DUN[xunHead], steps: index % 10 };
}

function expectedYuan(dayGZ) {
  const index = JIAZI.indexOf(dayGZ);
  const fuTou = JIAZI[(index - (index % 5) + 60) % 60];
  const name = YUAN_BY_FUTOU_BRANCH[fuTou[1]];
  return { index: ['上元', '中元', '下元'].indexOf(name), name, fuTou };
}

function findStemPalace(earth, stem) {
  return Number(Object.keys(earth).find(palace => earth[palace] === stem));
}

function normalizeCenter(palace) {
  return palace === 5 ? 2 : palace;
}

function rotate(originalPalace, destinationPalace, valueAt) {
  const from = QIMEN_PALACE_CLOCKWISE.indexOf(normalizeCenter(originalPalace));
  const to = QIMEN_PALACE_CLOCKWISE.indexOf(normalizeCenter(destinationPalace));
  const shift = (to - from + 8) % 8;
  return Object.fromEntries(QIMEN_PALACE_CLOCKWISE.map((palace, index) => [
    QIMEN_PALACE_CLOCKWISE[(index + shift) % 8],
    valueAt(palace),
  ]));
}

function expectedChart(year, month, day, hour, minute) {
  const lunar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(1);
  const yearGZ = eightChar.getYear();
  const monthGZ = eightChar.getMonth();
  const dayGZ = eightChar.getDay();
  const hourGZ = eightChar.getTime();
  const term = lunar.getPrevJieQi(false);
  const jieqi = term.getName();
  const dunType = EXPECTED_JIEQI_JU.yang[jieqi] ? 'yang' : 'yin';
  const yuan = expectedYuan(dayGZ);
  const juNum = EXPECTED_JIEQI_JU[dunType][jieqi][yuan.index];
  const earth = expectedEarthPlate(juNum, dunType);
  const xun = expectedXun(hourGZ);
  const dutyOriginalPalace = findStemPalace(earth, xun.hiddenStem);
  const dutyStar = STAR_BASE[dutyOriginalPalace];
  const dutyGate = GATE_BASE[normalizeCenter(dutyOriginalPalace)];
  const actualHourStem = hourGZ[0] === '甲' ? xun.hiddenStem : hourGZ[0];
  const dutyDestinationPalace = normalizeCenter(findStemPalace(earth, actualHourStem));
  const doorStart = normalizeCenter(dutyOriginalPalace);
  const doorDelta = dunType === 'yang' ? xun.steps : -xun.steps;
  const rawDoorPalace = ((doorStart - 1 + doorDelta + 18) % 9) + 1;
  const dutyDoorPalace = rawDoorPalace === 5
    ? (dunType === 'yang' ? 8 : 2)
    : rawDoorPalace;
  const stars = rotate(dutyOriginalPalace, dutyDestinationPalace, palace => STAR_BASE[palace]);
  const sky = rotate(dutyOriginalPalace, dutyDestinationPalace, palace => earth[palace]);
  stars[5] = '天禽';
  sky[5] = earth[5];
  const tianruiPalace = Number(Object.keys(stars).find(palace => stars[palace] === '天芮'));
  const gateStart = QIMEN_PALACE_CLOCKWISE.indexOf(dutyDoorPalace);
  const gateNameStart = QIMEN_GATE_SEQUENCE.indexOf(dutyGate);
  const gates = Object.fromEntries(Array.from({ length: 8 }, (_, offset) => [
    QIMEN_PALACE_CLOCKWISE[(gateStart + offset) % 8],
    QIMEN_GATE_SEQUENCE[(gateNameStart + offset) % 8],
  ]));
  const deityOrder = dunType === 'yang'
    ? QIMEN_PALACE_CLOCKWISE
    : QIMEN_PALACE_COUNTER_CLOCKWISE;
  const deityStart = deityOrder.indexOf(dutyDestinationPalace);
  const deities = Object.fromEntries(QIMEN_DEITY_SEQUENCE.map((deity, offset) => [
    deityOrder[(deityStart + offset) % 8],
    deity,
  ]));

  return {
    yearGZ, monthGZ, dayGZ, hourGZ, jieqi,
    jieqiTime: term.getSolar().toYmdHms(),
    dunType, yuan, juNum, earth, xun, dutyStar, dutyGate,
    actualHourStem, dutyOriginalPalace, dutyDestinationPalace, dutyDoorPalace,
    stars, sky, gates, deities, tianruiPalace,
  };
}

check('inventory', 'stems', TIANGAN, [...'甲乙丙丁戊己庚辛壬癸']);
check('inventory', 'branches', DIZHI, [...'子丑寅卯辰巳午未申酉戌亥']);
check('inventory', 'palaces', JIUGONG.map(({ num, name }) => [num, name]), [
  [1, '坎'], [2, '坤'], [3, '震'], [4, '巽'], [5, '中'],
  [6, '乾'], [7, '兑'], [8, '艮'], [9, '离'],
]);
check('inventory', 'stars', JIUXING.map(({ name, base }) => [name, base]), Object.entries(STAR_BASE).map(([base, name]) => [name, Number(base)]));
check('inventory', 'gates', BAMEN.map(({ name, base }) => [name, base]), Object.entries(GATE_BASE).map(([base, name]) => [name, Number(base)]));
check('finite_tables', 'jieqi_ju', JIEQI_JU, EXPECTED_JIEQI_JU);
check('finite_tables', 'jieqi_order_count', new Set(JIEQI_ORDER).size, 24);
check('finite_tables', 'xun_hidden_stems', JIA_DUN, { 甲子: '戊', 甲戌: '己', 甲申: '庚', 甲午: '辛', 甲辰: '壬', 甲寅: '癸' });
check('finite_tables', 'palace_clockwise', QIMEN_PALACE_CLOCKWISE, [2, 7, 6, 1, 8, 3, 4, 9]);
check('finite_tables', 'palace_counter_clockwise', QIMEN_PALACE_COUNTER_CLOCKWISE, [2, 9, 4, 3, 8, 1, 6, 7]);
check('finite_tables', 'gate_sequence', QIMEN_GATE_SEQUENCE, ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门']);
check('finite_tables', 'deity_sequence', QIMEN_DEITY_SEQUENCE, ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天']);

for (const ganzhi of JIAZI) {
  check('xun', ganzhi, getXunInfo(ganzhi), expectedXun(ganzhi));
  check('yuan', ganzhi, getSanyuan(ganzhi), expectedYuan(ganzhi));
}
for (const dunType of ['yang', 'yin']) {
  for (let juNum = 1; juNum <= 9; juNum += 1) {
    check('earth_plate', `${dunType}/${juNum}`, layoutDipan(juNum, dunType), expectedEarthPlate(juNum, dunType));
  }
}

let charts = 0;
for (let year = 2020; year <= 2024; year += 1) {
  for (let month = 1; month <= 12; month += 1) {
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let day = 1; day <= days; day += 1) {
      for (const hour of HOURS) {
        const minute = 30;
        const id = `${year}-${month}-${day} ${hour}:${minute}`;
        const actual = paiQimen(year, month, day, hour, minute);
        const expected = expectedChart(year, month, day, hour, minute);
        charts += 1;

        for (const key of ['yearGZ', 'monthGZ', 'dayGZ', 'hourGZ', 'jieqi', 'jieqiTime', 'dunType', 'juNum', 'actualHourStem']) {
          check('chart_core', `${id}/${key}`, actual.meta[key], expected[key]);
        }
        check('chart_core', `${id}/yuan`, actual.meta.yuan, expected.yuan.name);
        check('chart_core', `${id}/futou`, actual.meta.fuTou, expected.yuan.fuTou);
        check('chart_core', `${id}/xun`, actual.meta.xunShou, expected.xun.xunHead);
        check('duty', `${id}/star`, actual.zhifu, expected.dutyStar);
        check('duty', `${id}/gate`, actual.zhishi, expected.dutyGate);
        check('duty', `${id}/star_origin`, actual.zhifuOrigGong, expected.dutyOriginalPalace);
        check('duty', `${id}/star_destination`, actual.zhifuGong, expected.dutyDestinationPalace);
        check('duty', `${id}/door_destination`, actual.zhishiGong, expected.dutyDoorPalace);

        for (let palace = 1; palace <= 9; palace += 1) {
          const gong = actual.gongs[palace];
          check('earth_plate', `${id}/${palace}`, gong.diGan, expected.earth[palace]);
          check('heaven_plate', `${id}/${palace}/stem`, gong.tianGan, expected.sky[palace]);
          check('heaven_plate', `${id}/${palace}/star`, gong.star, expected.stars[palace]);
          check('human_plate', `${id}/${palace}`, gong.gate, expected.gates[palace] || '');
          check('deity_plate', `${id}/${palace}`, gong.shen, expected.deities[palace] || '');
          check('tianqin_lodging', `${id}/${palace}/star`, gong.lodgedStar, palace === expected.tianruiPalace ? '天禽' : '');
          check('tianqin_lodging', `${id}/${palace}/stem`, gong.lodgedTianGan, palace === expected.tianruiPalace ? expected.earth[5] : '');
        }
      }
    }
  }
}

const sourceRefs = Object.fromEntries(
  ['data', 'engine', 'algorithm', 'overview', 'cases'].map(key => [
    key,
    { path: paths[key], sha256: sha256(read(paths[key])) },
  ]),
);
const core = {
  schemaVersion: 1,
  generatedAt: '2026-07-10',
  status: {
    deterministicChart: 'accepted_declared_school',
    interpretationAndPredictions: 'not_validated_not_included',
  },
  conventions: {
    ...QIMEN_CALCULATION_MODEL,
    dayBoundary: '23:00; lunar-javascript EightChar sect=1',
    yuan: 'preceding_jia_or_ji_futou_branch',
    earthPlate: 'numeric_palaces_1_to_9; yang_forward_yin_reverse',
    centerPalace: 'lodged_in_kun_2_for_duty_star_and_duty_gate_origin',
    dutyDoorCenterLanding: 'yang_to_gen_8; yin_to_kun_2',
    tianqin: 'travels_with_tianrui; center_identity_retained',
  },
  sourceRefs,
  tables: {
    stems: TIANGAN,
    branches: DIZHI,
    palaces: JIUGONG,
    stars: JIUXING,
    gates: BAMEN,
    starOriginalPalaces: STAR_BASE,
    gateOriginalPalaces: GATE_BASE,
    sanqiLiuyiOrder: SANQI_LIUYI_ORDER,
    xunHiddenStems: JIA_DUN,
    yuanByFutouBranch: YUAN_BY_FUTOU_BRANCH,
    jieqiJu: JIEQI_JU,
    jieqiOrder: JIEQI_ORDER,
    palaceClockwise: QIMEN_PALACE_CLOCKWISE,
    palaceCounterClockwise: QIMEN_PALACE_COUNTER_CLOCKWISE,
    gateSequence: QIMEN_GATE_SEQUENCE,
    deitySequence: QIMEN_DEITY_SEQUENCE,
  },
  excludedAsUnvalidated: [
    'auspicious_or_inauspicious_interpretation',
    'event_prediction',
    'medical_legal_financial_or_directional_advice',
    'pattern_meanings_and_yongshen_claims',
  ],
};

fs.mkdirSync(path.dirname(path.join(root, paths.core)), { recursive: true });
fs.writeFileSync(path.join(root, paths.core), `${JSON.stringify(core, null, 2)}\n`);
const coreSha256 = sha256(read(paths.core));
const failed = failures.length > 0 || Object.values(categories).some(category => category.failed > 0);
const artifact = {
  audit: 'qimen_core',
  generatedAt: '2026-07-10',
  result: failed ? 'fail' : 'pass',
  scope: {
    years: [2020, 2024],
    hoursPerDay: HOURS,
    minute: 30,
    charts,
    checks,
  },
  normalizedCore: { path: paths.core, sha256: coreSha256 },
  sourceRefs,
  summary: { checks, failures: Object.values(categories).reduce((sum, item) => sum + item.failed, 0), categories },
  boundaries: [
    'This audit validates the declared ChaiBu turntable calculation model, not all Qimen schools.',
    'Calendar expectations independently call lunar-javascript with sect=1; external calendar diversity is covered by secondary audits.',
    'Traditional interpretation and predictive claims are excluded.',
  ],
  examples: failures,
};
fs.mkdirSync(path.dirname(path.join(root, paths.artifact)), { recursive: true });
fs.writeFileSync(path.join(root, paths.artifact), `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ result: artifact.result, ...artifact.scope, failures: artifact.summary.failures, categories }, null, 2));
if (failed) process.exitCode = 1;
