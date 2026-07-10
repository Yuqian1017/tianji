import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  collectFormulaCatalogPriorityLines,
  formulaCatalogSourceDomain,
  parseFormulaCatalogSections,
  parseFormulaCountClaim,
  parseFormulaDefinitions,
  parseAttachedFormulaEntities,
} from './lib/tcm-formula-catalog.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from './lib/tcm-runtime-consumer-files.mjs';

const ROOT = process.cwd();
const CORE_PATH = 'database/tcm/normalized/tcm-formula-catalog-candidates.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-formula-catalog-audit-2026-07-10.json';
const EXPECTED_COUNTS = {
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
  explicitAttachedFormulaEntities: 180,
  priorityLineCandidates: 522,
  findings: 21,
};
const EXPECTED_PRIORITY_COUNTS = {
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
};
const EXPECTED_FINDINGS = [
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
  ['TCM-FC-021', 'attached_formula_count_claim_exceeds_explicit_entities'],
];

const checks = [];
function record(category, name, actual, expected) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({ category, name, passed, actual, expected });
}

const coreText = await readFile(CORE_PATH, 'utf8');
const core = JSON.parse(coreText);
const sourceTexts = Object.fromEntries(await Promise.all(Object.entries(core.sourceRefs).map(async ([sourceId, source]) => [
  sourceId,
  await readFile(path.join(ROOT, source.path), 'utf8'),
])));
const referenceIds = Object.keys(core.sourceRefs).filter(sourceId => sourceId.startsWith('ref'));
const evidence = JSON.parse(sourceTexts.evidence);
const evidenceIds = new Set(evidence.sources.map(source => source.id));
const runtimeConsumerPaths = await tcmRuntimeConsumerPaths(ROOT);
const runtimeText = (await Promise.all(runtimeConsumerPaths.map(filePath => (
  readFile(path.join(ROOT, filePath), 'utf8')
)))).join('\n');

record('contract', 'schema_version', core.schemaVersion, 1);
record('contract', 'domain', core.domain, 'tcm_formula_catalog_candidates');
record('contract', 'status', core.status, 'full_source_inventory_with_formula_identity_and_safety_boundaries_blocked');
record('contract', 'product_eligibility', core.productEligibility, 'blocked');
record('contract', 'runtime_fields', core.runtimeEligibleFields, []);
record('contract', 'counts', core.counts, EXPECTED_COUNTS);
record('contract', 'priority_category_counts', core.priorityCategoryCounts, EXPECTED_PRIORITY_COUNTS);

for (const [sourceId, source] of Object.entries(core.sourceRefs)) {
  record('source_integrity', `${sourceId}:sha256`, source.sha256, sha256(sourceTexts[sourceId]));
}

