import assert from 'node:assert/strict';
import test from 'node:test';

import { getStrokeCount } from '../../src/modules/meihua/data.js';
import { castByNumber, castByText, castByTime, formatForAI } from '../../src/modules/meihua/engine.js';
import { MEIHUA_SYSTEM_PROMPT } from '../../src/modules/meihua/prompt.js';

test('keeps trigram binaries bottom-to-top when deriving mutual and changed hexagrams', () => {
  const result = castByNumber(5, 2);

  assert.equal(result.benGua.name, '风泽中孚');
  assert.equal(result.dong, 1);
  assert.equal(result.tiGua.position, 'upper');
  assert.equal(result.tiGua.name, '巽');
  assert.equal(result.yongGua.position, 'lower');
  assert.equal(result.yongGua.name, '兑');
  assert.deepEqual(result.huGua, {
    name: '山雷颐',
    upper: { name: '艮', wuxing: 'earth' },
    lower: { name: '震', wuxing: 'wood' },
  });
  assert.deepEqual(result.bianGua, {
    name: '风水涣',
    upper: { name: '巽', wuxing: 'wood' },
    lower: { name: '坎', wuxing: 'water' },
  });
});

test('uses lunar month and day for traditional time casting', () => {
  const result = castByTime(new Date(2026, 6, 10, 12, 0, 0));

  assert.equal(result.upper.name, '坎');
  assert.equal(result.lower.name, '巽');
  assert.equal(result.benGua.name, '水风井');
  assert.equal(result.dong, 3);
  assert.deepEqual(result.input, {
    calendar: 'lunar',
    year: 2026,
    month: 7,
    day: 10,
    hour: 12,
    minute: 0,
    lunarYear: 2026,
    lunarMonth: 5,
    lunarDay: 26,
    isLeapMonth: false,
    leapMonthPolicy: 'reuse_base_month_number',
    lunarYearGanzhi: '丙午',
    lunarMonthName: '五',
    lunarDayName: '廿六',
    yearBranch: '午',
    hourBranch: '午',
    yearBranchIdx: 7,
    hourBranchIdx: 7,
    timeStr: '2026年7月10日 12:00（农历丙午年五月廿六·午时）',
  });
});

test('reuses the base month number for leap months without duplicating the label', () => {
  const result = castByTime(new Date(2025, 6, 25, 12, 0, 0));

  assert.equal(result.input.isLeapMonth, true);
  assert.equal(result.input.lunarMonth, 6);
  assert.equal(result.input.lunarMonthName, '闰六');
  assert.equal(result.input.leapMonthPolicy, 'reuse_base_month_number');
  assert.match(result.input.timeStr, /农历乙巳年闰六月初一/);
  assert.doesNotMatch(result.input.timeStr, /闰闰/);
  assert.equal(result.benGua.name, '风雷益');
  assert.equal(result.dong, 2);
});

test('uses source-pinned stroke counts and never estimates from code points', () => {
  assert.equal(getStrokeCount('亿'), 3);
  assert.equal(getStrokeCount('龘'), 48);
  assert.throws(
    () => getStrokeCount('𠀀'),
    /笔画数据库未收录字符/,
  );
});

test('casts common text with the pinned stroke database', () => {
  const result = castByText('天机卷');

  assert.deepEqual(
    {
      upperStrokes: result.input.upperStrokes,
      lowerStrokes: result.input.lowerStrokes,
      totalStrokes: result.input.totalStrokes,
      upper: result.upper.name,
      lower: result.lower.name,
      dong: result.dong,
    },
    {
      upperStrokes: 4,
      lowerStrokes: 14,
      totalStrokes: 18,
      upper: '震',
      lower: '坎',
      dong: 6,
    },
  );
});

test('separates deterministic chart structure from unvalidated interpretation', () => {
  const result = castByNumber(5, 2);
  const promptInput = formatForAI(result, '是否应该辞职？');

  assert.deepEqual(result.validationModel, {
    school: 'meihua_yishu_declared_methods',
    chartStatus: 'validated_deterministic',
    castingMethodStatus: 'validated_declared_method',
    interpretationStatus: 'not_validated',
  });
  assert.deepEqual(result.tiYong, {
    relation: 'yongKeTi',
    desc: '用克体',
  });
  assert.match(promptInput, /解释状态：not_validated/);
  assert.match(promptInput, /传统解释标签：用克体/);
  assert.doesNotMatch(promptInput, /→ 凶/);
  assert.match(MEIHUA_SYSTEM_PROMPT, /不得把卦象当作事实预测/);
  assert.doesNotMatch(MEIHUA_SYSTEM_PROMPT, /用生体→吉/);
  assert.doesNotMatch(MEIHUA_SYSTEM_PROMPT, /变卦——代表最终结果/);
});

test('marks text casting as a source-pinned modern adaptation', () => {
  const result = castByText('天机卷');

  assert.equal(result.validationModel.castingMethodStatus, 'source_pinned_modern_adaptation');
  assert.equal(result.validationModel.strokeDataStatus, 'unicode_unihan_17_informative');
});

test('rejects values outside the declared casting input domains', () => {
  for (const [num1, num2] of [[0, 2], [-1, 2], [1.5, 2], [1, Number.NaN]]) {
    assert.throws(() => castByNumber(num1, num2), /两个正整数/);
  }
  assert.throws(() => castByTime(new Date('invalid')), /有效日期/);
  assert.throws(() => castByText('天A'), /笔画数据库未收录字符/);
});
