import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import {
  BAGUA,
  BRANCH_WUXING,
  JINGFANG,
  NAJIA,
  PURE_GUA_LIUQIN,
  SIX_SPIRITS_ORDER,
  SPIRIT_START,
} from '../../src/modules/liuyao/data.js';
import {
  getKongWang,
  getLiuqin,
  getSixSpirits,
  LIUYAO_VALIDATION_MODEL,
  paipan,
} from '../../src/modules/liuyao/engine.js';
import { LIUYAO_SYSTEM_PROMPT } from '../../src/modules/liuyao/prompt.js';

const outputPath = path.resolve(
  'docs/validation/artifacts/liuyao-audit-2026-07-10.json',
);
const dateParts = { year: 2026, month: 7, day: 10, hour: 12, minute: 0 };

const expectedBagua = {
  乾: { wuxing: 'metal', binary: '111' },
  兑: { wuxing: 'metal', binary: '110' },
  离: { wuxing: 'fire', binary: '101' },
  震: { wuxing: 'wood', binary: '100' },
  巽: { wuxing: 'wood', binary: '011' },
  坎: { wuxing: 'water', binary: '010' },
  艮: { wuxing: 'earth', binary: '001' },
  坤: { wuxing: 'earth', binary: '000' },
};

const expectedNajia = {
  乾: { innerStem: '甲', outerStem: '壬', inner: ['子', '寅', '辰'], outer: ['午', '申', '戌'] },
  坤: { innerStem: '乙', outerStem: '癸', inner: ['未', '巳', '卯'], outer: ['丑', '亥', '酉'] },
  震: { innerStem: '庚', outerStem: '庚', inner: ['子', '寅', '辰'], outer: ['午', '申', '戌'] },
  巽: { innerStem: '辛', outerStem: '辛', inner: ['丑', '亥', '酉'], outer: ['未', '巳', '卯'] },
  坎: { innerStem: '戊', outerStem: '戊', inner: ['寅', '辰', '午'], outer: ['申', '戌', '子'] },
  离: { innerStem: '己', outerStem: '己', inner: ['卯', '丑', '亥'], outer: ['酉', '未', '巳'] },
  艮: { innerStem: '丙', outerStem: '丙', inner: ['辰', '午', '申'], outer: ['戌', '子', '寅'] },
  兑: { innerStem: '丁', outerStem: '丁', inner: ['巳', '卯', '丑'], outer: ['亥', '酉', '未'] },
};

const expectedBranchWuxing = {
  子: 'water', 丑: 'earth', 寅: 'wood', 卯: 'wood',
  辰: 'earth', 巳: 'fire', 午: 'fire', 未: 'earth',
  申: 'metal', 酉: 'metal', 戌: 'earth', 亥: 'water',
};

const expectedPalaceNames = {
  乾宫: ['乾为天', '天风姤', '天山遁', '天地否', '风地观', '山地剥', '火地晋', '火天大有'],
  兑宫: ['兑为泽', '泽水困', '泽地萃', '泽山咸', '水山蹇', '地山谦', '雷山小过', '雷泽归妹'],
  离宫: ['离为火', '火山旅', '火风鼎', '火水未济', '山水蒙', '风水涣', '天水讼', '天火同人'],
  震宫: ['震为雷', '雷地豫', '雷水解', '雷风恒', '地风升', '水风井', '泽风大过', '泽雷随'],
  巽宫: ['巽为风', '风天小畜', '风火家人', '风雷益', '天雷无妄', '火雷噬嗑', '山雷颐', '山风蛊'],
  坎宫: ['坎为水', '水泽节', '水雷屯', '水火既济', '泽火革', '雷火丰', '地火明夷', '地水师'],
  艮宫: ['艮为山', '山火贲', '山天大畜', '山泽损', '火泽睽', '天泽履', '风泽中孚', '风山渐'],
  坤宫: ['坤为地', '地雷复', '地泽临', '地天泰', '雷天大壮', '泽天夬', '水天需', '水地比'],
};

const palaceSteps = [
  { type: '本宫', mask: 0, world: 6, response: 3 },
  { type: '一世', mask: 1, world: 1, response: 4 },
  { type: '二世', mask: 3, world: 2, response: 5 },
  { type: '三世', mask: 7, world: 3, response: 6 },
  { type: '四世', mask: 15, world: 4, response: 1 },
  { type: '五世', mask: 31, world: 5, response: 2 },
  { type: '游魂', mask: 23, world: 4, response: 1 },
  { type: '归魂', mask: 16, world: 3, response: 6 },
];

