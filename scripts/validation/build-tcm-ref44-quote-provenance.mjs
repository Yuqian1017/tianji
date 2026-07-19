import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const REFERENCE_PATH = 'database/tcm/skill-v3/references/44-经典-伤寒论六经方证条文.md';
const ADJUDICATION_PATH = 'database/tcm/adjudications/tcm-classic-ref44-quote-adjudications.json';
const PUBLIC_WITNESS_PATH = 'database/sources/ctext/tcm-shanghan-public-witnesses-2026-07-18.json';
const NIHAISHA_SOURCE_PATH = 'database/sources/external/nihaisha-nishi-tcm-2026-07-18.json';
const OUTPUT_PATH = 'database/tcm/normalized/tcm-classic-ref44-quote-provenance.json';

const SOURCE_SPECS = [
  {
    id: 'shanghanlun-local-text',
    work: '伤寒论',
    path: 'database/tcm/skill-v3/sources/伤寒论.txt',
  },
  {
    id: 'jingui-yaolue-local-text',
    work: '金匮要略',
    path: 'database/tcm/skill-v3/sources/金匮要略.txt',
  },
  {
    id: 'huangdi-neijing-suwen-local-text',
    work: '黄帝内经素问',
    path: 'database/tcm/skill-v3/sources/黄帝内经素问.txt',
  },
  {
    id: 'huangdi-neijing-lingshu-local-text',
    work: '黄帝内经灵枢',
    path: 'database/tcm/skill-v3/sources/黄帝内经灵枢.txt',
  },
  {
    id: 'nanjing-local-text',
    work: '难经',
    path: 'database/tcm/skill-v3/sources/难经.txt',
  },
];

const MANUAL_SOURCE_SPECS = [
  {
    id: 'fangjixue-seventh-edition-local-text',
    work: '方剂学七版',
    path: 'database/tcm/skill-v3/sources/《方剂学》七版.txt',
  },
];

const EXPECTED_SOURCE_OVERRIDES = new Map([
  ['tcm.classic.ref44.quote.L0012Q3', 'nanjing-local-text'],
  ['tcm.classic.ref44.quote.L0032Q7', 'huangdi-neijing-lingshu-local-text'],
  ['tcm.classic.ref44.quote.L0103Q2', 'huangdi-neijing-suwen-local-text'],
  ['tcm.classic.ref44.quote.L0122Q1', 'nanjing-local-text'],
]);

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

function buildSource(spec, text) {
  let normalizedText = '';
  const lineMap = [];
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    const normalizedLine = normalizeForMatch(line);
    normalizedText += normalizedLine;
    lineMap.push(...Array(normalizedLine.length).fill(index + 1));
  });

  return { ...spec, text, lines, normalizedText, lineMap };
}

function lineForExactMatch(sourceText, quoteText) {
  const index = sourceText.indexOf(quoteText);
  if (index < 0) return null;
  return sourceText.slice(0, index).split('\n').length;
}

function locateQuote(quoteText, source) {
  const cleanedQuote = cleanText(quoteText);
  const exactLine = lineForExactMatch(source.text, cleanedQuote);
  if (exactLine) {
    return { sourceId: source.id, work: source.work, matchType: 'exact_text', sourceLines: [exactLine] };
  }

  const normalizedQuote = normalizeForMatch(quoteText);
  const normalizedIndex = source.normalizedText.indexOf(normalizedQuote);
  if (normalizedIndex >= 0) {
    return {
      sourceId: source.id,
      work: source.work,
      matchType: 'normalized_contiguous',
      sourceLines: [source.lineMap[normalizedIndex]],
    };
  }

  const segments = cleanedQuote
    .split(/(?:……|…|\.\.\.)/)
    .map(normalizeForMatch)
    .filter(segment => segment.length >= 4);
  if (segments.length < 2) return null;

  let nextIndex = 0;
  const segmentIndexes = [];
  for (const segment of segments) {
    const index = source.normalizedText.indexOf(segment, nextIndex);
    if (index < 0) return null;
    segmentIndexes.push(index);
    nextIndex = index + segment.length;
  }

  return {
    sourceId: source.id,
    work: source.work,
    matchType: 'segmented_ellipsis',
    sourceLines: [...new Set(segmentIndexes.map(index => source.lineMap[index]))],
  };
}

