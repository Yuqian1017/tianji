import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  collectHerbCatalogPriorityLines,
  herbCatalogSourceDomain,
  parseDiseaseHerbIndexEntries,
  parseHerbCatalogSections,
} from './lib/tcm-herb-catalog.mjs';
import {
  parseMarkdownTableInventory,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from './lib/tcm-runtime-consumer-files.mjs';

const ROOT = process.cwd();
const CORE_PATH = 'database/tcm/normalized/tcm-herb-catalog-candidates.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-herb-catalog-audit-2026-07-10.json';
const EXPECTED_COUNTS = {
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
};
const EXPECTED_PRIORITY_COUNTS = {
  dose: 472,
  toxicity: 125,
  heavyMetal: 42,
  modernEfficacy: 21,
  vulnerablePopulation: 150,
  homeAction: 6,
  externalAdministration: 49,
  reverseIndex: 100,
};
const EXPECTED_FINDINGS = [
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
record('contract', 'domain', core.domain, 'tcm_herb_catalog_candidates');
record('contract', 'status', core.status, 'full_source_inventory_with_high_risk_herb_boundaries_blocked');
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
    sourceDomain: herbCatalogSourceDomain(sourceId),
    evidenceState: 'secondary_skill_summary_unverified',
  }));
  const sourceTables = parseMarkdownTableInventory(sourceId, sourceTexts[sourceId]);
  const sourceSections = parseHerbCatalogSections(sourceId, sourceTexts[sourceId]);
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

const sourcePriorityLines = referenceIds.flatMap(sourceId => (
  collectHerbCatalogPriorityLines(sourceId, sourceTexts[sourceId])
));
for (const [index, source] of sourcePriorityLines.entries()) {
  const normalized = core.priorityLines[index];
  for (const field of [
    'sourceText', 'doseTerms', 'toxicityTerms', 'heavyMetalTerms', 'modernEfficacyTerms',
    'vulnerablePopulationTerms', 'homeActionTerms', 'reverseIndexTerms',
    'externalAdministrationTerms',
  ]) {
    record('priority_preservation', `${source.id}:${field}`, normalized?.[field], source[field]);
  }
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

const sourceIndexEntries = parseDiseaseHerbIndexEntries(sourceTexts.ref23);
record('index_integrity', 'entries', core.diseaseHerbIndex.entries, sourceIndexEntries);
record('index_integrity', 'claimed_count', core.diseaseHerbIndex.claimedCount, 103);
record('index_integrity', 'actual_count', core.diseaseHerbIndex.actualCount, 100);
record('index_integrity', 'missing_numbers', core.diseaseHerbIndex.numbering.missing, [52, 53, 54]);
record('index_integrity', 'duplicates', core.diseaseHerbIndex.numbering.duplicates, []);
record('index_integrity', 'source_order_inversions', core.diseaseHerbIndex.numbering.inversions, [
  { previous: 47, current: 36, sourceLine: 61 },
  { previous: 60, current: 55, sourceLine: 83 },
]);
for (const entry of core.diseaseHerbIndex.entries) {
  record('safety_gate', `${entry.id}:blocked`, entry.productEligibility, 'blocked');
  record('safety_gate', `${entry.id}:runtime_fields`, entry.runtimeEligibleFields, []);
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

record('runtime_gate', 'blocked_core_imports', [...runtimeText.matchAll(/tcm-herb-catalog-candidates/g)].length, 0);
record('runtime_gate', 'finding_id_imports', [...runtimeText.matchAll(/TCM-HC-0(?:0[1-9]|1[0-9]|20)/g)].length, 0);

const categories = {};
for (const check of checks) {
  categories[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categories[check.category].checks += 1;
  categories[check.category][check.passed ? 'passed' : 'failed'] += 1;
}
const failures = checks.filter(check => !check.passed);
const artifact = {
  audit: 'tcm-herb-catalog-evidence-boundaries',
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
