import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const OFFICIAL_TOXIC_NAMES = [
  '砒石', '砒霜', '水银', '生马钱子', '生川乌', '生草乌', '生白附子', '生附子',
  '生半夏', '生南星', '生巴豆', '斑蝥', '青娘虫', '红娘虫', '生甘遂', '生狼毒',
  '生藤黄', '生千金子', '生天仙子', '闹羊花', '雪上一枝蒿', '红升丹', '白降丹',
  '蟾酥', '洋金花', '红粉', '轻粉', '雄黄',
];

async function json(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

test('normalizes the official toxic-medicine list without widening its evidence', async () => {
  const core = await json('database/tcm/normalized/tcm-safety-core.json');
  assert.equal(core.schemaVersion, 1);
  assert.equal(core.legalToxicMedicines.status, 'official_list_crosschecked');
  assert.deepEqual(core.legalToxicMedicines.names, OFFICIAL_TOXIC_NAMES);
  assert.equal(new Set(core.legalToxicMedicines.names).size, 28);
  assert.equal(core.legalToxicMedicines.productEligibility, 'safety_blocklist');

  assert.equal(core.skillDoseTable.markdownRowCount, 100);
  assert.equal(core.skillDoseTable.namedSubstanceCount, 101);
  assert.equal(core.skillDoseTable.currentPharmacopoeiaValidation, 'not_validated');
  assert.equal(core.skillDoseTable.productEligibility, 'blocked');
});

test('preserves every retired runtime consumption category as reviewable legacy data', async () => {
  const baseline = await json('database/tcm/legacy/runtime-consumption-baseline-9ff07ff.json');
  assert.equal(baseline.status, 'removed_pending_review');
  assert.equal(baseline.sourceCommit, '9ff07ff');
  assert.equal(baseline.constitution.questionCount, 34);
  assert.equal(baseline.constitution.planCount, 9);
  assert.equal(baseline.constitution.herbLabels.length, 28);
  assert.equal(baseline.constitution.doseItems.length, 22);
  assert.equal(baseline.constitution.acupoints.length, 18);
  assert.equal(baseline.meridianClock.claimRows, 12);
  assert.equal(baseline.meridianClock.acupointRows, 24);
  assert.equal(baseline.meridianClock.acupoints.length, 21);
  assert.equal(new Set([...baseline.constitution.acupoints, ...baseline.meridianClock.acupoints]).size, 30);
});
