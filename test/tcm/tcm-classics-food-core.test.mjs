import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { sha256 } from '../../scripts/validation/lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from '../../scripts/validation/lib/tcm-runtime-consumer-files.mjs';

const CORE_PATH = 'database/tcm/normalized/tcm-classics-food-candidates.json';
const core = () => readFile(CORE_PATH, 'utf8').then(JSON.parse).catch(() => null);

test('pins the complete 42-48 source inventory and narrow priority views', async () => {
  const data = await core();
  assert.ok(data, 'classics and food core must be built');
  assert.deepEqual(data.counts, {
    references: 7,
    sourceNonEmptyLines: 1142,
    sourceMarkdownTables: 8,
    sourceMarkdownTableRows: 79,
    sections: 145,
    priorityLineCandidates: 603,
    findings: 20,
  });
  assert.deepEqual(data.priorityCategoryCounts, {
    foodTherapy: 85,
    diseaseFoodMapping: 76,
    dose: 161,
    toxicity: 150,
    contraindication: 343,
    emergency: 144,
    modernDisease: 64,
    vulnerablePopulation: 105,
    homeAction: 53,
    sourceGrade: 50,
  });
  for (const source of Object.values(data.sourceRefs)) {
    assert.equal(source.sha256, sha256(await readFile(source.path, 'utf8')));
  }
  assert.ok(data.priorityLines.every(item => item.foodEligibility === 'not_adjudicated'));
  assert.ok(data.priorityLines.every(item => item.productEligibility === 'blocked'));
});

test('records twenty food, dose, emergency, toxicity, and legacy-runtime findings', async () => {
  const data = await core();
  assert.ok(data, 'classics and food core must be built');
  assert.deepEqual(data.findings.map(item => [item.id, item.status]), [
    ['TCM-CF-001', 'classic_food_grade_not_product_authority'],
    ['TCM-CF-002', 'five_organ_food_mapping_not_modern_nutrition'],
    ['TCM-CF-003', 'author_grade_a_not_independent_safety_grade'],
    ['TCM-CF-004', 'warm_disease_grade_a_food_therapy_not_adjudicated'],
    ['TCM-CF-005', 'medicine_food_label_not_current_directory_adjudication'],
    ['TCM-CF-006', 'high_dose_yam_tea_disease_claim_blocked'],
    ['TCM-CF-007', 'cooked_yam_zero_effect_claim_unsupported'],
    ['TCM-CF-008', 'pediatric_diarrhea_first_formula_claim_blocked'],
    ['TCM-CF-009', 'goji_one_liang_bedtime_dose_not_food_guidance'],
    ['TCM-CF-010', 'pomegranate_three_month_lung_claim_blocked'],
    ['TCM-CF-011', 'eye_disease_dandelion_self_treatment_blocked'],
    ['TCM-CF-012', 'neck_mass_kelp_and_oyster_cure_claim_blocked'],
    ['TCM-CF-013', 'cholera_food_and_ice_rescue_blocked'],
    ['TCM-CF-014', 'arsenic_antidote_and_emesis_recipe_blocked'],
    ['TCM-CF-015', 'lead_formula_explicitly_prohibited'],
    ['TCM-CF-016', 'tuberculosis_food_or_herb_substitution_blocked'],
    ['TCM-CF-017', 'gastric_cancer_food_or_formula_substitution_blocked'],
    ['TCM-CF-018', 'pear_and_five_juice_disease_recipe_not_general_food_advice'],
    ['TCM-CF-019', 'legacy_wuxing_food_tables_unconsumed_but_unvalidated'],
    ['TCM-CF-020', 'bazi_health_food_inference_runtime_blocked'],
  ]);
  assert.ok(data.findings.every(item => item.productEligibility === 'blocked'));
});

test('runtime status distinguishes dead TCM food tables from blocked BaZi health data', async () => {
  const data = await core();
  assert.ok(data, 'classics and food core must be built');
  assert.equal(data.runtimeLegacy.tcmData.status, 'legacy_unconsumed');
  assert.equal(data.runtimeLegacy.baziHealth.status, 'runtime_blocked');
  const files = await tcmRuntimeConsumerPaths();
  const text = (await Promise.all(files.map(filePath => readFile(filePath, 'utf8')))).join('\n');
  assert.doesNotMatch(text, /tcm-classics-food-candidates/);
  assert.doesNotMatch(text, /TCM-CF-0(?:0[1-9]|1[0-9]|20)/);
});
