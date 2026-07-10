import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(await readFile(path.join(root, 'database/xiangshu/sources/xiangshu-source-manifest.json'), 'utf8'));
const core = JSON.parse(await readFile(path.join(root, 'database/xiangshu/normalized/xiangshu-classical-claims.json'), 'utf8'));
const adjudications = JSON.parse(await readFile(path.join(root, 'database/xiangshu/normalized/xiangshu-compendium-adjudications.json'), 'utf8'));
const rawInventory = JSON.parse(await readFile(path.join(root, 'database/xiangshu/normalized/xiangshu-raw-line-inventory.json'), 'utf8'));

const checks = [];
const check = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });

check('manifest-doctrine', manifest.doctrine === 'classical_source_first', manifest.doctrine);
check('core-doctrine', core.doctrine === 'classical_source_first', core.doctrine);
check('adjudication-doctrine', adjudications.doctrine === 'classical_source_first', adjudications.doctrine);
check('raw-inventory-doctrine', rawInventory.doctrine === 'classical_source_first', rawInventory.doctrine);
check('raw-inventory-count', rawInventory.records.length === 386, rawInventory.records.length);

const excerptIndex = new Map();
for (const source of manifest.sources) {
  check(`source-url:${source.id}`, source.url.startsWith('https://'), source.url);
  check(`source-attribution:${source.id}`, Boolean(source.attributionStatus), source.attributionStatus);
  check(`source-witness:${source.id}`, Boolean(source.witnessStatus), source.witnessStatus);
  for (const excerpt of source.excerpts) {
    check(`excerpt-unique:${excerpt.id}`, !excerptIndex.has(excerpt.id), source.id);
    check(`excerpt-locator:${excerpt.id}`, Boolean(excerpt.locator), excerpt.locator);
    check(`excerpt-text:${excerpt.id}`, excerpt.originalText.length >= 10, excerpt.originalText.length);
    excerptIndex.set(excerpt.id, { ...excerpt, sourceId: source.id });
  }
}

const claimIds = new Set();
for (const claim of core.claims) {
  check(`claim-unique:${claim.id}`, !claimIds.has(claim.id), claim.id);
  claimIds.add(claim.id);
  check(`claim-original:${claim.id}`, claim.originalText.length >= 4, claim.originalText);
  check(`claim-normalized:${claim.id}`, claim.normalizedClaim.length >= 8, claim.normalizedClaim);
  check(`claim-sources:${claim.id}`, claim.sourceRefIds.length > 0, claim.sourceRefIds);
  for (const sourceRefId of claim.sourceRefIds) {
    check(`claim-source-resolves:${claim.id}:${sourceRefId}`, excerptIndex.has(sourceRefId), sourceRefId);
  }
  if (claim.runtimeEligible) {
    check(
      `claim-runtime-policy:${claim.id}`,
      claim.runtimePolicy === 'cultural_learning_with_citation',
      claim.runtimePolicy,
    );
  }
}

for (const item of adjudications.items) {
  check(`adjudication-locator:${item.id}`, Boolean(item.rawLocator), item.rawLocator);
  check(`adjudication-reason:${item.id}`, item.reason.length >= 10, item.reason);
  if (item.runtimeEligible) {
    check(
      `adjudication-runtime-source:${item.id}`,
      item.canonicalClaimIds.length > 0 && item.canonicalClaimIds.every((id) => claimIds.has(id)),
      item.canonicalClaimIds,
    );
  } else {
    check(`adjudication-runtime-blocked:${item.id}`, item.runtimeEligible === false, item.status);
  }
}

const rawFiles = [
  ['database/xuanxue/compendium-new/10-xiangshu/01-mianxiang.md', '03a42815427be252bf091f0dfbaa3f3295a08e7f36add725671927a631fb3569'],
  ['database/xuanxue/compendium-new/10-xiangshu/02-shouxiang.md', '48158daf73299a27fd8efb7fb7c08acf4b2428705e6bb281420d4601b0deadf9'],
];
for (const [relativePath, expectedHash] of rawFiles) {
  const bytes = await readFile(path.join(root, relativePath));
  const actualHash = createHash('sha256').update(bytes).digest('hex');
  check(`raw-preserved:${relativePath}`, actualHash === expectedHash, actualHash);
}

const failures = checks.filter((item) => !item.pass);
const artifact = {
  audit: 'xiangshu-classical-source-contract',
  generatedAt: new Date().toISOString(),
  doctrine: manifest.doctrine,
  counts: {
    sources: manifest.sources.length,
    excerpts: excerptIndex.size,
    claims: core.claims.length,
    adjudications: adjudications.items.length,
    rawInventoryRecords: rawInventory.records.length,
    pendingRawSourceAdjudications: rawInventory.counts.pendingSourceAdjudication,
    checks: checks.length,
    failures: failures.length,
  },
  scope: {
    passed: 'Initial source-contract sample for high-impact face and palm claims.',
    excluded: 'Full line-by-line adjudication, scan-page collation, image-model robustness, and scientific truth of traditional claims.',
  },
  failures,
  checks,
};

const outputDir = path.join(root, 'docs/validation/artifacts');
await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, 'xiangshu-classical-source-audit-2026-07-10.json'),
  `${JSON.stringify(artifact, null, 2)}\n`,
);

console.log(JSON.stringify(artifact.counts));
if (failures.length > 0) process.exitCode = 1;
