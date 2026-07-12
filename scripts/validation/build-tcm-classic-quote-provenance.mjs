import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const REFERENCE_PATH = 'database/tcm/skill-v3/references/42-经典-素问要义.md';
const SOURCE_PATH = 'database/tcm/skill-v3/sources/黄帝内经素问.txt';
const ADJUDICATION_PATH = 'database/tcm/adjudications/tcm-classic-quote-adjudications.json';
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

const [referenceText, sourceText, adjudicationText] = await Promise.all([
  readFile(REFERENCE_PATH, 'utf8'),
  readFile(SOURCE_PATH, 'utf8'),
  readFile(ADJUDICATION_PATH, 'utf8'),
]);
const normalizedSource = buildNormalizedSource(sourceText);
const adjudicationCore = JSON.parse(adjudicationText);
const adjudications = new Map();
for (const adjudication of adjudicationCore.records) {
  if (adjudications.has(adjudication.id)) {
    throw new Error(`Duplicate classic quote adjudication: ${adjudication.id}`);
  }
  adjudications.set(adjudication.id, adjudication);
}
const referenceCorrections = new Map();
for (const correction of adjudicationCore.referenceCorrections) {
  if (referenceCorrections.has(correction.id)) {
    throw new Error(`Duplicate classic quote reference correction: ${correction.id}`);
  }
  referenceCorrections.set(correction.id, correction);
}
const records = [];

for (const [lineIndex, line] of referenceText.split('\n').entries()) {
  let quoteIndex = 0;
  for (const match of line.matchAll(/["“]([^"”\n]{4,})["”]/g)) {
    quoteIndex += 1;
    const id = `tcm.classic.ref42.quote.L${String(lineIndex + 1).padStart(4, '0')}Q${quoteIndex}`;
    const quoteText = match[1];
    const adjudication = adjudications.get(id);
    const referenceCorrection = referenceCorrections.get(id);
    const effectiveQuoteText = referenceCorrection?.correctedText ?? quoteText;
    const cleanQuote = cleanText(effectiveQuoteText);
    const normalizedQuote = normalizeForMatch(effectiveQuoteText);
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
      id,
      referenceId: 'ref42',
      referencePath: REFERENCE_PATH,
      referenceLine: lineIndex + 1,
      quoteText,
      effectiveQuoteText,
      sourceId: 'huangdi-neijing-suwen-local-text',
      sourcePath: SOURCE_PATH,
      sourceLines,
      sourceSnippets: sourceLines.map(lineNumber => normalizedSource.sourceLines[lineNumber - 1]?.trim()),
      matchType,
      reviewStatus: referenceCorrection
        ? 'reference_correction_applied_text_match_only_not_content_acceptance'
        : matchType === 'unresolved'
        ? adjudication
          ? 'manual_form_adjudication_complete_not_content_acceptance'
          : 'manual_adjudication_required'
        : 'text_match_only_not_content_adjudication',
      manualAdjudication: adjudication ? {
        category: adjudication.category,
        verdict: adjudication.verdict,
        sourceLines: adjudication.sourceLines,
        sourceSnippets: adjudication.sourceLines.map(lineNumber => normalizedSource.sourceLines[lineNumber - 1]?.trim()),
        relatedSourceLines: adjudication.relatedSourceLines,
        relatedSourceSnippets: adjudication.relatedSourceLines.map(lineNumber => normalizedSource.sourceLines[lineNumber - 1]?.trim()),
        note: adjudication.note,
      } : null,
      referenceCorrection: referenceCorrection ? {
        originalText: referenceCorrection.originalText,
        correctedText: referenceCorrection.correctedText,
        sourceLines: referenceCorrection.sourceLines,
        sourceSnippets: referenceCorrection.sourceLines.map(lineNumber => normalizedSource.sourceLines[lineNumber - 1]?.trim()),
        reason: referenceCorrection.reason,
      } : null,
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
  manualAdjudicated: records.filter(record => record.manualAdjudication).length,
  pendingManual: records.filter(record => record.matchType === 'unresolved' && !record.manualAdjudication).length,
  referenceCorrected: records.filter(record => record.referenceCorrection).length,
};

const unusedAdjudicationIds = [...adjudications.keys()].filter(id => !records.some(record => record.id === id));
if (unusedAdjudicationIds.length > 0) {
  throw new Error(`Adjudications do not resolve extracted quotes: ${unusedAdjudicationIds.join(', ')}`);
}
for (const [id, correction] of referenceCorrections) {
  const record = records.find(item => item.id === id);
  if (!record) throw new Error(`Reference correction does not resolve an extracted quote: ${id}`);
  if (record.quoteText !== correction.originalText || record.effectiveQuoteText !== correction.correctedText) {
    throw new Error(`Reference correction text drifted for ${id}: ${record.quoteText} -> ${record.effectiveQuoteText}`);
  }
  if (record.matchType === 'unresolved') {
    throw new Error(`Reference correction did not produce a source match: ${id}`);
  }
}

const output = {
  schemaVersion: 2,
  doctrine: 'classical_source_first',
  generatedAt: '2026-07-11',
  scope: 'reference_42_suwen_explicit_quotes',
  status: 'text_match_and_manual_form_adjudication_not_content_acceptance',
  sourceRefs: {
    ref42: { path: REFERENCE_PATH, sha256: sha256(referenceText) },
    'huangdi-neijing-suwen-local-text': { path: SOURCE_PATH, sha256: sha256(sourceText) },
    'ref42-manual-adjudications': { path: ADJUDICATION_PATH, sha256: sha256(adjudicationText) },
  },
  counts,
  boundaries: [
    'A text match proves only that the quoted character sequence occurs in the selected local witness.',
    'Mechanical unresolved means the exact normalized sequence does not occur contiguously; it remains unresolved even after its editorial form is manually classified.',
    'Manual form adjudication distinguishes traceable abridgement, stitched excerpts, commentary, editorial prose, textual variants, and transcription issues without accepting the underlying claim.',
    'No quote, dose, treatment, diagnosis, prognosis, or self-care instruction becomes runtime eligible through this inventory.',
  ],
  records,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(counts));
