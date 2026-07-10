import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  FOOD_MEDICINE_DIRECTORY,
  SKILL_A_FOOD_SUBSTANCES,
  SKILL_EXPLICIT_FOOD_CLAIMS,
  adjudicateFoodMedicineName,
} from './lib/tcm-food-medicine-directory.mjs';
import { sha256 } from './lib/tcm-pharmacopoeia.mjs';
import { tcmRuntimeConsumerPaths } from './lib/tcm-runtime-consumer-files.mjs';

const SOURCE_PATH = 'database/tcm/sources/nhc-food-medicine-directory.json';
const CORE_PATH = 'database/tcm/normalized/tcm-food-medicine-adjudications.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-food-medicine-directory-audit-2026-07-10.json';
const checks = [];

function record(category, name, actual, expected) {
  checks.push({ category, name, actual, expected, passed: JSON.stringify(actual) === JSON.stringify(expected) });
}

const sourceText = await readFile(SOURCE_PATH, 'utf8');
const source = JSON.parse(sourceText);
const coreText = await readFile(CORE_PATH, 'utf8');
const core = JSON.parse(coreText);

record('directory', 'total', source.items.length, 106);
record('directory', 'library_total', source.items, FOOD_MEDICINE_DIRECTORY);
record('directory', 'batch_counts', source.counts.byBatch, {
  'nhc-2002-51': 87, 'nhc-2019-8': 6, 'nhc-2023-9': 9, 'nhc-2024-4': 4,
});
record('directory', 'unique_ids', new Set(source.items.map(item => item.id)).size, 106);
record('directory', 'unique_names', new Set(source.items.map(item => item.name)).size, 106);
record('directory', 'all_product_blocked', source.items.every(item => item.productEligibility === 'blocked_pending_use_specific_review'), true);
record('directory', 'all_runtime_fields_empty', source.items.every(item => item.runtimeEligibleFields.length === 0), true);

record('skill_a', 'source_names', core.skillAList.adjudications.map(item => item.sourceName), SKILL_A_FOOD_SUBSTANCES);
record('skill_a', 'recomputed', core.skillAList.adjudications, SKILL_A_FOOD_SUBSTANCES.map(adjudicateFoodMedicineName));
record('skill_a', 'matched', core.counts.skillAMatchedCurrentDirectory, 13);
record('skill_a', 'not_in_directory', core.counts.skillANotInCurrentDirectory, 2);

record('claims', 'ids', core.explicitClaims.map(claim => claim.id), SKILL_EXPLICIT_FOOD_CLAIMS.map(claim => claim.id));
for (const claim of core.explicitClaims) {
  const rawText = await readFile(claim.sourcePath, 'utf8');
  record('source_integrity', `${claim.id}:sha256`, claim.sourceSha256, sha256(rawText));
  record('source_integrity', `${claim.id}:line`, rawText.split('\n')[claim.sourceLine - 1]?.trim(), claim.sourceText);
  record('safety_gate', `${claim.id}:blocked`, claim.productEligibility, 'blocked');
  record('safety_gate', `${claim.id}:runtime_fields`, claim.runtimeEligibleFields, []);
}
record('claims', 'all_findings_blocked', core.findings.every(finding => finding.productEligibility === 'blocked'), true);

const runtimePaths = await tcmRuntimeConsumerPaths();
const runtimeText = (await Promise.all(runtimePaths.map(filePath => readFile(filePath, 'utf8')))).join('\n');
record('runtime', 'normalized_core_imports', [...runtimeText.matchAll(/tcm-food-medicine-adjudications/g)].length, 0);
record('runtime', 'directory_imports', [...runtimeText.matchAll(/nhc-food-medicine-directory/g)].length, 0);
record('runtime', 'finding_id_imports', [...runtimeText.matchAll(/TCM-FM-00[1-4]/g)].length, 0);

const categories = {};
for (const check of checks) {
  categories[check.category] ??= { checks: 0, passed: 0, failed: 0 };
  categories[check.category].checks += 1;
  categories[check.category][check.passed ? 'passed' : 'failed'] += 1;
}
const failures = checks.filter(check => !check.passed);
const artifact = {
  audit: 'tcm-food-medicine-directory-and-skill-claims',
  generatedAt: '2026-07-10',
  result: failures.length === 0 ? 'pass_with_all_product_uses_blocked' : 'fail',
  summary: {
    checks: checks.length,
    failures: failures.length,
    runtimeConsumerFilesScanned: runtimePaths.length,
    ...core.counts,
  },
  categories,
  sourceSha256: sha256(sourceText),
  coreSha256: sha256(coreText),
  findings: core.findings,
  boundaries: core.boundaries,
  runtimePaths,
  failures: failures.slice(0, 100),
};
await mkdir(path.dirname(ARTIFACT_PATH), { recursive: true });
await writeFile(ARTIFACT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ result: artifact.result, ...artifact.summary, categories }, null, 2));
if (failures.length > 0) process.exitCode = 1;
