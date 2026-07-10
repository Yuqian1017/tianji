import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  collectExternalTreatmentClaims,
  mapLegacyAcupoints,
  parseDiseasePrescriptions,
  parseExtraPoints,
  parseMarkdownTableInventory,
  parseMeridianPoints,
  parseOperationSafetyClasses,
  parseSourceLineInventory,
} from './lib/tcm-acupoint-external-safety.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from './lib/tcm-runtime-consumer-files.mjs';

const ROOT = process.cwd();
const CORE_PATH = 'database/tcm/normalized/tcm-acupoint-external-safety-candidates.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-acupoint-external-safety-audit-2026-07-10.json';
const EXPECTED_COUNTS = {
  meridianSourceRows: 361,
  meridianOfficialCount: 362,
  meridianTranscriptionNameDifferences: 3,
  meridianTranscriptionCandidateMissing: 1,
  extraPointSourceRows: 40,
  extraPointOfficialCount: 51,
  extraPointTranscriptionMatches: 34,
  extraPointTranscriptionMissing: 17,
  extraPointNonTranscriptionRows: 6,
  extraPointMixedIdentityRows: 1,
  extraPointDuplicateLocationRows: 1,
  operationSourceLevels: 3,
  treatmentClaimRecords: 240,
  diseasePrescriptionRows: 27,
  legacyAcupoints: 30,
  sourceNonEmptyLines: 763,
  sourceMarkdownTables: 27,
  sourceMarkdownTableRows: 471,
};

const checks = [];
function record(category, name, actual, expected) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({ category, name, passed, actual, expected });
}

const coreText = await readFile(CORE_PATH, 'utf8');
const core = JSON.parse(coreText);
const sourceTexts = Object.fromEntries(await Promise.all(
  Object.entries(core.sourceRefs).map(async ([key, source]) => [
    key,
    await readFile(path.join(ROOT, source.path), 'utf8'),
  ]),
));
const legacy = JSON.parse(sourceTexts.legacy);
const standardCatalog = JSON.parse(sourceTexts.standardCatalog);
const runtimeConsumerPaths = await tcmRuntimeConsumerPaths(ROOT);
const runtimeTexts = await Promise.all(runtimeConsumerPaths.map(filePath => (
  readFile(path.join(ROOT, filePath), 'utf8')
)));

const sourceMeridianRows = parseMeridianPoints(sourceTexts.points);
const sourceExtraRows = parseExtraPoints(sourceTexts.points);
const sourceLevels = parseOperationSafetyClasses(sourceTexts.operations);
const sourceClaims = collectExternalTreatmentClaims({
  generalText: sourceTexts.general,
  pointText: sourceTexts.points,
  operationText: sourceTexts.operations,
  diseaseText: sourceTexts.diseases,
});
const sourceDiseases = parseDiseasePrescriptions(
  sourceTexts.diseases,
  [...sourceMeridianRows, ...sourceExtraRows],
);
const sourceLegacy = mapLegacyAcupoints(legacy, sourceMeridianRows, sourceExtraRows);
const transcribedByCode = new Map(standardCatalog.transcribedMeridianPoints.map(point => [point.code, point]));
const sourceInventories = Object.fromEntries(['general', 'points', 'operations', 'diseases'].map(sourceId => [sourceId, {
  lines: parseSourceLineInventory(sourceId, sourceTexts[sourceId]),
  tables: parseMarkdownTableInventory(sourceId, sourceTexts[sourceId]),
}]));

record('contract', 'schema_version', core.schemaVersion, 1);
record('contract', 'domain', core.domain, 'tcm_acupoint_external_treatment_safety_candidates');
record('contract', 'status', core.status, 'normalized_candidate_full_source_domain_blocked');
record('contract', 'product_eligibility', core.productEligibility, 'blocked');
record('contract', 'runtime_eligible_fields', core.runtimeEligibleFields, []);
record('contract', 'counts', core.counts, EXPECTED_COUNTS);

