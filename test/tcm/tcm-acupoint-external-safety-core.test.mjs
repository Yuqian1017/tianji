import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { sha256 } from '../../scripts/validation/lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from '../../scripts/validation/lib/tcm-runtime-consumer-files.mjs';

const CORE_PATH = 'database/tcm/normalized/tcm-acupoint-external-safety-candidates.json';
const SOURCE_PATHS = {
  general: 'database/tcm/skill-v3/references/38-针灸-经络与腧穴总论.md',
  points: 'database/tcm/skill-v3/references/39-针灸-十四经穴与奇穴.md',
  operations: 'database/tcm/skill-v3/references/40-针灸-灸法按摩与外治法.md',
  diseases: 'database/tcm/skill-v3/references/41-针灸-常见病证取穴.md',
  legacy: 'database/tcm/legacy/runtime-consumption-baseline-9ff07ff.json',
  standardCatalog: 'database/tcm/sources/cn2021-acupoint-standard-catalog.json',
  externalSafety: 'database/tcm/sources/external-treatment-safety-evidence.json',
};

async function json(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

test('pins the full source slice and expected normalized counts', async () => {
  const core = await json(CORE_PATH);
  assert.equal(core.schemaVersion, 1);
  assert.equal(core.status, 'normalized_candidate_full_source_domain_blocked');
  assert.equal(core.productEligibility, 'blocked');
  assert.deepEqual(core.counts, {
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
  });

  for (const [key, filePath] of Object.entries(SOURCE_PATHS)) {
    assert.equal(core.sourceRefs[key].sha256, sha256(await readFile(filePath, 'utf8')));
  }
});

test('records official counts separately from secondary-transcription name differences', async () => {
  const core = await json(CORE_PATH);
  assert.equal(core.evidenceStatus.officialCurrentCounts, 'official_current_status_and_counts');
  assert.equal(core.evidenceStatus.perNameCatalog, 'secondary_transcription_candidate_not_officially_reproducible_in_repo');
  assert.deepEqual(core.meridianPoints.transcriptionCandidateMissing.map(point => [point.code, point.name]), [['GV29', '印堂']]);
  assert.deepEqual(
    core.meridianPoints.transcriptionNameDifferences.map(item => [item.code, item.sourceName, item.transcribedCurrentName]),
    [['BL45', '譩嘻', '譩譆'], ['TE11', '清冷渊', '清泠渊'], ['TE18', '瘛脉', '瘈脉']],
  );
  assert.deepEqual(core.meridianPoints.locationFindings.map(item => item.code), ['GB31']);
  assert.match(core.meridianPoints.locationFindings[0].sourceLocation, /腘横纹上7寸/);
  assert.equal(core.meridianPoints.locationFindings[0].currentStandardDistance, '腘横纹上9寸');
  assert.ok(core.meridianPoints.sourceRows.every(point => point.productEligibility === 'blocked'));
  assert.ok(core.meridianPoints.sourceRows.every(point => point.runtimeEligibleFields.length === 0));
});

test('keeps the 40-row extra-point source distinct from the secondary 51-name transcription', async () => {
  const core = await json(CORE_PATH);
  assert.deepEqual(
    core.extraPoints.transcriptionCandidateMissing,
    ['当阳', '聚泉', '海泉', '颈百劳', '新设', '血压点', '提托', '接脊', '痞根', '腰宜', '中泉', '大骨空', '小骨空', '髋骨', '里内庭', '独阴', '气端'],
  );
  assert.deepEqual(core.extraPoints.nonTranscriptionRows, ['上明', '夹承浆', '三角灸', '腰奇', '落枕穴', '环中']);
  assert.deepEqual(core.extraPoints.mixedIdentityRows, ['膝眼']);
  assert.deepEqual(core.extraPoints.duplicateLocationRows, [{ sourceName: '落枕穴', duplicateLocationOf: '外劳宫' }]);
  assert.ok(core.extraPoints.sourceRows.every(point => point.productEligibility === 'blocked'));
});

test('preserves every non-empty raw line and every Markdown table row in the candidate core', async () => {
  const core = await json(CORE_PATH);
  for (const [sourceId, filePath] of Object.entries(SOURCE_PATHS).filter(([key]) => ['general', 'points', 'operations', 'diseases'].includes(key))) {
    const rawLines = (await readFile(filePath, 'utf8')).split('\n').map(line => line.trim()).filter(Boolean);
    assert.deepEqual(core.sourceInventory[sourceId].lines.map(line => line.sourceText), rawLines);
    assert.ok(core.sourceInventory[sourceId].lines.every(line => line.productEligibility === 'blocked'));
  }
  const operationRows = core.sourceInventory.operations.tables.flatMap(table => table.dataRows);
  assert.ok(operationRows.some(row => row.cells[0] === '推法'));
  assert.ok(operationRows.some(row => row.cells[1] === '**神门**'));
  assert.ok(operationRows.every(row => row.productEligibility === 'blocked'));
});

test('blocks global home-treatment grades and every disease-specific operation claim', async () => {
  const core = await json(CORE_PATH);
  assert.deepEqual(
    core.externalTreatmentSafety.findings.map(finding => finding.id),
    ['TCM-EXT-001', 'TCM-EXT-002', 'TCM-EXT-003', 'TCM-EXT-004', 'TCM-EXT-005'],
  );
  assert.equal(core.externalTreatmentSafety.findings[4].status, 'professional_only_boundary_supported');
  assert.ok(core.externalTreatmentSafety.sourceLevels.every(level => level.productEligibility === 'blocked'));
  assert.ok(core.externalTreatmentSafety.claims.every(claim => claim.productEligibility === 'blocked'));
  assert.ok(core.externalTreatmentSafety.claims.every(claim => claim.runtimeEligibleFields.length === 0));
  assert.ok(core.diseasePrescriptions.every(item => item.productEligibility === 'blocked'));

  const breech = core.diseasePrescriptions.find(item => item.name === '胎位不正');
  assert.match(breech.sourceText, /每日 1~2 次/);
  assert.equal(breech.safetyStatus, 'blocked_obstetric_intervention');
});

test('maps all retired runtime points but does not restore any action', async () => {
  const core = await json(CORE_PATH);
  assert.equal(core.legacyRuntime.items.length, 30);
  assert.deepEqual(core.legacyRuntime.unresolved, []);
  assert.ok(core.legacyRuntime.items.every(item => item.pointId));
  assert.ok(core.legacyRuntime.items.every(item => item.productEligibility === 'blocked'));
});

test('the full runtime consumer inventory does not import the blocked candidate core', async () => {
  const files = await tcmRuntimeConsumerPaths();
  const text = (await Promise.all(files.map(filePath => readFile(filePath, 'utf8')))).join('\n');
  assert.doesNotMatch(text, /tcm-acupoint-external-safety-candidates/);
  assert.doesNotMatch(text, /TCM-EXT-00[1-5]/);
});
