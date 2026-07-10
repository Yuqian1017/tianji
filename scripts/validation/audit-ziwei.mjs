import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import {
  BRANCHES,
  DIJIE_TABLE,
  DIKONG_TABLE,
  HONGLUAN_TABLE,
  HUOXING_START,
  LINGXING_START,
  LUCUN_TABLE,
  MAIN_STARS,
  NAYIN,
  NAYIN_WUXING,
  PALACE_NAMES,
  QINGYANG_TABLE,
  SIHUA_TABLE,
  STEMS,
  TIANKUI_TABLE,
  TIANFU_SERIES,
  TIANMA_TABLE,
  TIANYUE_TABLE,
  TIANXI_TABLE,
  TUOLUO_TABLE,
  WENCHANG_TABLE,
  WENQU_TABLE,
  WUXING_JU_MAP,
  YOUBI_TABLE,
  ZIWEI_SERIES,
  ZIWEI_TABLE,
  ZUOFU_TABLE,
} from '../../src/modules/ziwei/data.js';
import { paiZiwei } from '../../src/modules/ziwei/engine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const paths = {
  data: 'src/modules/ziwei/data.js',
  engine: 'src/modules/ziwei/engine.js',
  compendium: 'database/xuanxue/compendium-new/reference/ziwei-algorithm.md',
  core: 'database/ziwei/ziwei-core.json',
  artifact: 'docs/validation/artifacts/ziwei-core-audit-2026-07-10.json',
};
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

const categorySummary = {};
const failures = [];
let checks = 0;

function same(actual, expected) {
  return isDeepStrictEqual(actual, expected);
}

function check(category, id, actual, expected) {
  checks += 1;
  const summary = categorySummary[category] ?? { checks: 0, passed: 0, failed: 0 };
  summary.checks += 1;
  if (same(actual, expected)) {
    summary.passed += 1;
  } else {
    summary.failed += 1;
    if (failures.length < 100) failures.push({ category, id, actual, expected });
  }
  categorySummary[category] = summary;
}

const branchAt = (index) => BRANCHES[(index % 12 + 12) % 12];
const stemAt = (index) => STEMS[(index % 10 + 10) % 10];

const expectedNayinNames = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
  '泉中水', '屋上土', '霹雳火', '松柏木', '长流水', '沙中金', '山下火', '平地木', '壁上土', '金箔金',
  '覆灯火', '天河水', '大驿土', '钗钏金', '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水',
];
const expectedNayin = {};
for (let index = 0; index < 60; index += 1) {
  expectedNayin[stemAt(index) + branchAt(index)] = expectedNayinNames[Math.floor(index / 2)];
}

const expectedKui = {
  '甲': '丑', '乙': '子', '丙': '亥', '丁': '亥', '戊': '丑',
  '己': '子', '庚': '丑', '辛': '午', '壬': '卯', '癸': '卯',
};
const expectedYue = {
  '甲': '未', '乙': '申', '丙': '酉', '丁': '酉', '戊': '未',
  '己': '申', '庚': '未', '辛': '寅', '壬': '巳', '癸': '巳',
};
const expectedLucun = {
  '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
  '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子',
};
const expectedTianma = {
  '寅': '申', '午': '申', '戌': '申',
  '申': '寅', '子': '寅', '辰': '寅',
  '巳': '亥', '酉': '亥', '丑': '亥',
  '亥': '巳', '卯': '巳', '未': '巳',
};
const expectedSihua = {
  '甲': { '禄': '廉贞', '权': '破军', '科': '武曲', '忌': '太阳' },
  '乙': { '禄': '天机', '权': '天梁', '科': '紫微', '忌': '太阴' },
  '丙': { '禄': '天同', '权': '天机', '科': '文昌', '忌': '廉贞' },
  '丁': { '禄': '太阴', '权': '天同', '科': '天机', '忌': '巨门' },
  '戊': { '禄': '贪狼', '权': '太阴', '科': '右弼', '忌': '天机' },
  '己': { '禄': '武曲', '权': '贪狼', '科': '天梁', '忌': '文曲' },
  '庚': { '禄': '太阳', '权': '武曲', '科': '太阴', '忌': '天同' },
  '辛': { '禄': '巨门', '权': '太阳', '科': '文曲', '忌': '文昌' },
  '壬': { '禄': '天梁', '权': '紫微', '科': '左辅', '忌': '武曲' },
  '癸': { '禄': '破军', '权': '巨门', '科': '太阴', '忌': '贪狼' },
};
const expectedZiweiSeries = [
  ['紫微', 0], ['天机', -1], ['太阳', -3], ['武曲', -4], ['天同', -5], ['廉贞', -8],
];
const expectedTianfuSeries = [
  ['天府', 0], ['太阴', 1], ['贪狼', 2], ['巨门', 3], ['天相', 4], ['天梁', 5], ['七杀', 6], ['破军', 10],
];

