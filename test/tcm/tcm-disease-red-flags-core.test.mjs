import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { sha256 } from '../../scripts/validation/lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from '../../scripts/validation/lib/tcm-runtime-consumer-files.mjs';

const CORE_PATH = 'database/tcm/normalized/tcm-disease-red-flag-candidates.json';
const SOURCE_PATHS = {
  ref31: 'database/tcm/skill-v3/references/31-内科-肺系病证.md',
  ref32: 'database/tcm/skill-v3/references/32-内科-心系病证.md',
  ref33: 'database/tcm/skill-v3/references/33-内科-脾胃系病证.md',
  ref34: 'database/tcm/skill-v3/references/34-内科-肝胆病证.md',
  ref35: 'database/tcm/skill-v3/references/35-内科-肾系病证.md',
  ref36: 'database/tcm/skill-v3/references/36-内科-气血津液病证.md',
  ref37: 'database/tcm/skill-v3/references/37-内科-肢体经络病证.md',
  evidence: 'database/tcm/sources/disease-red-flag-evidence.json',
};

async function core() {
  return JSON.parse(await readFile(CORE_PATH, 'utf8'));
}

test('pins the full disease source slice and keeps it fail closed', async () => {
  const data = await core();
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.productEligibility, 'blocked');
  assert.deepEqual(data.runtimeEligibleFields, []);
  assert.deepEqual(data.counts, {
    diseaseSections: 52,
    sourceNonEmptyLines: 689,
    sourceMarkdownTables: 22,
    sourceMarkdownTableRows: 133,
    keywordRiskLineCandidates: 83,
    actionableLineCandidates: 308,
    conflictFindings: 9,
    supportedRedFlagFindings: 9,
    mixedBoundaryFindings: 2,
  });
  for (const [sourceId, filePath] of Object.entries(SOURCE_PATHS)) {
    assert.equal(data.sourceRefs[sourceId].sha256, sha256(await readFile(filePath, 'utf8')));
  }
});

test('separates supported red flags from unsafe or unsupported home actions', async () => {
  const data = await core();
  const byId = new Map(data.findings.map(finding => [finding.id, finding]));
  assert.equal(byId.get('TCM-DIS-001').status, 'conflict_do_not_induce_vomiting');
  assert.equal(byId.get('TCM-DIS-002').status, 'conflict_emergency_retention_home_methods');
  assert.equal(byId.get('TCM-DIS-003').status, 'conflict_poisoning_home_antidote');
  assert.equal(byId.get('TCM-DIS-004').status, 'unsupported_universal_tcm_rescue_pill');
  assert.equal(byId.get('TCM-DIS-005').status, 'conflict_oral_intake_after_syncope');
  assert.equal(byId.get('TCM-DIS-006').status, 'unsupported_three_year_stroke_prediction');
  assert.equal(byId.get('TCM-DIS-007').status, 'supported_seizure_first_aid');
  assert.equal(byId.get('TCM-DIS-008').status, 'supported_stroke_emergency');
  assert.equal(byId.get('TCM-DIS-012').status, 'supported_professional_help_but_immediate_danger_escalation_missing');
  assert.equal(byId.get('TCM-DIS-015').status, 'supported_acute_abdomen_surgical_emergency');
  assert.equal(byId.get('TCM-DIS-016').status, 'supported_severe_acute_abdomen_emergency');
  assert.equal(byId.get('TCM-DIS-017').status, 'unsupported_emergency_gi_bleed_dose');
  assert.equal(byId.get('TCM-DIS-018').status, 'mixed_convulsion_first_aid_mouth_action_blocked');
  assert.equal(byId.get('TCM-DIS-019').status, 'unsupported_acute_abdomen_formula_substitution');
  assert.equal(byId.get('TCM-DIS-020').status, 'supported_urgent_cardiopulmonary_escalation');
  assert.deepEqual(byId.get('TCM-DIS-015').comparatorSourceIds, ['MEDLINEPLUS-ABDOMINAL-PAIN']);
  assert.deepEqual(byId.get('TCM-DIS-016').comparatorSourceIds, ['MEDLINEPLUS-ABDOMINAL-PAIN']);
  assert.ok(data.findings.every(finding => finding.productEligibility === 'blocked'));
});

test('preserves every disease and raw line while blocking all treatment fields', async () => {
  const data = await core();
  assert.equal(data.references.flatMap(reference => reference.sections).length, 52);
  assert.equal(Object.values(data.sourceInventory).flatMap(inventory => inventory.lines).length, 689);
  assert.ok(data.references.flatMap(reference => reference.sections).every(section => section.productEligibility === 'blocked'));
  assert.equal(data.keywordRiskLines.length, 83);
  assert.equal(data.actionableLines.length, 308);
  assert.ok(data.keywordRiskLines.every(item => item.productEligibility === 'blocked'));
  assert.ok(data.actionableLines.every(item => item.productEligibility === 'blocked'));
});

test('the runtime consumer inventory does not import disease candidates or finding ids', async () => {
  const files = await tcmRuntimeConsumerPaths();
  const text = (await Promise.all(files.map(filePath => readFile(filePath, 'utf8')))).join('\n');
  assert.doesNotMatch(text, /tcm-disease-red-flag-candidates/);
  assert.doesNotMatch(text, /TCM-DIS-00[1-9]|TCM-DIS-01[0-9]|TCM-DIS-020/);
});