function expectedSourceIds(id) {
  return [EXPECTED_SOURCE_OVERRIDES.get(id) ?? 'shanghanlun-local-text'];
}

function sourceSnippets(sourceMap, sourceId, lineNumbers) {
  const source = sourceMap.get(sourceId);
  if (!source) throw new Error(`Unknown source in adjudication: ${sourceId}`);
  return lineNumbers.map(lineNumber => source.lines[lineNumber - 1]?.trim());
}

const fileEntries = await Promise.all([
  readFile(REFERENCE_PATH, 'utf8'),
  readFile(ADJUDICATION_PATH, 'utf8'),
  readFile(PUBLIC_WITNESS_PATH, 'utf8'),
  readFile(NIHAISHA_SOURCE_PATH, 'utf8'),
  ...SOURCE_SPECS.map(spec => readFile(spec.path, 'utf8')),
  ...MANUAL_SOURCE_SPECS.map(spec => readFile(spec.path, 'utf8')),
]);
const [
  referenceText,
  adjudicationText,
  publicWitnessText,
  nihaishaSourceText,
  ...sourceTexts
] = fileEntries;
const searchedSourceTexts = sourceTexts.slice(0, SOURCE_SPECS.length);
const manualSourceTexts = sourceTexts.slice(SOURCE_SPECS.length);
const sources = SOURCE_SPECS.map((spec, index) => buildSource(spec, searchedSourceTexts[index]));
const manualSources = MANUAL_SOURCE_SPECS.map((spec, index) => buildSource(spec, manualSourceTexts[index]));
const allSources = [...sources, ...manualSources];
const sourceMap = new Map(allSources.map(source => [source.id, source]));
const adjudicationCore = JSON.parse(adjudicationText);
const publicWitnessCore = JSON.parse(publicWitnessText);
const publicWitnessIds = new Set(publicWitnessCore.witnesses.map(witness => witness.id));
const adjudications = new Map();

for (const adjudication of adjudicationCore.records) {
  if (adjudications.has(adjudication.id)) {
    throw new Error(`Duplicate ref44 quote adjudication: ${adjudication.id}`);
  }
  adjudications.set(adjudication.id, adjudication);
}

const records = [];
for (const [lineIndex, line] of referenceText.split('\n').entries()) {
  let quoteIndex = 0;
  for (const match of line.matchAll(/“([^”\n]+)”|"([^"\n]+)"/g)) {
    const quoteText = match[1] ?? match[2];
    if (normalizeForMatch(quoteText).length < 4) continue;
    quoteIndex += 1;

    const referenceLine = lineIndex + 1;
    const id = `tcm.classic.ref44.quote.L${String(referenceLine).padStart(4, '0')}Q${quoteIndex}`;
    const expectedSources = expectedSourceIds(id);
    const sourceMatches = sources
      .map(source => locateQuote(quoteText, source))
      .filter(Boolean)
      .map(sourceMatch => ({
        ...sourceMatch,
        sourceSnippets: sourceSnippets(sourceMap, sourceMatch.sourceId, sourceMatch.sourceLines),
      }));
    const selectedSourceMatch = expectedSources
      .map(sourceId => sourceMatches.find(sourceMatch => sourceMatch.sourceId === sourceId))
      .find(Boolean) ?? sourceMatches[0] ?? null;
    const adjudication = adjudications.get(id) ?? null;

    if (selectedSourceMatch && adjudication) {
      throw new Error(`Located quote must not retain an unresolved-only adjudication: ${id}`);
    }
    if (adjudication && adjudication.quoteText !== quoteText) {
      throw new Error(`Adjudication quote drifted for ${id}`);
    }
    for (const witnessId of adjudication?.externalWitnessIds ?? []) {
      if (!publicWitnessIds.has(witnessId)) {
        throw new Error(`Unknown public witness ${witnessId} in ${id}`);
      }
    }

    const manualAdjudication = adjudication ? {
      category: adjudication.category,
      verdict: adjudication.verdict,
      sourceLocations: adjudication.sourceLocations.map(location => ({
        ...location,
        sourceSnippets: sourceSnippets(sourceMap, location.sourceId, location.lines),
      })),
      relatedSourceLocations: adjudication.relatedSourceLocations.map(location => ({
        ...location,
        sourceSnippets: sourceSnippets(sourceMap, location.sourceId, location.lines),
      })),
      externalWitnessIds: adjudication.externalWitnessIds,
      secondaryLocatorRefs: adjudication.secondaryLocatorRefs,
      note: adjudication.note,
    } : null;
    const declaredCrossWork = expectedSources[0] !== 'shanghanlun-local-text';
    const sourceMismatch = Boolean(
      selectedSourceMatch && !expectedSources.includes(selectedSourceMatch.sourceId),
    );

    records.push({
      id,
      referenceId: 'ref44',
      referencePath: REFERENCE_PATH,
      referenceLine,
      quoteText,
      expectedSourceIds: expectedSources,
      declaredCrossWork,
      sourceMatches,
      selectedSourceMatch,
      matchType: selectedSourceMatch?.matchType ?? 'unresolved',
      multiSource: sourceMatches.length > 1,
      sourceMismatch,
      reviewStatus: selectedSourceMatch
        ? declaredCrossWork
          ? 'declared_cross_work_text_match_only_not_content_acceptance'
          : 'text_match_only_not_content_adjudication'
        : adjudication
        ? 'manual_form_adjudication_complete_not_content_acceptance'
        : 'manual_adjudication_required',
      manualAdjudication,
      productEligibility: 'blocked',
      runtimeEligibleFields: [],
    });
  }
}