function expectedZiweiPosition(lunarDay, bureau) {
  let adjustment = 0;
  while ((lunarDay + adjustment) % bureau !== 0) adjustment += 1;
  const quotient = (lunarDay + adjustment) / bureau;
  const directionalAdjustment = adjustment % 2 === 0 ? adjustment : -adjustment;
  return branchAt(2 + quotient - 1 + directionalAdjustment);
}

function expectedPalaceStem(yearStem, branch) {
  const yearStemIndex = STEMS.indexOf(yearStem);
  const yinStemIndex = (yearStemIndex % 5) * 2 + 2;
  const branchOffsetFromYin = (BRANCHES.indexOf(branch) - 2 + 12) % 12;
  return stemAt(yinStemIndex + branchOffsetFromYin);
}

function findStart(yearBranch, table) {
  return Object.entries(table).find(([group]) => group.includes(yearBranch))?.[1];
}

function expectedAuxStars(yearStem, yearBranch, lunarMonth, hourBranch) {
  const hourIndex = BRANCHES.indexOf(hourBranch);
  const yearIndex = BRANCHES.indexOf(yearBranch);
  const lucun = expectedLucun[yearStem];
  const hongluan = branchAt(3 - yearIndex);
  const huoStart = findStart(yearBranch, HUOXING_START);
  const lingStart = findStart(yearBranch, LINGXING_START);
  return {
    '文昌': branchAt(10 - hourIndex),
    '文曲': branchAt(4 + hourIndex),
    '左辅': branchAt(4 + lunarMonth - 1),
    '右弼': branchAt(10 - (lunarMonth - 1)),
    '天魁': expectedKui[yearStem],
    '天钺': expectedYue[yearStem],
    '擎羊': branchAt(BRANCHES.indexOf(lucun) + 1),
    '陀罗': branchAt(BRANCHES.indexOf(lucun) - 1),
    '火星': branchAt(BRANCHES.indexOf(huoStart) + hourIndex),
    '铃星': branchAt(BRANCHES.indexOf(lingStart) + hourIndex),
    '地空': branchAt(11 - hourIndex),
    '地劫': branchAt(11 + hourIndex),
    '禄存': lucun,
    '天马': expectedTianma[yearBranch],
    '红鸾': hongluan,
    '天喜': branchAt(BRANCHES.indexOf(hongluan) + 6),
  };
}

