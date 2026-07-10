import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  TRANSCRIBED_CURRENT_EXTRA_POINT_NAMES,
  collectExternalTreatmentClaims,
  mapLegacyAcupoints,
  parseDiseasePrescriptions,
  parseExtraPoints,
  parseMarkdownTableInventory,
  parseMeridianPoints,
  parseOperationSafetyClasses,
  parseSourceLineInventory,
} from '../../scripts/validation/lib/tcm-acupoint-external-safety.mjs';

const REFERENCE_ROOT = 'database/tcm/skill-v3/references';
const GENERAL_PATH = `${REFERENCE_ROOT}/38-针灸-经络与腧穴总论.md`;
const POINT_PATH = `${REFERENCE_ROOT}/39-针灸-十四经穴与奇穴.md`;
const OPERATION_PATH = `${REFERENCE_ROOT}/40-针灸-灸法按摩与外治法.md`;
const DISEASE_PATH = `${REFERENCE_ROOT}/41-针灸-常见病证取穴.md`;
const LEGACY_PATH = 'database/tcm/legacy/runtime-consumption-baseline-9ff07ff.json';

const [generalText, pointText, operationText, diseaseText, legacy] = await Promise.all([
  readFile(GENERAL_PATH, 'utf8'),
  readFile(POINT_PATH, 'utf8'),
  readFile(OPERATION_PATH, 'utf8'),
  readFile(DISEASE_PATH, 'utf8'),
  readFile(LEGACY_PATH, 'utf8').then(JSON.parse),
]);

test('parses the complete 361-row Skill meridian table and exposes the current 362-point gap', () => {
  const points = parseMeridianPoints(pointText);
  assert.equal(points.length, 361);
  assert.deepEqual(
    Object.fromEntries([...new Set(points.map(point => point.meridianCode))]
      .map(code => [code, points.filter(point => point.meridianCode === code).length])),
    { LU: 11, LI: 20, ST: 45, SP: 21, HT: 9, SI: 19, BL: 67, KI: 27, PC: 9, TE: 23, GB: 44, LR: 14, GV: 28, CV: 24 },
  );
  assert.equal(points.some(point => point.code === 'GV29' || point.canonicalName === '印堂'), false);
  assert.match(points.find(point => point.code === 'GB31').location, /腘横纹上7寸/);
  assert.ok(points.every(point => point.productEligibility === 'blocked'));
});

test('parses all 40 Skill extra-point rows and preserves secondary-transcription identity gaps', () => {
  const extras = parseExtraPoints(pointText);
  assert.equal(extras.length, 40);
  assert.equal(TRANSCRIBED_CURRENT_EXTRA_POINT_NAMES.length, 51);

  const currentMatches = extras.filter(point => point.transcribedCurrentName).map(point => point.transcribedCurrentName);
  assert.deepEqual(
    TRANSCRIBED_CURRENT_EXTRA_POINT_NAMES.filter(name => !currentMatches.includes(name)),
    ['当阳', '聚泉', '海泉', '颈百劳', '新设', '血压点', '提托', '接脊', '痞根', '腰宜', '中泉', '大骨空', '小骨空', '髋骨', '里内庭', '独阴', '气端'],
  );
  assert.deepEqual(
    extras.filter(point => point.identityStatus === 'not_in_secondary_51_name_transcription').map(point => point.canonicalName),
    ['上明', '夹承浆', '三角灸', '腰奇', '落枕穴', '环中'],
  );
  assert.equal(extras.find(point => point.canonicalName === '膝眼').identityStatus, 'mixed_extra_and_meridian_identity');
  assert.equal(extras.find(point => point.canonicalName === '落枕穴').duplicateLocationOf, '外劳宫');
  assert.ok(extras.every(point => point.productEligibility === 'blocked'));
});

