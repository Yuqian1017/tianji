import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  collectDiseaseActionableLines,
  collectDiseaseRiskLines,
  parseDiseaseReference,
} from './lib/tcm-disease-red-flags.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from './lib/tcm-runtime-consumer-files.mjs';

const ROOT = process.cwd();
const CORE_PATH = 'database/tcm/normalized/tcm-disease-red-flag-candidates.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-disease-red-flags-audit-2026-07-10.json';
const EXPECTED_COUNTS = {
  diseaseSections: 52,
  sourceNonEmptyLines: 689,
  sourceMarkdownTables: 22,
  sourceMarkdownTableRows: 133,
  keywordRiskLineCandidates: 83,
  actionableLineCandidates: 308,
  conflictFindings: 9,
  supportedRedFlagFindings: 9,
  mixedBoundaryFindings: 2,
};
const EXPECTED_FINDINGS = [
  ['TCM-DIS-001', 'conflict', 'conflict_do_not_induce_vomiting'],
  ['TCM-DIS-002', 'conflict', 'conflict_emergency_retention_home_methods'],
  ['TCM-DIS-003', 'conflict', 'conflict_poisoning_home_antidote'],
  ['TCM-DIS-004', 'conflict', 'unsupported_universal_tcm_rescue_pill'],
  ['TCM-DIS-005', 'conflict', 'conflict_oral_intake_after_syncope'],
  ['TCM-DIS-006', 'conflict', 'unsupported_three_year_stroke_prediction'],
  ['TCM-DIS-007', 'supported_red_flag', 'supported_seizure_first_aid'],
  ['TCM-DIS-008', 'supported_red_flag', 'supported_stroke_emergency'],
  ['TCM-DIS-009', 'supported_red_flag', 'supported_heart_attack_emergency'],
  ['TCM-DIS-010', 'supported_red_flag', 'supported_acute_urinary_retention_emergency'],
  ['TCM-DIS-011', 'supported_red_flag', 'supported_gi_bleeding_emergency'],
  ['TCM-DIS-012', 'mixed_boundary', 'supported_professional_help_but_immediate_danger_escalation_missing'],
  ['TCM-DIS-013', 'supported_red_flag', 'supported_severe_asthma_escalation'],
  ['TCM-DIS-014', 'conflict', 'conflict_do_not_induce_vomiting'],
  ['TCM-DIS-015', 'supported_red_flag', 'supported_acute_abdomen_surgical_emergency'],
  ['TCM-DIS-016', 'supported_red_flag', 'supported_severe_acute_abdomen_emergency'],
  ['TCM-DIS-017', 'conflict', 'unsupported_emergency_gi_bleed_dose'],
  ['TCM-DIS-018', 'mixed_boundary', 'mixed_convulsion_first_aid_mouth_action_blocked'],
  ['TCM-DIS-019', 'conflict', 'unsupported_acute_abdomen_formula_substitution'],
  ['TCM-DIS-020', 'supported_red_flag', 'supported_urgent_cardiopulmonary_escalation'],
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
const runtimeConsumerPaths = await tcmRuntimeConsumerPaths(ROOT);
const runtimeText = (await Promise.all(runtimeConsumerPaths.map(filePath => (
  readFile(path.join(ROOT, filePath), 'utf8')
)))).join('\n');
const evidence = JSON.parse(sourceTexts.evidence);
const evidenceIds = new Set(evidence.sources.map(source => source.id));

record('contract', 'schema_version', core.schemaVersion, 1);
record('contract', 'domain', core.domain, 'tcm_disease_red_flag_and_home_action_candidates');
record('contract', 'status', core.status, 'normalized_candidate_full_source_inventory_blocked');
record('contract', 'product_eligibility', core.productEligibility, 'blocked');
record('contract', 'runtime_eligible_fields', core.runtimeEligibleFields, []);
record('contract', 'counts', core.counts, EXPECTED_COUNTS);

for (const [sourceId, source] of Object.entries(core.sourceRefs)) {
  record('source_integrity', `${sourceId}:sha256`, source.sha256, sha256(sourceTexts[sourceId]));
}

for (const [referenceIndex, sourceId] of referenceIds.entries()) {
  const sourceReference = parseDiseaseReference(sourceId, sourceTexts[sourceId]);
  const normalizedReference = core.references[referenceIndex];
  record('source_inventory', `${sourceId}:lines`, core.sourceInventory[sourceId].lines, parseSourceLineInventory(sourceId, sourceTexts[sourceId]));
  record('source_inventory', `${sourceId}:tables`, core.sourceInventory[sourceId].tables, parseMarkdownTableInventory(sourceId, sourceTexts[sourceId]));
  record('disease_preservation', `${sourceId}:section_count`, normalizedReference.sections.length, sourceReference.sections.length);
  for (const [sectionIndex, sourceSection] of sourceReference.sections.entries()) {
    const normalized = normalizedReference.sections[sectionIndex];
    record('disease_preservation', `${sourceSection.id}:name`, normalized?.name, sourceSection.name);
    record('disease_preservation', `${sourceSection.id}:source_text`, normalized?.sourceText, sourceSection.sourceText);
    record('safety_gate', `${sourceSection.id}:blocked`, normalized?.productEligibility, 'blocked');
    record('safety_gate', `${sourceSection.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
  }
}

const sourceRiskLines = referenceIds.flatMap(sourceId => collectDiseaseRiskLines(sourceId, sourceTexts[sourceId]));
for (const [index, source] of sourceRiskLines.entries()) {
  const normalized = core.keywordRiskLines[index];
  record('risk_preservation', `${source.id}:source_text`, normalized?.sourceText, source.sourceText);
  record('risk_preservation', `${source.id}:emergency_terms`, normalized?.emergencyTerms, source.emergencyTerms);
  record('risk_preservation', `${source.id}:action_terms`, normalized?.actionTerms, source.actionTerms);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

const sourceActionableLines = referenceIds
  .flatMap(sourceId => collectDiseaseActionableLines(sourceId, sourceTexts[sourceId]));
for (const [index, source] of sourceActionableLines.entries()) {
  const normalized = core.actionableLines[index];
  record('actionable_preservation', `${source.id}:source_text`, normalized?.sourceText, source.sourceText);
  record('actionable_preservation', `${source.id}:action_terms`, normalized?.actionTerms, source.actionTerms);
  record('actionable_preservation', `${source.id}:dose_expressions`, normalized?.doseExpressions, source.doseExpressions);
  record('actionable_preservation', `${source.id}:formula_expressions`, normalized?.formulaExpressions, source.formulaExpressions);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

record('finding_summary', 'ids_kinds_statuses', core.findings.map(finding => [finding.id, finding.kind, finding.status]), EXPECTED_FINDINGS);
for (const finding of core.findings) {
  record('finding_integrity', `${finding.id}:source_line`, core.sourceInventory[finding.sourceId].lines
    .find(line => line.sourceLine === finding.sourceLine)?.sourceText, finding.sourceText);
  record('finding_integrity', `${finding.id}:comparator_ids_exist`, finding.comparatorSourceIds.every(sourceId => evidenceIds.has(sourceId)), true);
  record('safety_gate', `${finding.id}:blocked`, finding.productEligibility, 'blocked');
  record('safety_gate', `${finding.id}:runtime_fields`, finding.runtimeEligibleFields, []);
}

record('runtime_gate', 'blocked_core_imports', [...runtimeText.matchAll(/tcm-disease-red-flag-candidates/g)].length, 0);
record('runtime_gate', 'finding_id_imports', [...runtimeText.matchAll(/TCM-DIS-0(?:0[1-9]|1[0-9]|20)/g)].length, 0);

const categories = {};
for (const check of checks) {
  categories[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categories[check.category].checks += 1;
  categories[check.category][check.passed ? 'passed' : 'failed'] += 1;
}
const failures = checks.filter(check => !check.passed);
const artifact = {
  audit: 'tcm-disease-red-flags-and-home-actions',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass_with_all_candidates_blocked' : 'fail',
  summary: {
    checks: checks.length,
    failures: failures.length,
    runtimeConsumerFilesScanned: runtimeConsumerPaths.length,
    ...core.counts,
  },
  categories,
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