check('inventory', 'stems', STEMS, ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']);
check('inventory', 'branches', BRANCHES, ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']);
check('inventory', 'palaces', PALACE_NAMES, ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '官禄宫', '田宅宫', '福德宫', '父母宫']);
check('inventory', 'main_stars', MAIN_STARS.length, 14);
check('finite_tables', 'nayin', NAYIN, expectedNayin);
check('finite_tables', 'nayin_elements', NAYIN_WUXING, Object.fromEntries(Object.entries(expectedNayin).map(([key, value]) => [key, value.at(-1)])));
check('finite_tables', 'bureau_map', WUXING_JU_MAP, { '水': 2, '木': 3, '金': 4, '土': 5, '火': 6 });
check('finite_tables', 'tian_kui', TIANKUI_TABLE, expectedKui);
check('finite_tables', 'tian_yue', TIANYUE_TABLE, expectedYue);
check('finite_tables', 'lucun', LUCUN_TABLE, expectedLucun);
check('finite_tables', 'tianma', TIANMA_TABLE, expectedTianma);
check('finite_tables', 'sihua', SIHUA_TABLE, expectedSihua);
check('finite_tables', 'ziwei_series', ZIWEI_SERIES.map(({ name, offset }) => [name, offset]), expectedZiweiSeries);
check('finite_tables', 'tianfu_series', TIANFU_SERIES.map(({ name, offset }) => [name, offset]), expectedTianfuSeries);

for (const bureau of [2, 3, 4, 5, 6]) {
  for (let lunarDay = 1; lunarDay <= 30; lunarDay += 1) {
    check('ziwei_table', `${bureau}/${lunarDay}`, ZIWEI_TABLE[bureau][lunarDay], expectedZiweiPosition(lunarDay, bureau));
  }
}

for (const [hourBranch, expected] of Object.entries(WENCHANG_TABLE)) {
  check('aux_tables', `wenchang/${hourBranch}`, expected, branchAt(10 - BRANCHES.indexOf(hourBranch)));
  check('aux_tables', `wenqu/${hourBranch}`, WENQU_TABLE[hourBranch], branchAt(4 + BRANCHES.indexOf(hourBranch)));
  check('aux_tables', `dikong/${hourBranch}`, DIKONG_TABLE[hourBranch], branchAt(11 - BRANCHES.indexOf(hourBranch)));
  check('aux_tables', `dijie/${hourBranch}`, DIJIE_TABLE[hourBranch], branchAt(11 + BRANCHES.indexOf(hourBranch)));
}
for (let month = 1; month <= 12; month += 1) {
  check('aux_tables', `zuofu/${month}`, ZUOFU_TABLE[month], branchAt(4 + month - 1));
  check('aux_tables', `youbi/${month}`, YOUBI_TABLE[month], branchAt(10 - (month - 1)));
}
for (const stem of STEMS) {
  const lucunIndex = BRANCHES.indexOf(expectedLucun[stem]);
  check('aux_tables', `qingyang/${stem}`, QINGYANG_TABLE[stem], branchAt(lucunIndex + 1));
  check('aux_tables', `tuoluo/${stem}`, TUOLUO_TABLE[stem], branchAt(lucunIndex - 1));
}
for (const branch of BRANCHES) {
  const branchIndex = BRANCHES.indexOf(branch);
  const hongluan = branchAt(3 - branchIndex);
  check('aux_tables', `hongluan/${branch}`, HONGLUAN_TABLE[branch], hongluan);
  check('aux_tables', `tianxi/${branch}`, TIANXI_TABLE[branch], branchAt(BRANCHES.indexOf(hongluan) + 6));
}

let charts = 0;
for (let year = 1990; year <= 1999; year += 1) {
  for (let month = 1; month <= 12; month += 1) {
    for (const hourBranch of BRANCHES) {
      for (const gender of ['male', 'female']) {
        const chart = paiZiwei(year, month, 15, hourBranch, gender);
        const id = `${year}-${month}-15/${hourBranch}/${gender}`;
        const lunarMonth = chart.lunar.lunarMonth;
        const lunarDay = chart.lunar.lunarDay;
        const yearStem = chart.lunar.yearStem;
        const yearBranch = chart.lunar.yearBranch;
        const hourIndex = BRANCHES.indexOf(hourBranch);
        const monthPosition = 2 + lunarMonth - 1;
        const expectedMing = branchAt(monthPosition - hourIndex);
        const expectedShen = branchAt(monthPosition + hourIndex);
        const mingStem = expectedPalaceStem(yearStem, expectedMing);
        const expectedBureau = WUXING_JU_MAP[expectedNayin[mingStem + expectedMing].at(-1)];
        const expectedZiwei = expectedZiweiPosition(lunarDay, expectedBureau);
        const expectedTianfu = branchAt(4 - BRANCHES.indexOf(expectedZiwei));
        const expectedMain = Object.fromEntries([
          ...expectedZiweiSeries.map(([name, offset]) => [name, branchAt(BRANCHES.indexOf(expectedZiwei) + offset)]),
          ...expectedTianfuSeries.map(([name, offset]) => [name, branchAt(BRANCHES.indexOf(expectedTianfu) + offset)]),
        ]);
        const expectedAux = expectedAuxStars(yearStem, yearBranch, lunarMonth, hourBranch);
        const expectedTransforms = Object.fromEntries(Object.entries(expectedSihua[yearStem]).map(([transform, star]) => [star, transform]));
        const forward = (STEMS.indexOf(yearStem) % 2 === 0) === (gender === 'male');

        charts += 1;
        check('chart_core', `${id}/ming`, chart.mingGong.branch, expectedMing);
        check('chart_core', `${id}/shen`, chart.shenGong.branch, expectedShen);
        check('chart_core', `${id}/bureau`, chart.ju, expectedBureau);
        check('chart_core', `${id}/ziwei`, chart.ziweiPos, expectedZiwei);
        check('chart_core', `${id}/tianfu`, chart.tianfuPos, expectedTianfu);
        check('chart_core', `${id}/dayun_direction`, chart.dayunForward, forward);

        for (let palaceIndex = 0; palaceIndex < PALACE_NAMES.length; palaceIndex += 1) {
          const palaceName = PALACE_NAMES[palaceIndex];
          const expectedBranch = branchAt(BRANCHES.indexOf(expectedMing) - palaceIndex);
          const palace = chart.palaces.find((entry) => entry.palaceName === palaceName);
          check('palaces', `${id}/${palaceName}/branch`, palace?.branch, expectedBranch);
          check('palaces', `${id}/${palaceName}/stem`, palace?.palaceStem, expectedPalaceStem(yearStem, expectedBranch));
        }
        for (const [star, branch] of Object.entries(expectedMain)) {
          check('main_stars', `${id}/${star}`, chart.mainStarPositions[star], branch);
        }
        for (const [star, branch] of Object.entries(expectedAux)) {
          check('aux_stars', `${id}/${star}`, chart.auxStarPositions[star], branch);
        }
        check('four_transformations', id, chart.sihua, expectedTransforms);

        chart.dayun.forEach((period, index) => {
          const expectedBranch = branchAt(BRANCHES.indexOf(expectedMing) + index * (forward ? 1 : -1));
          check('dayun', `${id}/${index}/branch`, period.branch, expectedBranch);
          check('dayun', `${id}/${index}/stem`, period.stem, expectedPalaceStem(yearStem, expectedBranch));
          check('dayun', `${id}/${index}/start`, period.startAge, expectedBureau + index * 10);
          check('dayun', `${id}/${index}/end`, period.endAge, expectedBureau + (index + 1) * 10 - 1);
        });
      }
    }
  }
}

const sourceRefs = Object.fromEntries(
  ['data', 'engine', 'compendium'].map((key) => [key, { path: paths[key], sha256: sha256(read(paths[key])) }]),
);
const core = {
  schemaVersion: 1,
  generatedAt: '2026-07-10',
  status: {
    deterministicChart: 'accepted_declared_school',
    leapMonthPolicy: 'accepted_declared_school',
    interpretationAndPredictions: 'not_validated_not_included',
  },
  conventions: {
    school: 'ziwei_doushu_quanshu_common_star_tables',
    leapMonth: 'reuse_base_lunar_month_number',
    dayunDirection: 'yang_male_yin_female_forward_otherwise_reverse',
    dayunFirstPalace: 'ming_palace',
    dayunStartAge: 'five_element_bureau_number',
    palaceAlias: { project: '交友宫', traditional: '仆役宫' },
  },
  sourceRefs,
  tables: {
    stems: STEMS,
    branches: BRANCHES,
    palaceNames: PALACE_NAMES,
    nayin: NAYIN,
    fiveElementBureau: WUXING_JU_MAP,
    ziweiByBureauAndLunarDay: ZIWEI_TABLE,
    ziweiSeries: ZIWEI_SERIES,
    tianfuSeries: TIANFU_SERIES,
    wenchangByHour: WENCHANG_TABLE,
    wenquByHour: WENQU_TABLE,
    zuofuByLunarMonth: ZUOFU_TABLE,
    youbiByLunarMonth: YOUBI_TABLE,
    tiankuiByYearStem: TIANKUI_TABLE,
    tianyueByYearStem: TIANYUE_TABLE,
    qingyangByYearStem: QINGYANG_TABLE,
    tuoluoByYearStem: TUOLUO_TABLE,
    huoxingStartByYearBranchGroup: HUOXING_START,
    lingxingStartByYearBranchGroup: LINGXING_START,
    dikongByHour: DIKONG_TABLE,
    dijieByHour: DIJIE_TABLE,
    sihuaByYearStem: SIHUA_TABLE,
    lucunByYearStem: LUCUN_TABLE,
    tianmaByYearBranch: TIANMA_TABLE,
    hongluanByYearBranch: HONGLUAN_TABLE,
    tianxiByYearBranch: TIANXI_TABLE,
  },
};
const artifact = {
  audit: 'ziwei_core',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass' : 'fail',
  summary: {
    charts,
    checks,
    passed: checks - Object.values(categorySummary).reduce((sum, category) => sum + category.failed, 0),
    failed: Object.values(categorySummary).reduce((sum, category) => sum + category.failed, 0),
    categories: categorySummary,
    correctionsApplied: {
      ziweiPlacementCells: 100,
      mainStarOffsets: 1,
      auxiliaryStarPairs: 1,
      dayunRules: 2,
      invalidInputFallbackFamilies: 3,
    },
  },
  boundaries: [
    'The accepted result covers the declared common star-table school and the project leap-month policy only.',
    'The Gregorian-to-lunar conversion remains supplied by lunar-javascript; this audit checks downstream Ziwei rules against the converted fields.',
    'Star personality, palace verdicts, health, marriage, wealth, timing, and fate predictions are not validated and are excluded from the normalized core.',
    'A separate optional secondary audit compares the same 2,880-chart matrix with iztro 2.5.8.',
  ],
  failures,
};

fs.mkdirSync(path.dirname(path.join(root, paths.core)), { recursive: true });
fs.mkdirSync(path.dirname(path.join(root, paths.artifact)), { recursive: true });
fs.writeFileSync(path.join(root, paths.core), `${JSON.stringify(core, null, 2)}\n`);
fs.writeFileSync(path.join(root, paths.artifact), `${JSON.stringify(artifact, null, 2)}\n`);

console.log(JSON.stringify(artifact.summary, null, 2));
if (failures.length > 0) process.exitCode = 1;