test('parses the three Skill operation levels without treating them as validated safety grades', () => {
  const levels = parseOperationSafetyClasses(operationText);
  assert.deepEqual(levels.map(level => level.sourceLevel), ['A', 'A⁻', 'B']);
  assert.match(levels[0].sourceExamples, /按穴\/自我按摩/);
  assert.match(levels[1].sourceExamples, /艾条悬灸/);
  assert.match(levels[2].sourceExamples, /针刺.*绝对禁自行/);
  assert.ok(levels.every(level => level.productEligibility === 'blocked'));
  assert.ok(levels.every(level => level.runtimeEligibleFields.length === 0));
});

test('preserves all 27 disease prescriptions and their risky home-operation conversions', () => {
  const allPoints = [...parseMeridianPoints(pointText), ...parseExtraPoints(pointText)];
  const prescriptions = parseDiseasePrescriptions(diseaseText, allPoints);
  assert.equal(prescriptions.length, 27);
  assert.deepEqual(prescriptions.slice(0, 6).map(item => item.name), ['中风', '中暑', '痫证', '癫狂', '肠痈', '痢疾']);
  assert.ok(prescriptions.every(item => item.productEligibility === 'blocked'));

  const dysmenorrhea = prescriptions.find(item => item.name === '痛经');
  assert.match(dysmenorrhea.sourceText, /艾灸关元\/热熨小腹\(A 级\)/);
  assert.ok(dysmenorrhea.operationTerms.includes('艾灸'));

  const breech = prescriptions.find(item => item.name === '胎位不正');
  assert.match(breech.sourceText, /15~20 分钟,每日 1~2 次/);
  assert.ok(breech.pointNames.includes('至阴'));
});

test('maps all 30 retired runtime acupoints to reviewable source entities', () => {
  const mapping = mapLegacyAcupoints(
    legacy,
    parseMeridianPoints(pointText),
    parseExtraPoints(pointText),
  );
  assert.equal(mapping.uniqueNames.length, 30);
  assert.deepEqual(mapping.unresolved, []);
  assert.ok(mapping.items.every(item => item.productEligibility === 'blocked'));
});

test('collects operation and hazard source lines across the complete acupuncture reference slice', () => {
  const claims = collectExternalTreatmentClaims({ generalText, pointText, operationText, diseaseText });
  assert.ok(claims.length > 80);
  assert.ok(claims.some(claim => claim.sourceText.includes('按穴按摩=A 级')));
  assert.ok(claims.some(claim => claim.sourceText.includes('家庭把同名穴位转为')));
  assert.ok(claims.some(claim => claim.sourceText.includes('平卧头低位')));
  assert.ok(claims.some(claim => claim.sourceText.includes('胎位不正') && claim.sourceText.includes('15~20 分钟')));
  assert.ok(claims.every(claim => claim.productEligibility === 'blocked'));
  assert.ok(claims.every(claim => claim.runtimeEligibleFields.length === 0));
});

test('inventories every non-empty source line and every Markdown table row across references 38-41', () => {
  const sources = { general: generalText, points: pointText, operations: operationText, diseases: diseaseText };
  for (const [sourceId, sourceText] of Object.entries(sources)) {
    const lines = parseSourceLineInventory(sourceId, sourceText);
    assert.equal(lines.length, sourceText.split('\n').filter(line => line.trim()).length);
    assert.ok(lines.every(line => line.productEligibility === 'blocked'));
    assert.ok(lines.every(line => line.runtimeEligibleFields.length === 0));
  }

  const tables = parseMarkdownTableInventory('operations', operationText);
  assert.ok(tables.some(table => table.dataRows.some(row => row.cells[0] === '推法')));
  assert.ok(tables.some(table => table.dataRows.some(row => row.cells[1] === '**神门**')));
  assert.ok(tables.some(table => table.dataRows.some(row => row.cells[0].includes('A(零门槛'))));
  assert.ok(tables.flatMap(table => table.dataRows).every(row => row.productEligibility === 'blocked'));
});
