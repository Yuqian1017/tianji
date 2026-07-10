import assert from 'node:assert/strict';
import test from 'node:test';

import { formatForAI, paipan } from '../../src/modules/liuyao/engine.js';
import { LIUYAO_SYSTEM_PROMPT } from '../../src/modules/liuyao/prompt.js';

test('uses Ren for outer Qian and Gui for outer Kun', () => {
  const qian = paipan([7, 7, 7, 7, 7, 7]);
  assert.deepEqual(qian.lines.slice(3).map(({ stem, branch }) => stem + branch), [
    '壬午', '壬申', '壬戌',
  ]);

  const kun = paipan([8, 8, 8, 8, 8, 8]);
  assert.deepEqual(kun.lines.slice(3).map(({ stem, branch }) => stem + branch), [
    '癸丑', '癸亥', '癸酉',
  ]);
});

test('uses the exact solar-term boundary for divination date pillars', () => {
  const values = [7, 7, 7, 7, 7, 7];
  const beforeLichun = paipan(values, {
    year: 2026, month: 2, day: 4, hour: 3, minute: 55,
  });
  assert.deepEqual(beforeLichun.date, {
    yearStem: '乙',
    yearBranch: '巳',
    monthBranch: '丑',
    dayStem: '己',
    dayBranch: '酉',
  });

  const afterLichun = paipan(values, {
    year: 2026, month: 2, day: 4, hour: 4, minute: 3,
  });
  assert.deepEqual(afterLichun.date, {
    yearStem: '丙',
    yearBranch: '午',
    monthBranch: '寅',
    dayStem: '己',
    dayBranch: '酉',
  });
});

test('rejects line values outside the declared 6-9 coin range', () => {
  assert.throws(
    () => paipan([7, 7, 7, 7, 7, 5]),
    /爻值必须为 6、7、8 或 9/,
  );
});

test('separates validated chart structure from unvalidated interpretation', () => {
  const result = paipan([7, 7, 7, 7, 7, 7], {
    year: 2026, month: 7, day: 10, hour: 12, minute: 0,
  });
  const promptInput = formatForAI(result, '是否应该辞职？');

  assert.deepEqual(result.validationModel, {
    school: 'jingfang_eight_palaces_najia',
    chartStatus: 'validated_deterministic',
    interpretationStatus: 'not_validated',
  });
  assert.match(promptInput, /解释状态：not_validated/);
  assert.match(LIUYAO_SYSTEM_PROMPT, /不得把卦象当作事实预测/);
  assert.doesNotMatch(LIUYAO_SYSTEM_PROMPT, /六冲卦 = 事散不成/);
  assert.doesNotMatch(LIUYAO_SYSTEM_PROMPT, /世爻空亡 = 问事人心不诚或事不成/);
});
