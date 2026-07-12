import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const REFERENCE_PATH = 'database/tcm/skill-v3/references/42-经典-素问要义.md';
const SOURCE_PATH = 'database/tcm/skill-v3/sources/黄帝内经素问.txt';
const OUTPUT_PATH = 'database/tcm/normalized/tcm-classic-quote-provenance.json';

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function cleanText(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/<[^>]*>/g, '')
    .normalize('NFKC');
}

function normalizeForMatch(text) {
  return cleanText(text).replace(/[\s\p{P}\p{S}]/gu, '');
}

function buildNormalizedSource(text) {
  let normalizedText = '';
  const lineMap = [];
  const sourceLines = text.split('\n');

  sourceLines.forEach((line, index) => {
    const normalizedLine = normalizeForMatch(line);
    normalizedText += normalizedLine;
    lineMap.push(...Array(normalizedLine.length).fill(index + 1));
  });

  return { normalizedText, lineMap, sourceLines };
}

function lineForExactMatch(sourceText, quoteText) {
  const index = sourceText.indexOf(quoteText);
  if (index < 0) return null;
  return sourceText.slice(0, index).split('\n').length;
}

const [referenceText, sourceText] = await Promise.all([
  readFile(REFERENCE_PATH, 'utf8'),
  readFile(SOURCE_PATH, 'utf8'),
]);
const normalizedSource = buildNormalizedSource(sourceText);
const records = [];

for (const [lineIndex, line] of referenceText.split('\n').entries()) {
  let quoteIndex = 0;
  for (const match of line.matchAll(/["“]([^"”\n]{4,})["”]/g)) {
    quoteIndex += 1;
    const quoteText = match[1];
    const cleanQuote = cleanText(quoteText);
    const normalizedQuote = normalizeForMatch(quoteText);
    let matchType = 'unresolved';
    let sourceLines = [];

    const exactLine = lineForExactMatch(sourceText, cleanQuote);
    if (exactLine) {
      matchType = 'exact_text';
      sourceLines = [exactLine];
    } else {
      const normalizedIndex = normalizedSource.normalizedText.indexOf(normalizedQuote);
      if (normalizedIndex >= 0) {
        matchType = 'normalized_contiguous';
        sourceLines = [normalizedSource.lineMap[normalizedIndex]];
      } else {
        const segments = cleanQuote
          .split(/(?:……|…|\.\.\.)/)
          .map(normalizeForMatch)
          .filter(segment => segment.length >= 4);
        const segmentIndexes = segments.map(segment => normalizedSource.normalizedText.indexOf(segment));
        if (segments.length > 1 && segmentIndexes.every(index => index >= 0)) {
          matchType = 'segmented_ellipsis';
          sourceLines = segmentIndexes.map(index => normalizedSource.lineMap[index]);
        }
      }
    }

    sourceLines = [...new Set(sourceLines.filter(Boolean))];
    records.push({
      id: `tcm.classic.ref42.quote.L${String(lineIndex + 1).padStart(4, '0')}Q${quoteIndex}`,
      referenceId: 'ref42',
      referencePath: REFERENCE_PATH,
      referenceLine: lineIndex + 1,
      quoteText,
      sourceId: 'huangdi-neijing-suwen-local-text',
      sourcePath: SOURCE_PATH,
      sourceLines,
      sourceSnippets: sourceLines.map(lineNumber => normalizedSource.sourceLines[lineNumber - 1]?.trim()),
      matchType,
      reviewStatus: matchType === 'unresolved'
        ? 'manual_adjudication_required'
        : 'text_match_only_not_content_adjudication',
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    });
  }
}

const counts = {
  quotes: records.length,
  exactText: records.filter(record => record.matchType === 'exact_text').length,
  normalizedContiguous: records.filter(record => record.matchType === 'normalized_contiguous').length,
  segmentedEllipsis: records.filter(record => record.matchType === 'segmented_ellipsis').length,
  unresolved: records.filter(record => record.matchType === 'unresolved').length,
};

const output = {
  schemaVersion: 1,
  doctrine: 'classical_source_first',
  generatedAt: '2026-07-11',
  scope: 'reference_42_suwen_explicit_quotes',
  status: 'text_match_inventory_not_content_adjudication',
  sourceRefs: {
    ref42: { path: REFERENCE_PATH, sha256: sha256(referenceText) },
    'huangdi-neijing-suwen-local-text': { path: SOURCE_PATH, sha256: sha256(sourceText) },
  },
  counts,
  boundaries: [
    'A text match proves only that the quoted character sequence occurs in the selected local witness.',
    'Unresolved includes editorial prompts, paraphrases, stitched excerpts, later commentary, textual variants, and possible transcription errors; each requires manual adjudication.',
    'No quote, dose, treatment, diagnosis, prognosis, or self-care instruction becomes runtime eligible through this inventory.',
  ],
  records,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(counts));
