import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SHICHEN_HEALTH } from '../../src/modules/bazihealth/data.js';
import { ZIWU_LIUZHU, ZIWU_MODEL } from '../../src/modules/ziwu/data.js';
import { formatForAI, getCurrentShichen, getNextShichen } from '../../src/modules/ziwu/engine.js';

const ROOT = process.cwd();
const CORE_PATH = path.join(ROOT, 'database/ziwu/ziwu-basic-meridian-clock.json');
const SOURCE_PATH = path.join(ROOT, 'database/tcm/skill-v3/sources/针灸大成.txt');
const COMPENDIUM_PATH = path.join(ROOT, 'database/xuanxue/compendium-new/08-zhongyi/02-jingluo-ziwu.md');
const UI_PATH = path.join(ROOT, 'src/modules/ziwu/ZiwuModule.jsx');
const PROMPT_PATH = path.join(ROOT, 'src/modules/ziwu/prompt.js');
const ARTIFACT_PATH = path.join(ROOT, 'docs/validation/artifacts/ziwu-audit-2026-07-10.json');

const checks = [];

function record(category, name, actual, expected) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({ category, name, passed, actual, expected });
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

const coreText = await readFile(CORE_PATH, 'utf8');
const core = JSON.parse(coreText);
const source = await readFile(SOURCE_PATH, 'utf8');
const compendium = await readFile(COMPENDIUM_PATH, 'utf8');
const ui = await readFile(UI_PATH, 'utf8');
const prompt = await readFile(PROMPT_PATH, 'utf8');

record('contract', 'schema_version', core.schemaVersion, 1);
record('contract', 'status', core.status, 'source_pinned_full_finite_domain');
record('contract', 'local_civil_time', core.timeBasis.clock, 'local_civil_time');
record('contract', 'minute_precision', core.timeBasis.precision, 'minute');
record('contract', 'clinical_interpretation_blocked', core.productEligibility.clinicalInterpretation, 'blocked');
record('contract', 'acupuncture_guidance_blocked', core.productEligibility.acupunctureGuidance, 'blocked');

const sourceWitnesses = [
  ['寅肺', '每日寅时，手太阴肺经'],
  ['卯大肠', '卯时手阳明大肠经'],
  ['辰胃', '辰时足阳明胃经'],
  ['巳脾', '巳时足太阴脾经'],
  ['未小肠', '未时手太阳小肠经'],
  ['申膀胱', '申时足太阳膀胱经'],
  ['酉肾', '酉时足少阴肾经'],
  ['戌心包', '戌时手厥阴心包络经'],
  ['亥三焦', '亥时手少阳三焦经'],
  ['子胆', '子时足少阳胆经'],
  ['丑肝', '丑时足厥阴肝经'],
  ['循环', '周而复始'],
  ['心经正名', '手少阴心经'],
  ['午时心经正名', '九穴午时手少阴'],
  ['完整针法六十六穴', '六十六穴者，即子午流注井荥俞原经合也'],
];

for (const [name, witness] of sourceWitnesses) {
  record('source_witness', name, source.includes(witness), true);
}
record('source_adjudication', 'local_continuous_paragraph_contains_conflict', source.includes('午时手太阴心经'), true);
record('source_adjudication', 'canonical_uses_internally_consistent_name', core.entries[6].meridian, '手少阴心经');

record('runtime_contract', 'model', ZIWU_MODEL.model, 'twelve_period_meridian_correspondence');
record('runtime_contract', 'structure_status', ZIWU_MODEL.structureStatus, 'source_pinned_basic_meridian_clock');
record('runtime_contract', 'time_basis', ZIWU_MODEL.timeBasis, 'local_civil_clock_minute_precision');
record('runtime_contract', 'clinical_interpretation', ZIWU_MODEL.clinicalInterpretation, 'blocked_not_validated');
record('runtime_contract', 'unimplemented_layers', ZIWU_MODEL.unimplemented, core.scope.excluded.slice(0, 5));

