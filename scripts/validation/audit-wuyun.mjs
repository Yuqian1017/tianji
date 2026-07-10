import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  analyzeYear,
  getKeQi,
  getKeYun,
  getLiuQi,
  getWuYun,
  getYearGanZhi,
  getZhuYun,
} from '../../src/modules/wuyun/engine.js';

const ROOT = process.cwd();
const CORE_PATH = path.join(ROOT, 'database/wuyun/wuyun-basic-annual-core.json');
const ARTIFACT_PATH = path.join(ROOT, 'docs/validation/artifacts/wuyun-audit-2026-07-10.json');
const SUWEN_PATH = path.join(ROOT, 'database/tcm/skill-v3/sources/黄帝内经素问.txt');
const YIZONG_PATH = path.join(ROOT, 'database/tcm/skill-v3/sources/医宗金鉴.txt');
const TEXTBOOK_PATH = path.join(ROOT, 'database/tcm/skill-v3/sources/《中医基础理论》.txt');

const checks = [];

function record(category, name, actual, expected) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({ category, name, passed, actual, expected });
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

const coreText = await readFile(CORE_PATH, 'utf8');
const core = JSON.parse(coreText);
const suwen = await readFile(SUWEN_PATH, 'utf8');
const yizong = await readFile(YIZONG_PATH, 'utf8');
const textbook = await readFile(TEXTBOOK_PATH, 'utf8');

record('contract', 'schema_version', core.schemaVersion, 1);
record('contract', 'status', core.status, 'source_pinned_full_finite_domain');
record('contract', 'medical_interpretation_blocked', core.productEligibility.medicalInterpretation, 'blocked');
record('contract', 'climate_prediction_blocked', core.productEligibility.climatePrediction, 'blocked');

record('source_witness', 'suwen_stem_pair_rule', suwen.includes('甲己之岁，土运统之；乙庚之岁，金运统之；丙辛之岁，水运统之；丁壬之岁，木运统之；戊癸之岁，火运统之'), true);
record('source_witness', 'suwen_branch_pair_rule', suwen.includes('子午之岁，上见少阴；丑未之岁，上见太阴；寅申之岁，上见少阳；卯酉之岁，上见阳明；辰戌之岁，上见太阳；巳亥之岁，上见厥阴'), true);
record('source_witness', 'yizong_movement_boundaries', yizong.includes('春分十三日起，至芒种后九日，主二运也'), true);
record('source_witness', 'yizong_main_taishao_examples', yizong.includes('如逢戊年太征庚年太商之年，则主运初运，必是少角'), true);
record('source_witness', 'textbook_guest_movement_example', textbook.includes('逢甲年便以太宫阳土为初运；太生少，土生金，则少商为二运'), true);

const stems = Object.keys(core.centralMovements);
const branches = Object.keys(core.annualQi);
const elementOrder = core.mainMovements.elements;
const toneOrder = core.mainMovements.tones;
const qiOrder = core.guestQi.order;

for (const stem of stems) {
  const expectedCentral = core.centralMovements[stem];
  const central = getWuYun(stem);
  record('central_movement', `${stem}_element`, central.element, expectedCentral.element);
  record('central_movement', `${stem}_tone`, central.tone, expectedCentral.tone);
  record('central_movement', `${stem}_taishao`, central.excess ? '太' : '少', expectedCentral.taiShao);

  const main = getZhuYun(stem);
  const expectedMainTaiShao = Array.from(core.mainMovements.taiShaoByStem[stem]);
  for (let index = 0; index < 5; index += 1) {
    record('main_movement', `${stem}_${index}_element`, main[index].element, elementOrder[index]);
    record('main_movement', `${stem}_${index}_tone`, main[index].tone, toneOrder[index]);
    record('main_movement', `${stem}_${index}_taishao`, main[index].excess ? '太' : '少', expectedMainTaiShao[index]);
  }

  const startIndex = elementOrder.indexOf(expectedCentral.element);
  const guest = getKeYun(stem);
  for (let index = 0; index < 5; index += 1) {
    const expectedElement = elementOrder[(startIndex + index) % 5];
    const expectedTaiShao = index % 2 === 0 ? expectedCentral.taiShao : expectedCentral.taiShao === '太' ? '少' : '太';
    record('guest_movement', `${stem}_${index}_element`, guest[index].element, expectedElement);
    record('guest_movement', `${stem}_${index}_taishao`, guest[index].excess ? '太' : '少', expectedTaiShao);
  }
}

