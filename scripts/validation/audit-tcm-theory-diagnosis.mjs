import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  collectTheoryDiagnosisPriorityLines,
  parseTheoryDiagnosisSections,
  theoryDiagnosisSourceDomain,
} from './lib/tcm-theory-diagnosis.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from './lib/tcm-runtime-consumer-files.mjs';

const ROOT = process.cwd();
const CORE_PATH = 'database/tcm/normalized/tcm-theory-diagnosis-candidates.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-theory-diagnosis-audit-2026-07-10.json';
const EXPECTED_COUNTS = {
  references: 14,
  sourceNonEmptyLines: 836,
  sourceMarkdownTables: 31,
  sourceMarkdownTableRows: 157,
  sections: 124,
  priorityLineCandidates: 127,
  findings: 14,
};
const EXPECTED_FINDINGS = [
  ['TCM-TD-001', 'framework_boundary', 'traditional_construct_not_biomedical_anatomy'],
  ['TCM-TD-002', 'unsupported_diagnostic', 'unsupported_standalone_tongue_organ_diagnosis'],
  ['TCM-TD-003', 'reliability_limit', 'diagnostic_framework_low_to_moderate_inter_rater_agreement'],
  ['TCM-TD-004', 'reliability_limit', 'pulse_diagnosis_reliability_requires_operational_definition'],
  ['TCM-TD-005', 'scope_mismatch', 'incomplete_constitution_taxonomy_not_ccmq_equivalent'],
  ['TCM-TD-006', 'unsupported_causal', 'unsupported_constitution_determines_disease_claim'],
  ['TCM-TD-007', 'unsupported_prevention', 'unsupported_banlangen_influenza_prevention'],
  ['TCM-TD-008', 'unsupported_treatment', 'unsupported_geography_based_drug_and_dose_rule'],
  ['TCM-TD-009', 'unsafe_treatment', 'unsafe_body_type_poison_tolerance_rule'],
  ['TCM-TD-010', 'unsupported_diagnostic', 'unsupported_pediatric_finger_vein_severity_diagnosis'],
  ['TCM-TD-011', 'unsupported_prognostic', 'unsupported_voice_breathing_disease_localization_and_prognosis'],
  ['TCM-TD-012', 'unsupported_diagnostic', 'unsupported_pulse_position_organ_diagnosis'],
  ['TCM-TD-013', 'unsupported_prediction', 'unsupported_fixed_stroke_prodrome_prediction'],
  ['TCM-TD-014', 'reliability_limit', 'traditional_pattern_tables_not_validated_clinical_answer_key'],
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
record('contract', 'domain', core.domain, 'tcm_theory_and_diagnosis_candidates');
record('contract', 'status', core.status, 'full_source_inventory_with_modern_evidence_boundaries_blocked');
record('contract', 'product_eligibility', core.productEligibility, 'blocked');
record('contract', 'runtime_fields', core.runtimeEligibleFields, []);
record('contract', 'counts', core.counts, EXPECTED_COUNTS);

for (const [sourceId, source] of Object.entries(core.sourceRefs)) {
  record('source_integrity', `${sourceId}:sha256`, source.sha256, sha256(sourceTexts[sourceId]));
}

for (const sourceId of referenceIds) {
  const sourceLines = parseSourceLineInventory(sourceId, sourceTexts[sourceId]).map(line => ({
    ...line,
    sourceDomain: theoryDiagnosisSourceDomain(sourceId),
    evidenceState: 'secondary_skill_summary_unverified',
  }));
  const sourceTables = parseMarkdownTableInventory(sourceId, sourceTexts[sourceId]);
  const sourceSections = parseTheoryDiagnosisSections(sourceId, sourceTexts[sourceId]);
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
  const normalizedSections = core.sections.filter(section => section.sourceId === sourceId);
  record('section_preservation', `${sourceId}:sections`, normalizedSections, sourceSections);
}

const sourcePriorityLines = referenceIds
  .flatMap(sourceId => collectTheoryDiagnosisPriorityLines(sourceId, sourceTexts[sourceId]));
for (const [index, source] of sourcePriorityLines.entries()) {
  const normalized = core.priorityLines[index];
  record('priority_preservation', `${source.id}:source_text`, normalized?.sourceText, source.sourceText);
  record('priority_preservation', `${source.id}:action_terms`, normalized?.actionTerms, source.actionTerms);
  record('priority_preservation', `${source.id}:diagnostic_terms`, normalized?.diagnosticTerms, source.diagnosticTerms);
  record('priority_preservation', `${source.id}:extrapolation_terms`, normalized?.extrapolationTerms, source.extrapolationTerms);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

record('finding_summary', 'ids_kinds_statuses', core.findings
  .map(finding => [finding.id, finding.kind, finding.status]), EXPECTED_FINDINGS);
for (const finding of core.findings) {
  record('finding_integrity', `${finding.id}:source_line`, core.sourceInventory[finding.sourceId].lines
    .find(line => line.sourceLine === finding.sourceLine)?.sourceText, finding.sourceText);
  record('finding_integrity', `${finding.id}:comparators`, finding.comparatorSourceIds
    .every(sourceId => evidenceIds.has(sourceId)), true);
  record('safety_gate', `${finding.id}:blocked`, finding.productEligibility, 'blocked');
  record('safety_gate', `${finding.id}:runtime_fields`, finding.runtimeEligibleFields, []);
}

record('runtime_gate', 'blocked_core_imports', [...runtimeText.matchAll(/tcm-theory-diagnosis-candidates/g)].length, 0);
record('runtime_gate', 'finding_id_imports', [...runtimeText.matchAll(/TCM-TD-0(?:0[1-9]|1[0-4])/g)].length, 0);

const categories = {};
for (const check of checks) {
  categories[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categories[check.category].checks += 1;
  categories[check.category][check.passed ? 'passed' : 'failed'] += 1;
}
const failures = checks.filter(check => !check.passed);
const artifact = {
  audit: 'tcm-theory-diagnosis-evidence-boundaries',
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
