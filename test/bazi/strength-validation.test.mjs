import assert from 'node:assert/strict';
import test from 'node:test';

import { formatForAI, paiBazi } from '../../src/modules/bazi/engine.js';

test('labels the strength score as an unvalidated heuristic', () => {
  const result = paiBazi(1993, 12, 8, 18, 0, 'male');

  assert.deepEqual(
    Object.values(result.pillars).map(({ stem, branch }) => stem + branch),
    ['癸酉', '甲子', '癸亥', '辛酉'],
  );
  assert.equal(result.strength.score, 81);
  assert.equal(result.strength.validationStatus, 'heuristic_only');
  assert.equal(result.strength.method, 'simplified_support_balance_v1');
  assert.equal(result.strength.displayLabel, '简化模型偏强');
  assert.equal('yongShenDirection' in result.strength, false);
  assert.match(result.strength.limitations.join('；'), /不能确定用神/);
});

test('does not send the numeric score or a fixed YongShen answer to AI', () => {
  const result = paiBazi(2012, 2, 23, 12, 0, 'male');
  const prompt = formatForAI(result);

  assert.doesNotMatch(prompt, /\/100/);
  assert.doesNotMatch(prompt, /用神方向：/);
  assert.match(prompt, /未校勘启发式/);
  assert.match(prompt, /五行结构计数（非旺衰）/);
});
