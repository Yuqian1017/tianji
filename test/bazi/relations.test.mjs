import assert from 'node:assert/strict';
import test from 'node:test';

import { BRANCH_RELATIONS } from '../../src/modules/bazi/data.js';

test('Liuhe labels do not claim a completed elemental transformation', () => {
  for (const relation of BRANCH_RELATIONS.liuhe) {
    assert.equal(relation.label, `${relation.pair.join('')}合`);
  }
});

test('Wu-Wei keeps both disputed transformation candidates as metadata', () => {
  const relation = BRANCH_RELATIONS.liuhe.find(
    ({ pair }) => pair[0] === '午' && pair[1] === '未',
  );

  assert.deepEqual(relation.huaCandidates, ['fire', 'earth']);
});