record('finite_table', 'entry_count', ZIWU_LIUZHU.length, 12);
for (let index = 0; index < core.entries.length; index += 1) {
  for (const field of ['shichen', 'hours', 'hourStart', 'organ', 'meridian', 'wuxing']) {
    record('finite_table', `${index}_${field}`, ZIWU_LIUZHU[index]?.[field], core.entries[index][field]);
  }
  record('finite_table', `${index}_next`, getNextShichen(index), core.entries[(index + 1) % 12]);
}

for (let minuteOfDay = 0; minuteOfDay < 24 * 60; minuteOfDay += 1) {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const expectedIndex = Math.floor(((hour + 1) % 24) / 2);
  const expectedOffset = ((hour + 1) % 2) * 60 + minute;
  const expectedProgress = Math.round((expectedOffset / 120) * 100);
  const result = getCurrentShichen(new Date(2026, 0, 15, hour, minute));
  const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  record('full_day_minutes', `${label}_index`, result.index, expectedIndex);
  record('full_day_minutes', `${label}_entry`, result.entry, core.entries[expectedIndex]);
  record('full_day_minutes', `${label}_progress`, result.progress, expectedProgress);
}

const oldClaimPatterns = [
  ['meridian_dominance', /经当令/],
  ['detox', /排毒/],
  ['best_time', /最佳.{0,8}(时间|时段|服药|补肾|排便)/],
  ['sleep_harms_organs', /不睡.{0,8}(伤|不藏)/],
  ['symptom_diagnosis', /提示.{0,6}(肺|肝|胆|心|脾|肾).{0,4}(问题|疾病)/],
];
const activeTexts = {
  aiPayload: formatForAI(new Date(2026, 0, 15, 23, 0)),
  ui,
  prompt,
  adjacentBaziLookup: Object.values(SHICHEN_HEALTH).join('\n'),
};

for (const [textName, text] of Object.entries(activeTexts)) {
  for (const [patternName, pattern] of oldClaimPatterns) {
    record('runtime_safety', `${textName}_${patternName}`, pattern.test(text), false);
  }
}
record('runtime_safety', 'prompt_blocks_clinical_extension', prompt.includes('不得作疾病、症状或个人健康判断'), true);
record('runtime_safety', 'prompt_blocks_full_acupuncture_claim', prompt.includes('不得把这张基础对应表称为完整子午流注针法'), true);
record('raw_source_quarantine', 'compendium_contains_rejected_detox_claims', compendium.includes('最佳排毒时间'), true);
record('raw_source_quarantine', 'compendium_is_secondary_candidate', core.sources[1].role, 'secondary_raw_candidate_only');

const categorySummary = {};
for (const check of checks) {
  categorySummary[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categorySummary[check.category].checks += 1;
  categorySummary[check.category][check.passed ? 'passed' : 'failed'] += 1;
}

const failures = checks.filter(check => !check.passed);
const artifact = {
  audit: 'ziwu-basic-meridian-clock',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass_source_pinned_basic_correspondence' : 'fail',
  scope: core.scope,
  timeBasis: core.timeBasis,
  summary: {
    checks: checks.length,
    failures: failures.length,
    tableRows: core.entries.length,
    dayMinutes: 24 * 60,
  },
  categories: categorySummary,
  sourceAdjudications: core.sourceAdjudications,
  sourceRefs: core.sources,
  relevantSha256: {
    normalizedCore: sha256(coreText),
    zhenjiuDachengWitness: sha256(source),
    quarantinedCompendium: sha256(compendium),
  },
  failures: failures.slice(0, 100),
};

await mkdir(path.dirname(ARTIFACT_PATH), { recursive: true });
await writeFile(ARTIFACT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ result: artifact.result, ...artifact.summary, categories: categorySummary }, null, 2));

if (failures.length > 0) process.exitCode = 1;
