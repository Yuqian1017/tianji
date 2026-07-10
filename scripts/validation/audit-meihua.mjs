import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { getHexagramName, getStrokeCount } from '../../src/modules/meihua/data.js';
import {
  buildMeihuaChart,
  castByNumber,
  castByText,
  castByTime,
  formatForAI,
} from '../../src/modules/meihua/engine.js';
import { MEIHUA_SYSTEM_PROMPT } from '../../src/modules/meihua/prompt.js';
import {
  getUnihanStrokeCount,
  getUnihanStrokeEntryCount,
  UNIHAN_STROKE_METADATA,
} from '../../src/modules/meihua/strokes-unihan-17.js';

const TRIGRAMS = [
  { num: 1, name: '乾', binary: '111', wuxing: 'metal' },
  { num: 2, name: '兑', binary: '110', wuxing: 'metal' },
  { num: 3, name: '离', binary: '101', wuxing: 'fire' },
  { num: 4, name: '震', binary: '100', wuxing: 'wood' },
  { num: 5, name: '巽', binary: '011', wuxing: 'wood' },
  { num: 6, name: '坎', binary: '010', wuxing: 'water' },
  { num: 7, name: '艮', binary: '001', wuxing: 'earth' },
  { num: 8, name: '坤', binary: '000', wuxing: 'earth' },
];

const HEXAGRAM_MATRIX = {
  乾: ['乾为天', '天泽履', '天火同人', '天雷无妄', '天风姤', '天水讼', '天山遁', '天地否'],
  兑: ['泽天夬', '兑为泽', '泽火革', '泽雷随', '泽风大过', '泽水困', '泽山咸', '泽地萃'],
  离: ['火天大有', '火泽睽', '离为火', '火雷噬嗑', '火风鼎', '火水未济', '火山旅', '火地晋'],
  震: ['雷天大壮', '雷泽归妹', '雷火丰', '震为雷', '雷风恒', '雷水解', '雷山小过', '雷地豫'],
  巽: ['风天小畜', '风泽中孚', '风火家人', '风雷益', '巽为风', '风水涣', '风山渐', '风地观'],
  坎: ['水天需', '水泽节', '水火既济', '水雷屯', '水风井', '坎为水', '水山蹇', '水地比'],
  艮: ['山天大畜', '山泽损', '山火贲', '山雷颐', '山风蛊', '山水蒙', '艮为山', '山地剥'],
  坤: ['地天泰', '地泽临', '地火明夷', '地雷复', '地风升', '地水师', '地山谦', '坤为地'],
};

