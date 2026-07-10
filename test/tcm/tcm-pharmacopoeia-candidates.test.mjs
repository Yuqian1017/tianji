import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import {
  parseDoseRows,
  sha256,
} from '../../scripts/validation/lib/tcm-pharmacopoeia.mjs';

const CORE_PATH = 'database/tcm/normalized/tcm-pharmacopoeia-candidates.json';
const SAFETY_PATH = 'database/tcm/skill-v3/references/安全-配伍妊娠禁忌与毒性药.md';
const CHP2020_PATH = 'database/tcm/sources/chp2020-tcm-safety-selected.json';
const CHP2025_PATH = 'database/tcm/sources/chp2025-part1-candidate-index.json';

const EMERGENCY_ROWS = [
  '川乌', '附子', '丁公藤', '使君子', '马钱子', '半夏',
  '天南星', '洋金花', '华山参', '瓜蒂', '胆矾',
];

const HISTORICAL_QUANTITY_CONFLICTS = [
  '苍耳子', '三颗针', '北豆根', '半边莲', '白薇', '甘遂', '芫花', '商陆',
  '牵牛子', '吴茱萸', '天山雪莲', '川楝子', '使君子', '苦楝皮', '鹤虱',
  '艾叶', '益母草', '水蛭', '半夏', '白附子', '苦杏仁', '洋金花', '赭石',
  '蒺藜', '罗布麻叶', '仙茅', '蛤蚧', '白扁豆', '补骨脂', '人参', '甘草',
  '肉豆蔻', '赤石脂', '禹余粮', '常山', '蛇床子', '木鳖子', '大蒜',
];

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function flattenSubstances(core) {
  return core.rows.flatMap(row => row.substances);
}

async function sourceFilesUnder(relativeDirectory) {
  const entries = await readdir(relativeDirectory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await sourceFilesUnder(relativePath));
    } else if (/\.(?:js|jsx)$/.test(entry.name)) {
      files.push(relativePath);
    }
  }
  return files;
}

test('preserves all 100 source rows and 101 named substances with current source hashes', async () => {
  const [core, safetyText, chp2020Text, chp2025Text] = await Promise.all([
    readJson(CORE_PATH),
    readFile(SAFETY_PATH, 'utf8'),
    readFile(CHP2020_PATH, 'utf8'),
    readFile(CHP2025_PATH, 'utf8'),
  ]);
  const parsedRows = parseDoseRows(safetyText);
  const substances = flattenSubstances(core);

  assert.equal(core.schemaVersion, 1);
  assert.equal(core.status, 'normalized_candidate_full_skill_dose_domain_blocked');
  assert.equal(core.rows.length, 100);
  assert.equal(substances.length, 101);
  assert.equal(new Set(core.rows.map(row => row.id)).size, 100);
  assert.equal(new Set(substances.map(item => item.id)).size, 101);

  for (const [index, parsed] of parsedRows.entries()) {
    const normalized = core.rows[index];
    assert.equal(normalized.id, parsed.id);
    assert.equal(normalized.sourceName, parsed.sourceName);
    assert.equal(normalized.baseName, parsed.baseName);
    assert.equal(normalized.sourceLocator, parsed.sourceLocator);
    assert.deepEqual(normalized.sourceRaw, parsed.raw);
  }

  assert.equal(core.sourceRefs.skillSafetyReference.sha256, sha256(safetyText));
  assert.equal(core.sourceRefs.chp2020Digital.sha256, sha256(chp2020Text));
  assert.equal(core.sourceRefs.chp2025Catalog.sha256, sha256(chp2025Text));
});

test('keeps every dose candidate blocked and exposes no runtime-eligible field', async () => {
  const core = await readJson(CORE_PATH);
  const substances = flattenSubstances(core);

  assert.ok(core.rows.every(row => row.productEligibility === 'blocked'));
  assert.ok(core.rows.every(row => (
    row.emergencyInstructionEligibility === 'blocked_do_not_surface_as_home_treatment'
  )));
  assert.ok(substances.every(item => item.productEligibility === 'blocked'));
  assert.ok(substances.every(item => item.runtimeEligibleFields.length === 0));
  assert.ok(substances.every(item => (
    item.currentPharmacopoeiaDoseValidation
      === 'blocked_2025_monograph_text_not_available_in_project'
  )));
});

