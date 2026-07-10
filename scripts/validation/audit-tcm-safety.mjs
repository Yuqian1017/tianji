import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SKILL_ROOT = path.join(ROOT, 'database/tcm/skill-v3');
const INSTALLED_SKILL_ROOT = '/Users/junshi/.codex/skills/中医';
const SAFETY_PATH = path.join(SKILL_ROOT, 'references/安全-配伍妊娠禁忌与毒性药.md');
const CORE_PATH = path.join(ROOT, 'database/tcm/normalized/tcm-safety-core.json');
const BASELINE_PATH = path.join(ROOT, 'database/tcm/legacy/runtime-consumption-baseline-9ff07ff.json');
const ARTIFACT_PATH = path.join(ROOT, 'docs/validation/artifacts/tcm-safety-audit-2026-07-10.json');

const checks = [];

function record(category, name, actual, expected) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({ category, name, passed, actual, expected });
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function parseMarkdownTable(section) {
  return section
    .split('\n')
    .filter(line => /^\|[^-|]/.test(line))
    .slice(1)
    .map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
}

const manifestText = await readFile(path.join(SKILL_ROOT, 'SHA256SUMS.txt'), 'utf8');
const manifestEntries = manifestText.trim().split('\n').map(line => {
  const match = line.match(/^([0-9a-f]{64})\s+\.\/(.+)$/);
  if (!match) throw new Error(`Invalid SHA256 manifest line: ${line}`);
  return { expectedSha256: match[1], relativePath: match[2] };
});
record('package', 'manifest_entry_count', manifestEntries.length, 98);

for (const entry of manifestEntries) {
  const repoContent = await readFile(path.join(SKILL_ROOT, entry.relativePath));
  record('package_integrity', entry.relativePath, sha256(repoContent), entry.expectedSha256);

  const installedContent = await readFile(path.join(INSTALLED_SKILL_ROOT, entry.relativePath));
  record('installed_parity', entry.relativePath, sha256(installedContent), entry.expectedSha256);
}

const referenceFiles = (await readdir(path.join(SKILL_ROOT, 'references')))
  .filter(name => name.endsWith('.md'));
const sourceTexts = (await readdir(path.join(SKILL_ROOT, 'sources')))
  .filter(name => name.endsWith('.txt'));
record('package', 'reference_file_count', referenceFiles.length, 50);
record('package', 'source_text_count', sourceTexts.length, 42);

const core = JSON.parse(await readFile(CORE_PATH, 'utf8'));
const baseline = JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
const safetyText = await readFile(SAFETY_PATH, 'utf8');

const legalSection = safetyText.split('## 四、法定毒性中药')[1].split('## 五、')[0];
const localLegalNames = legalSection
  .split('\n')
  .find(line => line.includes('、'))
  .split('、')
  .map(name => name.replace(/[。\s]/g, ''));
record('legal_toxic_list', 'local_skill_matches_normalized_list', localLegalNames, core.legalToxicMedicines.names);
record('legal_toxic_list', 'normalized_unique_count', new Set(core.legalToxicMedicines.names).size, 28);

const doseSection = safetyText.split('## 五、')[1].split('## 六、')[0];
const doseRows = parseMarkdownTable(doseSection);
record('dose_table', 'markdown_row_count', doseRows.length, core.skillDoseTable.markdownRowCount);
record('dose_table', 'all_rows_have_five_nonempty_fields', doseRows.every(row => row.length === 5 && row.every(Boolean)), true);
record('dose_table', 'unique_row_names', new Set(doseRows.map(row => row[0])).size, 100);
const namedSubstances = doseRows.reduce((count, row) => count + (row[0].includes('砒石/砒霜') ? 2 : 1), 0);
record('dose_table', 'named_substance_count', namedSubstances, core.skillDoseTable.namedSubstanceCount);
record('dose_table', 'runtime_eligibility_blocked', core.skillDoseTable.productEligibility, 'blocked');
record('dose_table', 'current_pharmacopoeia_not_validated', core.skillDoseTable.currentPharmacopoeiaValidation, 'not_validated');