const TRIGRAM_BY_BINARY = new Map(TRIGRAMS.map((trigram) => [trigram.binary, trigram]));
const TRIGRAM_BY_NUMBER = new Map(TRIGRAMS.map((trigram) => [trigram.num, trigram]));
const LOWER_INDEX = new Map(TRIGRAMS.map((trigram, index) => [trigram.name, index]));
const SHENG = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
const KE = { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' };

const sections = {};
const failures = [];

function same(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function check(sectionName, label, actual, expected) {
  const section = sections[sectionName] ?? { checks: 0, failures: 0 };
  section.checks += 1;
  if (!same(actual, expected)) {
    section.failures += 1;
    if (failures.length < 100) failures.push({ section: sectionName, label, actual, expected });
  }
  sections[sectionName] = section;
}

function expectedHexagramName(upperName, lowerName) {
  return HEXAGRAM_MATRIX[upperName][LOWER_INDEX.get(lowerName)];
}

function expectedRelation(ti, yong) {
  if (ti === yong) return { relation: 'bihe', desc: '体用比和' };
  if (SHENG[yong] === ti) return { relation: 'yongShengTi', desc: '用生体' };
  if (SHENG[ti] === yong) return { relation: 'tiShengYong', desc: '体生用' };
  if (KE[yong] === ti) return { relation: 'yongKeTi', desc: '用克体' };
  if (KE[ti] === yong) return { relation: 'tiKeYong', desc: '体克用' };
  throw new Error(`No five-element relation for ${ti}/${yong}`);
}

for (const upper of TRIGRAMS) {
  for (const lower of TRIGRAMS) {
    check(
      'hexagram_names',
      `${upper.name}/${lower.name}`,
      getHexagramName(upper.name, lower.name),
      expectedHexagramName(upper.name, lower.name),
    );

    for (let movingLine = 1; movingLine <= 6; movingLine += 1) {
      const result = buildMeihuaChart({
        method: 'number',
        input: { audit: true },
        upperNum: upper.num,
        lowerNum: lower.num,
        dong: movingLine,
      });
      const lines = [...lower.binary, ...upper.binary].map(Number);
      const mutualLower = TRIGRAM_BY_BINARY.get(lines.slice(1, 4).join(''));
      const mutualUpper = TRIGRAM_BY_BINARY.get(lines.slice(2, 5).join(''));
      const changedLines = [...lines];
      changedLines[movingLine - 1] = changedLines[movingLine - 1] === 1 ? 0 : 1;
      const changedLower = TRIGRAM_BY_BINARY.get(changedLines.slice(0, 3).join(''));
      const changedUpper = TRIGRAM_BY_BINARY.get(changedLines.slice(3, 6).join(''));
      const ti = movingLine <= 3 ? upper : lower;
      const yong = movingLine <= 3 ? lower : upper;
      const label = `${upper.name}/${lower.name}/line-${movingLine}`;

      check('chart_transforms', `${label}/upper`, result.upper.name, upper.name);
      check('chart_transforms', `${label}/lower`, result.lower.name, lower.name);
      check('chart_transforms', `${label}/base`, result.benGua.name, expectedHexagramName(upper.name, lower.name));
      check('chart_transforms', `${label}/mutual-upper`, result.huGua.upper.name, mutualUpper.name);
      check('chart_transforms', `${label}/mutual-lower`, result.huGua.lower.name, mutualLower.name);
      check('chart_transforms', `${label}/mutual-name`, result.huGua.name, expectedHexagramName(mutualUpper.name, mutualLower.name));
      check('chart_transforms', `${label}/changed-upper`, result.bianGua.upper.name, changedUpper.name);
      check('chart_transforms', `${label}/changed-lower`, result.bianGua.lower.name, changedLower.name);
      check('chart_transforms', `${label}/changed-name`, result.bianGua.name, expectedHexagramName(changedUpper.name, changedLower.name));
      check('chart_transforms', `${label}/body`, [result.tiGua.position, result.tiGua.name], [movingLine <= 3 ? 'upper' : 'lower', ti.name]);
      check('chart_transforms', `${label}/function`, [result.yongGua.position, result.yongGua.name], [movingLine <= 3 ? 'lower' : 'upper', yong.name]);
      check('chart_transforms', `${label}/relation`, result.tiYong, expectedRelation(ti.wuxing, yong.wuxing));
    }
  }
}

for (let num1 = 1; num1 <= 64; num1 += 1) {
  for (let num2 = 1; num2 <= 64; num2 += 1) {
    const result = castByNumber(num1, num2);
    const upperNum = num1 % 8 || 8;
    const lowerNum = num2 % 8 || 8;
    const movingLine = (num1 + num2) % 6 || 6;
    const upper = TRIGRAM_BY_NUMBER.get(upperNum);
    const lower = TRIGRAM_BY_NUMBER.get(lowerNum);
    const label = `${num1}/${num2}`;

    check('number_casting', `${label}/upper`, result.upper.num, upperNum);
    check('number_casting', `${label}/lower`, result.lower.num, lowerNum);
    check('number_casting', `${label}/moving`, result.dong, movingLine);
    check('number_casting', `${label}/name`, result.benGua.name, expectedHexagramName(upper.name, lower.name));
  }
}

const plumBlossomExample = buildMeihuaChart({
  method: 'time',
  input: { sourceExample: '辰年十二月十七日申时' },
  upperNum: (5 + 12 + 17) % 8 || 8,
  lowerNum: (5 + 12 + 17 + 9) % 8 || 8,
  dong: (5 + 12 + 17 + 9) % 6 || 6,
});
check('classical_example', 'base', plumBlossomExample.benGua.name, '泽火革');
check('classical_example', 'moving-line', plumBlossomExample.dong, 1);
check('classical_example', 'mutual-upper', plumBlossomExample.huGua.upper.name, '乾');
check('classical_example', 'mutual-lower', plumBlossomExample.huGua.lower.name, '巽');
check('classical_example', 'changed', plumBlossomExample.bianGua.name, '泽山咸');

const timeFixtures = [
  {
    label: 'regular-lunar-date',
    date: new Date(2026, 6, 10, 12, 0, 0),
    expected: { yearBranch: '午', month: 5, day: 26, hourBranch: '午', upper: '坎', lower: '巽', moving: 3 },
  },
  {
    label: 'before-lunar-new-year',
    date: new Date(2026, 1, 16, 12, 0, 0),
    expected: { yearBranch: '巳', month: 12, day: 29, hourBranch: '午', upper: '艮', lower: '坎', moving: 6 },
  },
  {
    label: 'lunar-new-year',
    date: new Date(2026, 1, 17, 12, 0, 0),
    expected: { yearBranch: '午', month: 1, day: 1, hourBranch: '午', upper: '乾', lower: '坤', moving: 4 },
  },
  {
    label: 'leap-month-reuses-six',
    date: new Date(2025, 6, 25, 12, 0, 0),
    expected: { yearBranch: '巳', month: 6, day: 1, hourBranch: '午', upper: '巽', lower: '震', moving: 2 },
  },
];

for (const fixture of timeFixtures) {
  const result = castByTime(fixture.date);
  const actual = {
    yearBranch: result.input.yearBranch,
    month: result.input.lunarMonth,
    day: result.input.lunarDay,
    hourBranch: result.input.hourBranch,
    upper: result.upper.name,
    lower: result.lower.name,
    moving: result.dong,
  };
  check('time_casting', fixture.label, actual, fixture.expected);
}

check('stroke_data', 'metadata-count', getUnihanStrokeEntryCount(), 20992);
check('stroke_data', 'metadata-version', UNIHAN_STROKE_METADATA.unicodeVersion, '17.0.0');
check('stroke_data', 'yi-simplified', getStrokeCount('亿'), 3);
check('stroke_data', 'yi-traditional', getStrokeCount('億'), 15);
check('stroke_data', 'da', getStrokeCount('龘'), 48);
let countedStrokes = 0;
for (let codePoint = 0x4e00; codePoint <= 0x9fff; codePoint += 1) {
  const char = String.fromCodePoint(codePoint);
  const value = getUnihanStrokeCount(char);
  check('stroke_data', `present/U+${codePoint.toString(16).toUpperCase()}`, value !== null, true);
  check('stroke_data', `range/U+${codePoint.toString(16).toUpperCase()}`, Number.isInteger(value) && value > 0, true);
  countedStrokes += 1;
}
check('stroke_data', 'enumerated-count', countedStrokes, 20992);

const textResult = castByText('天机卷');
check('text_casting', 'three-character-split', {
  upperStrokes: textResult.input.upperStrokes,
  lowerStrokes: textResult.input.lowerStrokes,
  totalStrokes: textResult.input.totalStrokes,
  upper: textResult.upper.name,
  lower: textResult.lower.name,
  moving: textResult.dong,
}, {
  upperStrokes: 4,
  lowerStrokes: 14,
  totalStrokes: 18,
  upper: '震',
  lower: '坎',
  moving: 6,
});

const promptInput = formatForAI(castByNumber(5, 2), '是否应该辞职？');
check('interpretation_boundary', 'chart-status', promptInput.includes('结构状态：validated_deterministic'), true);
check('interpretation_boundary', 'interpretation-status', promptInput.includes('解释状态：not_validated'), true);
check('interpretation_boundary', 'no-runtime-verdict', /→\s*(吉|凶|利|泄)/.test(promptInput), false);
check('interpretation_boundary', 'system-no-factual-prediction', MEIHUA_SYSTEM_PROMPT.includes('不得把卦象当作事实预测'), true);
check('interpretation_boundary', 'system-no-absolute-result', MEIHUA_SYSTEM_PROMPT.includes('变卦——代表最终结果'), false);

const totalChecks = Object.values(sections).reduce((sum, section) => sum + section.checks, 0);
const totalFailures = Object.values(sections).reduce((sum, section) => sum + section.failures, 0);
const artifact = {
  auditId: 'VAL-MH-001',
  generatedAt: new Date().toISOString(),
  scope: 'Meihua deterministic charting, declared casting methods, stroke data, and interpretation boundary',
  sources: [
    'https://ctext.org/wiki.pl?chapter=867487&if=gb',
    'https://www.unicode.org/reports/tr38/',
    UNIHAN_STROKE_METADATA.sourceUrl,
  ],
  declaredPolicies: {
    trigramBinaryOrder: 'bottom_to_top',
    timeCalendar: 'lunar_month_and_day',
    leapMonth: 'reuse_base_month_number',
    textCasting: 'source_pinned_modern_adaptation',
    interpretation: 'not_validated',
  },
  unihan: UNIHAN_STROKE_METADATA,
  summary: { totalChecks, totalFailures, status: totalFailures === 0 ? 'pass' : 'fail' },
  sections,
  failures,
};

const artifactPath = resolve('docs/validation/artifacts/meihua-audit-2026-07-10.json');
mkdirSync(dirname(artifactPath), { recursive: true });
writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ artifactPath, ...artifact.summary, sections }, null, 2));

if (totalFailures > 0) process.exitCode = 1;
