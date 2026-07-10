import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  ARISTOLOCHIC_SKILL_NAMES,
  COMPATIBILITY_SUPPLEMENTS,
  REGULATORY_ARISTOLOCHIC_NAMES,
  UNSUPPORTED_COMPATIBILITY_EXTENSIONS,
  classifyPregnancyText,
  parseAristolochicSkillCandidates,
  parseDoseTablePregnancyClaims,
  parseEighteenIncompatibilities,
  parseFormulaWarnings,
  parseNineteenFears,
  parsePregnancyTable,
  uniqueComparatorNames,
} from '../../scripts/validation/lib/tcm-pregnancy-compatibility.mjs';

const SAFETY_PATH = 'database/tcm/skill-v3/references/安全-配伍妊娠禁忌与毒性药.md';
const safetyText = await readFile(SAFETY_PATH, 'utf8');

test('expands all three eighteen-incompatibility rows without conflating 沙参 and 苦参', () => {
  const parsed = parseEighteenIncompatibilities(safetyText);
  assert.equal(parsed.rows.length, 3);
  assert.equal(parsed.pairs.length, 50);
  assert.equal(new Set(parsed.pairs.map(pair => pair.id)).size, 50);
  assert.ok(parsed.pairs.some(pair => pair.leftName === '藜芦' && pair.rightName === '南沙参'));
  assert.ok(parsed.pairs.some(pair => pair.leftName === '藜芦' && pair.rightName === '北沙参'));
  assert.ok(parsed.pairs.some(pair => pair.leftName === '藜芦' && pair.rightName === '苦参'));
  assert.ok(!parsed.pairs.some(pair => pair.rightName === '沙参(苦参)'));
  assert.ok(parsed.pairs.every(pair => pair.productEligibility === 'blocked'));
  assert.deepEqual(COMPATIBILITY_SUPPLEMENTS.map(pair => pair.rightName), ['西洋参', '党参']);
  assert.deepEqual(UNSUPPORTED_COMPATIBILITY_EXTENSIONS.map(pair => pair.rightName), ['太子参', '明党参']);
});

test('expands all nine nineteen-fear rows and normalizes historical aliases', () => {
  const parsed = parseNineteenFears(safetyText);
  assert.equal(parsed.rows.length, 9);
  assert.equal(parsed.pairs.length, 10);
  assert.ok(parsed.pairs.some(pair => pair.leftName === '硫黄' && pair.rightName === '芒硝'));
  assert.ok(parsed.pairs.some(pair => pair.leftName === '芒硝' && pair.rightName === '三棱'));
  assert.ok(parsed.pairs.some(pair => pair.leftName === '肉桂' && pair.rightName === '赤石脂'));
  assert.equal(parsed.pairs.filter(pair => pair.rightName === '犀角').length, 2);
  assert.ok(parsed.pairs.every(pair => pair.productEligibility === 'blocked'));
});

test('preserves all 35 pregnancy table source items and route-specific scope', () => {
  const parsed = parsePregnancyTable(safetyText);
  assert.equal(parsed.rows.length, 3);
  assert.equal(parsed.items.length, 35);
  assert.equal(parsed.items.filter(item => item.sourceCategory === 'prohibited_source_claim').length, 22);
  assert.equal(parsed.items.filter(item => item.sourceCategory === 'caution_source_claim').length, 13);

  const qianiu = parsed.items.find(item => item.sourceItem === '牵牛');
  assert.equal(qianiu.canonicalName, '牵牛子');

  const daji = parsed.items.find(item => item.sourceItem === '大戟');
  assert.equal(daji.canonicalName, null);
  assert.deepEqual(daji.alternatives, ['京大戟', '红大戟']);

  const garlic = parsed.items.find(item => item.sourceItem === '大蒜忌灌肠用');
  assert.equal(garlic.canonicalName, '大蒜');
  assert.equal(garlic.routeScope, 'enema_only');
  assert.ok(parsed.items.every(item => item.productEligibility === 'blocked'));
});

test('preserves all formula warning rows and explicit grouped formula names', () => {
  const rows = parseFormulaWarnings(safetyText);
  assert.equal(rows.length, 31);
  assert.equal(new Set(rows.map(row => row.id)).size, 31);
  assert.equal(rows.flatMap(row => row.formulaNames).length, 37);
  assert.deepEqual(
    rows.find(row => row.sourceFormulaCell.startsWith('凉开三宝')).formulaNames,
    ['安宫牛黄丸', '紫雪', '至宝丹'],
  );
  assert.ok(rows.every(row => row.productEligibility === 'blocked'));
});

test('records the six-name Skill aristolochic list separately from the seven-name regulatory universe', () => {
  const candidates = parseAristolochicSkillCandidates(safetyText);
  assert.deepEqual(candidates.map(item => item.name), ARISTOLOCHIC_SKILL_NAMES);
  assert.deepEqual(REGULATORY_ARISTOLOCHIC_NAMES, [
    '关木通', '广防己', '青木香', '马兜铃', '寻骨风', '天仙藤', '朱砂莲',
  ]);
  assert.ok(!ARISTOLOCHIC_SKILL_NAMES.includes('朱砂莲'));
  assert.ok(candidates.every(item => item.productEligibility === 'blocked'));
});

test('extracts dose-table pregnancy claims without silently equating 禁用, 慎用, and 不宜', () => {
  const claims = parseDoseTablePregnancyClaims(safetyText);
  assert.ok(claims.length > 30);
  assert.equal(classifyPregnancyText('孕妇禁用。'), 'prohibited');
  assert.equal(classifyPregnancyText('孕妇慎用。'), 'caution');
  assert.equal(classifyPregnancyText('孕妇不宜。'), 'caution');
  assert.equal(classifyPregnancyText('妊娠呕吐用之宜慎。'), 'caution');
  assert.equal(classifyPregnancyText('青光眼禁用，孕妇、前列腺重度肥大慎。'), 'caution');
  assert.equal(classifyPregnancyText('无妊娠相关内容。'), 'pregnancy_mentioned_unclassified');
  assert.equal(claims.find(item => item.sourceName.startsWith('华山参')).sourceClassification, 'caution');
  assert.deepEqual(claims.find(item => item.sourceName.startsWith('禹白附')).comparatorNames, ['白附子']);
  assert.ok(claims.every(item => item.productEligibility === 'blocked'));
});

test('builds a stable unique comparator-name domain covering every safety source layer', () => {
  const names = uniqueComparatorNames(safetyText);
  assert.equal(new Set(names).size, names.length);
  for (const name of ['川乌', '川贝母', '京大戟', '红大戟', '南沙参', '苦参', '牵牛子', '肉桂']) {
    assert.ok(names.includes(name), `missing comparator name ${name}`);
  }
  assert.ok(names.includes('白附子'));
  assert.ok(!names.includes('禹白附'));
  for (const name of ['广防己', '寻骨风', '朱砂莲']) assert.ok(names.includes(name));
});
