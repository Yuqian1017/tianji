import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { sha256 } from '../../scripts/validation/lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from '../../scripts/validation/lib/tcm-runtime-consumer-files.mjs';

const CORE_PATH = 'database/tcm/normalized/tcm-formula-catalog-candidates.json';
const core = () => readFile(CORE_PATH, 'utf8').then(JSON.parse).catch(() => null);

test('pins the complete 24-30 source inventory and formula-definition boundaries', async () => {
  const data = await core();
  assert.ok(data, 'formula catalog core must be built');
  assert.deepEqual(data.counts, {
    references: 7,
    sourceNonEmptyLines: 820,
    sourceMarkdownTables: 8,
    sourceMarkdownTableRows: 171,
    sections: 81,
    formulaDefinitions: 186,
    textbookPrimaryFormulaDefinitions: 182,
    classicAnchorAdditions: 4,
    claimedTextbookPrimaryFormulas: 182,
    claimedAttachedFormulas: 182,
    priorityLineCandidates: 522,
    findings: 20,
  });
  assert.deepEqual(data.priorityCategoryCounts, {
    dose: 193,
    toxicity: 73,
    administration: 8,
    emergency: 43,
    modernUse: 10,
    vulnerablePopulation: 62,
    contraindication: 158,
    poisoningAction: 4,
    formulaDefinition: 186,
    decisionLookup: 151,
  });
  assert.deepEqual(data.definitionCountFindings.missingTextbookPrimaryBySource, {});
  assert.deepEqual(data.definitionCountFindings.parentheticalAttributionNames,
    ['九味羌活汤', '黄连解毒汤', '九仙散', '紫雪']);
  assert.deepEqual(data.definitionCountFindings.classicAnchorNames,
    ['清中汤', '黄连阿胶汤', '半夏秫米汤', '启膈散']);
  for (const source of Object.values(data.sourceRefs)) {
    assert.equal(source.sha256, sha256(await readFile(source.path, 'utf8')));
  }
  assert.ok(data.formulaDefinitions.every(item => item.productEligibility === 'blocked'));
  assert.ok(data.priorityLines.every(item => item.productEligibility === 'blocked'));
});

test('records twenty formula count, conversion, toxic, emergency and efficacy findings', async () => {
  const data = await core();
  assert.ok(data, 'formula catalog core must be built');
  assert.deepEqual(data.findings.map(item => [item.id, item.status]), [
    ['TCM-FC-001', 'four_primary_formulas_use_parenthetical_source_format'],
    ['TCM-FC-002', 'classic_anchor_additions_separate_from_claimed_textbook_primary_count'],
    ['TCM-FC-003', 'unsupported_blanket_original_to_modern_gram_conversion'],
    ['TCM-FC-004', 'historical_unit_conversion_not_modern_dose_authority'],
    ['TCM-FC-005', 'unsupported_same_nature_toxicity_resonance_rule'],
    ['TCM-FC-006', 'generic_route_and_schedule_instructions_not_product_eligible'],
    ['TCM-FC-007', 'scenario_first_choice_tables_not_prescribing_authority'],
    ['TCM-FC-008', 'same_name_qingzhong_formula_identity_conflict'],
    ['TCM-FC-009', 'same_name_huiyangjiuji_formula_version_conflict'],
    ['TCM-FC-010', 'cancelled_qingmuxiang_present_in_zixue_formula'],
    ['TCM-FC-011', 'cancelled_qingmuxiang_present_in_suhexiang_formula'],
    ['TCM-FC-012', 'heavy_metal_formula_doses_not_consumer_eligible'],
    ['TCM-FC-013', 'coma_nasogastric_instruction_not_consumer_eligible'],
    ['TCM-FC-014', 'stroke_and_closed_syndrome_formulas_must_not_delay_emergency_care'],
    ['TCM-FC-015', 'unsafe_home_emesis_and_overdose_rescue_instructions'],
    ['TCM-FC-016', 'high_toxicity_purgative_formula_not_self_treatment'],
    ['TCM-FC-017', 'pregnancy_formula_use_requires_formula_specific_clinical_authority'],
    ['TCM-FC-018', 'modern_hypertension_formula_claim_unvalidated'],
    ['TCM-FC-019', 'modern_cancer_and_tumor_formula_claim_unvalidated'],
    ['TCM-FC-020', 'emergency_bleeding_formula_not_first_aid_authority'],
  ]);
  assert.ok(data.findings.every(item => item.comparatorSourceIds.length > 0));
  assert.ok(data.findings.every(item => item.productEligibility === 'blocked'));
});

test('active runtime does not import the blocked formula catalog core or finding ids', async () => {
  const files = await tcmRuntimeConsumerPaths();
  const text = (await Promise.all(files.map(filePath => readFile(filePath, 'utf8')))).join('\n');
  assert.doesNotMatch(text, /tcm-formula-catalog-candidates/);
  assert.doesNotMatch(text, /TCM-FC-0(?:0[1-9]|1[0-9]|20)/);
});