for (const [key, source] of Object.entries(core.sourceRefs)) {
  record('source_integrity', `${key}:sha256`, source.sha256, sha256(sourceTexts[key]));
}

for (const [index, source] of sourceMeridianRows.entries()) {
  const normalized = core.meridianPoints.sourceRows[index];
  record('meridian_preservation', `${source.code}:id`, normalized?.id, source.id);
  record('meridian_preservation', `${source.code}:code`, normalized?.code, source.code);
  record('meridian_preservation', `${source.code}:name`, normalized?.canonicalName, source.canonicalName);
  record('meridian_preservation', `${source.code}:location`, normalized?.location, source.location);
  record('meridian_preservation', `${source.code}:indications`, normalized?.indications, source.indications);
  record('meridian_preservation', `${source.code}:attention`, normalized?.attention, source.attention);
  record('secondary_transcription_comparison', `${source.code}:transcribed_name`, normalized?.transcribedCurrentName, transcribedByCode.get(source.code)?.name);
  record('safety_gate', `${source.code}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.code}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

record('official_scope', 'current_counts', [core.counts.meridianOfficialCount, core.counts.extraPointOfficialCount], [362, 51]);
record('official_scope', 'per_name_evidence_status', core.evidenceStatus.perNameCatalog, 'secondary_transcription_candidate_not_officially_reproducible_in_repo');
record('transcription_summary', 'missing_candidate_meridian', core.meridianPoints.transcriptionCandidateMissing.map(item => [item.code, item.name]), [['GV29', '印堂']]);
record('transcription_summary', 'name_differences', core.meridianPoints.transcriptionNameDifferences.map(item => [item.code, item.sourceName, item.transcribedCurrentName]), [
  ['BL45', '譩嘻', '譩譆'],
  ['TE11', '清冷渊', '清泠渊'],
  ['TE18', '瘛脉', '瘈脉'],
]);
record('catalog_summary', 'location_finding_codes', core.meridianPoints.locationFindings.map(item => item.code), ['GB31']);
record('catalog_summary', 'fengshi_source_distance', /腘横纹上7寸/.test(core.meridianPoints.locationFindings[0].sourceLocation), true);
record('catalog_summary', 'fengshi_current_distance', core.meridianPoints.locationFindings[0].currentStandardDistance, '腘横纹上9寸');

for (const [index, source] of sourceExtraRows.entries()) {
  const normalized = core.extraPoints.sourceRows[index];
  record('extra_preservation', `${source.id}:name`, normalized?.canonicalName, source.canonicalName);
  record('extra_preservation', `${source.id}:region`, normalized?.region, source.region);
  record('extra_preservation', `${source.id}:location`, normalized?.location, source.location);
  record('extra_preservation', `${source.id}:indications`, normalized?.indications, source.indications);
  record('extra_preservation', `${source.id}:attention`, normalized?.attention, source.attention);
  record('extra_preservation', `${source.id}:identity_status`, normalized?.identityStatus, source.identityStatus);
  record('extra_preservation', `${source.id}:transcribed_name`, normalized?.transcribedCurrentName, source.transcribedCurrentName);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

record('extra_summary', 'transcription_candidate_missing', core.extraPoints.transcriptionCandidateMissing, [
  '当阳', '聚泉', '海泉', '颈百劳', '新设', '血压点', '提托', '接脊', '痞根', '腰宜', '中泉', '大骨空', '小骨空', '髋骨', '里内庭', '独阴', '气端',
]);
record('extra_summary', 'non_transcription_rows', core.extraPoints.nonTranscriptionRows, ['上明', '夹承浆', '三角灸', '腰奇', '落枕穴', '环中']);
record('extra_summary', 'mixed_identity_rows', core.extraPoints.mixedIdentityRows, ['膝眼']);
record('extra_summary', 'duplicate_location_rows', core.extraPoints.duplicateLocationRows, [{ sourceName: '落枕穴', duplicateLocationOf: '外劳宫' }]);

for (const [index, source] of sourceLevels.entries()) {
  const normalized = core.externalTreatmentSafety.sourceLevels[index];
  record('operation_preservation', `${source.id}:level`, normalized?.sourceLevel, source.sourceLevel);
  record('operation_preservation', `${source.id}:definition`, normalized?.sourceDefinition, source.sourceDefinition);
  record('operation_preservation', `${source.id}:examples`, normalized?.sourceExamples, source.sourceExamples);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}

for (const [index, source] of sourceClaims.entries()) {
  const normalized = core.externalTreatmentSafety.claims[index];
  record('claim_preservation', `${source.id}:source`, normalized?.sourceText, source.sourceText);
  record('claim_preservation', `${source.id}:operations`, normalized?.operationTerms, source.operationTerms);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}
record('safety_summary', 'finding_ids', core.externalTreatmentSafety.findings.map(item => item.id), ['TCM-EXT-001', 'TCM-EXT-002', 'TCM-EXT-003', 'TCM-EXT-004', 'TCM-EXT-005']);
record('safety_summary', 'needle_boundary_status', core.externalTreatmentSafety.findings[4].status, 'professional_only_boundary_supported');

for (const [index, source] of sourceDiseases.entries()) {
  const normalized = core.diseasePrescriptions[index];
  record('disease_preservation', `${source.id}:name`, normalized?.name, source.name);
  record('disease_preservation', `${source.id}:source_text`, normalized?.sourceText, source.sourceText);
  record('disease_preservation', `${source.id}:points`, normalized?.pointNames, source.pointNames);
  record('disease_preservation', `${source.id}:operations`, normalized?.operationTerms, source.operationTerms);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}
record('disease_summary', 'breech_status', core.diseasePrescriptions.find(item => item.name === '胎位不正').safetyStatus, 'blocked_obstetric_intervention');

for (const [index, source] of sourceLegacy.items.entries()) {
  const normalized = core.legacyRuntime.items[index];
  record('legacy_mapping', `${source.id}:name`, normalized?.name, source.name);
  record('legacy_mapping', `${source.id}:point_id`, normalized?.pointId, source.pointId);
  record('safety_gate', `${source.id}:blocked`, normalized?.productEligibility, 'blocked');
  record('safety_gate', `${source.id}:runtime_fields`, normalized?.runtimeEligibleFields, []);
}
record('legacy_mapping', 'unresolved', core.legacyRuntime.unresolved, []);

for (const [sourceId, inventory] of Object.entries(sourceInventories)) {
  record('source_inventory', `${sourceId}:all_non_empty_lines`, core.sourceInventory[sourceId]?.lines, inventory.lines);
  record('source_inventory', `${sourceId}:all_markdown_tables`, core.sourceInventory[sourceId]?.tables, inventory.tables);
}

const runtimeText = runtimeTexts.join('\n');
record('runtime_gate', 'blocked_core_imports', [...runtimeText.matchAll(/tcm-acupoint-external-safety-candidates/g)].length, 0);
record('runtime_gate', 'finding_id_imports', [...runtimeText.matchAll(/TCM-EXT-00[1-5]/g)].length, 0);

const categories = {};
for (const check of checks) {
  categories[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categories[check.category].checks += 1;
  categories[check.category][check.passed ? 'passed' : 'failed'] += 1;
}
const failures = checks.filter(check => !check.passed);
const artifact = {
  audit: 'tcm-acupoint-external-treatment-safety-candidates',
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
  findings: [
    ...core.meridianPoints.transcriptionNameDifferences,
    ...core.meridianPoints.locationFindings,
    ...core.externalTreatmentSafety.findings,
  ],
  evidenceBoundary: core.boundaries,
  sourceRefs: core.sourceRefs,
  relevantSha256: {
    normalizedCore: sha256(coreText),
  },
  failures: failures.slice(0, 100),
};

await mkdir(path.dirname(path.join(ROOT, ARTIFACT_PATH)), { recursive: true });
await writeFile(path.join(ROOT, ARTIFACT_PATH), `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ result: artifact.result, ...artifact.summary, categories }, null, 2));
if (failures.length > 0) process.exitCode = 1;