const recordIds = new Set(records.map(record => record.id));
const unusedAdjudicationIds = [...adjudications.keys()].filter(id => !recordIds.has(id));
if (unusedAdjudicationIds.length > 0) {
  throw new Error(`Adjudications do not resolve extracted quotes: ${unusedAdjudicationIds.join(', ')}`);
}

const counts = {
  quotes: records.length,
  located: records.filter(record => record.matchType !== 'unresolved').length,
  exactText: records.filter(record => record.matchType === 'exact_text').length,
  normalizedContiguous: records.filter(record => record.matchType === 'normalized_contiguous').length,
  segmentedEllipsis: records.filter(record => record.matchType === 'segmented_ellipsis').length,
  unresolved: records.filter(record => record.matchType === 'unresolved').length,
  manualAdjudicated: records.filter(record => record.manualAdjudication).length,
  pendingManual: records.filter(record => record.matchType === 'unresolved' && !record.manualAdjudication).length,
  multiSource: records.filter(record => record.multiSource).length,
  sourceMismatch: records.filter(record => record.sourceMismatch).length,
  declaredCrossWork: records.filter(record => record.declaredCrossWork).length,
  publicWitnessSupported: records.filter(record => record.manualAdjudication?.externalWitnessIds.length > 0).length,
  secondaryLocatorLinked: records.filter(record => record.manualAdjudication?.secondaryLocatorRefs.length > 0).length,
};

const sourceRefs = Object.fromEntries([
  ['ref44', REFERENCE_PATH, referenceText],
  ...allSources.map(source => [source.id, source.path, source.text]),
  ['ref44-manual-adjudications', ADJUDICATION_PATH, adjudicationText],
  ['ref44-public-transcription-witnesses', PUBLIC_WITNESS_PATH, publicWitnessText],
  ['nihaisha-nishi-tcm-locator-manifest', NIHAISHA_SOURCE_PATH, nihaishaSourceText],
].map(([id, path, text]) => [id, { path, sha256: sha256(text) }]));

const output = {
  schemaVersion: 1,
  doctrine: 'classical_source_first',
  generatedAt: '2026-07-18',
  scope: 'reference_44_shanghan_explicit_quotes',
  status: 'text_match_and_manual_form_adjudication_not_content_acceptance',
  sourceRefs,
  counts,
  boundaries: [
    'A text match proves only that the quoted character sequence occurs in a selected local witness.',
    'Manual form adjudication records abridgement, stitching, later commentary, editorial prose, and transcription variants without accepting a traditional interpretation or modern medical claim.',
    'CText and Wikisource are public transcription witnesses used for character-level collation and attribution; they are not identified edition-level facsimiles.',
    'nihaisha-nishi-tcm page cards are secondary locators only and cannot replace Shanghanlun or related classical witnesses.',
    'Duplicate matches in Shanghanlun and Jingui Yaolue are retained as parallel textual witnesses, with Shanghanlun selected for this reference.',
    'Raw Skill references and local source texts remain unchanged; corrections are overlays in adjudication and provenance data.',
    'No quote, dose, treatment, diagnosis, prognosis, or self-care instruction becomes runtime eligible through this inventory.',
  ],
  records,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(counts));
