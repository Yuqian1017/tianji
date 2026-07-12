import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CORE_PATH = 'database/tcm/normalized/tcm-classic-quote-provenance.json';
const ARTIFACT_PATH = 'docs/validation/artifacts/tcm-classic-quote-provenance-audit-2026-07-11.json';

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

const core = JSON.parse(await readFile(CORE_PATH, 'utf8'));
const checks = [];
const check = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });

check('doctrine', core.doctrine === 'classical_source_first', core.doctrine);
check('scope', core.scope === 'reference_42_suwen_explicit_quotes', core.scope);
check('record-count', core.records.length === core.counts.quotes, core.records.length);
check('unresolved-count', core.records.filter(item => item.matchType === 'unresolved').length === core.counts.unresolved, core.counts.unresolved);

for (const [sourceId, sourceRef] of Object.entries(core.sourceRefs)) {
  const sourceText = await readFile(sourceRef.path, 'utf8');
  check(`source-hash:${sourceId}`, sha256(sourceText) === sourceRef.sha256, sourceRef.path);
}

const ids = new Set();
for (const record of core.records) {
  check(`unique:${record.id}`, !ids.has(record.id), record.id);
  ids.add(record.id);
  check(`reference-line:${record.id}`, record.referenceLine > 0, record.referenceLine);
  check(`quote-text:${record.id}`, record.quoteText.length >= 4, record.quoteText.length);
  check(`blocked:${record.id}`, record.productEligibility === 'blocked' && record.runtimeEligibleFields.length === 0, record.productEligibility);
  if (record.matchType === 'unresolved') {
    check(`unresolved-contract:${record.id}`, record.sourceLines.length === 0 && record.reviewStatus === 'manual_adjudication_required', record.reviewStatus);
  } else {
    check(`located-contract:${record.id}`, record.sourceLines.length > 0 && record.reviewStatus === 'text_match_only_not_content_adjudication', record.sourceLines);
  }
}

const failures = checks.filter(item => !item.pass);
const artifact = {
  audit: 'tcm-classic-quote-provenance',
  generatedAt: new Date().toISOString(),
  scope: core.scope,
  counts: {
    ...core.counts,
    checks: checks.length,
    failures: failures.length,
  },
  boundaries: core.boundaries,
  failures,
  checks,
};

await mkdir('docs/validation/artifacts', { recursive: true });
await writeFile(ARTIFACT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify(artifact.counts));
if (failures.length > 0) process.exitCode = 1;