for (const branch of branches) {
  const expected = core.annualQi[branch];
  const annual = getLiuQi(branch);
  record('annual_qi', `${branch}_sitian`, annual.sitian, expected.sitian);
  record('annual_qi', `${branch}_zaiquan`, annual.zaiquan, expected.zaiquan);

  const sitianIndex = qiOrder.indexOf(expected.sitian);
  const guest = getKeQi(branch);
  for (let index = 0; index < 6; index += 1) {
    record('guest_qi', `${branch}_${index}`, guest[index].qi, qiOrder[mod(sitianIndex - 2 + index, 6)]);
  }
}

const anchor = core.annualPillar.anchorYear;
for (let offset = 0; offset < core.annualPillar.cycleLength; offset += 1) {
  const year = anchor + offset;
  const expectedStem = stems[offset % 10];
  const expectedBranch = branches[offset % 12];
  const expectedCentral = core.centralMovements[expectedStem];
  const expectedMainTaiShao = Array.from(core.mainMovements.taiShaoByStem[expectedStem]);
  const expectedGuestStart = elementOrder.indexOf(expectedCentral.element);
  const expectedSitian = core.annualQi[expectedBranch].sitian;
  const expectedGuestQiStart = mod(qiOrder.indexOf(expectedSitian) - 2, 6);
  const ganZhi = getYearGanZhi(year);
  const result = analyzeYear(year);

  record('sixty_year_cycle', `${year}_ganzhi`, ganZhi.ganzi, expectedStem + expectedBranch);
  record('sixty_year_cycle', `${year}_central_element`, result.wuYun.element, expectedCentral.element);
  record('sixty_year_cycle', `${year}_central_taishao`, result.wuYun.excess ? '太' : '少', expectedCentral.taiShao);
  record('sixty_year_cycle', `${year}_sitian`, result.liuQi.sitian, expectedSitian);
  record('sixty_year_cycle', `${year}_zaiquan`, result.liuQi.zaiquan, core.annualQi[expectedBranch].zaiquan);

  for (let index = 0; index < 5; index += 1) {
    const expectedGuestElement = elementOrder[(expectedGuestStart + index) % 5];
    const expectedGuestTaiShao = index % 2 === 0 ? expectedCentral.taiShao : expectedCentral.taiShao === '太' ? '少' : '太';
    record('sixty_year_cycle', `${year}_main_${index}_element`, result.yunTimeline[index].primary, elementOrder[index]);
    record('sixty_year_cycle', `${year}_main_${index}_taishao`, result.yunTimeline[index].primaryExcess ? '太' : '少', expectedMainTaiShao[index]);
    record('sixty_year_cycle', `${year}_main_${index}_time`, result.yunTimeline[index].time, core.mainMovements.dateLabels[index]);
    record('sixty_year_cycle', `${year}_guest_yun_${index}_element`, result.yunTimeline[index].guest, expectedGuestElement);
    record('sixty_year_cycle', `${year}_guest_yun_${index}_taishao`, result.yunTimeline[index].guestExcess ? '太' : '少', expectedGuestTaiShao);
  }

  for (let index = 0; index < 6; index += 1) {
    record('sixty_year_cycle', `${year}_main_qi_${index}`, result.qiTimeline[index].primary, core.mainQi.sequence[index]);
    record('sixty_year_cycle', `${year}_guest_qi_${index}`, result.qiTimeline[index].guest, qiOrder[(expectedGuestQiStart + index) % 6]);
    record('sixty_year_cycle', `${year}_qi_${index}_time`, result.qiTimeline[index].time, core.mainQi.dateLabels[index]);
  }

  record('sixty_year_cycle', `${year}_validation`, result.validation.deterministicCore, 'source_pinned_basic_annual_structure');
}

const categorySummary = {};
for (const check of checks) {
  categorySummary[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categorySummary[check.category].checks += 1;
  categorySummary[check.category][check.passed ? 'passed' : 'failed'] += 1;
}

const failures = checks.filter(check => !check.passed);
const artifact = {
  audit: 'wuyun-basic-annual-structure',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass_source_pinned_basic_structure' : 'fail',
  scope: core.scope,
  summary: {
    checks: checks.length,
    failures: failures.length,
    stems: stems.length,
    branches: branches.length,
    cycleYears: core.annualPillar.cycleLength,
  },
  categories: categorySummary,
  excludedLayers: core.scope.excluded,
  sourceRefs: core.sources,
  relevantSha256: {
    normalizedCore: sha256(coreText),
    suwenWitness: sha256(suwen),
    yizongJinjianWitness: sha256(yizong),
    textbookWitness: sha256(textbook),
  },
  failures: failures.slice(0, 100),
};

await mkdir(path.dirname(ARTIFACT_PATH), { recursive: true });
await writeFile(ARTIFACT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({
  result: artifact.result,
  ...artifact.summary,
  categories: categorySummary,
}, null, 2));

if (failures.length > 0) process.exitCode = 1;