record('legacy_runtime', 'constitution_question_count', baseline.constitution.questionCount, 34);
record('legacy_runtime', 'constitution_plan_count', baseline.constitution.planCount, 9);
record('legacy_runtime', 'constitution_herb_label_count', baseline.constitution.herbLabels.length, 28);
record('legacy_runtime', 'constitution_dose_item_count', baseline.constitution.doseItems.length, 22);
record('legacy_runtime', 'combined_unique_acupoints', new Set([
  ...baseline.constitution.acupoints,
  ...baseline.meridianClock.acupoints,
]).size, 30);

const activeRuntimePaths = [
  'src/modules/tizhi/data.js',
  'src/modules/tizhi/prompt.js',
  'src/modules/ziwu/data.js',
  'src/modules/ziwu/prompt.js',
  'src/modules/wuyun/data.js',
  'src/modules/wuyun/prompt.js',
  'src/modules/wangzhen/data.js',
  'src/modules/wangzhen/prompt.js',
];
const activeRuntimeText = (await Promise.all(
  activeRuntimePaths.map(relativePath => readFile(path.join(ROOT, relativePath), 'utf8')),
)).join('\n');
record('runtime_gate', 'concrete_gram_doses', [...activeRuntimeText.matchAll(/\d+(?:\.\d+)?\s*(?:g|克)\b/gi)].length, 0);

const categorySummary = {};
for (const check of checks) {
  categorySummary[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categorySummary[check.category].checks += 1;
  categorySummary[check.category][check.passed ? 'passed' : 'failed'] += 1;
}

const failures = checks.filter(check => !check.passed);
const staleMetadata = [
  safetyText.includes('待书末终审'),
  safetyText.includes('当前为骨架,尚未开始各论录入'),
].filter(Boolean).length;

const artifact = {
  audit: 'tcm-safety',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass_with_blocked_medical_layers' : 'fail',
  summary: {
    checks: checks.length,
    failures: failures.length,
    manifestEntries: manifestEntries.length,
    referenceFiles: referenceFiles.length,
    sourceTexts: sourceTexts.length,
    legalToxicMedicines: core.legalToxicMedicines.names.length,
    skillDoseRows: doseRows.length,
    skillNamedDoseSubstances: namedSubstances,
    retiredRuntimeDoseItems: baseline.constitution.doseItems.length,
    retiredUniqueAcupoints: 30,
  },
  categories: categorySummary,
  blockedLayers: [
    'All Skill doses pending medicine-by-medicine validation against the 2025 Pharmacopoeia',
    'Pregnancy, compatibility, aristolochic-acid, formula, and acupoint action layers pending authoritative review',
    'Historical constitution questionnaire and recommendations',
    'Meridian-clock clinical claims',
    'Five Movements and Six Qi health predictions',
    'Image-based medical inference',
  ],
  findings: [
    {
      id: 'TCM-META-001',
      severity: 'low',
      status: 'recorded',
      description: `The raw safety file contains ${staleMetadata} stale progress statements even though its table is populated. Raw package remains immutable; normalized status is authoritative for product eligibility.`,
    },
    {
      id: 'TCM-SRC-001',
      severity: 'high',
      status: 'blocked',
      description: 'The Skill explicitly says its dose data has not been calibrated to the current Pharmacopoeia. Integrity and textbook consistency cannot substitute for that validation.',
    },
    {
      id: 'TCM-LAW-001',
      severity: 'medium',
      status: 'recorded',
      description: 'Government publications disagree between 27 and 28 legal toxic-medicine labels; the normalized list keeps the complete 28-name version and records the omitted red lead preparation on the 27-name page.',
    },
  ],
  sourceRefs: core.sourceRefs,
  relevantSha256: {
    importedManifest: sha256(manifestText),
    normalizedCore: sha256(await readFile(CORE_PATH)),
    legacyRuntimeBaseline: sha256(await readFile(BASELINE_PATH)),
    rawSafetyReference: sha256(safetyText),
  },
  failures: failures.slice(0, 50),
};

await writeFile(ARTIFACT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({
  result: artifact.result,
  ...artifact.summary,
  categories: categorySummary,
}, null, 2));

if (failures.length > 0) process.exitCode = 1;
