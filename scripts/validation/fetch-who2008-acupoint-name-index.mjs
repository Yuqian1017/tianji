import { readFile, writeFile } from 'node:fs/promises';

import { sha256 } from './lib/tcm-pharmacopoeia.mjs';

const PDF_PATH = process.env.WHO_ACUPOINT_PDF;
const TEXT_PATH = process.env.WHO_ACUPOINT_TEXT;
const OUTPUT_PATH = 'database/tcm/sources/who2008-acupoint-name-index.json';

if (!PDF_PATH || !TEXT_PATH) {
  throw new Error('Set WHO_ACUPOINT_PDF and WHO_ACUPOINT_TEXT to the pinned WHO 2008 files');
}

const [pdfBytes, sourceText] = await Promise.all([
  readFile(PDF_PATH),
  readFile(TEXT_PATH, 'utf8'),
]);

const headingPattern = /^\s*(LU|LI|ST|SP|HT|SI|BL|KI|PC|TE|GB|LR|GV|CV)\s*(\d+):\s+([A-Za-z][A-Za-z' -]*?)\s+([^\n]+)$/gm;

function simplifiedChineseName(rawName) {
  return rawName
    .replace(/([\p{Script=Han}])\(([\p{Script=Han}]+)(?:[,，]\s*[\p{Script=Han}]+)*\)/gu, '$2')
    .replace(/[^\p{Script=Han}]/gu, '');
}

const itemByCode = new Map();
for (const match of sourceText.matchAll(headingPattern)) {
  if (!/\p{Script=Han}/u.test(match[4])) continue;
  const code = `${match[1]}${Number(match[2])}`;
  const item = {
    code,
    meridianCode: match[1],
    sequence: Number(match[2]),
    pinyin: match[3].trim(),
    name: simplifiedChineseName(match[4]),
    sourceHeadingSha256: sha256(match[0].trim()),
  };
  const previous = itemByCode.get(code);
  if (previous && (previous.name !== item.name || previous.pinyin !== item.pinyin)) {
    throw new Error(`Conflicting WHO heading extraction for ${code}`);
  }
  itemByCode.set(code, item);
}

const expectedCounts = { LU: 11, LI: 20, ST: 45, SP: 21, HT: 9, SI: 19, BL: 67, KI: 27, PC: 9, TE: 23, GB: 44, LR: 14, GV: 28, CV: 24 };
const items = [];
for (const [meridianCode, count] of Object.entries(expectedCounts)) {
  for (let sequence = 1; sequence <= count; sequence += 1) {
    const code = `${meridianCode}${sequence}`;
    const item = itemByCode.get(code);
    if (!item) throw new Error(`Missing WHO point heading ${code}`);
    items.push(item);
  }
}
if (items.length !== 361) throw new Error(`Expected 361 WHO points, found ${items.length}`);

const output = {
  schemaVersion: 1,
  sourceId: 'WHO-WPRO-ACUPOINT-LOCATIONS-2008',
  title: 'WHO standard acupuncture point locations in the Western Pacific region',
  published: 2008,
  officialItemUrl: 'https://iris.who.int/items/f188654a-d8a7-4519-9979-8e2de713c060',
  officialPdfUrl: 'https://iris.who.int/server/api/core/bitstreams/d98c1c98-3fbf-4e4e-8c9a-1bbe72ccd00e/content',
  sourcePdfSha256: sha256(pdfBytes),
  sourceTextSha256: sha256(sourceText),
  extraction: 'point heading only; full location prose is not mirrored',
  counts: {
    total: items.length,
    byMeridian: expectedCounts,
  },
  items,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.counts, null, 2));