const expectedSpiritStart = {
  甲: 0, 乙: 0, 丙: 1, 丁: 1, 戊: 2,
  己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5,
};
const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const expectedKongByXun = ['戌亥', '申酉', '午未', '辰巳', '寅卯', '子丑'];
const allLiuqin = ['父母', '兄弟', '子孙', '妻财', '官鬼'];
const binaryToGua = Object.fromEntries(Object.entries(expectedBagua).map(([name, value]) => [
  value.binary,
  name,
]));

const checks = [];
const failures = [];
const record = (category, context, actual, expected) => {
  const matches = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({ category, context, matches });
  if (!matches) failures.push({ category, context, actual, expected });
};

record('finite_table', 'bagua', BAGUA, expectedBagua);
record('finite_table', 'najia', NAJIA, expectedNajia);
record('finite_table', 'branch_wuxing', BRANCH_WUXING, expectedBranchWuxing);
record('finite_table', 'spirit_start', SPIRIT_START, expectedSpiritStart);
record('finite_table', 'spirit_order', SIX_SPIRITS_ORDER, ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武']);

const chartByMask = new Map();
for (const [palaceName, expectedNames] of Object.entries(expectedPalaceNames)) {
  const palaceGua = palaceName.replace('宫', '');
  const baseBits = `${expectedBagua[palaceGua].binary}${expectedBagua[palaceGua].binary}`;
  const baseMask = [...baseBits].reduce((value, bit, index) => (
    bit === '1' ? value | (1 << index) : value
  ), 0);
  const actualPalace = JINGFANG[palaceName];

  record('palace', `${palaceName}:count`, actualPalace.gua.length, 8);
  record('palace', `${palaceName}:wuxing`, actualPalace.wuxing, expectedBagua[palaceGua].wuxing);

  palaceSteps.forEach((step, index) => {
    const expectedMask = baseMask ^ step.mask;
    const bits = Array.from({ length: 6 }, (_, lineIndex) => (
      expectedMask & (1 << lineIndex) ? '1' : '0'
    ));
    const expectedLower = binaryToGua[bits.slice(0, 3).join('')];
    const expectedUpper = binaryToGua[bits.slice(3).join('')];
    const actual = actualPalace.gua[index];
    const expected = {
      name: expectedNames[index],
      upper: expectedUpper,
      lower: expectedLower,
      type: step.type,
      world: step.world,
      response: step.response,
    };
    record('palace', `${palaceName}:${step.type}`, actual, expected);
    chartByMask.set(expectedMask, { palaceName, palaceGua, ...expected });
  });
}
record('palace', 'unique_64_masks', chartByMask.size, 64);

function valuesFor(baseMask, movingMask = 0) {
  return Array.from({ length: 6 }, (_, index) => {
    const yang = Boolean(baseMask & (1 << index));
    const moving = Boolean(movingMask & (1 << index));
    if (yang) return moving ? 9 : 7;
    return moving ? 6 : 8;
  });
}

function expectedNajiaLines(mask) {
  const bits = Array.from({ length: 6 }, (_, index) => (
    mask & (1 << index) ? '1' : '0'
  ));
  const lower = expectedNajia[binaryToGua[bits.slice(0, 3).join('')]];
  const upper = expectedNajia[binaryToGua[bits.slice(3).join('')]];
  return [
    ...lower.inner.map((branch) => ({ stem: lower.innerStem, branch })),
    ...upper.outer.map((branch) => ({ stem: upper.outerStem, branch })),
  ];
}

function expectedLiuqin(palaceWuxing, branch) {
  const order = ['wood', 'fire', 'earth', 'metal', 'water'];
  const diff = (order.indexOf(expectedBranchWuxing[branch]) - order.indexOf(palaceWuxing) + 5) % 5;
  return ['兄弟', '子孙', '妻财', '官鬼', '父母'][diff];
}

for (const [gua, guaData] of Object.entries(expectedBagua)) {
  const mask = [...`${guaData.binary}${guaData.binary}`].reduce((value, bit, index) => (
    bit === '1' ? value | (1 << index) : value
  ), 0);
  const lines = expectedNajiaLines(mask).map(({ stem, branch }, index) => ({
    pos: index + 1,
    najia: stem + branch,
    branch,
    wx: expectedBranchWuxing[branch],
    liuqin: expectedLiuqin(guaData.wuxing, branch),
  }));
  record('finite_table', `pure_gua_${gua}`, PURE_GUA_LIUQIN[gua], {
    wuxing: guaData.wuxing,
    lines,
  });
}

let staticCharts = 0;
let movingCharts = 0;
let changedLineChecks = 0;
for (let baseMask = 0; baseMask < 64; baseMask += 1) {
  const expectedChart = chartByMask.get(baseMask);
  const values = valuesFor(baseMask);
  const result = paipan(values, dateParts);
  const najiaLines = expectedNajiaLines(baseMask);
  const expectedLiuqinList = najiaLines.map(({ branch }) => (
    expectedLiuqin(expectedBagua[expectedChart.palaceGua].wuxing, branch)
  ));
  staticCharts += 1;

  record('runtime_static', `${baseMask}:chart`, result.benGua, {
    name: expectedChart.name,
    upper: expectedChart.upper,
    lower: expectedChart.lower,
    palace: expectedChart.palaceName,
    palaceWuxing: expectedBagua[expectedChart.palaceGua].wuxing,
    palaceWuxingCn: result.benGua.palaceWuxingCn,
    guaType: expectedChart.type,
  });
  record('runtime_static', `${baseMask}:najia`, result.lines.map(({ stem, branch }) => ({ stem, branch })), najiaLines);
  record('runtime_static', `${baseMask}:liuqin`, result.lines.map(({ liuqin }) => liuqin), expectedLiuqinList);
  record('runtime_static', `${baseMask}:world`, result.lines.filter(({ isWorld }) => isWorld).map(({ position }) => position), [expectedChart.world]);
  record('runtime_static', `${baseMask}:response`, result.lines.filter(({ isResponse }) => isResponse).map(({ position }) => position), [expectedChart.response]);

  const missing = allLiuqin.filter((item) => !expectedLiuqinList.includes(item));
  const expectedFushen = missing.map((liuqin) => {
    const candidates = PURE_GUA_LIUQIN[expectedChart.palaceGua].lines.filter((line) => line.liuqin === liuqin);
    record('fushen', `${baseMask}:${liuqin}:candidate_count`, candidates.length, 1);
    const line = candidates[0];
    return {
      position: line.pos,
      najia: line.najia,
      branch: line.branch,
      wuxing: line.wx,
      liuqin: line.liuqin,
      feishenNajia: najiaLines[line.pos - 1].stem + najiaLines[line.pos - 1].branch,
    };
  });
  record('fushen', `${baseMask}:runtime`, result.fushen, expectedFushen);

  for (let movingMask = 1; movingMask < 64; movingMask += 1) {
    const changedMask = baseMask ^ movingMask;
    const expectedChanged = chartByMask.get(changedMask);
    const expectedChangedNajia = expectedNajiaLines(changedMask);
    const movingResult = paipan(valuesFor(baseMask, movingMask), dateParts);
    movingCharts += 1;

    record('runtime_changed', `${baseMask}:${movingMask}:gua`, movingResult.bianGua, {
      name: expectedChanged.name,
      palace: expectedChanged.palaceName,
    });
    for (let index = 0; index < 6; index += 1) {
      if (!(movingMask & (1 << index))) continue;
      const expectedLine = expectedChangedNajia[index];
      record('runtime_changed_line', `${baseMask}:${movingMask}:${index + 1}`, movingResult.lines[index].bianYao, {
        ...expectedLine,
        wuxing: expectedBranchWuxing[expectedLine.branch],
        wuxingCn: movingResult.lines[index].bianYao.wuxingCn,
        liuqin: expectedLiuqin(expectedBagua[expectedChart.palaceGua].wuxing, expectedLine.branch),
      });
      changedLineChecks += 1;
    }
  }
}

for (const [stem, start] of Object.entries(expectedSpiritStart)) {
  record(
    'six_spirits',
    stem,
    getSixSpirits(stem),
    Array.from({ length: 6 }, (_, index) => SIX_SPIRITS_ORDER[(start + index) % 6]),
  );
}

for (let index = 0; index < 60; index += 1) {
  const stem = stems[index % 10];
  const branch = branches[index % 12];
  record('kong_wang', `${stem}${branch}`, getKongWang(stem, branch).join(''), expectedKongByXun[Math.floor(index / 10)]);
}

for (const palaceWuxing of Object.values(expectedBagua).map(({ wuxing }) => wuxing)) {
  for (const branch of branches) {
    record(
      'liuqin',
      `${palaceWuxing}:${branch}`,
      getLiuqin(palaceWuxing, BRANCH_WUXING[branch]),
      expectedLiuqin(palaceWuxing, branch),
    );
  }
}

const beforeLichun = paipan([7, 7, 7, 7, 7, 7], {
  year: 2026, month: 2, day: 4, hour: 3, minute: 55,
});
const afterLichun = paipan([7, 7, 7, 7, 7, 7], {
  year: 2026, month: 2, day: 4, hour: 4, minute: 3,
});
record('calendar_boundary', 'before_2026_lichun', beforeLichun.date, {
  yearStem: '乙', yearBranch: '巳', monthBranch: '丑', dayStem: '己', dayBranch: '酉',
});
record('calendar_boundary', 'after_2026_lichun', afterLichun.date, {
  yearStem: '丙', yearBranch: '午', monthBranch: '寅', dayStem: '己', dayBranch: '酉',
});

record('validation_boundary', 'model', LIUYAO_VALIDATION_MODEL, {
  school: 'jingfang_eight_palaces_najia',
  chartStatus: 'validated_deterministic',
  interpretationStatus: 'not_validated',
});
record('validation_boundary', 'prompt_no_absolute_clash', LIUYAO_SYSTEM_PROMPT.includes('六冲卦 = 事散不成'), false);
record('validation_boundary', 'prompt_no_absolute_empty', LIUYAO_SYSTEM_PROMPT.includes('世爻空亡 = 问事人心不诚或事不成'), false);
record('validation_boundary', 'prompt_fact_boundary', LIUYAO_SYSTEM_PROMPT.includes('不得把卦象当作事实预测'), true);

function namesMatch(fullName, shortName) {
  const full = fullName.replaceAll('遁', '遯');
  const short = shortName.replaceAll('遁', '遯');
  return full === short || full.startsWith(short) || full.endsWith(short);
}

async function runReferenceComparison(referencePath) {
  if (!referencePath || !fs.existsSync(referencePath)) {
    return { status: 'not_run', referencePath: referencePath || null };
  }
  const { decodePan } = await import(pathToFileURL(referencePath).href);
  const referenceFailures = [];
  const counts = {
    staticCharts: 0,
    movingCharts: 0,
    staticFields: 0,
    changedFields: 0,
  };
  const compare = (context, actual, expected) => {
    counts[context.startsWith('changed') ? 'changedFields' : 'staticFields'] += 1;
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      referenceFailures.push({ context, actual, expected });
    }
  };

  for (let baseMask = 0; baseMask < 64; baseMask += 1) {
    const values = valuesFor(baseMask);
    const ours = paipan(values, dateParts);
    const reference = decodePan(values.join(''), dateParts);
    counts.staticCharts += 1;
    compare('static:palace', ours.benGua.palace.replace('宫', ''), reference.benGua.palace);
    compare('static:level', ours.benGua.guaType, reference.benGua.palaceLevel);
    compare('static:name', namesMatch(ours.benGua.name, reference.benGua.guaName), true);
    compare('static:najia', ours.lines.map(({ stem, branch }) => stem + branch), reference.benGua.yaoList.map(({ naJia }) => naJia));
    compare('static:liuqin', ours.lines.map(({ liuqin }) => liuqin), reference.benGua.yaoList.map(({ liuQin }) => liuQin));
    compare('static:world', ours.lines.map(({ isWorld }) => isWorld), reference.benGua.yaoList.map(({ shiYing }) => shiYing === '世'));
    compare('static:response', ours.lines.map(({ isResponse }) => isResponse), reference.benGua.yaoList.map(({ shiYing }) => shiYing === '应'));
    compare('static:spirits', ours.lines.map(({ spirit }) => spirit.replace('螣', '腾')), reference.benGua.yaoList.map(({ liuShou }) => liuShou.replace('螣', '腾')));
    compare('static:year', ours.date.yearStem + ours.date.yearBranch, reference.ganZhiYear.gz);
    compare('static:month', ours.date.monthBranch, reference.monthJian.at(-1));
    compare('static:day', ours.date.dayStem + ours.date.dayBranch, reference.ganZhiDay.gz);
    compare('static:kong', ours.kongWang.join(''), reference.dayKong);

    for (let movingMask = 1; movingMask < 64; movingMask += 1) {
      const movingValues = valuesFor(baseMask, movingMask);
      const movingOurs = paipan(movingValues, dateParts);
      const movingReference = decodePan(movingValues.join(''), dateParts);
      counts.movingCharts += 1;
      compare('changed:palace', movingOurs.bianGua.palace.replace('宫', ''), movingReference.zhiGua.palace);
      compare('changed:name', namesMatch(movingOurs.bianGua.name, movingReference.zhiGua.guaName), true);
      for (let index = 0; index < 6; index += 1) {
        if (!(movingMask & (1 << index))) continue;
        compare('changed:najia', movingOurs.lines[index].bianYao.stem + movingOurs.lines[index].bianYao.branch, movingReference.zhiGua.yaoList[index].naJia);
        compare('changed:liuqin', movingOurs.lines[index].bianYao.liuqin, movingReference.zhiGua.yaoList[index].liuQin);
      }
    }
  }

  return {
    status: referenceFailures.length === 0 ? 'pass' : 'fail',
    package: 'iching-shifa@1.8.0',
    license: 'GPL-3.0-or-later',
    usage: 'isolated_validation_only',
    referencePath,
    counts,
    failureCount: referenceFailures.length,
    failures: referenceFailures,
  };
}

