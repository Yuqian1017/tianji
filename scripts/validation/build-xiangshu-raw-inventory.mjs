import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const files = [
  { domain: 'face', path: 'database/xuanxue/compendium-new/10-xiangshu/01-mianxiang.md' },
  { domain: 'palm', path: 'database/xuanxue/compendium-new/10-xiangshu/02-shouxiang.md' },
];
const claims = JSON.parse(await readFile(path.join(root, 'database/xiangshu/normalized/xiangshu-classical-claims.json'), 'utf8'));
const adjudications = JSON.parse(await readFile(path.join(root, 'database/xiangshu/normalized/xiangshu-compendium-adjudications.json'), 'utf8'));
const claimIndex = new Map(claims.claims.map((claim) => [claim.id, claim]));

function classifyLine(text, insideFence) {
  if (text.startsWith('```')) return 'code_fence';
  if (insideFence) return 'code';
  if (/^#{1,6}\s/.test(text)) return 'heading';
  if (text.startsWith('>')) return 'blockquote';
  if (/^\|(?:\s*:?-+:?\s*\|)+$/.test(text)) return 'table_separator';
  if (text.startsWith('|')) return 'table_row';
  if (/^-{3,}$/.test(text)) return 'section_separator';
  if (/^(?:[-*]|\d+\.)\s/.test(text)) return 'list_item';
  if (/^\*.*\*$/.test(text)) return 'epigraph';
  return 'prose';
}

const sourceFiles = [];
const records = [];
for (const source of files) {
  const bytes = await readFile(path.join(root, source.path));
  const text = bytes.toString('utf8');
  const lines = text.split('\n');
  let insideFence = false;

  sourceFiles.push({
    ...source,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    totalLines: lines.at(-1) === '' ? lines.length - 1 : lines.length,
    nonEmptyLines: lines.filter((line) => line.trim()).length,
  });

  lines.forEach((line, index) => {
    const rawText = line.trim();
    if (!rawText) return;
    const lineKind = classifyLine(rawText, insideFence);
    const lineNumber = index + 1;
    records.push({
      id: `xiangshu.raw.${source.domain}.L${String(lineNumber).padStart(4, '0')}`,
      domain: source.domain,
      sourceFile: source.path,
      lineNumber,
      lineKind,
      rawText,
      preservationStatus: 'raw_preserved',
      adjudicationStatus: ['heading', 'code_fence', 'section_separator', 'table_separator'].includes(lineKind)
        ? 'structural_not_a_claim'
        : 'source_not_yet_located',
      adjudicationIds: [],
      canonicalClaimIds: [],
      sourceRefIds: [],
      runtimeEligible: false,
    });
    if (lineKind === 'code_fence') insideFence = !insideFence;
  });
}

for (const item of adjudications.items) {
  const match = item.rawLocator.match(/^(.*?):(\d+)(?:-(\d+))?$/);
  if (!match) throw new Error(`Invalid raw locator: ${item.rawLocator}`);
  const [, fileSuffix, startText, endText] = match;
  const start = Number(startText);
  const end = Number(endText || startText);
  const sourceRefIds = item.canonicalClaimIds.flatMap((claimId) => {
    const claim = claimIndex.get(claimId);
    if (!claim) throw new Error(`Unknown canonical claim: ${claimId}`);
    return claim.sourceRefIds;
  });

  for (const record of records) {
    if (!record.sourceFile.endsWith(fileSuffix) || record.lineNumber < start || record.lineNumber > end) continue;
    if (record.adjudicationStatus === 'structural_not_a_claim') continue;
    record.adjudicationStatus = 'partially_or_fully_adjudicated';
    record.adjudicationIds.push(item.id);
    record.canonicalClaimIds.push(...item.canonicalClaimIds);
    record.sourceRefIds.push(...sourceRefIds);
    record.runtimeEligible ||= item.runtimeEligible;
  }
}

for (const record of records) {
  record.adjudicationIds = [...new Set(record.adjudicationIds)];
  record.canonicalClaimIds = [...new Set(record.canonicalClaimIds)];
  record.sourceRefIds = [...new Set(record.sourceRefIds)];
}

const inventory = {
  schemaVersion: 1,
  doctrine: 'classical_source_first',
  generatedAt: new Date().toISOString(),
  scope: 'Every non-empty line in the two canonical xiangshu raw Markdown files.',
  sourceFiles,
  counts: {
    records: records.length,
    structural: records.filter((record) => record.adjudicationStatus === 'structural_not_a_claim').length,
    adjudicatedRecords: records.filter((record) => record.adjudicationStatus === 'partially_or_fully_adjudicated').length,
    pendingSourceAdjudication: records.filter((record) => record.adjudicationStatus === 'source_not_yet_located').length,
  },
  records,
};

const outputPath = path.join(root, 'database/xiangshu/normalized/xiangshu-raw-line-inventory.json');
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`);
console.log(JSON.stringify(inventory.counts));