for (const sourceId of referenceIds) {
  const sourceLines = parseSourceLineInventory(sourceId, sourceTexts[sourceId]).map(line => ({
    ...line,
    sourceDomain: formulaCatalogSourceDomain(sourceId),
    evidenceState: 'secondary_skill_summary_unverified',
  }));
  const sourceTables = parseMarkdownTableInventory(sourceId, sourceTexts[sourceId]);
  const sourceSections = parseFormulaCatalogSections(sourceId, sourceTexts[sourceId]);
  const normalized = core.sourceInventory[sourceId];
  record('source_inventory', `${sourceId}:evidence_state`, normalized.evidenceState, 'secondary_skill_summary_without_page_level_primary_source');
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

const sourceDefinitions = referenceIds.flatMap(sourceId => parseFormulaDefinitions(sourceId, sourceTexts[sourceId]));
record('formula_integrity', 'definitions', core.formulaDefinitions, sourceDefinitions);
for (const definition of core.formulaDefinitions) {
  record('safety_gate', `${definition.id}:blocked`, definition.productEligibility, 'blocked');
  record('safety_gate', `${definition.id}:runtime_fields`, definition.runtimeEligibleFields, []);
}

const sourceAttachedFormulaEntities = referenceIds.flatMap(sourceId => (
  parseAttachedFormulaEntities(sourceId, sourceTexts[sourceId])
));
record('formula_integrity', 'attached_formula_entities', core.attachedFormulaEntities, sourceAttachedFormulaEntities);
record('formula_integrity', 'attached_actual_by_source', core.attachedFormulaCountFindings.actualBySource, {
  ref25: 43, ref26: 39, ref27: 27, ref28: 28, ref29: 30, ref30: 13,
});
record('formula_integrity', 'attached_gaps_by_source', core.attachedFormulaCountFindings.gapsBySource, { ref25: 2 });
for (const entity of core.attachedFormulaEntities) {
  record('safety_gate', `${entity.id}:blocked`, entity.productEligibility, 'blocked');
  record('safety_gate', `${entity.id}:runtime_fields`, entity.runtimeEligibleFields, []);
}

const sourceCountClaims = referenceIds.flatMap(sourceId => parseFormulaCountClaim(sourceId, sourceTexts[sourceId]) ?? []);
record('formula_integrity', 'count_claims', core.countClaims, sourceCountClaims);
for (const claim of core.countClaims) {
  record('safety_gate', `${claim.sourceId}:count_claim_blocked`, claim.productEligibility, 'blocked');
  record('safety_gate', `${claim.sourceId}:count_claim_runtime_fields`, claim.runtimeEligibleFields, []);
}
record('formula_integrity', 'actual_textbook_counts', core.definitionCountFindings.actualTextbookCounts, {
  ref25: 33, ref26: 33, ref27: 28, ref28: 33, ref29: 37, ref30: 18,
});
record('formula_integrity', 'missing_textbook_primary_by_source', core.definitionCountFindings.missingTextbookPrimaryBySource, {});
record('formula_integrity', 'classic_anchor_names', core.definitionCountFindings.classicAnchorNames,
  ['清中汤', '黄连阿胶汤', '半夏秫米汤', '启膈散']);
record('formula_integrity', 'parenthetical_attribution_names', core.definitionCountFindings.parentheticalAttributionNames,
  ['九味羌活汤', '黄连解毒汤', '九仙散', '紫雪']);

const sourcePriorityLines = referenceIds.flatMap(sourceId => (
  collectFormulaCatalogPriorityLines(sourceId, sourceTexts[sourceId])
));
for (const [index, source] of sourcePriorityLines.entries()) {
  const normalized = core.priorityLines[index];
  for (const field of [
    'sourceText', 'doseTerms', 'toxicityTerms', 'administrationTerms', 'emergencyTerms',
    'modernUseTerms', 'vulnerablePopulationTerms', 'contraindicationTerms', 'poisoningActionTerms',
    'formulaDefinitionTerms', 'decisionLookupTerms',
  ]) {
    record('priority_preservation', `${source.id}:${field}`, normalized?.[field], source[field]);
  }
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

record('finding_summary', 'ids_statuses', core.findings
  .map(finding => [finding.id, finding.status]), EXPECTED_FINDINGS);
for (const finding of core.findings) {
  record('finding_integrity', `${finding.id}:source_line`, core.sourceInventory[finding.sourceId].lines
    .find(line => line.sourceLine === finding.sourceLine)?.sourceText, finding.sourceText);
  record('finding_integrity', `${finding.id}:comparators`, finding.comparatorSourceIds
    .every(sourceId => evidenceIds.has(sourceId)), true);
  record('safety_gate', `${finding.id}:blocked`, finding.productEligibility, 'blocked');
  record('safety_gate', `${finding.id}:runtime_fields`, finding.runtimeEligibleFields, []);
}

record('runtime_gate', 'blocked_core_imports', [...runtimeText.matchAll(/tcm-formula-catalog-candidates/g)].length, 0);
record('runtime_gate', 'finding_id_imports', [...runtimeText.matchAll(/TCM-FC-0(?:0[1-9]|1[0-9]|2[01])/g)].length, 0);

const categories = {};
for (const check of checks) {
  categories[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categories[check.category].checks += 1;
  categories[check.category][check.passed ? 'passed' : 'failed'] += 1;
}
const failures = checks.filter(check => !check.passed);
const artifact = {
  audit: 'tcm-formula-catalog-evidence-boundaries',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass_with_all_candidates_blocked' : 'fail',
  summary: {
    checks: checks.length,
    failures: failures.length,
    runtimeConsumerFilesScanned: runtimeConsumerPaths.length,
    ...core.counts,
  },
  categories,
  priorityCategoryCounts: core.priorityCategoryCounts,
  runtimeConsumerPaths,
  findings: core.findings,
  boundaries: core.boundaries,
  sourceRefs: core.sourceRefs,
  relevantSha256: { normalizedCore: sha256(coreText) },
  failures: failures.slice(0, 100),
};

await mkdir(path.dirname(path.join(ROOT, ARTIFACT_PATH)), { recursive: true });
await writeFile(path.join(ROOT, ARTIFACT_PATH), `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ result: artifact.result, ...artifact.summary, categories }, null, 2));
if (failures.length > 0) process.exitCode = 1;
