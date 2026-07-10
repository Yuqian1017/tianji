import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { sha256 } from '../../scripts/validation/lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from '../../scripts/validation/lib/tcm-runtime-consumer-files.mjs';

const CORE_PATH = 'database/tcm/normalized/tcm-theory-diagnosis-candidates.json';

async function core() {
  return JSON.parse(await readFile(CORE_PATH, 'utf8'));
}

test('pins the complete theory and diagnosis slice while keeping every claim blocked', async () => {
  const data = await core();
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.domain, 'tcm_theory_and_diagnosis_candidates');
  assert.equal(data.productEligibility, 'blocked');
  assert.deepEqual(data.runtimeEligibleFields, []);
  assert.deepEqual(data.counts, {
    references: 14,
    sourceNonEmptyLines: 836,
    sourceMarkdownTables: 31,
    sourceMarkdownTableRows: 157,
    sections: 124,
    priorityLineCandidates: 127,
    findings: 14,
  });
  for (const source of Object.values(data.sourceRefs)) {
    assert.equal(source.sha256, sha256(await readFile(source.path, 'utf8')));
  }
  assert.equal(Object.values(data.sourceInventory).flatMap(item => item.lines).length, 836);
  assert.ok(Object.values(data.sourceInventory).flatMap(item => item.lines)
    .every(line => line.productEligibility === 'blocked'));
  assert.ok(data.priorityLines.every(line => line.productEligibility === 'blocked'));
});

test('records high-risk extrapolations as bounded, unsupported, or reliability-limited', async () => {
  const data = await core();
  const byId = new Map(data.findings.map(finding => [finding.id, finding]));

  assert.equal(byId.get('TCM-TD-001').status, 'traditional_construct_not_biomedical_anatomy');
  assert.equal(byId.get('TCM-TD-002').status, 'unsupported_standalone_tongue_organ_diagnosis');
  assert.equal(byId.get('TCM-TD-003').status, 'diagnostic_framework_low_to_moderate_inter_rater_agreement');
  assert.equal(byId.get('TCM-TD-004').status, 'pulse_diagnosis_reliability_requires_operational_definition');
  assert.equal(byId.get('TCM-TD-005').status, 'incomplete_constitution_taxonomy_not_ccmq_equivalent');
  assert.equal(byId.get('TCM-TD-006').status, 'unsupported_constitution_determines_disease_claim');
  assert.equal(byId.get('TCM-TD-007').status, 'unsupported_banlangen_influenza_prevention');
  assert.equal(byId.get('TCM-TD-008').status, 'unsupported_geography_based_drug_and_dose_rule');
  assert.equal(byId.get('TCM-TD-009').status, 'unsafe_body_type_poison_tolerance_rule');
  assert.equal(byId.get('TCM-TD-010').status, 'unsupported_pediatric_finger_vein_severity_diagnosis');
  assert.equal(byId.get('TCM-TD-011').status, 'unsupported_voice_breathing_disease_localization_and_prognosis');
  assert.equal(byId.get('TCM-TD-012').status, 'unsupported_pulse_position_organ_diagnosis');
  assert.equal(byId.get('TCM-TD-013').status, 'unsupported_fixed_stroke_prodrome_prediction');
  assert.equal(byId.get('TCM-TD-014').status, 'traditional_pattern_tables_not_validated_clinical_answer_key');
  assert.ok(data.findings.every(finding => finding.productEligibility === 'blocked'));
});

test('active runtime does not import the blocked theory-diagnosis core or finding ids', async () => {
  const files = await tcmRuntimeConsumerPaths();
  const text = (await Promise.all(files.map(filePath => readFile(filePath, 'utf8')))).join('\n');
  assert.doesNotMatch(text, /tcm-theory-diagnosis-candidates/);
  assert.doesNotMatch(text, /TCM-TD-0(?:0[1-9]|1[0-4])/);
});
