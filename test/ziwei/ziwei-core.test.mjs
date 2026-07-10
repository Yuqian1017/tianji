import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BRANCHES,
  NAYIN,
  SIHUA_TABLE,
  TIANKUI_TABLE,
  TIANYUE_TABLE,
  ZIWEI_TABLE,
} from '../../src/modules/ziwei/data.js';
import { formatForAI, paiZiwei } from '../../src/modules/ziwei/engine.js';
import { ZIWEI_SYSTEM_PROMPT } from '../../src/modules/ziwei/prompt.js';

function expectedZiweiPosition(lunarDay, bureau) {
  let adjustment = 0;
  while ((lunarDay + adjustment) % bureau !== 0) adjustment += 1;
  const quotient = (lunarDay + adjustment) / bureau;
  const directionAdjustment = adjustment % 2 === 0 ? adjustment : -adjustment;
  const indexFromYin = quotient - 1 + directionAdjustment;
  return BRANCHES[(2 + indexFromYin % 12 + 12) % 12];
}

test('Ziwei placement table follows the declared bureau/day rule for all 150 cells', () => {
  for (const bureau of [2, 3, 4, 5, 6]) {
    for (let lunarDay = 1; lunarDay <= 30; lunarDay += 1) {
      assert.equal(
        ZIWEI_TABLE[bureau][lunarDay],
        expectedZiweiPosition(lunarDay, bureau),
        `bureau ${bureau}, lunar day ${lunarDay}`,
      );
    }
  }
});

test('known 2000-08-16 Yin-hour chart has Ziwei at Wu and Tianfu at Xu', () => {
  const chart = paiZiwei(2000, 8, 16, '寅', 'female');
  assert.equal(chart.lunar.lunarMonth, 7);
  assert.equal(chart.lunar.lunarDay, 17);
  assert.equal(chart.mingGong.branch, '午');
  assert.equal(chart.shenGong.branch, '戌');
  assert.equal(chart.juName, '木三局');
  assert.equal(chart.ziweiPos, '午');
  assert.equal(chart.tianfuPos, '戌');
  assert.deepEqual(chart.mainStarPositions, {
    '紫微': '午', '天机': '巳', '太阳': '卯', '武曲': '寅', '天同': '丑', '廉贞': '戌',
    '天府': '戌', '太阴': '亥', '贪狼': '子', '巨门': '丑', '天相': '寅', '天梁': '卯', '七杀': '辰', '破军': '申',
  });
  assert.deepEqual(
    chart.dayun.map(({ stem, branch, startAge, endAge }) => ({ stem, branch, startAge, endAge })),
    [
      { stem: '壬', branch: '午', startAge: 3, endAge: 12 },
      { stem: '辛', branch: '巳', startAge: 13, endAge: 22 },
      { stem: '庚', branch: '辰', startAge: 23, endAge: 32 },
      { stem: '己', branch: '卯', startAge: 33, endAge: 42 },
      { stem: '戊', branch: '寅', startAge: 43, endAge: 52 },
      { stem: '己', branch: '丑', startAge: 53, endAge: 62 },
      { stem: '戊', branch: '子', startAge: 63, endAge: 72 },
      { stem: '丁', branch: '亥', startAge: 73, endAge: 82 },
      { stem: '丙', branch: '戌', startAge: 83, endAge: 92 },
      { stem: '乙', branch: '酉', startAge: 93, endAge: 102 },
      { stem: '甲', branch: '申', startAge: 103, endAge: 112 },
      { stem: '癸', branch: '未', startAge: 113, endAge: 122 },
    ],
  );
});

test('finite core tables have complete domains and valid branches', () => {
  assert.equal(Object.keys(NAYIN).length, 60);
  assert.equal(Object.keys(SIHUA_TABLE).length, 10);
  assert.ok(Object.values(ZIWEI_TABLE).every((table) => Object.keys(table).length === 30));
  assert.ok(Object.values(ZIWEI_TABLE).flatMap(Object.values).every((branch) => BRANCHES.includes(branch)));
});

test('Tian Kui and Tian Yue follow the declared traditional year-stem table', () => {
  assert.deepEqual(TIANKUI_TABLE, {
    '甲': '丑', '乙': '子', '丙': '亥', '丁': '亥', '戊': '丑',
    '己': '子', '庚': '丑', '辛': '午', '壬': '卯', '癸': '卯',
  });
  assert.deepEqual(TIANYUE_TABLE, {
    '甲': '未', '乙': '申', '丙': '酉', '丁': '酉', '戊': '未',
    '己': '申', '庚': '未', '辛': '寅', '壬': '巳', '癸': '巳',
  });
});

test('chart input rejects invalid dates, hour branches, and genders', () => {
  assert.throws(() => paiZiwei(2024, 2, 30, '子', 'male'), /valid Gregorian date/);
  assert.throws(() => paiZiwei(2024, 1, 1, '午时', 'male'), /hourBranch/);
  assert.throws(() => paiZiwei(2024, 1, 1, '午', 'unknown'), /gender/);
});

test('chart and AI context preserve the validation and school boundaries', () => {
  const chart = paiZiwei(2000, 8, 16, '寅', 'female');
  assert.deepEqual(chart.validationModel, {
    school: 'ziwei_doushu_quanshu_common_star_tables',
    chartStatus: 'validated_declared_school',
    leapMonthPolicy: 'reuse_base_lunar_month_number',
    interpretationStatus: 'not_validated',
  });

  const context = formatForAI(chart, '综合说明');
  assert.match(context, /排盘口径：ziwei_doushu_quanshu_common_star_tables/);
  assert.match(context, /排盘结构：validated_declared_school/);
  assert.match(context, /解释状态：not_validated/);
  assert.match(context, /闰月口径：reuse_base_lunar_month_number/);
});

test('AI prompt blocks factual prediction and high-risk inferences', () => {
  assert.match(ZIWEI_SYSTEM_PROMPT, /不构成事实预测/);
  assert.match(ZIWEI_SYSTEM_PROMPT, /不得.*疾病/);
  assert.match(ZIWEI_SYSTEM_PROMPT, /医疗.*法律.*投资/);
});
