import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { sha256 } from '../../scripts/validation/lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from '../../scripts/validation/lib/tcm-runtime-consumer-files.mjs';

const SOURCE_PATH = 'database/tcm/sources/nhc-food-medicine-directory.json';
const CORE_PATH = 'database/tcm/normalized/tcm-food-medicine-adjudications.json';

test('builds a 106-entry source catalog and bounded Skill adjudication core', async () => {
  const source = JSON.parse(await readFile(SOURCE_PATH, 'utf8'));
  const core = JSON.parse(await readFile(CORE_PATH, 'utf8'));
  assert.deepEqual(source.counts, {
    total: 106,
    byBatch: { 'nhc-2002-51': 87, 'nhc-2019-8': 6, 'nhc-2023-9': 9, 'nhc-2024-4': 4 },
  });
  assert.deepEqual(core.counts, {
    directoryEntries: 106,
    skillAFoodSubstances: 15,
    skillAMatchedCurrentDirectory: 13,
    skillANotInCurrentDirectory: 2,
    explicitFoodClaims: 8,
    explicitClaimIngredients: 38,
    claimIngredientsMatchedCurrentDirectory: 18,
    claimIngredientIdentityOrProcessGaps: 5,
    claimIngredientsNotInCurrentDirectory: 15,
  });
  assert.ok(source.items.every(item => item.runtimeEligibleFields.length === 0));
  assert.ok(core.explicitClaims.every(claim => claim.productEligibility === 'blocked'));
  assert.ok(core.findings.every(finding => finding.productEligibility === 'blocked'));
});

test('pins every Skill claim to the current source line and keeps generated ids out of runtime', async () => {
  const core = JSON.parse(await readFile(CORE_PATH, 'utf8'));
  for (const claim of core.explicitClaims) {
    const text = await readFile(claim.sourcePath, 'utf8');
    assert.equal(claim.sourceSha256, sha256(text));
    assert.equal(claim.sourceText, text.split('\n')[claim.sourceLine - 1].trim());
  }

  const runtimePaths = await tcmRuntimeConsumerPaths();
  const runtimeText = (await Promise.all(runtimePaths.map(filePath => readFile(filePath, 'utf8')))).join('\n');
  assert.doesNotMatch(runtimeText, /tcm-food-medicine-adjudications|nhc-food-medicine-directory|TCM-FM-00[1-4]/);
});
