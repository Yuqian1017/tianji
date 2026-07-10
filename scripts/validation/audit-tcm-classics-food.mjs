import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  classicsFoodSourceDomain,
  collectClassicsFoodPriorityLines,
  parseClassicsFoodSections,
} from './lib/tcm-classics-food.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from './lib/tcm-runtime-consumer-files.mjs';

const ROOT = process.cwd();
const CORE_PATH = 'database/tcm/normalized/tcm-classics-food-candidates.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-classics-food-audit-2026-07-10.json';
const EXPECTED_COUNTS = {
  references: 7, sourceNonEmptyLines: 1142, sourceMarkdownTables: 8,
  sourceMarkdownTableRows: 79, sections: 145, priorityLineCandidates: 603, findings: 20,
};
const EXPECTED_PRIORITY_COUNTS = {
  foodTherapy: 85, diseaseFoodMapping: 76, dose: 161, toxicity: 150,
  contraindication: 343, emergency: 144, modernDisease: 64,
  vulnerablePopulation: 105, homeAction: 53, sourceGrade: 50,
};
const EXPECTED_FINDINGS = [
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
];

const checks = [];
function record(category, name, actual, expected) {
  checks.push({ category, name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
}

const coreText = await readFile(CORE_PATH, 'utf8');
const core = JSON.parse(coreText);
const sourceTexts = Object.fromEntries(await Promise.all(Object.entries(core.sourceRefs).map(async ([sourceId, source]) => [
  sourceId, await readFile(path.join(ROOT, source.path), 'utf8'),
])));
const referenceIds = Object.keys(core.sourceRefs).filter(sourceId => sourceId.startsWith('ref'));
const evidence = JSON.parse(sourceTexts.evidence);
const evidenceIds = new Set(evidence.sources.map(source => source.id));
const runtimeConsumerPaths = await tcmRuntimeConsumerPaths(ROOT);
const runtimeTexts = Object.fromEntries(await Promise.all(runtimeConsumerPaths.map(async filePath => [
  filePath, await readFile(path.join(ROOT, filePath), 'utf8'),
])));
const runtimeText = Object.values(runtimeTexts).join('\n');

record('contract', 'schema_version', core.schemaVersion, 1);
record('contract', 'domain', core.domain, 'tcm_classics_food_candidates');
record('contract', 'status', core.status, 'full_remaining_reference_inventory_with_food_and_medical_boundaries_blocked');
record('contract', 'food_eligibility', core.foodEligibility, 'not_adjudicated');
record('contract', 'product_eligibility', core.productEligibility, 'blocked');
record('contract', 'runtime_fields', core.runtimeEligibleFields, []);
record('contract', 'counts', core.counts, EXPECTED_COUNTS);
record('contract', 'priority_counts', core.priorityCategoryCounts, EXPECTED_PRIORITY_COUNTS);

for (const [sourceId, source] of Object.entries(core.sourceRefs)) {
  record('source_integrity', `${sourceId}:sha256`, source.sha256, sha256(sourceTexts[sourceId]));
}

for (const sourceId of referenceIds) {
  const sourceLines = parseSourceLineInventory(sourceId, sourceTexts[sourceId]).map(line => ({
    ...line, sourceDomain: classicsFoodSourceDomain(sourceId), evidenceState: 'secondary_skill_summary_unverified',
  }));
  const sourceTables = parseMarkdownTableInventory(sourceId, sourceTexts[sourceId]);
  const sourceSections = parseClassicsFoodSections(sourceId, sourceTexts[sourceId]);
  const normalized = core.sourceInventory[sourceId];
  record('source_inventory', `${sourceId}:evidence_state`, normalized.evidenceState,
    'secondary_classic_or_physician_summary_without_page_level_primary_source');
  record('source_inventory', `${sourceId}:tables`, normalized.tables, sourceTables);
  for (const [index, sourceLine] of sourceLines.entries()) {
    const line = normalized.lines[index];
    record('line_preservation', `${sourceLine.id}:source_text`, line?.sourceText, sourceLine.sourceText);
    record('line_preservation', `${sourceLine.id}:source_domain`, line?.sourceDomain, sourceLine.sourceDomain);
    record('line_preservation', `${sourceLine.id}:evidence_state`, line?.evidenceState, sourceLine.evidenceState);
    record('safety_gate', `${sourceLine.id}:blocked`, line?.productEligibility, 'blocked');
    record('safety_gate', `${sourceLine.id}:runtime_fields`, line?.runtimeEligibleFields, []);
  }
  record('section_preservation', `${sourceId}:sections`,
    core.sections.filter(section => section.sourceId === sourceId), sourceSections);
}

const sourcePriorityLines = referenceIds.flatMap(sourceId => collectClassicsFoodPriorityLines(sourceId, sourceTexts[sourceId]));
for (const [index, source] of sourcePriorityLines.entries()) {
  const normalized = core.priorityLines[index];
  for (const field of [
    'sourceText', 'foodTherapyTerms', 'diseaseFoodMappingTerms', 'doseTerms', 'toxicityTerms',
    'contraindicationTerms', 'emergencyTerms', 'modernDiseaseTerms', 'vulnerablePopulationTerms',
    'homeActionTerms', 'sourceGradeTerms',
  ]) record('priority_preservation', `${source.id}:${field}`, normalized?.[field], source[field]);
  record('safety_gate', `${source.id}:food_eligibility`, normalized?.foodEligibility, 'not_adjudicated');
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

record('finding_summary', 'ids_statuses', core.findings.map(item => [item.id, item.status]), EXPECTED_FINDINGS);
for (const finding of core.findings) {
  const sourceLines = parseSourceLineInventory(finding.sourceId, sourceTexts[finding.sourceId]);
  record('finding_integrity', `${finding.id}:source_line`,
    sourceLines.find(line => line.sourceLine === finding.sourceLine)?.sourceText, finding.sourceText);
  record('finding_integrity', `${finding.id}:comparators`,
    finding.comparatorSourceIds.every(sourceId => evidenceIds.has(sourceId)), true);
  record('safety_gate', `${finding.id}:blocked`, finding.productEligibility, 'blocked');
  record('safety_gate', `${finding.id}:runtime_fields`, finding.runtimeEligibleFields, []);
}

const tcmDataImporters = Object.entries(runtimeTexts)
  .filter(([filePath, text]) => filePath !== core.runtimeLegacy.tcmData.path && /tcm-data(?:\.js)?/.test(text))
  .map(([filePath]) => filePath);
record('runtime_gate', 'tcm_data_status', core.runtimeLegacy.tcmData.status, 'legacy_unconsumed');
record('runtime_gate', 'tcm_data_importers', tcmDataImporters, []);
record('runtime_gate', 'bazi_health_status', core.runtimeLegacy.baziHealth.status, 'runtime_blocked');
record('runtime_gate', 'bazi_engine_blocked', sourceTexts.runtimeBaziEngine.includes("status: 'blocked'"), true);
record('runtime_gate', 'bazi_module_disabled', sourceTexts.runtimeBaziModule.includes('disabled'), true);
record('runtime_gate', 'blocked_core_imports', [...runtimeText.matchAll(/tcm-classics-food-candidates/g)].length, 0);
record('runtime_gate', 'finding_id_imports', [...runtimeText.matchAll(/TCM-CF-0(?:0[1-9]|1[0-9]|20)/g)].length, 0);

const categories = {};
for (const check of checks) {
  categories[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categories[check.category].checks += 1;
  categories[check.category][check.passed ? 'passed' : 'failed'] += 1;
}
const failures = checks.filter(check => !check.passed);
const artifact = {
  audit: 'tcm-classics-food-evidence-boundaries', generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass_with_all_candidates_blocked' : 'fail',
  summary: { checks: checks.length, failures: failures.length, runtimeConsumerFilesScanned: runtimeConsumerPaths.length, ...core.counts },
  categories, priorityCategoryCounts: core.priorityCategoryCounts, runtimeLegacy: core.runtimeLegacy,
  runtimeConsumerPaths, findings: core.findings, boundaries: core.boundaries, sourceRefs: core.sourceRefs,
  relevantSha256: { normalizedCore: sha256(coreText) }, failures: failures.slice(0, 100),
};
await mkdir(path.dirname(path.join(ROOT, ARTIFACT_PATH)), { recursive: true });
await writeFile(path.join(ROOT, ARTIFACT_PATH), `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ result: artifact.result, ...artifact.summary, categories }, null, 2));
if (failures.length > 0) process.exitCode = 1;
