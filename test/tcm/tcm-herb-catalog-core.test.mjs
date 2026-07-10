import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { sha256 } from '../../scripts/validation/lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from '../../scripts/validation/lib/tcm-runtime-consumer-files.mjs';

const CORE_PATH = 'database/tcm/normalized/tcm-herb-catalog-candidates.json';

async function core() {
  return readFile(CORE_PATH, 'utf8').then(JSON.parse).catch(() => null);
}

test('pins the complete 15-23 source inventory while keeping every record blocked', async () => {
  const data = await core();
  assert.ok(data, 'herb catalog core must be built');
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.domain, 'tcm_herb_catalog_candidates');
  assert.equal(data.productEligibility, 'blocked');
  assert.deepEqual(data.runtimeEligibleFields, []);
  assert.deepEqual(data.counts, {
    references: 9,
    sourceNonEmptyLines: 1331,
    sourceMarkdownTables: 45,
    sourceMarkdownTableRows: 279,
    sections: 122,
    priorityLineCandidates: 663,
    diseaseHerbIndexEntries: 100,
    claimedDiseaseHerbIndexEntries: 103,
    missingDiseaseHerbIndexNumbers: 3,
    findings: 20,
  });
  assert.deepEqual(data.diseaseHerbIndex.numbering.missing, [52, 53, 54]);
  assert.deepEqual(data.priorityCategoryCounts, {
    dose: 472,
    toxicity: 125,
    heavyMetal: 42,
    modernEfficacy: 21,
    vulnerablePopulation: 150,
    homeAction: 6,
    externalAdministration: 49,
    reverseIndex: 100,
  });
  assert.deepEqual(data.diseaseHerbIndex.numbering.inversions, [
    { previous: 47, current: 36, sourceLine: 61 },
    { previous: 60, current: 55, sourceLine: 83 },
  ]);
  for (const source of Object.values(data.sourceRefs)) {
    assert.equal(source.sha256, sha256(await readFile(source.path, 'utf8')));
  }
  assert.equal(Object.values(data.sourceInventory).flatMap(item => item.lines).length, 1331);
  assert.ok(Object.values(data.sourceInventory).flatMap(item => item.lines)
    .every(line => line.productEligibility === 'blocked'));
  assert.ok(data.priorityLines.every(line => line.productEligibility === 'blocked'));
  assert.ok(data.diseaseHerbIndex.entries.every(item => item.productEligibility === 'blocked'));
});

test('records the twenty source, dose, poisoning, regulatory and efficacy findings', async () => {
  const data = await core();
  assert.ok(data, 'herb catalog core must be built');
  assert.deepEqual(data.findings.map(finding => [finding.id, finding.status]), [
    ['TCM-HC-001', 'source_count_and_order_mismatch_103_claim_vs_100_entries'],
    ['TCM-HC-002', 'unsafe_home_antidote_generalization'],
    ['TCM-HC-003', 'unsupported_universal_pediatric_fractional_dosing'],
    ['TCM-HC-004', 'fixed_decoction_time_not_product_safety_authority'],
    ['TCM-HC-005', 'unsafe_body_type_poison_tolerance'],
    ['TCM-HC-006', 'unsupported_geography_based_dosing'],
    ['TCM-HC-007', 'unsupported_intranasal_single_herb_effectiveness'],
    ['TCM-HC-008', 'unsupported_modern_antihypertensive_claim'],
    ['TCM-HC-009', 'cancelled_qingmuxiang_standard_but_dose_and_indication_present'],
    ['TCM-HC-010', 'restricted_tianxianteng_but_dose_and_indication_present'],
    ['TCM-HC-011', 'cancelled_guanmutong_standard_but_dose_and_indication_present'],
    ['TCM-HC-012', 'restricted_madouling_but_dose_and_indication_present'],
    ['TCM-HC-013', 'unsupported_per_year_pediatric_deworming_dose'],
    ['TCM-HC-014', 'unsafe_home_induced_vomiting_instruction'],
    ['TCM-HC-015', 'arsenic_compound_dose_and_external_use_not_consumer_eligible'],
    ['TCM-HC-016', 'mercury_compound_oral_dose_not_consumer_eligible'],
    ['TCM-HC-017', 'toxic_heavy_metal_reverse_lookup_not_prescribing_authority'],
    ['TCM-HC-018', 'modern_efficacy_claim_requires_indication_specific_evidence'],
    ['TCM-HC-019', 'emergency_disease_reverse_lookup_must_not_delay_standard_care'],
    ['TCM-HC-020', 'full_reverse_index_not_validated_prescribing_authority'],
  ]);
  assert.ok(data.findings.every(finding => finding.comparatorSourceIds.length > 0));
  assert.ok(data.findings.every(finding => finding.productEligibility === 'blocked'));
  assert.ok(data.findings.every(finding => finding.runtimeEligibleFields.length === 0));
});

test('active runtime does not import the blocked herb catalog core or finding ids', async () => {
  const files = await tcmRuntimeConsumerPaths();
  const text = (await Promise.all(files.map(filePath => readFile(filePath, 'utf8')))).join('\n');
  assert.doesNotMatch(text, /tcm-herb-catalog-candidates/);
  assert.doesNotMatch(text, /TCM-HC-0(?:0[1-9]|1[0-9]|20)/);
});
