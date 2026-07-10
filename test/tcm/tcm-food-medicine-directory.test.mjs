import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FOOD_MEDICINE_DIRECTORY,
  SKILL_A_FOOD_SUBSTANCES,
  SKILL_EXPLICIT_FOOD_CLAIMS,
  adjudicateFoodMedicineName,
} from '../../scripts/validation/lib/tcm-food-medicine-directory.mjs';

test('pins the complete 106-item NHC food-medicine directory by announcement batch', () => {
  assert.equal(FOOD_MEDICINE_DIRECTORY.length, 106);
  assert.equal(new Set(FOOD_MEDICINE_DIRECTORY.map(item => item.id)).size, 106);
  assert.equal(new Set(FOOD_MEDICINE_DIRECTORY.map(item => item.name)).size, 106);

  const batchCounts = Object.groupBy(FOOD_MEDICINE_DIRECTORY, item => item.batchId);
  assert.equal(batchCounts['nhc-2002-51'].length, 87);
  assert.equal(batchCounts['nhc-2019-8'].length, 6);
  assert.equal(batchCounts['nhc-2023-9'].length, 9);
  assert.equal(batchCounts['nhc-2024-4'].length, 4);
});

test('keeps grouped names, aliases, parts, and announcement restrictions explicit', () => {
  assert.equal(adjudicateFoodMedicineName('大枣').directoryName, '枣');
  assert.equal(adjudicateFoodMedicineName('生姜').directoryName, '姜');
  assert.equal(adjudicateFoodMedicineName('干姜').directoryName, '姜');
  assert.equal(adjudicateFoodMedicineName('桂圆').directoryName, '龙眼肉');
  assert.equal(adjudicateFoodMedicineName('熟地黄').directoryName, '地黄');
  assert.equal(adjudicateFoodMedicineName('鲜苇根').directoryName, '鲜芦根');

  const danggui = adjudicateFoodMedicineName('当归');
  assert.equal(danggui.foodUseScope, 'spice_and_condiment_only');
  assert.equal(danggui.part, '根');

  const tianma = adjudicateFoodMedicineName('天麻');
  assert.match(tianma.populationRestriction, /过敏体质/);
  assert.match(tianma.batchPopulationRestriction, /孕妇.*哺乳期妇女.*婴幼儿/);
  assert.ok(FOOD_MEDICINE_DIRECTORY.find(item => item.name === '天麻').fieldSourceIds.includes('nhc-2023-9-interpretation'));

  const dihuang = adjudicateFoodMedicineName('地黄');
  assert.equal(dihuang.part, '新鲜或干燥块根');
  assert.ok(dihuang.aliases.includes('熟地黄'));
});

test('separates the Skill A-level list from current directory membership', () => {
  assert.equal(SKILL_A_FOOD_SUBSTANCES.length, 15);
  const rows = SKILL_A_FOOD_SUBSTANCES.map(adjudicateFoodMedicineName);
  assert.equal(rows.filter(row => row.matchStatus === 'matched_current_directory').length, 13);
  assert.deepEqual(
    rows.filter(row => row.matchStatus === 'not_in_current_directory').map(row => row.sourceName).sort(),
    ['核桃仁', '绿豆'],
  );
  assert.ok(rows.every(row => row.productEligibility === 'blocked_pending_use_specific_review'));
});

test('adjudicates every explicit medicine-food or food-therapy recipe claim without formula inheritance', () => {
  assert.equal(SKILL_EXPLICIT_FOOD_CLAIMS.length, 8);
  for (const claim of SKILL_EXPLICIT_FOOD_CLAIMS) {
    assert.ok(claim.sourcePath.startsWith('database/tcm/skill-v3/references/'));
    assert.ok(Number.isInteger(claim.sourceLine));
    assert.equal(claim.productEligibility, 'blocked');
    assert.equal(claim.runtimeEligibleFields.length, 0);
    assert.notEqual(claim.adjudication, 'current_directory_makes_formula_eligible');
  }

  const overbroad = SKILL_EXPLICIT_FOOD_CLAIMS.find(claim => claim.id === 'TCM-FOOD-CLAIM-006');
  assert.ok(overbroad.ingredients.some(item => item.sourceName === '白术' && item.matchStatus === 'not_in_current_directory'));
  assert.ok(overbroad.ingredients.some(item => item.sourceName === '滑石' && item.matchStatus === 'not_in_current_directory'));
  assert.ok(overbroad.ingredients.some(item => item.sourceName === '硫黄' && item.matchStatus === 'not_in_current_directory'));

  const spiceOnly = SKILL_EXPLICIT_FOOD_CLAIMS.find(claim => claim.id === 'TCM-FOOD-CLAIM-003');
  assert.ok(spiceOnly.ingredients.some(item => item.sourceName === '当归' && item.foodUseScope === 'spice_and_condiment_only'));
});