test('records the full 2025 identity domain and the 2020 historical quantity comparison', async () => {
  const core = await readJson(CORE_PATH);
  const substances = flattenSubstances(core);
  const conflicts = substances
    .filter(item => item.validationStatus === 'conflicts_with_official_2020_dose_quantities')
    .map(item => item.name);

  assert.deepEqual(core.counts, {
    sourceRows: 100,
    namedSubstances: 101,
    current2025CatalogTitles: 79,
    current2025MissingOrUnresolved: 22,
    ambiguousCurrentNames: 1,
    official2020Monographs: 79,
    official2020QuantityConcordant: 41,
    official2020QuantityConflicts: 38,
    emergencyInstructionRows: 11,
  });
  assert.deepEqual(conflicts, HISTORICAL_QUANTITY_CONFLICTS);
  assert.equal(substances.filter(item => item.current2025.titleIn2025Catalog).length, 79);
  assert.equal(substances.filter(item => item.official2020.found).length, 79);
});

test('retains the known identity adjudications without unsafe alias widening', async () => {
  const core = await readJson(CORE_PATH);
  const substances = flattenSubstances(core);
  const bySourceName = new Map(substances.map(item => [item.sourceSubstanceName, item]));

  const sankezhen = bySourceName.get('三棵针');
  assert.equal(sankezhen.name, '三颗针');
  assert.equal(sankezhen.current2025.identityStatus, 'mapped_current_monograph');
  assert.equal(sankezhen.current2025.titleIn2025Catalog, true);

  const guanzhong = bySourceName.get('贯众');
  assert.equal(guanzhong.validationStatus, 'identity_ambiguous');
  assert.deepEqual(guanzhong.current2025.alternativesInCatalog, ['绵马贯众', '紫萁贯众']);

  const guangcigu = bySourceName.get('光慈菇');
  assert.equal(guangcigu.name, '光慈菇');
  assert.equal(guangcigu.current2025.titleIn2025Catalog, false);
  assert.deepEqual(guangcigu.current2025.alternativesInCatalog, ['山慈菇']);

  for (const name of ['关木通', '青木香', '天仙藤', '马兜铃']) {
    assert.equal(bySourceName.get(name).current2025.titleIn2025Catalog, false);
    assert.equal(bySourceName.get(name).productEligibility, 'blocked');
  }

  const fuzi = bySourceName.get('附子');
  assert.equal(fuzi.current2025.titleIn2025Catalog, true);
  assert.equal(fuzi.official2020.dose, '3～15g，先煎，久煎。');
  assert.match(fuzi.official2020.attention, /孕妇慎用/);
});

test('blocks all detected emergency-treatment rows and records the compatibility name error', async () => {
  const core = await readJson(CORE_PATH);
  const emergencyRows = core.rows
    .filter(row => row.containsEmergencyTreatmentInstruction)
    .map(row => row.baseName);

  assert.deepEqual(emergencyRows, EMERGENCY_ROWS);
  assert.ok(core.rows
    .filter(row => row.containsEmergencyTreatmentInstruction)
    .every(row => row.emergencyInstructionEligibility === 'blocked_do_not_surface_as_home_treatment'));
  assert.deepEqual(core.compatibilityFindings, [{
    id: 'TCM-COMPAT-NAME-001',
    severity: 'high',
    status: 'source_error_confirmed',
    observation: 'Skill 主表把“沙参(苦参)”写成同一项，混淆两个不同药名。',
    normalizedDecision: ['沙参', '苦参'],
    productEligibility: 'blocked',
  }]);
});

test('active TCM runtime modules contain neither concrete gram doses nor home antidote instructions', async () => {
  const files = [
    'src/App.jsx',
    'src/lib/tcm-data.js',
    ...(await Promise.all([
      'src/modules/bazihealth',
      'src/modules/tizhi',
      'src/modules/ziwu',
      'src/modules/wuyun',
      'src/modules/wangzhen',
    ].map(sourceFilesUnder))).flat(),
  ];
  const text = (await Promise.all(files.map(filePath => readFile(filePath, 'utf8')))).join('\n');

  assert.equal(files.length, 22);
  assert.doesNotMatch(text, /\d+(?:\.\d+)?\s*(?:g\b|克)/i);
  assert.doesNotMatch(text, /催吐|洗胃|阿托品|利多卡因|活性炭|高锰酸钾|甘草煎|姜汁|稀醋|蛋清/);
});