const defaultReferencePath = '/tmp/tianji-liuyao-validator/node_modules/iching-shifa/dist/index.js';
const referenceComparison = await runReferenceComparison(
  process.env.LIUYAO_REFERENCE_PATH || defaultReferencePath,
);
const sourceFiles = [
  'src/modules/liuyao/data.js',
  'src/modules/liuyao/engine.js',
  'src/modules/liuyao/prompt.js',
  'scripts/validation/audit-liuyao.mjs',
];
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const dirtyFiles = git('status', '--short').split('\n').filter(Boolean);
const summary = {
  staticCharts,
  movingCharts,
  changedLineChecks,
  totalChecks: checks.length,
  failedChecks: failures.length,
  checksByCategory: Object.fromEntries([...new Set(checks.map(({ category }) => category))].map((category) => [
    category,
    checks.filter((check) => check.category === category).length,
  ])),
};
const report = {
  auditDate: '2026-07-10',
  conclusion: failures.length > 0 || referenceComparison.status === 'fail'
    ? 'validation_failed'
    : referenceComparison.status === 'pass'
      ? 'deterministic_chart_pass_interpretation_not_validated'
      : 'deterministic_chart_pass_reference_not_run_interpretation_not_validated',
  sourceProvenance: {
    gitCommit: git('rev-parse', 'HEAD'),
    workingTreeDirty: dirtyFiles.length > 0,
    dirtyFiles,
    sourceSha256: Object.fromEntries(sourceFiles.map((file) => [
      file,
      crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    ])),
  },
  sources: {
    primary: 'https://ctext.org/wiki.pl?chapter=889452&if=gb&remap=gb',
    fushen: 'https://ctext.org/wiki.pl?chapter=801184&if=gb&remap=gb',
    localCompendium: 'database/xuanxue/compendium-new/02-liuyao/',
  },
  model: LIUYAO_VALIDATION_MODEL,
  summary,
  referenceComparison,
  failures,
  limitations: [
    'The pass covers deterministic Jingfang eight-palace chart construction under the declared Najia school.',
    'Divination time defaults to runtime-local civil time; historical timezone and location reconstruction are not implemented.',
    'Predictive, auspicious, personality, health, legal, and financial interpretations are not validated by chart parity.',
    'The GPL comparator is used only in /tmp for validation and is not a Tianji dependency.',
  ],
};

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  conclusion: report.conclusion,
  summary,
  referenceComparison: {
    status: referenceComparison.status,
    package: referenceComparison.package,
    counts: referenceComparison.counts,
    failureCount: referenceComparison.failureCount,
  },
  output: outputPath,
}, null, 2));

process.exitCode = (
  failures.length === 0 && referenceComparison.status !== 'fail'
) ? 0 : 1;
