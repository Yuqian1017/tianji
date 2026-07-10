import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findMountain,
  flyStars,
  formatForAI,
  getBenMingGua,
  getCurrentYunForDate,
  getMonthFlyStarForDate,
  getYearFlyStarForDate,
  paiFengshui,
} from '../../src/modules/fengshui/engine.js';
import { ERSHISI_SHAN, FLY_ORDER } from '../../src/modules/fengshui/data.js';
import { FENGSHUI_SYSTEM_PROMPT } from '../../src/modules/fengshui/prompt.js';

const PALACE_BY_GUA = {
  坎: 1, 坤: 2, 震: 3, 巽: 4, 中: 5, 乾: 6, 兑: 7, 艮: 8, 离: 9,
};

const GUA_BY_PALACE = Object.fromEntries(
  Object.entries(PALACE_BY_GUA).map(([gua, palace]) => [palace, gua]),
);

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

const EXPECTED_BY_NAME = Object.fromEntries(EXPECTED_MOUNTAINS.map((row, index) => [
  row[0],
  { name: row[0], gua: row[1], sanyuan: row[2], yinyang: row[3], index },
]));

function expectedFly(center, forward) {
  return Object.fromEntries(FLY_ORDER.map((palace, index) => {
    const delta = forward ? index : -index;
    return [palace, ((center - 1 + delta + 18) % 9) + 1];
  }));
}

function expectedDirection(centerStar, sourceMountain) {
  if (centerStar === 5) return sourceMountain.yinyang === '阳';
  const homeGua = GUA_BY_PALACE[centerStar];
  const substitute = Object.values(EXPECTED_BY_NAME).find(
    mountain => mountain.gua === homeGua && mountain.sanyuan === sourceMountain.sanyuan,
  );
  return substitute.yinyang === '阳';
}

function expectedChart(period, sittingName) {
  const sitting = EXPECTED_BY_NAME[sittingName];
  const facing = Object.values(EXPECTED_BY_NAME).find(
    mountain => mountain.gua === OPPOSITE_GUA[sitting.gua] && mountain.sanyuan === sitting.sanyuan,
  );
  const periodChart = expectedFly(period, true);
  const mountainCenter = periodChart[PALACE_BY_GUA[sitting.gua]];
  const waterCenter = periodChart[PALACE_BY_GUA[facing.gua]];
  return {
    period: periodChart,
    mountain: expectedFly(mountainCenter, expectedDirection(mountainCenter, sitting)),
    water: expectedFly(waterCenter, expectedDirection(waterCenter, facing)),
  };
}

function mountainCenterDegree(mountain) {
  if (mountain.start < mountain.end) return (mountain.start + mountain.end) / 2;
  return 0;
}

test('uses the canonical 24-mountain Earth/Heaven/Human dragon and Yin/Yang table', () => {
  assert.equal(ERSHISI_SHAN.length, 24);
  assert.deepEqual(
    ERSHISI_SHAN.map(({ name, gua, sanyuan, yinyang }) => [name, gua, sanyuan, yinyang]),
    EXPECTED_MOUNTAINS.map(([name, gua, sanyuan, yinyang]) => [name, gua, sanyuan, yinyang]),
  );

  for (const mountain of ERSHISI_SHAN) {
    assert.equal(findMountain(mountainCenterDegree(mountain)).name, mountain.name);
  }
});

test('flies all nine center stars forward and reverse along the Luo Shu path', () => {
  for (let center = 1; center <= 9; center += 1) {
    assert.deepEqual(flyStars(center, true), expectedFly(center, true));
    assert.deepEqual(flyStars(center, false), expectedFly(center, false));
  }
});

test('matches the declared lower-trigram algorithm for all 216 period and mountain charts', () => {
  for (let period = 1; period <= 9; period += 1) {
    const year = 1864 + (period - 1) * 20;
    for (const mountain of ERSHISI_SHAN) {
      const actual = paiFengshui(year, mountainCenterDegree(mountain), 2024);
      const expected = expectedChart(period, mountain.name);
      assert.deepEqual(actual.yunPan, expected.period, `${period}运${mountain.name}山运盘`);
      assert.deepEqual(actual.shanPan, expected.mountain, `${period}运${mountain.name}山山盘`);
      assert.deepEqual(actual.xiangPan, expected.water, `${period}运${mountain.name}山向盘`);
    }
  }
});

test('uses exact Beginning of Spring for period and annual-star year boundaries', () => {
  const beforePeriod = getCurrentYunForDate(2024, 2, 4, 16, 26);
  const afterPeriod = getCurrentYunForDate(2024, 2, 4, 16, 28);
  assert.equal(beforePeriod.yun, 8);
  assert.equal(afterPeriod.yun, 9);

  assert.equal(getYearFlyStarForDate(2024, 2, 4, 16, 26)[5], 4);
  assert.equal(getYearFlyStarForDate(2024, 2, 4, 16, 28)[5], 3);
});

test('uses exact solar-term months instead of Gregorian months for monthly stars', () => {
  assert.equal(getMonthFlyStarForDate(2024, 3, 5, 10, 21)[5], 5);
  assert.equal(getMonthFlyStarForDate(2024, 3, 5, 10, 23)[5], 4);
});

test('uses the 21st-century Eight Mansions Kua constants', () => {
  assert.deepEqual(getBenMingGua(2000, 'male'), { number: 9, name: '离', group: '东四命' });
  assert.deepEqual(getBenMingGua(2000, 'female'), { number: 6, name: '乾', group: '西四命' });
  assert.deepEqual(getBenMingGua(2001, 'male'), { number: 8, name: '艮', group: '西四命' });
  assert.deepEqual(getBenMingGua(2001, 'female'), { number: 7, name: '兑', group: '西四命' });
});

test('rejects invalid deterministic inputs instead of silently normalizing them', () => {
  assert.throws(() => findMountain(Number.NaN), /finite|有效|度数/i);
  assert.throws(() => paiFengshui(2024.5, 0, 2026), /year|年份|整数/i);
  assert.throws(() => paiFengshui(2024, Number.POSITIVE_INFINITY, 2026), /finite|有效|度数/i);
  assert.throws(() => paiFengshui(2024, 5, 2026), /下卦|替卦|正向|范围/i);
  assert.throws(() => getBenMingGua(2001, 'other'), /gender|性别|male|female/i);
});

test('keeps deterministic chart labels separate from unvalidated predictions and remedies', () => {
  const result = paiFengshui(2024, 0, 2026);
  const context = formatForAI(result);

  assert.equal(result.meta.validation, 'validated_declared_school');
  assert.equal(result.meta.interpretationValidation, 'not_validated');
  assert.doesNotMatch(context, /大凶|疾病|财运|健康|官非|盗贼|化解|铜葫芦|六帝/);
  assert.doesNotMatch(FENGSHUI_SYSTEM_PROMPT, /疾病|财运|健康|官非|盗贼|化解|铜葫芦|六帝/);
});
