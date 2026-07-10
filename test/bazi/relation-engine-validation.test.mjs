import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BAZI_RELATION_MODEL,
  BAZI_SHENSHA_MODEL,
  detectBranchInteractions,
  detectShensha,
  formatForAI,
  paiBazi,
} from '../../src/modules/bazi/engine.js';
import { HUAGAI, TAOHUA, YIMA } from '../../src/modules/bazi/data.js';

test('detects directional punishment when only two members are present', () => {
  const interactions = detectBranchInteractions(['寅', '巳', '子', '丑']);

  assert.ok(interactions.some(({ type, label }) => (
    type === '相刑' && label === '寅刑巳'
  )));
});

test('collapses a complete punishment group into one three-punishment label', () => {
  const interactions = detectBranchInteractions(['寅', '巳', '申', '子']);
  const punishments = interactions.filter(({ type }) => (
    type === '相刑' || type === '三刑'
  ));

  assert.deepEqual(punishments, [{
    type: '三刑',
    label: '寅巳申三刑',
    relationStatus: 'lookup_only',
    interpretationStatus: 'not_validated',
  }]);
});

test('keeps disputed branch breaking inactive', () => {
  const interactions = detectBranchInteractions(['子', '酉', '寅', '亥']);

  assert.equal(BAZI_RELATION_MODEL.poStatus, 'school_difference_inactive');
  assert.equal(interactions.some(({ type }) => type === '相破'), false);
});

test('keeps combination elements as candidates rather than completed transformations', () => {
  const interactions = detectBranchInteractions(['申', '子', '辰', '午']);
  const sanhe = interactions.find(({ type }) => type === '三合');

  assert.equal(sanhe.label, '申子辰三合');
  assert.deepEqual(sanhe.huaCandidates, ['water']);
  assert.equal(sanhe.transformationStatus, 'not_evaluated');
});

test('validates the three shensha lookup tables as lookup-only labels', () => {
  assert.equal(Object.keys(TAOHUA).length, 12);
  assert.equal(Object.keys(YIMA).length, 12);
  assert.equal(Object.keys(HUAGAI).length, 12);
  assert.equal(BAZI_SHENSHA_MODEL.validationStatus, 'lookup_only');

  const labels = detectShensha('子', '午', ['午', '酉', '寅', '辰']);
  assert.deepEqual(labels.map(({ name, target, lookupBases }) => ({
    name,
    target,
    lookupBases,
  })), [
    { name: '桃花', target: '酉', lookupBases: ['day'] },
    { name: '驿马', target: '寅', lookupBases: ['day'] },
    { name: '华盖', target: '辰', lookupBases: ['day'] },
  ]);
  assert.ok(labels.every(({ validationStatus }) => validationStatus === 'lookup_only'));
});

test('marks relation and shensha output as non-interpretive in the AI input', () => {
  const result = paiBazi(1993, 12, 8, 18, 0, 'male');
  const prompt = formatForAI(result);

  assert.match(prompt, /地支关系（仅查表，未判合化或吉凶）/);
  assert.match(prompt, /神煞标签（仅查表，不作吉凶）/);
});
